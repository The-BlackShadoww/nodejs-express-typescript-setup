import { Document, Model } from 'mongoose';

/**
 * Represents the raw User data shape as defined in the Mongoose schema.
 * Mirrors every field in `src/models/user.model.js` userSchema.
 *
 * @see {@link file://src/models/user.model.js} for the source schema definition
 */
export interface IUser {
  /** Unique username, stored lowercase and trimmed. Indexed for fast lookups. */
  username: string;

  /** User's email address, stored lowercase and trimmed. Must be unique. */
  email: string;

  /** User's full display name, trimmed. Indexed for search. */
  fullName: string;

  /** Cloudinary URL for the user's avatar image. Required. */
  avatar: string;

  /** Cloudinary URL for the user's cover/banner image. Optional. */
  coverImage?: string;

  /** Bcrypt-hashed password. Hashed automatically via a pre-save hook (10 salt rounds). */
  password: string;

  /** JWT refresh token stored for token rotation. Cleared on logout. */
  refreshToken?: string;

  /** Timestamp of document creation (added by Mongoose `timestamps: true`) */
  createdAt: Date;

  /** Timestamp of last document update (added by Mongoose `timestamps: true`) */
  updatedAt: Date;
}

/**
 * Represents a User document as stored in MongoDB.
 * Extends the base `IUser` interface with Mongoose `Document` methods
 * and the custom instance methods defined on the schema.
 *
 * Used as the return type for all User model queries (e.g., `User.findById()`).
 */
export interface IUserDocument extends IUser, Document {
  /**
   * Compares a plain-text password against the stored bcrypt-hashed password.
   * Defined in `userSchema.methods.isPasswordCorrect`.
   *
   * @param password - The plain-text password to verify
   * @returns Promise resolving to `true` if passwords match, `false` otherwise
   */
  isPasswordCorrect(password: string): Promise<boolean>;

  /**
   * Generates a short-lived JWT access token containing user identity claims.
   * Payload: `{ _id, email, username, fullName }`.
   * Signed with `process.env.ACCESS_TOKEN_SECRET`, expires per `process.env.ACCESS_TOKEN_EXPIRY`.
   *
   * @returns Signed JWT string
   */
  generateAccessToken(): string;

  /**
   * Generates a long-lived JWT refresh token for token rotation.
   * Payload: `{ _id }`.
   * Signed with `process.env.REFRESH_TOKEN_SECRET`, expires per `process.env.REFRESH_TOKEN_EXPIRY`.
   *
   * @returns Signed JWT string
   */
  generateRefreshToken(): string;
}

/**
 * Represents the User Mongoose Model with static methods.
 * Currently the User model does not define custom statics — this interface
 * exists for future extensibility and as a typing anchor for `mongoose.model()`.
 *
 * @example
 * ```ts
 * import { User } from '../models/user.model';
 * const user = await (User as IUserModel).findById(id);
 * ```
 */
export interface IUserModel extends Model<IUserDocument> {
  // No custom static methods are currently defined on the User model.
  // Add future static method signatures here.
}

/**
 * Shape of the JWT access token payload after decoding.
 * Matches the claims set in `generateAccessToken()`.
 */
export interface IAccessTokenPayload {
  /** MongoDB ObjectId of the user */
  _id: string;

  /** User's email address */
  email: string;

  /** User's username */
  username: string;

  /** User's full name */
  fullName: string;

  /** Token issued-at timestamp (added by JWT) */
  iat: number;

  /** Token expiration timestamp (added by JWT) */
  exp: number;
}

/**
 * Shape of the JWT refresh token payload after decoding.
 * Matches the claims set in `generateRefreshToken()`.
 */
export interface IRefreshTokenPayload {
  /** MongoDB ObjectId of the user */
  _id: string;

  /** Token issued-at timestamp (added by JWT) */
  iat: number;

  /** Token expiration timestamp (added by JWT) */
  exp: number;
}

/**
 * Shape of the user channel profile returned by the `getUserChannelProfile`
 * aggregation pipeline. Includes computed subscriber counts and subscription status.
 */
export interface IUserChannelProfile {
  /** User's full display name */
  fullName: string;

  /** User's username */
  username: string;

  /** Number of subscribers to this user's channel */
  subscribersCount: number;

  /** Number of channels this user is subscribed to */
  channelsSubscribedToCount: number;

  /** Whether the requesting user is subscribed to this channel */
  isSubscribed: boolean;

  /** Cloudinary URL for the user's avatar */
  avatar: string;

  /** Cloudinary URL for the user's cover image */
  coverImage?: string;

  /** User's email address */
  email: string;
}
