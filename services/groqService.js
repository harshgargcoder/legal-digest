/**
 * Groq Service for AI Moot Court
 * Handles LLM calls with fallback to DeepSeek, token counting, 
 * and strict judicial prompts.
 */

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || "";
const DEEPSEEK_API_KEY = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || "";

/**
 * Approximates token count based on the char/4 rule.
 */
export const approximateTokens = (text) => {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
};

/**
 * Truncates transcript to keep the first 500 and last 500 tokens.
 */
export const truncateTranscript = (transcript) => {
  const tokenLimit = 1000; // 500 start + 500 end
  const charLimit = tokenLimit * 4;
  
  if (transcript.length <= charLimit) return transcript;

  const firstPart = transcript.substring(0, 2000); // ~500 tokens
  const lastPart = transcript.substring(transcript.length - 2000); // ~500 tokens
  
  return `${firstPart}\n\n[... OMITTED FOR BREVITY ...]\n\n${lastPart}`;
};

/**
 * Generic fetch with retry logic for 429 (Rate Limit).
 */
async function fetchWithRetry(url, options, retries = 3, backoff = 1000) {
  try {
    const response = await fetch(url, options);
    
    if (response.status === 429 && retries > 0) {
      const retryAfter = response.headers.get("retry-after");
      const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : backoff;
      console.warn(`Rate limited. Retrying after ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
}

/**
 * Calls Groq API with DeepSeek fallback.
 */
async function callLLM(prompt, maxTokens = 500) {
  const payload = {
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
    max_tokens: maxTokens,
  };

  try {
    // Try Groq First
    const data = await fetchWithRetry("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    return data.choices[0].message.content;
  } catch (groqError) {
    console.error("Groq failed, falling back to DeepSeek:", groqError);
    
    // Fallback to DeepSeek
    try {
      const dsData = await fetchWithRetry("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          model: "deepseek-chat"
        }),
      });
      return dsData.choices[0].message.content;
    } catch (dsError) {
      throw new Error("Both Groq and DeepSeek failed.");
    }
  }
}

/**
 * AI Judge Prompt
 */
export async function getJudgeRuling(brief, transcript) {
  const prompt = `
    ROLE: You are a neutral, highly experienced Presiding Judge in an Indian Court.
    CASE BRIEF (FACTS): ${brief}
    TRANSCRIPT OF PROCEEDINGS: ${transcript}
    
    STRICT INSTRUCTIONS:
    1. Base your ruling ONLY on the facts provided in the Case Brief.
    2. DO NOT use external legal knowledge, precedents not mentioned, or statutes not in the brief.
    3. DO NOT hallucinate facts or citations. If a citation is not in the brief, DO NOT use it.
    4. Maintain a formal, authoritative judicial tone.
    5. Rule on objections or advance the trial phase if necessary.
    6. Your response must be under 150 words.
    
    TASK: Provide the next judicial statement or ruling.
  `;
  return await callLLM(prompt, 500);
}

/**
 * AI Counsel Prompt
 */
export async function getCounselResponse(brief, transcript, side, strategy) {
  const prompt = `
    ROLE: You are an Advocate representing the ${side} in this Moot Court.
    STRATEGY: ${strategy} (Aggressive/Cooperative).
    CASE BRIEF (FACTS): ${brief}
    TRANSCRIPT OF PROCEEDINGS: ${transcript}
    
    STRICT INSTRUCTIONS:
    1. Use ONLY the facts and evidence provided in the Case Brief.
    2. NEVER fabricate citations, case laws, or evidence.
    3. NEVER use external legal knowledge. Stick to the brief.
    4. If the opposing side hallucinates, point it out based on the brief.
    5. Your response must be under 100 words.
    
    TASK: Provide your next argument or cross-examination question.
  `;
  return await callLLM(prompt, 400);
}

/**
 * AI Witness Prompt
 */
export async function getWitnessResponse(brief, transcript) {
  const prompt = `
    ROLE: You are a witness being examined in court.
    CASE BRIEF (FACTS): ${brief}
    TRANSCRIPT OF PROCEEDINGS: ${transcript}
    
    STRICT INSTRUCTIONS:
    1. You only know what is written about your character or the events in the Case Brief.
    2. If asked something not in the brief, say "I don't recall" or "I am not aware of that."
    3. Stay in character. Do not provide legal arguments.
    4. Your response must be under 60 words.
    
    TASK: Answer the last question asked to you.
  `;
  return await callLLM(prompt, 200);
}

/**
 * Case Brief Summariser
 */
export async function summariseBrief(fullBrief) {
  const prompt = `
    TASK: Compress the following legal case brief into a dense, fact-rich summary of approximately 300 tokens.
    Keep all critical dates, party names, and the core legal dispute. 
    Do not add any commentary.
    
    BRIEF: ${fullBrief}
  `;
  return await callLLM(prompt, 350);
}
