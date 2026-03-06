# Pull Request

## Description

<!-- Briefly describe what this PR does and why -->

## Related Issues

<!-- Link related issues: Closes #123, Fixes #456 -->

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Refactor (code change that neither fixes a bug nor adds a feature)
- [ ] Documentation (changes to docs only)
- [ ] CI/CD (changes to build/deployment pipeline)
- [ ] Dependencies (add, update, or remove dependencies)

## Agent Authorship

<!-- If this PR was created by an AI agent, check the appropriate box -->

- [ ] Frontend Agent
- [ ] Backend Agent
- [ ] ML Agent
- [ ] 3D Graphics Agent
- [ ] DevOps Agent
- [ ] Testing Agent
- [ ] Documentation Agent
- [ ] Security Agent
- [ ] Human authored

## Changes Made

<!-- List the key changes in bullet points -->

-
-
-

## Screenshots / Screen Recording

<!-- If applicable, add screenshots showing the UI changes -->

## Testing

### Automated Tests

- [ ] New unit tests added
- [ ] Existing tests updated
- [ ] All tests pass locally (`pnpm test`)

### Manual Testing

- [ ] Tested in Chrome
- [ ] Tested in Firefox
- [ ] Tested in Safari
- [ ] Tested on mobile viewport
- [ ] Tested with keyboard navigation

## Checklist

### Code Quality

- [ ] TypeScript — no `any` types, no `@ts-ignore`
- [ ] No ESLint warnings or errors
- [ ] Code follows project conventions
- [ ] Self-reviewed the diff before requesting review

### Frontend (if applicable)

- [ ] Components use shadcn/ui primitives
- [ ] Responsive on mobile / tablet / desktop
- [ ] Loading and error states handled
- [ ] No hardcoded strings (i18n-ready)

### Backend (if applicable)

- [ ] API routes have Zod validation schemas
- [ ] RBAC middleware applied to new routes
- [ ] Database migrations are reversible
- [ ] No N+1 queries

### Security

- [ ] No secrets or credentials in code
- [ ] Input validation on all user inputs
- [ ] Auth/authz checked for new endpoints
- [ ] No XSS vectors introduced

### Documentation

- [ ] TSDoc comments on new exports
- [ ] README updated (if setup steps changed)
- [ ] API docs updated (if endpoints changed)

## Deployment Notes

<!-- Any special deployment steps, migrations, env vars, or rollback considerations -->

## Post-Deployment Verification

- [ ] Smoke test critical paths after deploy
- [ ] Monitor error rates for 30 minutes
- [ ] Verify no performance regression
