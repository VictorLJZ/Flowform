import { FormBlock } from '@/types/block-types';
import type { QAPair } from '@/types/supabase-types';
import type { AIConversationHandle } from '@/components/form/blocks/AIConversationBlock';
import type { useAnalytics } from '@/hooks/useAnalytics';
import { BlockPresentation } from '@/types/theme-types';

/**
 * Base props available in the BlockRenderer component.
 */
export interface BaseBlockMapperProps {
  block: FormBlock;
  currentAnswer: string | number | string[] | QAPair[];
  onChange: (answer: string | number | string[] | QAPair[]) => void;
  analytics: ReturnType<typeof useAnalytics>;
  isSubmitting: boolean;
  // Include refs or specific functions needed by certain mappers
  aiConversationRef?: React.RefObject<AIConversationHandle | null>;
  responseId?: string | null;
  formId?: string;
  submitAnswer?: (block: FormBlock, answer: string | number | string[] | QAPair[]) => Promise<void>; 
}

/**
 * Maps base props to props required by TextInputBlock or TextAreaBlock.
 */
export const mapToPropsText = (baseProps: BaseBlockMapperProps) => ({
  ...baseProps.block,
  value: baseProps.currentAnswer as string,
  onChange: baseProps.onChange,
  analytics: baseProps.analytics,
  isSubmitting: baseProps.isSubmitting,
});

/**
 * Maps base props to props required by EmailBlock.
 */
export const mapToPropsEmail = (baseProps: BaseBlockMapperProps) => ({
  ...baseProps.block,
  value: baseProps.currentAnswer as string,
  onChange: baseProps.onChange,
  analytics: baseProps.analytics,
  isSubmitting: baseProps.isSubmitting,
  type: 'email', // Specific to EmailBlock
});

/**
 * Maps base props to props required by NumberBlock.
 */
export const mapToPropsNumber = (baseProps: BaseBlockMapperProps) => ({
  ...baseProps.block,
  value: baseProps.currentAnswer as number,
  onChange: baseProps.onChange,
  analytics: baseProps.analytics,
  isSubmitting: baseProps.isSubmitting,
});

/**
 * Maps base props to props required by DateBlock.
 */
export const mapToPropsDate = (baseProps: BaseBlockMapperProps) => ({
  ...baseProps.block,
  value: baseProps.currentAnswer as string,
  onChange: baseProps.onChange,
  analytics: baseProps.analytics,
  isSubmitting: baseProps.isSubmitting,
});

/**
 * Maps base props to props required by DropdownBlock.
 */
export const mapToPropsDropdown = (baseProps: BaseBlockMapperProps) => ({
  ...baseProps.block,
  value: baseProps.currentAnswer as string,
  onChange: baseProps.onChange,
  analytics: baseProps.analytics,
  isSubmitting: baseProps.isSubmitting,
  options: baseProps.block.settings?.options as string[] || [],
});

/**
 * Maps base props to props required by MultipleChoiceBlock.
 */
export const mapToPropsMultipleChoice = (baseProps: BaseBlockMapperProps) => ({
  ...baseProps.block,
  value: baseProps.currentAnswer as string,
  onChange: baseProps.onChange,
  analytics: baseProps.analytics,
  isSubmitting: baseProps.isSubmitting,
  options: baseProps.block.settings?.options as string[] || [],
});

/**
 * Maps base props to props required by CheckboxGroupBlock.
 */
export const mapToPropsCheckboxGroup = (baseProps: BaseBlockMapperProps) => ({
  ...baseProps.block,
  value: baseProps.currentAnswer as string[],
  onChange: baseProps.onChange,
  analytics: baseProps.analytics,
  isSubmitting: baseProps.isSubmitting,
  options: baseProps.block.settings?.options as string[] || [],
});

/**
 * Maps base props to props required by AIConversationBlock.
 */
export const mapToPropsAIConversation = (baseProps: BaseBlockMapperProps) => ({
  ...baseProps.block, // Spread block first
  value: baseProps.currentAnswer as QAPair[],
  onChange: baseProps.onChange,
  analytics: baseProps.analytics,
  isSubmitting: baseProps.isSubmitting,
  ref: baseProps.aiConversationRef,
  responseId: baseProps.responseId || '',
  formId: baseProps.formId || '',
  submitAnswer: baseProps.submitAnswer, 
  settings: { // Construct the detailed settings object
    startingPrompt: (baseProps.block.settings?.startingPrompt as string) || '',
    maxQuestions: (baseProps.block.settings?.maxQuestions as number) || 0,
    temperature: (baseProps.block.settings?.temperature as number) || 0.7,
    contextInstructions: (baseProps.block.settings?.contextInstructions as string | undefined),
    presentation: (baseProps.block.settings?.presentation as BlockPresentation | undefined),
    // layout: (baseProps.block.settings?.layout as SlideLayout | undefined) // If layout is needed
  },
});
