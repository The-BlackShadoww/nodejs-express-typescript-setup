# TypeScript Migration Guide

This document explains the TypeScript setup added to this project and how to use it.

---

## What Was Added

### New Config Files
| File | Purpose |
|------|---------|
| `tsconfig.json` | Root TS config — `allowJs: true`, `checkJs: false`, `strict: true` |
| `tsconfig.build.json` | Production build config (excludes test files) |
| `.eslintrc.json` | ESLint for TypeScript files |
| `nodemon.json` | Dev server via ts-node with hot reload |

### New Type Files (`src/types/`)
| File | What it types |
|------|--------------|
| `environment.d.ts` | All `process.env` variables |
| `express.d.ts` | Express `Request` augmentation (`req.user`) |
| `api.types.ts` | `IApiResponse`, `IApiError`, pagination types |
| `user.types.ts` | `IUser`, `IUserDocument`, `IUserModel`, JWT payloads |
| `cloudinary.types.ts` | Upload/delete function types |
| `common.types.ts` | `AsyncRequestHandler`, cookie options, utility types |
| `index.ts` | Barrel file re-exporting everything |

### New npm Scripts
| Script | What it does |
|--------|-------------|
| `ts:check` | Type-check without emitting files |
| `ts:build` | Clean build to `dist/` |
| `ts:dev` | Dev server with ts-node + nodemon |
| `lint:ts` | Lint type files |
| `format:ts` | Format type files |

---

## How `allowJs` Works

The key insight of this migration:

```
┌──────────────────────────────────────────────┐
│  tsconfig.json                               │
│                                              │
│  allowJs: true   → TS processes .js files    │
│  checkJs: false  → TS does NOT type-check JS │
│  strict: true    → Full strictness on .ts    │
└──────────────────────────────────────────────┘
```

- **Existing `.js` files** are included in the compilation but NOT type-checked. They continue to work exactly as before.
- **New `.ts` files** get full strict type checking.
- **`.d.ts` files** (like `environment.d.ts` and `express.d.ts`) augment global types — they apply automatically without imports.

---

## Where Types Live

```
src/types/
├── index.ts              ← import from here
├── environment.d.ts      ← auto-applied (global augmentation)
├── express.d.ts          ← auto-applied (global augmentation)
├── api.types.ts          ← ApiResponse/ApiError shapes
├── user.types.ts         ← User model interfaces
├── cloudinary.types.ts   ← Cloudinary utility types
└── common.types.ts       ← Shared types (async handler, cookies, etc.)
```

### Importing types in new code:
```typescript
// Import everything from the barrel file
import { IUser, IUserDocument, IApiResponse, AsyncRequestHandler } from '../types';

// Or import from a specific file
import { IUserDocument } from '../types/user.types';
```

---

## Writing a New Feature in TypeScript

### Example: Creating a new controller in TypeScript

```typescript
// src/controllers/video.controller.ts
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import type { IApiResponse, AsyncRequestHandler } from '../types';

const getVideos: AsyncRequestHandler = async (req: Request, res: Response) => {
  // req.user is typed thanks to express.d.ts
  const userId = req.user?._id;

  // process.env is typed thanks to environment.d.ts
  const dbUri = process.env.MONGODB_URI;

  // Business logic here...

  return res
    .status(200)
    .json(new ApiResponse(200, [], "Videos fetched"));
};

export const getVideosHandler = asyncHandler(getVideos);
```

### Example: Creating a new model type

```typescript
// src/types/video.types.ts
import { Document, Model, Types } from 'mongoose';

export interface IVideo {
  videoFile: string;
  thumbnail: string;
  title: string;
  description: string;
  duration: number;
  views: number;
  isPublished: boolean;
  owner: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVideoDocument extends IVideo, Document {}
export interface IVideoModel extends Model<IVideoDocument> {}
```

Then add to `src/types/index.ts`:
```typescript
export type { IVideo, IVideoDocument, IVideoModel } from './video.types';
```

---

## Gradual Migration — Converting a JS File to TS

If you want to convert an existing `.js` file to `.ts`, follow these steps:

### Step 1: Rename the file
```bash
# Example: convert asyncHandler
mv src/utils/asyncHandler.js src/utils/asyncHandler.ts
```

### Step 2: Add types
```typescript
import { Request, Response, NextFunction } from 'express';

type AsyncRequestHandler = (
  req: Request, res: Response, next: NextFunction
) => Promise<void | Response>;

const asyncHandler = (requestHandler: AsyncRequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };
```

### Step 3: Update imports in other files
Change `.js` extension to `.ts` in any file that imports from the converted file.

### Recommended migration order (safest first):
1. `src/constant.js` — simplest file, no dependencies
2. `src/utils/apiResponse.js` — simple class, no imports
3. `src/utils/apiError.js` — simple class, no imports
4. `src/utils/asyncHandler.js` — utility, no model deps
5. `src/utils/cloudinary.js` — utility with external deps
6. `src/db/index.js` — database config
7. `src/middlewares/auth.middleware.js` — depends on models + utils
8. `src/middlewares/multer.middleware.js` — depends on multer
9. `src/models/user.model.js` — core model
10. `src/controllers/user.controller.js` — depends on everything
11. `src/routes/user.routes.js` — depends on controllers + middleware
12. `src/app.js` — depends on routes
13. `src/index.js` — depends on app + db

---

## Running the Type Checker

```bash
# Check all files for type errors (no output files generated)
npm run ts:check

# Build to dist/ for production
npm run ts:build
```

### What to do with errors:
- **Errors in `.ts` files** — fix them, they're real type issues
- **Errors should NOT appear in `.js` files** — `checkJs: false` prevents this
- If you see errors from `node_modules/`, run with `--skipLibCheck` (already set in tsconfig)
