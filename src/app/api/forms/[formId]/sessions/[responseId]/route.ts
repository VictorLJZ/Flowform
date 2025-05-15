import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/client"
import type { StaticAnswerRecord, DynamicResponseRecord } from '@/types/supabase-types'

export async function GET(request: NextRequest) {
  const parts = request.nextUrl.pathname.split("/")
  const formId = parts[3]
  const responseId = parts[5]

  if (!formId || !responseId) {
    return NextResponse.json(
      { error: "Form ID and Session ID are required" },
      { status: 400 }
    )
  }

  try {
    const supabase = createClient()

    // Fetch static answers
    const { data: staticRaw, error: staticError } = await supabase
      .from("static_block_answers")
      .select("block_id, answer")
      .eq("response_id", responseId)
    
    // Transform the raw DB result to match StaticAnswerRecord structure
    const staticData: StaticAnswerRecord[] = (staticRaw ?? []).map(item => ({
      block_id: item.block_id,
      type: "answer", 
      content: item.answer
    }))

    if (staticError) {
      console.error("Error fetching static answers:", staticError)
      return NextResponse.json(
        { error: "Failed to fetch static answers" },
        { status: 500 }
      )
    }

    // Fetch dynamic responses
    const { data: dynamicRaw, error: dynamicError } = await supabase
      .from("dynamic_block_responses")
      .select("block_id, conversation")
      .eq("response_id", responseId)
    const dynamicData = (dynamicRaw ?? []) as DynamicResponseRecord[]

    if (dynamicError) {
      console.error("Error fetching dynamic responses:", dynamicError)
      return NextResponse.json(
        { error: "Failed to fetch dynamic responses" },
        { status: 500 }
      )
    }

    // Combine answers
    const answers: Record<string, StaticAnswerRecord['content'] | DynamicResponseRecord['conversation']> = {}
    staticData.forEach(({ block_id, content }) => {
      answers[block_id] = content
    })
    dynamicData.forEach(({ block_id, conversation }) => {
      answers[block_id] = conversation
    })

    return NextResponse.json({ answers }, { status: 200 })
  } catch (err) {
    console.error("Error in GET session route:", err)
    return NextResponse.json(
      { error: "Failed to fetch session data" },
      { status: 500 }
    )
  }
}
