/**
 * Types for media assets in the form builder
 */

export type MediaType = 'image' | 'video';

export interface MediaAsset {
  id: string;
  mediaId: string; // Will be used for external storage (Cloudinary) later
  type: MediaType;
  url: string;
  thumbnailUrl: string;
  width?: number;
  height?: number;
  duration?: number; // For videos
  createdAt: Date;
  tags?: string[];
  workspaceId?: string; // Workspace this media belongs to
}

// For mock/demo purposes until Cloudinary integration
export const mockMediaAssets: MediaAsset[] = [
  {
    id: 'mock-img-1',
    mediaId: 'mock-img-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1626544827763-d516dce335e2?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    thumbnailUrl: 'https://images.unsplash.com/photo-1626544827763-d516dce335e2?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    width: 2670,
    height: 4000,
    createdAt: new Date(),
    tags: ['nature', 'landscape'],
    workspaceId: 'mock-workspace-id'
  },
  {
    id: 'mock-img-2',
    mediaId: 'mock-img-2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    width: 2670,
    height: 1503,
    createdAt: new Date(),
    tags: ['gradient', 'design'],
    workspaceId: 'mock-workspace-id'
  },
  {
    id: 'mock-vid-1',
    mediaId: 'mock-vid-1',
    type: 'video',
    url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526323633454-e20d669ae21b?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    width: 1280,
    height: 720,
    duration: 10,
    createdAt: new Date(),
    tags: ['video', 'sample'],
    workspaceId: 'mock-workspace-id'
  }
];
