import { NextResponse } from 'next/server';
import { db } from '../../../../utils/db';
import { improvement_roadmap } from '../../../../utils/schema';
import { chatSession } from '../../../../utils/Geminimodel';

/** Read the user email from the cookie set at sign-in. */
function getUserEmail(req) {
  const cookie = req.cookies.get('user_email');
  return cookie?.value ? decodeURIComponent(cookie.value) : null;
}

export async function POST(req) {
  try {
    const userEmail = getUserEmail(req);
    if (!userEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { feedbackData, sessionId, sessionMetrics, sessionInfo } = await req.json();

    if (!feedbackData || feedbackData.length === 0) {
      return NextResponse.json({ error: 'Feedback data required' }, { status: 400 });
    }

    const weakAnswers = feedbackData.filter(item => parseInt(item.rating) < 6);
    const hasBehavioralIssues = sessionMetrics && (sessionMetrics.eyeContactScore < 70 || sessionMetrics.badPostureCount > 2);

    if (weakAnswers.length === 0 && !hasBehavioralIssues) {
      return NextResponse.json({ success: true, message: 'No significant weak areas found to add to roadmap' });
    }

    const jobPosition = sessionInfo?.jobPosition || 'General Role';
    const companyModeMatch = sessionInfo?.jobDescription?.match(/Company:\s*(.*)/i);
    const companyName = companyModeMatch ? companyModeMatch[1] : '';

    const prompt = `Analyze these interview results to generate a personalized Improvement Roadmap.
    Base your analysis on: semantic gaps in user answers, repeated weak areas, behavioral score output, and user answer quality. If a target company is implied by the job role or description, include company-specific weaknesses.
    
    Context:
    - Target Role: ${jobPosition}
    - Job/Company Info: ${sessionInfo?.jobDescription || 'N/A'}
    - Behavioral Scores: Eye Contact: ${sessionMetrics?.eyeContactScore || 'N/A'}%, Bad Postures: ${sessionMetrics?.badPostureCount || 'N/A'}, Hand Gestures: ${sessionMetrics?.handGestureCount || 'N/A'}
    
    Interview Details (Focus on items with lower ratings and the actionable feedback provided):
    ${JSON.stringify(feedbackData.map(f => ({ question: f.question, userAnswer: f.userAnswer, rating: f.rating, feedback: f.feedback })))}

    Convert identified weaknesses (Technical, Behavioral, Project-related) into actionable roadmap items.
    Return ONLY a JSON array, for example:
    [
      {
        "topic": "string",
        "category": "string (Technical / Behavioral / Project)",
        "description": "text (specific, actionable)",
        "priority": "High / Medium / Low",
        "company_tag": "string (optional, only if highly specific to the target company)"
      }
    ]`;

    const aiResult = await chatSession.sendMessage(prompt);
    let aiResponseText = aiResult.response.text();
    aiResponseText = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();

    const items = JSON.parse(aiResponseText);

    const insertedItems = [];
    for (const item of items) {
      const result = await db.insert(improvement_roadmap).values({
        userEmail,
        topic: item.topic,
        category: item.category,
        description: item.description,
        priority: item.priority,
        companyTag: item.company_tag || null,
        sourceInterviewId: sessionId,
        status: 'active',
        lastSeenScore: null,
      }).returning();
      insertedItems.push(result[0]);
    }

    return NextResponse.json({ success: true, items: insertedItems });
  } catch (error) {
    console.error('Roadmap update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
