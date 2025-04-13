import { NextResponse } from "next/server";

/**
 * POST /api/reset-workspace-state
 * Utility endpoint to help reset the workspace state stored in localStorage
 * This is a temporary solution to fix workspace ID mismatches
 */
export async function POST() {
  try {
    return NextResponse.json({
      success: true,
      message: "Use this response to clear workspace state",
      instructions: "In your browser console, run: localStorage.removeItem('workspace-storage')",
    });
  } catch (error) {
    console.error("Error in reset-workspace-state", error);
    return NextResponse.json(
      { error: "Failed to process reset request" },
      { status: 500 }
    );
  }
}
