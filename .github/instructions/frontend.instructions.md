---
applyTo: "src/**/*.{ts,tsx,js,jsx}"
---

# Frontend Implementation Rules

- Do not create presentational-only feature screens when the request implies real functionality.
- Every button, dropdown, tab action, and modal action must have real behavior.
- Use typed props and typed local state.
- Use existing hooks/services/query patterns from the codebase.
- Handle loading, empty, and error states.
- Avoid hardcoded dashboard metrics unless clearly marked demo data.
- Forms must validate input and surface errors to users.
- Prefer small feature modules over oversized component files.
