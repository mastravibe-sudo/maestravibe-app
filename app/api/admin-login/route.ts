import { NextRequest, NextResponse } from "next/server";

// POST function ke andar, cookie set karne se pehle ye add karo
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json({ message: 'ADMIN_PASSWORD not set' }, { status: 500 });
    }

    if (password !== adminPassword) {
      return NextResponse.json({ message: 'Incorrect password' }, { status: 401 });
    }

    // ✅ Fast Response + Cookie
    const response = NextResponse.json({ 
      success: true, 
      message: 'Login successful' 
    });

    response.cookies.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return response;

  } catch (err) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}