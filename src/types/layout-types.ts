/**
 * FlowForm Layout System Types
 * 
 * This file defines the types used by the block-level layout system
 * for consistent rendering between form builder and form viewer.
 */

/**
 * Base layout type
 */
export type LayoutType = 'standard' | 'grid' | 'card' | 'section';

/**
 * Base layout interface with properties common to all layouts
 */
export interface BaseLayout {
  type: LayoutType;
}

/**
 * Grid layout configuration
 */
export interface GridLayout extends BaseLayout {
  type: 'grid';
  columns: 1 | 2 | 3 | 4;
  gapX: 'none' | 'small' | 'medium' | 'large';
  gapY: 'none' | 'small' | 'medium' | 'large';
}

/**
 * Card layout configuration
 */
export interface CardLayout extends BaseLayout {
  type: 'card';
  shadow: 'none' | 'sm' | 'md' | 'lg';
  border: boolean;
  padding: 'none' | 'sm' | 'md' | 'lg';
  rounded: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Section layout configuration
 */
export interface SectionLayout extends BaseLayout {
  type: 'section';
  titleSize: 'small' | 'medium' | 'large';
  separator: boolean;
  spacing: 'compact' | 'normal' | 'spacious';
}

/**
 * Standard layout configuration (default FormBlockWrapper)
 */
export interface StandardLayout extends BaseLayout {
  type: 'standard';
}

/**
 * Union type of all layout configurations
 */
export type BlockLayout = StandardLayout | GridLayout | CardLayout | SectionLayout;

/**
 * Default layout configurations
 */
export const defaultGridLayout: GridLayout = {
  type: 'grid',
  columns: 2,
  gapX: 'medium',
  gapY: 'medium'
};

export const defaultCardLayout: CardLayout = {
  type: 'card',
  shadow: 'sm',
  border: true,
  padding: 'md',
  rounded: 'md'
};

export const defaultSectionLayout: SectionLayout = {
  type: 'section',
  titleSize: 'medium',
  separator: true,
  spacing: 'normal'
};

export const defaultStandardLayout: StandardLayout = {
  type: 'standard'
};

/**
 * Get default layout settings based on layout type
 */
export function getDefaultLayoutByType(type: LayoutType): BlockLayout {
  switch (type) {
    case 'grid':
      return defaultGridLayout;
    case 'card':
      return defaultCardLayout;
    case 'section':
      return defaultSectionLayout;
    default:
      return defaultStandardLayout;
  }
}
