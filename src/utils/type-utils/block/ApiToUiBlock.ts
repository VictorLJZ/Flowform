/**
 * API to UI Block Transformations
 * 
 * This file provides utility functions for transforming block-related types
 * from API layer to UI layer:
 * - Maintains camelCase naming convention
 * - Adds UI-specific properties for display and interaction
 * - Formats dates and other values for presentation
 */

import { format, formatDistanceToNow } from 'date-fns';

import { 
  ApiBlock, 
  ApiBlockOption, 
  ApiDynamicBlockConfig 
} from '@/types/block/ApiBlock';

import {
  ApiBlockVersion,
  ApiSimpleBlockVersion
} from '@/types/block/ApiBlockVersion';

import { 
  UiBlock, 
  UiBlockOption, 
  UiDynamicBlockConfig
} from '@/types/block/UiBlock';

import {
  UiBlockVersion,
  UiSimpleBlockVersion
} from '@/types/block/UiBlockVersion';

// Map of block subtypes to human-readable display names
const BLOCK_TYPE_DISPLAY_NAMES: Record<string, string> = {
  // Static input blocks
  short_text: 'Short Text',
  long_text: 'Long Text',
  email: 'Email',
  number: 'Number',
  date: 'Date',
  
  // Choice blocks
  multiple_choice: 'Multiple Choice',
  checkbox_group: 'Checkbox',
  dropdown: 'Dropdown',
  
  // Dynamic blocks
  ai_conversation: 'AI Conversation',
  
  // Integration blocks
  hubspot: 'HubSpot',
  
  // Layout blocks
  page_break: 'Page Break',
  redirect: 'Redirect'
};

/**
 * Transform an API block to UI format
 * 
 * @param apiBlock - API block object
 * @returns UI-formatted block object with display properties
 */
export function apiToUiBlock(apiBlock: ApiBlock): UiBlock {
  // Format dates for display
  const formattedDate = apiBlock.createdAt 
    ? format(new Date(apiBlock.createdAt), 'MMM d, yyyy')
    : undefined;

  return {
    ...apiBlock,
    // Add UI-specific properties
    formattedDate,
    displayStatus: 'valid', // Default status
    isVisible: true,
    isEditable: true,
    hasValidationErrors: false,
    validationMessages: []
  };
}

/**
 * Transform multiple API blocks to UI format
 * 
 * @param apiBlocks - Array of API block objects
 * @returns Array of UI-formatted block objects
 */
export function apiToUiBlocks(apiBlocks: ApiBlock[]): UiBlock[] {
  return apiBlocks.map(apiToUiBlock);
}

/**
 * Transform an API block option to UI format
 * 
 * @param apiOption - API block option object
 * @returns UI-formatted block option object with display properties
 */
export function apiToUiBlockOption(apiOption: ApiBlockOption): UiBlockOption {
  return {
    ...apiOption,
    // Add UI-specific properties
    isSelected: false,
    isDisabled: false
  };
}

/**
 * Transform multiple API block options to UI format
 * 
 * @param apiOptions - Array of API block option objects
 * @returns Array of UI-formatted block option objects
 */
export function apiToUiBlockOptions(apiOptions: ApiBlockOption[]): UiBlockOption[] {
  return apiOptions.map(apiToUiBlockOption);
}

/**
 * Transform an API dynamic block config to UI format
 * 
 * @param apiConfig - API dynamic block config object
 * @returns UI-formatted dynamic block config object with display properties
 */
export function apiToUiDynamicBlockConfig(apiConfig: ApiDynamicBlockConfig): UiDynamicBlockConfig {
  // Map temperature value to human-readable display text
  let displayTemperature = 'Medium';
  if (apiConfig.temperature <= 0.3) displayTemperature = 'Low';
  else if (apiConfig.temperature >= 0.7) displayTemperature = 'High';

  return {
    ...apiConfig,
    // Add UI-specific properties
    displayTemperature,
    showSystemPrompt: false,
    showModelSelector: true
  };
}

/**
 * Transform an API block version to UI format
 * 
 * @param apiBlockVersion - API block version object
 * @param previousVersion - Optional previous version for comparison
 * @returns UI-formatted block version object with display properties
 */
export function apiToUiBlockVersion(
  apiBlockVersion: ApiBlockVersion, 
  previousVersion?: ApiBlockVersion
): UiBlockVersion {
  // Format creation date
  const formattedCreatedAt = apiBlockVersion.createdAt 
    ? format(new Date(apiBlockVersion.createdAt), 'MMM d, yyyy')
    : undefined;

  // Determine if block has changed from previous version
  const isDifferentFromPrevious = previousVersion ? 
    (
      apiBlockVersion.title !== previousVersion.title ||
      apiBlockVersion.description !== previousVersion.description ||
      apiBlockVersion.required !== previousVersion.required ||
      apiBlockVersion.type !== previousVersion.type ||
      apiBlockVersion.subtype !== previousVersion.subtype ||
      JSON.stringify(apiBlockVersion.settings) !== JSON.stringify(previousVersion.settings)
    ) : false;

  // Generate a status badge
  let statusBadge: UiBlockVersion['statusBadge'] = 'unchanged';
  if (apiBlockVersion.isDeleted) {
    statusBadge = 'deleted';
  } else if (!previousVersion) {
    statusBadge = 'new';
  } else if (isDifferentFromPrevious) {
    statusBadge = 'modified';
  }

  return {
    ...apiBlockVersion,
    // Add UI-specific properties
    formattedCreatedAt,
    isDifferentFromPrevious,
    statusBadge,
    changeDescription: getChangeDescription(apiBlockVersion, previousVersion)
  };
}

/**
 * Transform multiple API block versions to UI format
 * 
 * @param apiBlockVersions - Array of API block version objects
 * @param previousVersions - Optional map of previous versions keyed by block ID
 * @returns Array of UI-formatted block version objects
 */
export function apiToUiBlockVersions(
  apiBlockVersions: ApiBlockVersion[], 
  previousVersions?: Record<string, ApiBlockVersion>
): UiBlockVersion[] {
  return apiBlockVersions.map(version => {
    const previousVersion = previousVersions?.[version.blockId];
    return apiToUiBlockVersion(version, previousVersion);
  });
}

/**
 * Transform an API simple block version to UI format
 * 
 * @param apiSimpleVersion - API simple block version object
 * @returns UI-formatted simple block version object with display properties
 */
export function apiToUiSimpleBlockVersion(
  apiSimpleVersion: ApiSimpleBlockVersion
): UiSimpleBlockVersion {
  return {
    ...apiSimpleVersion,
    // Add UI-specific properties
    displayType: BLOCK_TYPE_DISPLAY_NAMES[apiSimpleVersion.subtype] || apiSimpleVersion.subtype,
    isCurrentlyActive: false
  };
}

/**
 * Transform multiple API simple block versions to UI format
 * 
 * @param apiSimpleVersions - Array of API simple block version objects
 * @returns Array of UI-formatted simple block version objects
 */
export function apiToUiSimpleBlockVersions(
  apiSimpleVersions: ApiSimpleBlockVersion[]
): UiSimpleBlockVersion[] {
  return apiSimpleVersions.map(apiToUiSimpleBlockVersion);
}

/**
 * Generate a human-readable description of changes between block versions
 * 
 * @param current - Current block version
 * @param previous - Previous block version for comparison
 * @returns Human-readable change description or undefined if no previous version
 */
function getChangeDescription(
  current: ApiBlockVersion, 
  previous?: ApiBlockVersion
): string | undefined {
  if (!previous) return 'New block added';
  if (current.isDeleted) return 'Block removed';
  
  const changes: string[] = [];
  
  if (current.title !== previous.title) {
    changes.push('title changed');
  }
  
  if (current.description !== previous.description) {
    changes.push('description changed');
  }
  
  if (current.required !== previous.required) {
    changes.push(`marked as ${current.required ? 'required' : 'optional'}`);
  }
  
  if (current.type !== previous.type || current.subtype !== previous.subtype) {
    changes.push('block type changed');
  }
  
  if (JSON.stringify(current.settings) !== JSON.stringify(previous.settings)) {
    changes.push('settings changed');
  }
  
  return changes.length > 0 ? changes.join(', ') : undefined;
}
