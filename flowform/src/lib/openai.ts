import OpenAI from 'openai';

// Initialize the OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function for text generation using the Responses API
export async function generateText(
  prompt: string,
  options: {
    temperature?: number;
    instructions?: string;
  } = {}
) {
  const { temperature = 0.7, instructions } = options;
  
  // Using the new Responses API format (NOT the legacy Chat Completions API)
  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      // Using "developer" instead of "system" for system messages
      ...(instructions ? [{ role: "developer", content: instructions }] : []),
      { role: "user", content: prompt }
    ],
    temperature,
  });

  // Helper property for text in the new API
  return response.output_text;
}

// Helper function for question generation specific to our form application
export async function generateNextQuestion(
  previousQuestions: string[],
  previousAnswers: string[],
  formInstructions: string,
  temperature: number = 0.7
) {
  // Construct conversation history using the new Responses API format
  const input = [];
  
  // Add developer instructions
  input.push({
    role: "developer",
    content: `${formInstructions}
    
    You are generating the next question in a dynamic form. Based on previous questions and answers, create a relevant follow-up question that explores the topic further or investigates new related aspects.
    
    Previous questions and answers are provided for context. Respond ONLY with the next question, nothing else.`
  });
  
  // Add previous Q&A context
  for (let i = 0; i < previousQuestions.length; i++) {
    input.push({ role: "assistant", content: previousQuestions[i] });
    
    if (i < previousAnswers.length) {
      input.push({ role: "user", content: previousAnswers[i] });
    }
  }
  
  // Using the new Responses API format
  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input,
    temperature,
  });
  
  return response.output_text;
}

// Function for RAG-powered analysis with function calling
export async function analyzeResponses(
  question: string, 
  relevantQAPairs: Array<{question: string, answer: string}>,
  options: {
    temperature?: number;
  } = {}
) {
  const { temperature = 0.7 } = options;
  
  // Format the context from retrieved QA pairs
  const context = relevantQAPairs.map((qa, i) => 
    `QA Pair ${i+1}:\nQuestion: ${qa.question}\nAnswer: ${qa.answer}`
  ).join('\n\n');
  
  // Using the new Responses API format
  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      { 
        role: "developer", 
        content: `You are analyzing form responses using retrieved question-answer pairs as context.
        Based only on the provided context, answer the user's question.
        If the answer cannot be determined from the context, say so clearly.`
      },
      { 
        role: "user", 
        content: `Context:\n${context}\n\nQuestion: ${question}` 
      }
    ],
    temperature,
  });
  
  return response.output_text;
}

// Example of function calling with the new Responses API
export async function generateWithFunctionCalling(
  prompt: string,
  options: {
    temperature?: number;
  } = {}
) {
  const { temperature = 0.7 } = options;
  
  const input = [
    { role: "user", content: prompt }
  ];
  
  // Using the new Responses API function calling format
  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input,
    temperature,
    tools: [{
      type: "function",
      name: "get_form_metrics",
      description: "Get metrics about form responses",
      parameters: {
        type: "object",
        properties: {
          formId: {
            type: "string",
            description: "ID of the form to get metrics for"
          },
          metricType: {
            type: "string",
            enum: ["completion_rate", "average_time", "response_count"],
            description: "Type of metric to retrieve"
          }
        },
        required: ["formId", "metricType"]
      },
      strict: true
    }]
  });
  
  // Handle function calls with the new format
  const toolCall = response.tool_calls?.[0];
  
  if (toolCall) {
    // Example handling function call result
    const params = JSON.parse(toolCall.function.arguments);
    const result = `Metrics for form ${params.formId}: 10 responses`;
    
    // Continue the conversation with function call result
    input.push(toolCall);
    input.push({
      type: "function_call_output",
      call_id: toolCall.id,
      output: result
    });
    
    // Get final response
    const finalResponse = await openai.responses.create({
      model: "gpt-4o-mini",
      input,
      temperature,
    });
    
    return finalResponse.output_text;
  }
  
  return response.output_text;
}

// Example of state management with the Responses API
export async function continueConversation(
  previousResponseId: string,
  newUserMessage: string,
  options: {
    temperature?: number;
  } = {}
) {
  const { temperature = 0.7 } = options;
  
  // Using state management with the Responses API
  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    previous_response_id: previousResponseId,
    input: [
      { role: "user", content: newUserMessage }
    ],
    temperature,
  });
  
  return response;
}
