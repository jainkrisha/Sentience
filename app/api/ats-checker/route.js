import { NextResponse } from 'next/server';

const NVIDIA_NIM_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const MODEL = "meta/llama-3.1-8b-instruct";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const resumeFile = formData.get('resume');
    const jobDescription = formData.get('job_description') || '';
    const analysisOption = formData.get('analysis_option') || 'Quick Scan';

    if (!resumeFile) {
      return NextResponse.json({ success: false, error: 'No resume file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await resumeFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse PDF — dynamic import to avoid Next.js bundling issues
    let pdfText = '';
    try {
      const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
      const data = await pdfParse(buffer);
      pdfText = data.text;
    } catch (parseError) {
      console.error('PDF Parse Error:', parseError);
      return NextResponse.json(
        { success: false, error: 'Failed to parse PDF. Make sure the file is a valid, text-based PDF (not a scanned image).' },
        { status: 400 }
      );
    }

    if (!pdfText.trim()) {
      return NextResponse.json(
        { success: false, error: 'Could not extract text from the PDF. It may be a scanned image — please use a text-based PDF.' },
        { status: 400 }
      );
    }

    // Build prompt based on analysis type
    let prompt = '';
    if (analysisOption === 'Quick Scan') {
      prompt = `You are ResumeChecker, an expert ATS analyst. Provide a quick scan of the following resume:

1. Most suitable profession for this resume.
2. 3 key strengths.
3. 2 quick improvements.
4. Overall ATS score out of 100.

Resume:
${pdfText}

Job Description (if provided): ${jobDescription}`;
    } else if (analysisOption === 'Detailed Analysis') {
      prompt = `You are ResumeChecker, an expert ATS analyst. Provide a detailed analysis of this resume:

1. Most suitable profession.
2. 5 strengths.
3. 3–5 specific improvement areas.
4. Rate out of 10: Impact, Brevity, Style, Structure, Skills.
5. Brief review of each major section (Summary, Experience, Education).
6. Overall ATS score out of 100 with scoring breakdown.

Resume:
${pdfText}

Job Description (if provided): ${jobDescription}`;
    } else {
      prompt = `You are ResumeChecker, an expert in ATS optimization. Analyze this resume:

1. Keywords from the job description missing from the resume.
2. Reformatting/restructuring suggestions to improve ATS readability.
3. Keyword density recommendations (no keyword stuffing).
4. 3–5 bullet points on tailoring this resume to the job description.
5. ATS compatibility score out of 100 and how to improve it.

Resume:
${pdfText}

Job Description: ${jobDescription}`;
    }

    // Call NVIDIA NIM API directly (server-side, no CORS issue)
    const apiKey = process.env.NEXT_PUBLIC_KEY_GEMINI;
    if (!apiKey) {
      console.error('NVIDIA API key missing from environment');
      return NextResponse.json({ success: false, error: 'API key not configured on server.' }, { status: 500 });
    }

    const aiResponse = await fetch(NVIDIA_NIM_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: 4096,
      }),
    });

    if (!aiResponse.ok) {
      const errData = await aiResponse.json().catch(() => ({}));
      const errMsg = errData?.detail || errData?.error?.message || aiResponse.statusText;
      console.error('NVIDIA API error:', aiResponse.status, errMsg);
      return NextResponse.json({ success: false, error: `AI service error: ${errMsg}` }, { status: aiResponse.status });
    }

    const aiData = await aiResponse.json();
    const responseText = aiData?.choices?.[0]?.message?.content ?? '';

    if (!responseText) {
      return NextResponse.json({ success: false, error: 'AI returned an empty response. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, analysis: responseText, pdfText });

  } catch (error) {
    console.error('ATS Checker unhandled error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
