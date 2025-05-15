/**
 * Common types used throughout the application
 * This file contains type definitions that are used across multiple components
 */

/**
 * Cloudinary widget configuration options
 */
export interface CloudinaryWidgetOptions {
  cloudName: string;
  uploadPreset: string;
  maxFiles?: number;
  sources?: string[];
  resourceType?: string;
  multiple?: boolean;
  styles?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Cloudinary upload result info
 */
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  resource_type: string;
  thumbnail_url?: string;
  width: number;
  height: number;
  duration?: number;
  tags?: string[];
  [key: string]: unknown;
}

/**
 * Cloudinary widget result
 */
export interface CloudinaryWidgetResult {
  event: string;
  info?: CloudinaryUploadResult;
  [key: string]: unknown;
}

/**
 * Generic JSON value type that can be used instead of 'any'
 * Represents any valid JSON value
 */
export type JsonValue = 
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray;

/**
 * Generic JSON object type that can be used instead of 'Record<string, any>'
 */
export interface JsonObject {
  [key: string]: JsonValue;
}

/**
 * Generic JSON array type
 */
export type JsonArray = JsonValue[];

/**
 * Generic type for callback functions that don't have a specific return type
 */
export type GenericCallback = (...args: unknown[]) => void;

/**
 * Generic type for event handlers
 */
export type GenericEventHandler<T = unknown> = (event: T) => void;

/**
 * Generic type for form event handlers
 */
export type FormEventHandler = GenericEventHandler<React.FormEvent>;

/**
 * Generic type for component props that might have additional properties
 */
export interface ExtendableProps {
  [key: string]: unknown;
}

/**
 * Type for dynamic data that might come from API responses
 */
export type DynamicData = JsonObject | JsonArray;

/**
 * Type for function that can be used to transform data
 */
export type DataTransformer<T = unknown, R = unknown> = (data: T) => R;

/**
 * Backend block data structure
 * This represents the raw block data as it comes from the database
 * before being converted to the frontend UiBlock format
 */
export interface BackendBlockData {
  id: string;
  form_id: string;
  type: string;
  subtype: string;
  title: string;
  description: string | null;
  required: boolean;
  order_index: number;
  settings: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  dynamic_config?: Record<string, unknown>;
  options?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

/**
 * Backend form data structure
 * This represents the raw form data as it comes from the database
 */
export interface BackendFormData {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  workspace_id: string;
  settings: Record<string, unknown> | null;
  blocks?: BackendBlockData[];
  workflow_edges?: Record<string, unknown>[];
  version_id?: string;
  version_number?: number;
  [key: string]: unknown;
}
