import { NextRequest, NextResponse } from "next/server"
import { FormStorageService } from "@/lib/form-generation/form-storage-service"
import { AIFormService } from "@/lib/form-generation/ai-form-service"
import { RAGService } from "@/app/rag/rag-service"

const formStorageService = new FormStorageService()
const aiFormService = new AIFormService()
const ragService = new RAGService()

export async function POST(
  request: NextRequest,
  context: { params: { formId: string; sessionId: string } }
) {
  try {
    const params = await context.params;
    const { formId, sessionId } = params
    
    if (!formId || !sessionId) {
      return NextResponse.json(
        { error: "Form ID and Session ID are required" },
        { status: 400 }
      )
    }
    
    // Parse the request body to get the user's answer
    const { answer } = await request.json()
    
    if (!answer) {
      return NextResponse.json(
        { error: "Answer is required" },
        { status: 400 }
      )
    }
    
    // Get the current question for this session
    const currentQuestion = await formStorageService.getCurrentSessionQuestion(sessionId)
    
    if (!currentQuestion) {
      return NextResponse.json(
        { error: "Current question not found" },
        { status: 404 }
      )
    }
    
    // Save the user's answer
    await formStorageService.saveAnswer(formId, currentQuestion.id, answer, sessionId)
    
    // Get the form to check max_questions
    const form = await formStorageService.getFormById(formId)
    
    if (!form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      )
    }
    
    // Get the session to check current question index
    const session = await formStorageService.getSessionById(sessionId)
    
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }
    
    // Check if we've reached the maximum number of questions
    if (session.current_question_index >= form.max_questions - 1) {
      // Mark the session as completed
      await formStorageService.completeSession(sessionId)
      
      // Trigger RAG indexing asynchronously (don't await)
      triggerAsyncIndexing(formId);
      
      return NextResponse.json({
        isLastQuestion: true,
        message: "Form completed"
      }, { status: 200 })
    }
    
    // Generate the next question based on previous conversation
    const previousQuestions = await formStorageService.getSessionQuestions(sessionId)
    const previousAnswers = await formStorageService.getSessionAnswers(sessionId)
    
    // Use the AI service to generate the next question
    const nextQuestion = await aiFormService.generateNextQuestion(
      form,
      previousQuestions,
      previousAnswers
    )
    
    // Save the new question
    const newQuestionId = await formStorageService.saveQuestion(
      formId,
      nextQuestion,
      session.current_question_index + 1,
      false // Not a starter question
    )
    
    // Update the session with the new question
    await formStorageService.updateSessionQuestion(sessionId, session.current_question_index + 1)
    
    return NextResponse.json({
      isLastQuestion: false,
      nextQuestion,
      questionId: newQuestionId
    }, { status: 200 })
  } catch (error) {
    console.error("Error processing answer:", error)
    return NextResponse.json(
      { error: "Failed to process answer" },
      { status: 500 }
    )
  }
}

/**
 * Trigger RAG indexing asynchronously to avoid blocking the response
 */
function triggerAsyncIndexing(formId: string): void {
  // Use Promise without await to run asynchronously
  Promise.resolve().then(async () => {
    try {
      console.log(`Triggering automatic indexing for form ${formId}`);
      await ragService.indexFormResponses(formId);
      console.log(`Successfully indexed form ${formId} after submission`);
    } catch (error) {
      // Log error but don't fail the request
      console.error(`Error auto-indexing form ${formId}:`, error);
    }
  });
}
