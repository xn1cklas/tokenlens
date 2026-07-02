# @tokenlens/codemod

Migration codemods for Tokenlens.

## v1 to v2

Run in dry-run mode first:

```sh
npx @tokenlens/codemod v2 src
```

Apply safe edits:

```sh
npx @tokenlens/codemod v2 src --write
```

The v2 codemod uses TypeScript syntax trees for safe mechanical changes, such
as `fetchModels` to the live `models.dev` fetcher and `ModelId` type references
to `string`. APIs that changed from synchronous bundled static data to async
cached catalog lookups are annotated with `TODO(tokenlens-codemod)` comments
instead of hidden compatibility shims.
