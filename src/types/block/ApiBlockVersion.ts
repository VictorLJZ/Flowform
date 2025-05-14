/**
 * API layer type definitions for form block versions
 * Used for data transfer between client and server
 * Uses camelCase naming convention
 */

import { ApiBlockType, ApiBlockSubtype } from './ApiBlock';

/**
 * API representation of a form block version
 */
export interface ApiBlockVersion {
  id: string;
  blockId: string;
  formVersionId: string;
  title: string | null;
  description: string | null;
  type: ApiBlockType;
  subtype: ApiBlockSubtype;
  required: boolean | null;
  orderIndex: number;
  settings: Record<string, unknown> | null;
  isDeleted: boolean | null;
  createdAt: string | null;
}

/**
 * Simple representation of a block version for analytics and reporting
 */
export interface ApiSimpleBlockVersion {
  id: string;
  blockId: string;
  title: string | null;
  type: ApiBlockType;
  subtype: ApiBlockSubtype;
}