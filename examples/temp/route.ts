const result = streamText({
  model,
  messages: modelMessages,
  tools,
  stopWhen: [stepCountIs(5)],
})



const modelMessages = convertToModelMessages(uiMessagesWithSystem)
    const details = await describeModel({ modelId }) as SourceModel
    const contextLimits = await getContextLimits({ modelId })
    const result = streamText({
      model,
      messages: modelMessages,
      tools,
      stopWhen: [stepCountIs(5)],
    })
    return result.toUIMessageStreamResponse({
      originalMessages: uiMessagesWithSystem,
      generateMessageId: createIdGenerator({ size: 16 }),
      messageMetadata:  ({ part }) => {
        if (part.type !== 'finish') return
        const usage = part.totalUsage

        const totalTokens = usage.inputTokens! + usage.outputTokens!;
        const remainingCombined = contextLimits?.context ? Math.max(0, contextLimits.context - totalTokens) : undefined;
        const percentUsed = contextLimits?.context ? totalTokens / contextLimits.context : 1;

        return {
          model: modelId,
          inputTokens: part.totalUsage.inputTokens,
          outputTokens: part.totalUsage.outputTokens,
          totalTokens: part.totalUsage.totalTokens,
          reasoningTokens: part.totalUsage.reasoningTokens,
          cachedInputTokens: part.totalUsage.cachedInputTokens,
          createdAt: Date.now(),
          contextUsedPercent: percentUsed,
          remainingTokens: remainingCombined,
          contextHealth: percentUsed > 0.85 ? 'compact' : percentUsed > 0.75 ? 'warn' : 'ok',
          estimatedCostUSD: 0,
          limit: contextLimits,
        }
      },
      onFinish: async ({ messages }) => {
        try {
          const pm = await result.providerMetadata
          const usage = pm?.openrouter?.usage
          console.log("THIS IS THE USAGE from openrouter", usage)
          const lastMessage = messages[messages.length - 1]
 
          if (lastMessage?.role === 'assistant') {
            const m = (lastMessage.metadata ?? {}) as any
            const usage: Usage = {
              input_tokens: m.inputTokens ?? 0,
              output_tokens: m.outputTokens ?? 0,
              total_tokens: m.totalTokens ?? 0,
              reasoning_tokens: m.reasoningTokens ?? 0,
              cache_read_tokens: m.cachedInputTokens ?? 0,
            }
            console.log("THIS IS THE USAGE", JSON.stringify(usage))
            const modelSlice = modelId.split('/')[1]
            console.log("THIS IS THE MODEL SLICE", modelSlice)
            const estimatedCostUSD = await computeCostUSD({ modelId: modelId, provider: "openrouter", usage })
            console.log("THIS IS THE ESTIMATED COST USD", estimatedCostUSD)
            lastMessage.metadata = { ...m, estimatedCostUSD }
          }
          await saveChatUI(id, userId, messages as UIMessage[])
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          console.error('Failed to save UI messages:', errorMessage)
        }
      },
      sendReasoning: true,
      onError: (error: unknown) => {
        const message = error instanceof Error ? error.message : String(error)
        console.error('UI stream error:', message)
        return message
      },
    })
