"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { PlusCircle, ChevronLeft, ChevronRight, Trash2, Pencil, Check } from "lucide-react"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { getBlockDefinition } from "@/registry/blockRegistry"
import type { FormBlock, BlockDefinition } from '@/types/block-types'
import { cn } from "@/lib/utils"
import { useAutosave } from "@/services/form/autosaveForm"
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { BlockPill } from "./block-pill"

// Using centralized block colors from block-utils.ts instead of local definition

// Sortable block item component
function SortableBlockItem({ block, index, isSelected, blockDef }: { 
  block: FormBlock;
  index: number; 
  isSelected: boolean,
  blockDef: BlockDefinition | null
}) {
  const { 
    setCurrentBlockId,
    removeBlock, 
    sidebarOpen 
  } = useFormBuilderStore()
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: block.id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 1
  }
  
  // We no longer need the Icon component since we're using BlockPill
  
  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-md mb-1 transition-colors",
        isSelected 
          ? "bg-primary/10 text-primary" 
          : "hover:bg-accent",
        !sidebarOpen && "flex justify-center",
        isDragging && "outline outline-2 outline-primary/30 shadow-md",
        "cursor-grab active:cursor-grabbing"
      )}
      onClick={() => setCurrentBlockId(block.id)}
      {...attributes}
      {...listeners}
    >
      <div className={cn(
        "flex items-center gap-2",
        sidebarOpen ? "p-2" : "justify-center p-0"
      )}>

        {/* Using the shared BlockPill component for consistent UI */}
        <BlockPill
          block={block}
          index={index}
          selected={isSelected}
          compact={!sidebarOpen}
        />
        
        {/* Block content (only when sidebar is open) */}
        {sidebarOpen && (
          <div className="flex-1 min-w-0 w-[150px] flex flex-col justify-center">
            <div className="text-sm font-medium truncate">
              {block.title || blockDef?.defaultTitle || 'Untitled Block'}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {blockDef?.name || block.blockTypeId}
            </div>
          </div>
        )}
        
        {/* Action buttons (only when sidebar is open and item is hovered/selected) */}
        {sidebarOpen && (
          <div className={cn(
            "flex-shrink-0 opacity-0 transition-opacity",
            isSelected && "opacity-100",
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
}

export default function FormBuilderSidebar() {
  const { 
    blocks, 
    currentBlockId, 
    sidebarOpen, 
    setSidebarOpen,
    setBlockSelectorOpen,
    formData,
    setFormData,
    reorderBlocks
  } = useFormBuilderStore()
  
  // State for inline editing
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(formData.title || "Untitled Form")
  const titleInputRef = useRef<HTMLInputElement>(null)
  
  // Focus the input when entering edit mode
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [isEditingTitle])
  
  // Get the autosave service
  const autosave = useAutosave()
  
  // Handle saving the title with autosave
  const handleSaveTitle = () => {
    const newTitle = titleValue.trim() || "Untitled Form"
    // Only save if title actually changed
    if (newTitle !== formData.title) {
      setFormData({ title: newTitle })
      // Trigger autosave
      autosave.scheduleAutosave()
    }
    setIsEditingTitle(false)
  }
  
  // Handle key presses in the title input
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveTitle()
    } else if (e.key === "Escape") {
      setTitleValue(formData.title || "Untitled Form")
      setIsEditingTitle(false)
    }
  }

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Minimum drag distance before activation
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  
  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      // Find the index of the dragged item and the drop target
      const oldIndex = blocks.findIndex((block: FormBlock) => block.id === active.id)
      const newIndex = blocks.findIndex((block: FormBlock) => block.id === over.id)
      
      // Call the reorder function from the store
      reorderBlocks(oldIndex, newIndex)
      
      // Trigger autosave after reordering
      autosave.scheduleAutosave()
    }
  }

  return (
    <div className={cn(
      "bg-card border-r transition-all duration-200 flex flex-col overflow-hidden",
      sidebarOpen ? "w-72" : "w-[56px]"
    )}>
      {/* Sidebar header */}
      <div className={cn(
        "flex items-center border-b",
        sidebarOpen 
          ? "justify-between pl-4 pr-2.5 py-2.5" 
          : "justify-center py-2.5"
      )}>
        {sidebarOpen && <span className="font-medium">Form Blocks</span>}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setSidebarOpen(!sidebarOpen)} 
          className={sidebarOpen ? "ml-auto" : ""}
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </Button>
      </div>

      {/* Form title - with inline editing */}
      {sidebarOpen && (
        <div className="px-4 py-3 border-b">
          {isEditingTitle ? (
            <div className="flex items-center gap-1">
              <Input
                ref={titleInputRef}
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={handleTitleKeyDown}
                className="h-7 text-sm py-0 px-2"
                autoComplete="off"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleSaveTitle}
              >
                <Check size={14} className="text-primary" />
              </Button>
            </div>
          ) : (
            <div 
              className="flex items-center group cursor-pointer" 
              onClick={() => {
                setIsEditingTitle(true)
                setTitleValue(formData.title || "Untitled Form")
              }}
            >
              <div className="text-sm font-medium truncate flex-1">
                {formData.title || "Untitled Form"}
              </div>
              <Pencil size={12} className="ml-1 opacity-0 group-hover:opacity-60 text-muted-foreground" />
            </div>
          )}
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={blocks.map((block: FormBlock) => block.id)}
                strategy={verticalListSortingStrategy}
              >
                {blocks.map((block: FormBlock, index: number) => {
                  // Get the block definition for additional info
                  const blockDef = getBlockDefinition(block.blockTypeId)
                  const isSelected = block.id === currentBlockId
                  
                  return (
                    <SortableBlockItem
                      key={block.id}
                      block={block}
                      index={index}
                      isSelected={isSelected}
                      blockDef={blockDef ?? null}
                    />
                  )
                })}
              </SortableContext>
            </DndContext>
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
