import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET(request) {
  const apiKey = process.env.NEXT_PUBLIC_KEY_GEMINI;
  
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // List of models to try
  const modelsToTry = [
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro',
    'text-bison-001'
  ];
  
  const results = [];
  
  for (const modelName of modelsToTry) {
    try {
      console.log(`Testing model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Hi');
      
      results.push({
        model: modelName,
        status: 'SUCCESS',
        response: result.response.text().substring(0, 50)
      });
      
      console.log(`✓ ${modelName} works!`);
      
      // Return on first success
      return NextResponse.json({
        workingModel: modelName,
        allResults: results,
        success: true
      }, { status: 200 });
      
    } catch (error) {
      results.push({
        model: modelName,
        status: 'FAILED',
        error: error.message.substring(0, 300)
      });
      console.log(`✗ ${modelName}: ${error.message.substring(0, 150)}`);
    }
  }
  
  return NextResponse.json({
    allResults: results,
    success: false,
    message: 'No working models found'
  }, { status: 500 });
}
