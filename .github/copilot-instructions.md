# Copilot Project Instructions

You are working on **GROW YouR NEED**, a production-grade SaaS monorepo for school management. The codebase uses a React 19 + Vite frontend and an Express + Prisma backend, managed with pnpm workspaces.

## Core rule

Do not create placeholder UI, fake KPI cards, mock data, TODO implementations, stub handlers, or non-functional screens unless explicitly requested.

## Project structure

```
/                     # Frontend (React 19 + Vite + TypeScript)
├── src/
│   ├── api/          # HTTP client (cookie-based JWT + CSRF)
│   ├── components/   # shadcn/ui primitives, layout, guards, features
│   ├── hooks/api/    # React Query hooks (25+ custom hooks)
│   ├── store/        # Zustand stores (12 domain stores)
│   ├── views/        # Page-level components by role
│   ├── lib/          # Utility functions
│   ├── constants/    # App constants
│   └── services/     # Frontend business logic
├── backend/          # Backend (Express 5 + Prisma 7 + TypeScript)
│   ├── src/
│   │   ├── api/
│   │   │   ├── controllers/   # Route handlers (try/catch → next(error))
│   │   │   ├── routes/        # Express routers with middleware chains
│   │   │   ├── middlewares/   # auth, CSRF, RBAC, validation, error
│   │   │   ├── schemas/       # Zod request validation schemas
│   │   │   └── services/      # API business logic
│   │   ├── services/          # Domain services (auth, payment, audit)
│   │   ├── config/            # Env validation, database config
│   │   └── utils/             # Helper functions
│   └── prisma/
│       └── schema.prisma      # 80+ models, PostgreSQL
```

## Tech stack

- **Frontend**: React 19, Vite 7, TypeScript 5.9, Tailwind CSS 4, shadcn/ui (Radix), Zustand, TanStack React Query, React Hook Form + Zod, React Router 7, Recharts, Framer Motion
- **Backend**: Express 5, Prisma 7 (PostgreSQL + pg adapter), Redis, JWT (cookie-based), Stripe, WebSockets (ws), Zod validation
- **Testing**: Jest 30 + Testing Library (frontend), Vitest 4 (backend)
- **Package manager**: pnpm 9+ (monorepo workspaces)
- **Node.js**: 20+

## Build and test commands

```bash
pnpm install                          # Install all dependencies
cp .env.example .env.local            # Set up environment
pnpm --filter ./backend exec prisma generate  # Generate Prisma client

# Type checking
pnpm tsc --noEmit                     # Frontend
pnpm --filter ./backend typecheck     # Backend

# Linting
pnpm frontend:lint                    # ESLint frontend
pnpm backend:lint                     # ESLint backend

# Testing
pnpm frontend:test                    # Jest (frontend)
pnpm backend:test                     # Vitest (backend, needs DATABASE_URL)

# Building
pnpm frontend:build                   # Vite build
pnpm backend:build                    # tsc compile
```

## Implementation standard

Every feature must include:
- Real TypeScript types/interfaces/Zod schemas
- Real business logic
- Connected UI actions
- Proper state handling
- Loading, empty, success, and error states
- Form validation
- API integration or clearly defined service layer
- Testable structure
- No dead buttons

## Frontend conventions

- **Strict TypeScript** — no `any` unless absolutely unavoidable.
- **Components** use shadcn/ui primitives with CVA (Class Variance Authority) for variants.
- **Styling** via Tailwind CSS utility classes only — no CSS-in-JS or raw CSS files.
- **State**: Zustand for domain state, React Query for server cache. Mutations sync both.
- **API calls**: Use the custom HTTP client in `src/api/client.ts` (cookie-based JWT, CSRF tokens, `credentials: 'include'`).
- **Hooks**: React Query hooks live in `src/hooks/api/`. Follow the existing pattern with scoped query keys, `useQuery`/`useMutation`, and Zustand sync on success.
- **Routing**: React Router v7 with lazy-loaded routes and `<RoleGuard>` for access control.
- **Icons**: lucide-react only.
- **All new components** must receive typed props.
- **Prefer reusable feature modules** over large monolithic files.
- **Import note**: `use-student.ts` and `use-teacher.ts` are NOT in the hooks barrel export (`src/hooks/api/index.ts`) due to name collisions. Import them directly from `@/hooks/api/use-student` or `@/hooks/api/use-teacher`.

## Backend conventions

- **Controller pattern**: `async handler(req, res, next) → try { service call } catch { next(error) }`.
- **Routes** use middleware chains: `authenticate`, `validateCsrf`, `validate({ body: schema })`, `rbac(roles)`.
- **Validation**: Zod schemas in `backend/src/api/schemas/` — validate body, params, and query.
- **Error handling**: Centralized via `error.middleware.ts` — always call `next(error)`, never send responses in catch blocks.
- **RBAC**: Use the `rbac.middleware.ts` for role-based access. Roles: PROVIDER, ADMIN, TEACHER, STUDENT, PARENT, FINANCE, MARKETING, SCHOOL.
- **Prisma**: 80+ models. The `TenantStatus` enum has only 4 values (ACTIVE, TRIAL, SUSPENDED, CHURNED) — map extended statuses via `PRISMA_STATUS_MAP`.
- **No fake success responses** or hardcoded business data (unless seed/demo data).
- Handle edge cases and failure cases.

## Testing conventions

- **Frontend tests**: Jest + Testing Library. Files: `*.test.ts` / `*.test.tsx`. Config: `jest.config.cjs`.
- **Backend tests**: Vitest. Files: `backend/src/__tests__/**/*.test.ts`. Config: `backend/vitest.config.ts`.
- Backend tests mock Prisma models. When testing controllers that call complex service functions, mock ALL Prisma models the service touches, not just the primary one.

## Feature completion policy

A task is not complete unless:
1. The UI is rendered
2. The action works end to end
3. Types are defined
4. Validation exists
5. Error handling exists
6. Tests or verification steps are included

## When asked to enhance existing code

First inspect the current architecture.
Then extend existing patterns instead of rebuilding randomly.
Preserve compatibility unless refactor is required.
Explain what files were changed and why.