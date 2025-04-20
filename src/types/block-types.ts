import type { ElementType, ComponentType } from 'react';

/**
 * Block registry type definitions
 */

/**
 * Types of blocks in the form builder/viewer
 */
export type BlockType = 'static' | 'dynamic' | 'integration' | 'layout';

/**
 * Instance of a block within a form
 */
export interface FormBlock {
  id: string;
  blockTypeId: string;
  type: BlockType;
  title: string;
  description?: string;
  required: boolean;
  order: number;
  settings: Record<string, unknown>;
}

/**
 * Definition of a block, including metadata and components
 */
export interface BlockDefinition {
  id: string;
  type: BlockType;
  name: string;
  description: string;
  icon: ElementType;
  defaultTitle: string;
  defaultDescription?: string;
  category: 'input' | 'choice' | 'advanced' | 'integration' | 'layout';
  isPremium?: boolean;

  /**
   * Component used to render this block in viewer
   */
  renderComponent?: ComponentType<{ block: FormBlock; value?: unknown; onChange?: (value: unknown) => void }>;

  /**
   * Component used to edit block settings in builder
   */
  editComponent?: ComponentType<{ block: FormBlock; updateBlock: (updates: Partial<FormBlock>) => void }>;

  /**
   * Component used to configure block-specific settings
   */
  settingsComponent?: ComponentType<{ block: FormBlock; updateSettings: (settings: Record<string, unknown>) => void }>;

  /**
   * Returns default settings values when new block is created
   */
  getDefaultValues: () => Record<string, unknown>;

  /**
   * Optional validation for block settings or answer
   */
  validate?: (values: Record<string, unknown>) => Record<string, string> | null;
}
