# Vercel AI SDK + Tokenlens Example

This example shows how to combine the [Vercel AI SDK](https://sdk.vercel.ai/docs) with `tokenlens` to estimate token costs from SDK usage metadata and inspect model context limits.

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   pnpm --filter vercel-ai-sdk install
   ```

2. Copy the `.env.example` file to `.env` and set your OpenAI-compatible API key:

   ```bash
   cp env.example .env
   ```

   Required variables:

   - `AI_SDK_OPENAI_API_KEY`

## Run

```bash
pnpm --filter vercel-ai-sdk start
```

On success the script prints the model response, raw usage from the AI SDK, the USD cost estimate from `tokenlens`, and remaining context tokens relative to the model limit.

