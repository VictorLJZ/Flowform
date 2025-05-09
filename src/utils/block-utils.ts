import { 
  FileText, 
  MessageSquare, 
  CheckSquare, 
  List, 
  Mail, 
  Hash, 
  Calendar,
  User,
  ArrowUpRight,
  Bookmark,
  Sparkles,
  LucideIcon
} from 'lucide-react'

// Icon map to match the block registry
export const iconMap: Record<string, LucideIcon> = {
  // Input blocks
  'short_text': FileText,
  'long_text': FileText,
  'email': Mail,
  'number': Hash,
  'date': Calendar,
  
  // Choice blocks
  'multiple_choice': List,
  'checkbox_group': CheckSquare,
  'dropdown': List,
  
  // Advanced blocks
  'ai_conversation': MessageSquare,
  
  // Integration blocks
  'hubspot': User,
  
  // Layout blocks
  'page_break': Bookmark,
  'redirect': ArrowUpRight,
  
  // Fallback for dynamic content
  'dynamic': Sparkles
}

export interface BlockColorScheme {
  bg: string;
  text: string;
}

// Category colors matching form-builder-block-selector.tsx
export const categoryColors: Record<string, BlockColorScheme> = {
  "input": { bg: "#3b82f620", text: "#3b82f6" }, // Blue
  "choice": { bg: "#8b5cf620", text: "#8b5cf6" }, // Purple
  "advanced": { bg: "#22c55e20", text: "#22c55e" }, // Green
  "integration": { bg: "#f9731620", text: "#f97316" }, // Orange
  "layout": { bg: "#6366f120", text: "#6366f1" }, // Indigo
  "recommended": { bg: "#f43f5e20", text: "#f43f5e" }, // Rose
}

// Map of category IDs for form builder sidebar - using the same colors as above
export const categoryColorMap: Record<string, string> = {
  "input": "#3b82f6", // Blue
  "choice": "#8b5cf6", // Purple
  "advanced": "#22c55e", // Green
  "integration": "#f97316", // Orange
  "layout": "#6366f1", // Indigo
  "recommended": "#f43f5e", // Rose
}

// Function to get the appropriate color for a block type
export const getBlockTypeColors = (blockTypeId: string): BlockColorScheme => {
  if (!blockTypeId) return categoryColors.input;
  
  if (blockTypeId.includes('text') || blockTypeId.includes('email') || 
      blockTypeId.includes('number') || blockTypeId.includes('date')) {
    return categoryColors.input;
  }
  
  if (blockTypeId.includes('multiple_choice') || blockTypeId.includes('checkbox') || 
      blockTypeId.includes('dropdown')) {
    return categoryColors.choice;
  }
  
  if (blockTypeId.includes('ai_conversation')) {
    return categoryColors.advanced;
  }
  
  if (blockTypeId.includes('hubspot')) {
    return categoryColors.integration;
  }
  
  if (blockTypeId.includes('page_break') || blockTypeId.includes('redirect')) {
    return categoryColors.layout;
  }
  
  // Default to input color if no match
  return categoryColors.input;
}

// Get block category from blockTypeId
export const getBlockCategory = (blockTypeId: string): string => {
  if (!blockTypeId) return 'input';
  
  if (blockTypeId.includes('text') || blockTypeId.includes('email') || 
      blockTypeId.includes('number') || blockTypeId.includes('date')) {
    return 'input';
  }
  
  if (blockTypeId.includes('multiple_choice') || blockTypeId.includes('checkbox') || 
      blockTypeId.includes('dropdown')) {
    return 'choice';
  }
  
  if (blockTypeId.includes('ai_conversation')) {
    return 'advanced';
  }
  
  if (blockTypeId.includes('hubspot')) {
    return 'integration';
  }
  
  if (blockTypeId.includes('page_break') || blockTypeId.includes('redirect')) {
    return 'layout';
  }
  
  return 'input';
}
