"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings2, LayoutGrid, Wrench, Sparkles, Code, Hash, Trash2 } from "lucide-react"
import { useFormBuilderStore, useCurrentBlockDefinition } from "@/stores/formBuilderStore"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

export default function FormBuilderSettings() {
  const { 
    getCurrentBlock, 
    updateBlock, 
    updateBlockSettings, 
    removeBlock,
    setCurrentBlockId,
    blocks
  } = useFormBuilderStore()
  
  const currentBlock = getCurrentBlock()
  const blockDefinition = useCurrentBlockDefinition()
  const [selectedTab, setSelectedTab] = useState("settings")
  
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
      <div className="w-80 border-l flex flex-col h-full bg-background">
        <div className="px-4 py-3 border-b">
          <h3 className="font-medium">Block Settings</h3>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-4 text-center">
          <div className="text-muted-foreground">
            <p className="mb-2">No block selected</p>
            <p className="text-sm">Select a block to configure its settings</p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="w-80 border-l flex flex-col h-full bg-background">
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
      
      <Tabs defaultValue="settings" className="flex-1 flex flex-col" onValueChange={setSelectedTab}>
        <div className="px-1 pt-1 border-b">
          <TabsList className="w-full justify-start bg-transparent p-0">
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none px-4 py-2 h-10"
            >
              Settings
            </TabsTrigger>
            <TabsTrigger 
              value="logic" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none px-4 py-2 h-10"
            >
              Logic
            </TabsTrigger>
            <TabsTrigger 
              value="style" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none px-4 py-2 h-10"
            >
              Style
            </TabsTrigger>
          </TabsList>
        </div>
        
        <ScrollArea className="flex-1">
          {/* Settings Tab - Block-specific settings */}
          <TabsContent value="settings" className="m-0 p-4 space-y-6">
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
            
            <Separator />
            
            {/* Block-specific settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center">
                <Wrench size={16} className="mr-2" />
                {blockDefinition.name} Options
              </h4>
              
              {/* Text input fields */}
              {(currentBlock.blockTypeId === 'text_short' || currentBlock.blockTypeId === 'text_long' || currentBlock.blockTypeId === 'email') && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="input-placeholder">Placeholder</Label>
                    <Input 
                      id="input-placeholder" 
                      value={currentBlock.settings.placeholder || ''}
                      onChange={(e) => updateBlockSettings(currentBlock.id, { 
                        placeholder: e.target.value 
                      })}
                    />
                  </div>
                  
                  {currentBlock.blockTypeId === 'text_short' && (
                    <div className="space-y-1.5">
                      <Label htmlFor="max-length">Maximum Length</Label>
                      <Input 
                        id="max-length" 
                        type="number" 
                        value={currentBlock.settings.maxLength || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                          updateBlockSettings(currentBlock.id, { 
                            maxLength: isNaN(value as number) ? undefined : value 
                          })
                        }}
                      />
                    </div>
                  )}
                  
                  {currentBlock.blockTypeId === 'text_long' && (
                    <div className="space-y-1.5">
                      <Label htmlFor="max-rows">Maximum Rows</Label>
                      <Input 
                        id="max-rows" 
                        type="number" 
                        value={currentBlock.settings.maxRows || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                          updateBlockSettings(currentBlock.id, { 
                            maxRows: isNaN(value as number) ? undefined : value 
                          })
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
              
              {/* Number field */}
              {currentBlock.blockTypeId === 'number' && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="number-placeholder">Placeholder</Label>
                    <Input 
                      id="number-placeholder" 
                      value={currentBlock.settings.placeholder || ''}
                      onChange={(e) => updateBlockSettings(currentBlock.id, { 
                        placeholder: e.target.value 
                      })}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="min-value">Minimum Value</Label>
                    <Input 
                      id="min-value" 
                      type="number" 
                      value={currentBlock.settings.min ?? ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                        updateBlockSettings(currentBlock.id, { 
                          min: isNaN(value as number) ? undefined : value 
                        })
                      }}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="max-value">Maximum Value</Label>
                    <Input 
                      id="max-value" 
                      type="number" 
                      value={currentBlock.settings.max ?? ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                        updateBlockSettings(currentBlock.id, { 
                          max: isNaN(value as number) ? undefined : value 
                        })
                      }}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="step-value">Step</Label>
                    <Input 
                      id="step-value" 
                      type="number" 
                      value={currentBlock.settings.step || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                        updateBlockSettings(currentBlock.id, { 
                          step: isNaN(value as number) ? undefined : value 
                        })
                      }}
                    />
                  </div>
                </div>
              )}
              
              {/* Choice fields */}
              {(currentBlock.blockTypeId === 'multiple_choice' || currentBlock.blockTypeId === 'checkbox_group' || currentBlock.blockTypeId === 'dropdown') && (
                <div className="space-y-3">
                  <h5 className="text-xs text-muted-foreground font-medium uppercase">Options</h5>
                  
                  <div className="space-y-2">
                    {currentBlock.settings.options?.map((option: any, index: number) => (
                      <div key={option.id} className="flex items-center gap-2">
                        <Input 
                          value={option.label}
                          onChange={(e) => {
                            const updatedOptions = [...currentBlock.settings.options]
                            updatedOptions[index] = { ...option, label: e.target.value }
                            updateBlockSettings(currentBlock.id, { options: updatedOptions })
                          }}
                          className="flex-1"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            const updatedOptions = currentBlock.settings.options.filter(
                              (_: any, i: number) => i !== index
                            )
                            updateBlockSettings(currentBlock.id, { options: updatedOptions })
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
                        label: `Option ${(currentBlock.settings.options?.length || 0) + 1}` 
                      }
                      const updatedOptions = [...(currentBlock.settings.options || []), newOption]
                      updateBlockSettings(currentBlock.id, { options: updatedOptions })
                    }}
                  >
                    Add Option
                  </Button>
                  
                  {currentBlock.blockTypeId === 'checkbox_group' && (
                    <div className="pt-2 space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="min-selected">Minimum Selected</Label>
                        <Input 
                          id="min-selected" 
                          type="number" 
                          value={currentBlock.settings.minSelected ?? ''}
                          onChange={(e) => {
                            const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                            updateBlockSettings(currentBlock.id, { 
                              minSelected: isNaN(value as number) ? undefined : value 
                            })
                          }}
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label htmlFor="max-selected">Maximum Selected</Label>
                        <Input 
                          id="max-selected" 
                          type="number" 
                          value={currentBlock.settings.maxSelected ?? ''}
                          onChange={(e) => {
                            const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                            updateBlockSettings(currentBlock.id, { 
                              maxSelected: isNaN(value as number) ? undefined : value 
                            })
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* AI Conversation */}
              {currentBlock.blockTypeId === 'ai_conversation' && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="starting-prompt">Starting Prompt</Label>
                    <Textarea 
                      id="starting-prompt" 
                      value={currentBlock.settings.startingPrompt || ''}
                      onChange={(e) => updateBlockSettings(currentBlock.id, { 
                        startingPrompt: e.target.value 
                      })}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This is the initial message the AI will use to start the conversation.
                    </p>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="context-instructions">AI Instructions</Label>
                    <Textarea 
                      id="context-instructions" 
                      value={currentBlock.settings.contextInstructions || ''}
                      onChange={(e) => updateBlockSettings(currentBlock.id, { 
                        contextInstructions: e.target.value 
                      })}
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
                        defaultValue={[currentBlock.settings.temperature || 0.7]} 
                        onValueChange={(value) => updateBlockSettings(currentBlock.id, { 
                          temperature: value[0] 
                        })}
                        className="flex-1"
                      />
                      <span className="text-sm w-10 text-right">
                        {(currentBlock.settings.temperature || 0.7).toFixed(1)}
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
                      value={currentBlock.settings.maxQuestions || 5}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 5 : parseInt(e.target.value);
                        updateBlockSettings(currentBlock.id, { 
                          maxQuestions: isNaN(value) ? 5 : value 
                        });
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
          
          {/* Logic Tab */}
          <TabsContent value="logic" className="m-0 p-4 space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center">
                <Code size={16} className="mr-2" />
                Conditional Logic
              </h4>
              
              <Card className="p-4 flex flex-col items-center justify-center text-center text-muted-foreground">
                <p className="mb-2">Conditional logic coming soon</p>
                <p className="text-xs">Show or hide questions based on previous answers</p>
              </Card>
            </div>
          </TabsContent>
          
          {/* Style Tab */}
          <TabsContent value="style" className="m-0 p-4 space-y-6">
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
        </ScrollArea>
      </Tabs>
    </div>
  )
}
