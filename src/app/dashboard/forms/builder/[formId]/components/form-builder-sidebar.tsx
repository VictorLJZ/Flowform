"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle, ChevronLeft, ChevronRight, GripVertical, Trash2 } from "lucide-react"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { getBlockDefinition } from "@/registry/blockRegistry"
import { cn } from "@/lib/utils"

export default function FormBuilderSidebar() {
  const { 
    blocks, 
    currentBlockId, 
    setCurrentBlockId, 
    sidebarOpen, 
    setSidebarOpen,
    setBlockSelectorOpen,
    formData,
    removeBlock
  } = useFormBuilderStore()
  
  // Local state for drag and drop (future implementation)
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null)

  return (
    <div className={cn(
      "border-r bg-background transition-all duration-300 ease-in-out flex flex-col h-full",
      sidebarOpen ? "w-72" : "w-16"
    )}>
      {/* Sidebar header */}
      <div className="flex items-center justify-between p-4 border-b">
        {sidebarOpen && <span className="font-medium">Form Blocks</span>}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setSidebarOpen(!sidebarOpen)} 
          className={sidebarOpen ? "ml-auto" : "mx-auto"}
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </Button>
      </div>

      {/* Form title */}
      {sidebarOpen && (
        <div className="px-4 py-3 border-b">
          <div className="text-sm font-medium truncate">{formData.title || "Untitled Form"}</div>
          {formData.description && (
            <div className="text-xs text-muted-foreground truncate mt-1">
              {formData.description}
            </div>
          )}
        </div>
      )}

      {/* Block list */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {blocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground p-4">
              {sidebarOpen ? (
                <>
                  <p className="text-sm">No blocks yet</p>
                  <p className="text-xs mt-1">Add blocks to start building your form</p>
                </>
              ) : (
                <p className="text-xs">Empty</p>
              )}
            </div>
          ) : (
            blocks.map((block, index) => {
              // Get the block definition for additional info
              const blockDef = getBlockDefinition(block.blockTypeId)
              const Icon = blockDef.icon
              const isSelected = block.id === currentBlockId
              
              return (
                <div 
                  key={block.id}
                  className={cn(
                    "group relative rounded-md mb-1 transition-colors",
                    isSelected 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-accent",
                    !sidebarOpen && "flex justify-center"
                  )}
                  onClick={() => setCurrentBlockId(block.id)}
                >
                  {/* Block item with drag handle and number */}
                  <div className={cn(
                    "flex items-start gap-2 p-2 cursor-pointer",
                    !sidebarOpen && "justify-center p-1"
                  )}>
                    {/* Block number */}
                    {sidebarOpen && (
                      <div className="flex-shrink-0 flex items-center">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                      </div>
                    )}
                    
                    {/* Block icon */}
                    <div className="flex-shrink-0 flex items-center">
                      <Icon size={sidebarOpen ? 16 : 20} className="text-muted-foreground" />
                    </div>
                    
                    {/* Block content (only when sidebar is open) */}
                    {sidebarOpen && (
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {block.title || blockDef.defaultTitle}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {blockDef.name}
                        </div>
                      </div>
                    )}
                    
                    {/* Action buttons (only when sidebar is open and item is hovered/selected) */}
                    {sidebarOpen && (
                      <div className={cn(
                        "flex-shrink-0 opacity-0 transition-opacity",
                        (isSelected || draggedBlockId === block.id) && "opacity-100",
                        "group-hover:opacity-100"
                      )}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm("Are you sure you want to delete this block?")) {
                              removeBlock(block.id)
                            }
                          }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>

      {/* Add block button */}
      <div className="p-3 border-t">
        <Button 
          variant="secondary" 
          size={sidebarOpen ? "default" : "icon"} 
          className="w-full"
          onClick={() => setBlockSelectorOpen(true)}
        >
          <PlusCircle size={18} className={sidebarOpen ? "mr-2" : ""} />
          {sidebarOpen && "Add Block"}
        </Button>
      </div>
    </div>
  )
}
