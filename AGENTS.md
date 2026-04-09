# AGENTS.md

## Purpose

This file defines the working rules, conventions, and delivery expectations for all coding agents contributing to **DevAgentsHub**.

All agents must follow these instructions strictly.

DevAgentsHub is a **production-oriented fullstack monorepo**.  
It is not a throwaway prototype.

The goal is to build a clean, scalable, maintainable platform that combines:

- developer tools
- educational content
- learning modules
- community features

---

# 1. General principles

## 1.1 Code quality first
Always prefer:

- clarity
- maintainability
- consistency
- explicitness
- scalability

Do not generate quick-and-dirty code just to make something “work”.

## 1.2 Think before coding
Before implementing:

- inspect existing structure
- respect current architecture
- avoid duplication
- extend existing patterns instead of inventing new inconsistent ones

## 1.3 Production-minded mindset
Every implementation must be:

- typed
- structured
- testable
- documented when necessary
- safe to evolve

---

# 2. Project context

## 2.1 Project name
**DevAgentsHub**

## 2.2 Product scope
The platform includes 4 pillars:

- Tools
- Content
- Learning
- Community

## 2.3 Current target
The current target is a **solid MVP**.

This means:

- minimal but real features
- clean architecture
- local environment fully working
- CI/CD foundation in place
- deployment-ready structure

---

# 3. Repository architecture

The project uses a **monorepo** with the following structure:

- `apps/web` → Next.js frontend
- `apps/api` → Express backend
- `packages/ui` → shared UI components
- `packages/types` → shared types
- `packages/utils` → shared helpers
- `packages/validation` → shared Zod schemas
- `packages/config` → shared config
- `infra/docker` → local docker environment
- `infra/render` → deployment configuration
- `docs` → project documentation

Agents must respect this structure.

Do not create random folders or duplicate architecture patterns without a strong reason.

---

# 4. Tech stack

## Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui

## Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Zod

## Tooling
- pnpm
- Turborepo
- ESLint
- Prettier
- GitHub Actions
- Docker Compose
- Render

Agents must stay within this stack unless explicitly asked to change it.

---

# 5. Local development is mandatory

## 5.1 Local environment
All code must be runnable locally.

The project must work with a local PostgreSQL instance provided through Docker Compose.

## 5.2 PostgreSQL local conventions
Use these local defaults unless explicitly changed:

- database: `dev_agents_hub`
- user: `devagentshub`
- password: `devagentshub_password`
- port: `5432`

## 5.3 Environment files
The project must include and maintain:

- `.env.example`
- `.env.local`

All required environment variables must be documented and validated.

## 5.4 Never assume manual setup
Agents must not rely on hidden manual setup steps.

If a feature requires configuration, scripts, seed data, migrations, or environment values, those must be created and documented.

---

# 6. Architecture and coding rules

## 6.1 Backend architecture
Use a clean layered architecture:

- routes
- controllers
- services
- repositories/data access when needed
- validation
- domain types

Do not place all logic directly in route files.

## 6.2 Frontend architecture
Frontend code must be organized with clear separation between:

- pages/routes
- UI components
- feature components
- hooks
- API client logic
- shared utilities

## 6.3 Validation
Use **Zod** for all input validation on the backend.

Never trust request payloads.

## 6.4 Types
Use strict TypeScript.

Avoid `any` unless truly unavoidable and justified.

## 6.5 Error handling
Implement explicit and readable error handling.

Avoid silent failures.

API responses must be predictable and structured.

## 6.6 Reusability
When logic is shared, extract it properly instead of duplicating it.

But avoid premature abstraction.

---

# 7. Database and Prisma rules

## 7.1 Prisma is the source of truth
All database schema changes must go through Prisma.

## 7.2 Migrations
When changing models:

- update schema
- create migration
- verify generated client
- update seed if needed

## 7.3 Seed data
Seed data must remain coherent with the MVP.

At minimum, seed should support local testing of:

- auth
- tools
- articles
- course/lessons
- discussions

## 7.4 Data modeling
Prefer explicit relations and readable model names.

Do not create unclear or overloaded tables.

---

# 8. MVP scope rules

Agents must prioritize the current MVP scope.

Current MVP includes:

## Auth
- register
- login
- logout
- current user

## Tools
- Prompt Generator
- Project Structure Generator
- Debug Helper

## Content
- article listing
- article detail

## Learning
- one course
- lessons
- lesson progress

## Community
- discussions
- replies
- authenticated posting

Do not add large unrelated systems unless explicitly requested.

Examples of things to avoid unless asked:

- notifications
- real-time chat
- billing
- advanced search
- complex RBAC
- heavy admin systems
- gamification

---

# 9. UI and UX expectations

## 9.1 UI principles
UI should be:

- clean
- modern
- readable
- consistent
- developer-oriented

## 9.2 Avoid clutter
Do not generate overloaded interfaces.

## 9.3 Accessibility
Prefer semantic HTML and accessible components when possible.

## 9.4 Empty/loading/error states
Pages and main components should handle:

- loading states
- empty states
- error states

---

# 10. Git workflow rules

The repository follows this branching strategy:

- `main` → production
- `develop` → integration
- `feature/*` → feature branches
- `fix/*` → bug fixes
- `hotfix/*` → emergency fixes

## Rules
- all new work starts from `develop`
- each feature must be isolated in its own branch
- PR target is usually `develop`
- `develop` is merged into `main` for releases

Agents must keep changes scoped and coherent with this workflow.

---

# 11. CI/CD expectations

## 11.1 CI
Any contribution must preserve or improve CI.

Expected CI checks include:

- install
- lint
- typecheck
- test
- build

## 11.2 CD
The project is intended for automated deployment through Render.

Agents must not introduce deployment assumptions that conflict with Render.

## 11.3 Keep automation healthy
If build scripts, migrations, environment variables, or startup commands are changed, update the related config and docs.

---

# 12. Documentation rules

## 12.1 Document important decisions
When adding significant architecture or setup changes, update docs when relevant.

## 12.2 Keep docs aligned
Do not let documentation drift too far from implementation.

## 12.3 Prefer concise useful docs
Documentation should be practical, not bloated.

---

# 13. Testing rules

## 13.1 Minimum expectation
Critical logic must be testable.

## 13.2 Backend
Prioritize tests for:

- auth logic
- validation
- tool services
- important endpoints

## 13.3 Frontend
Add focused tests for critical UI or flows when relevant.

Do not create large volumes of low-value tests.

---

# 14. Security baseline

Agents must respect the following baseline:

- hash passwords securely
- never hardcode secrets
- validate all user input
- protect private/admin routes
- configure CORS properly
- sanitize risky user-generated inputs when needed

---

# 15. What agents must avoid

Do NOT:

- generate giant files mixing unrelated responsibilities
- use `any` everywhere
- hardcode environment-specific values in source code
- create fake implementations without clearly stating limitations
- leave broken imports or unused dead code
- add libraries without a good reason
- bypass validation
- ignore lint/type errors
- silently change architecture direction

---

# 16. Delivery expectations

When implementing a feature, agents should aim to leave the codebase in a better state.

A valid delivery should be:

- runnable
- typed
- lint-clean
- reasonably tested
- architecturally consistent

If something cannot be fully completed, be explicit about:

- what is done
- what remains
- what assumptions were made

---

# 17. Preferred implementation style

Agents should prefer:

- small focused modules
- explicit naming
- predictable folder structure
- readable service methods
- composable UI components
- minimal but clean abstractions

---

# 18. Startup priority order

When building or extending the project, follow this order unless instructed otherwise:

1. repository structure
2. tooling
3. local environment
4. database + Prisma
5. auth
6. tools
7. content
8. learning
9. community
10. tests
11. CI/CD
12. deployment polish

Do not skip foundational steps.

---

# 19. Final instruction

If there is a conflict between speed and quality for DevAgentsHub, prefer **quality with reasonable pragmatism**.

Build like this project is intended to last.