export type CommonOptions = {
  provider?: string;
  model?: string;
  fetch?: typeof globalThis.fetch;
};

export type VercelOptions = CommonOptions & {
  includeEndpointDetails?: boolean;
  endpointConcurrency?: number;
};
