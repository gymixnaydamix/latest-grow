# 📘 Project Best Practices

## 1. Project Purpose
An all-in-one SaaS "Super App" for schools and individuals. It unifies education, media, studio tools, gamification, marketplace, lifestyle, food & dining, services, events, and more into a single ecosystem. The monorepo hosts a React + TypeScript SPA frontend and a Node/Express + TypeScript backend with Prisma and Redis integrations.

## 2. Project Structure
- Monorepo root
  - Frontend (Next js + shadcn ++ React + TS): `src/` with modular folders
    - `src/api/` API client wrappers and endpoint modules
    - `src/api/schemas/` Zod schemas for API data contracts
    - `src/components/` Reusable UI, layout, and overlay window system
    - `src/constants/` Navigation, query keys, and global constants
    - `src/context/` React contexts
    - `src/hooks/` Custom hooks
    - `src/services/` Client-side services (feature flags, realtime, csrf)
    - `src/store/` Zustand store (user session, UI state)
    - `src/types/` Shared frontend types (re-exporting from root/types when needed)
    - `src/utils/` Utilities
    - `src/views/` Route-level pages
  - Backend (Express + TS): `backend/src/`
    - `api/controllers/` Route handlers (e.g., auth)
    - `api/middlewares/` Error handling, validation, CSRF, auth
    - `api/routes/` Route definitions and composition
    - `api/schemas/` Zod validation schemas for requests
    - `services/` Domain services (auth, cache)
    - `db/` Prisma client/service and helpers
    - `utils/` Logger and error helpers
    - `app.ts` App wiring: security, compression, CORS, CSRF, routers
    - `server.ts` Server bootstrap and lifecycle (Redis connect/shutdown)
  - Shared
    - `types.ts` Shared cross-app type definitions (aliased as `@root/types`)
    - `docs/` Architecture, testing, state management, etc.
    - Tooling/config: `package.json`, `tsconfig.json`, `jest.config.cjs`, `vite.config.ts`, `netlify.toml`

Notes
- Entry points
  - Frontend: `index.tsx` (Vite), `App.tsx` as app root.
  - Backend: `backend/src/server.ts` starts Express app from `backend/src/app.ts`.
- Build & dev scripts (root): `pnpm dev` runs frontend dev server and backend dev concurrently.
- Path aliases (tsconfig.json)
  - `@/*` → `src/*`
  - `@root/types` → `./types.ts`
  - `@root/api/schemas/*` → `./src/api/schemas/*`

## 3. Test Strategy
- Frameworks
  - Frontend unit tests: Jest (+ jsdom) with `jest.config.cjs`, `jest.setup.ts`.
  - E2E: Playwright (`src/e2e/`), including UI flows like login/navigation.
  - Component development/testing: Storybook; story files `*.stories.tsx` co-located with components.
  - Backend: Vitest (see `backend/package.json`), jsdom used where needed.
- Organization & naming
  - Unit test files: `*.test.ts(x)` colocated with source (e.g., `src/api/dashboardApi.test.ts`).
  - E2E specs: `src/e2e/*.spec.ts` (see docs/TESTING.md).
- Mocking & isolation
  - Prefer mocking browser APIs via `jest.setup.ts` (frontend) and `jsdom` test envs.
  - For HTTP: mock `fetch` (see `backend/src/api/apiClient.test.ts` pattern) or use MSW if introducing integration tests.
  - Mock CSRF token retrieval when testing mutating requests (`src/services/csrfService.ts`).
- Coverage & philosophy
  - Unit: deterministic, fast, focus on pure logic (hooks, utils, services, api helpers).
  - Integration: critical flows (auth, navigation), validate contract adherence with Zod schemas.
  - E2E: major user journeys only; keep stable, avoid brittle selectors.

## 4. Code Style
- TypeScript
  - Strict mode enabled: `strict`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitAny`.
  - Use explicit return types for public functions; rely on inference locally where clear.
  - Prefer `type` and `interface` definitions in shared `types.ts` or `src/types` as appropriate.
- Imports & aliases
  - Use `@/*` for frontend imports; use `@root/types` to consume shared types.
  - Keep relative paths shallow; prefer aliases for cross-cutting modules.
- Async & HTTP
  - Use the centralized API wrappers: `apiClient` and `apiStream`.
  - Mutating requests must include CSRF header via `getCsrfToken()`; the wrapper already does this for non-GET/HEAD.
  - Always set `credentials: 'include'` for server requests (already default in wrappers) to send HttpOnly cookies.
- Error handling
  - Frontend: throw/handle `ApiError` with `status` and `body`; use React error boundaries for UI fallbacks.
  - Backend: validate inputs via Zod; throw typed errors or forward to `errorHandler` middleware; never leak stack traces in prod.
- Naming & structure
  - Components: PascalCase; hooks: `useSomething`; files: camelCase or PascalCase by domain; constants in `constants/`.
  - Services/utilities: colocate in `services/` and `utils/`; keep pure and testable.
- Comments & docs
  - Use JSDoc for public functions and complex modules (e.g., `apiClient.ts`).
  - Keep comments up-to-date with behavior; prefer readable code over excessive comments.

## 5. Common Patterns
- Validation
  - Frontend: Zod schemas under `src/api/schemas` for runtime validation of server responses.
  - Backend: Zod request schemas in `backend/src/api/schemas/validation.schemas.ts` with `validate` middleware (validates body, query, params). On failure, a 400 is returned with structured `details` and a JSON log entry.
- Security & auth
  - CSRF: double-submit cookie pattern
    - Backend issues `csrfToken` cookie and expects matching `X-CSRF-Token` on mutating requests.
    - Frontend `apiClient` injects `X-CSRF-Token` for non-GET/HEAD.
  - Auth: JWT created server-side, stored in HttpOnly cookie; rate-limited auth routes; Helmet + compression enabled.
- Data & state
  - Prisma client is singleton (`prisma.service.ts`).
  - Redis-based `cacheService` with connect/disconnect lifecycle in `server.ts`.
  - Client state via Zustand (UI/session) and TanStack Query (server state, caching, retries).
- Routing & composition
  - Express routes organized by feature: `auth`, `concierge`, `security`, and data mocks; composed under `/api`.
  - Frontend modules organized by domain (admin, provider, school, etc.).
- UI architecture
  - Overlay window system for multi-app desktop-like UX; lazy-load overlay apps to reduce initial bundle.
- Logging
  - Structured JSON logger (`backend/src/utils/logger.ts`) for `info`/`error` with ISO timestamps.

## 6. Do's and Don'ts
- Do
  - Use `apiClient`/`apiStream` for network calls; do not use `fetch` directly.
  - Define/extend Zod schemas when creating new API endpoints or consuming new data.
  - Keep business logic in `services/` and keep controllers thin.
  - Respect CSRF requirements for all mutating requests; ensure cookies are included.
  - Hash passwords using `bcrypt` on the server; never store plaintext.
  - Use path aliases (`@/*`, `@root/*`) to avoid deep relative paths.
  - Add unit tests for utilities, hooks, and services; E2E for critical flows only.
  - Guard routes and UI by role; follow RBAC patterns established in navigation and views.
- Don't
  - Don’t bypass validation middleware or return unvalidated data to the UI.
  - Don’t put server state into the Zustand store; use TanStack Query.
  - Don’t expose JWT in client-accessible storage; keep it in HttpOnly cookies.
  - Don’t disable Helmet, CORS, or rate limiting in production.
  - Don’t implement OTP flows without explicit enablement (OTP is currently disabled by design).

## 7. Tools & Dependencies
- Frontend
  - React 19, Vite, TypeScript, Tailwind CSS, TanStack Query, React Router, Zustand, Zod, i18next, Framer Motion, Storybook.
  - Testing: Jest (+ jsdom) for unit; Playwright for E2E; Storybook for component states and interaction tests.
- Backend
  - Express, Helmet, compression, express-rate-limit, Prisma (`@prisma/client`), Redis, jsonwebtoken, bcryptjs, Zod.
  - Testing: Vitest.
- Setup & scripts
  - Root: `pnpm dev` (frontend + backend concurrently), `pnpm build`, `pnpm test`.
  - Frontend: `frontend:*` scripts for lint/format/test/storybook.
  - Backend: `pnpm --filter ./backend <script>` (e.g., `dev`, `build`, `test`, `migrate`).
  - Env: `.env.example`, `.env.local`, and backend `.env` (validate with `validate:env`).
  - Backend config (backend/src/config): `NODE_ENV`, `PORT`, `API_KEY`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `REDIS_URL`, `DATABASE_URL`, `CORS_ORIGINS`. In production, `JWT_SECRET` is required; missing optional envs log warnings.

## 8. Other Notes
- LLM/codegen guidance
  - Prefer existing utilities/services and follow folder conventions; do not invent new global patterns.
  - Adhere to path aliases and TypeScript strictness; include types and return types where public.
  - When adding endpoints: define backend Zod request schemas, implement controller -> service, and update frontend `src/api/*` with Zod response parsing.
  - Keep CSRF flow intact: client obtains token from `/api/security/csrf-token`, backend validates `x-csrf-token` on mutating routes.
- Domain specifics
  - RBAC-driven navigation and content; modules are role-scoped.
  - Default dev auth: the server may upsert a default "Provider" user on first login if none exists (non-production only). Server uses bcrypt for hashing and issues JWT; token is set as HttpOnly cookie. OTP routes are present but disabled (request returns false; verify throws).
- Security & compliance
  - Sanitize any user-generated content before rendering (dompurify available in deps).
  - Never log secrets or PII; logs are structured; use levels appropriately.
  - CORS: backend restricts origins if `CORS_ORIGINS` is set; allow non-browser clients and dev tools when not configured.
