/**
 * OpenRouter API wrapper — Google: Gemma 4 26B A4B (free)
 * Exposes the same `chatSession.sendMessage()` interface
 * previously provided by @google/generative-ai.
 */

const NVIDIA_NIM_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const MODEL = "meta/llama-3.1-70b-instruct"; // Flagship Llama-3.1 70B on NVIDIA API

function getApiKey() {
  return process.env.NEXT_PUBLIC_KEY_GEMINI;
}

/**
 * Sends a single message to OpenRouter and returns the text response.
 * @param {string} userMessage
 * @returns {Promise<string>}
 */
async function sendToOpenRouter(userMessage) {
  // If called from the browser, proxy through internal API to bypass CORS
  if (typeof window !== "undefined") {
    const proxyRes = await fetch("/api/proxy-gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: userMessage }),
    });

    if (!proxyRes.ok) {
      const errorData = await proxyRes.json().catch(() => ({}));
      throw new Error(`Proxy error: ${errorData?.error || proxyRes.statusText}`);
    }

    const data = await proxyRes.json();
    return data.response;
  }

  // Server-side Direct Fetch
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("NVIDIA API key not found. Set NEXT_PUBLIC_KEY_GEMINI in .env.local");
  }

  const response = await fetch(NVIDIA_NIM_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 1,
      top_p: 0.95,
      max_tokens: 8192,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `NVIDIA API error ${response.status}: ${errorData?.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content ?? "";
  return text;
}

/**
 * chatSession — drop-in replacement for Google GenerativeAI's chatSession.
 * Usage: const result = await chatSession.sendMessage(prompt);
 *        const text = result.response.text();
 */
export const chatSession = {
  sendMessage: async (userMessage) => {
    const text = await sendToOpenRouter(userMessage);
    return {
      response: {
        text: () => text,
      },
    };
  },
};