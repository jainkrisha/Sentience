import { NextResponse } from 'next/server';

export async function GET(request) {
  const apiKey = process.env.NEXT_PUBLIC_KEY_GEMINI;
  
  return NextResponse.json({
    apiKeyConfigured: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    apiKeyFirstChars: apiKey?.substring(0, 15) || 'NOT SET',
    apiKeyLastChars: apiKey?.substring(apiKey.length - 5) || 'NOT SET',
    allEnvVars: Object.keys(process.env)
      .filter(k => k.toLowerCase().includes('gemini') || k.toLowerCase().includes('key'))
      .map(k => ({ key: k, length: process.env[k]?.length || 0 }))
  }, { status: 200 });
}
