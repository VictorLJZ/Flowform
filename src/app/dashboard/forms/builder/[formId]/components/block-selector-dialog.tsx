"use client"

import { useState } from "react"
import { Search, Mail, Phone, User, Calendar, Globe, MessageSquare, FileText, CheckSquare, List, BarChart3, Star, FileUp, X, Hash, CreditCard, Image, Send, Monitor, Layers, Bookmark, Diamond, ArrowUpRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
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
        { id: "rating", type: "static", name: "Rating", description: "Rate on a scale", icon: Star },
        { id: "ranking", type: "static", name: "Ranking", description: "Rank options", icon: List },
        { id: "matrix", type: "static", name: "Matrix", description: "Grid of questions", icon: Layers, isPremium: true },
      ]
    },
    {
      id: "text-video",
      name: "Text & Video",
      color: "#0ea5e9", // Sky blue
      blocks: [
        { id: "long-text", type: "static", name: "Long Text", description: "Multi-line text area", icon: FileText },
        { id: "short-text", type: "static", name: "Short Text", description: "Single line text field", icon: MessageSquare },
        { id: "video", type: "static", name: "Video", description: "Embed video content", icon: Monitor, isPremium: true },
        { id: "clarify-ai", type: "dynamic", name: "Clarify with AI", description: "AI-assisted clarification", icon: MessageSquare, isPremium: true },
      ]
    },
    {
      id: "other",
      name: "Other",
      color: "#eab308", // Yellow
      blocks: [
        { id: "number", type: "static", name: "Number", description: "Numerical input", icon: Hash },
        { id: "date", type: "static", name: "Date", description: "Date selector", icon: Calendar },
        { id: "payment", type: "static", name: "Payment", description: "Payment collection", icon: CreditCard, isPremium: true },
        { id: "file-upload", type: "static", name: "File Upload", description: "File upload field", icon: FileUp, isPremium: true },
        { id: "google-drive", type: "integration", name: "Google Drive", description: "Google Drive integration", icon: FileUp, isPremium: true },
        { id: "calendly", type: "integration", name: "Calendly", description: "Schedule appointments", icon: Calendar },
      ]
    },
    {
      id: "layout",
      name: "Other",
      color: "#64748b", // Slate
      blocks: [
        { id: "welcome-screen", type: "layout", name: "Welcome Screen", description: "Introduction screen", icon: Monitor },
        { id: "partial-submit", type: "layout", name: "Partial Submit Point", description: "Save partial responses", icon: Bookmark, isPremium: true },
        { id: "statement", type: "layout", name: "Statement", description: "Display text without input", icon: FileText },
        { id: "question-group", type: "layout", name: "Question Group", description: "Group related questions", icon: Layers },
        { id: "multi-question", type: "layout", name: "Multi-Question Page", description: "Multiple questions on one page", icon: Layers },
        { id: "end-screen", type: "layout", name: "End Screen", description: "Thank you screen", icon: Send },
        { id: "redirect-url", type: "layout", name: "Redirect to URL", description: "Redirect after completion", icon: ArrowUpRight, isPremium: true },
      ]
    }
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-auto bg-white p-6 border rounded-lg overflow-auto">
        <DialogHeader className="border-b pb-4 px-0 -mt-1">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Add form elements</DialogTitle>
          </div>
        </DialogHeader>

        <div className="overflow-x-auto py-6">
          <div className="flex" style={{ minWidth: 'max-content' }}>
            {/* Search Column */}
            <div className="w-[260px] min-w-[260px] pr-8 border-r mr-8">
              <div className="relative mb-6">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search form elements"
                  className="w-full pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {searchQuery && (
                <div>
                  <h3 className="mb-4 text-sm font-medium">Search Results</h3>
                  <div className="flex flex-col space-y-3">
                    {filterBlocks(getAllBlocks()).map((block) => (
                      <button
                        key={`${block.id}-${block.type}`}
                        className="flex items-center rounded-md border border-muted/30 p-3 text-left hover:bg-muted/20 transition-colors relative w-full"
                        onClick={() => handleSelectBlock(block)}
                      >
                        <div className="mr-3 rounded-md" style={{ backgroundColor: `${getCategoryByBlockId(block.id)?.color}20` }}>
                          <block.icon className="h-5 w-5 m-2" style={{ color: getCategoryByBlockId(block.id)?.color }} />
                        </div>
                        <span className="text-sm font-medium">{block.name}</span>
                        {block.isPremium && (
                          <div className="absolute top-3 right-3">
                            <Diamond className="h-3 w-3 text-primary" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  {filterBlocks(getAllBlocks()).length === 0 && (
                    <p className="text-center text-sm text-muted-foreground pt-4">No form elements found matching your search.</p>
                  )}
                </div>
              )}
            </div>

            {/* Category Columns */}
            {!searchQuery && blockCategories.map((category) => (
              <div key={category.id} className="w-[220px] min-w-[220px] mr-8" style={{ flexShrink: 0 }}>
                <h3 className="mb-4 text-base font-medium">{category.name}</h3>
                <div className="flex flex-col space-y-3">
                  {category.blocks.map((block) => (
                    <button
                      key={`${block.id}-${block.type}`}
                      className="flex items-center rounded-md border border-muted/30 p-3 text-left hover:bg-muted/20 transition-colors relative w-full"
                      onClick={() => handleSelectBlock(block)}
                    >
                      <div className="mr-3 rounded-md" style={{ backgroundColor: `${category.color}20` }}>
                        <block.icon className="h-5 w-5 m-2" style={{ color: category.color }} />
                      </div>
                      <span className="text-sm font-medium">{block.name}</span>
                      {block.isPremium && (
                        <div className="absolute top-3 right-3">
                          <Diamond className="h-3 w-3 text-primary" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </DialogContent>
    </Dialog>
  )
}
