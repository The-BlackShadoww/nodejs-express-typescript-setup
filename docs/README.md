# Node.js Express Project Setup with TypeScript

A production-ready Node.js/Express backend API for a video-sharing platform, built with MongoDB and enhanced with TypeScript type safety.

---

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | ≥18.x | JavaScript runtime |
| **Express** | 5.2.x | Web framework |
| **MongoDB** | — | Database |
| **Mongoose** | 9.6.x | MongoDB ODM |
| **TypeScript** | 6.0.x | Static type checking (additive layer) |
| **JWT** | 9.0.x | Authentication tokens |
| **bcrypt** | 6.0.x | Password hashing |
| **Multer** | 2.1.x | File upload handling |
| **Cloudinary** | 2.10.x | Cloud media storage |
| **CORS** | 2.8.x | Cross-origin resource sharing |
| **cookie-parser** | 1.4.x | Cookie parsing middleware |
| **dotenv** | 17.4.x | Environment variable management |

---

## Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MongoDB** — running locally or a cloud instance (e.g., MongoDB Atlas)
- **Cloudinary account** — for media uploads ([sign up free](https://cloudinary.com/))

---

## Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/The-BlackShadoww/nodejs-express-project-setup-with-typescript.git
cd nodejs-express-project-setup-with-typescript
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` with your actual values (see [Environment Variables](#environment-variables) below).

### 4. Start MongoDB
Ensure your MongoDB instance is running:
```bash
# Local MongoDB
mongod

# Or use your MongoDB Atlas connection string in .env
```

### 5. Run the development server
```bash
# Run existing JavaScript code directly (requires a compatible runtime)
node src/index.js

# Run with TypeScript support via ts-node
npm run ts:dev
```

The server will start on `http://localhost:8000` (or your configured `PORT`).

---

## Project Structure

```
nodejs-express-project-setup-with-typescript/
│
├── src/                          # Application source code
│   ├── index.js                  # Server entry point — loads env, connects DB, starts listening
│   ├── app.js                    # Express app — middleware stack, route mounting
│   ├── constant.js               # Application constants (DB_NAME)
│   │
│   ├── controllers/              # Request handlers — business logic per resource
│   │   └── user.controller.js    # User CRUD, auth, profile, channel operations
│   │
│   ├── db/                       # Database configuration
│   │   └── index.js              # MongoDB connection via Mongoose
│   │
│   ├── middlewares/              # Express middleware functions
│   │   ├── auth.middleware.js    # JWT verification — attaches user to req.user
│   │   └── multer.middleware.js  # File upload handling via Multer
│   │
│   ├── models/                   # Mongoose schema definitions
│   │   └── user.model.js         # User schema with bcrypt hooks and JWT methods
│   │
│   ├── routes/                   # Express route definitions
│   │   └── user.routes.js        # User endpoints — register, login, profile, etc.
│   │
│   ├── types/                    # TypeScript type definitions (NEW — additive)
│   │   ├── index.ts              # Barrel file — re-exports all types
│   │   ├── environment.d.ts      # Typed process.env variables
│   │   ├── express.d.ts          # Express Request augmentation (req.user)
│   │   ├── api.types.ts          # API response/error interfaces
│   │   ├── user.types.ts         # User model, document, and token types
│   │   ├── cloudinary.types.ts   # Cloudinary upload/delete types
│   │   └── common.types.ts       # Shared utility types
│   │
│   └── utils/                    # Shared utility functions
│       ├── apiError.js           # Custom error class with statusCode
│       ├── apiResponse.js        # Standardized response wrapper
│       ├── asyncHandler.js       # Async error-catching middleware wrapper
│       └── cloudinary.js         # Cloudinary upload/delete helpers
│
├── public/                       # Static files served by Express
│   └── temp/                     # Temporary upload directory
│
├── docs/                         # Project documentation (NEW)
│   ├── README.md                 # This file
│   ├── ARCHITECTURE.md           # Architecture & request lifecycle
│   ├── TYPESCRIPT.md             # TypeScript migration guide
│   └── CONTRIBUTING.md           # Contributing guidelines
│
├── tsconfig.json                 # TypeScript config (allowJs, strict for .ts)
├── tsconfig.build.json           # Production build config
├── .eslintrc.json                # ESLint config for TypeScript
├── .prettierrc                   # Prettier formatting rules
├── .prettierignore               # Prettier ignore patterns
├── nodemon.json                  # Nodemon config for ts-node
├── .env.sample                   # Environment variable keys
├── .env.example                  # Documented environment template
├── .gitignore                    # Git ignore rules
└── package.json                  # Dependencies and scripts
```

---

## NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `test` | `npm test` | Placeholder test runner |
| `ts:check` | `npm run ts:check` | Run TypeScript compiler in check-only mode (no output) |
| `ts:build` | `npm run ts:build` | Clean `dist/` and compile TypeScript to JavaScript |
| `ts:dev` | `npm run ts:dev` | Start dev server with ts-node + hot reload via nodemon |
| `lint:ts` | `npm run lint:ts` | Lint TypeScript type files with ESLint |
| `format:ts` | `npm run format:ts` | Format TypeScript type files with Prettier |

---

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | No | Server port (default: 8000) | `8000` |
| `NODE_ENV` | No | Environment mode | `development` |
| `MONGODB_URI` | **Yes** | MongoDB connection string | `mongodb://localhost:27017` |
| `CORS_ORIGIN` | **Yes** | Allowed CORS origin | `http://localhost:3000` |
| `ACCESS_TOKEN_SECRET` | **Yes** | JWT access token signing key | `my_secret_key_123` |
| `ACCESS_TOKEN_EXPIRY` | **Yes** | Access token TTL | `1d` |
| `REFRESH_TOKEN_SECRET` | **Yes** | JWT refresh token signing key | `my_refresh_secret_456` |
| `REFRESH_TOKEN_EXPIRY` | **Yes** | Refresh token TTL | `10d` |
| `CLOUDINARY_CLOUD_NAME` | **Yes** | Cloudinary cloud name | `my_cloud` |
| `CLOUDINARY_API_KEY` | **Yes** | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | **Yes** | Cloudinary API secret | `abcdefghijk` |
| `CLOUDINARY_URL` | No | Full Cloudinary URL | `cloudinary://KEY:SECRET@NAME` |

---

## TypeScript Migration Notes

This project uses an **additive TypeScript setup** — existing JavaScript files are untouched:

- **`allowJs: true`** — TypeScript compiler processes `.js` files alongside `.ts` files
- **`checkJs: false`** — TypeScript does **not** enforce type checking on existing `.js` files
- **`strict: true`** — Full strict mode applies to any **new `.ts` files** only

This means:
1. ✅ All existing `.js` code continues to work exactly as before
2. ✅ New features can be written in `.ts` with full type safety
3. ✅ The type definitions in `src/types/` describe the existing codebase's contracts
4. ✅ Gradual migration of individual `.js` → `.ts` files is supported at any time

---

## Adding a New Feature (Step-by-Step)

### 1. Define the type (`src/types/[resource].types.ts`)
```typescript
import { Document, Model } from 'mongoose';

export interface IVideo {
  title: string;
  description: string;
  videoFile: string;
  thumbnail: string;
  owner: string;
  // ...
}

export interface IVideoDocument extends IVideo, Document {}
export interface IVideoModel extends Model<IVideoDocument> {}
```

### 2. Create the model (`src/models/video.model.js` or `.ts`)
Define the Mongoose schema matching your type definition.

### 3. Create the controller (`src/controllers/video.controller.js` or `.ts`)
Use `asyncHandler` to wrap handlers, `ApiError` for errors, `ApiResponse` for responses.

### 4. Create the routes (`src/routes/video.routes.js` or `.ts`)
Wire controller functions to HTTP methods with middleware.

### 5. Mount the router (`src/app.js`)
```javascript
app.use("/api/v1/videos", videoRouter);
```

### 6. Export the types (`src/types/index.ts`)
Add the new types to the barrel file.

---

## API Endpoints (Current)

### User Routes — `/api/v1/users`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | ❌ | Register a new user (with avatar/cover image upload) |
| POST | `/login` | ❌ | Login and receive JWT tokens |
| POST | `/logout` | ✅ | Logout and clear tokens |
| POST | `/refresh-token` | ❌ | Refresh access token |
| POST | `/change-password` | ✅ | Change current password |
| GET | `/current-user` | ✅ | Get authenticated user's profile |
| PATCH | `/update-account` | ✅ | Update fullName and/or email |
| PATCH | `/avatar` | ✅ | Update avatar image |
| PATCH | `/cover-image` | ✅ | Update cover image |
| GET | `/c/:username` | ✅ | Get user's channel profile with subscriber counts |
| GET | `/history` | ✅ | Get watch history |

---

## License

ISC © [Ashikur Rahman](https://github.com/The-BlackShadoww)
