import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { db } from "~/server/db";
import { getClientIp, ipRateLimit } from "~/lib/rateLimit";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// 10 registrations / minute per IP — matches the tRPC auth.register limit.
const REGISTER_LIMIT = { windowMs: 60_000, max: 10 };

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const limited = ipRateLimit(ip, REGISTER_LIMIT, "register");
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSeconds) },
      },
    );
  }

  try {
    const parsed = registerSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const email = parsed.data.email.trim().toLowerCase();

    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    const user = await db.user.create({
      data: {
        email,
        passwordHash,
      },
    });

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
