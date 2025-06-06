"use client"

import { 
  FileText, MessageSquare, CheckSquare, List, 
  Mail, Hash, Calendar, User, ArrowUpRight, 
  Bookmark
} from "lucide-react"
import dynamic from "next/dynamic"
// Import new type system only
import {
  ApiBlockType,
  ApiBlockSubtype,
  ApiStaticBlockSubtype,
  ApiDynamicBlockSubtype,
  ApiIntegrationBlockSubtype,
  ApiLayoutBlockSubtype
} from '@/types/block/ApiBlock'
import { UiBlock } from '@/types/block/UiBlock'

// Define BlockDefinition interface since it was previously in block-types.ts
export interface BlockDefinition {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: React.ComponentType;
  defaultTitle: string;
  defaultDescription?: string;
  category: string;
  isPremium?: boolean;
  getDefaultValues?: () => Record<string, unknown>;
  validate?: (values: Record<string, unknown>) => Record<string, string> | null;
  settingsComponent?: React.ComponentType<{ block: UiBlock; updateSettings: (settings: Record<string, unknown>) => void }>;
}

// Block registry
const blockRegistry: Record<string, BlockDefinition> = {
  // Static input blocks
  "short_text": {
    id: "short_text",
    type: "static",
    name: "Short Text",
    description: "Short answer text field for brief responses",
    icon: FileText,
    defaultTitle: "Short Text Question",
    category: "input",
    getDefaultValues: () => ({
      placeholder: "Type your answer here...",
      maxLength: 255
    })
  },
  
  "long_text": {
    id: "long_text",
    type: "static",
    name: "Long Text",
    description: "Paragraph text for longer responses",
    icon: FileText,
    defaultTitle: "Long Text Question",
    category: "input",
    getDefaultValues: () => ({
      placeholder: "Type your detailed answer here...",
      maxRows: 5
    })
  },
  
  "email": {
    id: "email",
    type: "static",
    name: "Email",
    description: "Email address input field",
    icon: Mail,
    defaultTitle: "Email Address",
    category: "input",
    getDefaultValues: () => ({
      placeholder: "email@example.com"
    }),
    validate: (values: Record<string, unknown>) => {
      // Basic email validation example
      const email = values.answer as string
      if (email && !/^\S+@\S+\.\S+$/.test(email)) {
        return { type: "answer", content: "Please enter a valid email address" }
      }
      return null
    }
  },
  
  "number": {
    id: "number",
    type: "static",
    name: "Number",
    description: "Numeric input field",
    icon: Hash,
    defaultTitle: "Number Input",
    category: "input",
    getDefaultValues: () => ({
      placeholder: "0",
      min: undefined,
      max: undefined,
      step: 1
    }),
    validate: (values: Record<string, unknown>) => {
      const num = Number(values.answer)
      const min = values.min !== undefined ? Number(values.min) : undefined
      const max = values.max !== undefined ? Number(values.max) : undefined
      
      if (isNaN(num)) {
        return { type: "answer", content: "Please enter a valid number" }
      }
      if (min !== undefined && num < min) {
        return { type: "answer", content: `Value must be at least ${min}` }
      }
      if (max !== undefined && num > max) {
        return { type: "answer", content: `Value must be at most ${max}` }
      }
      return null
    }
  },
  
  "date": {
    id: "date",
    type: "static",
    name: "Date",
    description: "Date selector",
    icon: Calendar,
    defaultTitle: "Date Selection",
    category: "input",
    getDefaultValues: () => ({
      minDate: undefined,
      maxDate: undefined
    })
  },
  
  // Choice blocks
  "multiple_choice": {
    id: "multiple_choice",
    type: "static",
    name: "Multiple Choice",
    description: "Single selection from multiple options",
    icon: List,
    defaultTitle: "Multiple Choice Question",
    category: "choice",
    getDefaultValues: () => ({
      options: [
        { id: `option-${Date.now()}-1`, label: "Option 1" },
        { id: `option-${Date.now()}-2`, label: "Option 2" },
        { id: `option-${Date.now()}-3`, label: "Option 3" }
      ],
      allowOther: false
    })
  },
  
  "checkbox_group": {
    id: "checkbox_group",
    type: "static",
    name: "Checkbox",
    description: "Multiple selection from options",
    icon: CheckSquare,
    defaultTitle: "Checkbox Question",
    category: "choice",
    getDefaultValues: () => ({
      options: [
        { id: `option-${Date.now()}-1`, label: "Option 1" },
        { id: `option-${Date.now()}-2`, label: "Option 2" },
        { id: `option-${Date.now()}-3`, label: "Option 3" }
      ],
      allowOther: false,
      minSelected: 0,
      maxSelected: undefined
    })
  },
  
  "dropdown": {
    id: "dropdown",
    type: "static",
    name: "Dropdown",
    description: "Selection from a dropdown menu",
    icon: List,
    defaultTitle: "Dropdown Question",
    category: "choice",
    getDefaultValues: () => ({
      options: [
        { id: `option-${Date.now()}-1`, label: "Option 1" },
        { id: `option-${Date.now()}-2`, label: "Option 2" },
        { id: `option-${Date.now()}-3`, label: "Option 3" }
      ],
      placeholder: "Select an option"
    })
  },
  
  // Dynamic blocks
  "ai_conversation": {
    id: "ai_conversation",
    type: "dynamic",
    name: "AI Conversation",
    description: "Dynamic AI-powered conversation",
    icon: MessageSquare,
    defaultTitle: "AI Conversation",
    category: "advanced",
    getDefaultValues: () => ({
      // No longer using startingPrompt as we use the block title instead
      contextInstructions: "You are a helpful assistant responding to form submissions.",
      temperature: 0.7,
      maxQuestions: 5
    }),
    settingsComponent: dynamic(() => import('@/components/form/settings').then(mod => mod.AIConversationSettings))
  },
  
  // Integration blocks
  "hubspot": {
    id: "hubspot",
    type: "integration",
    name: "HubSpot",
    description: "Connect to HubSpot CRM",
    icon: User,
    defaultTitle: "HubSpot Integration",
    category: "integration",
    isPremium: true,
    getDefaultValues: () => ({
      fieldsMapping: {},
      createContact: true
    })
  },
  
  // Layout blocks
  "page_break": {
    id: "page_break",
    type: "layout",
    name: "Page Break",
    description: "Add a new page",
    icon: Bookmark,
    defaultTitle: "Page Break",
    category: "layout",
    getDefaultValues: () => ({
      showProgressBar: true
    })
  },
  
  "redirect": {
    id: "redirect",
    type: "layout",
    name: "Redirect",
    description: "Redirect to URL",
    icon: ArrowUpRight,
    defaultTitle: "Redirect",
    category: "layout",
    getDefaultValues: () => ({
      url: "https://",
      delaySeconds: 3
    })
  }
}

// Helper functions
export const getBlockDefinition = (blockTypeId: string): BlockDefinition | undefined => {
  // First try a direct lookup
  let block = blockRegistry[blockTypeId];
  
  // If the direct lookup fails, but blockTypeId is 'dynamic', try to find the dynamic block
  if (!block && (blockTypeId === 'dynamic' || blockTypeId.includes('dynamic'))) {
    // Get the AI conversation block as a fallback for any dynamic block
    block = blockRegistry['ai_conversation'];
  }
  
  return block;
}

export const getBlocksByCategory = (category: string) => {
  return Object.values(blockRegistry).filter(block => block.category === category)
}

export const getAllBlocks = () => {
  return Object.values(blockRegistry)
}

/**
 * Creates a new block with the new type system
 * @param blockTypeId The ID of the block type to create
 * @param order The order index of the block
 * @returns A new UiBlock
 */
export const createNewBlock = (blockTypeId: string, order: number): UiBlock => {
  const blockDef = getBlockDefinition(blockTypeId)
  
  // Determine the block type and subtype based on blockTypeId
  const blockType: ApiBlockType = (blockDef?.type || 'static') as ApiBlockType;
  let blockSubtype: ApiBlockSubtype;
  
  // Assign the appropriate subtype based on blockTypeId and type
  if (blockTypeId === 'ai_conversation') {
    blockSubtype = 'ai_conversation' as ApiDynamicBlockSubtype;
  } else if (blockTypeId === 'hubspot') {
    blockSubtype = 'hubspot' as ApiIntegrationBlockSubtype;
  } else if (blockTypeId === 'page_break') {
    blockSubtype = 'page_break' as ApiLayoutBlockSubtype;
  } else if (blockTypeId === 'redirect') {
    blockSubtype = 'redirect' as ApiLayoutBlockSubtype;
  } else {
    // For static blocks, the blockTypeId is the subtype
    blockSubtype = blockTypeId as ApiStaticBlockSubtype;
  }
  
  // Create a block using the new type system
  return {
    id: `block-${Date.now()}`,
    formId: '', // Will be set when associated with a form
    type: blockType,
    subtype: blockSubtype,
    title: blockDef?.defaultTitle || "",
    description: blockDef?.defaultDescription || "",
    required: false,
    orderIndex: order,
    settings: blockDef?.getDefaultValues ? blockDef.getDefaultValues() : {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

export default blockRegistry
