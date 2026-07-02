# Anthropic SDK + Tokenlens Example

This sample app uses the official Anthropic SDK to call Claude and leverages `tokenlens` to understand token usage, costs, and context limits.

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   pnpm --filter anthropic-sdk install
   ```

   This example includes `@tokenlens/tokenizer` because it calls
   tokenizer-backed helpers such as `countTokens` and `estimateCostUSD`.

2. Copy `env.example` to `.env` and add your Anthropic API key:

   ```bash
   cp env.example .env
   ```

   Required variables:

   - `ANTHROPIC_API_KEY`

## Run

```bash
pnpm --filter anthropic-sdk start
```

The script prints the Claude reply, raw Anthropic usage details, the cost estimate from `tokenlens`, and remaining context tokens relative to the model window.
