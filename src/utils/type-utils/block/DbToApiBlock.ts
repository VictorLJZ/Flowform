/**
 * Database to API Block Transformations
 * 
 * This file provides utility functions for transforming block-related types
 * from Database (Db) layer to API layer:
 * - Converts snake_case DB fields to camelCase API fields
 * - Converts null values to undefined for optional fields
 */

import { 
  DbBlock, 
  DbBlockType,
  DbBlockSubtype,
  DbBlockOption, 
  DbDynamicBlockConfig
} from '@/types/block/DbBlock';

import {
  DbBlockVersion,
  DbSimpleBlockVersion
} from '@/types/block/DbBlockVersion';

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

/**
 * Transform a DB block to API format
 * 
 * @param dbBlock - Database block object
 * @returns API-formatted block object
 */
/**
 * Maps DbBlockType to ApiBlockType (they have same values but different types)
 * @param dbType Database block type
 * @returns API block type
 */
export function mapDbToApiBlockType(dbType: DbBlockType): ApiBlockType {
  return dbType as ApiBlockType;
}

/**
 * Maps DbBlockSubtype to ApiBlockSubtype (they have same values but different types)
 * @param dbSubtype Database block subtype
 * @returns API block subtype
 */
export function mapDbToApiBlockSubtype(dbSubtype: DbBlockSubtype): ApiBlockSubtype {
  return dbSubtype as ApiBlockSubtype;
}

/**
 * Transform a DB block to API format
 * 
 * @param dbBlock - Database block object
 * @returns API-formatted block object
 */
export function dbToApiBlock(dbBlock: DbBlock): ApiBlock {
  return {
    id: dbBlock.id,
    formId: dbBlock.form_id,
    type: mapDbToApiBlockType(dbBlock.type),
    subtype: mapDbToApiBlockSubtype(dbBlock.subtype),
    title: dbBlock.title,
    // Convert null to undefined for optional fields
    description: dbBlock.description === null ? undefined : dbBlock.description,
    required: dbBlock.required,
    orderIndex: dbBlock.order_index,
    settings: dbBlock.settings,
    createdAt: dbBlock.created_at,
    updatedAt: dbBlock.updated_at
  };
}

/**
 * Transform multiple DB blocks to API format
 * 
 * @param dbBlocks - Array of database block objects
 * @returns Array of API-formatted block objects
 */
export function dbToApiBlocks(dbBlocks: DbBlock[]): ApiBlock[] {
  return dbBlocks.map(dbToApiBlock);
}

/**
 * Transform a DB block option to API format
 * 
 * @param dbOption - Database block option object
 * @returns API-formatted block option object
 */
export function dbToApiBlockOption(dbOption: DbBlockOption): ApiBlockOption {
  return {
    id: dbOption.id,
    text: dbOption.text,
    value: dbOption.value,
    isDefault: dbOption.is_default,
    orderIndex: dbOption.order_index
  };
}

/**
 * Transform multiple DB block options to API format
 * 
 * @param dbOptions - Array of database block option objects
 * @returns Array of API-formatted block option objects
 */
export function dbToApiBlockOptions(dbOptions: DbBlockOption[]): ApiBlockOption[] {
  return dbOptions.map(dbToApiBlockOption);
}

/**
 * Transform a DB dynamic block config to API format
 * 
 * @param dbConfig - Database dynamic block config object
 * @returns API-formatted dynamic block config object
 */
export function dbToApiDynamicBlockConfig(dbConfig: DbDynamicBlockConfig): ApiDynamicBlockConfig {
  return {
    systemPrompt: dbConfig.system_prompt,
    model: dbConfig.model,
    temperature: dbConfig.temperature,
    maxTokens: dbConfig.max_tokens,
    starterQuestions: dbConfig.starter_questions,
    referenceMaterials: dbConfig.reference_materials
  };
}

/**
 * Transform a DB block version to API format
 * 
 * @param dbBlockVersion - Database block version object
 * @returns API-formatted block version object
 */
export function dbToApiBlockVersion(dbBlockVersion: DbBlockVersion): ApiBlockVersion {
  return {
    id: dbBlockVersion.id,
    blockId: dbBlockVersion.block_id,
    formVersionId: dbBlockVersion.form_version_id,
    title: dbBlockVersion.title,
    description: dbBlockVersion.description,
    type: dbBlockVersion.type as ApiBlockType,
    subtype: dbBlockVersion.subtype,
    required: dbBlockVersion.required,
    orderIndex: dbBlockVersion.order_index,
    settings: dbBlockVersion.settings,
    isDeleted: dbBlockVersion.is_deleted,
    createdAt: dbBlockVersion.created_at
  };
}

/**
 * Transform multiple DB block versions to API format
 * 
 * @param dbBlockVersions - Array of database block version objects
 * @returns Array of API-formatted block version objects
 */
export function dbToApiBlockVersions(dbBlockVersions: DbBlockVersion[]): ApiBlockVersion[] {
  return dbBlockVersions.map(dbToApiBlockVersion);
}

/**
 * Transform a DB simple block version to API format
 * 
 * @param dbSimpleVersion - Database simple block version object
 * @returns API-formatted simple block version object
 */
export function dbToApiSimpleBlockVersion(dbSimpleVersion: DbSimpleBlockVersion): ApiSimpleBlockVersion {
  return {
    id: dbSimpleVersion.id,
    blockId: dbSimpleVersion.block_id,
    title: dbSimpleVersion.title,
    type: dbSimpleVersion.type as ApiBlockType,
    subtype: dbSimpleVersion.subtype
  };
}

/**
 * Transform multiple DB simple block versions to API format
 * 
 * @param dbSimpleVersions - Array of database simple block version objects
 * @returns Array of API-formatted simple block version objects
 */
export function dbToApiSimpleBlockVersions(dbSimpleVersions: DbSimpleBlockVersion[]): ApiSimpleBlockVersion[] {
  return dbSimpleVersions.map(dbToApiSimpleBlockVersion);
}
