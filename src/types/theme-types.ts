/**
 * FlowForm Theme System Types
 * 
 * This file defines the types used by the WYSIWYG theme system
 * for consistent rendering between form builder and form viewer.
 */

/**
 * Form-level theme settings
 */
export interface FormTheme {
  // Color system
  colors: {
    primary: string;
    background: string;
    text: string;
    accent: string;
    success: string;
    error: string;
    border: string;
  };
  
  // Typography settings
  typography: {
    fontFamily: string;
    headingSize: string;
    bodySize: string;
    lineHeight: string;
  };
  
  // Layout settings
  layout: {
    spacing: 'compact' | 'normal' | 'spacious';
    containerWidth: string;
    borderRadius: string;
    borderWidth: string;
    shadowDepth: 'none' | 'light' | 'medium' | 'heavy';
  };
}

/**
 * Block-specific presentation settings
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
 * Configuration for theme system
 */
export interface ThemeConfig {
  mode: 'builder' | 'viewer';
  formTheme: FormTheme;
  defaultBlockPresentation: BlockPresentation;
}

/**
 * Default theme configuration
 */
export const defaultFormTheme: FormTheme = {
  colors: {
    primary: '#0284c7',
    background: '#ffffff',
    text: '#1e293b',
    accent: '#3b82f6',
    success: '#10b981',
    error: '#ef4444',
    border: '#e2e8f0'
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    headingSize: '1.5rem',
    bodySize: '1rem',
    lineHeight: '1.5'
  },
  layout: {
    spacing: 'normal',
    containerWidth: '800px',
    borderRadius: '0.375rem',
    borderWidth: '1px',
    shadowDepth: 'light'
  }
};

/**
 * Default block presentation settings
 */
export const defaultBlockPresentation: BlockPresentation = {
  layout: 'left',
  spacing: 'normal',
  titleSize: 'medium',
  optionStyle: 'minimal',
  backgroundStyle: 'outlined',
  borderStyle: 'light'
};
