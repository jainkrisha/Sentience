import { NextResponse } from 'next/server';
import { db } from '../../../utils/db';
import { target_companies } from '../../../utils/schema';
import { eq, and } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(req) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userEmail = user.primaryEmailAddress.emailAddress;

    const companies = await db.select()
      .from(target_companies)
      .where(and(eq(target_companies.userEmail, userEmail), eq(target_companies.active, true)));

    return NextResponse.json({ companies });
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
    
    const result = await db.insert(target_companies).values({
      userEmail,
      companyName: body.companyName,
      roleName: body.roleName || '',
      priorityLevel: body.priorityLevel || 'Medium',
      active: true,
    }).returning();
    
    return NextResponse.json({ success: true, company: result[0] });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userEmail = user.primaryEmailAddress.emailAddress;
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    await db.update(target_companies)
      .set({ active: false })
      .where(and(eq(target_companies.id, parseInt(id)), eq(target_companies.userEmail, userEmail)));
      
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
