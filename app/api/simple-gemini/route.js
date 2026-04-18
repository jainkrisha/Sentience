import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log('=== Request received ===');
    
    let body;
    try {
      body = await request.json();
      console.log('Request body parsed:', body);
    } catch (parseError) {
      console.error('JSON parse error:', parseError.message);
      return NextResponse.json({ error: 'Invalid JSON in request' }, { status: 400 });
    }

    const { prompt } = body;
    const apiKey = process.env.NEXT_PUBLIC_KEY_GEMINI;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    console.log('Using API key (first 20 chars):', apiKey.substring(0, 20) + '...');
    
    // Use text-bison-001 model with generateText endpoint
    const url = `https://generativelanguage.googleapis.com/v1/models/text-bison-001:generateText?key=${apiKey}`;
    
    console.log('Making request to:', url.substring(0, 80) + '...');
    console.log('Prompt:', prompt);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: { text: prompt }
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));

    let data;
    const responseText = await response.text();
    console.log('Response body (first 500 chars):', responseText.substring(0, 500));

    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Could not parse response as JSON');
      return NextResponse.json(
        { error: 'Invalid response from API', rawResponse: responseText.substring(0, 200) },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.error('API Error:', data);
      return NextResponse.json(
        { error: 'API Error', details: data },
        { status: response.status }
      );
    }

    const result = data?.candidates?.[0]?.output || 'No response generated';
    console.log('Success! Generated text:', result.substring(0, 100));

    return NextResponse.json(
      { success: true, response: result },
      { status: 200 }
    );

  } catch (error) {
    console.error('Endpoint Error:', error.message);
    console.error('Stack:', error.stack);
    return NextResponse.json(

}
