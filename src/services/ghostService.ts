import type { GhostPost, GhostTag, GhostBrowseParams, GhostReadParams } from '@/types';

/**
 * Ghost Content API Service
 * Provides methods to interact with the Ghost Content API.
 * 'ghost.d.ts' contains the type definition for the API client.
 */

// Standard ES Module import with TypeScript support
import GhostContentAPI from '@tryghost/content-api';

/**
 * Initialize the Ghost Content API client
 */
// Use mock URL for build if environment variables aren't set
const ghost = GhostContentAPI({
  url: process.env.GHOST_API_URL || 'https://demo.ghost.io',  // Default to Ghost demo site if not set
  key: process.env.GHOST_CONTENT_API_KEY || '22444f78447824223cefc48062',  // Demo key (read-only)
  version: 'v5.0'
});

/**
 * Fetch posts from Ghost CMS
 * @param limit Number of posts to fetch (default: 5)
 * @param options Additional query options
 * @returns Promise containing array of GhostPost objects
 */
export const getPosts = async (limit = 5, options: Partial<GhostBrowseParams> = {}): Promise<GhostPost[]> => {
  try {
    // Combine default options with any provided options
    const queryOptions: GhostBrowseParams = {
      limit,
      include: ['tags', 'authors'],
      order: 'published_at DESC',
      ...options
    };
    
    const posts = await ghost.posts.browse(queryOptions);
    return posts as GhostPost[];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

/**
 * Fetch a single post by slug
 * @param slug The post slug
 * @returns Promise containing a GhostPost object or null if not found
 */
export const getPostBySlug = async (slug: string): Promise<GhostPost | null> => {
  try {
    const queryOptions: GhostReadParams = {
      slug,
      include: ['tags', 'authors']
    };
    
    const post = await ghost.posts.read(queryOptions);
    return post as GhostPost;
  } catch (error) {
    console.error(`Error fetching post with slug ${slug}:`, error);
    return null;
  }
};

/**
 * Fetch posts by tag
 * @param tag Tag slug
 * @param limit Number of posts to fetch (default: 5)
 * @returns Promise containing array of GhostPost objects
 */
export const getPostsByTag = async (tag: string, limit = 5): Promise<GhostPost[]> => {
  try {
    const queryOptions: GhostBrowseParams = {
      limit,
      filter: `tag:${tag}`,
      include: ['tags', 'authors'],
      order: 'published_at DESC'
    };
    
    const posts = await ghost.posts.browse(queryOptions);
    return posts as GhostPost[];
  } catch (error) {
    console.error(`Error fetching posts with tag ${tag}:`, error);
    return [];
  }
};

/**
 * Fetch all tags
 * @returns Promise containing array of GhostTag objects
 */
export const getTags = async (): Promise<GhostTag[]> => {
  try {
    const tags = await ghost.tags.browse({
      limit: 'all'
    });
    return tags as GhostTag[];
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
};
