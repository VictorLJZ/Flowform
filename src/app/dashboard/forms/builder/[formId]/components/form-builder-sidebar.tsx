"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChevronLeft, ChevronRight, PlusCircle } from "lucide-react"

type BlockType = {
  id: string
  icon: React.ReactNode
  name: string
  description: string
}

const STATIC_BLOCKS: BlockType[] = [
  {
    id: "short-text",
    icon: <span className="text-lg">Aa</span>,
    name: "Short Text",
    description: "Short answer text field for brief responses"
  },
  {
    id: "long-text",
    icon: <span className="text-lg">¶</span>,
    name: "Long Text",
    description: "Paragraph text for longer responses"
  },
  {
    id: "multiple-choice",
    icon: <span className="text-lg">○</span>,
    name: "Multiple Choice",
    description: "Single selection from multiple options"
  },
  {
    id: "checkbox",
    icon: <span className="text-lg">☑</span>,
    name: "Checkbox",
    description: "Multiple selection from options"
  },
  {
    id: "dropdown",
    icon: <span className="text-lg">▼</span>,
    name: "Dropdown",
    description: "Selection from a dropdown menu"
  },
  {
    id: "email",
    icon: <span className="text-lg">@</span>,
    name: "Email",
    description: "Email address input field"
  },
  {
    id: "number",
    icon: <span className="text-lg">#</span>,
    name: "Number",
    description: "Numeric input field"
  },
  {
    id: "date",
    icon: <span className="text-lg">📅</span>,
    name: "Date",
    description: "Date selector"
  }
]

const DYNAMIC_BLOCKS: BlockType[] = [
  {
    id: "ai-conversation",
    icon: <span className="text-lg">💬</span>,
    name: "AI Conversation",
    description: "Dynamic AI-powered conversation"
  }
]

interface FormBuilderSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export default function FormBuilderSidebar({ isOpen, onToggle }: FormBuilderSidebarProps) {
  return (
    <div className={`border-r bg-background ${isOpen ? "w-72" : "w-16"} transition-width duration-300 ease-in-out flex flex-col`}>
      <div className="flex items-center justify-between p-4 border-b">
        {isOpen && <span className="font-medium">Block Types</span>}
        <Button variant="ghost" size="icon" onClick={onToggle} className={isOpen ? "ml-auto" : "mx-auto"}>
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {isOpen ? (
            <>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-2 px-2">Static Blocks</h4>
                <div className="space-y-1">
                  {STATIC_BLOCKS.map((block) => (
                    <Button 
                      key={block.id}
                      variant="ghost" 
                      className="w-full justify-start text-left h-auto py-2"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("application/json", JSON.stringify({
                          id: block.id,
                          type: "static"
                        }))
                      }}
                    >
                      <div className="mr-2 w-6 h-6 flex items-center justify-center">
                        {block.icon}
                      </div>
                      <div>
                        <div className="font-medium">{block.name}</div>
                        <div className="text-xs text-muted-foreground">{block.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 px-2">Dynamic Blocks</h4>
                <div className="space-y-1">
                  {DYNAMIC_BLOCKS.map((block) => (
                    <Button 
                      key={block.id}
                      variant="ghost" 
                      className="w-full justify-start text-left h-auto py-2"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("application/json", JSON.stringify({
                          id: block.id,
                          type: "dynamic"
                        }))
                      }}
                    >
                      <div className="mr-2 w-6 h-6 flex items-center justify-center">
                        {block.icon}
                      </div>
                      <div>
                        <div className="font-medium">{block.name}</div>
                        <div className="text-xs text-muted-foreground">{block.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-4 mt-2">
              <TooltipProvider>
                {STATIC_BLOCKS.map((block) => (
                  <Tooltip key={block.id}>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("application/json", JSON.stringify({
                            id: block.id,
                            type: "static"
                          }))
                        }}
                      >
                        {block.icon}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{block.name}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("application/json", JSON.stringify({
                          id: "ai-conversation",
                          type: "dynamic"
                        }))
                      }}
                    >
                      <span className="text-lg">💬</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>AI Conversation</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary" size={isOpen ? "default" : "icon"} className="w-full">
                <PlusCircle size={18} className="mr-2" />
                {isOpen && "Add Block"}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Add Block</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
