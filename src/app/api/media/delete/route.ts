import { NextResponse } from 'next/server';
import { getCloudinary } from '@/services/cloudinary-server';

export async function DELETE(request: Request) {
  try {
    const { publicId, workspaceId } = await request.json();
    
    if (!publicId || !workspaceId) {
      return NextResponse.json(
        { error: 'Missing required parameters (publicId, workspaceId)' },
        { status: 400 }
      );
    }
    
    // Verify media belongs to the specified workspace
    if (!publicId.includes(`flowform_media/${workspaceId}/`)) {
      return NextResponse.json(
        { error: 'Media asset does not belong to this workspace' },
        { status: 403 }
      );
    }
    
    const cloudinary = await getCloudinary();
    
    // Delete the asset from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result !== 'ok') {
      return NextResponse.json(
        { error: 'Failed to delete media asset', details: result },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, publicId });
  } catch (error) {
    console.error('Error deleting media asset:', error);
    return NextResponse.json(
      { error: 'Something went wrong when deleting the media asset' },
      { status: 500 }
    );
  }
}
