# Architecture

This document describes the project's architecture and request lifecycle.

---

## High-Level Architecture

```
Client → index.js (bootstrap) → app.js (middleware stack)
  → Routes → Middleware (auth, upload) → Controllers → Models → MongoDB
                                                     → Utils (Cloudinary, ApiError, ApiResponse)
```

---

## Application Bootstrap (`src/index.js`)

1. Loads environment variables via `dotenv/config`
2. Calls `connectDB()` — connects to MongoDB using `MONGODB_URI/DB_NAME`
3. On success: `app.listen(PORT || 8000)`
4. On failure: logs error and process exits

---

## Middleware Stack (`src/app.js`, in order)

1. `cors({ origin: CORS_ORIGIN, credentials: true })`
2. `express.json({ limit: "16kb" })`
3. `express.urlencoded({ limit: "16kb", extended: true })`
4. `express.static("public")`
5. `cookieParser()`

Then routes are mounted under `/api/v1/`.

---

## Layered Architecture

### Routes (`src/routes/`)
Maps URL paths + HTTP methods to middleware and controller functions. No business logic.

### Middleware (`src/middlewares/`)
- **auth.middleware.js** — `verifyJWT`: extracts JWT from cookie/header → verifies → finds user → attaches to `req.user` → calls `next()`
- **multer.middleware.js** — `upload`: accepts files → stores in `os.tmpdir()` → attaches file info to `req.file`/`req.files`

### Controllers (`src/controllers/`)
All business logic lives here. Every function is wrapped in `asyncHandler()`. Pattern:
1. Extract data from `req.body`/`req.params`
2. Validate input (throw `ApiError` on failure)
3. Interact with Model (CRUD)
4. Interact with Utils (Cloudinary uploads)
5. Return `res.status(code).json(new ApiResponse(...))`

### Models (`src/models/`)
Mongoose schemas with:
- Field definitions and validation
- Pre-save hooks (password hashing)
- Instance methods (password comparison, token generation)

### Utils (`src/utils/`)
- **ApiError** — `Error` subclass: `{ statusCode, data: null, message, success: false, errors[] }`
- **ApiResponse** — response wrapper: `{ statusCode, data, message, success: statusCode < 400 }`
- **asyncHandler** — catches async errors: `Promise.resolve(fn(req,res,next)).catch(next)`
- **cloudinary** — upload/delete with temp file cleanup via `fs.unlinkSync()`

---

## Request Lifecycle — Login Example

```
POST /api/v1/users/login { email, password }
  │
  ├─ cors() → express.json() → cookieParser()    [global middleware]
  │
  ├─ userRouter → router.route("/login").post(loginUser)  [route match]
  │
  ├─ asyncHandler(loginUser)                      [error wrapper]
  │
  ├─ loginUser controller:
  │   1. Extract { email, username, password } from req.body
  │   2. Validate email/username present → ApiError(400) if not
  │   3. User.findOne({ $or: [{email}, {username}] }) → ApiError(404)
  │   4. user.isPasswordCorrect(password) → ApiError(401)
  │   5. generateAccessAndRefreshTokens(user._id)
  │   6. User.findById().select("-password -refreshToken")
  │   7. Set cookies: accessToken, refreshToken (httpOnly, secure)
  │   8. Return ApiResponse(200, { user, accessToken, refreshToken })
  │
  └─ Response: { statusCode: 200, data: {...}, message: "...", success: true }
     + Set-Cookie headers
```

---

## Error Handling Flow

```
Controller throws new ApiError(code, message)
  → asyncHandler catches rejected promise
  → Calls next(error)
  → Express default error handler sends response
```

---

## Authentication Flow

1. **Login**: Verify credentials → generate access + refresh tokens → store refresh in DB → set HTTP-only cookies
2. **Auth check**: `verifyJWT` middleware reads cookie/header → `jwt.verify()` → find user → attach to `req.user`
3. **Token refresh**: Read refresh token → verify → compare with stored → generate new pair → update DB + cookies
4. **Logout**: `findByIdAndUpdate` with `$unset: { refreshToken: 1 }` → clear cookies

---

## Database Connection

- **File:** `src/db/index.js`
- `mongoose.connect(\`${MONGODB_URI}/${DB_NAME}\`)`
- `DB_NAME = "setUp"` from `src/constant.js`
- On failure: `process.exit(1)`
