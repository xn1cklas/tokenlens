import { COMPACT_THRESHOLD, compactListeners, onCompactThreshold, type CompactEvent } from '@/lib/utils';
import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { remainingContext } from 'ai-meta';
// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { model, messages }: { messages: UIMessage[]; model: string } =
        await req.json();

    const result = streamText({
        model: model,
        messages: convertToModelMessages(messages),
    });

    const usage = await result.usage;

    // Get the remaining context and percent used.
    const { remainingCombined, percentUsed } = remainingContext({
        modelId: model,
        usage: { input_tokens: usage.inputTokens, output_tokens: usage.outputTokens, total_tokens: usage.totalTokens },
        reserveOutput: 256,
    });

    const shouldCompact = (percentUsed: number) => {
        return Number.isFinite(percentUsed) && percentUsed >= COMPACT_THRESHOLD;
    }

    if (shouldCompact(percentUsed)) {
        console.log('[ai-meta demo] Compact threshold reached', {
            modelId: model,
            percentUsed: Number(percentUsed.toFixed(3)),
            remainingTokens: remainingCombined,
            threshold: COMPACT_THRESHOLD,
        });
    }
    return result.toUIMessageStreamResponse();
}
