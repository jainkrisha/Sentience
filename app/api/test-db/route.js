import { db } from '@/utils/db';
import { usersTable } from '@/utils/schema';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    console.log('Testing database connection...');
    console.log('Database URL:', process.env.NEXT_PUBLIC_DRIZZLE_DB_URL?.substring(0, 50) + '...');
    
    // Try to query the users table
    const result = await db.select().from(usersTable).limit(1);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Database connection successful',
        userCount: result.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { 
        error: 'Database connection failed',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
