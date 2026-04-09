# Architecture Overview

## Monorepo

- `apps/web`: frontend routes, feature components, hooks, and API client integration
- `apps/api`: layered Express API with routes, controllers, services, repositories, validation, and Prisma
- `packages/ui`: shared UI primitives aligned with the Tailwind design system
- `packages/types`: shared DTOs and domain types
- `packages/utils`: pure helper logic and tool generators
- `packages/validation`: shared Zod schemas
- `packages/config`: shared product metadata and tool catalog

## Backend layering

- Routes: HTTP wiring and middleware composition
- Controllers: request and response handling
- Services: business behavior and orchestration
- Repositories: Prisma-based data access
- Validation: Zod schemas for payloads and params

## Frontend layering

- `app/`: route entry points
- `src/components/layout`: shell and generic display helpers
- `src/components/features`: domain-level UI by product slice
- `src/hooks`: auth-related hooks
- `src/lib`: environment handling, API client, and query keys

## Authentication

- Password hashing with `bcryptjs`
- JWT session stored in an HTTP-only cookie
- Auth middleware resolves the current user from the cookie or bearer token

## Data model

The initial Prisma schema supports:

- users and profiles
- tools and tool runs
- articles
- courses, lessons, and lesson progress
- discussions and replies
