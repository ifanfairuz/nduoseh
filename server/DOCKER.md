# Docker Deployment Guide - Nduoseh Server

Production-ready Docker setup for the NestJS backend with multi-stage builds and security best practices.

## Quick Start

### 1. Prepare Environment

```bash
# Navigate to project root
cd /path/to/nduoseh

# Copy environment configuration
cp .env.docker.example .env.docker

# Edit with your values
nano .env.docker
```

### 2. Generate RSA Keys

```bash
cd server

# Create keys directory
mkdir -p keys

# Generate private key with passphrase
openssl genpkey -algorithm RSA \
  -pkeyopt rsa_keygen_bits:4096 \
  -aes-256-cbc \
  -out keys/pkey.pem

# Extract public key
openssl rsa -pubout -in keys/pkey.pem -out keys/pubkey.pem

# Set proper permissions
chmod 600 keys/pkey.pem
chmod 644 keys/pubkey.pem
```

### 3. Build and Run

```bash
# Build all services
docker-compose --env-file .env.docker build

# Start services in background
docker-compose --env-file .env.docker up -d

# View logs
docker-compose --env-file .env.docker logs -f server
```

### 4. Run Migrations

```bash
# Access server container
docker-compose --env-file .env.docker exec server sh

# Run Prisma migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed

# Exit container
exit
```

### 5. Verify Deployment

```bash
# Check service health
curl http://localhost:3000/api/health-check

# View API documentation
open http://localhost:3000/doc
```

## Dockerfile Architecture

### Multi-Stage Build

The Dockerfile uses a **3-stage build** for optimal security and size:

```
┌─────────────────────────────────────────┐
│ Stage 1: Dependencies (node:24-alpine) │
│ - Install build tools                  │
│ - Install all dependencies             │
│ - Generate Prisma Client               │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ Stage 2: Builder (node:24-alpine)      │
│ - Copy dependencies                     │
│ - Build TypeScript → JavaScript        │
│ - Prune dev dependencies               │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ Stage 3: Production (node:24-alpine)   │
│ - Copy built app + prod dependencies   │
│ - Run as non-root user                 │
│ - Configure health checks              │
│ - Use dumb-init for signal handling    │
└─────────────────────────────────────────┘
```

### Image Size Optimization

- **Base**: Alpine Linux (~5MB)
- **Final Image**: ~150-200MB (vs ~1GB with full Node.js)
- **Dependencies**: Production-only, no dev packages
- **Build Artifacts**: Only compiled JavaScript, no TypeScript

### Security Features

✅ **Non-root User**: Runs as `nodejs` user (UID 1001)
✅ **Read-only Secrets**: RSA keys mounted as read-only volumes
✅ **No New Privileges**: Security flag prevents privilege escalation
✅ **Minimal Attack Surface**: Alpine base with minimal packages
✅ **Signal Handling**: dumb-init ensures proper SIGTERM handling
✅ **Health Checks**: Built-in health endpoint monitoring

## Docker Compose Stack

### Services

1. **PostgreSQL 16** - Primary database
   - Alpine-based for small footprint
   - Persistent volume for data
   - Health checks enabled

2. **Redis 7** - Caching layer
   - Alpine-based
   - AOF persistence enabled
   - Password-protected

3. **Nduoseh Server** - NestJS API
   - Multi-stage build
   - Health checks
   - Resource limits

### Networking

All services on isolated bridge network `nduoseh-network`:
- Internal service-to-service communication
- Only exposed ports accessible from host

### Volumes

- `postgres_data`: Database persistence
- `redis_data`: Redis AOF files
- `server_storage`: User uploads and file storage

## Production Best Practices

### 1. Environment Variables

Never commit `.env.docker` to version control:

```bash
# Add to .gitignore
echo ".env.docker" >> .gitignore
```

Use secrets management in production:
- **Docker Swarm**: Use Docker secrets
- **Kubernetes**: Use Kubernetes secrets
- **Cloud**: Use cloud provider's secret manager (AWS Secrets Manager, GCP Secret Manager)

### 2. Database Migrations

Always run migrations before starting the app:

```bash
# In CI/CD pipeline or deployment script
docker-compose exec server npx prisma migrate deploy
```

Or use an init container in Kubernetes.

### 3. Health Checks

The Dockerfile includes a health check:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health-check', ...)"
```

Configure your orchestrator to use this:
- Docker Compose: Automatic restart on unhealthy
- Kubernetes: Configure liveness/readiness probes
- AWS ECS: Configure health check grace period

### 4. Resource Limits

Set appropriate limits in production:

```yaml
deploy:
  resources:
    limits:
      cpus: '2'      # Adjust based on load
      memory: 2G
    reservations:
      cpus: '1'
      memory: 1G
```

### 5. Logging

Configure centralized logging:

```yaml
services:
  server:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

Or use log aggregation:
- **Fluentd**: Forward to Elasticsearch
- **AWS CloudWatch**: Use awslogs driver
- **Datadog**: Use Datadog agent

### 6. Secrets Management

**Option A: Docker Secrets (Docker Swarm)**

```yaml
secrets:
  jwt_private_key:
    external: true
  jwt_public_key:
    external: true

services:
  server:
    secrets:
      - jwt_private_key
      - jwt_public_key
```

**Option B: Environment Variables (Less secure)**

```yaml
services:
  server:
    environment:
      PRIVATE_KEY: ${PRIVATE_KEY}
      PUBLIC_KEY: ${PUBLIC_KEY}
```

**Option C: Volume Mounts (Current approach)**

```yaml
volumes:
  - ./keys/pkey.pem:/run/secrets/jwt_private_key:ro
  - ./keys/pubkey.pem:/run/secrets/jwt_public_key:ro
```

### 7. SSL/TLS Termination

Use a reverse proxy in production:

**Nginx Example**:

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
```

**Traefik Example**:

```yaml
services:
  traefik:
    image: traefik:v2.10
    command:
      - --providers.docker=true
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
    ports:
      - "80:80"
      - "443:443"
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build Docker image
        run: docker build -t nduoseh-server:${{ github.sha }} ./server

      - name: Push to registry
        run: |
          docker tag nduoseh-server:${{ github.sha }} registry.example.com/nduoseh-server:latest
          docker push registry.example.com/nduoseh-server:latest

      - name: Deploy
        run: |
          # Your deployment script
```

## Commands Reference

### Build

```bash
# Build server image only
docker build -t nduoseh-server:latest ./server

# Build with build args
docker build \
  --build-arg NODE_ENV=production \
  -t nduoseh-server:latest \
  ./server

# Build all services
docker-compose build
```

### Run

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d server

# View logs
docker-compose logs -f server

# Restart service
docker-compose restart server
```

### Debug

```bash
# Access server shell
docker-compose exec server sh

# View server logs
docker-compose logs --tail=100 server

# Check service status
docker-compose ps

# Inspect container
docker inspect nduoseh-server
```

### Cleanup

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ destroys data)
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Prune unused resources
docker system prune -a
```

## Troubleshooting

### Issue: Container keeps restarting

```bash
# Check logs
docker-compose logs server

# Common causes:
# - Database not ready (wait for healthcheck)
# - Missing environment variables
# - Port already in use
# - Migration failed
```

### Issue: Cannot connect to database

```bash
# Verify database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection from server
docker-compose exec server sh -c 'npx prisma db execute --stdin <<< "SELECT 1"'
```

### Issue: Permission denied for keys

```bash
# Fix file permissions
chmod 600 server/keys/pkey.pem
chmod 644 server/keys/pubkey.pem

# Rebuild image
docker-compose build server
docker-compose up -d server
```

### Issue: Out of memory

```bash
# Check resource usage
docker stats

# Increase memory limits in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 2G
```

## Performance Tuning

### 1. Node.js Optimizations

```dockerfile
# Set memory limits
ENV NODE_OPTIONS="--max-old-space-size=1024"

# Use production mode
ENV NODE_ENV=production
```

### 2. Database Connection Pooling

```env
DATABASE_URL="postgresql://user:pass@postgres:5432/db?connection_limit=20&pool_timeout=10"
```

### 3. Redis Optimization

```bash
# In docker-compose.yml
redis:
  command: >
    redis-server
    --maxmemory 512mb
    --maxmemory-policy allkeys-lru
    --appendonly yes
```

## Security Checklist

- [ ] Non-root user configured
- [ ] Read-only file system where possible
- [ ] Secrets not in environment variables
- [ ] Resource limits set
- [ ] Health checks enabled
- [ ] TLS/SSL termination at reverse proxy
- [ ] Network isolation configured
- [ ] No unnecessary ports exposed
- [ ] Regular base image updates (Dependabot)
- [ ] Vulnerability scanning in CI/CD

## Additional Resources

- [NestJS Production Best Practices](https://docs.nestjs.com/techniques/performance)
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
- [Prisma Docker Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)

---

**Last Updated**: 2026-02-04
