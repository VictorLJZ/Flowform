"use client"

import { Button } from "@/components/ui/button"
import { useAutosave } from "@/services/form/autosaveForm"
import { PlusCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { useFormBuilderStore, useCurrentBlockDefinition } from "@/stores/formBuilderStore"
// Import block components directly to avoid eager loading AI services
import { TextInputBlock } from "@/components/form/blocks/TextInputBlock"
import { TextAreaBlock } from "@/components/form/blocks/TextAreaBlock"
import { MultipleChoiceBlock } from "@/components/form/blocks/MultipleChoiceBlock"
import { CheckboxGroupBlock } from "@/components/form/blocks/CheckboxGroupBlock"
import { DropdownBlock } from "@/components/form/blocks/DropdownBlock"
import { EmailBlock } from "@/components/form/blocks/EmailBlock"
import { NumberBlock } from "@/components/form/blocks/NumberBlock"



export default function FormBuilderContent() {
  const { 
    blocks, 
    currentBlockId, 
    getCurrentBlock,
    setCurrentBlockId,
    updateBlock,
    updateBlockSettings,
    setBlockSelectorOpen
  } = useFormBuilderStore()
  
  const currentBlock = getCurrentBlock()
  const blockDefinition = useCurrentBlockDefinition()
  const autosave = useAutosave()
  
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
    <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden">
      {/* Preview header - fixed at top */}
      <div className="p-2 flex justify-between items-center flex-shrink-0 sticky top-0 z-10 bg-slate-50">
        <div className="bg-background/80 rounded-full px-1.5 py-1 flex items-center space-x-1 shadow-sm">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 rounded-full"
            disabled={currentIndex <= 0}
            onClick={() => goToBlock('prev')}
          >
            <ChevronLeft size={16} />
          </Button>
          
          <div className="text-sm px-1">
            <span className="font-medium">{currentIndex + 1}</span>
            <span className="text-muted-foreground">/{blocks.length}</span>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="h-7 w-7 rounded-full"
            disabled={currentIndex >= blocks.length - 1}
            onClick={() => goToBlock('next')}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
        
        <div className="bg-background/80 rounded-full px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
          {blockDefinition.name}
        </div>
      </div>
      
      {/* Main content - Scrollable container with vertical centering */}
      <div className="flex-1 overflow-auto flex items-center px-4">
        {/* Content centered in scrollable area */}
        <div className="w-full min-h-fit py-4">
          {/* 16:9 aspect ratio wrapper */}
          <div className="relative w-full mx-auto" style={{ maxWidth: '1200px', paddingTop: 'min(56.25%, calc(100vh - 10rem))' }}>
            {/* Block specific components */}
            <div className="absolute top-0 left-0 w-full h-full">
              {/* Render different content based on block type */}
              {currentBlock.blockTypeId === 'short_text' && (
                <TextInputBlock
                  id={currentBlock.id}
                  title={currentBlock.title}
                  description={currentBlock.description}
                  required={currentBlock.required}
                  index={currentIndex}
                  totalBlocks={blocks.length}
                  settings={currentBlock.settings}
                  onUpdate={(updates) => {
                    // Handle updates to block content
                    if (updates.title || updates.description) {
                      updateBlock(currentBlock.id, updates);
                    }
                    // Handle updates to block settings
                    if (updates.settings) {
                      updateBlockSettings(currentBlock.id, updates.settings);
                    }
                    // Trigger autosave when changes are made
                    autosave.scheduleAutosave();
                  }}
                />
              )}
                    
              {currentBlock.blockTypeId === 'long_text' && (
                <TextAreaBlock
                  id={currentBlock.id}
                  title={currentBlock.title}
                  description={currentBlock.description}
                  required={currentBlock.required}
                  index={currentIndex}
                  totalBlocks={blocks.length}
                  settings={currentBlock.settings}
                  onUpdate={(updates) => {
                    if (updates.title || updates.description) {
                      updateBlock(currentBlock.id, updates);
                    }
                    if (updates.settings) {
                      updateBlockSettings(currentBlock.id, updates.settings);
                    }
                    autosave.scheduleAutosave();
                  }}
                />
              )}
                    
                    {currentBlock.blockTypeId === 'multiple_choice' && (
                <MultipleChoiceBlock
                  id={currentBlock.id}
                  title={currentBlock.title}
                  description={currentBlock.description}
                  required={currentBlock.required}
                  index={currentIndex}
                  totalBlocks={blocks.length}
                  settings={currentBlock.settings}
                  onUpdate={(updates) => {
                    if (updates.title || updates.description) {
                      updateBlock(currentBlock.id, updates);
                    }
                    if (updates.settings) {
                      updateBlockSettings(currentBlock.id, updates.settings);
                    }
                    autosave.scheduleAutosave();
                  }}
                />
              )}
                    
                    {currentBlock.blockTypeId === 'checkbox_group' && (
                <CheckboxGroupBlock
                  id={currentBlock.id}
                  title={currentBlock.title}
                  description={currentBlock.description}
                  required={currentBlock.required}
                  index={currentIndex}
                  totalBlocks={blocks.length}
                  settings={currentBlock.settings}
                  onUpdate={(updates) => {
                    if (updates.title || updates.description) {
                      updateBlock(currentBlock.id, updates);
                    }
                    if (updates.settings) {
                      updateBlockSettings(currentBlock.id, updates.settings);
                    }
                    autosave.scheduleAutosave();
                  }}
                />
              )}
                    
                    {currentBlock.blockTypeId === 'dropdown' && (
                <DropdownBlock
                  id={currentBlock.id}
                  title={currentBlock.title}
                  description={currentBlock.description}
                  required={currentBlock.required}
                  index={currentIndex}
                  totalBlocks={blocks.length}
                  settings={currentBlock.settings}
                  onUpdate={(updates) => {
                    if (updates.title || updates.description) {
                      updateBlock(currentBlock.id, updates);
                    }
                    if (updates.settings) {
                      updateBlockSettings(currentBlock.id, updates.settings);
                    }
                    autosave.scheduleAutosave();
                  }}
                />
              )}
                    
                    {currentBlock.blockTypeId === 'email' && (
                <EmailBlock
                  id={currentBlock.id}
                  title={currentBlock.title}
                  description={currentBlock.description}
                  required={currentBlock.required}
                  index={currentIndex}
                  totalBlocks={blocks.length}
                  settings={currentBlock.settings}
                  onUpdate={(updates) => {
                    if (updates.title || updates.description) {
                      updateBlock(currentBlock.id, updates);
                    }
                    if (updates.settings) {
                      updateBlockSettings(currentBlock.id, updates.settings);
                    }
                    autosave.scheduleAutosave();
                  }}
                />
              )}
                    {currentBlock.blockTypeId === 'number' && (
                <NumberBlock
                  id={currentBlock.id}
                  title={currentBlock.title}
                  description={currentBlock.description}
                  required={currentBlock.required}
                  index={currentIndex}
                  totalBlocks={blocks.length}
                  settings={currentBlock.settings}
                  onUpdate={(updates) => {
                    if (updates.title || updates.description) {
                      updateBlock(currentBlock.id, updates);
                    }
                    if (updates.settings) {
                      updateBlockSettings(currentBlock.id, updates.settings);
                    }
                    autosave.scheduleAutosave();
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

