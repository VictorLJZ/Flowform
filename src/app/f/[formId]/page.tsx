"use client"

import React, { useEffect, useRef, useCallback, useMemo } from "react"
import { useParams } from "next/navigation"
import { useFormBuilderStore } from '@/stores/formBuilderStore'
// Using our new workflow-based navigation hook instead of the simple index-based navigation
import { useFormWorkflowNavigation } from '@/hooks/form/useFormWorkflowNavigation';
import { loadFormMedia } from '@/services/form/loadFormMedia';
import { useFormAnswers, FormAnswersState } from '@/hooks/form/useFormAnswers'; 
import { useFormSubmission, AnalyticsSubmitHandler, AnalyticsErrorHandler, AnalyticsCompletionHandler } from '@/hooks/form/useFormSubmission';
import { useFormAbandonment } from '@/hooks/form/useFormAbandonment'; 
import { useAnalytics } from "@/hooks/useAnalytics";
import { useViewTracking } from "@/hooks/analytics/useViewTracking";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from 'framer-motion'
import type { AIConversationHandle } from '@/types/form-types'; 
import { AnswerValue } from '@/types/form-view-types';
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
  const connections = useFormBuilderStore(state => state.connections);
  const isLoading = useFormBuilderStore(state => state.isLoading);
  const loadVersionedForm = useFormBuilderStore(state => state.loadVersionedForm);
  const setMode = useFormBuilderStore(state => state.setMode);
  
  // Log connection details to help debug connection regeneration issues
  useEffect(() => {
    console.log('🔄🔍 [FORM_VIEWER] Connections before passing to navigation:', connections.map(c => ({
      id: c.id,
      sourceId: c.sourceId,
      defaultTargetId: c.defaultTargetId,
      rulesCount: c.rules?.length || 0,
      hasRules: !!(c.rules && c.rules.length > 0)
    })));
    
    // Look for connections with rules to verify they're intact
    const connectionsWithRules = connections.filter(c => c.rules && c.rules.length > 0);
    if (connectionsWithRules.length > 0) {
      console.log(`🔄🔍 [FORM_VIEWER] Found ${connectionsWithRules.length} connections with rules:`, 
        connectionsWithRules.map(c => `${c.id}: ${c.rules.length} rules`));
    } else {
      console.warn('⚠️ [FORM_VIEWER] No connections with rules found. This might indicate an issue with loading workflow logic.');
    }
  }, [connections]);
  
  // Use workflow-based navigation instead of simple index navigation
  const { 
    currentIndex, 
    direction, 
    goToNext, 
    goToPrevious,
    submitAnswer: workflowSubmitAnswer,
    currentBlock: block,
    isComplete: workflowIsComplete
  } = useFormWorkflowNavigation({
    blocks,
    connections,
    initialBlockIndex: 0
  });
  
  // Use the workflow navigation's built-in isLastQuestion property instead of calculating it manually
  // This ensures we're using the same logic for determining the last question as the navigation system
  const isLastQuestion = useMemo(() => {
    // For backwards compatibility, we still check for outgoing connections
    // but rely on the workflow navigation's isLastQuestion property first
    if (!block) return false;
    return workflowIsComplete || !connections.some(conn => conn.sourceId === block.id);
  }, [block, connections, workflowIsComplete]);

  // persistence key and saved answers
  const storageKey = `flowform-${formId}-session`

  // ---- HOOKS ----
  // Order: Navigation -> Submission -> Answers -> Analytics

  // 2. Submission Hook (Needs formId, storageKey, callbacks, navigation)
  const { 
    responseId, 
    submitting, 
    submitError, 
    completed: apiCompleted, 
    submitAnswer: submitAnswerToAPI
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
  
  // Combine API completion status with workflow completion status
  const completed = apiCompleted || workflowIsComplete;

  // 3. Answers Hook (Needs storageKey, responseId from submission hook, blockId)
  const { 
    currentAnswer, 
    setCurrentAnswer, 
    initializeAnswers, 
    answersInitialized,
    saveCurrentAnswer,
    loadAnswerForBlock,
  } = useFormAnswers({ 
    storageKey, 
    responseId, 
    blockId: block?.id || null,
    formId
  });

  // 4. Analytics Hooks - split into view tracking and other analytics
  // View tracking doesn't require responseId - we want to track all views
  // Call useViewTracking directly to record the form view
  useViewTracking(formId, {
    metadata: { source: 'form_viewer' }
  });
  
  // Other analytics tracking that requires responseId
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
  
  // Extended submit data type that includes the event_type property
  type ExtendedSubmitData = SubmitData & {
    event_type?: string;
    response_id?: string;
    form_id?: string;
    is_last_block?: boolean;
  };

  // Create refs at the component level, not inside callbacks
  // This ensures we follow React's rules of hooks
  const hasTrackedCompletionRef = useRef(false);
  
  // Memoize ref update functions to prevent creating new function references on every render
  // This helps break the update cycle by ensuring stable function references
  // Memoized functions for tracking with proper type handling
  const trackSubmitFn = useCallback((data: SubmitData) => {
    console.log('📝 [Analytics] Track submit with data:', data);
    
    // Cast data to extended type that may include event_type
    const extendedData = data as ExtendedSubmitData;
    
    // All block-related submissions should be tracked, regardless of event_type
    // We'll always treat these as block submissions unless they're explicitly form completions
    const isFormCompletion = extendedData.event_type === 'form_submission' || extendedData.is_last_block === true;
    
    // If this is a form completion, let the form completion tracker handle it
    if (isFormCompletion && extendedData.is_last_block) {
      console.log('🏁 [Analytics] This is the last block, will be handled by form completion tracker');
      // We'll let the form completion handler take care of this
      return;
    }
    
    // For all other cases, this is a block submission
    console.log('🔄 [Analytics] Tracking as block submission');
    
    // Create a complete tracking payload with all required fields
    const trackingPayload = {
      ...extendedData,
      block_id: extendedData.block_id,
      form_id: formId, // Ensure formId is included
      response_id: responseId // Ensure responseId is included
    };
    
    // Use the blockSubmit tracking function for block submissions
    if (analytics.blockSubmit?.trackSubmit) {
      console.log('🔄 [Analytics] Using blockSubmit.trackSubmit for block submission');
      analytics.blockSubmit.trackSubmit(trackingPayload);
    } else if (analytics.trackSubmit) {
      console.log('🔄 [Analytics] Using analytics.trackSubmit for block submission');
      analytics.trackSubmit(trackingPayload);
    } else {
      console.warn('⚠️ [Analytics] No block submit tracking function available');
    }
  }, [analytics, formId, responseId]);
  
  const trackErrorFn = useCallback((error: unknown, data: ErrorData) => {
    console.log('[Analytics] Track error:', { ...data, error: String(error) });
    // We don't have a specific error tracking method, so just log it
  }, []);
  
  const trackCompletionFn = useCallback(async (data: CompletionData) => { 
    console.log('🏁 [Analytics] Track form completion:', data);
    
    // Don't track completion if we've already tracked it for this form
    if (hasTrackedCompletionRef.current) {
      console.log('🔄 [Analytics] Form completion already tracked, skipping');
      return;
    }
    
    try {
      if (analytics.trackCompletion) {
        console.log('✅ [Analytics] Using analytics.trackCompletion');
        await analytics.trackCompletion(data);
      } else if (analytics.formCompletion?.trackCompletion) {
        console.log('✅ [Analytics] Using formCompletion.trackCompletion');
        await analytics.formCompletion.trackCompletion(data); 
      } else {
        console.warn('⚠️ [Analytics] No form completion tracking function available');
        return;
      }
      
      // Mark as tracked to prevent duplicate tracking
      hasTrackedCompletionRef.current = true;
      console.log('✅ [Analytics] Form completion tracking successful');
    } catch (error) {
      console.error('❌ [Analytics] Error tracking form completion:', error);
    }
  }, [analytics]);
  // Use the centralized AnswerValue type for answer values instead of 'any'
  const saveAnswerFn = useCallback((blockId: string, answer: AnswerValue) => {
    // Now properly typed with a specific type
    saveCurrentAnswer(blockId, answer);
  }, [saveCurrentAnswer]);
  
  // Effect to update callback refs - only runs when the memoized functions change
  useEffect(() => {
    onSubmitSuccessRef.current = trackSubmitFn;
    onSubmitErrorRef.current = trackErrorFn;
    onFormCompleteRef.current = trackCompletionFn;
    saveCurrentAnswerRef.current = saveAnswerFn;
    // No need to depend on analytics or saveCurrentAnswer directly
    // as we're depending on the stable memoized functions
  }, [trackSubmitFn, trackErrorFn, trackCompletionFn, saveAnswerFn]);

  // Load the versioned form data and blocks when the component mounts or formId changes
  useEffect(() => {
    if (formId && typeof formId === 'string') {
      console.log(`Attempting to load versioned form with ID: ${formId}`);
      // Set the mode to 'viewer' before loading the form
      setMode('viewer');
      console.log('Set formBuilderStore mode to viewer'); 
      // Use loadVersionedForm to ensure we're using the published version
      loadVersionedForm(formId);
    } else {
      console.error("Form ID is missing or invalid in FormViewerPage");
    }
  }, [formId, loadVersionedForm, setMode]);

  // Initialize answers effect
  useEffect(() => {
    // Initialize answers once responseId is available and not already initialized
    if (responseId && !answersInitialized) { 
      initializeAnswers();
    }
  }, [responseId, initializeAnswers, answersInitialized]);

  // Memoized calculation for disabling next button
  const isNextDisabled = useMemo(() => {
    if (!block) {
      console.log('DEBUG_NEXT_BUTTON: No block available, disabling Next button');
      return true; 
    }

    // Debug log to check block type
    console.log('DEBUG_BLOCK_TYPE:', {
      blockId: block.id,
      blockType: block.type,
      subtype: block.subtype, // Using subtype property from UiBlock
      settings: block.settings,
      required: block.required,
      answerType: typeof currentAnswer,
      answerValue: currentAnswer
    });

    // AI conversation has its own internal submit/next logic
    if (block.subtype === 'ai_conversation') {
      console.log('DEBUG_NEXT_BUTTON: Block is AI conversation, disabling standard Next button');
      return true; 
    }

    // Disable if submitting
    if (submitting) {
      console.log('DEBUG_NEXT_BUTTON: Currently submitting, disabling Next button');
      return true;
    }

    // Disable if required but no answer
    if (block.required) {
      if (Array.isArray(currentAnswer) && currentAnswer.length === 0) {
        console.log('DEBUG_NEXT_BUTTON: Required array answer is empty, disabling Next button');
        return true;
      } else if (typeof currentAnswer === 'string' && currentAnswer.trim() === '') {
        console.log('DEBUG_NEXT_BUTTON: Required string answer is empty, disabling Next button');
        return true;
      } else if (currentAnswer === null || currentAnswer === undefined) {
        console.log('DEBUG_NEXT_BUTTON: Required answer is null/undefined, disabling Next button');
        return true;
      }
    }

    console.log('DEBUG_NEXT_BUTTON: All checks passed, Next button is enabled');
    return false; 
  }, [block, currentAnswer, submitting]);

  // Helper to prepare the answer value for submission
  const prepareAnswer = useCallback(() => {
    console.log('[prepareAnswer] Preparing answer for block:', block?.id);
    if (!block) {
      console.error('No block to prepare answer for');
      return null;
    }
    
    // Add validation if needed
    if (isNextDisabled) {
      console.error('Next is disabled, cannot submit');
      return null;
    }
    
    let answerToSubmit = currentAnswer;
    if (block.subtype === 'ai_conversation') { 
      if (aiConversationRef.current && typeof aiConversationRef.current.getMessages === 'function') {
        answerToSubmit = aiConversationRef.current.getMessages();
        console.log('[prepareAnswer] Using AI conversation messages');
      } else {
        console.error('AIConversation ref or getMessages not available');
        return null;
      }
    }
    
    // DEBUG LOGGING: Track static answer data
    let answerStringified = 'Unable to stringify content';
    try {
      const stringified = JSON.stringify(answerToSubmit);
      if (stringified && typeof stringified === 'string') {
        answerStringified = stringified.substring(0, 100) + (stringified.length > 100 ? '...' : '');
      }
    } catch (e) {
      answerStringified = '[Content contains non-serializable data]';
    }

    console.log('Formatted answer:', {
      answerType: typeof answerToSubmit,
      isArray: Array.isArray(answerToSubmit),
      answerValue: answerToSubmit,
      answerStringified
    });
    
    return answerToSubmit;
  }, [block, currentAnswer, isNextDisabled, aiConversationRef]);
  
  // Simplified handler for submitting an answer
  // Handle form submission by combining the workflow navigation with API submission
  const handleSubmit = useCallback(async () => {
    console.log('[DEBUG][handleSubmit] Starting form submission flow');
    
    const answerToSubmit = prepareAnswer();
    if (answerToSubmit !== null && block) {
      console.log('[DEBUG][handleSubmit] Answer prepared successfully, about to submit to API:', {
        blockId: block.id,
        subtype: block.subtype,
        answerType: typeof answerToSubmit
      });
      
      try {
        // First submit to the API
        await submitAnswerToAPI(block, "answer", answerToSubmit);
        
        console.log('[DEBUG][handleSubmit] API submission successful, now handling workflow navigation');
        
        // Then use workflow navigation to determine the next block
        workflowSubmitAnswer(answerToSubmit);
        
        console.log('[DEBUG][handleSubmit] Workflow navigation completed');
      } catch (error) {
        console.error('[DEBUG][handleSubmit] Error during submission process:', error);
      }
    } else {
      console.error('[DEBUG][handleSubmit] Unable to submit: answerToSubmit is null or block is undefined', {
        hasAnswer: answerToSubmit !== null,
        hasBlock: !!block
      });
    }
  }, [block, prepareAnswer, submitAnswerToAPI, workflowSubmitAnswer]);

  // Callback to handle going to the previous block
  const handlePrevious = useCallback(() => { 
      goToPrevious(); 
  }, [goToPrevious]); 

  // Load media assets if the form has blocks
  useEffect(() => {
    if (!isLoading && blocks.length > 0) {
      // Only load media assets once when blocks are available
      loadFormMedia(blocks);
      console.log('[FormViewerPage] Loaded media assets for form blocks');
    }
  }, [isLoading, blocks]);

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
                submitAnswer={async (block, type, content) => {
                  // Adapter function to bridge between the expected interfaces
                  // BlockRenderer expects a function that takes (block, answer) and returns Promise<void>
                  // First, log the call to help debug
                  console.log('DEBUG_BLOCK_RENDERER_SUBMIT:', {
                    blockId: block.id,
                    blockType: block.type,
                    subtype: block.subtype,
                    answerType: typeof content,
                    answerValue: content,
                    type: type
                  });
                  
                  try {
                    // First save to API - this was missing in the original implementation!
                    console.log('DEBUG_BLOCK_RENDERER_SUBMIT: Calling submitAnswerToAPI...');
                    // Use the passed type and content directly
                    await submitAnswerToAPI(block, type, content);
                    console.log('DEBUG_BLOCK_RENDERER_SUBMIT: API submission successful');
                    
                    // Then use workflow navigation
                    console.log('DEBUG_BLOCK_RENDERER_SUBMIT: Calling workflowSubmitAnswer...');
                    // Use the content parameter directly for workflow navigation
                    workflowSubmitAnswer(content);
                    console.log('DEBUG_BLOCK_RENDERER_SUBMIT: Workflow navigation completed');
                  } catch (error) {
                    console.error('DEBUG_BLOCK_RENDERER_SUBMIT: Error during submission:', error);
                    // Still return resolved promise to avoid breaking the interface
                  }
                  
                  // Return a resolved promise to match the expected interface
                  return Promise.resolve();
                }}
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
        onNext={handleSubmit} 
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