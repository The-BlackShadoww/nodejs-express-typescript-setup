import { Request, Response, NextFunction } from 'express';

/**
 * Type signature for the `asyncHandler` higher-order function.
 * Wraps an async Express request handler and catches any rejected promises,
 * forwarding errors to Express's `next()` error handler.
 *
 * @see {@link file://src/utils/asyncHandler.js} for the implementation
 *
 * @example
 * ```ts
 * const myHandler: AsyncRequestHandler = async (req, res) => {
 *   const data = await someAsyncOperation();
 *   res.status(200).json(new ApiResponse(200, data, "Success"));
 * };
 *
 * export const myController = asyncHandler(myHandler);
 * ```
 */
export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;

/**
 * Type signature for the `asyncHandler` wrapper function itself.
 * Takes an async request handler and returns a standard Express middleware.
 */
export type AsyncHandlerFn = (
  requestHandler: AsyncRequestHandler
) => (req: Request, res: Response, next: NextFunction) => void;

/**
 * Cookie options used throughout the application for setting
 * access and refresh token cookies.
 * Mirrors the `options` object defined in the login/logout controllers.
 */
export interface ICookieOptions {
  /** Prevents client-side JavaScript from accessing the cookie */
  httpOnly: boolean;

  /** Only sends the cookie over HTTPS connections */
  secure: boolean;
}

/**
 * Shape of the login/refresh response data payload.
 * Returned in the `data` field of `ApiResponse` during login and token refresh.
 */
export interface IAuthTokens {
  /** Short-lived JWT access token */
  accessToken: string;

  /** Long-lived JWT refresh token */
  refreshToken: string;
}

/**
 * Shape of the login response data payload.
 * Extends auth tokens with the user document.
 */
export interface ILoginResponseData extends IAuthTokens {
  /** The authenticated user document (without password and refreshToken fields) */
  user: Record<string, unknown>;
}

/**
 * Database connection constants used across the application.
 * Mirrors exports from `src/constant.js`.
 */
export interface IConstants {
  /** MongoDB database name */
  DB_NAME: string;
}

/**
 * Generic MongoDB ObjectId string type.
 * Used for referencing document IDs throughout the codebase.
 */
export type ObjectIdString = string;

/**
 * Utility type to make specific properties optional.
 * Useful for update operations where only some fields are provided.
 *
 * @template T - The base type
 * @template K - The keys to make optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Utility type to extract only the public-facing fields from a user document.
 * Excludes sensitive fields like password and refreshToken.
 */
export type SafeUser = Omit<
  import('./user.types').IUser,
  'password' | 'refreshToken'
>;
