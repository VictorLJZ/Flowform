/**
 * FlowForm Slide Layout System Types
 * 
 * This file defines the types used by the slide-based layout system
 * for consistent rendering between form builder and form viewer.
 * Each form block is presented as a full-screen slide with different arrangements
 * of question, answer, and media elements.
 */

/**
 * Available slide layout types
 */
export type SlideLayoutType = 
  | 'standard'         // Standard layout with question and answer field in a vertical arrangement
  | 'media-left'       // Media on the left, question/answer content on the right
  | 'media-right'      // Media on the right, question/answer content on the left
  | 'media-background' // Media as full-screen background with question/answer overlaid
  | 'media-left-split' // Equal split with media on left (50/50 arrangement)
  | 'media-right-split'; // Equal split with media on right (50/50 arrangement)

/**
 * Base layout interface with properties common to all slide layouts
 */
export interface BaseSlideLayout {
  type: SlideLayoutType;
}

/**
 * Standard layout configuration (default vertical arrangement)
 */
export interface StandardSlideLayout extends BaseSlideLayout {
  type: 'standard';
  alignment?: 'left' | 'center' | 'right'; // Text alignment
  spacing?: 'compact' | 'normal' | 'spacious'; // Spacing between elements
}

/**
 * Media position configuration for layouts with media
 */
export interface MediaConfig {
  // If media is not set, we'll show a placeholder in builder mode
  mediaId?: string; // Reference to the media asset
  sizingMode?: 'contain' | 'cover' | 'fill'; // How the media fills its container
  opacity?: number; // 0-100 for background overlay opacity
}

/**
 * Media left layout with question/answer on right
 */
export interface MediaLeftLayout extends BaseSlideLayout, MediaConfig {
  type: 'media-left';
  mediaProportion?: number; // 0.3-0.7 for media width (default 0.4 = 40%)
  textAlignment?: 'left' | 'center' | 'right'; // Text alignment in right section
  spacing?: 'compact' | 'normal' | 'spacious'; // Spacing between elements
}

/**
 * Media right layout with question/answer on left
 */
export interface MediaRightLayout extends BaseSlideLayout, MediaConfig {
  type: 'media-right';
  mediaProportion?: number; // 0.3-0.7 for media width (default 0.4 = 40%)
  textAlignment?: 'left' | 'center' | 'right'; // Text alignment in left section
  spacing?: 'compact' | 'normal' | 'spacious'; // Spacing between elements
}

/**
 * Media as background with content overlaid
 */
export interface MediaBackgroundLayout extends BaseSlideLayout, MediaConfig {
  type: 'media-background';
  overlayColor?: string; // Color for semi-transparent overlay
  overlayOpacity?: number; // 0-100 for overlay opacity
  contentPosition?: 'top' | 'center' | 'bottom'; // Vertical position of content
  textAlignment?: 'left' | 'center' | 'right'; // Text alignment
  textColor?: 'light' | 'dark'; // Text color scheme for better contrast
}

/**
 * Media left split layout (50/50)
 */
export interface MediaLeftSplitLayout extends BaseSlideLayout, MediaConfig {
  type: 'media-left-split';
  textAlignment?: 'left' | 'center' | 'right'; // Text alignment in right section
  spacing?: 'compact' | 'normal' | 'spacious'; // Spacing between elements
}

/**
 * Media right split layout (50/50)
 */
export interface MediaRightSplitLayout extends BaseSlideLayout, MediaConfig {
  type: 'media-right-split';
  textAlignment?: 'left' | 'center' | 'right'; // Text alignment in left section
  spacing?: 'compact' | 'normal' | 'spacious'; // Spacing between elements
}

/**
 * Union type of all slide layout configurations
 */
export type SlideLayout = 
  | StandardSlideLayout 
  | MediaLeftLayout 
  | MediaRightLayout 
  | MediaBackgroundLayout 
  | MediaLeftSplitLayout 
  | MediaRightSplitLayout;

/**
 * Default layout configurations
 */
export const defaultStandardLayout: StandardSlideLayout = {
  type: 'standard',
  alignment: 'center',
  spacing: 'normal'
};

export const defaultMediaLeftLayout: MediaLeftLayout = {
  type: 'media-left',
  mediaProportion: 0.4,
  textAlignment: 'left',
  spacing: 'normal',
  sizingMode: 'cover'
};

export const defaultMediaRightLayout: MediaRightLayout = {
  type: 'media-right',
  mediaProportion: 0.4,
  textAlignment: 'left',
  spacing: 'normal',
  sizingMode: 'cover'
};

export const defaultMediaBackgroundLayout: MediaBackgroundLayout = {
  type: 'media-background',
  overlayColor: '#000000',
  overlayOpacity: 50,
  contentPosition: 'center',
  textAlignment: 'center',
  textColor: 'light',
  sizingMode: 'cover',
  opacity: 100
};

export const defaultMediaLeftSplitLayout: MediaLeftSplitLayout = {
  type: 'media-left-split',
  textAlignment: 'left',
  spacing: 'normal',
  sizingMode: 'cover'
};

export const defaultMediaRightSplitLayout: MediaRightSplitLayout = {
  type: 'media-right-split',
  textAlignment: 'left',
  spacing: 'normal',
  sizingMode: 'cover'
};

/**
 * Get default layout settings based on layout type
 */
export function getDefaultLayoutByType(type: SlideLayoutType): SlideLayout {
  switch (type) {
    case 'media-left':
      return defaultMediaLeftLayout;
    case 'media-right':
      return defaultMediaRightLayout;
    case 'media-background':
      return defaultMediaBackgroundLayout;
    case 'media-left-split':
      return defaultMediaLeftSplitLayout;
    case 'media-right-split':
      return defaultMediaRightSplitLayout;
    default:
      return defaultStandardLayout;
  }
}
