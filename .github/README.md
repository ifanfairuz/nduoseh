# GitHub Configuration

This directory contains GitHub-specific configuration files for the Nduoseh repository.

## Files

### `dependabot.yml`
Configures GitHub Dependabot for automated dependency updates across all workspaces:
- Root workspace (Turborepo, TypeScript, ESLint, Prettier)
- Server workspace (NestJS, Prisma, Jest)
- Web workspace (Vue 3, Vite, TailwindCSS)
- Contract workspace (TypeScript types)
- GitHub Actions (CI/CD workflows)
- Docker (if using Dockerfiles)

**Update Schedule**: Weekly on Mondays at 09:00 UTC

**Features**:
- Dependency grouping to reduce PR noise
- Conventional commit messages with workspace prefixes
- Automatic reviewer assignment
- Configurable PR limits per workspace

See [DEPENDABOT_GUIDE.md](./DEPENDABOT_GUIDE.md) for detailed configuration and usage.

### `dependabot-auto-merge.yml` (Example)
Example GitHub Actions workflow for automatically approving and merging Dependabot PRs for patch and minor updates.

**To enable**:
1. Enable "Allow auto-merge" in repository settings
2. Move to `.github/workflows/dependabot-auto-merge.yml`
3. Configure branch protection rules

### `DEPENDABOT_GUIDE.md`
Comprehensive guide for working with Dependabot:
- Configuration overview
- Update schedules and grouping
- Auto-merge setup
- Customization options
- Troubleshooting tips
- Best practices

## GitHub Actions Workflows

To add CI/CD workflows, create them in `.github/workflows/`:

```
.github/
├── workflows/
│   ├── ci.yml                    # Continuous Integration
│   ├── deploy.yml                # Deployment workflow
│   ├── test.yml                  # Test runner
│   └── dependabot-auto-merge.yml # Optional auto-merge
├── dependabot.yml                # Dependabot config
├── DEPENDABOT_GUIDE.md           # Dependabot documentation
└── README.md                     # This file
```

## Quick Start

1. **Commit these files to your repository**:
   ```bash
   git add .github/
   git commit -m "chore: add Dependabot configuration"
   git push
   ```

2. **Enable Dependabot** (if not already enabled):
   - Go to repository Settings → Security → Code security and analysis
   - Enable "Dependabot alerts" and "Dependabot security updates"

3. **Wait for Dependabot to run**:
   - Dependabot will run on the next scheduled time (Monday 09:00 UTC)
   - Or manually trigger by editing `dependabot.yml` (commit any change)

4. **Review and merge PRs**:
   - Dependabot will create PRs for outdated dependencies
   - Review changelogs and test changes
   - Merge when ready

5. **(Optional) Enable auto-merge**:
   - See instructions in `DEPENDABOT_GUIDE.md`
   - Rename `dependabot-auto-merge.yml` to `.github/workflows/dependabot-auto-merge.yml`

## Support

For questions or issues with Dependabot:
- Check the [DEPENDABOT_GUIDE.md](./DEPENDABOT_GUIDE.md)
- Review [GitHub Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- Check repository's Dependabot logs in Settings → Insights → Dependency graph → Dependabot
