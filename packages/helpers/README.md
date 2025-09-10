@tokenlens/helpers

- Purpose: utility helpers for context windows, usage normalization, and cost estimation.
- DI-first: pass either a `source` built from `@tokenlens/models` or a `catalog` from `@tokenlens/fetch`.
- Also exports `sourceFromModels`, `sourceFromCatalog`, `selectStaticModels`.

Usage (DI)

```
import { getContextWindow, estimateCost, sourceFromModels } from '@tokenlens/helpers';
import openai from '@tokenlens/models/providers/openai';

const source = sourceFromModels(openai);
const cw = getContextWindow('gpt-4o', { source });
const cost = estimateCost({ modelId: 'openai:gpt-4o', usage: { input_tokens: 1000, output_tokens: 500 }, source });
```

Back-compat via `tokenlens`

```
import { getContextWindow, estimateCost } from 'tokenlens';
// Uses a default static source under the hood (deprecated path).
```

