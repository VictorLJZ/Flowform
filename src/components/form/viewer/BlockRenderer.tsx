import React from 'react';

// Import the SlideWrapper for proper rendering
import { SlideWrapper } from '@/components/form/SlideWrapper';
// Import necessary types
import { BlockPresentation } from '@/types/theme-types';
import { SlideLayout, SlideLayoutType } from '@/types/layout-types';

// Import block components directly from their source files
import { TextInputBlock } from '@/components/form/blocks/TextInputBlock';
import { TextAreaBlock } from '@/components/form/blocks/TextAreaBlock';
import { MultipleChoiceBlock } from '@/components/form/blocks/MultipleChoiceBlock';
import { CheckboxGroupBlock } from '@/components/form/blocks/CheckboxGroupBlock';
import { DropdownBlock } from '@/components/form/blocks/DropdownBlock';
import { EmailBlock } from '@/components/form/blocks/EmailBlock';
import { NumberBlock } from '@/components/form/blocks/NumberBlock';
import { DateBlock } from '@/components/form/blocks/DateBlock';
import { AIConversationBlock } from '@/components/form/blocks/AIConversationBlock';
import type { AIConversationHandle } from '@/components/form/blocks/AIConversationBlock';
import { FormBlock } from '@/types/block-types';
import type { QAPair } from '@/types/supabase-types';
import type { useAnalytics } from '@/hooks/useAnalytics';
import type { BaseBlockMapperProps } from '@/services/form/blockMappers';
import {
  mapToPropsText,
  mapToPropsEmail,
  mapToPropsNumber,
  mapToPropsDate,
  mapToPropsDropdown,
  mapToPropsMultipleChoice,
  mapToPropsCheckboxGroup,
  mapToPropsAIConversation,
} from '@/services/form/blockMappers';

interface BlockRendererProps {
  block: FormBlock;
  currentAnswer: string | number | string[] | QAPair[];
  setCurrentAnswer: (answer: string | number | string[] | QAPair[]) => void;
  submitAnswer: (block: FormBlock, answer: string | number | string[] | QAPair[]) => Promise<void>; 
  submitting: boolean;
  responseId: string | null;
  formId: string;
  analytics: ReturnType<typeof useAnalytics>; // Get the type from the hook
  aiConversationRef: React.RefObject<AIConversationHandle | null>; // Allow null
  index?: number; // Current block index for numbering
  totalBlocks?: number; // Total number of blocks for progress
}

export const BlockRenderer: React.FC<BlockRendererProps> = (props) => {
  const { 
    block, 
    currentAnswer, 
    setCurrentAnswer, 
    submitAnswer,
    submitting,
    responseId,
    formId,
    analytics,
    aiConversationRef,
    index,
    totalBlocks
  } = props;

  // Log the block being rendered for debugging
  console.log('BlockRenderer - rendering block:', { 
    id: block?.id, 
    blockTypeId: block?.blockTypeId,
    currentAnswer
  });

  // Safety check - if no block, return nothing
  if (!block) {
    console.error('BlockRenderer received null or undefined block');
    return <div className="p-4 text-red-500">Error: Block data missing</div>;
  }

  // Consolidate all props needed by the mappers into one object
  const baseMapperProps = {
    block, // Keep the original block object intact
    currentAnswer, 
    onChange: setCurrentAnswer,
    analytics,
    isSubmitting: submitting,
    aiConversationRef,
    responseId,
    formId,
    submitAnswer,
  };

  // Common props for the SlideWrapper - pulls data from the block
  const slideWrapperProps: {
    id: string;
    title: string;
    description?: string;
    required: boolean;
    settings: {
      presentation?: BlockPresentation;
      layout: SlideLayout;
    };
    onNext?: () => void;
    isNextDisabled?: boolean;
    index?: number;
    totalBlocks?: number;
  } = {
    id: block.id,
    title: block.title,
    description: block.description,
    required: block.required,
    settings: {
      // Create a proper SlideLayout object based on the layout type
      layout: {
        type: (block.settings?.layout as SlideLayoutType) || 'standard'
      } as SlideLayout, // Cast to SlideLayout since we're providing the minimum required properties
      // Include any presentation settings if available
      presentation: block.settings?.presentation as BlockPresentation | undefined
    },
    onNext: submitAnswer ? () => submitAnswer(block, currentAnswer) : undefined,
    isNextDisabled: submitting, // Disable when submitting
    index: index, // Add current block index for question numbering
    totalBlocks: totalBlocks // Add total blocks for progress and Submit button text
  };

  // Function to render a block - now passing SlideWrapper props to block components directly
  // This avoids double-wrapping with SlideWrapper since each block component already includes it
  const renderBlock = <T extends object>(BlockComponent: React.ComponentType<T>, mapperFn: (props: BaseBlockMapperProps) => T) => {
    // Map the base props to component-specific props using the mapper function
    const componentProps = mapperFn(baseMapperProps);
    
    // Merge slideWrapperProps into componentProps for proper handling in the block component
    // The block components already wrap themselves in SlideWrapper
    return (
      <BlockComponent 
        {...componentProps} 
        index={index}
        totalBlocks={totalBlocks}
        onNext={slideWrapperProps.onNext}
        isNextDisabled={slideWrapperProps.isNextDisabled}
      />
    );
  };

  // Use the block's type for the switch
  switch (block.blockTypeId) {
    case 'text_input':
    case 'short_text':
      return renderBlock(TextInputBlock, mapToPropsText);
      
    case 'long_text': 
      // Long text specifically uses the TextAreaBlock component
      return renderBlock(TextAreaBlock, mapToPropsText);

    case 'email':
      return renderBlock(EmailBlock, mapToPropsEmail);

    case 'number':
      return renderBlock(NumberBlock, mapToPropsNumber);

    case 'date':
      return renderBlock(DateBlock, mapToPropsDate);

    case 'dropdown':
      return renderBlock(DropdownBlock, mapToPropsDropdown);

    case 'multiple_choice':
      return renderBlock(MultipleChoiceBlock, mapToPropsMultipleChoice);

    case 'checkbox_group':
      return renderBlock(CheckboxGroupBlock, mapToPropsCheckboxGroup);

    case 'ai_conversation':
      return renderBlock(AIConversationBlock, mapToPropsAIConversation);

    default:
      console.warn(`Unsupported block type: ${block.blockTypeId}`);
      return (
        <div className="p-4 text-red-500 border border-red-300 rounded w-full max-w-2xl mx-auto">
          Unsupported block type: {block.blockTypeId}
        </div>
      );
  }
};
