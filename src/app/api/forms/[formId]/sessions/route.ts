import { NextRequest, NextResponse } from "next/server"
import { FormStorageService } from "@/lib/form-generation/form-storage-service"

const formStorageService = new FormStorageService()

export async function POST(
  request: NextRequest,
  context: { params: { formId: string } }
) {
  try {
    const params = await context.params;
    const { formId } = params
    
    if (!formId) {
      return NextResponse.json(
        { error: "Form ID is required" },
        { status: 400 }
      )
    }
    
    // Get the starter question for this form
    const sessionData = await formStorageService.createFormSession(formId)
    
    if (!sessionData) {
      return NextResponse.json(
        { error: "Failed to create form session" },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      sessionId: sessionData.sessionId,
      starterQuestion: sessionData.starterQuestion
    }, { status: 200 })
  } catch (error) {
    console.error("Error creating form session:", error)
    return NextResponse.json(
      { error: "Failed to create form session" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { formId: string } }
) {
  try {
    const params = await context.params;
    const { formId } = params
    
    if (!formId) {
      return NextResponse.json(
        { error: "Form ID is required" },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    const { sessionId, currentQuestion, userAnswer } = body
    
    if (!sessionId || !currentQuestion || !userAnswer) {
      return NextResponse.json(
        { error: "Session ID, current question, and user answer are required" },
        { status: 400 }
      )
    }
    
    // Save the user's response
    const saveSuccess = await formStorageService.saveFormResponse(
      sessionId,
      formId,
      currentQuestion,
      userAnswer
    )
    
    if (!saveSuccess) {
      return NextResponse.json(
        { error: "Failed to save response" },
        { status: 500 }
      )
    }
    
    // Get the next question or complete the form if done
    const nextQuestion = await formStorageService.getNextQuestion(
      formId,
      currentQuestion,
      userAnswer
    )
    
    if (!nextQuestion) {
      // No more questions, mark session as complete
      await formStorageService.completeFormSession(sessionId)
      
      return NextResponse.json({
        completed: true,
        message: "Form completed"
      }, { status: 200 })
    }
    
    return NextResponse.json({
      completed: false,
      nextQuestion: nextQuestion.question_text
    }, { status: 200 })
  } catch (error) {
    console.error("Error processing form response:", error)
    return NextResponse.json(
      { error: "Failed to process form response" },
      { status: 500 }
    )
  }
}
