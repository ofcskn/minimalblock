# Changesets

This directory contains changeset files used for release management.

## What is a changeset?

A changeset is a short markdown file that describes a change you are making to the codebase, along with the semver bump type it requires (`major`, `minor`, or `patch`).

## Adding a changeset

After making your changes, run:

```sh
pnpm changeset
```

This will prompt you to:
1. Select which packages were changed
2. Choose the semver bump type for each
3. Write a summary of the change

The generated file should be committed with your changes and included in your pull request.

## Release flow

1. Contributors add changeset files alongside their code changes
2. When PRs are merged to `main`, the CI release workflow detects changesets
3. A "Version Packages" PR is automatically opened that bumps versions and updates `CHANGELOG.md`
4. When the version PR is merged, GitHub Releases are automatically created

## Canary / prerelease

```sh
# Canary (per-commit snapshot)
pnpm release:canary

# Next prerelease channel
pnpm release:prerelease
```

See [CONTRIBUTING.md](../CONTRIBUTING.md) for the full release guide.
