import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/client"
import { generateQuestion } from "@/services/ai/generateQuestion"
import type { QAPair } from "@/types/supabase-types"

export async function POST(
  request: NextRequest,
  { params }: { params: { formId: string; blockId: string } }
) {
  try {
    const { formId, blockId } = params
    const body = await request.json()
    const { conversation, previousResponseId } = body

    if (!formId || !blockId) {
      return NextResponse.json(
        { error: "Form ID and Block ID are required" },
        { status: 400 }
      )
    }

    // Get the dynamic block configuration
    const supabase = createClient()
    const { data: blockConfig, error: configError } = await supabase
      .from("dynamic_block_configs")
      .select("*")
      .eq("block_id", blockId)
      .single()

    if (configError) {
      console.error("[API] Error fetching block config:", configError)
      return NextResponse.json(
        { error: "Failed to fetch block configuration" },
        { status: 500 }
      )
    }

    if (!blockConfig) {
      return NextResponse.json(
        { error: "Block configuration not found" },
        { status: 404 }
      )
    }

    // Format the conversation for OpenAI
    const aiConversation = conversation.map((qa: QAPair) => [
      { role: "assistant", content: qa.question },
      { role: "user", content: qa.answer },
    ]).flat()

    // Add context instructions if available
    if (blockConfig.ai_instructions) {
      aiConversation.unshift({
        role: "developer",
        content: blockConfig.ai_instructions,
      })
    }

    // Generate the next question
    const result = await generateQuestion(
      aiConversation,
      blockConfig.ai_instructions || "",
      blockConfig.temperature || 0.7,
      previousResponseId
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to generate question" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      question: result.data,
      responseId: result.responseId,
      isComplete: conversation.length >= blockConfig.max_questions,
    })
  } catch (error) {
    console.error("[API] Error generating AI question:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : "An unknown error occurred" 
      },
      { status: 500 }
    )
  }
}
