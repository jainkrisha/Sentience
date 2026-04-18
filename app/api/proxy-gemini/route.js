import { NextResponse } from 'next/server';

const NVIDIA_NIM_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const MODEL = "meta/llama-3.1-70b-instruct";

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'No prompt provided' }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_KEY_GEMINI;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const response = await fetch(NVIDIA_NIM_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: 8192,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: err?.detail || err?.error?.message || response.statusText },
        { status: response.status }
      );
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content ?? '';
    return NextResponse.json({ response: text });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
