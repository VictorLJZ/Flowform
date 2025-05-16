import { BlockPresentation, SlideLayout } from "@/types/form-presentation-types";
import { ApiQAPair } from '@/types/response';
import React from "react";

/**
 * Type for block updates that works with both block-types.ts and supabase-types.ts UiBlock definitions
 */
export interface BlockUpdate {
  id?: string;
  title?: string;
  description?: string | null;
  required?: boolean;
  order_index?: number;
  settings?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface AIConversationBlockProps {
  id: string;
  title?: string;
  description?: string;
  required: boolean;
  index?: number;
  totalBlocks?: number;
  maxQuestions?: number;
  temperature?: number;
  settings?: {
    presentation?: BlockPresentation;
    layout?: SlideLayout;
    starterPrompt?: string;
    startingPrompt?: string; // Added this to handle both naming conventions
    maxQuestions?: number;
  };
  value?: ApiQAPair[];
  onChange?: (type: "answer", value: ApiQAPair[]) => void;
  onUpdate?: (updates: BlockUpdate) => void;
  // Navigation props
  onNext?: () => void;
  onPrevious?: () => void;
  isNextDisabled?: boolean;
  responseId: string;
  formId: string;
  blockRef?: React.RefObject<HTMLDivElement>;
}

export interface AIConversationState {
  userInput: string;
  isSubmitting: boolean;
  isNavigating: boolean;
  navigationAttempted: boolean;
  activeQuestionIndex: number;
  hasNavigatedForward: boolean;
  hasReturnedToBlock: boolean;
}

export interface AIConversationData {
  conversation: ApiQAPair[];
  nextQuestion: string;
  isComplete: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AIConversationNavigationProps {
  conversation: ApiQAPair[];
  activeQuestionIndex: number;
  setActiveQuestionIndex: (index: number) => void;
  hasReturnedToBlock: boolean;
  setHasReturnedToBlock: (value: boolean) => void;
  effectiveIsComplete: boolean;
  nextQuestion: string;
  settingsMaxQuestions: number;
}

export interface AIConversationHistoryProps {
  displayConversation: ApiQAPair[];
  historyContainerRef: React.RefObject<HTMLDivElement | null>;
}

export interface AIConversationInputProps {
  userInput: string;
  setUserInput: (value: string) => void;
  handleSubmit: () => void;
  isSubmitting: boolean;
  isLoading: boolean;
  effectiveIsComplete: boolean;
  activeQuestionIndex: number;
  conversation: ApiQAPair[];
}

export interface AIConversationButtonsProps {
  effectiveIsComplete: boolean;
  isEditingQuestion: boolean;
  isInitialState: boolean;
  canSkip?: boolean;
  handleNext: () => void;
  handleSubmit: () => void;
  isNextDisabled?: boolean;
  isNavigating: boolean;
  isSubmitting: boolean;
  isLoading: boolean;
  userInput: string;
  onPrevious?: () => void;
  activeQuestionIndex: number;
  setActiveQuestionIndex: (index: number) => void;
  conversation: ApiQAPair[];
} 