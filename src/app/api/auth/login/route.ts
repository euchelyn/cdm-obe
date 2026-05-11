import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { setSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const users = db.collection("users");

    const user = await users.findOne({ username });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const payload = {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
    };

    await setSession(payload);

    return NextResponse.json(
      {
        message: "Login successful",
        user: payload,
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: 500 }
    );
  }
}