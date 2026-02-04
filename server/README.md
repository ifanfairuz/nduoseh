# Nduoseh Server - NestJS Backend API

Production-ready NestJS backend with modular architecture, authentication, authorization, and comprehensive testing.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Module System](#module-system)
- [Authentication & Authorization](#authentication--authorization)
- [Database & ORM](#database--orm)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)

## Overview

The server workspace is a NestJS application implementing:

- **Modular Plugin System** - Dynamic module loading via configuration
- **Use Case Architecture** - Clean separation of business logic
- **JWT Authentication** - RS256 asymmetric signing with refresh tokens
- **RBAC Authorization** - Role and permission-based access control
- **File Storage** - Disk abstraction for file management
- **Comprehensive Testing** - Unit and E2E test coverage

### Tech Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 14+ with Prisma ORM
- **Cache**: Redis 6+
- **Validation**: Zod schemas
- **Testing**: Jest + Supertest
- **Documentation**: Swagger/OpenAPI

## Architecture

### Directory Structure

```
server/
├── src/
│   ├── app.module.ts              # Root application module
│   ├── main.ts                    # Application entry point
│   ├── loader.module.ts           # Dynamic module loader
│   ├── modules/                   # Feature modules
│   │   ├── user/                  # User module (reference implementation)
│   │   │   ├── user.module.ts     # Module definition
│   │   │   ├── controller/        # REST controllers
│   │   │   ├── use-case/          # Business logic
│   │   │   │   ├── user/          # User use cases
│   │   │   │   ├── role/          # Role use cases
│   │   │   │   ├── login/         # Auth use cases
│   │   │   │   └── token/         # Token use cases
│   │   │   ├── repositories/      # Data access layer
│   │   │   ├── guards/            # Authorization guards
│   │   │   ├── decorators/        # Custom decorators
│   │   │   ├── services/          # Module services
│   │   │   └── storage/           # File storage disks
│   │   └── health-check/          # Health check module
│   ├── services/                  # Core services
│   │   ├── prisma/                # Database service
│   │   ├── redis/                 # Cache service
│   │   ├── cipher/                # Cryptography service
│   │   ├── storage/               # File storage service
│   │   └── event/                 # Event emitter service
│   └── utils/                     # Shared utilities
│       ├── validation/            # Validation utilities
│       ├── http/                  # HTTP helpers
│       └── file.ts                # File utilities
├── prisma/
│   ├── schema.prisma              # Database schema
│   ├── migrations/                # Migration files
│   └── seed.ts                    # Database seeder
├── test/                          # E2E tests
├── config.json                    # Module configuration
└── .env                           # Environment variables
```

### Core Design Patterns

#### 1. Use Case Pattern

Business logic is encapsulated in single-responsibility use case classes:

```typescript
@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly atomicService: AtomicService,
  ) {}

  async execute(data: CreateUserDto): Promise<User> {
    return this.atomicService.transaction(async (tx) => {
      // Business logic here
      return this.userRepository.create(data, tx);
    });
  }
}
```

**Benefits**:

- Single responsibility principle
- Easy to test in isolation
- Reusable across controllers
- Clear business logic flow

#### 2. Module Configuration Pattern

Each module exposes a static `configure()` method:

```typescript
@Module({})
export class UserModule {
  static readonly permissions = [
    'users.list',
    'users.create',
    // ... more permissions
  ];

  static configure(config: UserModuleConfig): DynamicModule {
    return {
      module: UserModule,
      providers: [
        /* ... */
      ],
      controllers: [
        /* ... */
      ],
      exports: [
        /* ... */
      ],
    };
  }
}
```

**Enable/disable in `config.json`**:

```json
{
  "modules": ["user", ["your-module", { "option": "value" }]]
}
```

#### 3. Repository Pattern

Data access layer abstracted through repositories:

```typescript
@Injectable()
export class UserRepository extends PrismaRepository<User> {
  constructor(prisma: PrismaService) {
    super(prisma, 'user');
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
```

#### 4. Disk Abstraction Pattern

File storage using disk pattern:

```typescript
export class UserImageDisk extends Disk {
  readonly diskName = 'user-images';
  readonly basePath = 'users/images';

  // Automatic static file serving at /storage/user-images/*
}
```

Register in `LoaderModule`:

```typescript
LocalStorageModule.registerServer([new UserImageDisk(app)]);
```

## Getting Started

### Installation

```bash
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

**Required Environment Variables**:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nduoseh"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT Keys (RS256)
PRIVATE_KEY_PATH="./keys/private.pem"
PUBLIC_KEY_PATH="./keys/public.pem"
PRIVATE_KEY_PASSPHRASE="your-passphrase"

# CORS
CORS_ORIGIN="http://localhost:5173"

# Optional
PORT=3000
SWAGGER_DISABLE=false
SWAGGER_URL="doc"
STORAGE_PATH="storage"
```

**Generate RSA Key Pair**:

```bash
# Generate random passphrase
export PRIVATE_KEY_PASSPHRASE="$(openssl rand -base64 32)"

# Generate private key 4096-bit encrypted with AES-256-CBC
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:4096 -aes-256-cbc -pass pass:"$PRIVATE_KEY_PASSPHRASE" -out keys/pkey.pem

# Extract public key
openssl rsa -in keys/pkey.pem -passin pass:"$PRIVATE_KEY_PASSPHRASE" -pubout -out keys/pubkey.pem

# Set file permissions
chmod 600 keys/pkey.pem
chmod 644 keys/pubkey.pem

# Echo passphrase to use in .env
echo "PRIVATE_KEY_PASSPHRASE=$PRIVATE_KEY_PASSPHRASE" >> .env

# Unset passphrase env var
unset PRIVATE_KEY_PASSPHRASE
```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed
```

### Development

```bash
# Development with hot reload
npm run dev

# Build
npm run build

# Production
npm run start:prod
```

## Module System

### Creating a New Module

**1. Create Module Structure**:

```bash
src/modules/product/
├── product.module.ts
├── config.ts
├── controller/
│   └── products.controller.ts
├── use-case/
│   ├── create-product.use-case.ts
│   ├── list-products.use-case.ts
│   └── ...
└── repositories/
    └── product.repository.ts
```

**2. Define Module**:

```typescript
// product.module.ts
@Module({})
export class ProductModule {
  static readonly permissions = [
    'products.list',
    'products.create',
    'products.update',
    'products.delete',
  ];

  static configure(config: ProductModuleConfig): DynamicModule {
    return {
      module: ProductModule,
      providers: [
        // Use cases
        CreateProductUseCase,
        ListProductsUseCase,
        // Repositories
        ProductRepository,
      ],
      controllers: [ProductsController],
    };
  }
}
```

**3. Register in LoaderModule**:

```typescript
// loader.module.ts
private static _mapModules(): Record<string, ModuleClass> {
  return {
    user: UserModule,
    product: ProductModule, // Add here
  };
}
```

**4. Enable in Configuration**:

```json
// config.json
{
  "modules": ["user", "product"]
}
```

### Writing Use Cases

Use cases contain business logic and are tested in isolation:

```typescript
@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly atomicService: AtomicService,
  ) {}

  async execute(data: CreateProductDto): Promise<Product> {
    // Validation
    const schema = z.object({
      name: z.string().min(1).max(255),
      price: z.number().positive(),
    });

    const validated = schema.parse(data);

    // Business logic
    return this.atomicService.transaction(async (tx) => {
      return this.productRepository.create(validated, tx);
    });
  }
}
```

### Creating Controllers

Controllers delegate to use cases and handle HTTP concerns:

```typescript
@Controller('api/products')
@UseGuards(AuthGuard, PermissionsGuard)
export class ProductsController {
  constructor(
    private readonly createProduct: CreateProductUseCase,
    private readonly listProducts: ListProductsUseCase,
  ) {}

  @Post()
  @RequirePermissions('products.create')
  @ApiOperation({ summary: 'Create product' })
  async create(@Body() body: CreateProductDto) {
    return this.createProduct.execute(body);
  }

  @Get()
  @RequirePermissions('products.list')
  @ApiOperation({ summary: 'List products' })
  async list(@Query() query: ListProductsDto) {
    return this.listProducts.execute(query);
  }
}
```

## Authentication & Authorization

### JWT Authentication

**Flow**:

1. User logs in with credentials
2. Server verifies and returns access + refresh tokens
3. Client includes access token in `Authorization: Bearer {token}` header
4. `AuthMiddleware` validates token on protected routes
5. When access token expires, use refresh token to get new tokens

**Token Types**:

- **Access Token**: Short-lived (configurable, default 15min), contains user permissions
- **Refresh Token**: Long-lived (configurable, default 7 days), single-use only

**Token Signing**: RS256 asymmetric algorithm

- Private key signs tokens (server only)
- Public key verifies tokens (can be distributed)

### Permission-Based Authorization

**Define Permissions**:

```typescript
static readonly permissions = [
  'products.list',
  'products.create',
  'products.update',
  'products.delete',
];
```

**Protect Endpoints**:

```typescript
@Get()
@RequirePermissions('products.list')
@UseGuards(AuthGuard, PermissionsGuard)
async list() {
  // Only users with 'products.list' permission can access
}
```

**Role-Based Alternative**:

```typescript
@Get()
@RequireRoles('admin', 'manager')
@UseGuards(AuthGuard, RolesGuard)
async list() {
  // Only admin or manager roles can access
}
```

### Permission Caching

User permissions are cached in Redis for performance:

```typescript
// Cache key: permission:user:{userId}
// TTL: Indefinite (invalidated on role changes)

// Automatic invalidation on:
// - Role assignment
// - Role removal
// - Role permission updates
```

### Session Management

Active sessions tracked in database:

```typescript
// AuthSession model tracks:
// - User ID
// - Device info (user agent)
// - IP address
// - Last activity
// - Login timestamp

// Logout invalidates:
// - Active session
// - All refresh tokens for that session
```

## Database & ORM

### Prisma Schema

**Key Models**:

```prisma
model User {
  id         String    @id @default(uuid())
  email      String    @unique
  name       String
  callname   String?
  image      String?
  created_at DateTime  @default(now()) @db.Timestamptz()
  updated_at DateTime  @updatedAt @db.Timestamptz()
  deleted_at DateTime? @db.Timestamptz()

  roles      UserRole[]
  sessions   AuthSession[]
  accounts   Account[]
}

model Role {
  id          String    @id @default(uuid())
  name        String
  slug        String    @unique
  description String?
  permissions Json      @default("[]") // Array of permission strings
  is_system   Boolean   @default(false)
  active      Boolean   @default(true)
  created_at  DateTime  @default(now()) @db.Timestamptz()
  deleted_at  DateTime? @db.Timestamptz()

  users       UserRole[]
}

model UserRole {
  user_id    String
  role_id    String
  created_at DateTime @default(now()) @db.Timestamptz()

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)
  role Role @relation(fields: [role_id], references: [id], onDelete: Cascade)

  @@id([user_id, role_id])
}
```

### Migrations

```bash
# Create migration
npx prisma migrate dev --name add_products_table

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (development only - destroys data!)
npx prisma migrate reset

# View database
npx prisma studio
```

### Seeding

```bash
# Run seeder
npx prisma db seed

# Seeder creates:
# - Superadmin role with all permissions
# - Default user roles
# - Test users
```

Customize in `prisma/seed.ts`.

### Transactions

Use `AtomicService` for transactions:

```typescript
await this.atomicService.transaction(async (tx) => {
  await this.userRepository.create(userData, tx);
  await this.accountRepository.create(accountData, tx);
  // All or nothing
});
```

## API Documentation

### Swagger/OpenAPI

Automatic API documentation available at `/doc` (configurable).

**Decorators**:

```typescript
@ApiOperation({ summary: 'Create user' })
@ApiResponse({ status: 201, description: 'User created', type: UserDto })
@ApiResponse({ status: 400, description: 'Validation error' })
@ApiBody({ type: CreateUserDto })
async create(@Body() body: CreateUserDto) {
  // ...
}
```

**Configuration**:

```env
SWAGGER_DISABLE=false  # Set to true to disable
SWAGGER_URL=doc        # Custom path
```

**Resolvers** use same use cases as REST:

```typescript
@Resolver('User')
export class UserResolver {
  constructor(private readonly listUsers: ListUsersUseCase) {}

  @Query('users')
  async users(@Args() args) {
    return this.listUsers.execute(args);
  }
}
```

## Testing

### Unit Tests

Test use cases in isolation with mocked dependencies:

```typescript
// create-user.use-case.spec.ts
describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let atomicService: jest.Mocked<AtomicService>;

  beforeEach(() => {
    userRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
    } as any;

    atomicService = {
      transaction: jest.fn((callback) => callback(null)),
    } as any;

    useCase = new CreateUserUseCase(userRepository, atomicService);
  });

  it('should create user', async () => {
    const userData = { email: 'test@example.com', name: 'Test' };
    const expectedUser = { id: '1', ...userData };

    userRepository.create.mockResolvedValue(expectedUser);

    const result = await useCase.execute(userData);

    expect(result).toEqual(expectedUser);
    expect(userRepository.create).toHaveBeenCalledWith(userData, null);
  });
});
```

### E2E Tests

Test full request/response cycles:

```typescript
// test/users.e2e-spec.ts
describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    // Setup test app
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login and get token
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });

    authToken = response.body.accessToken;
  });

  it('GET /api/users - should list users', () => {
    return request(app.getHttpServer())
      .get('/api/users')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('pagination');
      });
  });
});
```

### Running Tests

```bash
# All unit tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e

# Specific test file
npm test -- --testPathPattern="create-user"
```

## Deployment

### Production Build

```bash
npm run build

# Output in dist/
```

### Environment Variables

Set production environment variables:

```env
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@prod-db:5432/db"
REDIS_URL="redis://prod-redis:6379"
PRIVATE_KEY_PATH="/secrets/private.pem"
PUBLIC_KEY_PATH="/secrets/public.pem"
CORS_ORIGIN="https://yourdomain.com"
```

### Database Migrations

```bash
# Production migrations (non-interactive)
npx prisma migrate deploy
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
COPY prisma/ ./prisma/

RUN npx prisma generate

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

### Health Checks

```bash
GET /health-check

# Response
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" }
  }
}
```

## Performance Optimization

### Caching Strategy

- **Permission Cache**: User permissions cached in Redis indefinitely
- **Query Results**: Use Redis for frequently accessed data
- **Database Indexes**: Ensure proper indexing on queried fields

### Database Optimization

```typescript
// Use select to fetch only needed fields
const users = await prisma.user.findMany({
  select: { id: true, email: true, name: true },
});

// Use include for relations
const users = await prisma.user.findMany({
  include: { roles: true },
});

// Batch queries
const [users, total] = await Promise.all([
  prisma.user.findMany(),
  prisma.user.count(),
]);
```

### Connection Pooling

Prisma handles connection pooling automatically. Configure in DATABASE_URL:

```
postgresql://user:pass@host:5432/db?connection_limit=10
```

## Security Best Practices

- ✅ All endpoints protected with authentication guards
- ✅ Permission checks on every operation
- ✅ Input validation with Zod schemas
- ✅ SQL injection prevention via Prisma
- ✅ Password hashing (bcrypt)
- ✅ JWT with RS256 asymmetric signing
- ✅ Refresh token rotation
- ✅ CORS configuration
- ✅ Rate limiting (implement as needed)
- ✅ Helmet.js security headers (implement as needed)

## Troubleshooting

See [CLAUDE.md](../CLAUDE.md#troubleshooting) for common issues and solutions.

## Further Reading

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Contract Types](../contract/README.md)
- [Frontend Integration](../web/README.md)

---

**Need help?** Check the main [README](../README.md) or workspace documentation.
