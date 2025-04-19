"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useForm } from "@/hooks/useForm"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { SlideWrapper } from "@/components/form/SlideWrapper"
import {
  TextInputBlock,
  TextAreaBlock,
  MultipleChoiceBlock,
  CheckboxGroupBlock,
  DropdownBlock,
  EmailBlock,
  NumberBlock,
  DateBlock
} from "@/components/form"

export default function FormViewerPage() {
  const params = useParams()
  const formId = params.formId as string

  const { form, isLoading, error } = useForm(formId)
  const [responseId, setResponseId] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [currentAnswer, setCurrentAnswer] = useState<string | number | string[]>("")

  const setBlocks = useFormBuilderStore(s => s.setBlocks)
  const setMode = useFormBuilderStore(s => s.setMode)
  const blocks = useFormBuilderStore(s => s.blocks)

  // Reset answer when moving to a new block
  useEffect(() => {
    const blk = blocks[currentIndex]
    if (blk) {
      switch (blk.blockTypeId) {
        case "number":
          setCurrentAnswer(0)
          break
        case "checkbox_group":
          setCurrentAnswer([])
          break
        default:
          setCurrentAnswer("")
      }
    }
  }, [currentIndex, blocks])

  // Load form into store and switch to viewer mode
  useEffect(() => {
    // Set mode first to ensure it's available to all components
    setMode("viewer")
    
    if (form) {
      const mapped = form.blocks.map(b => ({
        id: b.id,
        blockTypeId: b.subtype,
        type: b.type,
        title: b.title,
        description: b.description ?? undefined,
        required: b.required,
        order: b.order_index,
        settings: (b.settings || {}) as Record<string, unknown>
      }))
      setBlocks(mapped)
    }
  }, [form, setBlocks, setMode])

  // Start a form response session via our POST API
  useEffect(() => {
    if (form && !responseId) {
      fetch(`/api/forms/${formId}/sessions`, { method: "POST" })
        .then(res => res.json())
        .then(data => setResponseId(data.sessionId))
        .catch(console.error)
    }
  }, [form, responseId, formId])

  // Wait for form, blocks, and valid block index before rendering
  if (isLoading || !form || blocks.length === 0 || currentIndex < 0 || currentIndex >= blocks.length) {
    return <div>Loading form…</div>
  }
  if (error) return <div>Error loading form.</div>
  if (completed) return <div>Form complete. Thank you!</div>

  const total = blocks.length
  const block = blocks[currentIndex]

  // Handle submitting static block answer and navigating
  const handleAnswer = async () => {
    if (!responseId) return
    try {
      const res = await fetch(`/api/forms/${formId}/sessions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responseId,
          blockId: block.id,
          blockType: block.type,
          answer: currentAnswer
        })
      })
      const data = await res.json()
      if (data.completed) {
        setCompleted(true)
      } else {
        setCurrentIndex(idx => idx + 1)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Validate answer for required blocks
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
      default:
        return true;
    }
  })();

  const commonProps = {
    id: block.id,
    title: block.title,
    description: block.description,
    required: block.required,
    index: currentIndex,
    totalBlocks: total,
    settings: block.settings, // Use the actual settings from the database
    onNext: handleAnswer,
    isNextDisabled: block.required && !hasValidAnswer
  }

  function renderBlock() {
    switch (block.blockTypeId) {
      case "short_text":
        return <TextInputBlock {...commonProps} value={currentAnswer as string} onChange={(v: string) => setCurrentAnswer(v)} />
      case "long_text":
        return <TextAreaBlock {...commonProps} value={currentAnswer as string} onChange={(v: string) => setCurrentAnswer(v)} />
      case "multiple_choice":
        return <MultipleChoiceBlock {...commonProps} value={currentAnswer as string} onChange={(v: string) => setCurrentAnswer(v)} />
      case "checkbox_group":
        return <CheckboxGroupBlock {...commonProps} value={currentAnswer as string[]} onChange={(v: string[]) => setCurrentAnswer(v)} />
      case "dropdown":
        return <DropdownBlock {...commonProps} value={currentAnswer as string} onChange={(v: string) => setCurrentAnswer(v)} />
      case "email":
        return <EmailBlock {...commonProps} value={currentAnswer as string} onChange={(v: string) => setCurrentAnswer(v)} />
      case "number":
        return <NumberBlock {...commonProps} value={currentAnswer as number} onChange={(v: string | number) => setCurrentAnswer(typeof v === 'string' ? Number(v) : v)} />
      case "date":
        return <DateBlock {...commonProps} value={currentAnswer as string} onChange={(v: string) => setCurrentAnswer(v)} />
      default:
        return null
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex items-stretch">
        {renderBlock()}
      </div>
      {!hasValidAnswer && (
        <div className="absolute bottom-20 left-0 right-0 text-center">
          <p className="text-red-500 font-medium">This field is required</p>
        </div>
      )}
    </div>
  )
}