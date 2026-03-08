# Copilot Project Instructions

You are working on a production-grade application.

## Core rule
Do not create placeholder UI, fake KPI cards, mock data, TODO implementations, stub handlers, or non-functional screens unless explicitly requested.

## Implementation standard
Every feature must include:
- real TypeScript types/interfaces/zod schemas
- real business logic
- connected UI actions
- proper state handling
- loading, empty, success, and error states
- form validation
- API integration or clearly defined service layer
- testable structure
- no dead buttons

## Frontend rules
- Use strict TypeScript.
- No `any` unless absolutely unavoidable.
- Buttons must perform real actions.
- Cards must display live or managed state, not decorative placeholders.
- All new components must receive typed props.
- Prefer reusable feature modules over large monolithic files.

## Backend rules
- Implement actual endpoints, services, and validation.
- No fake success responses.
- No hardcoded business data unless marked as seed/demo data.
- Handle edge cases and failure cases.

## Feature completion policy
A task is not complete unless:
1. the UI is rendered,
2. the action works end to end,
3. types are defined,
4. validation exists,
5. error handling exists,
6. tests or verification steps are included.

## When asked to enhance existing code
First inspect the current architecture.
Then extend existing patterns instead of rebuilding randomly.
Preserve compatibility unless refactor is required.
Explain what files were changed and why.