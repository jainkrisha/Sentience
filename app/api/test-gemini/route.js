import { chatSession } from '@/utils/Geminimodel';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log('Testing Gemini API with prompt:', prompt);

    const result = await chatSession.sendMessage(prompt);
    const responseText = await result.response.text();

    console.log('Gemini response:', responseText);

    return NextResponse.json(
      { 
        success: true,
        response: responseText,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Gemini API Error:', error);
    console.error('Error message:', error.message);
    console.error('Error details:', {
      name: error.name,
      code: error.code,
      message: error.message,
      stack: error.stack
    });

    return NextResponse.json(
      { 
        error: 'Failed to get response from Gemini',
        details: error.message,
        errorType: error.name
      },
      { status: 500 }
    );
  }
}
