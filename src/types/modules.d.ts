/**
 * Type declarations for external modules without their own type definitions
 */

/**
 * Declaration for the @tryghost/content-api module
 * This provides proper TypeScript integration for the Ghost Content API client
 */
declare module '@tryghost/content-api' {
  import type { GhostPost, GhostTag, GhostAuthor, GhostSettings, GhostBrowseParams, GhostReadParams } from './ghost';

  export interface GhostContentAPIOptions {
    url: string;
    key: string;
    version: string;
  }

  export interface GhostAPI {
    posts: {
      browse: (params?: GhostBrowseParams) => Promise<GhostPost[]>;
      read: (params: GhostReadParams) => Promise<GhostPost>;
    };
    tags: {
      browse: (params?: GhostBrowseParams) => Promise<GhostTag[]>;
      read: (params: GhostReadParams) => Promise<GhostTag>;
    };
    authors: {
      browse: (params?: GhostBrowseParams) => Promise<GhostAuthor[]>;
      read: (params: GhostReadParams) => Promise<GhostAuthor>;
    };
    pages: {
      browse: (params?: GhostBrowseParams) => Promise<GhostPost[]>;
      read: (params: GhostReadParams) => Promise<GhostPost>;
    };
    settings: {
      browse: () => Promise<GhostSettings>;
    };
  }

  // Default export is a function that creates a GhostAPI instance
  export default function GhostContentAPI(options: GhostContentAPIOptions): GhostAPI;
}
