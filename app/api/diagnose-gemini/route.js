import { NextResponse } from 'next/server';

export async function GET(request) {
  const apiKey = process.env.NEXT_PUBLIC_KEY_GEMINI;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not found' }, { status: 500 });
  }

  try {
    // Try the text-bison model
    const url = `https://generativelanguage.googleapis.com/v1/models/text-bison-001:generateText?key=${apiKey}`;
    
    console.log('Testing URL:', url.substring(0, 80) + '...');

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: { text: 'Hello' }
      })
    });

    console.log('HTTP Status:', response.status);
    console.log('Status Text:', response.statusText);

    const responseBody = await response.text();
    console.log('Response Body:', responseBody);

    return NextResponse.json({
      httpStatus: response.status,
      statusText: response.statusText,
      responseBody: responseBody,
      responseLength: responseBody.length,
      apiKeyConfigured: !!apiKey,
      apiKeyPrefix: apiKey.substring(0, 15)
    }, { status: 200 });

  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({
      error: error.message,
      type: 'FETCH_ERROR'
    }, { status: 500 });
  }
}
