# Local Development

## Required local services

PostgreSQL runs through Docker Compose in [`infra/docker/docker-compose.yml`](../../infra/docker/docker-compose.yml).

### Defaults

- database: `dev_agents_hub`
- user: `devagentshub`
- password: `devagentshub_password`
- port: `5432`

## Local startup flow

1. `corepack pnpm install`
2. Confirm `.env.local` contains the expected local values
3. `corepack pnpm db:up`
4. `corepack pnpm --filter @devagentshub/api prisma:generate`
5. `corepack pnpm db:migrate`
6. `corepack pnpm db:seed`
7. `corepack pnpm dev`

## Render

The Render blueprint is stored in [`infra/render/render.yaml`](../../infra/render/render.yaml). The API and web services install dependencies from the repository root so workspace packages remain available during builds.

## CI

GitHub Actions runs install, Prisma client generation, lint, typecheck, tests, and build on pushes or pull requests targeting `main` and `develop`.
