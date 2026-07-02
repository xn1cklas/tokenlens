@tokenlens/core
================

[![npm version](https://img.shields.io/npm/v/%40tokenlens%2Fcore.svg)](https://www.npmjs.com/package/@tokenlens/core)
[![npm downloads](https://img.shields.io/npm/dm/%40tokenlens%2Fcore.svg)](https://www.npmjs.com/package/@tokenlens/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)


![TokenLens overview](https://raw.githubusercontent.com/xn1cklas/tokenlens/HEAD/assets/tokenlens.png)

Core DTOs, model id helpers, errors, and usage types shared by Tokenlens packages.


Install
- npm: `npm i @tokenlens/core`
- pnpm: `pnpm add @tokenlens/core`
- yarn: `yarn add @tokenlens/core`

Exports
- DTOs: `SourceProviders`, `SourceProvider`, `SourceModel`, and `SourceId`.
- Usage types: `Usage`, `NormalizedUsage`, and `TokenBreakdown`.
- Helpers: `toModelId` plus the shared `TokenlensError` classes.

Quick Start
```
import type { SourceProviders, Usage } from '@tokenlens/core';
import { toModelId } from '@tokenlens/core';

const catalog: SourceProviders = {
  openai: {
    id: 'openai',
    models: {
      'openai/gpt-4o': {
        id: 'openai/gpt-4o',
        canonical_id: 'openai/gpt-4o',
        name: 'GPT-4o',
      },
    },
  },
};

const usage = {
  inputTokens: 1000,
  outputTokens: 200,
} satisfies Usage;

console.log(toModelId('openai/gpt-4o')); // 'openai/gpt-4o'
```

See also
- `@tokenlens/fetch` for hosted catalog fetchers.
- `@tokenlens/helpers` for context/cost utilities layered on top.

License
MIT
