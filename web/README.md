# Nduoseh Web - Vue 3 Frontend

Modern Vue 3 frontend with TypeScript, TailwindCSS, and comprehensive state management.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Module System](#module-system)
- [State Management](#state-management)
- [Routing & Navigation](#routing--navigation)
- [Authentication](#authentication)
- [UI Components](#ui-components)
- [API Integration](#api-integration)
- [Testing](#testing)
- [Deployment](#deployment)

## Overview

The web workspace is a Vue 3 application implementing:

- **Modular Architecture** - Feature-based module organization
- **Type-Safe API Clients** - Full TypeScript integration with backend
- **Permission-Based UI** - Granular access control for UI elements
- **Component Library** - Reka UI (Radix Vue) components
- **State Management** - Pinia stores with persistence
- **Data Fetching** - TanStack Query for server state
- **Form Validation** - Vee-Validate with Zod schemas
- **Responsive Design** - TailwindCSS v4 with mobile-first approach

### Tech Stack

- **Framework**: Vue 3.4+ (Composition API)
- **Build Tool**: Vite 5.x
- **Language**: TypeScript 5.x
- **Styling**: TailwindCSS v4
- **Components**: Reka UI (Radix Vue)
- **Icons**: Lucide Vue
- **State**: Pinia with persistence
- **Routing**: Vue Router 4.x
- **Data Fetching**: TanStack Query (Vue Query)
- **Forms**: Vee-Validate + Zod
- **HTTP**: Axios
- **Testing**: Vitest

## Architecture

### Directory Structure

```
web/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── App.vue                    # Root component
│   ├── router.ts                  # Vue Router configuration
│   ├── modules/                   # Feature modules
│   │   ├── user/                  # User module (reference)
│   │   │   ├── user.api.ts        # API client
│   │   │   ├── components/        # Module components
│   │   │   │   ├── UsersTable.vue
│   │   │   │   ├── UserForm.vue
│   │   │   │   └── UserRowAction.vue
│   │   │   └── pages/             # Module pages
│   │   │       ├── UsersList.vue
│   │   │       ├── UserCreate.vue
│   │   │       └── UserEdit.vue
│   │   └── role/                  # Role module (reference)
│   ├── components/                # Shared components
│   │   ├── ui/                    # Reka UI components
│   │   ├── NavMain.vue            # Main navigation
│   │   ├── Sidebar.vue            # Sidebar layout
│   │   └── PermissionScope.vue    # Permission wrapper
│   ├── layouts/                   # Layout components
│   │   ├── DashboardLayout.vue
│   │   └── AuthLayout.vue
│   ├── pages/                     # General pages
│   │   ├── Login.vue
│   │   └── Dashboard.vue
│   ├── stores/                    # Pinia stores
│   │   └── auth.store.ts          # Auth state
│   ├── api/                       # API configuration
│   │   └── client.ts              # Axios instance
│   ├── lib/                       # Utilities
│   │   └── utils.ts               # Helper functions
│   └── assets/                    # Static assets
├── public/                        # Public assets
├── index.html                     # HTML entry point
├── vite.config.ts                 # Vite configuration
└── tailwind.config.js             # Tailwind configuration
```

### Core Design Patterns

#### 1. Module Pattern

Each feature is self-contained:

```
modules/{feature}/
├── {feature}.api.ts       # API client functions
├── components/            # Feature-specific components
│   ├── {Feature}Table.vue
│   ├── {Feature}Form.vue
│   └── {Feature}RowAction.vue
└── pages/                 # Feature pages
    ├── {Feature}List.vue
    ├── {Feature}Create.vue
    └── {Feature}Edit.vue
```

#### 2. API Client Pattern

Type-safe API clients using shared contracts:

```typescript
// user.api.ts
import type { IUser, ICreateUserBody, IOffsetPaginatedResult } from '@nduoseh/contract';
import { apiClient } from '@/api/client';

export const userApi = {
  async list(params?: { page?: number; limit?: number; keyword?: string }) {
    const { data } = await apiClient.get<IOffsetPaginatedResult<IUser>>('/users', { params });
    return data;
  },

  async get(id: string) {
    const { data } = await apiClient.get<IUser>(`/users/${id}`);
    return data;
  },

  async create(body: ICreateUserBody) {
    const { data } = await apiClient.post<IUser>('/users', body);
    return data;
  },
};
```

#### 3. Component Composition

Reusable components with clear responsibilities:

- **Table Components**: Data display with pagination/sorting
- **Form Components**: Input forms with validation
- **Action Components**: Row-level actions (edit, delete)
- **Page Components**: Compose table + form + actions

#### 4. Permission-Based Rendering

UI elements protected by permissions:

```vue
<PermissionScope :permissions="['users.create']">
  <Button @click="createUser">Create User</Button>
</PermissionScope>
```

## Getting Started

### Installation

```bash
npm install
```

### Environment Setup

Create `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
```

### Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Application runs at http://localhost:5173

## Module System

See the full module creation guide in the web/README.md file for detailed examples of creating:
- API clients
- Table components
- Form components
- Pages
- Routes

## State Management

### Pinia Stores

**Auth Store** (`stores/auth.store.ts`):

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { IUser } from '@nduoseh/contract';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<IUser | null>(null);
  const accessToken = ref<string | null>(null);
  const permissions = ref<string[]>([]);

  const isAuthenticated = computed(() => !!user.value);

  const hasPermission = (permission: string) => {
    return permissions.value.includes(permission);
  };

  const login = (data: { user: IUser; accessToken: string; permissions: string[] }) => {
    user.value = data.user;
    accessToken.value = data.accessToken;
    permissions.value = data.permissions;
  };

  const logout = () => {
    user.value = null;
    accessToken.value = null;
    permissions.value = [];
  };

  return {
    user,
    accessToken,
    permissions,
    isAuthenticated,
    hasPermission,
    login,
    logout,
  };
}, {
  persist: true,
});
```

## Routing & Navigation

### Route Configuration

```typescript
// src/router.ts
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      meta: { guest: true },
      component: () => import('@/pages/Login.vue'),
    },
    {
      path: '/users',
      meta: { authed: true, permissions: ['users.list'] },
      component: () => import('@/modules/user/pages/UsersList.vue'),
    },
  ],
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  if (to.meta.authed && !auth.isAuthenticated) {
    return next('/login');
  }

  if (to.meta.permissions) {
    const perms = to.meta.permissions as string[];
    if (!auth.hasAnyPermission(perms)) {
      return next('/dashboard');
    }
  }

  next();
});
```

## Authentication

### Login Flow

```vue
<script setup lang="ts">
import { useForm } from 'vee-validate';
import { useMutation } from '@tanstack/vue-query';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/api/auth';

const auth = useAuthStore();

const loginMutation = useMutation({
  mutationFn: authApi.login,
  onSuccess: (data) => {
    auth.login(data);
    router.push('/dashboard');
  },
});
</script>
```

## UI Components

### Reka UI Components

Pre-built accessible components:
- Button, Input, Select, Dialog
- Table, Form, Card, Tabs
- Dropdown, Toast

### Custom Components

**PermissionScope** - Permission-based rendering:

```vue
<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store';

const props = defineProps<{
  permissions: string[];
}>();

const auth = useAuthStore();
const hasAccess = computed(() =>
  props.permissions.some(p => auth.hasPermission(p))
);
</script>

<template>
  <slot v-if="hasAccess" />
</template>
```

## API Integration

### TanStack Query

**Query Example**:

```vue
<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { userApi } from '@/modules/user/user.api';

const { data, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: () => userApi.list(),
});
</script>
```

**Mutation Example**:

```vue
<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query';

const queryClient = useQueryClient();

const createMutation = useMutation({
  mutationFn: userApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
});
</script>
```

## Deployment

### Build for Production

```bash
npm run build

# Output in dist/
```

### Static Hosting

Deploy `dist/` folder to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Nginx

### Nginx Configuration

```nginx
server {
  listen 80;
  server_name yourdomain.com;
  root /var/www/app/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

## Further Reading

- [Vue 3 Documentation](https://vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Backend API](../server/README.md)
- [Contract Types](../contract/README.md)

---

**Need help?** Check the main [README](../README.md) or [CLAUDE.md](../CLAUDE.md).
