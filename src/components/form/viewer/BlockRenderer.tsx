import React from 'react';

// Block components already include SlideWrapper internally
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
import { useAnalytics } from '@/hooks/useAnalytics';
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
  analytics: ReturnType<typeof useAnalytics>; // Parent-level analytics
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
  
  // Create analytics at the component level - unconditionally to comply with React Hooks rules
  // We're setting disabled: true when appropriate instead of conditionally calling the hook
  const blockAnalytics = useAnalytics({
    formId: formId || '', // Ensure formId is never undefined
    blockId: block?.id || '', // Ensure blockId is never undefined
    responseId: responseId || undefined,
    disabled: !responseId || !block?.id || !formId, // Disable if any required values are missing
    metadata: { blockType: block?.blockTypeId || '' }
  });

  // Log the block being rendered for debugging
  console.log('BlockRenderer - rendering block:', { 
    id: block?.id, 
    blockTypeId: block?.blockTypeId,
    currentAnswer,
    hasAnalytics: !!analytics,
    hasBlockRef: analytics && 'blockRef' in analytics
  });
  
  // Debug log for analytics.blockRef if it exists
  if (analytics && 'blockRef' in analytics) {
    console.log(`🔍 DEBUG BlockRenderer - analytics.blockRef for block ${block?.id}:`, {
      blockRef: analytics.blockRef,
      refCurrent: analytics.blockRef?.current
    });
  }

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

  // Note: useAnalytics hook is called at the top of the component to comply with React Hooks rules

  // Function to render a block - now passing SlideWrapper props to block components directly
  // This avoids double-wrapping with SlideWrapper since each block component already includes it
  const renderBlock = <T extends object>(BlockComponent: React.ComponentType<T>, mapperFn: (props: BaseBlockMapperProps) => T) => {
    // Map the base props to component-specific props using the mapper function
    const componentProps = mapperFn(baseMapperProps);
    
    // Simplified analytics with block-specific tracking (submit events only)
    const enhancedAnalytics = {
      ...blockAnalytics,
      
      // Single method for tracking block interactions, focused on submit events
      trackInteraction: (type: string, metadata: Record<string, unknown> = {}) => {
        console.log(`[BlockAnalytics] Block ${block.id} interaction: ${type}`, metadata);
        
        // We only track submit events in our new simplified approach
        if (type === 'submit') {
          console.log(`[BlockAnalytics] Tracking block submit for ${block.id}`);
          
          // Track submit using the new blockSubmit functionality
          if (blockAnalytics.trackSubmit) {
            blockAnalytics.trackSubmit(metadata);
          } else if (blockAnalytics.blockSubmit?.trackSubmit) {
            blockAnalytics.blockSubmit.trackSubmit(metadata);
          } else if (blockAnalytics.trackBlockInteraction) {
            // Last resort - try the renamed method
            blockAnalytics.trackBlockInteraction('submit', metadata);
          } else {
            console.error('[BlockAnalytics] Could not find any submit tracking method');
          }
        } else {
          // Log but don't track other interaction types
          console.log(`[BlockAnalytics] Ignoring non-submit interaction: ${type}`);
        }
      }
    };
    
    // Merge slideWrapperProps into componentProps for proper handling in the block component
    // The block components already wrap themselves in SlideWrapper
    return (
      <BlockComponent 
        {...componentProps} 
        index={index}
        totalBlocks={totalBlocks}
        onNext={slideWrapperProps.onNext}
        isNextDisabled={slideWrapperProps.isNextDisabled}
        analytics={enhancedAnalytics} // Pass enhanced analytics with block-specific tracking
        blockRef={blockAnalytics.blockRef} // Pass blockRef from the block-specific analytics
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
