/**
 * Counts tokens in text using a simple approximation:
 * - ~1 token per 4 characters for English text
 * - Adjusts for common patterns (spaces, punctuation)
 *
 * This provides a rough estimate. For exact counts, consider:
 * - tiktoken library (for OpenAI models)
 * - sentencepiece (for local models)
 */
export function countTokens(text: string): number {
    if (!text || text.length === 0) return 0;

    // Basic approximation: 1 token ≈ 4 characters
    // This is a rough estimate based on common tokenizers
    const charCount = text.length;
    const estimatedTokens = Math.ceil(charCount / 4);

    return estimatedTokens;
}

/**
 * Counts total tokens in a messages array
 * Accounts for role labels and message structure overhead
 */
export function countMessagesTokens(messages: { role: string, text: string }[]): number {
    if (!messages || messages.length === 0) return 0;

    let totalTokens = 0;

    for (const message of messages) {
        // Count role tokens (~1-2 tokens for "user", "assistant", "system")
        totalTokens += 2;

        // Count message content tokens
        totalTokens += countTokens(message.text);

        // Add overhead for message structure (typically 3-4 tokens per message)
        totalTokens += 3;
    }

    return totalTokens;
}

/**
 * Filters messages to fit within a token limit (context window)
 * Keeps system message and most recent messages
 */
export function filterMessagesByTokenLimit(
    messages: { role: string, text: string }[],
    maxTokens: number
): { role: string, text: string }[] {
    if (!messages || messages.length === 0) return [];

    // Find system message (if exists)
    const systemMessageIndex = messages.findIndex(m => m.role === 'system');
    const systemMessage = systemMessageIndex !== -1 ? messages[systemMessageIndex] : null;
    const otherMessages = systemMessageIndex !== -1
        ? messages.filter((_, i) => i !== systemMessageIndex)
        : messages;

    // Reserve tokens for system message
    let remainingTokens = maxTokens;
    if (systemMessage) {
        remainingTokens -= countMessagesTokens([systemMessage]);
    }

    // Start from the most recent messages and work backwards
    const result: { role: string, text: string }[] = [];

    for (let i = otherMessages.length - 1; i >= 0; i--) {
        const message = otherMessages[i];
        const messageTokens = countMessagesTokens([message]);

        if (messageTokens <= remainingTokens) {
            result.unshift(message);
            remainingTokens -= messageTokens;
        } else {
            break;
        }
    }

    // Add system message at the beginning if it exists
    if (systemMessage) {
        result.unshift(systemMessage);
    }

    return result;
}
