import { NextResponse } from "next/server";
import { getLatestFormVersionWithBlocks } from "@/services/form/getLatestFormVersionWithBlocks";

// Let's focus on the simplest way to make this work
export async function GET(request: Request) {  
  // Extract formId from request URL
  const formId = request.url.split('/forms/')[1].split('/latest')[0];
  try {
    // We've already extracted the formId from the URL
    const form = await getLatestFormVersionWithBlocks(formId);
    
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }
    
    return NextResponse.json({ form });
  } catch (error) {
    console.error("Error fetching latest form version:", error);
    return NextResponse.json(
      { error: "Failed to fetch form" }, 
      { status: 500 }
    );
  }
}
