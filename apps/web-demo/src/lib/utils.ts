import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Simple compact-threshold event system (demo-only, unopinionated):
// - Consumers register a listener; we fire when percentUsed >= threshold.
// - Threshold is configurable via COMPACT_THRESHOLD env (0..1), default 0.85 in this demo.
export type CompactEvent = { modelId: string; percentUsed: number; remainingTokens?: number };
export const compactListeners: Array<(e: CompactEvent) => void> = [];
export function onCompactThreshold(listener: (e: CompactEvent) => void) {
  compactListeners.push(listener);
}
export const COMPACT_THRESHOLD = Number(process.env.COMPACT_THRESHOLD ?? '0.85');
