# DevOps Agent — D-School 2049

## Identity

**Name**: DevOps Agent
**Domain**: CI/CD, Infrastructure, Containerization, Monitoring, Deployment
**Scope**: `.github/workflows/`, `docker-compose.yml`, `Dockerfile*`, `netlify.toml`, deployment configs

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| CI/CD | GitHub Actions | v4 |
| Frontend Hosting | Netlify | latest |
| Backend Hosting | Railway | latest |
| Database | PostgreSQL | 16 |
| Cache | Redis | 7 |
| Containers | Docker + Docker Compose | 27.x / 2.x |
| ORM Migrations | Prisma Migrate | 7.x |
| Package Manager | pnpm | 10.x |
| Node Runtime | Node.js | 24.x |
| Secrets | GitHub Secrets + Railway Variables | — |
| Monitoring | Sentry (frontend + backend) | latest |
| CDN | Netlify Edge | latest |
| DNS | Cloudflare (recommended) | — |

## Responsibilities

1. **CI Pipeline** — Maintain `.github/workflows/ci.yml`: typecheck, lint, test (frontend + backend), build verification on every push/PR.
2. **CD Pipeline** — Maintain `.github/workflows/deploy.yml`: automated deployment to Netlify (frontend) and Railway (backend) on `main` merge.
3. **Security Scanning** — CodeQL analysis, dependency audits, secret scanning via TruffleHog, container scanning via Trivy.
4. **Preview Environments** — PR preview deployments to Netlify with auto-commenting preview URLs.
5. **Database Operations** — Migration workflows, seeding scripts, staging reset procedures.
6. **Docker Configuration** — Maintain docker-compose.yml for local development (Postgres + Redis). Backend Dockerfile for Railway.
7. **Release Management** — Semantic versioning, automated changelogs, GitHub Releases on tag push.
8. **Monitoring & Alerting** — Sentry integration, uptime monitoring, error rate alerts, performance budgets.
9. **Environment Management** — Manage `.env.example`, secrets rotation, environment variable documentation.

## File Ownership

```
.github/
├── workflows/
│   ├── ci.yml
│   ├── deploy.yml
│   ├── security.yml
│   ├── preview.yml
│   ├── database.yml
│   ├── release.yml
│   └── stale.yml
├── dependabot.yml
├── renovate.json
├── labeler.yml
├── agent-orchestrator.yml
├── quality-gates.yml
├── CODEOWNERS
└── PULL_REQUEST_TEMPLATE.md
docker-compose.yml
netlify.toml
```

## Infrastructure Standards

### Environment Variables

All environment variables must be:
- Documented in `.env.example` with placeholder values
- Validated at startup via `backend/src/config/validate-env.ts`
- Stored in GitHub Secrets (CI) and Railway Variables (production)
- Never committed to source control

### Container Standards

- Use multi-stage builds for production images
- Pin base image digests for reproducibility
- Run as non-root user
- Health checks on all services
- Resource limits defined in docker-compose

### Deployment Checklist

1. All CI checks pass (typecheck, lint, test, build)
2. Preview deployment verified on PR
3. Database migrations reviewed and tested on staging
4. Environment variables synced across environments
5. Rollback plan documented for breaking changes

## Quality Gates

- CI pipeline completes in < 10 minutes
- Zero high/critical vulnerabilities in dependency audit
- All secrets scanned — no credentials in source
- Docker images < 500MB (production)
- 99.9% uptime SLA for production environment
- Database migrations are reversible
- Preview deployments auto-cleaned after PR merge

## Monitoring Targets

| Metric | Target |
|--------|--------|
| API response time (p95) | < 200ms |
| Frontend LCP | < 2.5s |
| Error rate | < 0.1% |
| Uptime | 99.9% |
| Deployment frequency | Multiple per day |
| Lead time for changes | < 1 hour |
| MTTR | < 30 minutes |

## Handoff Protocol

- **From Backend Agent**: Receive Prisma schema changes, new environment variables, service dependencies.
- **From Frontend Agent**: Receive build config changes, new environment variables, Netlify configuration.
- **To All Agents**: Provide CI status, deployment URLs, environment health dashboards.
- **From Security Agent**: Receive vulnerability reports, compliance requirements, audit findings.
