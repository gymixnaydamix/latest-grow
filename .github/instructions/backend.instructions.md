---
applyTo:
  - "backend/**"
---

# Backend Instructions

## Architecture

- **Express 5** application with TypeScript.
- **Prisma 7** ORM with PostgreSQL (via `@prisma/adapter-pg`).
- **Redis** for caching and session management.

## Controller pattern

Controllers follow a consistent try/catch/next pattern:

```typescript
async handler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await someService.doWork(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
```

Never send error responses directly — always delegate to `next(error)` for centralized error handling.

## Route definitions

Routes use middleware chains in this order:

1. `authenticate` — verify JWT from cookie
2. `validateCsrf` — check CSRF token for mutations
3. `validate({ body, params, query })` — Zod schema validation
4. `rbac([...roles])` — role-based access control
5. Controller handler

Routes are mounted at `/api/{feature}` (e.g., `/api/auth`, `/api/student`, `/api/admin`).

## Validation

- Define Zod schemas in `backend/src/api/schemas/`.
- Validate request body, params, and query separately.
- The `validation.middleware.ts` handles validation and returns structured errors.

## Middleware reference

| Middleware | File | Purpose |
|---|---|---|
| `authenticate` | `auth.middleware.ts` | JWT cookie verification, attaches `req.user` |
| `validateCsrf` / `generateCsrfToken` | `csrf.middleware.ts` | CSRF protection for mutations |
| `validate` | `validation.middleware.ts` | Zod schema validation |
| `rbac` | `rbac.middleware.ts` | Role-based access control |
| `parentScope` | `parent-scope.middleware.ts` | Parent-to-child data isolation |
| `providerRbac` | `provider-rbac.middleware.ts` | Provider-to-school isolation |
| `errorHandler` | `error.middleware.ts` | Centralized error responses |

## Database (Prisma)

- Schema: `backend/prisma/schema.prisma` with 80+ models.
- Generate client: `pnpm --filter ./backend exec prisma generate`.
- Migrations: `pnpm --filter ./backend exec prisma migrate dev`.
- `TenantStatus` enum has 4 values: ACTIVE, TRIAL, SUSPENDED, CHURNED.
- User roles: PROVIDER, ADMIN, TEACHER, STUDENT, PARENT, FINANCE, MARKETING, SCHOOL.

## Testing

- Framework: Vitest 4 with v8 coverage.
- Test files: `backend/src/__tests__/**/*.test.ts`.
- Run tests: `pnpm backend:test` (requires `DATABASE_URL` environment variable).
- Mock Prisma models thoroughly — when testing controllers that invoke service functions, mock every Prisma model the service accesses, not just the primary one.

## Security

- JWT stored in HttpOnly cookies — never expose tokens in response bodies.
- CSRF tokens required for all state-changing requests.
- Use `helmet` for HTTP headers, `cors` for origin control, `express-rate-limit` for throttling.
- Sanitize and validate all user input via Zod schemas.
