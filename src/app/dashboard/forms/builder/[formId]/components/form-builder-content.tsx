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
        
        <div className="text-sm text-muted-foreground">
          {blockDefinition.name}
        </div>
      </div>
      
      {/* Main content - Typeform-style slide */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-6">
        <div className="w-full max-w-3xl mx-auto">
          <Card className="shadow-sm">
            <CardContent className="p-6 min-h-[400px] flex flex-col">
              {/* Editable title */}
              <div className="mb-4">
                <Input
                  value={currentBlock.title}
                  onChange={(e) => updateBlock(currentBlock.id, { title: e.target.value })}
                  className="text-2xl font-semibold border-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="Question title"
                />
                
                {/* Optional description */}
                <Textarea
                  value={currentBlock.description || ''}
                  onChange={(e) => updateBlock(currentBlock.id, { description: e.target.value })}
                  className="border-none resize-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="Add a description (optional)"
                  rows={2}
                />
              </div>
              
              {/* Block type specific preview */}
              <div className="flex-1">
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
              
              {/* Required/optional label - fixed at bottom */}
              <div className="mt-6 text-sm text-muted-foreground">
                {currentBlock.required ? "* Required" : "Optional"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
