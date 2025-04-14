"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react"
import { useFormBuilderStore, useCurrentBlockDefinition } from "@/stores/formBuilderStore"
import { cn } from "@/lib/utils"

export default function FormBuilderContent() {
  const { 
    blocks, 
    currentBlockId, 
    getCurrentBlock,
    setCurrentBlockId,
    updateBlock,
    updateBlockSettings,
    setBlockSelectorOpen,
    formData
  } = useFormBuilderStore()
  
  const currentBlock = getCurrentBlock()
  const blockDefinition = useCurrentBlockDefinition()
  
  // Function to navigate to prev/next block
  const goToBlock = (direction: 'prev' | 'next') => {
    if (!currentBlockId || blocks.length === 0) return
    
    const currentIndex = blocks.findIndex(block => block.id === currentBlockId)
    if (currentIndex === -1) return
    
    if (direction === 'prev' && currentIndex > 0) {
      setCurrentBlockId(blocks[currentIndex - 1].id)
    } else if (direction === 'next' && currentIndex < blocks.length - 1) {
      setCurrentBlockId(blocks[currentIndex + 1].id)
    }
  }
  
  // If no blocks or no selected block, show empty state
  if (blocks.length === 0 || !currentBlock || !blockDefinition) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-center p-6">
        <div className="max-w-md">
          <h3 className="text-xl font-semibold mb-2">{blocks.length === 0 ? "Let's build your form" : "Select a block"}</h3>
          <p className="text-muted-foreground mb-6">
            {blocks.length === 0 
              ? "Start by adding your first question or content block" 
              : "Click on a block in the sidebar to edit it"
            }
          </p>
          
          {blocks.length === 0 && (
            <Button 
              onClick={() => setBlockSelectorOpen(true)}
              className="mx-auto"
            >
              <PlusCircle size={16} className="mr-2" />
              Add Your First Block
            </Button>
          )}
        </div>
      </div>
    )
  }
  
  // Current block index for navigation display
  const currentIndex = blocks.findIndex(block => block.id === currentBlockId)
  
  return (
    <div className="flex-1 bg-slate-50 flex flex-col">
      {/* Preview header */}
      <div className="bg-background border-b p-2 flex justify-between items-center">
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8"
            disabled={currentIndex <= 0}
            onClick={() => goToBlock('prev')}
          >
            <ChevronLeft size={16} />
          </Button>
          
          <div className="text-sm">
            <span className="font-medium">{currentIndex + 1}</span>
            <span className="text-muted-foreground">/{blocks.length}</span>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8"
            disabled={currentIndex >= blocks.length - 1}
            onClick={() => goToBlock('next')}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground" style={{ padding: 'calc(var(--spacing, 0.625rem) * 2.5)' }}>
          {blockDefinition.name}
        </div>
      </div>
      
      {/* Main content - Slide-style layout */}
      <div className="flex-1 overflow-auto flex items-center p-4" style={{ width: '100%', maxWidth: 'none', minWidth: '0' }}>
        {/* Full width container */}
        <div style={{ width: '100%', maxWidth: 'none' }}>
          {/* 16:9 aspect ratio wrapper */}
          <div className="relative" style={{ width: '100%', paddingTop: '56.25%' /* 16:9 Aspect Ratio */ }}>
            <Card className="shadow-sm rounded-none absolute top-0 left-0 w-full h-full border-0">
              <CardContent className="h-full" style={{ padding: '1.5rem 15%' }}>
                <div className="grid h-full place-items-center">
                  <div className="slide-content-wrapper w-full">
                  {/* Slide counter with arrow */}
                  <div className="flex items-center mb-5">
                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                        {currentIndex + 1}
                      </span>
                      <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                        <path 
                          fill="currentColor"
                          fillRule="evenodd" 
                          clipRule="evenodd" 
                          d="M8.47 1.97a.75.75 0 0 1 1.06 0l4.897 4.896a1.25 1.25 0 0 1 0 1.768L9.53 13.53a.75.75 0 0 1-1.06-1.06l3.97-3.97H1.75a.75.75 0 1 1 0-1.5h10.69L8.47 3.03a.75.75 0 0 1 0-1.06Z" 
                        />
                      </svg>
                    </div>
                  </div>
                  {/* Editable title */}
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <div 
                        contentEditable
                        suppressContentEditableWarning
                        className="font-semibold outline-none focus-visible:ring-0 focus-visible:ring-offset-0 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none"
                        style={{ fontSize: '1.75rem', lineHeight: '2.25rem', minWidth: '1rem' }}
                        data-placeholder="Question title"
                        onInput={(e) => {
                          const target = e.target as HTMLDivElement;
                          updateBlock(currentBlock.id, { title: target.textContent || '' });
                        }}
                        ref={(el) => {
                          // Safely update content without using dangerouslySetInnerHTML
                          if (el && el.textContent !== currentBlock.title) {
                            el.textContent = currentBlock.title || '';
                          }
                        }}
                      />
                      {currentBlock.required && (
                        <span className="text-primary font-medium ml-1" style={{ fontSize: '1.5rem' }}>*</span>
                      )}
                    </div>
                    
                    {/* Optional description */}
                    <Textarea
                      value={currentBlock.description || ''}
                      onChange={(e) => updateBlock(currentBlock.id, { description: e.target.value })}
                      className="border-none resize-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      placeholder="Add a description (optional)"
                      rows={2}
                    />
                  </div>
              </div>

                {/* Block type specific preview */}
                <div>
                  {/* Render different content based on block type */}
                  {currentBlock.blockTypeId === 'short-text' && (
                    <Input 
                        disabled 
                        placeholder={currentBlock.settings.placeholder || "Type your answer here..."} 
                        className="max-w-md mt-4" 
                      />
                    )}
                    
                    {currentBlock.blockTypeId === 'long-text' && (
                      <Textarea 
                        disabled 
                        placeholder={currentBlock.settings.placeholder || "Type your detailed answer here..."} 
                        className="max-w-md mt-4" 
                        rows={currentBlock.settings.maxRows || 5}
                      />
                    )}
                    
                    {currentBlock.blockTypeId === 'multiple-choice' && (
                      <div className="space-y-4 mt-4">
                        <RadioGroup disabled value="option-1">
                          {currentBlock.settings.options?.map((option: any) => (
                            <div key={option.id} className="flex items-center space-x-2">
                              <RadioGroupItem value={option.id} id={option.id} />
                              <Label htmlFor={option.id}>{option.label}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    )}
                    
                    {currentBlock.blockTypeId === 'checkbox' && (
                      <div className="space-y-4 mt-4">
                        {currentBlock.settings.options?.map((option: any) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <Checkbox id={option.id} disabled />
                            <Label htmlFor={option.id}>{option.label}</Label>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {currentBlock.blockTypeId === 'dropdown' && (
                      <div className="max-w-md mt-4">
                        <Select disabled>
                          <SelectTrigger>
                            <SelectValue placeholder={currentBlock.settings.placeholder || "Select an option"} />
                          </SelectTrigger>
                          <SelectContent>
                            {currentBlock.settings.options?.map((option: any) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    {currentBlock.blockTypeId === 'email' && (
                      <Input 
                        disabled 
                        type="email"
                        placeholder={currentBlock.settings.placeholder || "email@example.com"} 
                        className="max-w-md mt-4" 
                      />
                    )}
                    
                    {currentBlock.blockTypeId === 'number' && (
                      <Input 
                        disabled 
                        type="number"
                        placeholder={currentBlock.settings.placeholder || "0"} 
                        className="max-w-md mt-4" 
                      />
                    )}
                    
                    {currentBlock.blockTypeId === 'date' && (
                      <Input 
                        disabled 
                        type="date"
                        placeholder="YYYY-MM-DD" 
                        className="max-w-md mt-4" 
                      />
                    )}
                    
                    {currentBlock.blockTypeId === 'ai-conversation' && (
                      <div className="border rounded-lg p-4 bg-primary/5 max-w-xl mt-4">
                        <div className="flex items-center gap-2 text-sm font-medium mb-2">
                          <MessageSquare size={16} />
                          <span>AI Conversation</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          This block will start an AI-powered conversation with the form respondent.
                        </p>
                        <div className="bg-background rounded p-3 border text-sm">
                          <p className="font-medium">Starter Question:</p>
                          <p className="text-muted-foreground mt-1">
                            {currentBlock.settings.startingPrompt || "How can I help you today?"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
