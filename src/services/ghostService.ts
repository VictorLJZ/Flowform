import GhostContentAPI from '@tryghost/content-api';

// Initialize Ghost Content API
// @ts-ignore - The type definitions for GhostContentAPI are provided in types/ghost.d.ts
const ghost = new GhostContentAPI({
  url: process.env.GHOST_API_URL || '',
  key: process.env.GHOST_CONTENT_API_KEY || '',
  version: 'v5.0'
});

export type GhostPost = {
  id: string;
  uuid: string;
  title: string;
  slug: string;
  html: string;
  excerpt: string;
  feature_image: string | null;
  featured: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  reading_time: number;
  primary_author: {
    id: string;
    name: string;
    slug: string;
    profile_image: string | null;
  };
  primary_tag?: {
    id: string;
    name: string;
    slug: string;
  };
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
};

/**
 * Fetch posts from Ghost CMS
 * @param limit Number of posts to fetch (default: 5)
 * @param options Additional query options
 */
export const getPosts = async (limit = 5, options = {}) => {
  try {
    return await ghost.posts.browse({
      limit,
      include: ['tags', 'authors'],
      order: 'published_at DESC',
      ...options
    }) as GhostPost[];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

/**
 * Fetch a single post by slug
 * @param slug The post slug
 */
export const getPostBySlug = async (slug: string) => {
  try {
    return await ghost.posts.read({
      slug,
      include: ['tags', 'authors']
    }) as GhostPost;
  } catch (error) {
    console.error(`Error fetching post with slug ${slug}:`, error);
    return null;
  }
};

/**
 * Fetch posts by tag
 * @param tag Tag slug
 * @param limit Number of posts to fetch (default: 5)
 */
export const getPostsByTag = async (tag: string, limit = 5) => {
  try {
    return await ghost.posts.browse({
      limit,
      filter: `tag:${tag}`,
      include: ['tags', 'authors'],
      order: 'published_at DESC'
    }) as GhostPost[];
  } catch (error) {
    console.error(`Error fetching posts with tag ${tag}:`, error);
    return [];
  }
};

/**
 * Fetch all tags
 */
export const getTags = async () => {
  try {
    return await ghost.tags.browse({
      limit: 'all'
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
};
