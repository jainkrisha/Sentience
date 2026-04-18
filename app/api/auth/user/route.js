import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { usersTable } from '@/utils/schema';

export async function GET(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // For simplicity, we're not storing tokens in a separate table.
    // In production, you should verify the token against a tokens table.
    // For now, we'll just return success if token exists.
    
    return NextResponse.json(
      { authenticated: true, token },
      { status: 200 }
    );
  } catch (error) {
    console.error('User check error:', error);
    return NextResponse.json(
      { error: 'Failed to check user' },
      { status: 500 }
    );
  }
}
