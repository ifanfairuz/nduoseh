# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Panah is a modular sales/POS application built as a monorepo with three workspaces managed by Turborepo and npm workspaces:

- **server**: NestJS backend API
- **web**: Vue 3 + Vite frontend
- **contract**: Shared TypeScript types and contracts

## Development Commands

### Root Level (Turborepo)

```bash
# Start all workspaces in dev mode
npm run dev

# Build all workspaces
npm run build
```

### Server (NestJS Backend)

```bash
cd server

# Development with watch mode
npm run dev

# Build
npm run build

# Production start
npm run start:prod

# Linting
npm run lint

# Testing
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:cov            # With coverage
npm run test:e2e            # E2E tests

# Format code
npm run format
```

### Web (Vue 3 Frontend)

```bash
cd web

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database (Prisma)

```bash
cd server

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Create migration
npx prisma migrate dev --name <migration_name>

# Open Prisma Studio
npx prisma studio
```

## Architecture

### Server Architecture

**Modular Plugin System**: The server uses a dynamic module loading system via `LoaderModule` that enables/disables features through configuration (`server/config.json`). Modules are registered in `app.config.ts` and loaded at runtime.

**Module Configuration Pattern**:

- Each module (e.g., `UserModule`) exposes a static `configure()` method accepting module-specific config
- Modules can be enabled by adding to `config.modules` array (e.g., `["user"]` or `[["user", { auth: {...} }]]`)
- The `UserModule` is always registered by default even if not in config

**Use Case Pattern**: The codebase follows a use-case driven architecture where business logic is encapsulated in dedicated use-case classes:

- Use cases are organized by domain in `src/modules/{module}/use-case/`
- Each use case is a single-responsibility injectable service
- Controllers delegate to use cases rather than containing business logic
- Example structure: `use-case/me/`, `use-case/user/`, `use-case/login/`, `use-case/token/`

**Authentication Architecture**:

- JWT-based auth with RS256 signing (requires RSA key pair via env vars `PRIVATE_KEY_PATH`/`PUBLIC_KEY_PATH` or `PRIVATE_KEY`/`PUBLIC_KEY`)
- Supports local and remote token verification (`VerifyTokenLocalUseCase` vs `VerifyTokenRemoteUseCase` based on `REMOTE_AUTH_URL` env var)
- Session management with refresh tokens stored in PostgreSQL
- Auth middleware (`AuthMiddleware`) applied globally to `/api/*` routes except login/refresh endpoints
- Token types: Access tokens (short-lived, configurable duration) and refresh tokens (longer-lived, single-use)

**Core Services**:

- `PrismaModule`: Database access with PostgreSQL adapter
- `RedisModule`: Caching layer (requires `REDIS_URL`)
- `LocalStorageModule`: File storage with disk abstraction pattern; can register static file servers via `registerServer()`
- `CipherModule`: Cryptographic operations for JWT signing/verification
- `EventModule`: Event-driven communication using NestJS EventEmitter

**Storage Pattern**: The storage system uses a Disk abstraction (`src/services/storage/contract/disk.ts`):

- Each feature disk extends the base `Disk` class (e.g., `UserImageDisk`)
- Disks are registered in `LoaderModule.configure()` via `LocalStorageModule.registerServer([...disks])`
- Serves static files and provides CRUD operations for file management

**API Documentation**: Swagger/OpenAPI docs available at `/doc` by default (configurable via `SWAGGER_URL` env var, disable with `SWAGGER_DISABLE=true`)

### Web Architecture

**State Management**: Uses Pinia for global state:

- `auth.store`: Authentication state with user session management
- Stores are in `src/stores/`

**Router Structure**: Vue Router with route-level guards:

- `meta.authed`: Routes requiring authentication
- `meta.guest`: Routes for unauthenticated users only
- Global navigation guard in `router.ts` checks auth state before each route
- Auth store subscription in `main.ts` handles automatic redirects on auth state changes
- Routes are lazy-loaded using dynamic imports

**Component Organization**:

- `components/`: Shared components including Reka UI component library in `components/ui/`
- `pages/`: Route-specific page components
- `layouts/`: Layout wrappers (e.g., `DashboardLayout.vue`)
- `modules/`: Feature modules (e.g., `modules/user/`)
- `api/`: API client layer
- `lib/`: Shared utilities

**Styling**: TailwindCSS v4 with custom animations via `tw-animate-css`

### Contract Package

Shared TypeScript types exported from `contract/index.ts`:

- Type-only exports for models, auth, and user domains
- Used by both server and web to ensure type safety across boundaries

## Environment Variables

Key environment variables for the server (see `server/.env.example`):

**Required**:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `PRIVATE_KEY_PATH` / `PRIVATE_KEY`: RSA private key for JWT signing
- `PUBLIC_KEY_PATH` / `PUBLIC_KEY`: RSA public key for JWT verification
- `PRIVATE_KEY_PASSPHRASE`: Passphrase for private key
- `CORS_ORIGIN`: Allowed CORS origins (comma-separated)

**Optional**:

- `PORT`: Server port (default: 3000)
- `SWAGGER_DISABLE`: Set to `true` to disable API docs
- `SWAGGER_URL`: Custom path for API docs (default: `doc`)
- `STORAGE_PATH`: Base path for local file storage (default: `storage`)
- `REMOTE_AUTH_URL`: Enable remote JWT verification instead of local

## Database Schema

The application uses Prisma with PostgreSQL. Key models:

- `User`: Core user entity with soft deletes (`deleted_at`)
- `Account`: OAuth/credential provider accounts linked to users
- `AuthSession`: Active user sessions with device/IP tracking
- `RefreshToken`: Single-use refresh tokens with expiration
- `UserVerification`: Email/identity verification tokens
- `AuthProviderClientId`: OAuth provider client configurations

All timestamps use `@db.Timestamptz()` for timezone-aware storage.

## Key Patterns to Follow

1. **Adding New Modules**: Create module in `src/modules/{name}/`, add to `LoaderModule._mapModules()` map, define module config type, implement `configure()` static method
2. **Adding Use Cases**: Create in `use-case/{subdomain}/` with clear single responsibility, inject repositories/services via constructor
3. **Adding Storage Disks**: Extend `Disk` class, register in `LoaderModule.configure()` via `LocalStorageModule.registerServer()`
4. **Frontend Modules**: Create in `web/src/modules/{name}/` with components, pages, and routes
5. **Shared Types**: Add to `contract/` workspace and export from `index.ts` for cross-workspace type safety

**Make sure run lint/npm run format after making changes**

**UPDATE CLAUDE.md AFTER MAKE CHANGE**
