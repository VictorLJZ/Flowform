"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Trash } from "lucide-react"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import BlockSelectorDialog from "./block-selector-dialog"

type FormBlock = {
  id: string
  type: "static" | "dynamic"
  blockType: string
  title: string
  description?: string
  required: boolean
  order: number
}

export default function FormBuilderContent() {
  const [blocks, setBlocks] = useState<FormBlock[]>([])
  const [formTitle, setFormTitle] = useState("Untitled Form")
  const [activeDragOver, setActiveDragOver] = useState<string | null>(null)
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  const [blockSelectorOpen, setBlockSelectorOpen] = useState(false)

  // Handle drag over for blocks
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    const target = e.currentTarget as HTMLElement
    setActiveDragOver(target.id === "form-content" ? "form-content" : null)
  }

  // Handle dropping a new block
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setActiveDragOver(null)
    
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"))
      addNewBlock(data.id, data.type)
    } catch (error) {
      console.error("Error handling drop:", error)
    }
  }
  
  // Add a new block from the block selector
  const addNewBlock = (blockId: string, blockType: "static" | "dynamic") => {
    const newBlock: FormBlock = {
      id: `block-${Date.now()}`,
      type: blockType,
      blockType: blockId,
      title: blockType === "dynamic" ? "AI Conversation" : getDefaultTitle(blockId),
      description: "",
      required: false,
      order: blocks.length
    }
    
    setBlocks([...blocks, newBlock])
    setSelectedBlock(newBlock.id)
  }

  // Get default title based on block type
  const getDefaultTitle = (blockType: string): string => {
    switch (blockType) {
      case "short-text": return "Short Text Question"
      case "long-text": return "Long Text Question"
      case "multiple-choice": return "Multiple Choice Question"
      case "checkbox": return "Checkbox Question"
      case "dropdown": return "Dropdown Question"
      case "email": return "Email Address"
      case "number": return "Number Input"
      case "date": return "Date Selection"
      default: return "New Question"
    }
  }

  // Remove a block
  const handleRemoveBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id))
    if (selectedBlock === id) {
      setSelectedBlock(null)
    }
  }

  return (
    <div className="flex-1 bg-slate-50 overflow-auto p-6">
      <div className="max-w-3xl mx-auto">
        {/* Form title card */}
        <Card className="mb-8 shadow-sm">
          <CardContent className="p-6">
            <Input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="text-2xl font-semibold border-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Form Title"
            />
          </CardContent>
        </Card>

        {/* Drop zone when no blocks exist */}
        {blocks.length === 0 && (
          <div
            id="form-content"
            className={cn(
              "h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground",
              activeDragOver === "form-content" ? "border-primary bg-primary/5" : "border-slate-300"
            )}
            onDragOver={handleDragOver}
            onDragLeave={() => setActiveDragOver(null)}
            onDrop={handleDrop}
          >
            <div className="text-center p-6">
              <p className="mb-2">Drag and drop blocks here</p>
              <p className="text-sm">or</p>
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => setBlockSelectorOpen(true)}
              >
                <Plus size={16} className="mr-2" /> Add Block
              </Button>
            </div>
          </div>
        )}

        {/* Blocks container */}
        {blocks.length > 0 && (
          <div
            id="form-content"
            className={cn(
              "space-y-6",
              activeDragOver === "form-content" && "pt-6 pb-6 px-4 rounded-lg border-2 border-dashed border-primary bg-primary/5"
            )}
            onDragOver={handleDragOver}
            onDragLeave={() => setActiveDragOver(null)}
            onDrop={handleDrop}
          >
            {blocks.map((block) => (
              <Card 
                key={block.id}
                className={cn(
                  "shadow-sm",
                  selectedBlock === block.id && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedBlock(block.id)}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <Input
                      value={block.title}
                      onChange={(e) => {
                        const updatedBlocks = blocks.map(b => 
                          b.id === block.id ? { ...b, title: e.target.value } : b
                        )
                        setBlocks(updatedBlocks)
                      }}
                      className="text-lg font-medium border-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      placeholder="Question Title"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveBlock(block.id)
                      }}
                    >
                      <Trash size={18} className="text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                  
                  <Textarea
                    value={block.description || ""}
                    onChange={(e) => {
                      const updatedBlocks = blocks.map(b => 
                        b.id === block.id ? { ...b, description: e.target.value } : b
                      )
                      setBlocks(updatedBlocks)
                    }}
                    placeholder="Add description (optional)"
                    className="min-h-8 resize-none border-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm text-muted-foreground"
                  />
                  
                  {/* Dynamic block type rendering based on block.blockType */}
                  <div className="mt-4">
                    {block.blockType === "short-text" && (
                      <Input disabled placeholder="Short text answer" className="max-w-md" />
                    )}
                    
                    {block.blockType === "long-text" && (
                      <Textarea disabled placeholder="Long text answer" className="max-w-md" />
                    )}
                    
                    {block.blockType === "multiple-choice" && (
                      <div className="space-y-2">
                        {[1, 2, 3].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <div className="h-4 w-4 rounded-full border border-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground">Option {option}</span>
                          </div>
                        ))}
                        <Button variant="ghost" size="sm" className="text-primary mt-1">
                          <Plus size={14} className="mr-1" /> Add Option
                        </Button>
                      </div>
                    )}
                    
                    {block.blockType === "checkbox" && (
                      <div className="space-y-2">
                        {[1, 2, 3].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <div className="h-4 w-4 rounded border border-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground">Option {option}</span>
                          </div>
                        ))}
                        <Button variant="ghost" size="sm" className="text-primary mt-1">
                          <Plus size={14} className="mr-1" /> Add Option
                        </Button>
                      </div>
                    )}
                    
                    {block.blockType === "dropdown" && (
                      <div className="max-w-md">
                        <div className="border rounded px-3 py-2 text-muted-foreground">
                          Select an option ▼
                        </div>
                        <Button variant="ghost" size="sm" className="text-primary mt-1">
                          <Plus size={14} className="mr-1" /> Add Option
                        </Button>
                      </div>
                    )}
                    
                    {block.blockType === "email" && (
                      <Input disabled placeholder="email@example.com" className="max-w-md" />
                    )}
                    
                    {block.blockType === "number" && (
                      <Input disabled placeholder="0" type="number" className="max-w-md" />
                    )}
                    
                    {block.blockType === "date" && (
                      <Input disabled placeholder="YYYY-MM-DD" type="date" className="max-w-md" />
                    )}
                    
                    {block.blockType === "ai-conversation" && (
                      <div className="border rounded-lg p-4 bg-primary/5 max-w-xl mt-2">
                        <p className="text-sm font-medium mb-2">AI Conversation Block</p>
                        <p className="text-xs text-muted-foreground mb-2">
                          This block will start an AI-powered conversation with the form respondent.
                        </p>
                        <div className="bg-background rounded p-3 border text-sm">
                          <p className="font-medium">Starter Question:</p>
                          <p className="text-muted-foreground">{block.title || "New conversation"}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Add button when blocks exist */}
        {blocks.length > 0 && (
          <div className="mt-6 text-center">
            <Button 
              variant="outline"
              onClick={() => setBlockSelectorOpen(true)}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 px-4 py-2 has-[>svg]:px-3 mt-2"
            >
              <Plus size={16} /> Add Block
            </Button>
          </div>
        )}
        
        {/* Block Selector Dialog */}
        <BlockSelectorDialog
          open={blockSelectorOpen}
          onOpenChange={setBlockSelectorOpen}
          onSelectBlock={({ id, type }) => addNewBlock(id, type)}
        />
      </div>
    </div>
  )
}
