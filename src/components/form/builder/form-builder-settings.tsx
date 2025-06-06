"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings2, Wrench, Sparkles, Trash2, Columns } from "lucide-react"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { useCurrentBlockDefinition } from "@/hooks/useCurrentBlockDefinition"
import { Card } from "@/components/ui/card"
import { BlockLayoutSettings } from "@/components/form/settings/BlockLayoutSettings"
import { SlideLayout } from "@/types/layout-types"

export default function FormBuilderSettings() {
  const { 
    getCurrentBlock, 
    updateBlock, 
    updateBlockSettings, 
    removeBlock,
    setCurrentBlockId,
    blocks
    // viewportMode - Not currently used
  } = useFormBuilderStore()
  
  const currentBlock = getCurrentBlock()
  // Ensure settings is always an object
  const blockSettings = currentBlock?.settings || {}
  const blockDefinition = useCurrentBlockDefinition()
  const [, setSelectedTab] = useState("settings") // Using just setSelectedTab for tab switching
  
  // Handle block deletion with confirmation
  const handleDeleteBlock = () => {
    if (!currentBlock) return
    
    if (confirm(`Are you sure you want to delete this ${blockDefinition?.name || 'block'}?`)) {
      // Find the previous block to select after deletion
      const currentIndex = blocks.findIndex(b => b.id === currentBlock.id)
      const prevBlockId = currentIndex > 0 ? blocks[currentIndex - 1].id : 
                          blocks.length > 1 ? blocks[currentIndex + 1].id : null
      
      removeBlock(currentBlock.id)
      setCurrentBlockId(prevBlockId)
    }
  }
  
  // If no block is selected, show empty state
  if (!currentBlock || !blockDefinition) {
    return (
      <aside className="w-[320px] border-l bg-card flex flex-col h-full overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h3 className="font-medium">Block Settings</h3>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-4 text-center">
          <div className="text-muted-foreground">
            <p className="mb-2">No block selected</p>
            <p className="text-sm">Select a block to configure its settings</p>
          </div>
        </div>
      </aside>
    )
  }
  
  return (
    <aside className="w-[320px] border-l bg-card flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h3 className="font-medium">{blockDefinition.name} Settings</h3>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleDeleteBlock}
          className="h-8 w-8 text-destructive hover:text-destructive"
        >
          <Trash2 size={16} />
        </Button>
      </div>
      
      <Tabs defaultValue="settings" className="flex-1 flex flex-col h-full" onValueChange={setSelectedTab}>
        <div className="px-1 pt-1 border-b flex-shrink-0">
          <TabsList className="w-full justify-start bg-transparent p-0">
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none px-4 py-2 h-10"
            >
              Settings
            </TabsTrigger>
            
            <TabsTrigger 
              value="layout" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none px-4 py-2 h-10"
            >
              Layout
            </TabsTrigger>
            
            <TabsTrigger 
              value="style" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none px-4 py-2 h-10"
            >
              Style
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex-1 flex flex-col relative">
          {/* Settings Tab - Block-specific settings */}
          <TabsContent value="settings" className="absolute inset-0 overflow-y-auto minimal-scrollbar m-0 p-4 space-y-6">
            {/* Common settings for all blocks */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center">
                <Settings2 size={16} className="mr-2" />
                General
              </h4>
              
              <div className="space-y-1.5">
                <Label htmlFor="block-title">Question</Label>
                <Input 
                  id="block-title" 
                  value={currentBlock.title}
                  onChange={(e) => updateBlock(currentBlock.id, { title: e.target.value })}
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="block-description">Description</Label>
                <Textarea 
                  id="block-description" 
                  placeholder="Add a description (optional)"
                  value={currentBlock.description || ''}
                  onChange={(e) => updateBlock(currentBlock.id, { description: e.target.value })}
                  rows={2}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="block-required">Required</Label>
                  <div className="text-xs text-muted-foreground">
                    Make this field mandatory
                  </div>
                </div>
                <Switch 
                  id="block-required" 
                  checked={currentBlock.required}
                  onCheckedChange={(checked) => updateBlock(currentBlock.id, { required: checked })}
                />
              </div>
            </div>
            

            
            {/* Block-specific settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center">
                <Wrench size={16} className="mr-2" />
                {blockDefinition.name} Options
              </h4>
              
              {/* Text input fields */}
              {(currentBlock.subtype === 'short_text' || currentBlock.subtype === 'long_text' || currentBlock.subtype === 'email') && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="input-placeholder">Placeholder</Label>
                    <Input 
                      id="input-placeholder" 
                      value={(blockSettings as { placeholder: string }).placeholder || ''}
                      onChange={(e) => updateBlockSettings(currentBlock.id, { 
                        placeholder: e.target.value 
                      } as Record<string, unknown>)}
                    />
                  </div>
                  
                  {currentBlock.subtype === 'short_text' && (
                    <div className="space-y-1.5">
                      <Label htmlFor="max-length">Maximum Length</Label>
                      <Input 
                        id="max-length" 
                        type="number" 
                        value={(blockSettings as { maxLength: number }).maxLength || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? null : parseInt(e.target.value);
                          updateBlockSettings(currentBlock.id, { 
                            maxLength: isNaN(value as number) ? null : value 
                          } as Record<string, unknown>)
                        }}
                      />
                    </div>
                  )}
                  
                  {currentBlock.subtype === 'long_text' && (
                    <div className="space-y-1.5">
                      <Label htmlFor="max-rows">Maximum Rows</Label>
                      <Input 
                        id="max-rows" 
                        type="number" 
                        value={(blockSettings as { rows: number }).rows || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? null : parseInt(e.target.value);
                          updateBlockSettings(currentBlock.id, { 
                            rows: isNaN(value as number) ? null : value 
                          } as Record<string, unknown>)
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
              
              {/* Number field */}
              {currentBlock.subtype === 'number' && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="number-placeholder">Placeholder</Label>
                    <Input 
                      id="number-placeholder" 
                      value={(blockSettings as { placeholder: string }).placeholder || ''}
                      onChange={(e) => updateBlockSettings(currentBlock.id, { 
                        placeholder: e.target.value 
                      } as Record<string, unknown>)}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="min-value">Minimum Value</Label>
                    <Input 
                      id="min-value" 
                      type="number" 
                      value={(blockSettings as { min: number }).min || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? null : parseInt(e.target.value);
                        updateBlockSettings(currentBlock.id, { 
                          min: isNaN(value as number) ? null : value 
                        } as Record<string, unknown>)
                      }}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="max-value">Maximum Value</Label>
                    <Input 
                      id="max-value" 
                      type="number" 
                      value={(blockSettings as { max: number }).max || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? null : parseInt(e.target.value);
                        updateBlockSettings(currentBlock.id, { 
                          max: isNaN(value as number) ? null : value 
                        } as Record<string, unknown>)
                      }}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="step-value">Step</Label>
                    <Input 
                      id="step-value" 
                      type="number" 
                      value={(blockSettings as { step: number }).step || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? null : parseFloat(e.target.value);
                        updateBlockSettings(currentBlock.id, { 
                          step: isNaN(value as number) ? null : value 
                        } as Record<string, unknown>)
                      }}
                    />
                  </div>
                </div>
              )}
              
              {/* Choice fields */}
              {(currentBlock.subtype === 'multiple_choice' || currentBlock.subtype === 'checkbox_group' || currentBlock.subtype === 'dropdown') && (
                <div className="space-y-3">
                  <h5 className="text-xs text-muted-foreground font-medium uppercase">Options</h5>
                  
                  <div className="space-y-2">
                    {(blockSettings as { options: Array<{ id: string; label: string; value: string }> }).options?.map((option, index) => (
                      <div key={option.id} className="flex items-center gap-2">
                        <Input 
                          value={option.label}
                          onChange={(e) => {
                            const updatedOptions = [...(blockSettings as { options: Array<{ id: string; label: string; value: string }> }).options || []]
                            updatedOptions[index] = { ...option, label: e.target.value }
                            updateBlockSettings(currentBlock.id, { options: updatedOptions } as Record<string, unknown>)
                          }}
                          className="flex-1"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            const updatedOptions = (blockSettings as { options: Array<{ id: string; label: string; value: string }> }).options?.filter(
                              (_, i) => i !== index
                            )
                            updateBlockSettings(currentBlock.id, { options: updatedOptions } as Record<string, unknown>)
                          }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const newOption = { 
                        id: `option-${Date.now()}`, 
                        label: `Option ${(blockSettings as { options: Array<{ id: string; label: string; value: string }> }).options?.length || 0} + 1` 
                      }
                      const updatedOptions = [...((blockSettings as { options: Array<{ id: string; label: string; value: string }> }).options || []), newOption]
                      updateBlockSettings(currentBlock.id, { options: updatedOptions } as Record<string, unknown>)
                    }}
                  >
                    Add Option
                  </Button>
                  
                  {currentBlock.subtype === 'checkbox_group' && (
                    <div className="pt-2 space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="min-selected">Minimum Selected</Label>
                        <Input 
                          id="min-selected" 
                          type="number" 
                          value={(blockSettings as { minSelected: number }).minSelected || ''}
                          onChange={(e) => {
                            const value = e.target.value === '' ? null : parseInt(e.target.value);
                            updateBlockSettings(currentBlock.id, { 
                              minSelected: isNaN(value as number) ? null : value 
                            } as Record<string, unknown>)
                          }}
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label htmlFor="max-selected">Maximum Selected</Label>
                        <Input 
                          id="max-selected" 
                          type="number" 
                          value={(blockSettings as { maxSelected: number }).maxSelected || ''}
                          onChange={(e) => {
                            const value = e.target.value === '' ? null : parseInt(e.target.value);
                            updateBlockSettings(currentBlock.id, { 
                              maxSelected: isNaN(value as number) ? null : value 
                            } as Record<string, unknown>)
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* AI Conversation */}
              {currentBlock.subtype === 'ai_conversation' && (
                <div className="space-y-3">
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="context-instructions">AI Instructions</Label>
                    <Textarea 
                      id="context-instructions" 
                      value={(blockSettings as { contextInstructions: string }).contextInstructions || ''}
                      onChange={(e) => updateBlockSettings(currentBlock.id, { 
                        contextInstructions: e.target.value 
                      } as Record<string, unknown>)}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Additional context for the AI about how to respond.
                    </p>
                  </div>

                  {/* Temperature Setting */}
                  <div className="space-y-1.5">
                    <Label htmlFor="temperature">Temperature</Label>
                    <div className="flex items-center gap-4">
                      <Slider 
                        id="temperature"
                        min={0} 
                        max={1} 
                        step={0.1} 
                        defaultValue={[(blockSettings as { temperature: number }).temperature || 0.7]} 
                        onValueChange={(value) => updateBlockSettings(currentBlock.id, { 
                          temperature: value[0]
                        } as Record<string, unknown>)}
                        className="flex-1"
                      />
                      <span className="text-sm w-10 text-right">
                        {((blockSettings as { temperature: number }).temperature || 0.7).toFixed(1)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Controls creativity: lower for consistent answers, higher for more variety
                    </p>
                  </div>

                  {/* Max Questions Setting */}
                  <div className="space-y-1.5">
                    <Label htmlFor="maxQuestions">Maximum Questions</Label>
                    <Input 
                      id="maxQuestions"
                      type="number" 
                      min={1} 
                      max={10}
                      value={(blockSettings as { maxQuestions: number }).maxQuestions || 5}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 5 : parseInt(e.target.value);
                        updateBlockSettings(currentBlock.id, { 
                          maxQuestions: value
                        } as Record<string, unknown>)
                      }}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Maximum number of follow-up questions in the conversation
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          

          
          {/* Layout Tab */}
          <TabsContent value="layout" className="absolute inset-0 overflow-y-auto minimal-scrollbar m-0 p-4 space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center">
                <Columns size={16} className="mr-2" />
                Block Layout
              </h4>
              
              {/* Block layout settings component */}
              <BlockLayoutSettings 
                blockId={currentBlock.id}
                currentLayout={(blockSettings.layout as SlideLayout | undefined)}
              />
            </div>
          </TabsContent>
          
          {/* Style Tab */}
          <TabsContent value="style" className="absolute inset-0 overflow-y-auto minimal-scrollbar m-0 p-4 space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center">
                <Sparkles size={16} className="mr-2" />
                Appearance
              </h4>
              
              <Card className="p-4 flex flex-col items-center justify-center text-center text-muted-foreground">
                <p className="mb-2">Block styling coming soon</p>
                <p className="text-xs">Customize the appearance of this block</p>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </aside>
  )
}
