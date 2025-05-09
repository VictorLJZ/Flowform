import { NextResponse } from 'next/server';
import { createUploadPreset } from '@/services/cloudinary-server';

export async function GET() {
  try {
    // Create or verify the upload preset exists
    const presetName = await createUploadPreset();
    
    if (!presetName) {
      return NextResponse.json(
        { error: 'Failed to create or verify upload preset' },
        { status: 500 }
      );
    }
    
    // Return the cloudinary configuration needed by the client
    return NextResponse.json({
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      uploadPreset: presetName
    });
    
  } catch (error) {
    console.error('Error setting up Cloudinary config:', error);
    return NextResponse.json(
      { error: 'Something went wrong setting up Cloudinary configuration' },
      { status: 500 }
    );
  }
}
