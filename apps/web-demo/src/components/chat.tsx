'use client';

import {
    PromptInput,
    PromptInputButton,
    PromptInputModelSelect,
    PromptInputModelSelectContent,
    PromptInputModelSelectItem,
    PromptInputModelSelectTrigger,
    PromptInputModelSelectValue,
    PromptInputSubmit,
    PromptInputTextarea,
    PromptInputToolbar,
    PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { GlobeIcon, MicIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import type { LanguageModelUsage, UIMessage } from 'ai';
import {
    Conversation,
    ConversationContent,
    ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import { Response } from '@/components/ai-elements/response';
import { Context } from './ai-elements/context';
import { getContextWindow, normalizeUsage } from 'tokenlens';

const models = [
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-5', name: 'GPT-5' },
    { id: 'claude-opus-4-20250514', name: 'Claude 4 Opus' },
];

type AppUIMessage = UIMessage<unknown, { usage: LanguageModelUsage }>;

const InputDemo = () => {
    const [text, setText] = useState<string>('');
    const [model, setModel] = useState<string>(models[0].id);
    const [usage, setUsage] = useState<LanguageModelUsage | undefined>(undefined);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        sendMessage(
            { text: text },
            {
                body: {
                    model: model,
                },
            },
        );
        setText('');
    };

    const { messages, status, sendMessage } = useChat<AppUIMessage>({
        experimental_throttle: 50,
        onData: (part) => {
            if (part.type === 'data-usage') {
                setUsage(part.data);
            }
        },
    });

    const contextMax = useMemo(() => {
        // Resolve from selected model; stable across chunks.
        const cw = getContextWindow(model);
        return cw.combinedMax ?? cw.inputMax ?? 0;
    }, [model]);

    const usedTokens = useMemo(() => {
        // Prefer explicit usage data part captured via onData
        if (!usage) return 0; // update only when final usage arrives
        const n = normalizeUsage(usage);
        return typeof n.total === 'number' ? n.total : (n.input ?? 0) + (n.output ?? 0);
    }, [usage]);

    const contextNode = useMemo(
        () => (
            <Context
                maxTokens={contextMax}
                usedTokens={usedTokens}
                usage={usage}
                modelId={model}
                showBreakdown
            />
        ),
        [contextMax, usedTokens, usage, model],
    );

    // Optional: add a single log after usage arrives
    useEffect(() => {
        if (!usage) return;
        normalizeUsage(usage); // touch to ensure tree-shake-safe import usage
    }, [usage]);

    return (
        <div className="max-w-4xl mx-auto p-6 relative size-full rounded-lg border h-[600px]">
            <div className="flex flex-col h-full">
                <Conversation>
                    <ConversationContent>
                        {messages.map((message) => (
                            <Message from={message.role} key={message.id}>
                                <MessageContent>
                                    {message.parts.map((part, i) => {
                                        switch (part.type) {
                                            case 'text':
                                                return (
                                                    <Response key={`${message.id}-${i}`}>
                                                        {part.text}
                                                    </Response>
                                                );
                                            default:
                                                return null;
                                        }
                                    })}
                                </MessageContent>
                            </Message>
                        ))}
                    </ConversationContent>
                    <ConversationScrollButton />
                </Conversation>

                <PromptInput onSubmit={handleSubmit} className="mt-4">
                    <PromptInputTextarea
                        onChange={(e) => setText(e.target.value)}
                        value={text}
                    />
                    <PromptInputToolbar>
                        <PromptInputTools>
                            <PromptInputButton>
                                <MicIcon size={16} />
                            </PromptInputButton>
                            <PromptInputButton>
                                <GlobeIcon size={16} />
                                <span>Search</span>
                            </PromptInputButton>
                            <PromptInputModelSelect
                                onValueChange={(value) => {
                                    setModel(value);
                                }}
                                value={model}
                            >
                                <PromptInputModelSelectTrigger>
                                    <PromptInputModelSelectValue />
                                </PromptInputModelSelectTrigger>
                                <PromptInputModelSelectContent>
                                    {models.map((model) => (
                                        <PromptInputModelSelectItem key={model.id} value={model.id}>
                                            {model.name}
                                        </PromptInputModelSelectItem>
                                    ))}
                                </PromptInputModelSelectContent>
                            </PromptInputModelSelect>
                            {contextNode}
                        </PromptInputTools>
                        <PromptInputSubmit disabled={!text} status={status} />
                    </PromptInputToolbar>
                </PromptInput>
            </div>
        </div>
    );
};

export default InputDemo;
