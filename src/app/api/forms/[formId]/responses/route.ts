import { NextRequest, NextResponse } from "next/server"
import { FormStorageService } from "@/lib/form-generation/form-storage-service"
import { FormSession } from "@/types/supabase-types"

const formStorageService = new FormStorageService()

export async function GET(
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
    
    // Get all sessions for this form
    const sessions = await formStorageService.getFormSessions(formId)
    
    if (!sessions || sessions.length === 0) {
      return NextResponse.json(
        { responses: [] },
        { status: 200 }
      )
    }
    
    // Get the conversation data for each session
    const responses = await Promise.all(
      sessions.map(async (session: FormSession) => {
        const conversation = await formStorageService.getConversationHistory(session.id)
        return {
          session,
          questions: conversation.questions,
          answers: conversation.answers
        }
      })
    )
    
    return NextResponse.json({ responses }, { status: 200 })
  } catch (error) {
    console.error("Error getting form responses:", error)
    return NextResponse.json(
      { error: "Failed to retrieve form responses" },
      { status: 500 }
    )
  }
}
