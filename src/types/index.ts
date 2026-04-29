/**
 * Central barrel file for all TypeScript type definitions.
 * Import from this file to access any type in the project.
 *
 * @example
 * ```ts
 * import { IUser, IUserDocument, IApiResponse, AsyncRequestHandler } from '../types';
 * ```
 *
 * @module types
 */

// ─── Environment & Express Augmentations ─────────────────────────
// These are ambient declaration files (.d.ts) that auto-extend global types.
// They do not need to be explicitly imported — TypeScript picks them up automatically.
// Listed here for documentation purposes:
//   - ./environment.d.ts  → types process.env
//   - ./express.d.ts      → extends Express.Request with `user`

// ─── API Types ───────────────────────────────────────────────────
export type {
  IApiResponse,
  IApiError,
  IPaginationMeta,
  IPaginatedResponse,
} from './api.types';

// ─── User Types ──────────────────────────────────────────────────
export type {
  IUser,
  IUserDocument,
  IUserModel,
  IAccessTokenPayload,
  IRefreshTokenPayload,
  IUserChannelProfile,
} from './user.types';

// ─── Cloudinary Types ────────────────────────────────────────────
export type {
  CloudinaryUploadResult,
  IUploadToCloudinaryParams,
  IDeleteFromCloudinaryParams,
  ICloudinaryConfig,
} from './cloudinary.types';

// ─── Common / Utility Types ─────────────────────────────────────
export type {
  AsyncRequestHandler,
  AsyncHandlerFn,
  ICookieOptions,
  IAuthTokens,
  ILoginResponseData,
  IConstants,
  ObjectIdString,
  PartialBy,
  SafeUser,
} from './common.types';
