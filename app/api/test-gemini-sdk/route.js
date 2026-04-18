import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET(request) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_KEY_GEMINI;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    console.log('Initializing Google Generative AI with key:', apiKey.substring(0, 20) + '...');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try to get the model
    console.log('Attempting to get gemini-1.5-flash model...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    console.log('Model obtained, attempting generation...');
    
    const result = await model.generateContent('What is 2+2?');
    
    console.log('Generation successful!');
    console.log('Response:', result.response);
    
    const text = result.response.text();
    
    return NextResponse.json({
      success: true,
      model: 'gemini-1.5-flash',
      response: text,
      message: 'Successfully generated content with gemini-1.5-flash'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
      type: error.name
    }, { status: 500 });
  }
}
