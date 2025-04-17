"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { ChevronLeft, Loader2 } from "lucide-react"
import { FormBlock } from "@/types/supabase-types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { useForm } from "@/hooks/useForm"

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
  const { form, isLoading: isFormLoading, error: formError, mutate: mutateForm } = useForm(formId)
  
  // Derive blocks from the fetched form data
  const blocks = form?.blocks?.slice().sort((a, b) => a.order_index - b.order_index) || [];
  
  // Refs
  const answerInputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null)
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
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [, setStaticAnswers] = useState<BlockAnswer[]>([])
  
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
    if (!isFormLoading && !completed && answerInputRef.current) {
      setTimeout(() => {
        answerInputRef.current?.focus()
      }, 300)
    }
  }, [isFormLoading, currentBlockIndex, completed])
  
  // Handle keyboard submit with Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitAnswer()
    }
  }
  
  // Get current block
  const currentBlock = blocks[currentBlockIndex] || null
  
  // Get dynamic conversation for current block if it's a dynamic block
  const currentDynamicConversation = currentBlock?.type === 'dynamic' 
    ? dynamicConversations[currentBlock.id] 
    : null
    
  // Get current question for dynamic blocks
  const currentQuestion = currentDynamicConversation?.currentQuestion || ""

  const handleSubmitAnswer = async () => {
    if (!currentBlock || isSubmitting || !responseId) return
    
    // For static blocks, validate that we have an answer
    if (currentBlock.type === 'static' && !currentAnswer.trim()) {
      return
    }
    
    // For dynamic blocks, validate that we have an answer and a current question
    if (currentBlock.type === 'dynamic' && 
        (!currentAnswer.trim() || !currentDynamicConversation?.currentQuestion)) {
      return
    }
    
    setIsSubmitting(true)
    setAnimation('exit')
    
    try {
      // Prepare the request based on block type
      if (currentBlock.type === 'static') {
        // Submit static block answer
        const response = await fetch(`/api/forms/${formId}/sessions`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            responseId,
            blockId: currentBlock.id,
            blockType: 'static',
            answer: currentAnswer.trim()
          }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to submit answer')
        }
        
        const data = await response.json()
        
        // Save the answer locally for history
        setStaticAnswers(prev => [...prev, {
          blockId: currentBlock.id,
          answer: currentAnswer.trim(),
          timestamp: new Date().toISOString()
        }])
        
        // Clear the input
        setCurrentAnswer('')
        
        // Check if the form is completed
        if (data.completed) {
          setCompleted(true)
        } else {
          // Move to the next block
          setTimeout(() => {
            setAnimation('enter')
            setCurrentBlockIndex(prev => prev + 1)
            
            // Update progress
            const newProgress = Math.min(100, ((currentBlockIndex + 2) / blocks.length) * 100)
            setProgress(newProgress)
          }, 300)
        }
      } else if (currentBlock.type === 'dynamic') {
        // For dynamic blocks
        const isFirstQuestion = !currentDynamicConversation?.conversation.length;
        
        // Submit dynamic block response
        const response = await fetch(`/api/forms/${formId}/sessions`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            responseId,
            blockId: currentBlock.id,
            blockType: 'dynamic',
            currentQuestion: currentDynamicConversation?.currentQuestion,
            answer: currentAnswer.trim(),
            isFirstQuestion
          }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to submit answer')
        }
        
        const data = await response.json()
        
        // Update dynamic conversation locally
        const updatedConversation = currentDynamicConversation?.conversation || []
        updatedConversation.push({
          question: currentDynamicConversation?.currentQuestion || '',
          answer: currentAnswer.trim(),
          timestamp: new Date().toISOString()
        })
        
        // Clear the input
        setCurrentAnswer('')
        
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
            
            // Update progress
            const newProgress = Math.min(100, ((currentBlockIndex + 2) / blocks.length) * 100)
            setProgress(newProgress)
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
    } catch (error) {
      console.error('Error submitting answer:', error)
      toast({
        title: "Error",
        description: "Failed to submit your answer. Please try again.",
        variant: "destructive"
      })
      setAnimation('enter') // Reset animation if there's an error
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
  
  // Render function for static blocks based on subtype
  const renderStaticBlockInput = () => {
    if (!currentBlock || currentBlock.type !== 'static') return null
    
    const handleInputChange = (value: string) => {
      setCurrentAnswer(value)
    }
    
    switch (currentBlock.subtype) {
      case 'text_short':
      case 'email':
        return (
          <Input
            ref={answerInputRef as React.RefObject<HTMLInputElement>}
            value={currentAnswer}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={currentBlock.description || `Enter your answer...`}
            className="w-full text-base px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            type={currentBlock.subtype === 'email' ? 'email' : 'text'}
            disabled={isSubmitting}
          />
        )
        
      case 'text_long':
        return (
          <Textarea
            ref={answerInputRef as React.RefObject<HTMLTextAreaElement>}
            value={currentAnswer}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentBlock.description || `Type your answer here...`}
            className="min-h-28 w-full text-base px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
            disabled={isSubmitting}
          />
        )
        
      case 'number':
        return (
          <Input
            ref={answerInputRef as React.RefObject<HTMLInputElement>}
            value={currentAnswer}
            onChange={(e) => {
              // Only allow numbers
              if (/^\d*\.?\d*$/.test(e.target.value) || e.target.value === '') {
                handleInputChange(e.target.value)
              }
            }}
            placeholder={currentBlock.description || `Enter a number...`}
            className="w-full p-3 text-base"
            type="text"
            inputMode="decimal"
            disabled={isSubmitting}
          />
        )
        
      case 'multiple_choice':
        // Get options from block settings
        // Ensure options is always an array with proper typing
        const options: Array<{value: string, label: string}> = Array.isArray(currentBlock.settings?.options) 
          ? currentBlock.settings.options 
          : []
        return (
          <RadioGroup
            value={currentAnswer}
            onValueChange={handleInputChange}
            className="flex flex-col gap-3 mt-2"
            disabled={isSubmitting}
          >
            {options.map((option: {value: string, label: string}, index: number) => (
              <div key={option.value} className="flex items-center space-x-2 p-3 border rounded-md hover:bg-gray-50">
                <RadioGroupItem value={option.value} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )
        
      case 'yes_no':
        return (
          <RadioGroup
            value={currentAnswer}
            onValueChange={handleInputChange}
            className="flex flex-col gap-3 mt-2"
            disabled={isSubmitting}
          >
            <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-gray-50">
              <RadioGroupItem value="yes" id="option-yes" />
              <Label htmlFor="option-yes" className="flex-1 cursor-pointer font-normal">Yes</Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-gray-50">
              <RadioGroupItem value="no" id="option-no" />
              <Label htmlFor="option-no" className="flex-1 cursor-pointer font-normal">No</Label>
            </div>
          </RadioGroup>
        )
        
      default:
        return (
          <Textarea
            ref={answerInputRef as React.RefObject<HTMLTextAreaElement>}
            value={currentAnswer}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer here..."
            className="min-h-24 p-3 text-base resize-none"
            disabled={isSubmitting}
          />
        )
    }
  }
  
  // Render the navigation buttons
  const renderNavigationButtons = () => {
    const isFirstBlock = currentBlockIndex === 0;
    const isLastBlock = currentBlockIndex === blocks.length - 1;
    const hasDynamicConversation = currentBlock?.type === 'dynamic' && currentDynamicConversation;
    const isDynamicComplete = hasDynamicConversation ? currentDynamicConversation?.isComplete : false;
    
    const canSubmit = 
      (currentBlock?.type === 'static' && currentAnswer.trim()) || 
      (currentBlock?.type === 'dynamic' && currentAnswer.trim() && !isDynamicComplete);
    
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
            <Button onClick={() => mutateForm()} variant="outline">Retry</Button>
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
                    {currentBlock.type === 'static' ? (
                      renderStaticBlockInput()
                    ) : (
                      <Textarea
                        ref={answerInputRef as React.RefObject<HTMLTextAreaElement>}
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your answer here..."
                        className="min-h-24 w-full border rounded-lg resize-none p-4 text-base shadow-sm"
                        disabled={isSubmitting}
                      />
                    )}
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
