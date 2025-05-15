/**
 * Form View Types
 * 
 * Types specifically used for form viewing and building components.
 */

import { ApiQAPair } from './response';

/**
 * Type alias for the supported answer value types in form responses
 * Covers all possible types that can be submitted as answers across different block types
 */
export type AnswerValue = string | number | string[] | ApiQAPair[];
