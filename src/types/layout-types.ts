/**
 * FlowForm Slide Layout System Types
 * 
 * This file defines the types used by the slide-based layout system
 * for consistent rendering between form builder and form viewer.
 * Each form block is presented as a full-screen slide with different arrangements
 * of question, answer, and media elements.
 * 
 * The system supports different layouts for desktop and mobile viewports.
 */

/**
 * Available slide layout types
 */
export type SlideLayoutType = 
  // Desktop layouts
  | 'standard'         // Standard layout with question and answer field in a vertical arrangement
  | 'media-left'       // Media on the left, question/answer content on the right
  | 'media-right'      // Media on the right, question/answer content on the left
  | 'media-background' // Media as full-screen background with question/answer overlaid
  | 'media-left-split' // Equal split with media on left (50/50 arrangement)
  | 'media-right-split' // Equal split with media on right (50/50 arrangement)
  // Mobile-specific layouts
  | 'media-top'        // Media on top, question/answer content below
  | 'media-bottom'     // Media on bottom, question/answer content above
  | 'media-between';   // Media between question and answer content

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
 * Media top layout with question/answer below
 */
export interface MediaTopLayout extends BaseSlideLayout, MediaConfig {
  type: 'media-top';
  mediaProportion?: number; // 0.3-0.7 for media height (default 0.4 = 40%)
  textAlignment?: 'left' | 'center' | 'right'; // Text alignment in content section
  spacing?: 'compact' | 'normal' | 'spacious'; // Spacing between elements
}

/**
 * Media bottom layout with question/answer above
 */
export interface MediaBottomLayout extends BaseSlideLayout, MediaConfig {
  type: 'media-bottom';
  mediaProportion?: number; // 0.3-0.7 for media height (default 0.4 = 40%)
  textAlignment?: 'left' | 'center' | 'right'; // Text alignment in content section
  spacing?: 'compact' | 'normal' | 'spacious'; // Spacing between elements
}

/**
 * Media between layout with question above and answer below
 */
export interface MediaBetweenLayout extends BaseSlideLayout, MediaConfig {
  type: 'media-between';
  mediaProportion?: number; // 0.3-0.7 for media height (default 0.3 = 30%)
  textAlignment?: 'left' | 'center' | 'right'; // Text alignment in content sections
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
  | MediaRightSplitLayout
  | MediaTopLayout
  | MediaBottomLayout
  | MediaBetweenLayout;

/**
 * Layout configuration for desktop and mobile viewports
 */
export interface ViewportLayouts {
  desktop: SlideLayout;
  mobile: SlideLayout;
}

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

export const defaultMediaTopLayout: MediaTopLayout = {
  type: 'media-top',
  mediaProportion: 0.4,
  textAlignment: 'center',
  spacing: 'normal',
  sizingMode: 'cover'
};

export const defaultMediaBottomLayout: MediaBottomLayout = {
  type: 'media-bottom',
  mediaProportion: 0.4,
  textAlignment: 'center',
  spacing: 'normal',
  sizingMode: 'cover'
};

export const defaultMediaBetweenLayout: MediaBetweenLayout = {
  type: 'media-between',
  mediaProportion: 0.3,
  textAlignment: 'center',
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
    case 'media-top':
      return defaultMediaTopLayout;
    case 'media-bottom':
      return defaultMediaBottomLayout;
    case 'media-between':
      return defaultMediaBetweenLayout;
    default:
      return defaultStandardLayout;
  }
}

/**
 * Get default layout configuration for both desktop and mobile
 */
export function getDefaultViewportLayouts(): ViewportLayouts {
  return {
    desktop: defaultStandardLayout,
    mobile: defaultMediaTopLayout
  };
}
