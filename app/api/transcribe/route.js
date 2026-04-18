import { NextResponse } from 'next/server';

/**
 * Proxy route: receives audio blob from browser → forwards to faster-whisper Python server
 * Python server runs on http://localhost:8000
 */
export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Forward the audio to the faster-whisper Python server
    const whisperForm = new FormData();
    whisperForm.append('audio', audioFile, audioFile.name || 'recording.webm');

    const whisperRes = await fetch('http://localhost:8000/transcribe', {
      method: 'POST',
      body: whisperForm,
    });

    if (!whisperRes.ok) {
      const err = await whisperRes.text();
      return NextResponse.json(
        { error: `Whisper server error: ${err}` },
        { status: whisperRes.status }
      );
    }

    const data = await whisperRes.json();
    return NextResponse.json({ transcript: data.transcript });
  } catch (error) {
    console.error('Transcription proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to Whisper server. Make sure whisper-server is running on port 8000.' },
      { status: 500 }
    );
  }
}
