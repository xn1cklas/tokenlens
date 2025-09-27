# OpenAI SDK + Tokenlens Example

This example app calls the OpenAI Responses API and uses `tokenlens` to estimate token costs and inspect the model's context limits.

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   pnpm --filter openai-sdk install
   ```

2. Copy `env.example` to `.env` and provide your OpenAI API key:

   ```bash
   cp env.example .env
   ```

   Required variables:

   - `OPENAI_API_KEY`

## Run

```bash
pnpm --filter openai-sdk start
```

The script logs the model output, raw usage from OpenAI, the cost estimate computed by `tokenlens`, and remaining context tokens relative to the model limit.

