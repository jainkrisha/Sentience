import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_KEY_GEMINI;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    console.log('Initializing Google Generative AI...');
    const genAI = new GoogleGenerativeAI(apiKey);
    
    console.log('Getting model...');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    console.log('Sending test message...');
    const result = await model.generateContent("What is 2+2?");
    
    console.log('Getting response text...');
    const response = await result.response;
    const text = response.text();
    
    return NextResponse.json(
      { 
        success: true,
        response: text
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      status: error.status,
      code: error.code
    });
    
    return NextResponse.json(
      { 
        error: error.message,
        errorName: error.name,
        errorStatus: error.status
      },
      { status: 500 }
    );
  }
}
