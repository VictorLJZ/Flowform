// Update FieldType to QuestionType to match our new terminology and add new types
export enum QuestionType {
  // Keep existing types but rename some to match Typeform naming
  CONTACT_INFO = 'contact_info',
  ADDRESS = 'address',
  PHONE_NUMBER = 'phone_number',
  SHORT_TEXT = 'short_text',
  LONG_TEXT = 'long_text',
  VIDEO = 'video',
  PICTURE_CHOICE = 'picture_choice',
  RANKING = 'ranking',
  EMAIL = 'email',
  OPINION_SCALE = 'opinion_scale',
  NET_PROMOTER_SCORE = 'net_promoter_score',
  RATING = 'rating',
  MATRIX = 'matrix',
  DATE = 'date',
  NUMBER = 'number',
  FILE_UPLOAD = 'file_upload',
  PAYMENT = 'payment',
  WEBSITE = 'website',
  CALENDLY = 'calendly',
  CHECKBOX = 'checkbox',
  DROPDOWN = 'dropdown',
  STATEMENT = 'statement',
  YES_NO = 'yes_no',
  LEGAL = 'legal',
  MULTIPLE_CHOICE = 'multiple_choice'
}

// Add block type enum
export enum BlockType {
  STATIC = 'static',
  DYNAMIC = 'dynamic'
}

// Update validation types to be more specific
export enum ValidationType {
  REQUIRED = 'required',
  MIN_LENGTH = 'min_length',
  MAX_LENGTH = 'max_length',
  MIN_VALUE = 'min_value',
  MAX_VALUE = 'max_value',
  EMAIL = 'email',
  URL = 'url',
  PHONE = 'phone',
  REGEX = 'regex',
  FILE_TYPE = 'file_type',
  FILE_SIZE = 'file_size'
}

// Add condition types for block logic
export enum ConditionType {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  BETWEEN = 'between',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with'
}

// Keep and update ValidationRule
export interface ValidationRule {
  type: ValidationType;
  value: any;
  message: string;
}

// Add block condition interface
export interface BlockCondition {
  id: string;
  blockId: string;
  dependentBlockId: string;
  conditionType: ConditionType;
  conditionValue: any;
  operator: 'AND' | 'OR';
  conditionGroup: number;
}

// Base block interface
export interface BaseBlock {
  id: string;
  formId: string;
  type: BlockType;
  orderIndex: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

// Static block interface
export interface StaticBlock extends BaseBlock {
  type: BlockType.STATIC;
  questionType: QuestionType;
  questionText: string;
  description?: string;
  required: boolean;
  placeholder?: string;
  options?: Array<{
    value: string;
    label: string;
    description?: string;
    imageUrl?: string;
  }>;
  validationRules: ValidationRule[];
  settings: Record<string, any>;
}

// Modify DynamicBlock interface to remove unnecessary fields
export interface DynamicBlock extends BaseBlock {
  type: BlockType.DYNAMIC;
  seedQuestion: string;
  numFollowUpQuestions: number;
  customPrompt?: string;
  temperature: number;
  // Remove contextInclusion as it's always true within the block
  // Remove minTokens/maxTokens as they can be handled in the AI service
}

// Add interface for dynamic block conversation
export interface DynamicBlockConversation {
  id: string;
  sessionId: string;
  blockId: string;
  questions: DynamicBlockQuestion[];
  answers: DynamicBlockAnswer[];
  currentQuestionIndex: number;
}

// Modify DynamicQuestion to better represent this context
export interface DynamicBlockQuestion {
  id: string;
  conversationId: string;
  questionText: string;
  orderIndex: number; // 0 is seed question, 1+ are generated
  createdAt: Date;
  generationContext: {
    formQuestions: {  // All questions in the form to avoid duplication
      staticQuestions: string[];
      dynamicBlockSeeds: string[];
    };
    currentBlockContext: {  // Context from the current dynamic block conversation
      questions: string[];  // Questions in this block up to this point
      answers: string[];    // Answers in this block up to this point
    };
  };
}

// Add specific interface for answers within a dynamic block
export interface DynamicBlockAnswer {
  id: string;
  conversationId: string;
  questionId: string;
  answerText: string;
  answeredAt: Date;
}

// Add interface for completed form submissions
export interface FormSubmission {
  id: string;
  formId: string;
  sessionId: string;
  submittedAt: Date;
  blocks: FormSubmissionBlock[];
}

// Add interface for blocks within a submission
export interface FormSubmissionBlock {
  id: string;
  submissionId: string;
  blockId: string;
  blockType: BlockType;
  orderIndex: number;
  // For static blocks
  question?: string;
  answer?: string;
  // For dynamic blocks
  dynamicConversation?: {
    questions: string[];
    answers: string[];
  };
}

// Update FormSession to track block progress
export interface FormSession {
  id: string;
  formId: string;
  userIdentifier: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  currentBlockIndex: number;
  currentDynamicConversationId?: string; // Reference to current dynamic block conversation if any
  startedAt: Date;
  lastActivityAt: Date;
  completedAt?: Date;
  formVersion: number;
  metadata: Record<string, any>;
}

// Update SessionProgress to handle dynamic blocks
export interface SessionProgress {
  id: string;
  sessionId: string;
  blockId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  // For dynamic blocks
  dynamicProgress?: {
    totalQuestions: number;
    answeredQuestions: number;
    currentQuestionIndex: number;
  };
  startedAt?: Date;
  completedAt?: Date;
  metadata: Record<string, any>;
}

// Update FormConfig to use blocks
export interface FormConfig {
  id: string;
  title: string;
  description?: string;
  blocks: (StaticBlock | DynamicBlock)[];
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'published' | 'archived';
  version: number;
  maxBlocks: number;
  allowSaveProgress: boolean;
  settings: {
    showProgressBar?: boolean;
    submitButtonText?: string;
    successMessage?: string;
    redirectUrl?: string;
    allowSaveAndContinue?: boolean;
    emailNotifications?: {
      to: string[];
      subject?: string;
      includeFormData?: boolean;
    };
    theme?: {
      primaryColor?: string;
      backgroundColor?: string;
      textColor?: string;
      fontFamily?: string;
    };
  };
}

// Keep FormAnalytics but update to work with blocks
export interface FormAnalytics {
  formId: string;
  views: number;
  starts: number;
  completions: number;
  abandons: number;
  conversionRate: number;
  averageCompletionTime: number;
  blockAnalytics: Record<string, {
    interactionCount: number;
    timeSpent: number;
    errorCount: number;
    // Add dynamic block specific analytics
    dynamicQuestionCount?: number;
    averageResponseLength?: number;
  }>;
}
