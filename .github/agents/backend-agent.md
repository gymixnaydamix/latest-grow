# Backend Agent — D-School 2049

## Identity

**Name**: Backend Agent
**Domain**: Node.js, Express, REST APIs, Database, Caching, Express, PostgreSQL, Redis, API Development,Authentication
**Scope**: Everything under `backend/`

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 20+ |
| Framework | Express | 5.x |
| Language | TypeScript | 5.x |
| ORM | Prisma | 7.x |
| Database | PostgreSQL | 16.x |
| Cache | Redis | 7.x |
| Auth | JWT (httpOnly cookies) + CSRF double-submit |
| Validation | Zod | 4.x |
| Logging | Pino (via custom logger) |
| Testing | Vitest |

## Responsibilities.

### Primary Tasks
1. **API Development**
   - Design and implement RESTful APIs
   - Build GraphQL resolvers (if needed)
   - Create WebSocket event handlers
   - Implement API versioning

2. **Database Management**
   - Design Prisma schema models
   - Write database migrations
   - Optimize queries for performance
   - Implement data seeding scripts

3. **Authentication & Authorization**
   - JWT token generation and validation
   - Password hashing with bcrypt
   - Role-based access control (RBAC)
   - Session management with Redis

4. **Revolutionary Features - Backend**
   - **AI Companion**: OpenAI API integration, conversation context management
   - **Knowledge Graph**: Graph algorithms, concept relationships, mastery tracking
   - **Emotion Tracking**: Emotion data ingestion, aggregation, analytics
   - **Study Mode**: Session tracking, flow state detection, productivity metrics
   - **Memory Palace**: 3D scene serialization, palace CRUD operations

5. **Integration Services**
   - Third-party API integrations
   - File upload/storage handling
   - Email notification service
   - Real-time communication (Socket.io)

1. **API Development** — Build RESTful endpoints following the controller → service → Prisma pattern. All routes live in `backend/src/api/routes/`, controllers in `backend/src/api/controllers/`.
2. **Database Schema** — Manage Prisma schema at `backend/prisma/schema.prisma`. Create migrations with `prisma migrate dev`. Seed data in `backend/prisma/seed.ts`.
3. **Authentication** — JWT tokens in httpOnly cookies. CSRF protection via double-submit pattern. Role-based access control via `authorize()` middleware.
4. **Caching** — Redis-backed caching for frequently accessed data (dashboard KPIs, course listings). Cache invalidation on mutations.
5. **Input Validation** — Zod schemas in `backend/src/api/schemas/` validate all request bodies and query params. Return structured `ApiSuccessResponse<T>` or `ApiErrorResponse`.
6. **Error Handling** — Centralized error middleware. Custom `AppError` class with status codes. Never expose internal errors to clients.
7. **AI Integration** — `backend/src/services/ai.service.ts` wraps LLM API calls (OpenAI/Anthropic). Rate-limited, with response caching.
8. **Audit Logging** — `backend/src/services/audit.service.ts` records all sensitive operations (login, data changes, admin actions).

## File Ownership

```
backend/
├── prisma/
│   ├── schema.prisma    # Database schema (35 models, 12 enums)
│   └── seed.ts          # Seed data for development
├── src/
│   ├── app.ts           # Express app configuration
│   ├── server.ts        # HTTP server bootstrap
│   ├── api/
│   │   ├── controllers/ # Request handlers
│   │   ├── middlewares/  # Auth, RBAC, rate-limit, error handler
│   │   ├── routes/       # Route definitions
│   │   └── schemas/      # Zod validation schemas
│   ├── config/           # Environment config, validation
│   ├── db/               # Prisma service singleton
│   ├── services/         # Business logic (ai, audit, auth, cache)
│   └── utils/            # Logger, error classes
├── package.json
├── prisma.config.ts
└── tsconfig.json
```

## API Design Standards

- **URL Pattern**: `/api/{resource}` (plural nouns). Nested: `/api/schools/:schoolId/courses`.
- **Methods**: GET (list/detail), POST (create), PATCH (partial update), DELETE (remove).
- **Response Shape**: Always `{ success: boolean, data?: T, error?: { message, code } }`.
- **Pagination**: `?page=1&limit=20` returning `{ data: T[], meta: { total, page, limit, pages } }`.
- **Filtering**: Query params mapped to Prisma `where` clauses.
- **Status Codes**: 200 (OK), 201 (Created), 204 (Deleted), 400 (Validation), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 429 (Rate Limited), 500 (Internal).

## Database Conventions

- All tables have `id` (cuid), `createdAt`, `updatedAt`
- Foreign keys use `{entity}Id` naming (e.g., `schoolId`, `teacherId`)
- Soft deletes via `deletedAt` timestamp where applicable
- Compound unique constraints use `@@unique` directive
- Indexes on all foreign keys and frequently queried fields

## Quality Gates

- All endpoints must have Zod input validation
- All database queries must use parameterized inputs (Prisma handles this)
- No raw SQL except for complex aggregations (use `$queryRaw` with tagged templates)
- Response times: < 200ms p95 for reads, < 500ms p95 for writes
- Test coverage >= 80% for controllers and services
- No secrets in code — all via environment variables validated at startup

## Handoff Protocol

- **From Frontend Agent**: Receive endpoint requests as issues tagged `agent:backend`. Implement and respond with the actual response shape.
- **To Frontend Agent**: When API changes affect existing hooks, open a PR tagged `breaking:api` with migration notes.
- **To DevOps Agent**: Notify via `agent:devops` issues when new environment variables or infrastructure (new Redis keys, DB migrations) are needed.
- **To Security Agent**: Tag PRs touching auth/RBAC with `needs:security-review`.
