# Security Policy

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue in Nduoseh, please report it responsibly.

### How to Report

**Please DO NOT open a public GitHub issue for security vulnerabilities.**

Instead, please report security issues by emailing:

- **Email**: [your-security-email@example.com]
- **Subject**: "[SECURITY] Brief description of the issue"

Include in your report:

1. **Description** - Clear description of the vulnerability
2. **Impact** - Potential impact and attack scenario
3. **Steps to Reproduce** - Detailed steps to reproduce the issue
4. **Proof of Concept** - Code snippets or screenshots if applicable
5. **Suggested Fix** - If you have recommendations (optional)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt within 48 hours
- **Updates**: We will keep you informed of our progress
- **Fix Timeline**: We aim to release a fix within 7-14 days for critical issues
- **Credit**: We will credit you in the security advisory (unless you prefer to remain anonymous)

## Supported Versions

| Version | Supported          | Notes                    |
| ------- | ------------------ | ------------------------ |
| 1.x.x   | :white_check_mark: | Current stable release   |
| < 1.0   | :x:                | Development versions     |

We recommend always using the latest stable version for the best security and features.

## Security Features

Nduoseh includes enterprise-grade security features out of the box:

### Authentication & Authorization

- **JWT with RS256 Asymmetric Signing**
  - Prevents token forgery attacks
  - Public/private key pair required
  - Configurable token expiration
  - Support for local and remote verification

- **Refresh Token Rotation**
  - Single-use refresh tokens
  - Automatic rotation on each refresh
  - Stored securely in HTTP-only cookies
  - Session invalidation on logout

- **Role-Based Access Control (RBAC)**
  - Fine-grained permission system
  - Permission caching with Redis
  - System role protection
  - Superadmin protection mechanisms

### Input Validation & Data Protection

- **Zod Schema Validation**
  - All API inputs validated
  - Type-safe validation across the stack
  - Custom validators for complex fields (e.g., password strength, file uploads)

- **SQL Injection Protection**
  - Prisma ORM with parameterized queries
  - No raw SQL queries in reference implementation
  - Database-level constraints

- **XSS Protection**
  - Vue 3 automatic HTML escaping
  - Sanitized user inputs
  - Content Security Policy headers (configure in your deployment)

### Session & Data Management

- **Session Tracking**
  - Device and IP tracking
  - Active session management
  - Session revocation capabilities

- **Soft Deletes**
  - User data recovery
  - Audit trail preservation
  - GDPR compliance support

- **Secure File Upload**
  - File type validation
  - File size limits
  - Storage abstraction layer
  - Configurable storage paths

### Infrastructure Security

- **CORS Configuration**
  - Configurable allowed origins
  - Environment-based settings
  - Strict origin validation

- **Environment Variable Protection**
  - Sensitive data in environment variables
  - .env files in .gitignore
  - Example files provided without secrets

- **Error Handling**
  - Global error filter
  - No sensitive data in error responses
  - Structured error responses
  - Production vs development error details

## Security Best Practices

Follow these guidelines when deploying Nduoseh in production:

### 1. Environment Configuration

**Required Actions**:

```bash
# Generate strong RSA key pair (4096-bit recommended)
openssl genrsa -out private.key 4096
openssl rsa -in private.key -pubout -out public.key

# Use strong passphrase for private key
openssl genrsa -aes256 -out private.key 4096
```

**Environment Variables**:

- Set `NODE_ENV=production` in production
- Use strong, unique passwords for all services
- Never commit `.env` files to version control
- Rotate secrets regularly (JWT keys, database passwords)
- Use different credentials for each environment

### 2. Database Security

**PostgreSQL Hardening**:

```bash
# Use strong authentication
DATABASE_URL="postgresql://user:strong_password@localhost:5432/db?sslmode=require"

# Enable SSL connections
# Configure pg_hba.conf for restricted access
# Use connection pooling with reasonable limits
# Regular backups with encryption
```

**Prisma Best Practices**:

- Never expose Prisma Studio in production
- Use database connection pooling
- Set reasonable query timeouts
- Monitor query performance for SQL injection attempts

### 3. Redis Security

**Redis Hardening**:

```bash
# Use authentication
REDIS_URL="redis://:strong_password@localhost:6379"

# Configure redis.conf:
# - bind 127.0.0.1 (or specific IPs)
# - requirepass your_strong_password
# - rename-command CONFIG ""
# - maxmemory-policy allkeys-lru
```

### 4. JWT Configuration

**Token Security**:

- Keep access tokens short-lived (15-60 minutes)
- Use longer refresh token expiration (7-30 days)
- Implement token revocation lists if needed
- Store private keys securely (HSM, KMS, or encrypted storage)
- Never expose private keys in logs or error messages

### 5. CORS Configuration

**Production CORS**:

```env
# Whitelist specific origins
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Never use * in production
# CORS_ORIGIN=* # ❌ DANGEROUS
```

### 6. Rate Limiting

**Recommended Implementation** (not included by default):

```typescript
// Add rate limiting middleware
import rateLimit from '@nestjs/throttler';

// Apply to authentication endpoints
@Throttle({ default: { limit: 5, ttl: 60000 } })
@Post('login')
async login() { }
```

### 7. HTTPS & TLS

**Production Requirements**:

- Always use HTTPS in production
- Use TLS 1.2 or higher
- Configure proper SSL certificates (Let's Encrypt recommended)
- Enable HSTS headers
- Implement certificate pinning if applicable

### 8. Security Headers

**Recommended Headers** (configure in reverse proxy):

```nginx
# nginx example
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
add_header Content-Security-Policy "default-src 'self'";
add_header Referrer-Policy "strict-origin-when-cross-origin";
```

### 9. File Upload Security

**Validation Checklist**:

- Validate file types (MIME type and extension)
- Enforce file size limits
- Scan uploaded files for malware
- Store files outside web root
- Generate random filenames
- Serve files with appropriate headers

### 10. Monitoring & Logging

**Security Monitoring**:

- Log authentication attempts (successful and failed)
- Monitor for unusual access patterns
- Set up alerts for:
  - Multiple failed login attempts
  - Permission denied errors
  - Unexpected API usage
  - Database errors
- Never log sensitive data (passwords, tokens, personal data)

### 11. Dependency Management

**Keep Dependencies Updated**:

```bash
# Regular security audits
npm audit

# Fix vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated

# Use automated tools
# - Dependabot (GitHub)
# - Snyk
# - npm-check-updates
```

### 12. Deployment Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] Strong RSA key pair generated
- [ ] Database credentials rotated
- [ ] Redis authentication enabled
- [ ] CORS restricted to specific origins
- [ ] HTTPS/TLS enabled
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Logging and monitoring set up
- [ ] Dependencies audited and updated
- [ ] Swagger documentation disabled or protected (`SWAGGER_DISABLE=true`)
- [ ] Database migrations applied
- [ ] Backup strategy implemented
- [ ] Incident response plan documented

## Known Security Considerations

### Default Seeder Data

The database seeder creates default users and roles for development:

- **Action Required**: Change or remove default credentials before production deployment
- **Location**: `server/prisma/seed.ts`
- Default superadmin account should be disabled or password changed

### Swagger/OpenAPI Documentation

The API documentation is enabled by default:

- **Default URL**: `/doc`
- **Production**: Set `SWAGGER_DISABLE=true` or protect with authentication
- **Risk**: Exposes API structure and endpoints

### File Storage

The default local storage implementation stores files on disk:

- **Default Path**: `storage/` directory
- **Recommendation**: Use cloud storage (S3, GCS, Azure Blob) in production
- **Risk**: Disk space exhaustion, no redundancy

### Permission Caching

User permissions are cached indefinitely in Redis:

- **Cache Key**: `permission:user:{userId}`
- **Invalidation**: Automatic on role changes
- **Consideration**: Manual cache clear may be needed in edge cases
- **Command**: `redis-cli DEL permission:user:{userId}`

### Password Requirements

Default password validation:

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

**Recommendation**: Customize in `server/src/utils/validation/password.validation.ts` based on your security requirements.

## Security Updates

### Update Notification

Security updates will be announced through:

- GitHub Security Advisories
- Release notes (tagged with `[SECURITY]`)
- Email notifications (if you've subscribed)

### Update Priority

- **Critical**: Patch within 24 hours
- **High**: Patch within 7 days
- **Medium**: Patch within 30 days
- **Low**: Patch with next regular update

### Applying Updates

```bash
# Pull latest changes
git fetch origin
git checkout v1.x.x

# Update dependencies
npm install

# Run migrations if needed
cd server && npx prisma migrate deploy

# Rebuild and restart
npm run build
# Restart your application
```

## Compliance & Privacy

### GDPR Considerations

Nduoseh includes features to help with GDPR compliance:

- Soft deletes for data recovery
- User data export capabilities (implement as needed)
- Session tracking and revocation
- Audit trails via timestamps

**Note**: Full GDPR compliance requires additional implementation based on your specific use case.

### Data Retention

Implement data retention policies:

- Define retention periods for user data
- Implement automated cleanup jobs
- Provide user data export functionality
- Document data processing activities

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security](https://docs.nestjs.com/security/authentication)
- [Vue.js Security](https://vuejs.org/guide/best-practices/security.html)
- [Prisma Security](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

## Questions?

If you have questions about security practices in Nduoseh:

- Check the [CLAUDE.md](CLAUDE.md) for technical details
- Review the [README.md](README.md) for general documentation
- Open a GitHub Discussion (for non-sensitive questions)
- Email security team for sensitive concerns

---

**Last Updated**: 2026-02-04

**Note**: This security policy applies to the Nduoseh starter template. Organizations using this template should adapt this policy to their specific security requirements and threat model.
