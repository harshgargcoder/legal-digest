/**
 * Truncates the transcript to stay within token limits.
 * Keeps the first 500 tokens and the last 500 tokens, with a middle placeholder.
 * Approximate tokens using the character/4 rule.
 */
export function truncateTranscript(transcript: string, maxTokens = 3000): string {
  // Approximate character limits (1 token ≈ 4 characters)
  const totalCharLimit = maxTokens * 4;
  const edgeCharLimit = 500 * 4; // 2000 characters

  if (transcript.length <= totalCharLimit) {
    return transcript;
  }

  const firstPart = transcript.substring(0, edgeCharLimit);
  const lastPart = transcript.substring(transcript.length - edgeCharLimit);

  return `${firstPart}\n\n[... Transcript truncated for brevity ...]\n\n${lastPart}`;
}

/**
 * Approximates token count for a string.
 */
export function approximateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}
