import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { prompt } = await request.json();
    const apiKey = process.env.NEXT_PUBLIC_KEY_GEMINI;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const url = `https://generativelanguage.googleapis.com/v1/models/text-bison-001:generateText?key=${apiKey}`;

    console.log('Calling Google Generative AI REST API...');
    console.log('URL:', url.substring(0, 100) + '...');
    console.log('Prompt:', prompt);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: {
          text: prompt
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('API Error Response:', data);
      return NextResponse.json(
        { error: 'Google API Error', details: data },
        { status: response.status }
      );
    }

    console.log('Success! Response:', data);

    const generatedText = data?.candidates?.[0]?.output || '';

    return NextResponse.json(
      { 
        success: true,
        response: generatedText
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
