# Contributing Guidelines

---

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| **Models** | `PascalCase` singular, `.model.js/.ts` | `user.model.js` |
| **Controllers** | `camelCase` function, `.controller.js/.ts` | `user.controller.js` |
| **Routes** | `kebab` resource, `.routes.js/.ts` | `user.routes.js` |
| **Middleware** | descriptive name, `.middleware.js/.ts` | `auth.middleware.js` |
| **Utils** | `camelCase`, `.js/.ts` | `asyncHandler.js` |
| **Types** | `PascalCase` with `I` prefix for interfaces, `.types.ts` | `user.types.ts` → `IUser` |
| **Constants** | `UPPER_SNAKE_CASE` | `DB_NAME` |
| **Env Variables** | `UPPER_SNAKE_CASE` | `MONGODB_URI` |

---

## Adding a New Resource End-to-End

### 1. Define types (`src/types/[resource].types.ts`)
```typescript
import { Document, Model } from 'mongoose';

export interface IVideo { /* schema fields */ }
export interface IVideoDocument extends IVideo, Document { /* instance methods */ }
export interface IVideoModel extends Model<IVideoDocument> { /* static methods */ }
```

### 2. Export types (`src/types/index.ts`)
```typescript
export type { IVideo, IVideoDocument, IVideoModel } from './video.types';
```

### 3. Create model (`src/models/video.model.js` or `.ts`)
- Define Mongoose schema matching the type
- Add hooks, methods, statics
- Export the model

### 4. Create controller (`src/controllers/video.controller.js` or `.ts`)
- Wrap every function in `asyncHandler()`
- Use `ApiError` for errors, `ApiResponse` for responses
- Export named functions

### 5. Create routes (`src/routes/video.routes.js` or `.ts`)
- Import controller functions and middleware
- Map HTTP methods to handlers
- Apply `verifyJWT` for protected routes
- Apply `upload` for file upload routes

### 6. Mount router (`src/app.js`)
```javascript
import videoRouter from "./routes/video.routes.js";
app.use("/api/v1/videos", videoRouter);
```

---

## Adding New TypeScript Types

1. Create a new file in `src/types/` named `[resource].types.ts`
2. Add JSDoc comments to every interface and method
3. Export all types from the new file
4. Add re-exports to `src/types/index.ts`
5. Run `npm run ts:check` to verify

---

## Code Style

- **Formatting**: Prettier (config in `.prettierrc`)
  - Double quotes, 4-space tabs, trailing commas (es5), semicolons
- **Linting**: ESLint (config in `.eslintrc.json`)
  - `@typescript-eslint/no-explicit-any`: warn
  - Unused vars: error (except args prefixed with `_`)
- **Imports**: ES Module syntax (`import`/`export`)
- **Async**: Always use `asyncHandler()` wrapper in controllers
- **Errors**: Always use `new ApiError(statusCode, message)` — never raw `throw`
- **Responses**: Always use `new ApiResponse(statusCode, data, message)`

---

## Git Workflow

### Branch naming
```
feature/add-video-model
fix/login-token-refresh
docs/update-readme
refactor/cloudinary-utils
```

### Commit message format
```
type(scope): description

feat(user): add avatar upload endpoint
fix(auth): handle expired refresh tokens
docs(types): add JSDoc to IUserDocument
refactor(utils): extract token generation
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`

### Workflow
1. Create a feature branch from `main`
2. Make changes
3. Run `npm run ts:check` — ensure no type errors
4. Commit with descriptive message
5. Push and create a pull request
6. Get review and merge
