import { NextResponse } from 'next/server';
import { db } from '../../../utils/db';
import { preparation_planner } from '../../../utils/schema';
import { eq } from 'drizzle-orm';

/** Read the user email from the cookie set at sign-in. */
function getUserEmail(req) {
  const cookie = req.cookies.get('user_email');
  return cookie?.value ? decodeURIComponent(cookie.value) : null;
}

export async function GET(req) {
  try {
    const userEmail = getUserEmail(req);
    if (!userEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const planners = await db.select().from(preparation_planner).where(eq(preparation_planner.userEmail, userEmail));

    if (planners.length === 0 || !planners[0].plannerJson) {
      return NextResponse.json({ planner: null });
    }

    const planner = JSON.parse(planners[0].plannerJson);
    return NextResponse.json({ planner, readinessBaseline: planners[0].readinessBaseline });
  } catch (error) {
    console.error('Planner GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
