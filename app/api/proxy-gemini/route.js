import { chatSession } from '@/utils/Geminimodel';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const result = await chatSession.sendMessage(prompt);
    const responseText = await result.response.text();

    return NextResponse.json(
      { success: true, response: responseText },
      { status: 200 }
    );
  } catch (error) {
    console.error('Proxy Error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to NVIDIA API', details: error.message },
      { status: 500 }
    );
  }
}
