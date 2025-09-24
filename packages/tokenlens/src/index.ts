export { Tokenlens, getShared } from "./client.js";
import { Tokenlens as Client } from "./client.js";
import type { Providers, Model } from "@tokenlens/core/dto";
import type { Usage } from "@tokenlens/core/types";
import type { TokenizerResult } from "@tokenlens/tokenizer";
import type { TokenCosts } from "@tokenlens/helpers";
import type { SourceLoader, SourceId, FetchLike } from "./types.js";
import { DEFAULT_SOURCE, getDefaultLoader } from "./default-loaders.js";

export function createClient(
    options?: ConstructorParameters<typeof Client>[0],
) {
    const { sources, loaders, ...rest } = options ?? {};
    const resolvedSources = [...(sources?.length ? sources : [DEFAULT_SOURCE])];
    const resolvedLoaders: Partial<Record<SourceId, SourceLoader>> = {
        ...(loaders ?? {}),
    };

    for (const source of resolvedSources) {
        if (!resolvedLoaders[source]) {
            const fallback = getDefaultLoader(source);
            if (!fallback) {
                throw new Error(`No loader available for source "${source}"`);
            }
            resolvedLoaders[source] = fallback;
        }
    }

    return new Client({
        ...rest,
        sources: resolvedSources,
        loaders: resolvedLoaders,
    });
}

export async function getTokenCosts(args: {
    modelId: string;
    provider?: string;
    usage: Usage;
}) {
    return (await import("./client.js")).getShared().getTokenCosts(args);
}

export async function getProviders() {
    return (await import("./client.js")).getShared().getProviders();
}

export async function getModel(args: { modelId: string; provider?: string }) {
    return (await import("./client.js")).getShared().getModel(args);
}

export async function getLimit(args: { modelId: string; provider?: string }) {
    return (await import("./client.js")).getShared().getLimit(args);
}

export type ResultMetadata = {
    providerId: string;
    modelId: string;
    model?: Model;
    usage?: Usage;
    costs?: TokenCosts;
    limit?: Model["limit"];
    hints?: import("./client.js").ModelHints;
    tokenizer?: TokenizerResult;
};

export async function getResultMetadata(args: {
    modelId: string;
    provider?: string;
    usage?: Usage;
}): Promise<ResultMetadata> {
    const client = (await import("./client.js")).getShared();
    const details = await client.getModelDetails(args);

    return {
        providerId: details.providerId,
        modelId: details.modelId,
        model: details.model,
        usage: args.usage,
        costs: details.costs,
        limit: details.limit,
        hints: details.hints,
    };
}

export type { TokenCosts } from "@tokenlens/helpers";
export type { Providers, Model } from "@tokenlens/core/dto";
export { countTokens as experimental_tokenizer } from "./exports/tokenizer.js";
