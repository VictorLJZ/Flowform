/**
 * Utility Types for FlowForm
 * 
 * This file contains utility types used across the codebase to improve type safety
 * and reduce the use of 'any' types.
 */

/**
 * API Error Response
 */
export interface ApiError {
  code?: string;
  message: string;
  status?: number;
  details?: unknown;
}

/**
 * API Success Response
 */
export interface ApiSuccess<T> {
  data: T;
  status: number;
}

/**
 * Generic API Response type
 */
export type ApiResponse<T> = ApiSuccess<T> | { error: ApiError };

/**
 * Function parameters for error handlers
 */
export interface ErrorHandlerParams {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

/**
 * Type-safe event handler that works with both string and Error types
 */
export type ErrorHandler = (error: Error | string) => void;

/**
 * Type for functions that need to access DOM events
 */
export type DomEventHandler<T extends HTMLElement = HTMLElement> = (event: React.SyntheticEvent<T>) => void;

/**
 * Type-safe replacement for Record<string, any>
 * Use this when you need a flexible object with unknown structure
 */
export type SafeRecord = Record<string, unknown>;

/**
 * Type-safe callback functions
 */
export type Callback<T = void> = () => T;
export type CallbackWithParam<T, R = void> = (param: T) => R;

/**
 * Utility type for catching all React props without using any
 */
export type AnyReactProps = React.PropsWithChildren<{
  [key: string]: unknown;
}>;

/**
 * Type for async function with proper error handling
 */
export type AsyncFn<T> = () => Promise<T>;
export type AsyncFnWithParam<P, T> = (param: P) => Promise<T>;
