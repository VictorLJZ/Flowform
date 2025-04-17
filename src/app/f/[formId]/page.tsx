"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams } from "next/navigation"
import { ChevronLeft, Loader2 } from "lucide-react"
import { FormBlock } from "@/types/supabase-types"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { useForm } from "@/hooks/useForm"
import { getBlockDefinition, BlockDefinition } from '@/registry/blockRegistry'
import { StaticBlockSubtype } from '@/types/supabase-types'; // Import only StaticBlockSubtype

// Import Block Components
import { TextInputBlock } from "@/components/form/blocks/TextInputBlock"
import { TextAreaBlock } from "@/components/form/blocks/TextAreaBlock"
import { MultipleChoiceBlock } from "@/components/form/blocks/MultipleChoiceBlock"
import { CheckboxGroupBlock } from "@/components/form/blocks/CheckboxGroupBlock"
import { DropdownBlock } from "@/components/form/blocks/DropdownBlock"
import { NumberBlock } from "@/components/form/blocks/NumberBlock"
import { DateBlock } from "@/components/form/blocks/DateBlock"
import { EmailBlock } from "@/components/form/blocks/EmailBlock";

interface QAPair {
  question: string
  answer: string
  timestamp: string
  is_starter?: boolean
}

interface DynamicConversation {
  blockId: string
  conversation: QAPair[]
  isComplete: boolean
  currentQuestion?: string
}

type BlockAnswer = {
  blockId: string;
  answer: string;
  timestamp: string;
}

export default function FormSessionPage() {
  const params = useParams()
  const formId = params.formId as string
  const { toast } = useToast()
  
  // Use the SWR hook to fetch form data
  const { form, isLoading: isFormLoading, error: formError } = useForm(formId)
  
  // Derive blocks from the fetched form data
  const blocks = form?.blocks?.slice().sort((a, b) => a.order_index - b.order_index) || [];
  
  // Refs
  const blockContainerRef = useRef<HTMLDivElement>(null)
  
  // State for form and blocks
  const [responseId, setResponseId] = useState<string>('')
  
  // State for navigation
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [animation, setAnimation] = useState<'idle' | 'exit' | 'enter'>('idle')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // State for answers
  const [answers, setAnswers] = useState<Record<string, any>>({}); // Unified state for all answers
  
  // State for dynamic blocks
  const [dynamicConversations, setDynamicConversations] = useState<Record<string, DynamicConversation>>({})  
  
  // Initialize form session AFTER form data is loaded
  useEffect(() => {
    if (form && blocks.length > 0 && !responseId) {
      const initializeSession = async () => {
        try {
          const sessionResponse = await fetch(`/api/forms/${formId}/sessions`, {
            method: 'POST',
          });
          if (!sessionResponse.ok) {
            const errorText = await sessionResponse.text();
            console.error('Session fetch error response:', errorText);
            throw new Error(`Failed to initialize form session: ${sessionResponse.status} ${sessionResponse.statusText}`);
          }
          const sessionData = await sessionResponse.json();
          setResponseId(sessionData.responseId);

          // Initialize dynamic conversations based on fetched blocks
          const initialDynamicConversations: Record<string, DynamicConversation> = {};
          blocks.forEach((block: FormBlock) => {
            if (block.type === 'dynamic') {
              const starterQuestion = block.settings?.starter_question as string || 'How can I help you?';
              initialDynamicConversations[block.id] = {
                blockId: block.id,
                conversation: [],
                isComplete: false,
                currentQuestion: starterQuestion
              };
            }
          });
          setDynamicConversations(initialDynamicConversations);

        } catch (err) {
          console.error('Error initializing session:', err);
          toast({ 
            variant: "destructive", 
            title: "Error", 
            description: `Failed to start form session: ${err instanceof Error ? err.message : 'Unknown error'}` 
          });
        }
      };
      initializeSession();
    }
  }, [form, blocks, formId, responseId, toast]); // Depend on form and blocks
 
  // Focus input on load and after navigation
  useEffect(() => {
    // Focusing needs refinement based on dynamically rendered component
  }, [currentBlockIndex])
  
  // Calculate progress
  useEffect(() => {
    const newProgress = Math.min(100, ((currentBlockIndex + 1) / blocks.length) * 100)
    setProgress(newProgress)
  }, [currentBlockIndex, blocks.length])
  
  const currentBlock = blocks[currentBlockIndex]
  const currentDynamicConversation = currentBlock?.id ? dynamicConversations[currentBlock.id] : null;
  const currentQuestion = currentBlock?.type === 'dynamic' ? currentDynamicConversation?.currentQuestion : currentBlock?.title;
  
  // Handler for answer changes from block components
  const handleAnswerChange = useCallback((blockId: string, value: any) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [blockId]: value
    }));
  }, []);
  
  // Handle keyboard submit with Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (currentBlock && !isSubmitting) {
        handleSubmitAnswer();
      }
    }
  }
  
  // Submit answer to the backend
  const handleSubmitAnswer = async () => {
    if (!currentBlock || isSubmitting) return;
    
    // Get the answer from the unified state
    const answerValue = answers[currentBlock.id] || '';
    console.log("ANSWER VALUE: ", answerValue)

    setIsSubmitting(true)
    console.log(`Submitting answer for block ${currentBlockIndex}: ${currentBlock.id}, Response ID: ${responseId}`);
    
    try {
      // Prepare the request based on block type
      if (currentBlock.type === 'static') { // Handle Static Block Submission
        const staticPayload = {
          block_id: currentBlock.id,
          response_id: responseId,
          answer: answerValue,
          is_dynamic: false // Explicitly set for static
        };

        // Submit static block answer
        const response = await fetch(`/api/forms/${formId}/sessions`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(staticPayload)
        })
        
        if (!response.ok) {
          throw new Error('Failed to submit answer')
        }
        
        const data = await response.json()
        
        // Check if the form is completed
        if (data.completed) {
          setCompleted(true)
        } else {
          // Move to the next block
          setTimeout(() => {
            setAnimation('enter')
            setCurrentBlockIndex(prev => prev + 1)
          }, 300)
        }
      } else if (currentBlock.type === 'dynamic') {
        // Handle Dynamic Block Submission
        const isFirstQuestion = !currentDynamicConversation || currentDynamicConversation.conversation.length === 0

        const dynamicPayload = {
          block_id: currentBlock.id,
          response_id: responseId,
          answer: answerValue,
          question: currentDynamicConversation?.currentQuestion, // Send the question being answered
          is_dynamic: true, // Explicitly set for dynamic
          is_first_question: isFirstQuestion // Indicate if it's the start of the dynamic interaction
        };

        // Submit dynamic block response
        const response = await fetch(`/api/forms/${formId}/sessions`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(dynamicPayload)
        })
        
        if (!response.ok) {
          throw new Error('Failed to submit answer')
        }
        
        const data = await response.json()
        
        // Update dynamic conversation locally
        const updatedConversation = currentDynamicConversation?.conversation || []
        updatedConversation.push({
          question: currentDynamicConversation?.currentQuestion || '',
          answer: answerValue,
          timestamp: new Date().toISOString()
        })
        
        // Check if dynamic block is complete or form is completed
        if (data.completed) {
          setCompleted(true)
        } else if (data.dynamicComplete) {
          // Dynamic block is complete, move to next block
          setDynamicConversations(prev => ({
            ...prev,
            [currentBlock.id]: {
              blockId: currentBlock.id,
              conversation: updatedConversation,
              isComplete: true
            }
          }))
          
          setTimeout(() => {
            setAnimation('enter')
            setCurrentBlockIndex(prev => prev + 1)
          }, 300)
        } else {
          // Continue conversation with next question
          setDynamicConversations(prev => ({
            ...prev,
            [currentBlock.id]: {
              blockId: currentBlock.id,
              conversation: updatedConversation,
              isComplete: false,
              currentQuestion: data.nextQuestion
            }
          }))
          
          setTimeout(() => {
            setAnimation('enter')
          }, 300)
        }
      }
    } catch (err) {
      console.error('Error submitting answer:', err)
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: `Failed to submit answer: ${err instanceof Error ? err.message : 'Unknown error'}` 
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Reset animation state after transition
  useEffect(() => {
    if (animation !== 'idle') {
      const timer = setTimeout(() => {
        setAnimation('idle')
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [animation])
  
  // --- START: New Block Rendering Logic ---
  const renderBlockComponent = () => {
    if (!currentBlock) return null;
    
    // Assuming block.subtype will always be valid after migration
    // Get the block definition using the correct subtype union
    const blockDefinition = getBlockDefinition(currentBlock.subtype as StaticBlockSubtype | 'dynamic');
    
    if (!blockDefinition) {
      console.error(`Block definition not found for subtype: ${currentBlock.subtype}`);
      return <div>Error: Block type not supported.</div>; // Handle missing definition
    }
  
    // Common handlers and values
    const value = answers[currentBlock.id] ?? '';
    const handleChange = (val: any) => setAnswers(prev => ({ ...prev, [currentBlock.id]: val }));
  
    switch (currentBlock.subtype) {
      case 'short_text':
        return <TextInputBlock 
          id={currentBlock.id}
          title={currentBlock.title}
          settings={currentBlock.settings || {}}
          value={value}
          onChange={handleChange}
          required={currentBlock.required}
        />;
      case 'long_text':
        return <TextAreaBlock 
          id={currentBlock.id}
          title={currentBlock.title}
          settings={currentBlock.settings || {}}
          value={value}
          onChange={handleChange}
          required={currentBlock.required}
        />;
      case 'multiple_choice': 
        return <MultipleChoiceBlock 
          id={currentBlock.id}
          title={currentBlock.title}
          settings={currentBlock.settings || {}}
          value={value} 
          onChange={handleChange}
          required={currentBlock.required}
        />;
      case 'checkbox_group': 
        return <CheckboxGroupBlock 
          id={currentBlock.id}
          title={currentBlock.title}
          settings={currentBlock.settings || {}}
          value={value} 
          onChange={handleChange}
          required={currentBlock.required}
        />;
      case 'dropdown':
        return <DropdownBlock 
          id={currentBlock.id}
          title={currentBlock.title}
          settings={currentBlock.settings || {}}
          value={value}
          onChange={handleChange} // Use onChange as confirmed by component definition
          required={currentBlock.required}
        />;
      case 'number':
        return <NumberBlock 
          id={currentBlock.id}
          title={currentBlock.title}
          settings={currentBlock.settings || {}}
          value={value}
          onChange={handleChange}
          required={currentBlock.required}
        />;
      case 'date':
        return <DateBlock 
          id={currentBlock.id}
          title={currentBlock.title}
          settings={currentBlock.settings || {}}
          value={value}
          onChange={handleChange} 
          required={currentBlock.required}
        />;
      case 'email':
        return <EmailBlock 
          id={currentBlock.id}
          title={currentBlock.title}
          settings={currentBlock.settings || {}}
          value={value}
          onChange={handleChange}
          required={currentBlock.required}
        />;
      default:
        console.warn(`Unsupported block subtype: ${currentBlock.subtype}`) // Log unsupported types
        return <div>Unsupported block type: {currentBlock.subtype}</div>;
    }
  };
  // --- END: New Block Rendering Logic ---
  
  // Render the navigation buttons
  const renderNavigationButtons = () => {
    const isFirstBlock = currentBlockIndex === 0;
    const isLastBlock = currentBlockIndex === blocks.length - 1;
    const hasDynamicConversation = currentBlock?.type === 'dynamic' && currentDynamicConversation;
    const isDynamicComplete = hasDynamicConversation ? currentDynamicConversation?.isComplete : false;
    
    const canSubmit = 
      (currentBlock?.type === 'static' && answers[currentBlock.id]) || 
      (currentBlock?.type === 'dynamic' && answers[currentBlock.id] && !isDynamicComplete);
    
    const handlePrevious = () => {
      if (currentBlockIndex > 0) {
        setAnimation('exit');
        setTimeout(() => {
          setCurrentBlockIndex(prev => prev - 1);
          setAnimation('enter');
          
          // Update progress
          const newProgress = ((currentBlockIndex) / blocks.length) * 100;
          setProgress(Math.max(0, newProgress));
        }, 300);
      }
    };
    
    return (
      <div className="flex flex-col items-center gap-6">
        {/* Primary action button - styled like the one in your screenshot */}
        <Button
          onClick={handleSubmitAnswer}
          disabled={!canSubmit || isSubmitting}
          size="lg"
          className="min-w-[140px] rounded-lg h-12 font-medium transition-all"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </span>
          ) : (
            <>
              {isLastBlock && !isDynamicComplete ? (
                "Submit"
              ) : isDynamicComplete ? (
                "Next"
              ) : (
                "Enter"
              )}
            </>
          )}
        </Button>
        
        {/* Secondary action - previous button */}
        {!isFirstBlock && (
          <button
            onClick={handlePrevious}
            disabled={isSubmitting}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-3 h-3" />
            Previous question
          </button>
        )}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Minimal header with progress only */}
      <header className="py-2 px-6 fixed top-0 left-0 right-0 z-10">
        <div className="max-w-[800px] mx-auto">
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>
      
      {/* Main content with extra top padding for the fixed header */}
      <main className="flex-1 flex flex-col max-w-[800px] mx-auto w-full p-6 pt-14">
        {isFormLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-lg font-medium">Loading form...</p>
            </div>
          </div>
        ) : formError ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Error Loading Form</h2>
            <p className="text-gray-600 max-w-md">{formError.message || 'An unexpected error occurred.'}</p>
            <Button onClick={() => window.location.href = '/'}>
              Return Home
            </Button>
          </div>
        ) : completed ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Thank you for your responses!</h2>
            <p className="text-gray-600 max-w-md">
              Your form has been submitted successfully. We appreciate your time and input.
            </p>
            <div className="flex gap-4">
              <Button onClick={() => window.location.href = '/'}>
                Return Home
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center min-h-[calc(100vh-120px)]">
            {/* Current block */}
            <div 
              ref={blockContainerRef}
              className={cn(
                "transition-all duration-300 transform",
                animation === 'exit' && '-translate-y-4 opacity-0',
                animation === 'enter' && 'translate-y-0 opacity-100'
              )}
            >
              {currentBlock && (
                <div className="flex flex-col items-center justify-center text-center">
                  {/* Question number indicator */}
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-4">
                    Question {currentBlockIndex + 1} of {blocks.length}
                  </div>
                  
                  {/* Question title */}
                  <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-3 max-w-2xl">
                    {currentBlock.type === 'dynamic' 
                      ? currentQuestion 
                      : currentBlock.title
                    }
                  </h2>
                  
                  {/* Question description if available */}
                  {currentBlock.description && (
                    <p className="text-gray-600 mb-8 max-w-xl">{currentBlock.description}</p>
                  )}
                  
                  {/* Previous answers for dynamic blocks */}
                  {currentBlock?.type === 'dynamic' && currentDynamicConversation && currentDynamicConversation.conversation && currentDynamicConversation.conversation.length > 0 && (
                    <div className="w-full max-w-lg mb-8 bg-gray-50 rounded-lg p-4 text-left">
                      <h3 className="text-sm font-medium mb-2">Previous messages:</h3>
                      <div className="space-y-3">
                        {currentDynamicConversation.conversation.map((item, index) => (
                          <div key={index} className="text-sm">
                            <p className="font-medium text-gray-800">{item.question}</p>
                            <p className="text-gray-600">{item.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Input area */}
                  <div className="w-full max-w-lg mt-2 mb-8 flex flex-col items-center">
                    {/* Render the block component dynamically */} 
                    {renderBlockComponent()}
                  </div>
                  
                  {/* Navigation buttons */}
                  {renderNavigationButtons()}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
