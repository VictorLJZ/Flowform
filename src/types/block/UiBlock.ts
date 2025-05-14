/**
 * UI layer type definitions for form blocks
 * Extends API types with UI-specific properties
 * Used directly by React components
 */

import type { ElementType, ComponentType } from 'react';
import { 
  ApiBlock, 
  ApiBlockType, 
  ApiBlockOption, 
  ApiDynamicBlockConfig,
  ApiBlockOptionSetting,
  ApiDynamicBlockConfigSetting
} from './ApiBlock';

/**
 * UI representation of a form block, extending the API representation
 * with additional UI-specific properties
 */
export interface UiBlock extends ApiBlock {
  // UI-specific properties
  displayStatus?: 'valid' | 'invalid' | 'pending';
  isVisible?: boolean;
  isEditable?: boolean;
  hasValidationErrors?: boolean;
  validationMessages?: string[];
  formattedDate?: string;
  isNew?: boolean;
}

/**
 * UI representation of a block option
 */
export interface UiBlockOption extends ApiBlockOption {
  isSelected?: boolean;
  isDisabled?: boolean;
  tooltip?: string;
}

/**
 * UI configuration for dynamic blocks with additional display properties
 */
export interface UiDynamicBlockConfig extends ApiDynamicBlockConfig {
  showSystemPrompt?: boolean;
  showModelSelector?: boolean;
  displayTemperature?: string; // Human-readable temperature (e.g., "Low", "Medium", "High")
}

/**
 * UI representation of block settings type for choice options
 * Extends API type with UI-specific properties
 */
export interface UiBlockOptionSetting extends ApiBlockOptionSetting {
  // UI-specific properties
  displayText?: string; // Formatted version of text for display
  tooltip?: string; // Optional tooltip for the option
  isDisabled?: boolean; // Whether the option is disabled
  isSelected?: boolean; // Whether the option is currently selected
}

/**
 * UI configuration for dynamic blocks settings with additional display properties
 * Extends API type with UI-specific properties
 */
export interface UiDynamicBlockConfigSetting extends ApiDynamicBlockConfigSetting {
  displayTemperature?: string; // Human-readable temperature (e.g., "Low", "Medium", "High")
  displayModelName?: string; // User-friendly model name
  previewPrompt?: string; // Preview of the system prompt
  isAdvancedMode?: boolean; // Whether advanced options are shown
}

/**
 * Legacy block compatibility type for transition period
 * This helps us remove the dependency on block-types.ts while maintaining backward compatibility
 */
export type LegacyFormBlock = UiBlock;

/**
 * Definition of a block type, including metadata and components
 * This is used in the block registry for the form builder
 */
export interface UiBlockDefinition {
  id: string;
  type: ApiBlockType;
  name: string;
  description: string;
  icon: ElementType;
  defaultTitle: string;
  defaultDescription?: string;
  category: 'input' | 'choice' | 'advanced' | 'integration' | 'layout';
  isPremium?: boolean;

  /**
   * Component used to render this block in viewer
   * Support both new UiBlock and legacy block format for transition period
   */
  renderComponent?: ComponentType<{ block: UiBlock | LegacyFormBlock; value?: unknown; onChange?: (value: unknown) => void }>;

  /**
   * Component used to edit block settings in builder
   * Support both new UiBlock and legacy block format for transition period
   */
  editComponent?: ComponentType<{ 
    block: UiBlock | LegacyFormBlock; 
    updateBlock: (updates: Partial<UiBlock | LegacyFormBlock>) => void 
  }>;

  /**
   * Component used to configure block-specific settings
   * Support both new UiBlock and legacy block format for transition period
   */
  settingsComponent?: ComponentType<{ 
    block: UiBlock | LegacyFormBlock; 
    updateSettings: (settings: Record<string, unknown>) => void 
  }>;

  /**
   * Returns default settings values when new block is created
   */
  getDefaultValues: () => Record<string, unknown>;

  /**
   * Optional validation for block settings or answer
   */
  validate?: (values: Record<string, unknown>) => Record<string, string> | null;
}