import { NextResponse } from 'next/server';

/**
 * Proxy: receives base64 frame from browser → forwards to emotion detection Python server on port 8001
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const res = await fetch('http://localhost:8001/detect_emotion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Emotion server error: ${err}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    // Emotion server not running — return neutral silently so camera still works
    return NextResponse.json({ emotion: 'neutral', emoji: '😐', confidence: 0, all_scores: {} });
  }
}
