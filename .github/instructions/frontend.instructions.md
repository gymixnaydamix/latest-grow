---
applyTo:
  - "src/**"
  - "*.tsx"
  - "*.ts"
  - "index.html"
  - "vite.config.ts"
  - "tsconfig.json"
  - "jest.config.cjs"
  - "jest.setup.ts"
---

# Frontend Instructions

## Component patterns

- Build components with shadcn/ui primitives (`src/components/ui/`).
- Use CVA (Class Variance Authority) for component variants.
- Style exclusively with Tailwind CSS utility classes.
- Use `cn()` from `src/lib/utils.ts` to merge class names.
- Icons come from `lucide-react` only.

## State management

- **Zustand** for domain/client state — stores live in `src/store/`.
- **TanStack React Query** for server state — hooks live in `src/hooks/api/`.
- Mutations should sync both Zustand stores and React Query caches on success.
- React Query is configured with 2-minute staleTime, 1 retry, and no refetch-on-focus.

## API integration

- Use the HTTP client in `src/api/client.ts` for all requests.
- Auth uses cookie-based JWT with HttpOnly cookies — always pass `credentials: 'include'`.
- Mutation requests (POST/PUT/PATCH/DELETE) require a CSRF token fetched from `/api/auth/csrf-token`.
- The `ApiError` class provides structured error handling with `status` and `body`.
- On 401 responses, the client triggers automatic logout.

## Routing

- Routes are defined in `src/App.tsx` using React Router v7.
- Use lazy loading (`React.lazy`) with `<Suspense>` for code splitting.
- Protect routes with `<RoleGuard roles={[...]} />`.
- Role-based views: admin, teacher, parent, student, provider, finance, marketing, school.

## Forms

- Use React Hook Form with Zod resolvers for validation.
- Define Zod schemas alongside the form component or in a shared schemas file.
- Handle loading, success, and error states for all form submissions.

## Testing

- Framework: Jest 30 + Testing Library.
- Test files: `*.test.ts` or `*.test.tsx` alongside source files or in `__tests__/`.
- Run tests: `pnpm frontend:test`.
- Mock API calls, not implementation details. Test user interactions and rendered output.

## Import conventions

- Use path aliases: `@/` maps to `src/`.
- Import hooks from `@/hooks/api/` — but import `use-student` and `use-teacher` directly (not from barrel export) due to name collisions.
