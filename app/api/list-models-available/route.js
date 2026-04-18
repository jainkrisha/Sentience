import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_KEY_GEMINI;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    console.log('Fetching available models from Google API...');
    
    // Use the REST API to list models
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('API Response status:', response.status);
    console.log('API Response:', JSON.stringify(data, null, 2).substring(0, 500));
    
    if (!response.ok) {
      return NextResponse.json({
        error: 'Failed to list models',
        apiStatus: response.status,
        apiResponse: data
      }, { status: response.status });
    }
    
    const models = data.models || [];
    const modelNames = models.map(m => ({
      name: m.name,
      displayName: m.displayName,
      description: m.description?.substring(0, 100)
    }));
    
    console.log('Available models:', modelNames.map(m => m.name));
    
    return NextResponse.json({
      success: true,
      availableModels: modelNames,
      totalCount: modelNames.length
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error:', error.message);
    
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
