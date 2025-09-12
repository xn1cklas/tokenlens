@tokenlens/fetch
================

[![npm version](https://img.shields.io/npm/v/%40tokenlens%2Ffetch.svg)](https://www.npmjs.com/package/@tokenlens/fetch)
[![npm downloads](https://img.shields.io/npm/dm/%40tokenlens%2Ffetch.svg)](https://www.npmjs.com/package/@tokenlens/fetch)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)


![TokenLens overview](https://raw.githubusercontent.com/xn1cklas/tokenlens/HEAD/assets/tokenlens.png)

Tiny typed client for https://models.dev/api.json with friendly error codes.


Install
- npm: `npm i @tokenlens/fetch`
- pnpm: `pnpm add @tokenlens/fetch`
- yarn: `yarn add @tokenlens/fetch`

API
- `fetchModels({ provider?, model?, fetch?, signal?, baseUrl? })`
- `getModelMeta(providers, ...)` 

Usage
```
import { fetchModels, getModelMeta, FetchModelsError } from '@tokenlens/fetch';

const catalog = await fetchModels();
const openai = await fetchModels({ provider: 'openai' });
const gpt4o = await fetchModels({ provider: 'openai', model: 'gpt-4o' });

// Pick raw metadata directly from the fetched catalog
const prov = getModelMeta({ providers: catalog, provider: 'openai' });
const model = getModelMeta({ providers: catalog, id: 'openai:gpt-4o' });

try {
  await fetchModels();
} catch (err) {
  if (err instanceof FetchModelsError) {
    // 'UNAVAILABLE' | 'NETWORK' | 'HTTP' | 'PARSE'
    console.error(err.code, err.status, err.message);
  }
}
```

License
MIT
