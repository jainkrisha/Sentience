import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET(request) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_KEY_GEMINI;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    console.log('Testing gemini-2.0-flash-001...');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });
    
    const result = await model.generateContent('What is 2+2?');
    const text = result.response.text();
    
    console.log('Success!', text);
    
    return NextResponse.json({
      success: true,
      model: 'gemini-2.0-flash-001',
      response: text
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error:', error.message);
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}
