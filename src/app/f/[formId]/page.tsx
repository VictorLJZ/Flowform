"use client"

import React, { useEffect, useRef, useCallback, useMemo } from "react"
import { useParams } from "next/navigation"
import { useFormBuilderStore } from '@/stores/formBuilderStore'
import { useFormNavigation } from '@/hooks/form/useFormNavigation';
import { useFormAnswers, FormAnswersState } from '@/hooks/form/useFormAnswers'; 
import { useFormSubmission, AnalyticsSubmitHandler, AnalyticsErrorHandler, AnalyticsCompletionHandler } from '@/hooks/form/useFormSubmission';
import { useFormAbandonment } from '@/hooks/form/useFormAbandonment'; 
import { useAnalytics } from "@/hooks/useAnalytics";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from 'framer-motion'
import type { AIConversationHandle } from "@/components/form/blocks/AIConversationBlock"; 
import type { QAPair } from '@/types/supabase-types'; 
import { BlockRenderer } from "@/components/form/viewer/BlockRenderer";
import { CompletionScreen } from "@/components/form/viewer/CompletionScreen";
import { ErrorMessages } from "@/components/form/viewer/ErrorMessages";
import { FormNavigationControls } from "@/components/form/viewer/FormNavigationControls";
import { slideVariants, slideTransition } from '@/utils/animations/slideAnimations'; 

export default function FormViewerPage() {
  const params = useParams()
  const formId = params.formId as string
  
  // Ref for AI Conversation block
  const aiConversationRef = useRef<AIConversationHandle>(null);
  
  // Refs for callbacks to pass to useFormSubmission
  const onSubmitSuccessRef = useRef<AnalyticsSubmitHandler>(() => {});
  const onSubmitErrorRef = useRef<AnalyticsErrorHandler>(() => {});
  const onFormCompleteRef = useRef<AnalyticsCompletionHandler>(async () => {});
  const saveCurrentAnswerRef = useRef<FormAnswersState['saveCurrentAnswer']>(() => {}); 
 
  // Select state and actions from the form builder store
  // Use individual selectors for better memoization and to avoid unnecessary re-renders
  const blocks = useFormBuilderStore(state => state.blocks);
  const isLoading = useFormBuilderStore(state => state.isLoading);
  const loadForm = useFormBuilderStore(state => state.loadForm);
  const setMode = useFormBuilderStore(state => state.setMode);
  
  const { 
    currentIndex, 
    direction, 
    goToNext, 
    goToPrevious
  } = useFormNavigation(0, blocks.length);
  // Safely access the current block with proper guards to prevent invalid access
  const isLastQuestion = blocks.length > 0 && currentIndex === blocks.length - 1;
  const block = useMemo(() => {
    // Only access blocks if they exist and index is valid
    if (blocks.length === 0 || currentIndex < 0 || currentIndex >= blocks.length) {
      return null;
    }
    return blocks[currentIndex];
  }, [blocks, currentIndex]);

  // persistence key and saved answers
  const storageKey = `flowform-${formId}-session`

  // ---- HOOKS ----
  // Order: Navigation -> Submission -> Answers -> Analytics

  // 2. Submission Hook (Needs formId, storageKey, callbacks, navigation)
  const { 
    responseId, 
    submitting, 
    submitError, 
    completed, 
    submitAnswer 
  } = useFormSubmission({
    formId,
    storageKey,
    onSubmitSuccessRef,
    onSubmitErrorRef,
    onFormCompleteRef,
    saveCurrentAnswerRef,
    goToNext: goToNext, 
    isLastQuestion: isLastQuestion 
  });

  // 3. Answers Hook (Needs storageKey, responseId from submission hook, index)
  const { 
    currentAnswer, 
    setCurrentAnswer, 
    initializeAnswers, 
    answersInitialized,
    saveCurrentAnswer,
    loadAnswerForBlock,
  } = useFormAnswers({ storageKey, sessionId: responseId, currentIndex });

  // 4. Analytics Hook (Needs formId, responseId after submission)
  const analytics = useAnalytics({
    formId: formId,
    responseId: responseId || undefined, 
    disabled: !responseId 
  });
  
  // Effect to load or reset answer when block changes
  useEffect(() => {
    if (block && answersInitialized) {
      loadAnswerForBlock(block.id);
    }
  }, [block, answersInitialized, loadAnswerForBlock]);

  // Hook for tracking form abandonment
  const currentBlockId = blocks[currentIndex]?.id || null;
  useFormAbandonment({
    responseId,
    currentBlockId,
    completed,
    analytics, 
  });

  // Type aliases for analytics data shapes used in useEffect
  type SubmitData = Parameters<AnalyticsSubmitHandler>[0];
  type ErrorData = Parameters<AnalyticsErrorHandler>[1];
  type CompletionData = Parameters<AnalyticsCompletionHandler>[0];

  // Memoize ref update functions to prevent creating new function references on every render
  // This helps break the update cycle by ensuring stable function references
  const trackSubmitFn = useCallback((data: SubmitData) => analytics.trackSubmit(data), [analytics]);
  const trackErrorFn = useCallback((error: unknown, data: ErrorData) => analytics.trackError({ ...data, error: String(error) }), [analytics]);
  const trackCompletionFn = useCallback(async (data: CompletionData) => { await analytics.trackCompletion(data); }, [analytics]);
  const saveAnswerFn = useCallback((blockId: string, answer: string | number | string[] | QAPair[]) => saveCurrentAnswer(blockId, answer), [saveCurrentAnswer]);
  
  // Effect to update callback refs - only runs when the memoized functions change
  useEffect(() => {
    onSubmitSuccessRef.current = trackSubmitFn;
    onSubmitErrorRef.current = trackErrorFn;
    onFormCompleteRef.current = trackCompletionFn;
    saveCurrentAnswerRef.current = saveAnswerFn;
    // No need to depend on analytics or saveCurrentAnswer directly
    // as we're depending on the stable memoized functions
  }, [trackSubmitFn, trackErrorFn, trackCompletionFn, saveAnswerFn]);

  // Load the form data and blocks when the component mounts or formId changes
  useEffect(() => {
    if (formId && typeof formId === 'string') {
      console.log(`Attempting to load form with ID: ${formId}`);
      // Explicitly set the mode to 'viewer' before loading the form
      setMode('viewer');
      console.log('Set formBuilderStore mode to viewer'); 
      loadForm(formId); // Load form data and blocks associated with this formId
    } else {
      console.error("Form ID is missing or invalid in FormViewerPage");
    }
  }, [formId, loadForm, setMode]);

  // Initialize answers effect
  useEffect(() => {
    // Initialize answers once responseId is available and not already initialized
    if (responseId && !answersInitialized) { 
      initializeAnswers();
    }
  }, [responseId, initializeAnswers, answersInitialized]); 

  // Memoized calculation for disabling next button
  const isNextDisabled = useMemo(() => {
    if (!block) return true; 

    // AI conversation has its own internal submit/next logic
    if (block.blockTypeId === 'ai_conversation') {
      return true; 
    }

    // Disable if submitting
    if (submitting) return true;

    // Disable if required but no answer
    if (block.required) {
      if (Array.isArray(currentAnswer) && currentAnswer.length === 0) {
        return true;
      } else if (typeof currentAnswer === 'string' && currentAnswer.trim() === '') {
        return true;
      } else if (currentAnswer === null || currentAnswer === undefined) {
        return true;
      }
    }

    return false; 
  }, [block, currentAnswer, submitting]);

  // Callback to handle submitting an answer
  const handleAnswer = useCallback(async () => {
    console.log('[handleAnswer] Triggered for block:', block?.id);
    if (!block) {
      console.error('Block is not defined, cannot submit.');
      return;
    } 
    if (isNextDisabled) {
      console.log('Next button disabled, submission prevented.');
      return;
    }
    let answerToSubmit = currentAnswer;
    if (block.blockTypeId === 'ai_conversation') { 
      if (aiConversationRef.current && typeof aiConversationRef.current.getMessages === 'function') {
        answerToSubmit = aiConversationRef.current.getMessages();
        console.log('[handleAnswer] Submitting AI conversation:', answerToSubmit);
      } else {
        console.error('AIConversation ref or getMessages not available');
        // Error handled within submitAnswer hook
        return;
      }
    }

    // Call the submission hook's function directly.
    // Use the callbacks provided by the analytics and navigation hooks.
    await submitAnswer(block, answerToSubmit);
  }, [block, currentAnswer, submitAnswer, isNextDisabled, aiConversationRef]);

  // Callback to handle going to the previous block
  const handlePrevious = useCallback(() => { 
      goToPrevious(); 
  }, [goToPrevious]); 

  // Initial load check - show loader if form data is not yet loaded
  if (isLoading || blocks.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // ---- MAIN RETURN ----

  if (completed && answersInitialized) { 
    return <CompletionScreen onReturnHome={() => window.location.href = '/'} />;
  }
  
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex items-stretch relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants} 
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition} 
            className="absolute inset-0 flex items-center justify-center w-full" 
            style={{ width: '100%', maxWidth: '100%' }}
          >
            {block ? (
              <BlockRenderer 
                block={block}
                currentAnswer={currentAnswer}
                setCurrentAnswer={setCurrentAnswer}
                submitAnswer={submitAnswer}
                submitting={submitting}
                responseId={responseId}
                formId={formId}
                analytics={analytics}
                aiConversationRef={aiConversationRef}
                index={currentIndex}
                totalBlocks={blocks.length}
              />
            ) : (
              <div>No block to display</div> 
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      
      <FormNavigationControls 
        onPrevious={handlePrevious}
        onNext={handleAnswer} 
        isPreviousDisabled={currentIndex === 0 || submitting}
        isNextDisabled={isNextDisabled || isLastQuestion} 
        isSubmitting={submitting}
      />
       
      <div className="fixed bottom-4 left-4 text-xs text-gray-500 flex items-center">
        Powered by <span className="font-semibold ml-1">FlowForm</span>
      </div>
       
      <ErrorMessages submitError={submitError} />
    </div>
  )
}