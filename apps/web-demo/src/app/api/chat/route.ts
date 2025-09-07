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


    // This is the event that triggers the compact listener.
    if (Number.isFinite(percentUsed) && percentUsed >= COMPACT_THRESHOLD) {
        const ev: CompactEvent = { modelId: model, percentUsed, remainingTokens: remainingCombined };
        for (const l of compactListeners) l(ev);
    }

    return result.toUIMessageStreamResponse();
}

// This is the listener that logs when compaction is advisable.
onCompactThreshold((e) => {
    console.log('[ai-meta demo] Compact threshold reached', {
        modelId: e.modelId,
        percentUsed: Number(e.percentUsed.toFixed(3)),
        remainingTokens: e.remainingTokens,
        threshold: COMPACT_THRESHOLD,
    });
});
