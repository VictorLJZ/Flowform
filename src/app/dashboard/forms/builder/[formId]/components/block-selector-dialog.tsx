"use client"

import { useState } from "react"
import { Search, Mail, Phone, User, Calendar, Globe, MessageSquare, FileText, CheckSquare, List, BarChart3, Star, FileUp, X, Hash, CreditCard, Image, Send, Monitor, Layers, Bookmark, ArrowUpRight } from "lucide-react"
import { Dialog as DialogComponent, DialogHeader, DialogTitle, DialogClose, DialogPortal, DialogOverlay } from "@/components/ui/dialog"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

// Block type definitions matching what's in the FormBlock type
type BlockCategory = {
  id: string
  name: string
  color: string
  blocks: Block[]
}

type Block = {
  id: string
  type: "static" | "dynamic" | "integration" | "layout"
  name: string
  description: string
  icon: React.ElementType
  isPremium?: boolean
}

interface BlockSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectBlock: (blockData: { id: string; type: "static" | "dynamic" | "integration" | "layout" }) => void
}

export default function BlockSelectorDialog({ 
  open, 
  onOpenChange, 
  onSelectBlock 
}: BlockSelectorDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Block categories and their contained blocks
  const blockCategories: BlockCategory[] = [
    {
      id: "crm",
      name: "Connect to CRM",
      color: "#f97316", // Orange
      blocks: [
        { id: "hubspot", type: "integration", name: "HubSpot", description: "Connect to HubSpot CRM", icon: User },
      ]
    },
    {
      id: "recommended",
      name: "Recommended",
      color: "#3b82f6", // Blue
      blocks: [
        { id: "short-text", type: "static", name: "Short Text", description: "Single line text field", icon: MessageSquare },
        { id: "statement", type: "static", name: "Statement", description: "Display text without input", icon: FileText },
        { id: "multiple-choice", type: "static", name: "Multiple Choice", description: "Select one option", icon: List },
        { id: "email", type: "static", name: "Email", description: "Email address field", icon: Mail },
        { id: "yes-no", type: "static", name: "Yes/No", description: "Binary choice question", icon: CheckSquare },
      ]
    },
    {
      id: "contact-info",
      name: "Contact info",
      color: "#f43f5e", // Pink
      blocks: [
        { id: "contact-info", type: "static", name: "Contact Info", description: "Name, email, etc.", icon: User },
        { id: "email", type: "static", name: "Email", description: "Email address field", icon: Mail },
        { id: "phone-number", type: "static", name: "Phone Number", description: "Phone number field", icon: Phone },
        { id: "address", type: "static", name: "Address", description: "Address field", icon: Globe },
        { id: "website", type: "static", name: "Website", description: "Website URL field", icon: Globe },
      ]
    },
    {
      id: "choice",
      name: "Choice",
      color: "#8b5cf6", // Purple
      blocks: [
        { id: "multiple-choice", type: "static", name: "Multiple Choice", description: "Select one option", icon: List },
        { id: "dropdown", type: "static", name: "Dropdown", description: "Select from dropdown", icon: List },
        { id: "picture-choice", type: "static", name: "Picture Choice", description: "Select with images", icon: Image },
        { id: "yes-no", type: "static", name: "Yes/No", description: "Binary choice question", icon: CheckSquare },
        { id: "legal", type: "static", name: "Legal", description: "Terms agreement", icon: FileText },
        { id: "checkbox", type: "static", name: "Checkbox", description: "Select multiple options", icon: CheckSquare },
      ]
    },
    {
      id: "rating",
      name: "Rating & ranking",
      color: "#22c55e", // Green
      blocks: [
        { id: "nps", type: "static", name: "Net Promoter Score®", description: "NPS survey", icon: BarChart3 },
        { id: "opinion-scale", type: "static", name: "Opinion Scale", description: "Likert scale rating", icon: BarChart3 },
        { id: "rating", type: "static", name: "Rating", description: "Star rating", icon: Star },
        { id: "ranking", type: "static", name: "Ranking", description: "Order by preference", icon: List },
      ]
    },
    {
      id: "payment",
      name: "Payment",
      color: "#0ea5e9", // Sky
      blocks: [
        { id: "payment", type: "integration", name: "Payment", description: "Accept payments", icon: CreditCard },
        { id: "price-selector", type: "static", name: "Price Selector", description: "Choose payment amount", icon: CreditCard },
        { id: "appointment", type: "integration", name: "Appointment", description: "Book meetings", icon: Calendar },
      ]
    },
    {
      id: "media",
      name: "Media",
      color: "#ec4899", // Pink
      blocks: [
        { id: "image", type: "static", name: "Image", description: "Display an image", icon: Image },
        { id: "video", type: "static", name: "Video", description: "Embed a video", icon: Monitor },
        { id: "file-upload", type: "static", name: "File Upload", description: "Allow file uploads", icon: FileUp },
      ]
    },
    {
      id: "layout",
      name: "Layout",
      color: "#6366f1", // Indigo
      blocks: [
        { id: "section-break", type: "layout", name: "Section Break", description: "Add a section divider", icon: Layers },
        { id: "page-break", type: "layout", name: "Page Break", description: "Add a new page", icon: Bookmark },
        { id: "redirect", type: "layout", name: "Redirect", description: "Redirect to URL", icon: ArrowUpRight },
      ]
    },
  ]

  // Filter blocks based on search query
  const filterBlocks = (blocks: Block[]) => {
    if (!searchQuery) return blocks
    const query = searchQuery.toLowerCase()
    return blocks.filter(block => 
      block.name.toLowerCase().includes(query) || 
      block.description.toLowerCase().includes(query)
    )
  }

  // Get all blocks across all categories for search results
  const getAllBlocks = () => {
    return blockCategories.flatMap(category => category.blocks)
  }
  
  // Get category by block ID
  const getCategoryByBlockId = (blockId: string) => {
    return blockCategories.find(category => 
      category.blocks.some(block => block.id === blockId)
    )
  }

  // Handle block selection
  const handleSelectBlock = (block: Block) => {
    onSelectBlock({ id: block.id, type: block.type })
    onOpenChange(false)
  }

  return (
    <DialogComponent open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/50 fixed inset-0" />
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <DialogPrimitive.Content
            className={cn(
              "bg-background rounded-lg border p-6 shadow-lg focus:outline-none w-auto"
            )}
            style={{
              width: 'fit-content',
              maxWidth: '95vw',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative' /* Ensure absolute positioning of children works */
            }}
        >
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted/20 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
          
          <DialogHeader className="border-b pb-4 px-0 -mt-1">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">Add form elements</DialogTitle>
            </div>
          </DialogHeader>

          <div className="pt-2 pb-4 flex">
            {/* Left Column with Search and First Two Categories */}
            <div className="flex flex-col gap-6 mr-6 w-[260px]">
              {/* Search Box */}
              <div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search form elements"
                    className="w-full pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Connect to CRM */}
              {!searchQuery && (
                <div>
                  <h3 className="mb-2 text-base font-medium">{blockCategories[0].name}</h3>
                  <div className="flex flex-col gap-1">
                    {blockCategories[0].blocks.map((block) => (
                      <button
                        key={`${block.id}-${block.type}`}
                        className="flex items-center rounded-md border border-muted/30 py-1.5 pl-2 pr-3 text-left hover:bg-muted/20 transition-colors relative" 
                        style={{ width: '200px' }}
                        onClick={() => handleSelectBlock(block)}
                      >
                        <div className="mr-3 rounded-md" style={{ backgroundColor: `${blockCategories[0].color}20`, width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <block.icon className="h-4 w-4" style={{ color: blockCategories[0].color }} />
                        </div>
                        <span className="text-sm font-medium">{block.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended */}
              {!searchQuery && (
                <div>
                  <h3 className="mb-2 text-base font-medium">{blockCategories[1].name}</h3>
                  <div className="flex flex-col gap-1">
                    {blockCategories[1].blocks.map((block) => (
                      <button
                        key={`${block.id}-${block.type}`}
                        className="flex items-center rounded-md border border-muted/30 py-1.5 pl-2 pr-3 text-left hover:bg-muted/20 transition-colors relative" 
                        style={{ width: '200px' }}
                        onClick={() => handleSelectBlock(block)}
                      >
                        <div className="mr-3 rounded-md" style={{ backgroundColor: `${blockCategories[1].color}20`, width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <block.icon className="h-4 w-4" style={{ color: blockCategories[1].color }} />
                        </div>
                        <span className="text-sm font-medium">{block.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results */}
              {searchQuery && (
                <div>
                  <h3 className="mb-4 text-sm font-medium">Search Results</h3>
                  <div className="flex flex-col gap-1">
                    {filterBlocks(getAllBlocks()).map((block) => (
                      <button
                        key={`${block.id}-${block.type}`}
                        className="flex items-center rounded-md border border-muted/30 py-1.5 pl-2 pr-3 text-left hover:bg-muted/20 transition-colors relative" 
                        style={{ width: '200px' }}
                        onClick={() => handleSelectBlock(block)}
                      >
                        <div className="mr-3 rounded-md" style={{ backgroundColor: `${getCategoryByBlockId(block.id)?.color}20`, width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <block.icon className="h-4 w-4" style={{ color: getCategoryByBlockId(block.id)?.color }} />
                        </div>
                        <span className="text-sm font-medium">{block.name}</span>
                      </button>
                    ))}
                  </div>
                  {filterBlocks(getAllBlocks()).length === 0 && (
                    <p className="text-center text-sm text-muted-foreground pt-4">No form elements found matching your search.</p>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Main Categories Grid - 3x2 */}
            {!searchQuery && (
              <div style={{ 
                display: 'grid', 
                gridTemplateRows: 'repeat(2, auto)',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridAutoFlow: 'column', /* This makes it fill by column first */
                gap: '1.5rem', 
                width: 'fit-content' 
              }}>
                {blockCategories.slice(2).map((category) => (
                  <div key={category.id} style={{ width: '100%', margin: 0, padding: 0 }}>
                    <h3 className="mb-2 text-base font-medium">{category.name}</h3>
                    <div className="flex flex-col gap-1">
                      {category.blocks.map((block) => (
                        <button
                          key={`${block.id}-${block.type}`}
                          className="flex items-center rounded-md border border-muted/30 py-1.5 pl-2 pr-3 text-left hover:bg-muted/20 transition-colors relative" 
                          style={{ width: '200px' }}
                          onClick={() => handleSelectBlock(block)}
                        >
                          <div className="mr-3 rounded-md" style={{ backgroundColor: `${category.color}20`, width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <block.icon className="h-4 w-4" style={{ color: category.color }} />
                          </div>
                          <span className="text-sm font-medium">{block.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
        </div>
      </DialogPortal>
    </DialogComponent>
  )
}
