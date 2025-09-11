@tokenlens/core
================

[![npm version](https://img.shields.io/npm/v/%40tokenlens%2Fcore.svg)](https://www.npmjs.com/package/@tokenlens/core)
[![npm downloads](https://img.shields.io/npm/dm/%40tokenlens%2Fcore.svg)](https://www.npmjs.com/package/@tokenlens/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)


![TokenLens overview](https://raw.githubusercontent.com/xn1cklas/tokenlens/HEAD/assets/tokenlens.png)

Core types and fast registry utilities for TokenLens. Build canonical model registries with alias resolution and strong typing.


Install
- npm: `npm i @tokenlens/core`
- pnpm: `pnpm add @tokenlens/core`
- yarn: `yarn add @tokenlens/core`

Exports
- `createRegistry(models: Model[])` to build a fast provider+model lookup with alias resolution.
- Types: `Model`, `Provider`, `Status`, `Pricing`, `ContextCaps`, usage shapes.

Quick Start
```
import { createRegistry, type Model } from '@tokenlens/core';

const reg = createRegistry([
  {
    id: 'openai:gpt-4o',
    provider: 'openai',
    status: 'stable',
    context: { combinedMax: 128000 },
    source: 'docs',
  } satisfies Model,
]);

// Resolve shorthands/aliases to the canonical entry
const m = reg.resolveModel('gpt-4o');
console.log(m?.id); // 'openai:gpt-4o'
```

See also
- `@tokenlens/models` for a prebuilt models catalog.
- `@tokenlens/helpers` for context/cost utilities layered on top.

License
MIT
