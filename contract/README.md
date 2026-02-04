# Nduoseh Contract - Shared TypeScript Types

Type-safe contracts ensuring consistency between server and web workspaces.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Type Definitions](#type-definitions)
- [Usage](#usage)
- [Best Practices](#best-practices)
- [Adding New Types](#adding-new-types)

## Overview

The contract workspace provides **shared TypeScript types** that ensure type safety across the entire application stack. It acts as the single source of truth for data structures used in API communication, database models, and UI state.

### Why Contracts?

**Without contracts**:
```typescript
// Server
return { userId: user.id, userName: user.name };

// Web - No compile-time guarantee these match!
const user = await fetch('/api/user');
console.log(user.userId); // Could be undefined
```

**With contracts**:
```typescript
// Contract
export interface IUser {
  id: string;
  name: string;
}

// Server
return user as IUser; // TypeScript ensures this matches

// Web
const user = await fetch<IUser>('/api/user'); // Type-safe!
console.log(user.id); // TypeScript knows this exists
```

### Benefits

- **Type Safety** - Compile-time guarantees across server and web
- **IntelliSense** - Auto-completion in both workspaces
- **Refactoring** - Rename fields once, update everywhere
- **Documentation** - Types serve as living documentation
- **Validation** - Easy to create Zod schemas from types

## Architecture

### Directory Structure

```
contract/
├── index.ts               # Main export file
├── models/                # Database model types
│   └── index.ts
├── auth/                  # Authentication types
│   └── index.ts
├── user/                  # User domain types
│   └── index.ts
├── role/                  # Role domain types
│   └── index.ts
├── permissions/           # Permission types
│   └── index.ts
└── pagination/            # Pagination types
    └── index.ts
```

### Export Pattern

All types are **re-exported** from the root `index.ts`:

```typescript
// contract/index.ts
export type * from './models';
export type * from './auth';
export type * from './user';
export type * from './role';
export type * from './permissions';
export type * from './pagination';
```

This allows clean imports:
```typescript
import type { IUser, IRole, ICreateUserBody } from '@nduoseh/contract';
```

## Type Definitions

### Models (`models/index.ts`)

Base database model types matching Prisma schema:

```typescript
export interface IUser {
  id: string;
  email: string;
  name: string;
  callname: string | null;
  image: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface IRole {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  permissions: string[];
  is_system: boolean;
  active: boolean;
  created_at: Date;
  deleted_at: Date | null;
}
```

### Pagination (`pagination/index.ts`)

Reusable pagination types:

```typescript
// Offset-based pagination (for traditional page navigation)
export interface IOffsetPageInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IOffsetPaginatedResult<T> {
  data: T[];
  pagination: IOffsetPageInfo;
}

export interface IOffsetPaginationParams {
  page?: number;
  limit?: number;
  keyword?: string;
}
```

## Usage

### In Server (NestJS)

```typescript
import type { ICreateUserBody, IUser } from '@nduoseh/contract';

@Injectable()
export class CreateUserUseCase {
  async execute(data: ICreateUserBody): Promise<IUser> {
    return this.userRepository.create(data);
  }
}
```

### In Web (Vue)

```typescript
import type { IUser, IOffsetPaginatedResult } from '@nduoseh/contract';
import { apiClient } from '@/api/client';

export const userApi = {
  async list() {
    const { data } = await apiClient.get<IOffsetPaginatedResult<IUser>>('/users');
    return data;
  },
};
```

## Best Practices

### 1. Type-Only Imports

Always use `type` imports for contracts:

```typescript
// ✅ Good
import type { IUser } from '@nduoseh/contract';

// ❌ Bad (imports at runtime)
import { IUser } from '@nduoseh/contract';
```

### 2. Naming Conventions

- **Interfaces**: Prefix with `I` (e.g., `IUser`, `IRole`)
- **Request Bodies**: Suffix with `Body` (e.g., `ICreateUserBody`)
- **Responses**: Suffix with `Response` (e.g., `ILoginResponse`)

## Adding New Types

### Step 1: Create Domain Directory

```bash
mkdir contract/product
touch contract/product/index.ts
```

### Step 2: Define Types

```typescript
// contract/product/index.ts
export interface IProduct {
  id: string;
  name: string;
  price: number;
  created_at: Date;
}

export interface ICreateProductBody {
  name: string;
  price: number;
}
```

### Step 3: Export from Root

```typescript
// contract/index.ts
export type * from './product'; // Add new domain
```

## Further Reading

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Server Implementation](../server/README.md)
- [Web Implementation](../web/README.md)

---

**Need help?** Check the main [README](../README.md) or [CLAUDE.md](../CLAUDE.md).
