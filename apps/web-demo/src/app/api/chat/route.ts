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

    const { remainingCombined, percentUsed } = remainingContext({
        modelId: model,
        usage: { input_tokens: usage.inputTokens, output_tokens: usage.outputTokens, total_tokens: usage.totalTokens },
        reserveOutput: 256,
    });

    return result.toUIMessageStreamResponse();
}