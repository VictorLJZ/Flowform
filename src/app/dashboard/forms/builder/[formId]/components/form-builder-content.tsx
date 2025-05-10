"use client"

import { Button } from "@/components/ui/button"
import { useAutosave } from "@/services/form/autosaveForm"
import { useEffect } from "react"
import { PlusCircle, ChevronLeft, ChevronRight, Smartphone, Monitor } from "lucide-react"
import { useFormBuilderStore, useCurrentBlockDefinition } from "@/stores/formBuilderStore"
import type { FormBlock } from '@/types/block-types'
import type { BlockPresentation } from '@/types/theme-types'
import type { SlideLayout } from '@/types/layout-types'
// Import block components directly to avoid eager loading AI services
import { TextInputBlock } from "@/components/form/blocks/TextInputBlock"
import { TextAreaBlock } from "@/components/form/blocks/TextAreaBlock"
import { MultipleChoiceBlock } from "@/components/form/blocks/MultipleChoiceBlock"
import { CheckboxGroupBlock } from "@/components/form/blocks/CheckboxGroupBlock"
import { DropdownBlock } from "@/components/form/blocks/DropdownBlock"
import { EmailBlock } from "@/components/form/blocks/EmailBlock"
import { NumberBlock } from "@/components/form/blocks/NumberBlock"
import { DateBlock } from "@/components/form/blocks/DateBlock"
import { AIConversationBlock } from "@/components/form/blocks/AIConversationBlock"


export default function FormBuilderContent() {
  const { 
    blocks, 
    currentBlockId, 
    getCurrentBlock,
    setCurrentBlockId,
    updateBlock,
    updateBlockSettings,
    setBlockSelectorOpen,
    viewportMode,
    setViewportMode,
    loadMediaAssets,
    formData
    // isLoadingMedia - Not currently used
  } = useFormBuilderStore()
  
  // Load media assets from Cloudinary when the component initializes
  useEffect(() => {
    // Only load media assets if we have form data with workspace_id
    if (formData?.workspace_id) {
      loadMediaAssets(formData.workspace_id).catch(error => {
        console.error('Error loading media assets:', error);
      });
    }
  }, [loadMediaAssets, formData?.workspace_id]);
  
  const currentBlock = getCurrentBlock()
  
  const blockDefinition = useCurrentBlockDefinition()
  const autosave = useAutosave()
  
  const goToBlock = (direction: 'prev' | 'next') => {
    if (!currentBlockId || blocks.length === 0) return
    
    const currentIndex = blocks.findIndex((block: FormBlock) => block.id === currentBlockId)
    if (currentIndex === -1) return
    
    if (direction === 'prev' && currentIndex > 0) {
      setCurrentBlockId(blocks[currentIndex - 1].id)
    } else if (direction === 'next' && currentIndex < blocks.length - 1) {
      setCurrentBlockId(blocks[currentIndex + 1].id)
    }
  }
  
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
  
  const currentIndex = blocks.findIndex((block: FormBlock) => block.id === currentBlockId)
  
  return (
    <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden">
      <div className="p-2 flex justify-between items-center flex-shrink-0 sticky top-0 z-10 bg-slate-50">
        {/* Left: Pagination controls */}
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
        
        {/* Center: Viewport mode toggle */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <div className="bg-background/80 rounded-full px-1.5 py-1 flex items-center shadow-sm">
            <div className="border rounded-full flex items-center overflow-hidden h-7">
              <Button
                variant={viewportMode === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 w-7 rounded-full p-0"
                onClick={() => setViewportMode('desktop')}
                title="Desktop view"
              >
                <Monitor size={14} />
              </Button>
              <Button
                variant={viewportMode === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 w-7 rounded-full p-0"
                onClick={() => setViewportMode('mobile')}
                title="Mobile view"
              >
                <Smartphone size={14} />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Right: Block name */}
        <div className="bg-background/80 rounded-full px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
          {blockDefinition.name}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto flex items-center px-4">
        <div className="w-full min-h-fit py-4">
          <div className="relative w-full mx-auto" style={{ maxWidth: '1200px', paddingTop: 'min(56.25%, calc(100vh - 10rem))' }}>
            <div className="absolute top-0 left-0 w-full h-full">
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
                    if (updates.title || updates.description) {
                      updateBlock(currentBlock.id, updates as Partial<FormBlock>);
                    }
                    if (updates.settings) {
                      updateBlockSettings(currentBlock.id, updates.settings);
                    }
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
                      updateBlock(currentBlock.id, updates as Partial<FormBlock>);
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
                      updateBlock(currentBlock.id, updates as Partial<FormBlock>);
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
                      updateBlock(currentBlock.id, updates as Partial<FormBlock>);
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
                      updateBlock(currentBlock.id, updates as Partial<FormBlock>);
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
                      updateBlock(currentBlock.id, updates as Partial<FormBlock>);
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
                      updateBlock(currentBlock.id, updates as Partial<FormBlock>);
                    }
                    if (updates.settings) {
                      updateBlockSettings(currentBlock.id, updates.settings);
                    }
                    autosave.scheduleAutosave();
                  }}
                />
              )}
                    {currentBlock.blockTypeId === 'date' && (
                <DateBlock
                  id={currentBlock.id}
                  title={currentBlock.title}
                  description={currentBlock.description}
                  required={currentBlock.required}
                  index={currentIndex}
                  totalBlocks={blocks.length}
                  settings={currentBlock.settings}
                  onUpdate={(updates) => {
                    if (updates.title || updates.description) {
                      updateBlock(currentBlock.id, updates as Partial<FormBlock>);
                    }
                    if (updates.settings) {
                      updateBlockSettings(currentBlock.id, updates.settings);
                    }
                    autosave.scheduleAutosave();
                  }}
                />
              )}
              

              
              {(currentBlock.blockTypeId === 'ai_conversation' || 
                currentBlock.blockTypeId === 'dynamic' || 
                currentBlock.type === 'dynamic') && (
                <AIConversationBlock
                  id={currentBlock.id}
                  title={currentBlock.title}
                  description={currentBlock.description}
                  required={currentBlock.required}
                  index={blocks.findIndex(b => b.id === currentBlock.id) + 1}
                  totalBlocks={blocks.length}
                  // Pass these values as separate props (they are defined in the interface)
                  maxQuestions={(currentBlock.settings?.maxQuestions as number) || 5}
                  temperature={(currentBlock.settings?.temperature as number) || 0.7}
                  // Only pass presentation and layout in the settings object as per interface
                  settings={{
                    presentation: currentBlock.settings?.presentation ? 
                      currentBlock.settings.presentation as BlockPresentation : 
                      {
                        layout: 'centered',  // Using valid values from BlockPresentation
                        spacing: 'normal',    // Using valid values from BlockPresentation
                        titleSize: 'large'    // Using valid values from BlockPresentation
                      },
                    layout: currentBlock.settings?.layout ? 
                      currentBlock.settings.layout as SlideLayout : 
                      { type: 'standard' } as SlideLayout
                  }}
                  // Add sample data for the builder preview
                  value={[
                    {
                      question: currentBlock.title, 
                      answer: "This is a sample answer in the form builder preview.", 
                      timestamp: new Date().toISOString(),
                      is_starter: true
                    }
                  ]}
                  onChange={() => {
                    // This is just a preview in the builder, no real changes needed
                  }}
                  onUpdate={(updates) => {

                    if (updates.title || updates.description) {
                      updateBlock(currentBlock.id, updates as Partial<FormBlock>);
                    }
                    if (updates.settings) {
                      updateBlockSettings(currentBlock.id, updates.settings);
                    }
                    autosave.scheduleAutosave();
                  }}
                  onNext={() => {

                    // This is just a preview, so no actual navigation is needed
                  }}
                  isNextDisabled={false}
                  responseId=""
                  formId=""
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
