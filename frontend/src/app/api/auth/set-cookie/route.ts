import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, user, refreshToken, rememberMe } = body;

    if (!token || !user) {
      return NextResponse.json(
        { error: 'Token and user are required' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 1 day

    // Set auth_token cookie
    cookieStore.set('auth_token', token, {
      httpOnly: false, // Needs to be accessible by client-side JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/',
    });

    // Set refresh token if provided
    if (refreshToken) {
      cookieStore.set('auth_refresh_token', refreshToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge,
        path: '/',
      });
    }

    // Set user data
    cookieStore.set('auth_user', JSON.stringify(user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/',
    });

    // Set remember me flag
    if (rememberMe) {
      cookieStore.set('remember_me', 'true', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge,
        path: '/',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting cookies:', error);
    return NextResponse.json(
      { error: 'Failed to set cookies' },
      { status: 500 }
    );
  }
}
