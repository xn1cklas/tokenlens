@tokenlens/fetch

- Purpose: tiny client for https://models.dev/api.json with typed errors.
- Exports: `fetchModels({ provider?, model?, fetch?, signal?, baseUrl? })`.

Usage

```
import { fetchModels } from '@tokenlens/fetch';

const catalog = await fetchModels();
const openai = await fetchModels({ provider: 'openai' });
const gpt4o = await fetchModels({ provider: 'openai', model: 'gpt-4o' });
```

