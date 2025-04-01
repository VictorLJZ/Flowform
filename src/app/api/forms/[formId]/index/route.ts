import { NextRequest, NextResponse } from "next/server";
import { RAGService } from "@/app/rag/rag-service";

export async function POST(
  request: NextRequest,
  context: { params: { formId: string } }
) {
  try {
    const params = await context.params;
    const { formId } = params;
    
    if (!formId) {
      return NextResponse.json(
        { error: "Form ID is required" },
        { status: 400 }
      );
    }
    
    // Index the form responses
    await RAGService.indexFormResponses(formId);
    
    return NextResponse.json({ 
      success: true,
      message: "Form responses indexed successfully" 
    }, { status: 200 });
  } catch (error) {
    console.error("Error indexing form responses:", error);
    return NextResponse.json(
      { error: "Failed to index responses" },
      { status: 500 }
    );
  }
} 