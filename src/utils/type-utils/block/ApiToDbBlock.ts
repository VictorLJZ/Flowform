/**
 * API to Database Block Transformations
 * 
 * This file provides utility functions for transforming block-related types
 * from API layer to Database (Db) layer:
 * - Converts camelCase API fields to snake_case DB fields
 * - Ensures proper handling of optional fields
 */

import { 
  ApiBlock, 
  ApiBlockType,
  ApiBlockSubtype,
  ApiBlockOption, 
  ApiDynamicBlockConfig 
} from '@/types/block/ApiBlock';

import {
  ApiBlockVersion,
  ApiSimpleBlockVersion
} from '@/types/block/ApiBlockVersion';

import { 
  DbBlock, 
  DbApiBlockType,
  DbBlockSubtype,
  DbBlockOption, 
  DbDynamicBlockConfig
} from '@/types/block/DbBlock';

import {
  DbBlockVersion,
  DbSimpleBlockVersion
} from '@/types/block/DbBlockVersion';

/**
 * Transform an API block to DB format
 * 
 * @param apiBlock - API block object
 * @returns Database-formatted block object
 */
/**
 * Maps ApiBlockType to DbApiBlockType (they have same values but different types)
 * @param apiType API block type
 * @returns Database block type
 */
// This function uses type casting but is important for type safety
export function mapApiToDbBlockType(apiType: ApiBlockType): DbApiBlockType {
  return apiType as DbApiBlockType;
}

/**
 * Maps ApiBlockSubtype to DbBlockSubtype (they have same values but different types)
 * @param apiSubtype API block subtype
 * @returns Database block subtype
 */
export function mapApiToDbBlockSubtype(apiSubtype: ApiBlockSubtype): DbBlockSubtype {
  return apiSubtype as DbBlockSubtype;
}

/**
 * Transform an API block to DB format
 * 
 * @param apiBlock - API block object
 * @returns Database-formatted block object
 */
export function apiToDbBlock(apiBlock: ApiBlock): DbBlock {
  return {
    id: apiBlock.id,
    form_id: apiBlock.formId,
    type: mapApiToDbBlockType(apiBlock.type),
    subtype: mapApiToDbBlockSubtype(apiBlock.subtype),
    title: apiBlock.title,
    description: apiBlock.description ?? null,
    required: apiBlock.required,
    order_index: apiBlock.orderIndex,
    settings: apiBlock.settings,
    created_at: apiBlock.createdAt,
    updated_at: apiBlock.updatedAt
  };
}

/**
 * Transform multiple API blocks to DB format
 * 
 * @param apiBlocks - Array of API block objects
 * @returns Array of database-formatted block objects
 */
export function apiToDbBlocks(apiBlocks: ApiBlock[]): DbBlock[] {
  return apiBlocks.map(apiToDbBlock);
}

/**
 * Transform an API block option to DB format
 * 
 * @param apiOption - API block option object
 * @returns Database-formatted block option object
 */
export function apiToDbBlockOption(apiOption: ApiBlockOption): DbBlockOption {
  return {
    id: apiOption.id,
    block_id: apiOption.blockId,
    value: apiOption.value,
    label: apiOption.label,
    order_index: apiOption.orderIndex,
    created_at: apiOption.createdAt
  };
}

/**
 * Transform multiple API block options to DB format
 * 
 * @param apiOptions - Array of API block option objects
 * @returns Array of database-formatted block option objects
 */
export function apiToDbBlockOptions(apiOptions: ApiBlockOption[]): DbBlockOption[] {
  return apiOptions.map(apiToDbBlockOption);
}

/**
 * Transform an API dynamic block config to DB format
 * 
 * @param apiConfig - API dynamic block config object
 * @returns Database-formatted dynamic block config object
 */
export function apiToDbDynamicBlockConfig(apiConfig: ApiDynamicBlockConfig): DbDynamicBlockConfig {
  return {
    block_id: apiConfig.blockId,
    starter_question: apiConfig.starterQuestion,
    temperature: apiConfig.temperature,
    max_questions: apiConfig.maxQuestions,
    ai_instructions: apiConfig.aiInstructions,
    created_at: apiConfig.createdAt,
    updated_at: apiConfig.updatedAt
  };
}

/**
 * Transform an API block version to DB format
 * 
 * @param apiBlockVersion - API block version object
 * @returns Database-formatted block version object
 */
export function apiToDbBlockVersion(apiBlockVersion: ApiBlockVersion): DbBlockVersion {
  return {
    id: apiBlockVersion.id,
    block_id: apiBlockVersion.blockId,
    form_version_id: apiBlockVersion.formVersionId,
    title: apiBlockVersion.title,
    description: apiBlockVersion.description,
    type: apiBlockVersion.type,
    subtype: apiBlockVersion.subtype,
    required: apiBlockVersion.required,
    order_index: apiBlockVersion.orderIndex,
    settings: apiBlockVersion.settings,
    is_deleted: apiBlockVersion.isDeleted,
    created_at: apiBlockVersion.createdAt
  };
}

/**
 * Transform multiple API block versions to DB format
 * 
 * @param apiBlockVersions - Array of API block version objects
 * @returns Array of database-formatted block version objects
 */
export function apiToDbBlockVersions(apiBlockVersions: ApiBlockVersion[]): DbBlockVersion[] {
  return apiBlockVersions.map(apiToDbBlockVersion);
}

/**
 * Transform an API simple block version to DB format
 * 
 * @param apiSimpleVersion - API simple block version object
 * @returns Database-formatted simple block version object
 */
export function apiToDbSimpleBlockVersion(apiSimpleVersion: ApiSimpleBlockVersion): DbSimpleBlockVersion {
  return {
    id: apiSimpleVersion.id,
    block_id: apiSimpleVersion.blockId,
    title: apiSimpleVersion.title,
    type: apiSimpleVersion.type,
    subtype: apiSimpleVersion.subtype
  };
}

/**
 * Transform multiple API simple block versions to DB format
 * 
 * @param apiSimpleVersions - Array of API simple block version objects
 * @returns Array of database-formatted simple block version objects
 */
export function apiToDbSimpleBlockVersions(apiSimpleVersions: ApiSimpleBlockVersion[]): DbSimpleBlockVersion[] {
  return apiSimpleVersions.map(apiToDbSimpleBlockVersion);
}
