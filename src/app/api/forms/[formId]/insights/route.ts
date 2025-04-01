import { NextRequest, NextResponse } from "next/server";
import { RAGService } from "@/app/rag/rag-service";

export async function GET(
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
    
    // Generate insights using a default question about insights
    const insights = await RAGService.generateAnalysisResponse(
      formId, 
      "Generate key insights and patterns from all the responses to this form. What are the main trends, common themes, and notable outliers?"
    );
    
    return NextResponse.json({ insights }, { status: 200 });
  } catch (error) {
    console.error("Error generating insights:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}
