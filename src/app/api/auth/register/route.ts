import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const { username, password, role } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const db = await connectDB();
    const users = db.collection('users');

    const existing = await users.findOne({ username });
    if (existing) return NextResponse.json({ error: 'Username already registered' }, { status: 409 });

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await users.insertOne({
      username,
      password: hashedPassword,
      role,
      createdAt: new Date(),
    });

    console.log("Request API: " + result.insertedId);
    return NextResponse.json(
      { message: 'User registered successfully', id: result.insertedId },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const db = await connectDB();
    const { searchParams } = new URL(req.url);

    const user_account_id = searchParams.get('user_account_id');

    if (!user_account_id) {
      return NextResponse.json(
        { error: 'user_account_id is required' },
        { status: 400 }
      );
    }

    const users = db.collection('users');

    let result;

    // 🔥 safe ObjectId handling
    try {
      result = await users.deleteOne({
        _id: new ObjectId(user_account_id),
      });
    } catch {
      return NextResponse.json(
        { error: 'Invalid user_account_id format' },
        { status: 400 }
      );
    }

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User deleted successfully',
      id: user_account_id,
    });

  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: 500 }
    );
  }
}