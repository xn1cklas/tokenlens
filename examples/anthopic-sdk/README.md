# Anthopic SDK + Tokenlens Example

This sample app uses the official Anthropic SDK to call Claude and leverages `tokenlens` to understand token usage, costs, and context limits.

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   pnpm --filter anthopic-sdk install
   ```

2. Copy `env.example` to `.env` and add your Anthropic API key:

   ```bash
   cp env.example .env
   ```

   Required variables:

   - `ANTHROPIC_API_KEY`

## Run

```bash
pnpm --filter anthopic-sdk start
```

The script prints the Claude reply, raw Anthropic usage details, the cost estimate from `tokenlens`, and remaining context tokens relative to the model window.

