# Git Workflow

DevAgentsHub now follows a release-oriented workflow:

- `main`: protected production branch
- `develop`: shared integration branch
- `feature/*`: new product or technical work branched from `develop`
- `fix/*`: non-urgent fixes branched from `develop`
- `hotfix/*`: urgent production fixes branched from `main`

## Daily flow

1. Update `develop`
2. Create a scoped branch from `develop`
3. Open a pull request back into `develop`
4. Merge only after `verify` passes

Example:

```bash
git switch develop
git pull origin develop
git switch -c feature/auth-refresh
git push -u origin feature/auth-refresh
```

## Release flow

1. Keep `develop` green
2. Open a pull request from `develop` to `main`
3. Merge only after approval and `verify`
4. Let Render deploy from `main` through `checksPass`

This keeps production releases explicit and auditable.

## Hotfix flow

1. Branch from `main`
2. Fix only the urgent production issue
3. Open a pull request to `main`
4. After merge, backport the fix to `develop`

Example:

```bash
git switch main
git pull origin main
git switch -c hotfix/login-cookie
git push -u origin hotfix/login-cookie
```

## Merge strategy

- Prefer `Squash` for feature and fix branches
- Allow `Rebase` when preserving a small clean commit set is useful
- Avoid regular merge commits on protected branches unless there is a strong reason

## GitHub settings

`main` should stay protected with:

- pull request required
- 1 approval required
- conversation resolution required
- required status check `verify`
- branch must be up to date before merge
- force pushes blocked
- deletions blocked

Recommended follow-up:

- set `develop` as the default branch for day-to-day work
- optionally add a lighter ruleset on `develop` requiring pull requests and `verify`
