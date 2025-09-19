### Package setup comparison and hardening plan

This document compares our current monorepo/package setup to patterns used by mature libraries (e.g., Zod) and outlines a prioritized plan to improve resilience, DX, and publish hygiene.

Reference: Zod repository (`https://github.com/colinhacks/zod`).

## Snapshot of our current setup

- **Monorepo**: pnpm workspaces, Turborepo, packages under `packages/*`, apps under `apps/*`.
- **CI**: Lint (Biome), Build (turbo), Test (vitest) on Node 20; weekly models.dev sync workflow.
- **Formatting/Lint**: Biome configured; lefthook pre-commit runs formatting.
- **Publishing**: `tokenlens` published; scoped packages `@tokenlens/core` and `@tokenlens/models` exist but lack full publish metadata.
- **Module format**: ESM with minimal `exports` fields.
- **Testing**: Vitest in `tokenlens`; no coverage thresholds; no type-level API tests.

## Where we differ from a mature library setup

- **Node versions and constraints**
  - Ours: No `engines` fields or `.nvmrc`; CI runs on Node 20 only.
  - Mature: Pin LTS in `.nvmrc`, set `engines` in each package, test matrix across multiple Node LTS versions.

- **Versioning and releases**
  - Ours: Changesets dependency present in root, but no config or automated release workflow.
  - Mature: Changesets-managed versions, changelog generation, provenance-enabled npm publish via GitHub Actions.

- **CI quality gates**
  - Ours: Lint/build/test; no typecheck step, no coverage thresholds, no bundle/size checks, no consumer smoke tests.
  - Mature: Typecheck, coverage gates, size-limit, consumer import tests (ESM and CJS if supported) across Node matrix.

- **Package metadata & publish hygiene**
  - Ours: `tokenlens` has complete metadata; `@tokenlens/*` miss `repository`, `bugs`, `homepage`, `publishConfig.access`.
  - Mature: Complete metadata for every package; explicit `publishConfig`; `prepack` safeguards and consistent `files` content.

- **Exports and entrypoints**
  - Ours: Minimal exports; some internal `dist/exports/*` not surfaced as subpath exports; no `./package.json` export.
  - Mature: Clear ESM-only vs dual policy; subpaths exposed; `./package.json` exported for tooling.

- **Tests and types**
  - Ours: No type-level tests ensuring public surface stability.
  - Mature: `tsd`/`expect-type` coverage for the public API.

- **Dependency hygiene & OSS docs**
  - Ours: No Dependabot/Renovate; missing `SECURITY.md`, `CONTRIBUTING.md`, templates, `CODEOWNERS`.
  - Mature: Automated updates and OSS hygiene files standard.

- **Docs in published tarballs**
  - Ours: `files` arrays omit `README`/`LICENSE`.
  - Mature: Ensure essential docs ship in the package.

## Prioritized TODOs

- **Release and versioning**
  - Set up Changesets and npm release workflow with provenance and changelog
  - Add `prepack`/`prepublishOnly` to clean and build before publish

- **Runtime and tooling constraints**
  - Add Node engine constraints and `.nvmrc` (LTS), enforce via CI
  - Document and pin `packageManager` at root and enforce via CI

- **Package publishing hygiene**
  - Add `publishConfig.access: public` for scoped packages (`@tokenlens/core`, `@tokenlens/models`)
  - Fill package metadata (`repository`, `homepage`, `bugs`, `license`, `funding`) for all packages
  - Include `LICENSE` and `README` in published `files` array for all packages

- **Module format and exports**
  - Decide ESM-only vs dual CJS+ESM; implement `exports` conditions accordingly
  - Expose secondary entrypoints via `exports` (e.g., `./core`, `./helpers`, `./models`, `./simple`)
  - Export `./package.json` in `exports` for tooling introspection

- **CI quality gates**
  - Expand CI matrix to Node 18/20/22; add turbo typecheck/lint/test steps
  - Enable coverage in Vitest with minimum thresholds and CI reporting
  - Add size-limit (or similar) check for `tokenlens`, gate in CI
  - Add smoke tests: consumer ESM (and CJS if supported) import across Node versions

- **Testing depth**
  - Type-level API tests with `tsd` (or `expect-type`) covering public surface

- **Dependency and security hygiene**
  - Add Dependabot or Renovate for dependencies and GitHub Actions updates
  - Add OSS hygiene: `SECURITY.md`, `CONTRIBUTING.md`, issue/PR templates, `CODEOWNERS`

- **Documentation**
  - Add per-package READMEs with usage, API, and badges

## Notes and rationale

- Aligning on Node engines, exports, and CI gates reduces regressions for consumers and clarifies support policy.
- Changesets-based release flow improves version discipline, changelog quality, and publish safety.
- Type-level tests catch breaking type changes early, which is critical for TypeScript-first libraries.

## References

- Zod repository: [`https://github.com/colinhacks/zod`](https://github.com/colinhacks/zod)





