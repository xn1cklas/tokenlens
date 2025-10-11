export interface Model {
  id: string;
  name: string;
  provider: string;
  contextWindow: string;
  tier: "free" | "low" | "mid" | "high";
  features: string[];
  pricing?: {
    prompt: number;
    completion: number;
    currency: string;
  };
}

export type SourceModelLite = {
  id?: string;
  name?: string;
  cost?: { input?: number; output?: number };
  limit?: { context?: number };
};

export type SourceProvidersLite = Record<
  string,
  { models: Record<string, SourceModelLite> }
>;

export interface ModelMatrixProps {
  openrouter: SourceProvidersLite;
  modelsdev: SourceProvidersLite;
  lastUpdated: number;
}
