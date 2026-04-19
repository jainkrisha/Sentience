import { NextResponse } from 'next/server';
import { db } from '../../../../utils/db';
import { improvement_roadmap } from '../../../../utils/schema';
import { chatSession } from '../../../../utils/Geminimodel';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userEmail = user.primaryEmailAddress.emailAddress;

    const { feedbackData, sessionId } = await req.json();

    if (!feedbackData || feedbackData.length === 0) {
      return NextResponse.json({ error: 'Feedback data required' }, { status: 400 });
    }

    // Filter to only weak answers (rating < 6)
    const weakAnswers = feedbackData.filter(item => parseInt(item.rating) < 6);
    
    if (weakAnswers.length === 0) {
      return NextResponse.json({ success: true, message: 'No weak areas found' });
    }

    const prompt = `Analyze these weak interview answers.
    Convert them into actionable improvement roadmap items.
    Merge similar weaknesses into single concise topics.
    Return JSON format:
    [
      {
        "topic": "string",
        "category": "string (Technical / Behavioral / Project)",
        "description": "string",
        "priority": "High / Medium / Low",
        "company_tag": "string (optional)"
      }
    ]
    
    Data: ${JSON.stringify(weakAnswers)}`;

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
    console.error("Roadmap update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
