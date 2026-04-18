import { db } from '@/utils/db';
import { usersTable } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

function hashPassword(password) {
  return crypto
    .createHash('sha256')
    .update(password + 'IPSUM_SALT')
    .digest('hex');
}

export async function POST(request) {
  try {
    const { email, password, action } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    if (action === 'signup') {
      try {
        // Check if user already exists
        const existingUser = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, email))
          .limit(1);

        if (existingUser.length > 0) {
          return NextResponse.json(
            { error: 'User already exists' },
            { status: 400 }
          );
        }

        // Hash password
        const hashedPassword = hashPassword(password);

        // Create new user
        const newUser = await db
          .insert(usersTable)
          .values({
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
          })
          .returning();

        // Create auth token
        const token = crypto.randomBytes(32).toString('hex');
        
        const response = NextResponse.json(
          { 
            success: true,
            user: {
              id: newUser[0].id,
              email: newUser[0].email
            }
          },
          { status: 201 }
        );
        
        response.cookies.set('auth_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60, // 30 days
        });

        response.cookies.set('user_email', email, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60,
        });

        return response;
      } catch (dbError) {
        console.error('Database error during signup:', dbError);
        return NextResponse.json(
          { error: 'Failed to create user. Please try again.' },
          { status: 500 }
        );
      }
    }

    if (action === 'signin') {
      try {
        // Find user
        const user = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, email))
          .limit(1);

        if (user.length === 0) {
          return NextResponse.json(
            { error: 'Invalid email or password' },
            { status: 401 }
          );
        }

        // Verify password
        const hashedPassword = hashPassword(password);

        if (user[0].password !== hashedPassword) {
          return NextResponse.json(
            { error: 'Invalid email or password' },
            { status: 401 }
          );
        }

        // Create auth token
        const token = crypto.randomBytes(32).toString('hex');

        const response = NextResponse.json(
          {
            success: true,
            user: {
              id: user[0].id,
              email: user[0].email
            }
          },
          { status: 200 }
        );

        response.cookies.set('auth_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60, // 30 days
        });

        response.cookies.set('user_email', email, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60,
        });

        return response;
      } catch (dbError) {
        console.error('Database error during signin:', dbError);
        return NextResponse.json(
          { error: 'Authentication failed. Please try again.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
