import { generateQuestion } from './generateQuestion';
import { formatFormContext } from '../form/getFormContext';
import { FormContextData } from '@/types/form-service-types';

type ProcessConversationParams = {
  prevQuestions: string[];
  prevAnswers: string[];
  instructions: string;
  temperature?: number;
  previousResponseId?: string;
  formContext?: FormContextData;
};

/**
 * Process a conversation and generate the next question
 * 
 * @param params - Object containing conversation history and configuration
 * @returns Success status and generated next question or error
 */
export async function processConversation(params: ProcessConversationParams) {
  const {
    prevQuestions,
    prevAnswers,
    instructions,
    temperature = 0.7,
    previousResponseId,
    formContext
  } = params;
  
  // Format conversation history for the Responses API
  const conversationHistory = [];
  
  // Prepare instructions with or without form context
  let enhancedInstructions = instructions;
  
  // Add form context if available
  if (formContext) {
    const formContextPrompt = formatFormContext(formContext);
    
    enhancedInstructions = `${instructions}

FORM CONTEXT:
${formContextPrompt}

IMPORTANT: Your follow-up questions should explore new areas not covered by other questions in the form. Avoid asking similar questions to those listed above.`;
  }
  
  // Add system instructions as 'developer' role (per Responses API requirements)
  conversationHistory.push({
    role: "developer", // Using 'developer' instead of 'system' per Responses API
    content: enhancedInstructions
  });
  
  // Add previous Q&A exchanges
  for (let i = 0; i < prevQuestions.length; i++) {
    conversationHistory.push({
      role: "assistant", // Assistant asks questions
      content: prevQuestions[i]
    });
    
    if (i < prevAnswers.length) {
      conversationHistory.push({
        role: "user", // User provides answers
        content: prevAnswers[i]
      });
    }
  }
  
  // Request next question
  conversationHistory.push({
    role: "user",
    content: "Based on this conversation, generate the next question to ask."
  });
  
  return generateQuestion(
    conversationHistory, 
    enhancedInstructions, 
    temperature,
    previousResponseId
  );
}
