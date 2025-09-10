@tokenlens/models

- Purpose: static export of the models.dev catalog split by provider for tree-shaking.
- Generation: `pnpm -w --filter @tokenlens/models run sync:models`.
- Import patterns:
- Full arrays: `import { modelsDev } from '@tokenlens/models'` (legacy arrays of Model entries).
- Build a catalog: `import { getModels } from '@tokenlens/models'` (models.dev-compatible object).
- Focused arrays: `import openai from '@tokenlens/models/providers/openai'` and build a tiny catalog via `catalogFromModelArrays([openai])`.

With helpers (DI)

```
import { sourceFromModels } from '@tokenlens/helpers';
import openai from '@tokenlens/models/providers/openai';

const source = sourceFromModels(openai);
```
