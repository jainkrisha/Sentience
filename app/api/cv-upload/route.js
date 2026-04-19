import { NextResponse } from 'next/server';
import { db } from '../../../utils/db';
import { cv_uploads, preparation_planner } from '../../../utils/schema';
import { chatSession } from '../../../utils/Geminimodel';
import { eq } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userEmail = user.primaryEmailAddress.emailAddress;

    const { cvText } = await req.json();

    if (!cvText) {
      return NextResponse.json({ error: 'CV Text is required' }, { status: 400 });
    }

    // Step 1: Analyze CV using AI
    const prompt = `Analyze this CV text and generate a structured JSON response. 
    Include:
    1. "extractedSkills": Array of technical and soft skills.
    2. "extractedProjects": Array of brief project descriptions.
    3. "targetRoles": Array of likely job titles this CV fits.
    4. "planner": A 2-to-4 week preparation plan for tech interviews based on this CV. Outline topics to study and practice. Include a "readinessBaseline" score out of 100 based on the strength of the CV.
    
    Ensure output is ONLY valid JSON.
    
    CV Text: ${cvText}`;

    const aiResult = await chatSession.sendMessage(prompt);
    let aiResponseText = aiResult.response.text();
    // Clean up if the AI wrapped it in markdown block
    aiResponseText = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();

    const analysis = JSON.parse(aiResponseText);

    // Step 2: Save to cv_uploads
    const cvUploadResult = await db.insert(cv_uploads).values({
      userEmail,
      cvText,
      extractedSkills: JSON.stringify(analysis.extractedSkills || []),
      extractedProjects: JSON.stringify(analysis.extractedProjects || []),
      targetRoles: JSON.stringify(analysis.targetRoles || []),
    }).returning({ id: cv_uploads.id });

    // Step 3: Upsert Preparation Planner
    // We only keep one active planner per user, or update existing
    const existingPlanner = await db.select().from(preparation_planner).where(eq(preparation_planner.userEmail, userEmail));
    
    let plannerId;
    if (existingPlanner.length > 0) {
      const result = await db.update(preparation_planner).set({
        plannerJson: JSON.stringify(analysis.planner),
        readinessBaseline: analysis.planner?.readinessBaseline || 50,
        updatedAt: new Date().toISOString(),
      }).where(eq(preparation_planner.userEmail, userEmail)).returning({ id: preparation_planner.id });
      plannerId = result[0].id;
    } else {
      const result = await db.insert(preparation_planner).values({
        userEmail,
        plannerJson: JSON.stringify(analysis.planner),
        readinessBaseline: analysis.planner?.readinessBaseline || 50,
      }).returning({ id: preparation_planner.id });
      plannerId = result[0].id;
    }

    return NextResponse.json({ success: true, cvId: cvUploadResult[0].id, plannerId });
  } catch (error) {
    console.error("CV Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
