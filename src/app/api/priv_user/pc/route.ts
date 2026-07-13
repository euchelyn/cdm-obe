import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const { program_chair_id, name, email, contact_number, department, program } = await req.json();

    if (!program_chair_id || !name) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const db = await connectDB();
    const programChair = db.collection('program_chair');

    const existingId = await programChair.findOne({ program_chair_id });
    if (existingId) {
      return NextResponse.json({ error: 'Program Chair ID already exists' }, { status: 409 });
    }

    const existingEmail = await programChair.findOne({ email });
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const result = await programChair.insertOne({
      program_chair_id,
      name,
      email,
      contact_number,
      department,
      program,
      role: 'program_chair',
      is_active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { message: 'Program Chair created successfully', id: result.insertedId },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const db = await connectDB();
    const programChair = db.collection('program_chair');

    const { searchParams } = new URL(req.url);
    const program_chair_id = searchParams.get('program_chair_id');

    if (program_chair_id) {
      const member = await programChair.findOne({ program_chair_id });
      if (!member) {
        return NextResponse.json({ error: 'Program Chair not found' }, { status: 404 });
      }
      return NextResponse.json({ data: member }, { status: 200 });
    }

    const allProgramChairs = await programChair.find({ is_active: true }).toArray();
    return NextResponse.json(
      { message: 'Program Chairs fetched successfully', data: allProgramChairs },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { program_chair_id, ...updates } = await req.json();

    if (!program_chair_id) {
      return NextResponse.json({ error: 'program_chair_id is required' }, { status: 400 });
    }

    const db = await connectDB();
    const programChair = db.collection('program_chair');

    const existing = await programChair.findOne({ program_chair_id });
    if (!existing) {
      return NextResponse.json({ error: 'Program Chair not found' }, { status: 404 });
    }

    if (updates.email) {
      const emailTaken = await programChair.findOne({
        email: updates.email,
        program_chair_id: { $ne: program_chair_id },
      });
      if (emailTaken) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
      }
    }

    const result = await programChair.updateOne(
      { program_chair_id },
      { $set: { ...updates, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Program Chair not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Program Chair updated successfully' },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const program_chair_id = searchParams.get('program_chair_id');

    if (!program_chair_id) {
      return NextResponse.json({ error: 'program_chair_id is required' }, { status: 400 });
    }

    const db = await connectDB();
    const programChair = db.collection('program_chair');

    const existing = await programChair.findOne({ program_chair_id });
    if (!existing) {
      return NextResponse.json({ error: 'Program Chair not found' }, { status: 404 });
    }

    await programChair.updateOne(
      { program_chair_id },
      { $set: { is_active: false, updatedAt: new Date() } }
    );

    return NextResponse.json(
      { message: 'Program Chair deleted successfully' },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}