/**
 * Standard API response shape returned by all controllers.
 * Mirrors the `ApiResponse` class in `src/utils/apiResponse.js`.
 *
 * @template T - The type of the `data` payload
 *
 * @example
 * ```ts
 * const response: IApiResponse<IUserDocument> = {
 *   statusCode: 200,
 *   data: user,
 *   message: "User found",
 *   success: true,
 * };
 * ```
 */
export interface IApiResponse<T = unknown> {
  /** HTTP status code */
  statusCode: number;

  /** Response payload */
  data: T;

  /** Human-readable message describing the result */
  message: string;

  /** `true` if `statusCode < 400`, `false` otherwise */
  success: boolean;
}

/**
 * Standard API error shape thrown by controllers and middleware.
 * Mirrors the `ApiError` class in `src/utils/apiError.js`.
 *
 * @example
 * ```ts
 * const error: IApiError = {
 *   statusCode: 400,
 *   data: null,
 *   message: "All fields are required",
 *   success: false,
 *   errors: [],
 * };
 * ```
 */
export interface IApiError {
  /** HTTP status code indicating the error type */
  statusCode: number;

  /** Always `null` for error responses */
  data: null;

  /** Human-readable error message */
  message: string;

  /** Always `false` for error responses */
  success: false;

  /** Array of detailed error messages or validation errors */
  errors: string[];

  /** Optional stack trace (available in development) */
  stack?: string;
}

/**
 * Metadata for paginated responses.
 * Use with `IPaginatedResponse` for list endpoints.
 */
export interface IPaginationMeta {
  /** Total number of documents matching the query */
  total: number;

  /** Current page number (1-indexed) */
  page: number;

  /** Number of documents per page */
  limit: number;

  /** Total number of pages */
  totalPages: number;
}

/**
 * Paginated API response shape for list endpoints.
 * Extends `IApiResponse` with a `pagination` metadata block.
 *
 * @template T - The type of each item in the `data` array
 */
export interface IPaginatedResponse<T> extends IApiResponse<T[]> {
  /** Pagination metadata */
  pagination: IPaginationMeta;
}
