# Release Process

This repository deploys production from `main` through Render once the `verify` workflow succeeds.

## Preconditions

- `develop` is green
- the release scope is reviewed
- migrations and environment changes are documented

## Release flow

1. Open a pull request from `develop` to `main`
2. Confirm the release summary and deployment impact
3. Wait for `verify` to pass on the release PR
4. Merge into `main`
5. Confirm Render picks up the new `main` commit
6. Verify:
   - web is healthy
   - API `/health` returns `{"data":{"status":"ok"}}`
   - critical auth and content flows still work

## Release checklist

- [ ] release PR opened from `develop` to `main`
- [ ] `verify` passed
- [ ] required approvals collected
- [ ] schema changes reviewed
- [ ] seed changes reviewed
- [ ] Render environment variables reviewed
- [ ] web URL checked
- [ ] API health endpoint checked

## Hotfixes

For a production incident:

1. branch from `main`
2. open a `hotfix/*` pull request to `main`
3. merge after approval and `verify`
4. backport the same fix to `develop`
