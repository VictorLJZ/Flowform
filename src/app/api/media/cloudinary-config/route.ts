import { NextResponse } from 'next/server';
import { createUploadPreset } from '@/services/cloudinary-server';

export async function GET(request: Request) {
  try {
    // Get workspaceId from URL params
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get('workspaceId');
    
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Missing workspaceId parameter' },
        { status: 400 }
      );
    }
    
    // Create or verify the upload preset exists for this workspace
    const presetName = await createUploadPreset(workspaceId);
    
    if (!presetName) {
      return NextResponse.json(
        { error: 'Failed to create or verify upload preset' },
        { status: 500 }
      );
    }
    
    // Return the cloudinary configuration needed by the client
    return NextResponse.json({
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      uploadPreset: presetName,
      workspaceId // Include workspace ID for client-side reference
    });
    
  } catch (error) {
    console.error('Error setting up Cloudinary config:', error);
    return NextResponse.json(
      { error: 'Something went wrong setting up Cloudinary configuration' },
      { status: 500 }
    );
  }
}
