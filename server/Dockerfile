# ============================================
# Nduoseh Server - Production Dockerfile
# ============================================
# Multi-stage build for optimal image size and security
# Base: Node.js 24 Alpine for minimal footprint
# ============================================

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:24-alpine AS dependencies

# Set working directory
WORKDIR /app

# Install dependencies needed for node-gyp and native modules
# Only install what's absolutely necessary
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    openssl \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including dev) for building
# Use npm ci for reproducible builds
RUN npm ci --ignore-scripts

# Generate Prisma Client
RUN npx prisma generate

# ============================================
# Stage 2: Build
# ============================================
FROM node:24-alpine AS builder

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code and configuration
COPY . .

# Build the application
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# ============================================
# Stage 3: Production
# ============================================
FROM node:24-alpine AS production

# Install dumb-init for proper signal handling
# This ensures the Node.js process receives signals correctly
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Create non-root user for security
# Never run Node.js applications as root in production
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

# Copy built application and production dependencies
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# Copy RSA keys directory structure (will be mounted as volume)
RUN mkdir -p /app/keys && chown -R nodejs:nodejs /app/keys

# Copy storage directory structure (will be mounted as volume)
RUN mkdir -p /app/storage && chown -R nodejs:nodejs /app/storage

# Switch to non-root user
USER nodejs

# Expose port (default: 3000)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health-check', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
# This ensures graceful shutdown on SIGTERM
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/main.js"]
