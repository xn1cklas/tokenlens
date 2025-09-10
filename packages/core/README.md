@tokenlens/core

- Purpose: shared types and core registry utilities used across packages.
- Exports:
  - `createRegistry(models: Model[])` to build a fast lookup with aliases.
  - Types: `Model`, `Provider`, `Status`, `Pricing`, `ContextCaps`, usage shapes.

Usage

```
import { createRegistry, type Model } from '@tokenlens/core';

const reg = createRegistry([{ id: 'openai:gpt-4o', provider: 'openai', status: 'stable', context: { combinedMax: 128000 }, source: 'docs' } satisfies Model]);
reg.resolveModel('gpt-4o'); // -> canonical entry
```

