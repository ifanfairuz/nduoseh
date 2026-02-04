# Dependabot Configuration Guide

This repository uses GitHub Dependabot to automatically keep dependencies up to date across all workspaces.

## Configuration Overview

The Dependabot configuration (`.github/dependabot.yml`) monitors:

- **Root workspace**: Turborepo, TypeScript, ESLint, Prettier
- **Server workspace**: NestJS, Prisma, Jest, and backend dependencies
- **Web workspace**: Vue 3, Vite, TailwindCSS, TanStack Query, and frontend dependencies
- **Contract workspace**: TypeScript types and shared dependencies
- **GitHub Actions**: CI/CD workflow dependencies
- **Docker**: Docker base images and dependencies

## Update Schedule

- **Frequency**: Weekly (every Monday at 09:00 UTC)
- **Pull Request Limit**: 5-10 PRs per workspace to avoid overwhelming the team
- **Reviewers**: Automatically assigns reviewers for approval

## Dependency Groups

Dependabot groups related packages together to reduce PR noise:

### Server
- **NestJS packages**: All `@nestjs/*` packages
- **Prisma packages**: `prisma` and `@prisma/*`
- **Testing packages**: Jest, Supertest, and their types

### Web
- **Vue packages**: `vue`, `vue-router`, `pinia`, `@vue/*`
- **Vite packages**: `vite` and `@vitejs/*`
- **TailwindCSS packages**: `tailwindcss`, `@tailwindcss/*`
- **TanStack packages**: `@tanstack/*`

### Root
- **Build tools**: Turbo, TypeScript, ESLint, Prettier

## Commit Message Format

Dependabot uses conventional commits with workspace prefixes:

- `chore(deps): update root dependencies`
- `chore(server): update @nestjs/* packages`
- `chore(web): update vue packages`
- `chore(contract): update typescript`
- `chore(ci): update github actions`
- `chore(docker): update base image`

## Versioning Strategy

- **`increase`**: Always increases version even if newer is available
- Respects semantic versioning (semver)
- Groups minor and patch updates together

## Auto-Merge (Optional)

To enable automatic merging of patch and minor updates:

1. **Enable auto-merge in repository settings**:
   - Go to Settings → General → Pull Requests
   - Check "Allow auto-merge"

2. **Rename the example workflow**:
   ```bash
   mv .github/dependabot-auto-merge.yml .github/workflows/dependabot-auto-merge.yml
   ```

3. **Configure branch protection**:
   - Require status checks to pass before merging
   - Require at least 1 approval (from the auto-approve workflow)

The auto-merge workflow will:
- Automatically approve patch and minor updates
- Enable auto-merge after CI passes
- Skip major updates (require manual review)

## Manual Review Required

The following updates always require manual review:

- **Major version updates** (e.g., `1.x.x` → `2.x.x`)
- **Breaking changes** in any package
- **Security advisories** (Dependabot creates separate security PRs)

## Security Updates

Dependabot also monitors for security vulnerabilities:

- Creates **priority PRs** for security updates
- Labels with `security` tag
- Notifies repository admins
- Provides vulnerability details in PR description

## Customization

### Change Update Frequency

Edit `.github/dependabot.yml`:

```yaml
schedule:
  interval: "daily"  # Options: daily, weekly, monthly
  day: "monday"      # For weekly: monday-sunday
  time: "09:00"      # 24-hour format
  timezone: "UTC"    # Any timezone
```

### Adjust PR Limits

```yaml
open-pull-requests-limit: 20  # Max concurrent PRs
```

### Add More Reviewers

```yaml
reviewers:
  - "nduoseh"
  - "team-member-1"
  - "team-member-2"
```

### Ignore Specific Dependencies

Add to the workspace configuration:

```yaml
ignore:
  - dependency-name: "package-name"
    update-types: ["version-update:semver-major"]
```

## Best Practices

1. **Review dependency groups regularly**: Ensure grouped packages still make sense
2. **Keep PR limits reasonable**: Too many PRs can be overwhelming
3. **Test before merging**: Always run CI checks
4. **Read changelogs**: Especially for major updates
5. **Update documentation**: If dependencies change APIs or configurations
6. **Monitor for breaking changes**: Even minor updates can break things
7. **Keep Dependabot config in sync**: Update when adding new workspaces

## Troubleshooting

### Dependabot PRs not appearing

1. Check if Dependabot is enabled in repository settings
2. Verify `.github/dependabot.yml` syntax with GitHub's validator
3. Check GitHub Actions logs for errors
4. Ensure repository has `package.json` in specified directories

### Too many PRs

- Reduce `open-pull-requests-limit`
- Change schedule to `monthly` instead of `weekly`
- Add more dependencies to `ignore` list
- Increase grouping to combine more packages

### Auto-merge not working

- Verify "Allow auto-merge" is enabled in settings
- Check branch protection rules don't conflict
- Ensure GitHub Actions workflow has correct permissions
- Verify CI checks are passing

## Useful Commands

```bash
# Validate dependabot.yml syntax
gh api repos/:owner/:repo/dependabot/secrets --jq .

# List open Dependabot PRs
gh pr list --author "dependabot[bot]"

# Close all Dependabot PRs (use with caution!)
gh pr list --author "dependabot[bot]" --json number --jq '.[].number' | xargs -I {} gh pr close {}

# Manually trigger Dependabot
# (Not directly supported, but you can edit dependabot.yml to force refresh)
```

## Resources

- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [Configuration Options](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file)
- [Dependabot on GitHub](https://github.com/dependabot)

---

**Last Updated**: 2026-02-04
