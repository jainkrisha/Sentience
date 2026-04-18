import { NextResponse } from 'next/server';

export async function GET(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  return NextResponse.json({
    apiKeyConfigured: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    apiKeyFirstChars: apiKey?.substring(0, 15) || 'NOT SET',
    apiKeyLastChars: apiKey?.substring(apiKey.length - 10) || 'NOT SET',
    fullKey: apiKey || 'NOT SET'
  }, { status: 200 });
}
