import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/client"
import { generateQuestion } from "@/services/ai/generateQuestion"
import type { QAPair } from "@/types/supabase-types"

// For Next.js App Router, we use this format for route handlers
export async function POST(request: Request) {
  try {
    // Extract formId and blockId from URL path
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const formId = pathParts[pathParts.indexOf('forms') + 1];
    const blockId = pathParts[pathParts.indexOf('blocks') + 1];
    
    const body = await request.json();
    const { conversation, previousResponseId } = body;

    if (!formId || !blockId) {
      return NextResponse.json(
        { error: "Form ID and Block ID are required" },
        { status: 400 }
      )
    }

    // Get the block directly from form_blocks instead of using dynamic_block_configs
    const supabase = createClient()
    const { data: blockData, error: blockError } = await supabase
      .from("form_blocks")
      .select("*")
      .eq("id", blockId)
      .single()

    if (blockError) {
      console.error("[API] Error fetching block data:", blockError)
      return NextResponse.json(
        { error: "Failed to fetch block data" },
        { status: 500 }
      )
    }

    if (!blockData) {
      return NextResponse.json(
        { error: "Block not found" },
        { status: 404 }
      )
    }

    // Extract settings from block data
    const temperature = blockData.settings?.temperature || 0.7;
    const maxQuestions = blockData.settings?.maxQuestions || 5;
    const contextInstructions = blockData.settings?.contextInstructions || '';

    // Format the conversation for OpenAI
    const aiConversation = conversation.map((qa: QAPair) => [
      { role: "assistant", content: qa.question },
      { role: "user", content: qa.answer },
    ]).flat()

    // Add context instructions if available
    if (contextInstructions) {
      aiConversation.unshift({
        role: "developer",
        content: contextInstructions,
      })
    }

    // Generate the next question
    const result = await generateQuestion(
      aiConversation,
      contextInstructions,
      temperature,
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
      isComplete: conversation.length >= maxQuestions,
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
