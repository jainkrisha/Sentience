import { NextResponse } from 'next/server';
import { chatSession } from '@/utils/Geminimodel';
import pdfParse from 'pdf-parse';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const resumeFile = formData.get('resume');
    const jobDescription = formData.get('job_description') || '';
    const analysisOption = formData.get('analysis_option');

    if (!resumeFile) {
      return NextResponse.json({ success: false, error: 'No resume file provided' }, { status: 400 });
    }

    // Convert file to buffer and parse PDF
    const arrayBuffer = await resumeFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let pdfText = '';
    try {
      const data = await pdfParse(buffer);
      pdfText = data.text;
    } catch (parseError) {
      console.error('PDF Parse Error:', parseError);
      return NextResponse.json({ success: false, error: 'Failed to parse PDF file. Ensure it is a valid PDF.' }, { status: 400 });
    }

    if (!pdfText.trim()) {
      return NextResponse.json({ success: false, error: 'Could not extract any text from the PDF' }, { status: 400 });
    }

    let prompt = '';
    if (analysisOption === 'Quick Scan') {
      prompt = `You are ResumeChecker, an expert in resume analysis. Provide a quick scan of the following resume:
      
      1. Identify the most suitable profession for this resume.
      2. List 3 key strengths of the resume.
      3. Suggest 2 quick improvements.
      4. Give an overall ATS score out of 100.
      
      Resume text: ${pdfText}
      Job description (if provided): ${jobDescription}`;
    } else if (analysisOption === 'Detailed Analysis') {
      prompt = `You are ResumeChecker, an expert in resume analysis. Provide a detailed analysis of the following resume:
      
      1. Identify the most suitable profession for this resume.
      2. List 5 strengths of the resume.
      3. Suggest 3-5 areas for improvement with specific recommendations.
      4. Rate the following aspects out of 10: Impact, Brevity, Style, Structure, Skills.
      5. Provide a brief review of each major section (e.g., Summary, Experience, Education).
      6. Give an overall ATS score out of 100 with a breakdown of the scoring.
      
      Resume text: ${pdfText}
      Job description (if provided): ${jobDescription}`;
    } else {
      // ATS Optimization
      prompt = `You are ResumeChecker, an expert in ATS optimization. Analyze the following resume and provide optimization suggestions:
      
      1. Identify keywords from the job description that should be included in the resume.
      2. Suggest reformatting or restructuring to improve ATS readability.
      3. Recommend changes to improve keyword density without keyword stuffing.
      4. Provide 3-5 bullet points on how to tailor this resume for the specific job description.
      5. Give an ATS compatibility score out of 100 and explain how to improve it.
      
      Resume text: ${pdfText}
      Job description: ${jobDescription}`;
    }

    // Call Gemini Model
    const result = await chatSession.sendMessage(prompt);
    const responseText = await result.response.text();

    return NextResponse.json({ success: true, analysis: responseText, pdfText });
  } catch (error) {
    console.error('ATS Checker Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
