/**
 * Ghost Content API Type Definitions
 * Comprehensive types for the Ghost Content API integration
 */

/**
 * Ghost Post interface - represents a blog post from Ghost CMS
 */
export interface GhostPost {
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
  primary_author: GhostAuthor;
  primary_tag?: GhostTag;
  tags?: GhostTag[];
  url?: string;
  canonical_url?: string;
  visibility?: string;
  meta_title?: string;
  meta_description?: string;
}

/**
 * Ghost Author interface - represents a post author in Ghost CMS
 */
export interface GhostAuthor {
  id: string;
  name: string;
  slug: string;
  profile_image: string | null;
  bio?: string;
  website?: string;
  location?: string;
  twitter?: string;
  facebook?: string;
  meta_title?: string;
  meta_description?: string;
}

/**
 * Ghost Tag interface - represents a content tag in Ghost CMS
 */
export interface GhostTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  feature_image?: string | null;
  visibility?: string;
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  og_title?: string;
  og_description?: string;
  twitter_image?: string;
  twitter_title?: string;
  twitter_description?: string;
}

/**
 * Ghost Settings interface - represents the Ghost blog settings
 */
export interface GhostSettings {
  title: string;
  description: string;
  logo?: string;
  icon?: string;
  cover_image?: string;
  facebook?: string;
  twitter?: string;
  lang?: string;
  timezone?: string;
  navigation?: Array<{ label: string; url: string }>;
  secondary_navigation?: Array<{ label: string; url: string }>;
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  og_title?: string;
  og_description?: string;
  twitter_image?: string;
  twitter_title?: string;
  twitter_description?: string;
}

/**
 * Ghost API Parameters interfaces
 */
export interface GhostBrowseParams {
  limit?: number;
  page?: number;
  order?: string;
  filter?: string;
  include?: string | string[];
  fields?: string | string[];
  formats?: string | string[];
}

export interface GhostReadParams {
  id?: string;
  slug?: string;
  include?: string | string[];
  fields?: string | string[];
  formats?: string | string[];
}
