@tokenlens/models
=================

[![npm version](https://img.shields.io/npm/v/%40tokenlens%2Fmodels.svg)](https://www.npmjs.com/package/@tokenlens/models)
[![npm downloads](https://img.shields.io/npm/dm/%40tokenlens%2Fmodels.svg)](https://www.npmjs.com/package/@tokenlens/models)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)


![TokenLens overview](https://raw.githubusercontent.com/xn1cklas/tokenlens/HEAD/assets/tokenlens.png)

Tree‑shakeable static exports of the models.dev catalog, split by provider.


Install
- npm: `npm i @tokenlens/models`
- pnpm: `pnpm add @tokenlens/models`
- yarn: `yarn add @tokenlens/models`

Generation
- `pnpm -w --filter @tokenlens/models run sync:models`

Import patterns
- Full arrays: `import { modelsDev } from '@tokenlens/models'` (legacy array of `Model`).
- Build a catalog: `import { getModels } from '@tokenlens/models'` (models.dev‑compatible object).
- Focused arrays: `import openai from '@tokenlens/models/providers/openai'` and create a tiny catalog via a helper.
- Pick raw model entries: `import { getModelMeta } from '@tokenlens/models/api'`.
  - First build providers: `const providers = getModels()`
  - Single model: `getModelMeta(providers, 'openai', 'gpt-4o')`
  - Multiple: `getModelMeta(providers, 'openai', ['gpt-4o', 'o3-mini'])`
  - Whole provider: `getModelMeta(providers, 'openai')`

With helpers (DI)
```
import { sourceFromModels } from '@tokenlens/helpers';
import openai from '@tokenlens/models/providers/openai';

const source = sourceFromModels(openai);
```

Build a small catalog
```
import openai from '@tokenlens/models/providers/openai';
import anthropic from '@tokenlens/models/providers/anthropic';

const small = { providers: { openai, anthropic } };
```

License
MIT
