# Contributing

## Setup

TokenLens uses pnpm workspaces and requires Node.js 20 or newer.

```bash
pnpm install
```

## Development Checks

Run the focused check for the package you changed while iterating. Before opening a PR, run:

```bash
pnpm run format
pnpm run typecheck
pnpm run test:coverage
pnpm run build
pnpm run test:exports
```

## Changesets

Add a changeset for user-facing package changes:

```bash
pnpm changeset
```

Skip a changeset only for repository-only changes such as docs, CI, examples, or tests that do not affect published packages.
