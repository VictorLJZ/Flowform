import { NextRequest, NextResponse } from "next/server"
import { getFormWithBlocks } from "@/services/form/getFormWithBlocks"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Extract formId from URL
  const formId = request.nextUrl.pathname.split('/').pop();
  try {
    // formId is already extracted from the URL
    const supabase = await createClient();
    
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
    
    // 🔍🧩🔄🔎🔮 DIAGNOSTIC LOG: Check form blocks in API before sending to client
    if (form.blocks && form.blocks.length > 0) {
      console.log(`🔍🧩🔄🔎🔮 API DIAGNOSTIC: Inspecting ${form.blocks.length} blocks BEFORE sending to client`);
      form.blocks.forEach(block => {
        console.log(`🔍🧩🔄🔎🔮 BLOCK ${block.id}: type=${block.type}, subtype=${block.subtype}, title=${block.title}`);
      });
    } else {
      console.log(`🔍🧩🔄🔎🔮 API DIAGNOSTIC: No blocks found in form ${formId} to send to client`);
    }

    if (form.workflow_edges && form.workflow_edges.length > 0) {
      console.log(`🔎 [API Route /api/forms/${formId}] Workflow edges BEFORE JSON serialization:`);
      form.workflow_edges.forEach(edge => {
        console.log(`  Edge ID: ${edge.id}, default_target_id: ${edge.default_target_id}, type: ${typeof edge.default_target_id}, property_exists: ${Object.prototype.hasOwnProperty.call(edge, 'default_target_id')}`);
      });
    } else {
      console.log(`🔎 [API Route /api/forms/${formId}] No workflow edges on form object BEFORE JSON serialization.`);
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
