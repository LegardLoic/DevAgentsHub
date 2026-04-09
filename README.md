# DevAgentsHub

DevAgentsHub is a production-minded fullstack monorepo that combines developer tools, educational guides, learning modules, and community discussions.

## Stack

- `apps/web`: Next.js App Router, TypeScript, Tailwind CSS, React Query
- `apps/api`: Express, TypeScript, Prisma, PostgreSQL, Zod
- `packages/*`: shared UI, types, validation, config, and utilities
- `infra/docker`: local PostgreSQL via Docker Compose
- `infra/render`: Render blueprint

## Quick Start

1. Install dependencies:

```bash
corepack pnpm install
```

2. Review local environment defaults in `.env.local`.

3. Start PostgreSQL:

```bash
corepack pnpm db:up
```

4. Generate the Prisma client and apply the initial migration:

```bash
corepack pnpm --filter @devagentshub/api prisma:generate
corepack pnpm db:migrate
```

5. Seed the database:

```bash
corepack pnpm db:seed
```

6. Run the web app and API together:

```bash
corepack pnpm dev
```

## Root Scripts

- `corepack pnpm dev`
- `corepack pnpm build`
- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm db:up`
- `corepack pnpm db:down`
- `corepack pnpm db:migrate`
- `corepack pnpm db:reset`
- `corepack pnpm db:seed`

## Seeded Local Data

- Admin email: `admin@devagentshub.local`
- Admin password: `Admin12345`
- 3 published tools
- 3 published articles
- 1 course with 3 lessons
- 2 seeded discussions

## Git Workflow

- `main` for production
- `develop` for integration
- `feature/*`, `fix/*`, and `hotfix/*` for scoped work

## Deployment

The Render blueprint lives in [`infra/render/render.yaml`](./infra/render/render.yaml). Configure Render to use that file path when creating the blueprint environment.
