declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /** Server port number (default: 8000) */
      PORT: string;

      /** MongoDB connection URI (e.g., mongodb://localhost:27017) */
      MONGODB_URI: string;

      /** Allowed CORS origin (e.g., http://localhost:3000 or *) */
      CORS_ORIGIN: string;

      /** Secret key used to sign refresh tokens */
      REFRESH_TOKEN_SECRET: string;

      /** Refresh token expiry duration (e.g., "10d") */
      REFRESH_TOKEN_EXPIRY: string;

      /** Secret key used to sign access tokens */
      ACCESS_TOKEN_SECRET: string;

      /** Access token expiry duration (e.g., "1d") */
      ACCESS_TOKEN_EXPIRY: string;

      /** Cloudinary cloud name for media uploads */
      CLOUDINARY_CLOUD_NAME: string;

      /** Cloudinary API key for authentication */
      CLOUDINARY_API_KEY: string;

      /** Cloudinary API secret for authentication */
      CLOUDINARY_API_SECRET: string;

      /** Full Cloudinary URL (alternative to individual credentials) */
      CLOUDINARY_URL: string;

      /** Current environment mode */
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

export {};
