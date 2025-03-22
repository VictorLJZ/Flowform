import { NextRequest, NextResponse } from "next/server"
// Update import to ensure we get the latest version with getFormStarterQuestion
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
    const starterQuestion = await formStorageService.getFormStarterQuestion(formId)
    
    if (!starterQuestion) {
      return NextResponse.json(
        { error: "Form starter question not found" },
        { status: 404 }
      )
    }
    
    // Create a new session
    const sessionId = await formStorageService.createFormSession(formId)
    
    return NextResponse.json({
      sessionId,
      starterQuestion
    }, { status: 200 })
  } catch (error) {
    console.error("Error creating form session:", error)
    return NextResponse.json(
      { error: "Failed to create form session" },
      { status: 500 }
    )
  }
}
