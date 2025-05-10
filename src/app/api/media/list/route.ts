import { NextResponse } from 'next/server';
import { getCloudinary, listWorkspaceMediaAssets } from '@/services/cloudinary-server';
import { v4 as uuidv4 } from 'uuid';
import { MediaAsset } from '@/types/media-types';

export async function GET(request: Request) {
  // Get workspaceId from URL params
  const url = new URL(request.url);
  const workspaceId = url.searchParams.get('workspaceId');
  
  if (!workspaceId) {
    return NextResponse.json(
      { error: 'Missing workspaceId parameter' },
      { status: 400 }
    );
  }
  try {
    // Fetch media assets from Cloudinary for the specific workspace
    const result = { resources: await listWorkspaceMediaAssets(workspaceId) };

    // Format the response
    interface CloudinaryResource {
      asset_id?: string;
      public_id: string;
      resource_type: string;
      secure_url: string;
      width: number;
      height: number;
      format: string;
      duration?: number;
      created_at?: string;
      tags?: string[];
    }
    
    const formattedResults: MediaAsset[] = result.resources.map((resource: CloudinaryResource) => ({
      id: resource.asset_id || uuidv4(),
      mediaId: resource.public_id,
      type: resource.resource_type === 'video' ? 'video' : 'image',
      url: resource.secure_url,
      thumbnailUrl: resource.resource_type === 'video' 
        ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/c_limit,h_200,w_200/${resource.public_id}.jpg`
        : resource.secure_url,
      width: resource.width,
      height: resource.height,
      duration: resource.duration,
      createdAt: resource.created_at ? new Date(resource.created_at) : new Date(),
      tags: resource.tags || [],
      workspaceId: workspaceId // Add workspace ID to each media asset
    }));

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error('Error fetching media from Cloudinary:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}
