import { NextResponse } from 'next/server';
import { db } from '../../../utils/db';
import { improvement_roadmap } from '../../../utils/schema';
import { eq, and, desc } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(req) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const userEmail = user.primaryEmailAddress.emailAddress;
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'active';

    const items = await db.select()
      .from(improvement_roadmap)
      .where(
        and(
          eq(improvement_roadmap.userEmail, userEmail),
          eq(improvement_roadmap.status, status)
        )
      )
      .orderBy(desc(improvement_roadmap.createdAt));

    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userEmail = user.primaryEmailAddress.emailAddress;
    
    const body = await req.json();
    
    const result = await db.insert(improvement_roadmap).values({
      userEmail,
      topic: body.topic,
      category: body.category || 'General',
      description: body.description || '',
      priority: body.priority || 'Medium',
      companyTag: body.companyTag || '',
      sourceInterviewId: body.sourceInterviewId || null,
      status: 'active',
      lastSeenScore: body.lastSeenScore || null,
    }).returning();
    
    return NextResponse.json({ success: true, item: result[0] });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userEmail = user.primaryEmailAddress.emailAddress;
    
    const { id, status } = await req.json();
    
    if (!id || !status) return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });

    const result = await db.update(improvement_roadmap)
      .set({ status, updatedAt: new Date().toISOString() })
      .where(and(eq(improvement_roadmap.id, id), eq(improvement_roadmap.userEmail, userEmail)))
      .returning();
      
    return NextResponse.json({ success: true, item: result[0] });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
