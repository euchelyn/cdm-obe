import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const { mis_id, name, email, contact_number } = await req.json();

    if (!mis_id || !name) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const db = await connectDB();
    const mis = db.collection('mis');

    const existingId = await mis.findOne({ mis_id });
    if (existingId) {
      return NextResponse.json({ error: 'MIS ID already exists' }, { status: 409 });
    }

    const existingEmail = await mis.findOne({ email });
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const result = await mis.insertOne({
      mis_id,
      name,
      email,
      contact_number,
      role: 'mis',
      is_active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { message: 'MIS user created successfully', id: result.insertedId },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const db = await connectDB();
    const mis = db.collection('mis');

    const { searchParams } = new URL(req.url);
    const mis_id = searchParams.get('mis_id');

    if (mis_id) {
      const member = await mis.findOne({ mis_id });
      if (!member) {
        return NextResponse.json({ error: 'MIS user not found' }, { status: 404 });
      }
      return NextResponse.json({ data: member }, { status: 200 });
    }

    const allMis = await mis.find({ is_active: true }).toArray();
    return NextResponse.json(
      { message: 'MIS users fetched successfully', data: allMis },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { mis_id, ...updates } = await req.json();

    if (!mis_id) {
      return NextResponse.json({ error: 'mis_id is required' }, { status: 400 });
    }

    const db = await connectDB();
    const mis = db.collection('mis');

    const existing = await mis.findOne({ mis_id });
    if (!existing) {
      return NextResponse.json({ error: 'MIS user not found' }, { status: 404 });
    }

    if (updates.email) {
      const emailTaken = await mis.findOne({
        email: updates.email,
        mis_id: { $ne: mis_id },
      });
      if (emailTaken) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
      }
    }

    const result = await mis.updateOne(
      { mis_id },
      { $set: { ...updates, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'MIS user not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'MIS user updated successfully' },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mis_id = searchParams.get('mis_id');

    if (!mis_id) {
      return NextResponse.json({ error: 'mis_id is required' }, { status: 400 });
    }

    const db = await connectDB();
    const mis = db.collection('mis');

    const existing = await mis.findOne({ mis_id });
    if (!existing) {
      return NextResponse.json({ error: 'MIS user not found' }, { status: 404 });
    }

    await mis.updateOne(
      { mis_id },
      { $set: { is_active: false, updatedAt: new Date() } }
    );

    return NextResponse.json(
      { message: 'MIS user deleted successfully' },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}