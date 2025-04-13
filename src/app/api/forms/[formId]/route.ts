import { NextRequest, NextResponse } from "next/server"
import { getFormWithBlocks } from "@/services/form/getFormWithBlocks"

export async function GET(
  request: NextRequest,
  context: { params: { formId: string } }
) {
  try {
    const params = context.params;
    const { formId } = params
    
    if (!formId) {
      return NextResponse.json(
        { error: "Form ID is required" },
        { status: 400 }
      )
    }
    
    const form = await getFormWithBlocks(formId)
    
    if (!form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ form }, { status: 200 })
  } catch (error) {
    console.error("Error retrieving form:", error)
    return NextResponse.json(
      { error: "Failed to retrieve form" },
      { status: 500 }
    )
  }
}
