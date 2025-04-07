import { generateQuestion } from './generateQuestion';

/**
 * Process a conversation and generate the next question
 * 
 * @param prevQuestions - Array of previous questions
 * @param prevAnswers - Array of previous answers
 * @param instructions - AI prompt instructions
 * @param temperature - Controls randomness (0.0-1.0)
 * @returns Success status and generated next question or error
 */
export async function processConversation(
  prevQuestions: string[],
  prevAnswers: string[],
  instructions: string,
  temperature: number = 0.7
) {
  // Format conversation history for the Responses API
  const conversationHistory = [];
  
  // Add system instructions as 'developer' role (per Responses API requirements)
  conversationHistory.push({
    role: "developer", // Using 'developer' instead of 'system' per Responses API
    content: instructions
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
  
  return generateQuestion(conversationHistory, instructions, temperature);
}
