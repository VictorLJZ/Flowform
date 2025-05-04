import { create } from 'zustand';
import { getPosts, getPostBySlug, getPostsByTag, getTags, type GhostPost } from '@/services/ghostService';

interface BlogState {
  posts: GhostPost[];
  currentPost: GhostPost | null;
  tags: any[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchPosts: (limit?: number) => Promise<GhostPost[]>;
  fetchPostBySlug: (slug: string) => Promise<GhostPost | null>;
  fetchPostsByTag: (tag: string, limit?: number) => Promise<void>;
  fetchTags: () => Promise<void>;
  reset: () => void;
}

export const useBlogStore = create<BlogState>((set, get) => ({
  posts: [],
  currentPost: null,
  tags: [],
  isLoading: false,
  error: null,
  
  fetchPosts: async (limit = 9) => {
    try {
      set({ isLoading: true, error: null });
      const posts = await getPosts(limit);
      set({ posts, isLoading: false });
      return posts;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch posts';
      set({ error: errorMessage, isLoading: false });
      return [];
    }
  },
  
  fetchPostBySlug: async (slug) => {
    try {
      set({ isLoading: true, error: null });
      const post = await getPostBySlug(slug);
      set({ currentPost: post, isLoading: false });
      return post;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to fetch post ${slug}`;
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },
  
  fetchPostsByTag: async (tag, limit = 9) => {
    try {
      set({ isLoading: true, error: null });
      const posts = await getPostsByTag(tag, limit);
      set({ posts, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to fetch posts with tag ${tag}`;
      set({ error: errorMessage, isLoading: false });
    }
  },
  
  fetchTags: async () => {
    try {
      set({ isLoading: true, error: null });
      const tags = await getTags();
      set({ tags, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tags';
      set({ error: errorMessage, isLoading: false });
    }
  },
  
  reset: () => {
    set({
      posts: [],
      currentPost: null,
      isLoading: false,
      error: null
    });
  }
}));
