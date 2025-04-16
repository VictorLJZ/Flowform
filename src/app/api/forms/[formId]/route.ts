import { NextRequest, NextResponse } from "next/server"
import { getFormWithBlocks } from "@/services/form/getFormWithBlocks"
import { createClient } from "@/lib/supabase/client"

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Extract formId from URL
  const formId = request.nextUrl.pathname.split('/').pop();
  try {
    // formId is already extracted from the URL
    const supabase = createClient();
    
    if (!formId) {
      return NextResponse.json(
        { error: "Form ID is required" },
        { status: 400 }
      )
    }
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    const isAuthenticated = !!session?.user;
    
    // Get the form
    const form = await getFormWithBlocks(formId)
    
    if (!form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      )
    }
    
    // For unauthenticated users, only return published forms
    if (!isAuthenticated && form.status !== 'published') {
      return NextResponse.json(
        { error: "Form not found" },  // Use generic error for security
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
