// Types for form presentation settings

/**
 * Configuration for how a block should be visually presented
 * Matches the BlockPresentation from theme-types.ts
 */
export interface BlockPresentation {
  layout: 'centered' | 'left' | 'right';
  spacing: 'compact' | 'normal' | 'spacious';
  titleSize: 'small' | 'medium' | 'large';
  optionStyle?: 'buttons' | 'cards' | 'minimal';
  backgroundStyle?: 'filled' | 'outlined' | 'plain';
  borderStyle?: 'none' | 'light' | 'normal' | 'heavy';
}

/**
 * Configuration for slide layout options
 * Matches the SlideLayout from layout-types.ts
 */
export type SlideLayout = StandardSlideLayout | MediaLayout;

export interface StandardSlideLayout {
  type: 'standard';
  alignment?: 'left' | 'center' | 'right';
  spacing?: 'compact' | 'normal' | 'spacious';
}

export interface MediaLayout {
  type: 'media-left' | 'media-right' | 'media-background' | 'media-left-split' | 'media-right-split';
  mediaId?: string;
  sizingMode?: 'contain' | 'cover' | 'fill';
  opacity?: number;
  mediaProportion?: number;
  textAlignment?: 'left' | 'center' | 'right';
  spacing?: 'compact' | 'normal' | 'spacious';
  overlayColor?: string;
  overlayOpacity?: number;
  contentPosition?: 'top' | 'center' | 'bottom';
  textColor?: 'light' | 'dark';
} 