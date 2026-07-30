import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { db } from "~/server/db";


export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email = String(body.email)
      .trim()
      .toLowerCase();

    const password = String(body.password);


    if (!email || !password) {
      return NextResponse.json(
        {
          error: "Email and password required",
        },
        {
          status: 400,
        }
      );
    }


    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    });


    if (existingUser) {
      return NextResponse.json(
        {
          error: "User already exists",
        },
        {
          status: 400,
        }
      );
    }


    const passwordHash = await bcrypt.hash(password, 12);


    const user = await db.user.create({
      data: {
        email,
        passwordHash,
      },

      select: {
        id: true,
        email: true,
      },
    });


    return NextResponse.json(user);

  } catch {
    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}