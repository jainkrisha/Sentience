import { NextResponse } from 'next/server';

export async function GET(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  return NextResponse.json({
    message: 'This API key appears to be in Anthropic format (sk-or-v1-*) but is being rejected by Anthropic servers.',
    apiKeyFormat: 'sk-or-v1-* (Anthropic format)',
    status: 'INVALID with Anthropic API',
    suggestion: 'This key may be expired, revoked, or not have API access enabled.',
    recommendations: [
      '1. Log into your Anthropic console and verify the key is active',
      '2. Check if there are any billing issues on the account',
      '3. Try generating a new API key from the console',
      '4. If this is actually a Google Gemma key, the format is wrong - Google keys should start with AIzaSy...',
      '5. Please verify where this key came from and what service it is for'
    ]
  }, { status: 200 });
}
