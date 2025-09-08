import { streamText, convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse } from 'ai';
import type { UIMessage, LanguageModelUsage } from 'ai';
// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { model, messages }: { messages: UIMessage[]; model: string } =
        await req.json();

    let finalUsage: LanguageModelUsage | undefined;
    const result = streamText({
        model: model,
        messages: convertToModelMessages(messages),
        onFinish: ({ usage }) => {
            finalUsage = usage;
            console.log('[api/chat] onFinish usage', usage);
        },
    });


    // Base message stream with context metadata
    type ServerUIMessage = UIMessage<unknown, { usage: LanguageModelUsage }>;
    const baseStream = result.toUIMessageStream<ServerUIMessage>({});

    // Merge usage as an explicit data part at the end so the client can pick it up via onData.
    const merged = createUIMessageStream<ServerUIMessage>({
        execute: async ({ writer }) => {
            writer.merge(baseStream);
            // Prefer onFinish-captured usage; fall back to totalUsage
            try {
                const usage = finalUsage ?? (await result.totalUsage);
                writer.write({ type: 'data-usage', data: usage });
            } catch (e) {
                console.warn('[api/chat] usage not available', e);
            }
        },
    });

    return createUIMessageStreamResponse({ stream: merged });
}
