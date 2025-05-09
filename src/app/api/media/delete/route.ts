import { NextResponse } from 'next/server';
import { getCloudinary } from '@/services/cloudinary-server';

export async function DELETE(request: Request) {
  try {
    const { publicId } = await request.json();
    
    if (!publicId) {
      return NextResponse.json(
        { error: 'Missing publicId parameter' },
        { status: 400 }
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
