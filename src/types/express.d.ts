import { IUserDocument } from './user.types';

declare global {
  namespace Express {
    /**
     * Extends the Express Request interface to include custom properties
     * added by the application's middleware stack.
     */
    interface Request {
      /**
       * The authenticated user document, attached by the `verifyJWT` middleware.
       * Only present on routes that use the `verifyJWT` middleware.
       * The password and refreshToken fields are excluded via `.select("-password -refreshToken")`.
       */
      user?: IUserDocument;
    }
  }
}

export {};
