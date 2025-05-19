import { NextResponse } from 'next/server';
import { getCloudinary } from '@/services/cloudinary-server';
import { v4 as uuidv4 } from 'uuid';
import { ApiMediaAsset } from '@/types/media/ApiMedia';

/**
 * Transform media using Cloudinary transformations
 * POST /api/media/transform
 */
export async function POST(request: Request) {
  try {
    // Parse the request body
    const { mediaId, workspaceId, transformations } = await request.json();
    console.log('API RECEIVED:', { mediaId, workspaceId, transformations });
    
    if (!mediaId || !workspaceId || !transformations) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify workspace authorization - implement your authorization checks here
    // TODO: Add authorization checks
    
    // Get Cloudinary instance
    const cloudinary = await getCloudinary();
    
    console.log('MediaID:', mediaId);
    console.log('WorkspaceID:', workspaceId);
    console.log('Applying transformations:', transformations);
    
    // Create an explicit transformation of the image
    // The transformation string is already comma-separated, so we need to split it properly
    const transformArray = transformations.split(',').map((t: string) => t.trim()).filter(Boolean);
    console.log('Transformation array:', transformArray);
    
    // The explicit API requires the full public ID including folder path
    // Make sure we're using the correct format for mediaId
    const fullPublicId = mediaId.includes('/') ? mediaId : `flowform_media/${workspaceId}/${mediaId}`;
    console.log('Using public ID:', fullPublicId);
    
    // For debugging, log the full public ID
    console.log('Full public ID:', fullPublicId);
    
    // The simplest and most reliable approach: use Cloudinary's upload API 
    // with a transformation URL string directly
    
    // First, build the transformation string for the URL
    const transformationString = transformArray.join(',');
    console.log('Transformation string:', transformationString);
    
    // Now build a URL that includes the transformations
    const transformedUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${transformationString}/${fullPublicId}`;
    console.log('Transformed URL:', transformedUrl);
    
    // Use explicit delivery type since we already have the public ID
    const result = await cloudinary.uploader.upload(transformedUrl, {
      public_id: `edited_${Date.now()}`, // Create a new unique ID
      folder: `flowform_media/${workspaceId}`,
      // IMPORTANT: Don't set any transformation parameters as they're already in the URL
      // Let Cloudinary autodetect the resource type
      resource_type: 'auto'
    });
    
    console.log('Upload successful');
    console.log('Result public_id:', result.public_id);
    console.log('Result secure_url:', result.secure_url);
    
    console.log('Cloudinary result:', JSON.stringify(result, null, 2));
    
    if (!result) {
      console.error('Transformation failed - no result returned');
      return NextResponse.json({ error: 'Failed to transform media' }, { status: 500 });
    }
    
    // Format the response as ApiMediaAsset
    const transformedAsset: ApiMediaAsset = {
      id: uuidv4(),
      mediaId: result.public_id,
      userId: '', // Should be populated from the session
      workspaceId,
      filename: result.original_filename || `edited_${Date.now()}`,
      url: result.secure_url, // Note: upload API returns secure_url, not eager results
      secureUrl: result.secure_url,
      type: result.resource_type,
      format: result.format,
      width: result.width,
      height: result.height,
      duration: result.duration || null,
      bytes: result.bytes,
      resourceType: result.resource_type,
      tags: result.tags || [],
      createdAt: new Date().toISOString()
    };
    
    console.log('Transformed asset response:', transformedAsset);

    return NextResponse.json(transformedAsset);
  } catch (error: unknown) {
    console.error('Error in /api/media/transform:', error);
    // Provide more detailed error information
    let errorMessage = 'Unknown error occurred';
    let errorDetails = 'No details available';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack || error.toString();
    } else if (typeof error === 'object' && error !== null) {
      // Try to extract as much information as possible from the error object
      const errorObj = error as Record<string, unknown>;
      errorMessage = String(errorObj.message || errorMessage);
      
      if (errorObj.error && typeof errorObj.error === 'object' && errorObj.error !== null) {
        const errorData = errorObj.error as Record<string, unknown>;
        errorDetails = String(errorData.message || errorObj.toString() || errorDetails);
      } else {
        errorDetails = String(errorObj.toString());
      }
    }
    
    console.error(`Error details: ${errorMessage}\n${errorDetails}`);
    
    return NextResponse.json({ 
      error: 'Failed to transform media', 
      details: errorMessage,
      trace: errorDetails
    }, { status: 500 });
  }
}
