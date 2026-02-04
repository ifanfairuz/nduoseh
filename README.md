# Nduoseh - Full-Stack Starter Template

[![CI](https://github.com/ifanfairuz/nduoseh/actions/workflows/ci.yml/badge.svg)](https://github.com/ifanfairuz/nduoseh/actions/workflows/ci.yml)
[![Test Coverage](https://github.com/ifanfairuz/nduoseh/actions/workflows/coverage.yml/badge.svg)](https://github.com/ifanfairuz/nduoseh/actions/workflows/coverage.yml)

A production-ready, enterprise-grade starter template for building modern web applications with authentication, authorization, and modular architecture out of the box.

## Overview

Nduoseh is a comprehensive full-stack TypeScript template that provides everything you need to kickstart your next web application. Built with industry best practices and battle-tested patterns, it eliminates months of boilerplate setup and lets you focus on building features that matter.

### What's Included

- **Enterprise Authentication** - JWT-based auth with RS256 signing, refresh tokens, and session management
- **Role-Based Access Control** - Flexible RBAC system with permission caching and fine-grained access control
- **Modular Architecture** - Plugin-based system that lets you enable/disable features dynamically
- **Type Safety** - End-to-end type safety from database to UI with shared contracts
- **Modern Stack** - NestJS backend, Vue 3 frontend, PostgreSQL database, Redis caching
- **Developer Experience** - Hot reload, automatic API docs, comprehensive testing setup
- **Production Ready** - Error handling, validation, logging, monitoring, and deployment configurations

## Architecture

Nduoseh is built as a **monorepo** with three main workspaces:

```
nduoseh/
├── server/          # NestJS backend API
├── web/             # Vue 3 + Vite frontend
├── contract/        # Shared TypeScript types
└── README.md        # You are here
```

### Key Design Principles

1. **Modularity First** - Add or remove features without touching core code
2. **Clean Architecture** - Business logic separated from framework concerns
3. **Type Safety** - Compile-time guarantees across the entire stack
4. **Security by Default** - Permission checks, input validation, and secure defaults everywhere
5. **Developer Productivity** - Fast builds, hot reload, excellent tooling
6. **Production Ready** - Scalable, maintainable, and battle-tested patterns

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+
- RSA key pair for JWT signing

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd nduoseh

# Install dependencies
npm install

# Setup environment variables
cp server/.env.example server/.env
# Edit server/.env with your configuration

# Setup database
cd server
npx prisma migrate dev
npx prisma db seed

# Start development servers
cd ..
npm run dev
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/doc

### Default Credentials

After seeding, you can login with:

- Email: `superadmin@example.com`
- Password: Check your seeder configuration

## Core Features

### Authentication & Authorization

Out-of-the-box authentication system with:

- JWT tokens with RS256 asymmetric signing
- Refresh token rotation for enhanced security
- Session management with device tracking
- Local or remote token verification
- Permission-based and role-based access control
- Permission caching for performance

### User & Role Management

Complete user management system including:

- User CRUD with soft deletes
- Role creation and assignment
- Permission grouping and management
- User-role relationships
- Profile management with image upload
- Comprehensive permission system

### Modular Plugin System

Enable/disable features through configuration:

```json
{
  "modules": ["user", ["your-module", { "config": "here" }]]
}
```

Each module is self-contained with its own:

- Business logic (use cases)
- Database models
- API endpoints
- Permissions
- Frontend components

### API Documentation

Automatic Swagger/OpenAPI documentation for all endpoints. Access at `/doc` to:

- Explore all API endpoints
- Test requests directly in the browser
- View request/response schemas
- Download OpenAPI specification

## Technology Stack

### Backend

- **Framework**: NestJS 10
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis
- **Authentication**: JWT with RS256
- **Validation**: Zod
- **Testing**: Jest + Supertest
- **API Docs**: Swagger/OpenAPI

### Frontend

- **Framework**: Vue 3 with Composition API
- **Build Tool**: Vite
- **State Management**: Pinia
- **Routing**: Vue Router
- **UI Components**: Reka UI (Radix Vue)
- **Styling**: TailwindCSS v4
- **Data Fetching**: TanStack Query
- **Form Validation**: Vee-Validate + Zod
- **Testing**: Vitest

### DevOps

- **Monorepo**: Turborepo
- **Package Manager**: npm workspaces
- **Code Quality**: ESLint + Prettier
- **Git Hooks**: Husky (optional)

## Project Structure

```
nduoseh/
├── server/                 # Backend workspace
│   ├── src/
│   │   ├── modules/       # Feature modules
│   │   ├── services/      # Core services
│   │   └── utils/         # Utilities
│   ├── prisma/            # Database schema & migrations
│   └── test/              # E2E tests
│
├── web/                   # Frontend workspace
│   ├── src/
│   │   ├── modules/       # Feature modules
│   │   ├── components/    # Shared components
│   │   ├── pages/         # Route pages
│   │   ├── stores/        # Pinia stores
│   │   └── api/           # API clients
│   └── public/            # Static assets
│
└── contract/              # Shared types workspace
    ├── auth/              # Auth types
    ├── user/              # User types
    ├── role/              # Role types
    └── pagination/        # Pagination types
```

## Development Workflow

### Adding a New Feature

1. **Define Types** - Create contract types in `contract/`
2. **Backend Implementation**:
   - Create module in `server/src/modules/`
   - Implement use cases (business logic)
   - Add controller endpoints
   - Register permissions
   - Write tests
3. **Frontend Implementation**:
   - Create module in `web/src/modules/`
   - Build UI components
   - Add routes and navigation
   - Protect with permissions
4. **Test & Deploy**

See workspace-specific READMEs for detailed instructions.

### Available Commands

```bash
# Development
npm run dev              # Start all workspaces in dev mode
npm run build            # Build all workspaces

# Server only
cd server
npm run dev              # Start with hot reload
npm test                 # Run tests
npm run lint             # Lint code

# Web only
cd web
npm run dev              # Start dev server
npm run build            # Production build
```

## Configuration

### Environment Variables

Key configuration in `server/.env`:

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `PRIVATE_KEY_PATH` - Path to RSA private key
- `PUBLIC_KEY_PATH` - Path to RSA public key
- `CORS_ORIGIN` - Allowed CORS origins

See `server/.env.example` for complete list.

### Module Configuration

Enable/disable features in `server/config.json`:

```json
{
  "modules": ["user"]
}
```

## Security Features

- **JWT with RS256** - Asymmetric signing prevents token forgery
- **Refresh Token Rotation** - One-time use refresh tokens
- **Permission-Based Access** - Fine-grained control over resources
- **Input Validation** - All inputs validated with Zod schemas
- **SQL Injection Protection** - Prisma ORM with parameterized queries
- **XSS Protection** - Vue 3 automatic escaping
- **CORS Configuration** - Configurable CORS policies
- **Rate Limiting** - (Add your implementation)
- **Session Management** - Track and revoke active sessions

## Extending the Template

### Adding a New Module

Nduoseh comes with user and role modules as reference implementations. To add your own:

1. Create module directory in `server/src/modules/{module-name}/`
2. Define contract types in `contract/{module-name}/`
3. Implement use cases for business logic
4. Create controller with permission guards
5. Register module in `LoaderModule`
6. Add frontend components in `web/src/modules/{module-name}/`
7. Create routes with permission metadata

Detailed guides available in workspace READMEs.

## Testing

```bash
# Backend tests
cd server
npm test                 # Unit tests
npm run test:e2e         # E2E tests
npm run test:cov         # Coverage report

# Frontend tests
cd web
npm test                 # Component tests
```

## Deployment

### Docker (Recommended)

```bash
# Build images
docker-compose build

# Run containers
docker-compose up -d
```

### Manual Deployment

1. Build all workspaces: `npm run build`
2. Set production environment variables
3. Run migrations: `cd server && npx prisma migrate deploy`
4. Start server: `cd server && npm run start:prod`
5. Serve web build from `web/dist/`

## Documentation

- **Root README** (this file) - Project overview and concepts
- **[Server README](server/README.md)** - Backend technical details
- **[Web README](web/README.md)** - Frontend technical details
- **[Contract README](contract/README.md)** - Type system documentation
- **[CLAUDE.md](CLAUDE.md)** - AI development guidelines

## Contributing

This is a starter template. Fork it, customize it, make it yours!

Best practices:

- Follow existing code patterns
- Write tests for new features
- Update documentation
- Use conventional commits
- Keep the template nature in mind

## License

[Your License Here]

## Support

- **Documentation**: Check workspace READMEs for detailed guides
- **Issues**: [Your issue tracker]
- **Discussions**: [Your discussion board]

## Credits

Built with modern open-source technologies. Special thanks to all the maintainers of the frameworks and libraries used in this template.

---

**Ready to build something amazing?** Start by exploring the workspace READMEs for detailed technical documentation.
