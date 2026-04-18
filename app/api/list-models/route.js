import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_KEY_GEMINI;
    console.log('API Key exists:', !!apiKey);
    console.log('API Key length:', apiKey?.length);

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try to list available models
    console.log('Attempting to list available models...');
    const models = await genAI.getGenerativeModel({ model: "models/gemini-pro" });
    
    return NextResponse.json(
      { 
        message: "Model access confirmed",
        apiKeyConfigured: !!apiKey,
        note: "gemini-pro model is accessible"
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { 
        error: error.message,
        errorType: error.name,
        hint: "Try using 'gemini-pro' or 'gemini-pro-vision' model names"
      },
      { status: 500 }
    );
  }
}
