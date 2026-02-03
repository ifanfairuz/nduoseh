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

**Authorization & Permissions System**:

The application implements a comprehensive role-based access control (RBAC) system:

- **Role Management**: Roles store permissions as JSON arrays, validated against `APP_PERMISSIONS` registry from `LoaderModule`
- **Permission Guards**:
  - `@RequirePermissions('users.create')` - Checks specific permissions
  - `@RequireRoles('superadmin')` - Checks role membership
  - Both guards use `PermissionsGuard` and `RolesGuard`
- **Permission Caching**: User permissions cached in Redis indefinitely, invalidated only on role changes
- **System Roles**: Roles with `is_system: true` cannot be modified/deleted (e.g., 'superadmin')
- **Superadmin Protection**: Only superadmin users can create/modify other superadmin users
- **Default Roles**: Seeder creates 7 roles (Superadmin, Store Admin, Store Manager, Cashier, Inventory Manager, Accountant, Sales Rep)
- **Permission Format**: Follows `resource.action` pattern (e.g., `users.list`, `roles.create`, `users.roles.assign`)
- **Usage Example**:
  ```typescript
  @Get()
  @RequirePermissions('users.list')
  async listUsers() {
    return this.listUsers.execute();
  }
  ```

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

**GraphQL Schema**: The user module includes GraphQL definitions in `server/src/modules/user/user.graphql`:

- **Types**: User, Role, UserRole, UserWithPermissions, pagination types (UsersPage, RolesPage)
- **Queries**: users, user, me, roles, role, roleBySlug, userRoles, userPermissions
- **Mutations**: User CRUD (create, update, delete, restore), Role CRUD, User-Role operations (assign, remove, bulk operations)
- **Input Types**: CreateUserInput, UpdateUserInput, CreateRoleInput, UpdateRoleInput, filter inputs
- **Scalars**: DateTime for timestamp fields
- Schema excludes authentication-related types (AuthSession, RefreshToken, Account) - focused on user and role management only

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

### User Management Endpoints

- `GET /api/users` - List users with offset pagination and keyword search (requires `users.list`)
  - Query params:
    - `page` (optional, >= 1, default: 1): page number
    - `limit` (optional, 1-100, default: 10): items per page
    - `keyword` (optional, max 100 chars): search keyword for name, email, or callname
  - Returns: `OffsetPaginatedResult<User>` with data array and pagination metadata
  - Response includes `pagination` with `page`, `limit`, `total`, `totalPages`
  - To fetch next page, increment `page` parameter
  - Search is case-insensitive and matches partial strings across name, email, and callname fields
- `GET /api/users/:id` - Get user by ID (requires `users.list`)
- `POST /api/users` - Create new user (requires `users.create`)
- `PUT /api/users/:id` - Update user (requires `users.update`)
- `DELETE /api/users/:id` - Delete user (soft delete) (requires `users.delete`)

**Pagination & Search Details**:
- Uses offset-based pagination only
- Results ordered by `created_at` descending
- Keyword search queries across name, email, and callname fields simultaneously
- Search is case-insensitive using PostgreSQL `ilike` comparison
- Combines pagination and search seamlessly

### Permissions Endpoints

- `GET /api/permissions` - Get all available permissions (requires `roles.list`)
  - Returns: `{ permissions: string[], groups: PermissionGroup[] }`
  - Permissions are grouped by resource (e.g., "users", "roles")
  - Used for displaying checkboxes in role form

### Role Management Endpoints

- `GET /api/roles` - List roles with offset pagination and keyword search (requires `roles.list`)
  - Query params:
    - `page` (optional, >= 1, default: 1): page number
    - `limit` (optional, 1-100, default: 10): items per page
    - `keyword` (optional, max 100 chars): search keyword for name, slug, or description
  - Returns: `OffsetPaginatedResult<Role>` with data array and pagination metadata
  - Response includes `pagination` with `page`, `limit`, `total`, `totalPages`
  - To fetch next page, increment `page` parameter
  - Search is case-insensitive and matches partial strings across name, slug, and description fields
- `GET /api/roles/:id` - Get role by ID (requires `roles.list`)
- `POST /api/roles` - Create new role (requires `roles.create`)
- `PUT /api/roles/:id` - Update role (requires `roles.update`)
- `DELETE /api/roles/:id` - Delete role (requires `roles.delete`)

**Pagination & Search Details**:
- Uses offset-based pagination only
- Results ordered by `created_at` descending by default
- Keyword search queries across name, slug, and description fields simultaneously
- Search is case-insensitive using PostgreSQL `ilike` comparison
- Combines pagination and search seamlessly

### User-Role Assignment Endpoints

- `GET /api/users/:userId/roles` - Get user's roles (requires `users.roles.list`)
- `GET /api/users/:userId/roles/permissions` - Get user's aggregated permissions (requires `users.roles.list`)
- `POST /api/users/:userId/roles` - Assign role to user (requires `users.roles.assign`)
- `DELETE /api/users/:userId/roles/:roleId` - Remove role from user (requires `users.roles.remove`)

### Registered Permissions

Current permissions exported by `UserModule.permissions`:

```typescript
'users.list', 'users.create', 'users.update', 'users.delete',
'users.roles.list', 'users.roles.assign', 'users.roles.remove',
'roles.list', 'roles.create', 'roles.update', 'roles.delete'
```

When adding new modules, add their permissions to the static `permissions` array to register them in `APP_PERMISSIONS`.

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
6. **Protecting Endpoints**: Use `@RequirePermissions()` or `@RequireRoles()` decorators with `PermissionsGuard` or `RolesGuard`, always apply `AuthGuard` first
7. **Adding Permissions**: Add to module's static `permissions` array, use `resource.action` naming (e.g., `products.create`), permissions automatically registered in `APP_PERMISSIONS`
8. **Implementing Pagination**:
   - **Cursor Pagination**: Use `CursorPaginationParams` and `PaginatedResult<T>` types; validate with Zod; fetch `take + 1` records to determine `hasNextPage`
   - **Offset Pagination**: Use `OffsetPaginationParams` and `OffsetPaginatedResult<T>` types; validate with Zod; use `count()` and `skip/take` for results; run count and query in parallel with `Promise.all()`
   - User module uses offset pagination exclusively for simplicity and UX consistency
9. **Implementing Search/Filtering**: Use Prisma `OR` conditions with `contains` and `mode: 'insensitive'` for case-insensitive multi-field search; combine with pagination where clause; validate keyword length (e.g., max 100 chars)
9. **Writing Tests**: Create `.spec.ts` files alongside use cases; mock dependencies with Jest; write E2E tests for controllers in `test/` directory; use eslint-disable comments for test-specific type safety issues

**Make sure run lint/npm run format after making changes**

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

**UPDATE CLAUDE.md AFTER MAKE CHANGE**
