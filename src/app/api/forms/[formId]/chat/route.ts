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
    
    // Get the query and chat history from the request body
    const { query, chatHistory = [] } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }
    
    // Process the query using RAG
    const answer = await RAGService.generateAnalysisResponse(formId, query);
    
    return NextResponse.json({ answer }, { status: 200 });
  } catch (error) {
    console.error("Error processing chat query:", error);
    return NextResponse.json(
      { error: "Failed to process query" },
      { status: 500 }
    );
  }
} 