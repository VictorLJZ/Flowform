import { DynamicBlock, DynamicBlockQuestion, DynamicBlockAnswer } from '@/types/form-types';

/**
 * Template for generating questions within a dynamic block
 */
export const dynamicBlockQuestionPrompt = `
You are an intelligent form question generator. Your task is to generate a thoughtful follow-up question based on a conversation so far.

FORM CONTEXT:
{{customPrompt}}

EXISTING QUESTIONS IN THE FORM:
{{existingQuestions}}

CONVERSATION IN THIS BLOCK SO FAR:
{{blockConversation}}

GUIDELINES:
1. Generate a single follow-up question that naturally continues the conversation
2. Make your question open-ended to encourage detailed responses
3. Avoid repeating topics already covered in ANY of the existing questions
4. Keep your question relevant to the overall form purpose
5. Be conversational and friendly in tone
6. If this is the final question (#{{currentQuestionIndex}} of {{totalQuestionsNeeded}}), make it a concluding question for this topic

Generate ONLY the question text without any explanations or preamble:
`;

/**
 * Format the list of all form questions for the prompt
 * @param staticQuestions List of all static questions in the form
 * @param dynamicSeeds List of seed questions from all dynamic blocks
 * @returns Formatted string of all questions
 */
export const formatFormQuestions = (
  staticQuestions: string[],
  dynamicSeeds: string[]
): string => {
  let formattedQuestions = '';
  
  if (staticQuestions.length > 0) {
    formattedQuestions += 'Static Questions:\n';
    staticQuestions.forEach((q, i) => {
      formattedQuestions += `${i + 1}. ${q}\n`;
    });
    formattedQuestions += '\n';
  }
  
  if (dynamicSeeds.length > 0) {
    formattedQuestions += 'Dynamic Block Seed Questions:\n';
    dynamicSeeds.forEach((q, i) => {
      formattedQuestions += `${i + 1}. ${q}\n`;
    });
    formattedQuestions += '\n';
  }
  
  return formattedQuestions;
};

/**
 * Format the conversation history within a dynamic block
 * @param questions List of questions in the block
 * @param answers List of answers in the block
 * @returns Formatted conversation history string
 */
export const formatBlockConversation = (
  questions: string[],
  answers: string[]
): string => {
  let conversation = '';
  
  for (let i = 0; i < questions.length; i++) {
    conversation += `Question ${i + 1}: ${questions[i]}\n`;
    
    if (i < answers.length) {
      conversation += `Answer ${i + 1}: ${answers[i]}\n`;
    }
    
    conversation += '\n';
  }
  
  return conversation;
};

/**
 * Builds generation context for the AI service
 */
export const buildGenerationContext = (
  block: DynamicBlock,
  formQuestions: {
    staticQuestions: string[];
    dynamicBlockSeeds: string[];
  },
  blockQuestions: string[],
  blockAnswers: string[],
  currentQuestionIndex: number
) => {
  const existingQuestions = formatFormQuestions(
    formQuestions.staticQuestions,
    formQuestions.dynamicBlockSeeds
  );
  
  const blockConversation = formatBlockConversation(
    blockQuestions,
    blockAnswers
  );
  
  return dynamicBlockQuestionPrompt
    .replace('{{customPrompt}}', block.customPrompt || 'Generate engaging follow-up questions related to the seed question.')
    .replace('{{existingQuestions}}', existingQuestions)
    .replace('{{blockConversation}}', blockConversation)
    .replace('{{currentQuestionIndex}}', (currentQuestionIndex + 1).toString())
    .replace('{{totalQuestionsNeeded}}', (block.numFollowUpQuestions + 1).toString());
};

export const questionGenerationPrompt = `
You are an intelligent form generation assistant. Your task is to generate thoughtful follow-up questions based on previous questions and answers.

FORM INSTRUCTIONS:
{{instructions}}

CONVERSATION HISTORY:
{{conversationHistory}}

GUIDELINES:
1. Generate a single follow-up question that naturally continues the conversation
2. Make questions open-ended to encourage detailed responses
3. Avoid repeating topics already covered
4. Keep questions relevant to the overall form purpose
5. Be conversational and friendly in tone
6. If this is the final question (question #{{currentIndex}} of {{maxQuestions}}), make it a concluding question

Generate the next question:
`;

export const formatConversationHistory = (questions: string[], answers: string[]): string => {
  let history = '';
  
  for (let i = 0; i < questions.length; i++) {
    history += `Question ${i + 1}: ${questions[i]}\n`;
    
    if (i < answers.length) {
      history += `Answer ${i + 1}: ${answers[i]}\n\n`;
    }
  }
  
  return history;
}; 