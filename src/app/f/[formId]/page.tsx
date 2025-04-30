"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useForm } from "@/hooks/useForm"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import type { FormBuilderState } from "@/types/store-types"
import type { QAPair } from "@/types/supabase-types"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { AnimatePresence, motion } from 'framer-motion'
import {
  TextInputBlock,
  TextAreaBlock,
  MultipleChoiceBlock,
  CheckboxGroupBlock,
  DropdownBlock,
  EmailBlock,
  NumberBlock,
  DateBlock,
  AIConversationBlock
} from "@/components/form"

export default function FormViewerPage() {
  const params = useParams()
  const formId = params.formId as string

  const { form, isLoading, error } = useForm(formId)
  const [responseId, setResponseId] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [completed, setCompleted] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [currentAnswer, setCurrentAnswer] = useState<string | number | string[] | QAPair[]>("")
  const [direction, setDirection] = useState<number>(1)

  const setBlocks = useFormBuilderStore((s: FormBuilderState) => s.setBlocks)
  const setMode = useFormBuilderStore((s: FormBuilderState) => s.setMode)
  const blocks = useFormBuilderStore((s: FormBuilderState) => s.blocks)

  // persistence key and saved answers
  const storageKey = `flowform-${formId}-session`
  const [savedAnswers, setSavedAnswers] = useState<Record<string, string | number | string[] | QAPair[]>>({})

  // derive current block and index (non-null assert)
  const total = blocks.length
  const block = blocks[currentIndex]!
  const isLastQuestion = currentIndex === total - 1

  useEffect(() => {
    const blk = blocks[currentIndex]
    if (!blk) return
    if (savedAnswers[blk.id] !== undefined) {
      setCurrentAnswer(savedAnswers[blk.id] as string | number | string[])
    } else {
      switch (blk.blockTypeId) {
        case "number": setCurrentAnswer(0); break
        case "checkbox_group": setCurrentAnswer([]); break
        default: setCurrentAnswer("")
      }
    }
  }, [currentIndex, blocks, savedAnswers])

  useEffect(() => {
    setMode("viewer")
    
    if (form) {
      const mapped = form.blocks.map(b => {
        // Properly map dynamic blocks to ai_conversation blockTypeId
        // Use type assertion to handle the mapping between database and frontend types
        // Database uses 'dynamic' as the type, but our frontend uses 'ai_conversation' as the blockTypeId
        const blockTypeId = b.type === 'dynamic' ? 'ai_conversation' as string : b.subtype
        
        return {
          id: b.id,
          blockTypeId,
          type: b.type,
          title: b.title,
          description: b.description ?? undefined,
          required: b.required,
          order: b.order_index,
          settings: (b.settings || {}) as Record<string, unknown>
        }
      })
      
      setBlocks(mapped)
      console.log('[FormViewer] Loaded blocks:', mapped)
    }
  }, [form, formId, storageKey, setBlocks, setMode])

  useEffect(() => {
    if (!form) return
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      const { sessionId: sid, currentIndex: idx } = JSON.parse(saved)
      setResponseId(sid)
      setCurrentIndex(idx)
    } else {
      fetch(`/api/forms/${formId}/sessions`, { method: "POST" })
        .then(res => res.json())
        .then(data => {
          setResponseId(data.sessionId)
          localStorage.setItem(storageKey, JSON.stringify({ sessionId: data.sessionId, currentIndex: 0 }))
        })
        .catch(console.error)
    }
  }, [form, formId, storageKey])

  useEffect(() => {
    if (!responseId || blocks.length === 0) return
    fetch(`/api/forms/${formId}/sessions/${responseId}`)
      .then(res => res.json())
      .then(data => setSavedAnswers(data.answers || {}))
      .catch(console.error)
  }, [responseId, blocks, formId])

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setSubmitError(null)
      setDirection(-1)
      setCurrentIndex(idx => {
        const newIdx = idx - 1
        localStorage.setItem(storageKey, JSON.stringify({ sessionId: responseId, currentIndex: newIdx }))
        return newIdx
      })
    }
  }
  
  const handleAnswer = async () => {
    if (!responseId) return
    setSubmitError(null)
    setSubmitting(true)
    try {
      // Determine the current question for AI conversations
      let additionalData = {}
      
      // For AI conversations, we need to include current question info
      if (block.blockTypeId === 'ai_conversation') {
        // Get the current conversation state
        const conversation = currentAnswer as QAPair[] || []
        const currentQuestionIndex = conversation.length > 0 ? conversation.length - 1 : -1
        const isFirstQuestion = currentQuestionIndex === -1
        const currentQuestion = isFirstQuestion
          ? (block.settings?.startingPrompt as string || "How can I help you today?")
          : conversation[currentQuestionIndex]?.question
          
        additionalData = {
          currentQuestion,
          isFirstQuestion
        }
        
        console.log('AI Conversation data:', {
          conversation,
          currentQuestionIndex,
          isFirstQuestion,
          currentQuestion
        })
      }
      
      const requestBody = { 
        responseId, 
        blockId: block.id, 
        blockType: block.type, 
        answer: currentAnswer,
        ...additionalData
      }
      
      console.log('Submitting form data:', requestBody)
      
      const res = await fetch(`/api/forms/${formId}/sessions`, { 
        method: "PUT", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(requestBody) 
      })
      
      const data = await res.json()
      
      // Special handling for AI conversations
      if (block.blockTypeId === 'ai_conversation' && data.nextQuestion && !data.dynamicComplete) {
        // Update the conversation with the next question
        const conversation = currentAnswer as QAPair[] || []
        const updatedConversation = [...conversation]
        
        // If this is a new conversation, add the first QA pair
        if (conversation.length === 0) {
          updatedConversation.push({
            question: block.settings?.startingPrompt as string || "How can I help you today?",
            answer: currentAnswer as string,
            timestamp: new Date().toISOString(),
            is_starter: true
          })
        }
        
        // Add the next AI question
        updatedConversation.push({
          question: data.nextQuestion,
          answer: "",
          timestamp: new Date().toISOString(),
          is_starter: false
        })
        
        // Update the current answer with the new conversation
        setCurrentAnswer(updatedConversation)
        setSavedAnswers((prev: Record<string, string | number | string[] | QAPair[]>) => ({ 
          ...prev, 
          [block.id]: updatedConversation 
        }))
      } 
      else if (data.completed) {
        setCompleted(true)
      } 
      else {
        // For regular blocks or when AI conversation is complete
        setSavedAnswers((prev: Record<string, string | number | string[] | QAPair[]>) => ({ 
          ...prev, 
          [block.id]: currentAnswer 
        }))
        
        setDirection(1)
        setCurrentIndex(idx => {
          const newIdx = idx + 1
          localStorage.setItem(storageKey, JSON.stringify({ sessionId: responseId, currentIndex: newIdx }))
          return newIdx
        })
      }
    } catch (error) {
      console.error(error)
      setSubmitError("Failed to save answer. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // guard loading and errors before rendering viewer
  if (isLoading || error || !form || blocks.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-primary" />
      </div>
    )
  }

  const hasValidAnswer = (() => {
    if (!block.required) return true;
    const v = currentAnswer;
    switch (block.blockTypeId) {
      case "short_text":
      case "long_text":
      case "email":
      case "dropdown":
      case "date":
        return typeof v === "string" && v.trim() !== "";
      case "number":
        return v !== "" && !isNaN(v as number);
      case "multiple_choice":
        return typeof v === "string" && v !== "";
      case "checkbox_group":
        return Array.isArray(v) && (v as string[]).length > 0;
      case "ai_conversation":
        // For AI conversation blocks, check if the most recent question has an answer
        if (Array.isArray(v) && (v as QAPair[]).length > 0) {
          const conversation = v as QAPair[];
          const currentQuestion = conversation[conversation.length - 1];
          
          // If there's no current question yet, only need starter question to be answered
          if (!currentQuestion) {
            return conversation.some(qa => qa.is_starter && qa.answer && qa.answer.trim() !== "");
          }
          
          // If a question exists without an answer, that means we're on that question
          // and it needs to be answered
          return currentQuestion.answer && currentQuestion.answer.trim() !== "";
        }
        return false;
      default:
        return true;
    }
  })();
  
  const isNextDisabled = block.required && !hasValidAnswer || submitting;

  const commonProps = {
    id: block.id,
    title: block.title,
    description: block.description,
    required: block.required,
    index: currentIndex,
    totalBlocks: blocks.length,
    settings: block.settings, // Use the actual settings from the database
    onNext: handleAnswer,
    isNextDisabled: isNextDisabled
  }

  const renderBlock = () => {
    // Use commonProps for all block types to ensure consistent navigation
    switch (block.blockTypeId) {
      case "short_text":
        return <TextInputBlock 
          {...commonProps} 
          value={currentAnswer as string} 
          onChange={(v: string) => setCurrentAnswer(v)} 
        />
      case "long_text":
        return <TextAreaBlock 
          {...commonProps} 
          value={currentAnswer as string} 
          onChange={(v: string) => setCurrentAnswer(v)} 
        />
      case "multiple_choice":
        return <MultipleChoiceBlock 
          {...commonProps} 
          value={currentAnswer as string} 
          onChange={(v: string) => setCurrentAnswer(v)} 
        />
      case "checkbox_group":
        return <CheckboxGroupBlock 
          {...commonProps} 
          value={currentAnswer as string[]} 
          onChange={(v: string[]) => setCurrentAnswer(v)} 
        />
      case "dropdown":
        return <DropdownBlock 
          {...commonProps} 
          value={currentAnswer as string} 
          onChange={(v: string) => setCurrentAnswer(v)} 
        />
      case "email":
        return <EmailBlock 
          {...commonProps} 
          value={currentAnswer as string} 
          onChange={(v: string) => setCurrentAnswer(v)} 
        />
      case "number":
        return <NumberBlock 
          {...commonProps} 
          value={currentAnswer as number} 
          onChange={(v: string | number) => setCurrentAnswer(typeof v === 'string' ? Number(v) : v)} 
        />
      case "date":
        return <DateBlock 
          {...commonProps} 
          value={currentAnswer as string} 
          onChange={(v: string) => setCurrentAnswer(v)} 
        />
      case "ai_conversation":
        return <AIConversationBlock 
          {...commonProps} 
          settings={{
            startingPrompt: (block.settings?.startingPrompt as string) || "How can I help you today?",
            maxQuestions: (block.settings?.maxQuestions as number) || 5,
            temperature: (block.settings?.temperature as number) || 0.7,
            contextInstructions: block.settings?.contextInstructions as string,
            // Add default presentation and layout for SlideWrapper
            presentation: {
              layout: 'centered',
              spacing: 'normal',
              titleSize: 'large'
            },
            layout: { type: 'standard' }
          }}
          value={currentAnswer as QAPair[]} 
          onChange={(v: QAPair[]) => setCurrentAnswer(v)}
          onUpdate={(updates) => {
            // In viewer mode we don't update block settings but we need this prop
            console.log('Block update requested', updates);
          }}
        />
      default:
        return null
    }
  }

  const variants = {
    enter: (dir: number) => ({ y: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { y: '0%', opacity: 1 },
    exit: (dir: number) => ({ y: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  }

  if (completed) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-8 text-center">
        <div className="max-w-lg">
          <h1 className="text-3xl font-bold mb-4">Thank you!</h1>
          <p className="text-lg text-gray-600 mb-8">Your form has been submitted successfully.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex items-stretch relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            {renderBlock()}
          </motion.div>
        </AnimatePresence>
      </div>
      
      <div className="fixed bottom-4 right-4 flex items-center gap-2 z-10">
        <button 
          onClick={handlePrevious}
          disabled={currentIndex === 0 || submitting}
          className="w-10 h-10 rounded-full bg-white/80 shadow-md flex items-center justify-center hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous question"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <button 
          onClick={handleAnswer}
          disabled={isNextDisabled || isLastQuestion}
          className="w-10 h-10 rounded-full bg-white/80 shadow-md flex items-center justify-center hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next question"
        >
          {submitting ? (
            <div className="h-5 w-5 border-2 border-t-transparent border-primary rounded-full animate-spin" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>
      </div>
      
      <div className="fixed bottom-4 left-4 text-xs text-gray-500 flex items-center">
        Powered by <span className="font-semibold ml-1">FlowForm</span>
      </div>
      
      {submitError && (
        <div className="fixed top-4 right-4 left-4 bg-red-50 border border-red-200 rounded-md p-3 shadow-md">
          <p className="text-red-600 text-sm">{submitError}</p>
        </div>
      )}
      
      {!hasValidAnswer && block.required && (
        <div className="absolute bottom-20 left-0 right-0 text-center">
          <p className="text-red-500 font-medium">This field is required</p>
        </div>
      )}
    </div>
  )
}