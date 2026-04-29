import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

/**
 * Return type of the `uploadToCloudinary` utility function.
 * Returns the full Cloudinary upload response on success, or `null` on failure.
 *
 * @see {@link file://src/utils/cloudinary.js} for the implementation
 */
export type CloudinaryUploadResult = UploadApiResponse | null;

/**
 * Parameters accepted by the `uploadToCloudinary` function.
 */
export interface IUploadToCloudinaryParams {
  /** Absolute path to the local file to upload */
  localFilePath: string;
}

/**
 * Parameters accepted by the `deleteFromCloudinary` function.
 *
 * @note The existing implementation has a bug — it references `ApiError` without importing it.
 *       This type accurately describes the function's parameter contract regardless.
 */
export interface IDeleteFromCloudinaryParams {
  /** The existing Cloudinary URL of the asset to delete (used to determine resource_type) */
  oldUrl: string;

  /** The Cloudinary public ID of the asset to delete */
  publicId: string;
}

/**
 * Configuration shape for Cloudinary SDK initialization.
 * Mirrors the `cloudinary.config()` call in `src/utils/cloudinary.js`.
 */
export interface ICloudinaryConfig {
  cloud_name: string;
  api_key: string;
  api_secret: string;
  secure: boolean;
}

export type { UploadApiResponse, UploadApiErrorResponse };
