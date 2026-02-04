# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a production-ready **starter project template** featuring a modern full-stack architecture with enterprise-grade authentication, authorization, and modular design patterns. Built as a monorepo with three workspaces managed by Turborepo and npm workspaces:

- **server**: NestJS backend API with modular plugin architecture
- **web**: Vue 3 + Vite frontend with component-driven design
- **contract**: Shared TypeScript types and contracts for type safety

**Key Features**:

- JWT-based authentication with RS256 signing
- Role-based access control (RBAC) with permission caching
- Dynamic module loading system for feature enablement
- Use-case driven architecture for clean business logic
- Full-stack type safety via shared contract types
- GraphQL and REST API support
- File storage abstraction with disk pattern
- Comprehensive testing setup (unit + E2E)
- Built-in user and role management as reference implementation

## AI Development Guidelines

**CRITICAL RULES - Always Follow**:

1. **Read Before Edit**: NEVER propose changes to code you haven't read. Always read files first using the Read tool.
2. **Follow Existing Patterns**: Study the user and role modules as reference implementations. Replicate their structure for new features.
3. **Type Safety First**: Always define types in `contract/` workspace and export from `index.ts` before implementing features.
4. **Permission-Based Security**: Every endpoint MUST use `@RequirePermissions()`, `@SomePermissions()` or `@RequireRoles()` decorators. Register all permissions in the module's static `permissions` array.
5. **Use Case Pattern**: Business logic MUST be in use-case classes, not controllers. Controllers only delegate to use cases.
6. **Test Coverage**: Write unit tests for use cases and E2E tests for controllers. Use proper eslint-disable comments for test files.
7. **Code Quality**: Run `npm run lint` and `npm run format` after making changes.
8. **No Over-Engineering**: Only implement what's requested. Don't add extra features, comments, or abstractions unless explicitly needed.
9. **Update Documentation**: Update this CLAUDE.md file after implementing significant features or patterns.
10. **Modular Registration**: New modules must be added to `LoaderModule._mapModules()` with a `configure()` static method.

**Development Workflow**:

1. **Planning Phase**:
   - Read relevant existing code (user/role modules as reference)
   - Check contract types in `contract/` workspace
   - Understand required permissions and guards
   - Plan database schema changes if needed

2. **Implementation Phase**:
   - Start with contract types (server ↔ web communication)
   - Implement server use cases (business logic)
   - Add controller endpoints with guards
   - Register permissions in module's static array
   - Implement frontend API client
   - Create Vue components following module pattern
   - Add routes with permission metadata

3. **Testing Phase**:
   - Write unit tests for use cases
   - Write E2E tests for endpoints
   - Test permission guards
   - Verify type safety across workspaces

4. **Quality Phase**:
   - Run linter and formatter
   - Update CLAUDE.md if new patterns added
   - Verify no console.logs or debug code
   - Check for security vulnerabilities

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

### Folder Structure

#### Server Structure

```
server/
├── src/
│   ├── app.module.ts              # Root application module
│   ├── app.config.ts              # Application configuration
│   ├── main.ts                    # Application entry point
│   ├── loader.module.ts           # Dynamic module loader
│   ├── error.filter.ts            # Global error filter
│   ├── modules/                   # Feature modules
│   │   ├── health-check/          # Health check module
│   │   │   ├── health-check.controller.ts
│   │   │   └── health-check.module.ts
│   │   └── user/                  # User module (reference)
│   │       ├── user.module.ts     # Module definition
│   │       ├── config.ts          # Module configuration
│   │       ├── auth.guard.ts      # Authentication guard
│   │       ├── auth.middleware.ts # Auth middleware
│   │       ├── auth.request.ts    # Auth request type
│   │       ├── user.graphql       # GraphQL schema
│   │       ├── controller/        # REST controllers
│   │       │   ├── auth.controller.ts
│   │       │   ├── jwk.controller.ts
│   │       │   ├── logout.controller.ts
│   │       │   ├── me.controller.ts
│   │       │   ├── permissions.controller.ts
│   │       │   ├── roles.controller.ts
│   │       │   ├── token.controller.ts
│   │       │   ├── user-roles.controller.ts
│   │       │   └── users.controller.ts
│   │       ├── decorators/        # Custom decorators
│   │       │   ├── permissions.decorator.ts
│   │       │   ├── require-roles.decorator.ts
│   │       │   └── user-permissions.decorator.ts
│   │       ├── event/             # Event handlers
│   │       │   ├── OnUserLogin.ts
│   │       │   └── OnUserRegister.ts
│   │       ├── exceptions/        # Custom exceptions
│   │       │   ├── EmailAlreadyExistsException.ts
│   │       │   ├── ErrorRefreshException.ts
│   │       │   ├── ErrorTokenException.ts
│   │       │   ├── InsufficientPermissionsException.ts
│   │       │   ├── InvalidPermissionException.ts
│   │       │   ├── RoleNotFoundException.ts
│   │       │   ├── RoleSlugAlreadyExistsException.ts
│   │       │   ├── SuperadminProtectedException.ts
│   │       │   └── SystemRoleProtectedException.ts
│   │       ├── guards/            # Authorization guards
│   │       │   ├── permissions.guard.ts
│   │       │   └── roles.guard.ts
│   │       ├── repositories/      # Data access layer
│   │       │   ├── access-token.repository.ts
│   │       │   ├── account.repository.ts
│   │       │   ├── auth-provider-client-id.repository.ts
│   │       │   ├── auth-session.repository.ts
│   │       │   ├── refresh-token.repository.ts
│   │       │   ├── role.repository.ts
│   │       │   ├── user-role.repository.ts
│   │       │   └── user.repository.ts
│   │       ├── response/          # Response DTOs
│   │       │   ├── auth.response.ts
│   │       │   └── user.response.ts
│   │       ├── services/          # Module services
│   │       │   ├── access-token.service.ts
│   │       │   ├── jwt.service.ts
│   │       │   ├── permission-cache.service.ts
│   │       │   └── refresh-token.service.ts
│   │       ├── storage/           # File storage disks
│   │       │   └── user-image.disk.ts
│   │       ├── use-case/          # Business logic
│   │       │   ├── login/         # Login use cases
│   │       │   │   ├── login-password.use-case.ts
│   │       │   │   └── login-user.use-case.ts
│   │       │   ├── logout.use-case.ts
│   │       │   ├── me/            # Current user use cases
│   │       │   │   ├── get-me.user.use-case.ts
│   │       │   │   ├── update-image.me.use-case.ts
│   │       │   │   └── update.me.use-case.ts
│   │       │   ├── permissions/   # Permission use cases
│   │       │   │   └── get-available-permissions.use-case.ts
│   │       │   ├── role/          # Role use cases
│   │       │   │   ├── create-role.use-case.ts
│   │       │   │   ├── delete-role.use-case.ts
│   │       │   │   ├── get-role-by-id.use-case.ts
│   │       │   │   ├── list-roles.use-case.ts
│   │       │   │   ├── update-role.use-case.ts
│   │       │   │   └── validate-permissions.use-case.ts
│   │       │   ├── token/         # Token use cases
│   │       │   │   ├── get-public-key.use-case.ts
│   │       │   │   ├── refresh-token.use-case.ts
│   │       │   │   ├── verify-token-local.use-case.ts
│   │       │   │   ├── verify-token-remote.use-case.ts
│   │       │   │   └── verify-token.use-case.ts
│   │       │   ├── user/          # User use cases
│   │       │   │   ├── create-user.use-case.ts
│   │       │   │   ├── create-user.use-case.spec.ts
│   │       │   │   ├── delete-user.use-case.ts
│   │       │   │   ├── delete-user.use-case.spec.ts
│   │       │   │   ├── get-user-by-id.use-case.ts
│   │       │   │   ├── get-user-by-id.use-case.spec.ts
│   │       │   │   ├── get-user-info.user-case.ts
│   │       │   │   ├── list-users.use-case.ts
│   │       │   │   ├── list-users.use-case.spec.ts
│   │       │   │   ├── update-user.use-case.ts
│   │       │   │   └── update-user.use-case.spec.ts
│   │       │   └── user-role/     # User-role use cases
│   │       │       ├── assign-role.use-case.ts
│   │       │       ├── get-user-permissions.use-case.ts
│   │       │       ├── get-user-roles.use-case.ts
│   │       │       └── remove-role.use-case.ts
│   │       └── validator/         # Custom validators
│   │           └── image-profile.validator.ts
│   ├── services/                  # Core services
│   │   ├── cipher/                # Cryptography service
│   │   │   ├── cipher.module.ts
│   │   │   ├── cipher.service.ts
│   │   │   ├── hash.service.ts
│   │   │   └── key.service.ts
│   │   ├── event/                 # Event emitter service
│   │   │   └── event.module.ts
│   │   ├── prisma/                # Database service
│   │   │   ├── atomic.service.ts
│   │   │   ├── prisma.module.ts
│   │   │   ├── prisma.repository.ts
│   │   │   ├── prisma.service.ts
│   │   │   └── prisma.util.ts
│   │   ├── redis/                 # Cache service
│   │   │   ├── redis.module.ts
│   │   │   └── redis.service.ts
│   │   └── storage/               # File storage service
│   │       ├── contract/
│   │       │   ├── disk.ts
│   │       │   ├── storage.service.ts
│   │       │   └── xfile.ts
│   │       ├── local-storage.module.ts
│   │       └── local-storage.service.ts
│   └── utils/                     # Shared utilities
│       ├── http/                  # HTTP helpers
│       │   ├── error.response.ts
│       │   └── index.ts
│       ├── validation/            # Validation utilities
│       │   ├── error-validation.exception.ts
│       │   ├── error-validation.response.ts
│       │   ├── index.ts
│       │   ├── password.validation.ts
│       │   └── zod.pipe.ts
│       ├── class-helper.ts
│       ├── file.ts
│       ├── generator.ts
│       ├── otel.ts
│       └── server.ts
├── prisma/
│   ├── schema.prisma              # Database schema
│   ├── migrations/                # Migration files
│   └── seed.ts                    # Database seeder
├── test/                          # E2E tests
│   ├── app.e2e-spec.ts
│   └── users.e2e-spec.ts
├── config.json                    # Module configuration
└── .env                           # Environment variables
```

#### Web Structure

```
web/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── App.vue                    # Root component
│   ├── router.ts                  # Vue Router configuration
│   ├── api/                       # API configuration
│   │   ├── client.ts              # Axios instance
│   │   └── exceptions/            # API exceptions
│   ├── assets/                    # Static assets
│   ├── components/                # Shared components
│   │   ├── ui/                    # shadcn-vue components
│   │   │   ├── alert-dialog/
│   │   │   ├── avatar/
│   │   │   ├── badge/
│   │   │   ├── breadcrumb/
│   │   │   ├── button/
│   │   │   ├── button-group/
│   │   │   ├── card/
│   │   │   ├── checkbox/
│   │   │   ├── collapsible/
│   │   │   ├── dropdown-menu/
│   │   │   ├── field/
│   │   │   ├── form/
│   │   │   ├── input/
│   │   │   ├── input-group/
│   │   │   ├── label/
│   │   │   ├── pagination/
│   │   │   ├── select/
│   │   │   ├── separator/
│   │   │   ├── sheet/
│   │   │   ├── sidebar/
│   │   │   ├── skeleton/
│   │   │   ├── sonner/
│   │   │   ├── spinner/
│   │   │   ├── table/
│   │   │   ├── textarea/
│   │   │   └── tooltip/
│   │   ├── datatable/             # Datatable components
│   │   ├── input/                 # Custom input components
│   │   ├── AppSidebar.vue
│   │   ├── Brand.vue
│   │   ├── ErrorMessage.vue
│   │   ├── IconByName.vue
│   │   ├── LoaderScreen.vue
│   │   ├── NavCollapsible.vue
│   │   ├── NavMain.vue
│   │   ├── NavProjects.vue
│   │   └── ProgressBar.vue
│   ├── composables/               # Vue composables
│   ├── layouts/                   # Layout components
│   ├── lib/                       # Utilities
│   ├── modules/                   # Feature modules
│   │   ├── role/                  # Role module
│   │   │   ├── role.api.ts
│   │   │   ├── components/
│   │   │   │   ├── RolesTable.vue
│   │   │   │   ├── RoleForm.vue
│   │   │   │   └── RolesRowAction.vue
│   │   │   └── pages/
│   │   │       ├── RolesList.vue
│   │   │       ├── RoleCreate.vue
│   │   │       └── RoleEdit.vue
│   │   └── user/                  # User module
│   │       ├── user.api.ts
│   │       ├── components/
│   │       │   ├── UsersTable.vue
│   │       │   ├── UserForm.vue
│   │       │   ├── UserRowAction.vue
│   │       │   └── UserRolesManager.vue
│   │       └── pages/
│   │           ├── UsersList.vue
│   │           ├── UserCreate.vue
│   │           └── UserEdit.vue
│   ├── pages/                     # General pages
│   │   ├── dashboard/
│   │   ├── login/
│   │   └── profile/
│   └── stores/                    # Pinia stores
│       └── auth.store.ts
├── public/                        # Public assets
└── index.html                     # HTML entry point
```

#### Contract Structure

```
contract/
├── index.ts                       # Main export file
├── auth/                          # Authentication types
│   └── index.ts
├── datatable/                     # Datatable types
│   ├── index.ts
│   ├── pagination.ts
│   └── sort.ts
├── models/                        # Database model types
│   ├── index.ts
│   ├── access-token.model.ts
│   ├── account.model.ts
│   ├── auth-provider-client-id.model.ts
│   ├── auth-session.model.ts
│   ├── branch.model.ts
│   ├── refresh-token.model.ts
│   ├── role.model.ts
│   ├── user.model.ts
│   └── user-verification.model.ts
├── permissions/                   # Permission types
│   └── index.ts
├── role/                          # Role domain types
│   └── index.ts
└── user/                          # User domain types
    └── index.ts
```

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

**Authorization & Permissions System**:

The application implements a comprehensive role-based access control (RBAC) system:

- **Role Management**: Roles store permissions as JSON arrays, validated against `APP_PERMISSIONS` registry from `LoaderModule`
- **Permission Guards**:
  - `@RequirePermissions('users.create', 'users.update')` - User must have **ALL** specified permissions (AND logic)
  - `@SomePermissions('roles.list', 'users.roles.assign')` - User must have **AT LEAST ONE** of the specified permissions (OR logic)
  - `@RequireRoles('superadmin', 'admin')` - User must have at least one of the specified roles
  - All guards require `PermissionsGuard` or `RolesGuard` to be applied
  - Guards automatically fetch and cache user permissions from Redis
- **Permission Caching**: User permissions cached in Redis indefinitely, invalidated only on role changes
- **System Roles**: Roles with `is_system: true` cannot be modified/deleted (e.g., 'superadmin')
- **Superadmin Protection**: Only superadmin users can create/modify other superadmin users
- **Default Roles**: Seeder creates example roles including Superadmin and various operational roles (can be customized for your application needs)
- **Permission Format**: Follows `resource.action` pattern (e.g., `users.list`, `roles.create`, `users.roles.assign`)

**Permission Decorator Usage**:

The application provides three decorators for protecting endpoints:

1. **@RequirePermissions** - User must have ALL specified permissions (AND logic)
   ```typescript
   @Get()
   @UseGuards(AuthGuard, PermissionsGuard)
   @RequirePermissions('users.list')
   async listUsers() {
     // User must have 'users.list' permission
     return this.listUsers.execute();
   }

   @Post()
   @UseGuards(AuthGuard, PermissionsGuard)
   @RequirePermissions('users.create', 'users.validate')
   async createUser() {
     // User must have BOTH 'users.create' AND 'users.validate' permissions
     return this.createUser.execute();
   }
   ```

2. **@SomePermissions** - User must have AT LEAST ONE of the specified permissions (OR logic)
   ```typescript
   @Get()
   @UseGuards(AuthGuard, PermissionsGuard)
   @SomePermissions('roles.list', 'users.roles.assign')
   async listRoles() {
     // User needs either 'roles.list' OR 'users.roles.assign' permission
     // Useful when multiple user types should access the same endpoint
     return this.listRoles.execute();
   }
   ```

3. **@RequireRoles** - User must have at least one of the specified roles
   ```typescript
   @Get()
   @UseGuards(AuthGuard, RolesGuard)
   @RequireRoles('superadmin', 'admin')
   async sensitiveOperation() {
     // User must have either 'superadmin' OR 'admin' role
     return this.performSensitiveOperation();
   }
   ```

**Combined Usage**:

You can combine `@RequirePermissions` and `@SomePermissions` on the same endpoint:

```typescript
@Get()
@UseGuards(AuthGuard, PermissionsGuard)
@RequirePermissions('users.list')      // Must have this
@SomePermissions('users.export', 'users.advanced')  // AND at least one of these
async exportUsers() {
  // User must have 'users.list' AND ('users.export' OR 'users.advanced')
  return this.exportUsers.execute();
}
```

**Implementation Details**:

- Decorators are defined in `server/src/modules/user/decorators/permissions.decorator.ts`
- `@RequirePermissions` sets metadata key `'permissions'`
- `@SomePermissions` sets metadata key `'some-permissions'`
- `PermissionsGuard` checks both decorators and validates against cached user permissions
- User permissions are cached in Redis with key `permission:user:{userId}`
- Cache is invalidated when user roles change

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
- Auth store subscription in `app.ts` handles automatic redirects on auth state changes
- Routes are lazy-loaded using dynamic imports

**Component Organization**:

- `components/`: Shared components
- `components/ui/`: shadcn-vue component library, dont add components in here except from `npx shadcn-vue@latest` commands
- `pages/`: Route-specific non module page components
- `layouts/`: Layout wrappers (e.g., `DashboardLayout.vue`)
- `modules/`: Feature modules (e.g., `modules/user/`, `modules/role/`)
- `api/`: API client layer
- `lib/`: Shared utilities

**Feature Modules**:

Each feature module follows a consistent pattern:

- `{module}.api.ts`: API client functions (CRUD operations)
- `components/`: Module-specific components
  - `{Module}Table.vue`: Data table with pagination, sorting, search
  - `{Module}Form.vue`: Generic create/update form with validation
  - `{Module}RowAction.vue`: Table row actions (edit, delete)
- `pages/`: Route pages
  - `{Module}List.vue`: List page with table and create button
  - `{Module}Create.vue`: Create page wrapper
  - `{Module}Edit.vue`: Edit page wrapper with data fetching

**Styling**: TailwindCSS v4 with custom animations via `tw-animate-css`

### Contract Package

Shared TypeScript types exported from `contract/index.ts`:

- Type-only exports for models, auth, user, role, permissions, and pagination domains
- **Pagination Types**:
  - **Cursor Pagination** (for real-time data, infinite scrolling):
    - `PaginatedResult<T>`: Generic pagination response with data and pageInfo
    - `PageInfo`: Cursor pagination metadata (hasNextPage, hasPreviousPage, startCursor, endCursor)
    - `CursorPaginationParams`: Query parameters for cursor pagination (cursor, limit)
  - **Offset Pagination** (for standard page-based navigation):
    - `OffsetPaginatedResult<T>`: Generic pagination response with data and pagination
    - `OffsetPageInfo`: Offset pagination metadata (page, limit, total, totalPages)
    - `OffsetPaginationParams`: Query parameters for offset pagination (page, limit)
- Used by both server and web to ensure type safety across boundaries
- User module currently uses offset pagination only

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
- `Role`: Permission sets with JSON permissions column, supports system roles and soft deletes
- `UserRole`: Junction table for many-to-many user-role relationships

All timestamps use `@db.Timestamptz()` for timezone-aware storage.

## API Endpoints

All endpoints are prefixed with `/api` unless otherwise noted.

### Authentication Endpoints

**Login**:
- `POST /api/auth/password/login` - Login with email and password (public)
  - Body: `{ email: string, password: string }`
  - Returns: `{ user, accessToken, refreshToken, permissions }`
  - Sets `refresh_token` HTTP-only cookie

**Token Management**:
- `GET /api/auth/token/verify` - Verify access token (public)
  - Headers: `Authorization: Bearer {token}`
  - Returns: `{ valid: boolean, user_id: string }`
- `POST /api/auth/token/refresh` - Refresh access token (public)
  - Requires `refresh_token` cookie
  - Returns: `{ accessToken, refreshToken }`
  - Sets new `refresh_token` HTTP-only cookie

**Logout**:
- `DELETE /api/auth/logout` - Logout current user (requires authentication)
  - Clears `refresh_token` cookie
  - Invalidates current session

**JWK Public Key**:
- `GET /api/auth/jwk` - Get JWK public key for token verification (public)
  - Returns: RSA public key in JWK format

### Current User Endpoints

All `/api/me` endpoints require authentication.

- `GET /api/me` - Get current user profile
  - Returns: `{ user, permissions, modules, roles }`
- `PUT /api/me` - Update current user profile
  - Body: `{ email?, name?, callname?, password? }`
  - Password requires: min 8 chars, uppercase, lowercase, number
  - Returns: Updated user with permissions
- `POST /api/me/image` - Update profile image
  - Body: `multipart/form-data` with `image` file
  - Accepts: JPEG, PNG (max size configured in validator)
  - Returns: Updated user with new image URL

### User Management Endpoints

All `/api/users` endpoints require authentication with `AuthGuard`.

- `GET /api/users` - List users with offset pagination and keyword search
  - Query params:
    - `page` (optional, >= 1, default: 1): page number
    - `limit` (optional, 1-100, default: 10): items per page
    - `keyword` (optional, max 100 chars): search keyword for name, email, or callname
    - `sort` (optional): sorting configuration
  - Returns: `OffsetPaginatedResult<User>` with data array and pagination metadata
  - Response includes `pagination` with `page`, `limit`, `total`, `totalPages`
  - Search is case-insensitive and matches partial strings across name, email, and callname fields
  - Ordered by `created_at` descending by default

- `GET /api/users/:id` - Get user by ID
  - Returns: User object with all fields

- `POST /api/users` - Create new user
  - Body: `multipart/form-data` or JSON
    - `name` (required, max 255 chars)
    - `email` (required, valid email, max 255 chars)
    - `password` (required, min 6 chars)
    - `callname` (optional, max 20 chars)
    - `image` (optional, file upload)
  - Returns: Created user object

- `PUT /api/users/:id` - Update user
  - Body: `multipart/form-data` or JSON
    - `name` (optional, max 255 chars)
    - `email` (optional, valid email, max 255 chars)
    - `callname` (optional, max 20 chars)
    - `image` (optional, file upload)
  - Returns: Updated user object

- `DELETE /api/users/:id` - Soft delete user
  - Sets `deleted_at` timestamp
  - Returns: Success message

- `POST /api/users/:id/restore` - Restore deleted user
  - Clears `deleted_at` timestamp
  - Returns: Restored user object

### Permissions Endpoints

- `GET /api/permissions` - Get all available permissions (requires `roles.list`)
  - Returns: `{ permissions: string[], groups: PermissionGroup[] }`
  - Permissions are grouped by resource (e.g., "users", "roles")
  - Used for displaying checkboxes in role form
  - Example response:
    ```json
    {
      "permissions": ["users.list", "users.create", "roles.list"],
      "groups": [
        {
          "resource": "users",
          "permissions": ["users.list", "users.create", "users.update"]
        },
        {
          "resource": "roles",
          "permissions": ["roles.list", "roles.create"]
        }
      ]
    }
    ```

### Role Management Endpoints

All `/api/roles` endpoints require authentication with `AuthGuard` and `PermissionsGuard`.

- `GET /api/roles` - List roles with offset pagination and keyword search
  - Permission: `@SomePermissions('roles.list', 'users.roles.assign')`
  - Query params:
    - `page` (optional, >= 1, default: 1): page number
    - `limit` (optional, 0-100, default: 10): items per page; if 0, returns all roles without limitation
    - `keyword` (optional, max 100 chars): search keyword for name, slug, or description
    - `sort` (optional): sorting configuration
  - Returns: `OffsetPaginatedResult<Role>` with data array and pagination metadata
  - Response includes `pagination` with `page`, `limit`, `total`, `totalPages`
  - Search is case-insensitive and matches partial strings across name, slug, and description fields
  - Ordered by `created_at` descending by default

- `GET /api/roles/:id` - Get role by ID
  - Permission: `@SomePermissions('roles.list', 'users.roles.assign')`
  - Returns: Role object with permissions array

- `POST /api/roles` - Create new role
  - Permission: `@RequirePermissions('roles.create')`
  - Body:
    - `name` (required, max 255 chars)
    - `slug` (required, max 255 chars, unique)
    - `description` (optional)
    - `permissions` (required, array of permission strings, min 1)
  - Validates permissions against `APP_PERMISSIONS` registry
  - Returns: Created role object

- `PUT /api/roles/:id` - Update role
  - Permission: `@RequirePermissions('roles.update')`
  - Body:
    - `name` (optional, max 255 chars)
    - `description` (optional)
    - `permissions` (optional, array of permission strings)
    - `active` (optional, boolean)
  - Cannot update system roles (`is_system: true`)
  - Validates permissions against `APP_PERMISSIONS` registry
  - Invalidates permission cache for all users with this role
  - Returns: Updated role object

- `DELETE /api/roles/:id` - Soft delete role
  - Permission: `@RequirePermissions('roles.delete')`
  - Cannot delete system roles (`is_system: true`)
  - Sets `deleted_at` timestamp
  - Removes role from all users
  - Invalidates permission cache for affected users
  - Returns: Success message

### User-Role Assignment Endpoints

All `/api/users/:userId/roles` endpoints require authentication with `AuthGuard` and `PermissionsGuard`.

- `GET /api/users/:userId/roles` - Get user's assigned roles
  - Permission: `@RequirePermissions('users.roles.list')`
  - Returns: `{ data: Role[] }`
  - Only returns active, non-deleted roles

- `GET /api/users/:userId/roles/permissions` - Get user's aggregated permissions
  - Permission: `@RequirePermissions('users.roles.list')`
  - Returns: `{ permissions: string[] }`
  - Aggregates permissions from all user's active roles
  - Results are cached in Redis (`permission:user:{userId}`)
  - Cache invalidated on role assignment/removal/update

- `POST /api/users/:userId/roles` - Assign role to user
  - Permission: `@RequirePermissions('users.roles.assign')`
  - Body: `{ roleId: string }`
  - `roleId` must be 24 characters (MongoDB ObjectId format)
  - Cannot assign inactive or deleted roles
  - Prevents duplicate assignments
  - Invalidates permission cache for user
  - Returns: Success message

- `DELETE /api/users/:userId/roles/:roleId` - Remove role from user
  - Permission: `@RequirePermissions('users.roles.remove')`
  - Invalidates permission cache for user
  - Returns: Success message

### Health Check Endpoint

- `GET /api/health-check` - Health check endpoint (public)
  - Returns: System health status
  - Checks database and Redis connectivity
  - Returns: `{ status: "ok", info: { database: {...}, redis: {...} } }`

### Registered Permissions

Current permissions exported by `UserModule.permissions`:

```typescript
export class UserModule {
  static readonly permissions = [
    'users.list',
    'users.create',
    'users.update',
    'users.delete',
    'users.roles.list',
    'users.roles.assign',
    'users.roles.remove',
    'roles.list',
    'roles.create',
    'roles.update',
    'roles.delete',
  ];

  static configure(config: UserModuleConfig): DynamicModule {
    // Module configuration...
  }
}
```

**Permission Registration**:

- Permissions are automatically registered in `APP_PERMISSIONS` global registry when modules load
- `APP_PERMISSIONS` is used to validate role permissions during creation/update
- When adding new modules, add their permissions to the module's static `permissions` array
- Permission format: `resource.action` (e.g., `products.create`, `orders.approve`)
- Keep permissions granular for fine-grained access control

## Testing

### Running Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e

# Run specific test file
npm test -- --testPathPatterns="list-users"
```

### Test Structure

**Unit Tests**: Located in `src/**/*.spec.ts` files, testing individual use cases in isolation

- Use Jest with `@nestjs/testing` for dependency injection
- Mock dependencies using `jest.fn()` and `jest.spyOn()`
- Test file naming: `{use-case-name}.use-case.spec.ts`
- Add `/* eslint-disable @typescript-eslint/unbound-method */` to avoid Jest mocking eslint errors
- Module path mapping configured in `package.json` jest config (`src/*` maps to `<rootDir>/*`)

**E2E Tests**: Located in `test/**/*.e2e-spec.ts` files, testing full request/response cycles

- Use Supertest for HTTP assertions
- Test actual endpoints with real database interactions
- Setup/teardown test data in `beforeAll`/`afterAll` hooks
- Add `/* eslint-disable @typescript-eslint/no-unsafe-member-access */` for Supertest response assertions

### Test Coverage

Current test coverage includes:

- **ListUsersUseCase** (17 tests): Offset pagination, limit validation, page bounds, total count calculation, keyword search (name/email/callname), case-insensitive search, combined search and pagination
- **CreateUserUseCase**: User creation, transaction handling, callname defaults
- **GetUserByIdUseCase**: User retrieval, not found handling
- **UpdateUserUseCase**: User updates, field validation
- **DeleteUserUseCase**: Soft delete operations
- **UsersController E2E**: Full API endpoint testing (list with offset pagination, keyword search, get, create, update, delete)

## Key Patterns to Follow

1. **Adding New Modules**: Create module in `src/modules/{name}/`, add to `LoaderModule._mapModules()` map, define module config type, implement `configure()` static method, add static `permissions` array
2. **Adding Use Cases**: Create in `use-case/{subdomain}/` with clear single responsibility, inject repositories/services via constructor
3. **Adding Storage Disks**: Extend `Disk` class, register in `LoaderModule.configure()` via `LocalStorageModule.registerServer()`
4. **Frontend Modules**:
   - Create module directory: `web/src/modules/{name}/`
   - Create API client: `{name}.api.ts` with CRUD functions (get, list, create, update, delete)
   - Create components: `{Name}Table.vue`, `{Name}Form.vue`, `{Name}RowAction.vue`
   - Create pages: `{Name}List.vue`, `{Name}Create.vue`, `{Name}Edit.vue`
   - Add routes to `web/src/router.ts` with permissions and breadcrumbs
   - Add navigation item to `web/src/components/NavMain.vue` wrapped in `<PermissionScope>`
   - Example modules: `user`, `role`
5. **Shared Types**: Add to `contract/` workspace and export from `index.ts` for cross-workspace type safety
6. **Protecting Endpoints**: Use `@RequirePermissions()` (AND logic), `@SomePermissions()` (OR logic), or `@RequireRoles()` decorators with `PermissionsGuard` or `RolesGuard`, always apply `AuthGuard` first
7. **Adding Permissions**: Add to module's static `permissions` array, use `resource.action` naming (e.g., `products.create`), permissions automatically registered in `APP_PERMISSIONS`
8. **Implementing Pagination**:
   - **Cursor Pagination**: Use `CursorPaginationParams` and `PaginatedResult<T>` types; validate with Zod; fetch `take + 1` records to determine `hasNextPage`
   - **Offset Pagination**: Use `OffsetPaginationParams` and `OffsetPaginatedResult<T>` types; validate with Zod; use `count()` and `skip/take` for results; run count and query in parallel with `Promise.all()`
   - User module uses offset pagination exclusively for simplicity and UX consistency
9. **Implementing Search/Filtering**: Use Prisma `OR` conditions with `contains` and `mode: 'insensitive'` for case-insensitive multi-field search; combine with pagination where clause; validate keyword length (e.g., max 100 chars)
10. **Writing Tests**: Create `.spec.ts` files alongside use cases; mock dependencies with Jest; write E2E tests for controllers in `test/` directory; use eslint-disable comments for test-specific type safety issues

**Make sure run lint/npm run format after making changes**

## Common Development Tasks

### Adding a New Backend Module

1. **Create Module Structure**:

   ```bash
   server/src/modules/{module-name}/
   ├── {module-name}.module.ts       # Main module with configure() method
   ├── {module-name}.controller.ts   # REST endpoints with guards
   ├── {module-name}.graphql         # GraphQL schema (optional)
   └── use-case/
       ├── create-{entity}.use-case.ts
       ├── list-{entity}.use-case.ts
       ├── get-{entity}-by-id.use-case.ts
       ├── update-{entity}.use-case.ts
       └── delete-{entity}.use-case.ts
   ```

2. **Register Module**:
   - Add to `LoaderModule._mapModules()` map in `server/src/app/loader/loader.module.ts`
   - Implement static `configure(config)` method
   - Add static `permissions` array with all module permissions

3. **Define Contract Types**:
   - Create `contract/{module-name}/index.ts`
   - Export from `contract/index.ts`
   - Define request/response types for all endpoints

4. **Implement Use Cases**:
   - Follow single-responsibility principle
   - Inject dependencies via constructor
   - Use Prisma for database access
   - Handle errors with proper exceptions
   - Add unit tests (`.spec.ts` files)

5. **Create Controller**:
   - Use `@RequirePermissions()` on all endpoints
   - Delegate all logic to use cases
   - Return proper HTTP status codes
   - Add Swagger decorators for API docs
   - Add E2E tests in `test/` directory

### Adding a New Frontend Module

1. **Create Module Structure**:

   ```bash
   web/src/modules/{module-name}/
   ├── {module-name}.api.ts          # API client functions
   ├── components/
   │   ├── {Module}Table.vue         # Data table with pagination/search
   │   ├── {Module}Form.vue          # Create/edit form
   │   └── {Module}RowAction.vue     # Table row actions
   └── pages/
       ├── {Module}List.vue          # List page
       ├── {Module}Create.vue        # Create page
       └── {Module}Edit.vue          # Edit page
   ```

2. **Implement API Client**:
   - Use axios with proper typing from `contract/`
   - Implement: `list()`, `get()`, `create()`, `update()`, `delete()`
   - Handle errors consistently
   - Use TanStack Query for data fetching

3. **Create Components**:
   - Table: Use TanStack Table with offset pagination
   - Form: Use Zod validation matching contract types
   - RowAction: Protect actions with `<PermissionScope>`

4. **Add Routes**:
   - Add to `web/src/router.ts`
   - Set `meta.authed: true` for protected routes
   - Add `meta.permissions` array
   - Add breadcrumb configuration

5. **Add Navigation**:
   - Update `web/src/components/NavMain.vue`
   - Wrap in `<PermissionScope>` with required permissions
   - Use appropriate Lucide icon

### Implementing Pagination

**Offset Pagination** (recommended for most use cases):

```typescript
// Contract type
import { OffsetPaginationParams, OffsetPaginatedResult } from "@panah/contract";

// Use case
const [total, data] = await Promise.all([
  this.prisma.entity.count({ where }),
  this.prisma.entity.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { created_at: "desc" },
  }),
]);

return {
  data,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
};
```

**Cursor Pagination** (for real-time data):

```typescript
// Fetch take + 1 to determine hasNextPage
const items = await this.prisma.entity.findMany({
  take: limit + 1,
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { id: "asc" },
});

const hasMore = items.length > limit;
const data = hasMore ? items.slice(0, -1) : items;
```

### Implementing Search

```typescript
// Multi-field case-insensitive search
const where = keyword
  ? {
      OR: [
        { name: { contains: keyword, mode: "insensitive" } },
        { email: { contains: keyword, mode: "insensitive" } },
        { description: { contains: keyword, mode: "insensitive" } },
      ],
    }
  : {};

// Combine with pagination
const data = await this.prisma.entity.findMany({
  where,
  skip: (page - 1) * limit,
  take: limit,
});
```

### Adding Permissions

1. **Define Permission**: Add to module's static `permissions` array

   ```typescript
   static readonly permissions = [
     'products.list',
     'products.create',
     'products.update',
     'products.delete',
     'products.export',
   ];
   ```

2. **Protect Endpoint**: Use decorator in controller

   **Option A: @RequirePermissions (AND logic)** - User must have ALL specified permissions

   ```typescript
   @Get()
   @UseGuards(AuthGuard, PermissionsGuard)
   @RequirePermissions('products.list')
   async list() {
     // User must have 'products.list' permission
   }

   @Get('advanced')
   @UseGuards(AuthGuard, PermissionsGuard)
   @RequirePermissions('products.list', 'products.export')
   async advancedList() {
     // User must have BOTH 'products.list' AND 'products.export'
   }
   ```

   **Option B: @SomePermissions (OR logic)** - User must have AT LEAST ONE permission

   ```typescript
   @Get()
   @UseGuards(AuthGuard, PermissionsGuard)
   @SomePermissions('products.list', 'products.view')
   async list() {
     // User needs either 'products.list' OR 'products.view'
   }
   ```

   **Option C: Combined** - Mix both decorators

   ```typescript
   @Get('export')
   @UseGuards(AuthGuard, PermissionsGuard)
   @RequirePermissions('products.list')
   @SomePermissions('products.export', 'products.admin')
   async export() {
     // User must have 'products.list' AND ('products.export' OR 'products.admin')
   }
   ```

3. **Frontend Guard**: Wrap UI elements

   ```vue
   <PermissionScope :permissions="['products.create']">
     <Button>Create Product</Button>
   </PermissionScope>
   ```

4. **Route Protection**: Add to route meta
   ```typescript
   {
     path: '/products',
     meta: { authed: true, permissions: ['products.list'] }
   }
   ```

### Adding Storage Disk

1. **Create Disk Class**:

   ```typescript
   // server/src/modules/{module}/storage/{feature}.disk.ts
   export class FeatureDisk extends Disk {
     readonly diskName = "feature-files";
     readonly basePath = "feature";
   }
   ```

2. **Register Disk**:
   ```typescript
   // In LoaderModule.configure()
   LocalStorageModule.registerServer([new FeatureDisk(app)]);
   ```

### Database Migrations

```bash
# Create migration
cd server
npx prisma migrate dev --name add_feature_table

# Apply migrations
npx prisma migrate dev

# Reset database (development only)
npx prisma migrate reset

# Generate Prisma client after schema changes
npx prisma generate
```

## Reference Implementation: User & Role Modules

The user and role modules serve as **reference implementations** for all patterns in this template:

- **Full CRUD operations**: Create, read, update, delete (soft delete)
- **Offset pagination**: Page-based navigation with total count
- **Keyword search**: Multi-field case-insensitive search
- **Permission guards**: Comprehensive RBAC implementation
- **Relationship management**: User-role assignment with junction table
- **Caching strategy**: Redis caching for aggregated permissions
- **Frontend patterns**: Table, form, row actions, list/create/edit pages
- **Type safety**: Full contract types across server and web
- **Testing**: Unit tests for use cases, E2E tests for endpoints
- **GraphQL support**: Schema definitions and resolvers

**When implementing new features, refer to these modules for patterns and structure.**

## Implemented Features

### Role Management (Full Stack)

Full role management implemented in both server and web workspaces following the user module pattern:

**Server Implementation** (`server/src/modules/user/use-case/role/`):

- `ListRolesUseCase`: Offset pagination with keyword search across name, slug, and description
- `CreateRoleUseCase`: Create roles with validation
- `UpdateRoleUseCase`: Update roles (system roles protected)
- `DeleteRoleUseCase`: Soft delete roles
- `GetRoleByIdUseCase`: Retrieve single role
- Returns `OffsetPaginatedResult<Role>` with pagination metadata

**Web Implementation** (`web/src/modules/role/`):

- `role.api.ts`: API client with CRUD operations for roles and permissions fetching
- `components/RolesTable.vue`: Data table with offset pagination, sorting, keyword search
- `components/RoleForm.vue`: Form with **grouped permission checkboxes** (grouped by resource)
- `components/RolesRowAction.vue`: Edit/delete actions (system roles cannot be deleted)
- `pages/RolesList.vue`: List page with create button
- `pages/RoleCreate.vue`: Create page with redirect to list on success
- `pages/RoleEdit.vue`: Edit page with data fetching

**Features**:

- **Pagination**: Offset-based pagination (page, limit) with total count
- **Search**: Case-insensitive keyword search across name, slug, and description
- **Sorting**: Sortable by id, name, slug, created_at
- **Permission Control**: roles.list, roles.create, roles.update, roles.delete
- **Permission Selection UI**: Grouped checkboxes organized by resource context
  - Permissions grouped by resource (users, roles, etc.)
  - Select/deselect entire groups or individual permissions
  - Indeterminate state for partially selected groups
  - Fetches available permissions from `/api/permissions` endpoint
- **System Role Protection**: Cannot edit/delete system roles
- **Status Management**: Active/inactive toggle (inactive roles cannot be assigned)
- **Soft Delete**: With undo functionality
- **Navigation**: Integrated in Administrator section with Shield icon

**Routes**:

- `/roles` - List roles with pagination
- `/roles/create` - Create new role
- `/roles/edit/:id` - Edit existing role

**Contract Types**:

- `contract/role/index.ts`:
  - `ICreateRoleBody`: { name, slug, description?, permissions[] }
  - `IUpdateRoleBody`: { name?, description?, permissions[]?, active? }
- `contract/permissions/index.ts`:
  - `PermissionGroup`: { resource: string, permissions: string[] }
  - `AvailablePermissionsResponse`: { permissions: string[], groups: PermissionGroup[] }

### User-Role Assignment (Full Stack)

Full user-role assignment functionality implemented for managing user permissions:

**Server Implementation** (already existed):

- `AssignRoleUseCase`: Assigns role to user with duplicate prevention and permission cache invalidation
- `RemoveRoleUseCase`: Removes role from user with permission cache invalidation
- `GetUserRolesUseCase`: Fetches all active roles assigned to a user
- `GetUserPermissionsUseCase`: Aggregates permissions from all user's roles with Redis caching
- Endpoints: GET/POST/DELETE `/api/users/:userId/roles`, GET `/api/users/:userId/roles/permissions`

**Web Implementation** (`web/src/modules/user/`):

- **API Client** (`user.api.ts`): Added user-role methods
  - `getUserRoles(userId)`: Fetch user's assigned roles
  - `getUserPermissions(userId)`: Fetch user's aggregated permissions
  - `assignRole(userId, roleId)`: Assign role to user
  - `removeRole(userId, roleId)`: Remove role from user
- **Component** (`components/UserRolesManager.vue`): Interactive role management UI
  - Displays current roles as badges with Shield icon
  - Remove button (X) for each role (protected by `users.roles.remove` permission)
  - "Add Role" button opens selection dialog (protected by `users.roles.assign` permission)
  - Role selection dialog with radio buttons showing role details (name, description, permissions count)
  - Filters out already assigned and inactive roles from selection
  - Loading states for all operations
  - Success/error toast notifications
  - System roles cannot be removed
- **Integration**: Integrated into `pages/UserEdit.vue` as a separate card below UserForm

**Features**:

- **Permission Control**: users.roles.list, users.roles.assign, users.roles.remove
- **Real-time Updates**: Uses TanStack Query for automatic data synchronization
- **Smart Filtering**: Only shows active, non-deleted, unassigned roles in selection
- **System Role Protection**: System roles display without remove button
- **User Experience**:
  - Radio selection for single role assignment
  - Visual feedback with loading spinners
  - Toast notifications for success/error
  - Disabled state when no roles available
- **Responsive Design**: Card layout with proper spacing and mobile-friendly interface

**Contract Types**:

- `contract/user/index.ts`:
  - `IAssignRoleBody`: { roleId: string }
  - `IGetUserRolesResponse`: { data: Role[] }
  - `IGetUserPermissionsResponse`: { permissions: string[] }

**Usage**:
The UserRolesManager component is automatically displayed on the user edit page (`/users/edit/:id`). Users with appropriate permissions can:

1. View all assigned roles for a user
2. Add new roles by clicking "Add Role" and selecting from available active roles
3. Remove roles by clicking the X button on each role badge (except system roles)

## Troubleshooting

### Common Issues

**"Permission denied" errors**:

- Verify user has required role/permissions
- Check if permission is registered in module's `permissions` array
- Clear Redis cache: permissions may be cached with old values
- Check `AuthMiddleware` configuration for endpoint path

**Type errors between server and web**:

- Ensure contract types are updated in `contract/` workspace
- Run `npm run build` in root to rebuild all workspaces
- Verify types are exported from `contract/index.ts`

**Module not loading**:

- Check if module is added to `LoaderModule._mapModules()` map
- Verify module is in `config.modules` array in `server/config.json`
- Check module's `configure()` method implementation
- Look for errors in server startup logs

**Prisma client errors**:

- Run `npx prisma generate` after schema changes
- Ensure migrations are applied: `npx prisma migrate dev`
- Check database connection string in `.env`

**JWT authentication failures**:

- Verify RSA key pair is configured (env vars)
- Check private key passphrase is correct
- Ensure token hasn't expired (check expiration config)
- Verify `AuthMiddleware` is properly configured

**GraphQL schema issues**:

- Rebuild GraphQL schema: restart server
- Check `.graphql` files for syntax errors
- Verify GraphQL resolvers match schema definitions

**Test failures**:

- Check mock implementations match actual service interfaces
- Verify test database is properly seeded
- Use proper eslint-disable comments for Jest/Supertest
- Check module path mapping in `jest.config.js`

### Debug Commands

```bash
# Check database schema
cd server && npx prisma studio

# View Redis cache
redis-cli
> KEYS *
> GET permission:user:{userId}

# Test specific endpoint
curl -H "Authorization: Bearer {token}" http://localhost:3000/api/users

# Run specific test
npm test -- --testPathPatterns="create-user"

# Check TypeScript types
cd server && npx tsc --noEmit
cd web && npx vue-tsc --noEmit
```

## Quick Reference

### File Locations

- **Server modules**: `server/src/modules/{module}/`
- **Use cases**: `server/src/modules/{module}/use-case/`
- **Controllers**: `server/src/modules/{module}/{module}.controller.ts`
- **Frontend modules**: `web/src/modules/{module}/`
- **API clients**: `web/src/modules/{module}/{module}.api.ts`
- **Contract types**: `contract/{domain}/index.ts`
- **Prisma schema**: `server/prisma/schema.prisma`
- **Server config**: `server/config.json`
- **Environment vars**: `server/.env`
- **Unit tests**: `server/src/**/*.spec.ts`
- **E2E tests**: `server/test/**/*.e2e-spec.ts`

### Permission Format

```
{resource}.{action}
```

Examples: `users.list`, `roles.create`, `products.update`, `users.roles.assign`

### Decorator Quick Reference

```typescript
// Authentication
@UseGuards(AuthGuard)

// Permission-based authorization
@RequirePermissions('users.create')
@UseGuards(PermissionsGuard)

// Role-based authorization
@RequireRoles('superadmin')
@UseGuards(RolesGuard)

// Swagger documentation
@ApiOperation({ summary: 'List users' })
@ApiResponse({ status: 200, type: [UserDto] })
```

### Contract Type Patterns

```typescript
// Request body
export interface ICreate{Entity}Body {
  field: string;
}

// Update body (all optional)
export interface IUpdate{Entity}Body {
  field?: string;
}

// Response
export interface I{Entity}Response {
  data: Entity;
}

// Paginated response
export interface I{Entity}ListResponse extends OffsetPaginatedResult<Entity> {}
```

### Vue Component Patterns

```vue
<!-- Table Component -->
<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
// TanStack Table setup with offset pagination
</script>

<!-- Form Component -->
<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
// Zod schema matching contract types
</script>

<!-- Permission Scope -->
<PermissionScope :permissions="['resource.action']">
  <Button>Protected Action</Button>
</PermissionScope>
```

---

**IMPORTANT**: Always update this CLAUDE.md file when:

- Adding new modules or significant features
- Introducing new architectural patterns
- Changing core configurations or workflows
- Discovering important gotchas or best practices
- Implementing complex features that should serve as future reference

This documentation is the source of truth for AI agents and developers working on this codebase.
