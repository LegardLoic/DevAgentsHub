# Contributing

DevAgentsHub is maintained as a production-oriented monorepo. Contributions should stay aligned with the current MVP scope and the repo workflow.

## Branch strategy

- `main`: production releases only
- `develop`: integration branch
- `feature/*`: new feature work from `develop`
- `fix/*`: non-urgent fixes from `develop`
- `hotfix/*`: urgent production fixes from `main`

Detailed guidance lives in [`docs/400-devops/git-workflow.md`](./docs/400-devops/git-workflow.md).

## Local expectations

1. Install dependencies with `corepack pnpm install`
2. Start PostgreSQL locally
3. Apply migrations and seed data when needed
4. Run the full verification set before opening a PR

## Required verification

Run these commands before asking for review:

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
```

If your change touches Prisma, also validate:

```bash
corepack pnpm db:migrate
corepack pnpm db:seed
```

## Pull requests

- Keep PRs scoped to one coherent change
- Update docs when setup, architecture, or delivery flow changes
- Call out schema changes, new environment variables, and Render impact
- Use the PR template and fill the validation checklist honestly

## Architecture bar

- prefer typed, explicit code
- keep logic out of route files
- validate inputs with Zod
- avoid widening MVP scope without explicit approval
- do not bypass CI, lint, or type checks
