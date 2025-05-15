"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { Search, X } from "lucide-react"
import * as Dialog from "@radix-ui/react-dialog"
import { Input } from "@/components/ui/input"
import { getAllBlocks, getBlocksByCategory, getBlockDefinition, BlockDefinition } from "@/registry/blockRegistry"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { categoryColors, getBlockCategory } from "@/utils/block-utils"

// Using centralized category colors from block-utils.ts

export default function FormBuilderBlockSelector() {
  const { blockSelectorOpen, setBlockSelectorOpen, addBlock } = useFormBuilderStore()
  const [searchQuery, setSearchQuery] = useState("")

  // Clear search when dialog opens
  useEffect(() => {
    if (blockSelectorOpen) {
      setSearchQuery("")
    }
  }, [blockSelectorOpen])

  // Define UI categories (matching registry categories but with our colors and custom display)
  const uiCategories = [
    {
      id: "integration",
      name: "Connect to CRM"
    },
    {
      id: "recommended",
      name: "Recommended"
    },
    {
      id: "input",
      name: "Input Fields"
    },
    {
      id: "choice",
      name: "Choice"
    },
    {
      id: "advanced",
      name: "Advanced"
    },
    {
      id: "layout",
      name: "Layout"
    },
  ]

  // Get blocks for a specific UI category from the registry
  const getBlocksForCategory = (categoryId: string) => {
    // For recommended category, return a curated list of blocks
    if (categoryId === "recommended") {
      // Filter out undefined results from getBlockDefinition
      const recommendedBlocks = [
        getBlockDefinition("short_text"), // Use standardized ID
        getBlockDefinition("multiple_choice"),
        getBlockDefinition("ai_conversation"),
        getBlockDefinition("email")
      ].filter((block): block is BlockDefinition => block !== undefined);
      return recommendedBlocks;
    }
    return getBlocksByCategory(categoryId)
  }

  // Filter blocks based on search query
  const filterBlocks = (blocks: BlockDefinition[]) => {
    if (!searchQuery) return blocks
    const query = searchQuery.toLowerCase()
    return blocks.filter(block => 
      block.name.toLowerCase().includes(query) || 
      block.description.toLowerCase().includes(query)
    )
  }

  // Get category color by block ID using the centralized utility
  const getColorForBlock = (blockId: string) => {
    const category = getBlockCategory(blockId)
    return categoryColors[category]?.text || categoryColors.input.text
  }
  
  // Get background color by block ID
  const getBackgroundColorForBlock = (blockId: string) => {
    const category = getBlockCategory(blockId)
    return categoryColors[category]?.bg || categoryColors.input.bg
  }

  // Handle block selection
  const handleSelectBlock = (block: BlockDefinition) => {
    addBlock(block.id)
    setBlockSelectorOpen(false)
  }

  return (
    <Dialog.Root open={blockSelectorOpen} onOpenChange={setBlockSelectorOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        
        <Dialog.Content className="fixed top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 bg-background rounded-lg border shadow-lg focus:outline-none w-[1000px] max-w-[95vw] p-6 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200 overflow-visible">
          <motion.div
            layout="size"
            layoutRoot
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="relative w-full"
          >
            <div className="border-b pb-4 px-0 -mt-1">
              <div className="flex items-center justify-between">
                <Dialog.Title className="text-xl font-semibold">Add form elements</Dialog.Title>
                
                <Dialog.Close asChild>
                  <button 
                    className="p-1.5 rounded-full hover:bg-muted/20 transition-colors flex items-center justify-center"
                    aria-label="Close dialog"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </Dialog.Close>
              </div>
            </div>

              <div className="pt-2 pb-4 flex overflow-visible">
                {/* Left Column with Search and First Two Categories */}
                <div className="flex flex-col gap-6 mr-6 w-[260px]">
                  {/* Search Box - Fixed dimensions to prevent stretching */}
                  <motion.div style={{ height: '36px' }}>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search form elements"
                        className="w-full pl-8"
                        style={{ height: '36px' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </motion.div>

                  {/* Left Column Categories */}
                  {!searchQuery && (
                    <>
                      {/* Integration category */}
                      <div>
                        <h3 className="mb-2 text-base font-medium">{uiCategories[0].name}</h3>
                        <div className="flex flex-col gap-1">
                          {getBlocksForCategory(uiCategories[0].id).map((block) => (
                            <button
                              key={`${block.id}-${block.type}`}
                              className="flex items-center rounded-md border border-muted/30 py-1.5 pl-2 pr-3 text-left hover:bg-muted/20 transition-colors relative" 
                              style={{ width: '200px' }}
                              onClick={() => handleSelectBlock(block)}
                            >
                              <div className="mr-3 rounded-md" style={{ backgroundColor: categoryColors.integration.bg, width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {block.icon && <block.icon {...{ className: "h-4 w-4", style: { color: categoryColors.integration.text }} as React.ComponentProps<typeof block.icon>} />}
                              </div>
                              <span className="text-sm font-medium">{block.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Recommended category */}
                      <div>
                        <h3 className="mb-2 text-base font-medium">{uiCategories[1].name}</h3>
                        <div className="flex flex-col gap-1">
                          {getBlocksForCategory(uiCategories[1].id).map((block) => (
                            <button
                              key={`${block.id}-${block.type}`}
                              className="flex items-center rounded-md border border-muted/30 py-1.5 pl-2 pr-3 text-left hover:bg-muted/20 transition-colors relative" 
                              style={{ width: '200px' }}
                              onClick={() => handleSelectBlock(block)}
                            >
                              <div className="mr-3 rounded-md" style={{ backgroundColor: categoryColors.recommended.bg, width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {block.icon && <block.icon {...{ className: "h-4 w-4", style: { color: categoryColors.recommended.text }} as React.ComponentProps<typeof block.icon>} />}
                              </div>
                              <span className="text-sm font-medium">{block.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Right Column - Main Categories Grid - 3x2 or Search Results */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateRows: 'repeat(2, auto)',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  /* Fill by row first (default behavior) */
                  gap: '1.5rem', 
                  width: '100%',
                }}>
                  {searchQuery ? (
                    /* Display search results in the grid */
                    <motion.div layout="position" className="col-span-3 row-span-2 min-h-[200px]">
                      <h3 className="mb-4 text-sm font-medium">Search Results</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {filterBlocks(getAllBlocks()).map((block) => (
                          <button
                            key={`${block.id}-${block.type}`}
                            className="flex items-center rounded-md border border-muted/30 py-1.5 pl-2 pr-3 text-left hover:bg-muted/20 transition-colors relative" 
                            style={{ width: '200px' }}
                            onClick={() => handleSelectBlock(block)}
                          >
                            <div className="mr-3 rounded-md" style={{ backgroundColor: getBackgroundColorForBlock(block.id), width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {block.icon && <block.icon {...{ className: "h-4 w-4", style: { color: getColorForBlock(block.id) }} as React.ComponentProps<typeof block.icon>} />}
                            </div>
                            <span className="text-sm font-medium">{block.name}</span>
                          </button>
                        ))}
                      </div>
                      {filterBlocks(getAllBlocks()).length === 0 && (
                        <p className="text-center text-sm text-muted-foreground pt-4">No form elements found matching your search.</p>
                      )}
                    </motion.div>
                  ) : (
                    /* Regular categories - all except recommended and integration (indices 0 and 1) */
                    uiCategories.slice(2).map((category) => (
                      <div key={category.id} style={{ width: '100%', margin: 0, padding: 0 }}>
                        <h3 className="mb-2 text-base font-medium">{category.name}</h3>
                        <div className="flex flex-col gap-1">
                          {getBlocksForCategory(category.id).map((block) => (
                            <button
                              key={`${block.id}-${block.type}`}
                              className="flex items-center rounded-md border border-muted/30 py-1.5 pl-2 pr-3 text-left hover:bg-muted/20 transition-colors relative" 
                              style={{ width: '200px' }}
                              onClick={() => handleSelectBlock(block)}
                            >
                              <div className="mr-3 rounded-md" style={{ backgroundColor: categoryColors[category.id].bg, width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {block.icon && <block.icon {...{ className: "h-4 w-4", style: { color: categoryColors[category.id].text }} as React.ComponentProps<typeof block.icon>} />}
                              </div>
                              <span className="text-sm font-medium">{block.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
