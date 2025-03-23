import { NextRequest, NextResponse } from "next/server";
import { RAGService } from "@/app/rag/rag-service";

const ragService = new RAGService();

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
    
    // Generate insights
    const insights = await ragService.generateInsights(formId);
    
    return NextResponse.json({ insights }, { status: 200 });
  } catch (error) {
    console.error("Error generating insights:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}
