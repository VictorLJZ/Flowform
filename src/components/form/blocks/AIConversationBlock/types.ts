import { BlockPresentation, SlideLayout } from "@/types/form-presentation-types";
import { QAPair } from '@/types/supabase-types';
import { AIConversationHandle } from '@/types/form-types';
import React from "react";

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
  value?: QAPair[];
  onChange?: (value: QAPair[]) => void;
  onUpdate?: (updates: any) => void;
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
  conversation: QAPair[];
  nextQuestion: string;
  isComplete: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AIConversationNavigationProps {
  conversation: QAPair[];
  activeQuestionIndex: number;
  setActiveQuestionIndex: (index: number) => void;
  hasReturnedToBlock: boolean;
  setHasReturnedToBlock: (value: boolean) => void;
  effectiveIsComplete: boolean;
  nextQuestion: string;
  settingsMaxQuestions: number;
}

export interface AIConversationHistoryProps {
  displayConversation: QAPair[];
  historyContainerRef: React.RefObject<HTMLDivElement>;
}

export interface AIConversationInputProps {
  userInput: string;
  setUserInput: (value: string) => void;
  handleSubmit: () => void;
  isSubmitting: boolean;
  isLoading: boolean;
  effectiveIsComplete: boolean;
  activeQuestionIndex: number;
  conversation: QAPair[];
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
  conversation: QAPair[];
} 