import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'Anthropic API key not configured' }, { status: 500 });
    }

    console.log('Testing direct Anthropic REST API call...');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 100,
        messages: [
          { role: 'user', content: 'Hello' }
        ]
      })
    });

    const responseText = await response.text();
    console.log('API Response Status:', response.status);
    console.log('API Response:', responseText.substring(0, 300));

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      return NextResponse.json({
        success: false,
        httpStatus: response.status,
        responseText: responseText.substring(0, 500)
      }, { status: response.status });
    }

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        httpStatus: response.status,
        error: data.error?.message || data.message || 'Unknown error',
        fullError: data
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      httpStatus: response.status,
      response: data.content[0]?.text
    }, { status: 200 });

  } catch (error) {
    console.error('Error:', error.message);
    return NextResponse.json({
      error: error.message,
      type: error.constructor.name
    }, { status: 500 });
  }
}
