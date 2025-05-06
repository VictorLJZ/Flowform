"use client"

import React, { useEffect, useRef, useCallback, useMemo } from "react"
import { useParams } from "next/navigation"
import { useFormBuilderStore } from '@/stores/formBuilderStore'
import { useWorkflowNavigation } from '@/hooks/form/useWorkflowNavigation';
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
import type { FormBlock } from '@/types/block-types';

interface SubmitData {
  block_id: string;
  block_type: string;
}

interface ErrorData {
  block_id: string;
  block_type: string;
  response_id?: string;
}

interface CompletionData {
  response_id?: string;
}

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
  const connections = useFormBuilderStore(state => state.connections);
  const isLoading = useFormBuilderStore(state => state.isLoading);
  const loadForm = useFormBuilderStore(state => state.loadForm);
  const setMode = useFormBuilderStore(state => state.setMode);
  
  // Use workflow navigation to handle conditional logic
  const { 
    currentIndex, 
    currentBlock,
    direction, 
    goToNext, 
    goToPrevious,
    isLastQuestion
  } = useWorkflowNavigation({
    blocks,
    connections,
    initialBlockIndex: 0
  });

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
    goToNext: (block: FormBlock, answer: any) => goToNext(answer),
    isLastQuestion 
  });

  // 3. Form Answers Hook (Needs responseId, formId)
  const {
    currentAnswer,
    setCurrentAnswer,
    saveCurrentAnswer,
    initializeAnswers,
    answersInitialized,
    loadAnswerForBlock
  } = useFormAnswers({
    formId,
    responseId,
    blockId: currentBlock?.id || null,
    storageKey
  });

  // 4. Analytics Hook (Needs formId, responseId after submission)
  const analytics = useAnalytics({
    formId,
    responseId: responseId || undefined,
    blockId: currentBlock?.id,
    metadata: { }
  });
  
  // Memoized calculation for disabling next button
  const isNextDisabled = useMemo(() => {
    if (!currentBlock) return true; 

    // AI conversation has its own internal submit/next logic
    if (currentBlock.blockTypeId === 'ai_conversation') {
      return true; 
    }

    // Disable if submitting
    if (submitting) return true;

    // Disable if required but no answer
    if (currentBlock.required) {
      if (Array.isArray(currentAnswer) && currentAnswer.length === 0) {
        return true;
      } else if (typeof currentAnswer === 'string' && currentAnswer.trim() === '') {
        return true;
      } else if (currentAnswer === null || currentAnswer === undefined) {
        return true;
      }
    }

    return false; 
  }, [currentBlock, currentAnswer, submitting]);

  // Callback to handle submitting an answer
  const handleAnswer = useCallback(async () => {
    console.log('[handleAnswer] Triggered for block:', currentBlock?.id);
    if (!currentBlock) {
      console.error('Block is not defined, cannot submit.');
      return;
    } 
    if (isNextDisabled) {
      console.log('Next button disabled, submission prevented.');
      return;
    }
    let answerToSubmit = currentAnswer;
    if (currentBlock.blockTypeId === 'ai_conversation') { 
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
    await submitAnswer(currentBlock, answerToSubmit);
  }, [currentBlock, currentAnswer, submitAnswer, isNextDisabled, aiConversationRef]);

  // Callback to handle going to the previous block
  const handlePrevious = useCallback(() => { 
      goToPrevious(); 
  }, [goToPrevious]); 

  // Memoize ref update functions to prevent creating new function references on every render
  // This helps break the update cycle by ensuring stable function references
  const trackSubmitFn = useCallback((data: SubmitData) => {
    try {
      if (typeof analytics.trackEvent === 'function') {
        analytics.trackEvent('answer_submitted', data);
      } else if (typeof analytics.trackSubmit === 'function') {
        analytics.trackSubmit(data);
      } else {
        console.warn('Analytics tracking not available');
      }
    } catch (error) {
      console.error('Error tracking submission:', error);
    }
  }, [analytics]);

  const trackErrorFn = useCallback((error: unknown, data: ErrorData) => {
    try {
      const errorData = { ...data, error_message: String(error) };
      if (typeof analytics.trackEvent === 'function') {
        analytics.trackEvent('submission_error', errorData);
      } else if (typeof analytics.trackError === 'function') {
        analytics.trackError(errorData);
      } else {
        console.warn('Analytics error tracking not available');
      }
    } catch (trackError) {
      console.error('Error tracking error:', trackError);
    }
  }, [analytics]);

  const trackCompletionFn = useCallback(async (data: CompletionData) => {
    try {
      if (typeof analytics.trackEvent === 'function') {
        analytics.trackEvent('form_completed', data);
      } else if (typeof analytics.trackCompletion === 'function') {
        await analytics.trackCompletion(data);
      } else {
        console.warn('Analytics completion tracking not available');
      }
    } catch (error) {
      console.error('Error tracking completion:', error);
    }
  }, [analytics]);

  const saveAnswerFn = useCallback((blockId: string, answer: any) => {
    saveCurrentAnswer(blockId, answer);
  }, [saveCurrentAnswer]);
  
  // Effect to update callback refs - only runs when the memoized functions change
  useEffect(() => {
    onSubmitSuccessRef.current = trackSubmitFn;
    onSubmitErrorRef.current = trackErrorFn;
    onFormCompleteRef.current = trackCompletionFn;
    saveCurrentAnswerRef.current = saveAnswerFn;
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

  // Effect to ensure the block and connections stay in sync
  useEffect(() => {
    // When blocks or connections change, we might need to re-initialize the workflow navigation
    if (blocks.length > 0 && connections.length > 0) {
      console.log(`Form has ${blocks.length} blocks and ${connections.length} connections`);
    }
  }, [blocks, connections]);

  // Effect to initialize answers when the form is first loaded
  useEffect(() => {
    // Initialize answers once responseId is available and not already initialized
    if (responseId && !answersInitialized) { 
      console.log('Initializing answers from storage');
      initializeAnswers();
    }
  }, [responseId, initializeAnswers, answersInitialized]);
  
  // Effect to track form view progress
  useEffect(() => {
    if (currentBlock) {
      console.log(`Viewing block: ${currentBlock.id} (${currentBlock.title || 'Untitled'}) at index ${currentIndex}`);
    }
  }, [currentBlock, currentIndex]);

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
            {currentBlock ? (
              <BlockRenderer 
                block={currentBlock}
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