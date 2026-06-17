import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword } from "@/lib/admin-auth";

// Rate limiting: store login attempts
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
};

function getRateLimitKey(req: NextRequest): string {
  return req.ip || "unknown";
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = loginAttempts.get(key);

  if (!record || now > record.resetTime) {
    loginAttempts.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    });
    return { allowed: true, remaining: RATE_LIMIT.maxAttempts - 1 };
  }

  if (record.count >= RATE_LIMIT.maxAttempts) {
    const remainingTime = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, remaining: remainingTime };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT.maxAttempts - record.count };
}

export async function POST(req: NextRequest) {
  try {
    const ip = getRateLimitKey(req);
    const rateLimit = checkRateLimit(ip);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: `Too many attempts. Try again in ${rateLimit.remaining} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { message: "Password required" },
        { status: 400 }
      );
    }

    // Verify admin password (supports both bcrypt hash and plain text)
    const isValid = await verifyAdminPassword(password);

    if (!isValid) {
      return NextResponse.json(
        { message: "Incorrect password" },
        { status: 401 }
      );
    }

    // ✅ Create secure session cookie
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
    });

    response.cookies.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logout successful",
    });

    response.cookies.set("admin_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Immediately expire
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Admin logout error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

