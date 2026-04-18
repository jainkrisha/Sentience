import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function GET(request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'Anthropic API key not configured' }, { status: 500 });
    }

    console.log('Testing Claude API...');
    const client = new Anthropic({ apiKey });
    
    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        { role: "user", content: "What is 2+2?" }
      ],
    });
    
    const responseText = message.content[0].text;
    console.log('Claude response received:', responseText.substring(0, 100));
    
    return NextResponse.json({
      success: true,
      model: 'claude-3-5-sonnet-20241022',
      response: responseText
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error:', error.message);
    return NextResponse.json({
      error: error.message,
      type: error.constructor.name
    }, { status: 500 });
  }
}
