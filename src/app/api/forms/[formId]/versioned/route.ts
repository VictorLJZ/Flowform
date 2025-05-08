import { NextRequest, NextResponse } from "next/server"
import { getVersionedFormWithBlocks } from "@/services/form/getVersionedFormWithBlocks"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Extract formId from URL
  const formId = request.nextUrl.pathname.split('/')[3]; // Get the formId from the URL path
  
  try {
    if (!formId) {
      return NextResponse.json(
        { error: "Form ID is required" },
        { status: 400 }
      )
    }
    
    // Create Supabase client
    const supabase = await createClient();
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    const isAuthenticated = !!session?.user;
    
    // Get the versioned form
    const form = await getVersionedFormWithBlocks(formId)
    
    if (!form) {
      return NextResponse.json(
        { error: "Published form version not found" },
        { status: 404 }
      )
    }
    
    // For unauthenticated users, only return published forms
    if (!isAuthenticated && form.status !== 'published') {
      return NextResponse.json(
        { error: "Form not found" }, // Use generic error for security
        { status: 404 }
      )
    }
    
    return NextResponse.json({ form }, { status: 200 })
  } catch (error) {
    console.error("Error retrieving versioned form:", error)
    return NextResponse.json(
      { error: "Failed to retrieve form version" },
      { status: 500 }
    )
  }
}
