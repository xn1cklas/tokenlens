export type FetchLike = typeof globalThis.fetch;

export type CommonOptions = {
  provider?: string;
  model?: string;
  fetch?: FetchLike;
  signal?: AbortSignal;
  timeoutMs?: number;
};

export type VercelOptions = CommonOptions & {
  includeEndpointDetails?: boolean;
  endpointConcurrency?: number;
};
