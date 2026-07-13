import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

// GET /api/masterlist
export async function GET(req: NextRequest) {
  try {
    const db = await connectDB();
    const masterlist = db.collection('masterlist');
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const batch_year = searchParams.get('batch_year');
    const section = searchParams.get('section');

    if (id) {
      const result = await masterlist.findOne({ id });
      if (!result) {
        return NextResponse.json({ error: 'Masterlist record not found' }, { status: 404 });
      }
      return NextResponse.json(result, { status: 200 });
    }

    if (batch_year && section) {
      const result = await masterlist.find({ batch_year, section }).toArray();
      return NextResponse.json(result, { status: 200 });
    }

    if (batch_year) {
      const result = await masterlist.find({ batch_year }).toArray();
      return NextResponse.json(result, { status: 200 });
    }

    if (section) {
      const result = await masterlist.find({ section }).toArray();
      return NextResponse.json(result, { status: 200 });
    }

    const all = await masterlist.find({}).toArray();
    return NextResponse.json(all, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/masterlist
export async function POST(req: NextRequest) {
  try {
    const { id, section, students, batch_year } = await req.json();

    if (!id || !section || !students || !batch_year) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: 'students must be a non-empty array' }, { status: 400 });
    }

    const invalidStudent = students.find(
      (s) => !s.id || !s.student_id || !s.student_name || !s.obe_status
    );
    if (invalidStudent) {
      return NextResponse.json(
        { error: 'Each student must have an id, student_id, student_name, and obe_status' },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const masterlist = db.collection('masterlist');

    const existing = await masterlist.findOne({ id });
    if (existing) {
      return NextResponse.json(
        { error: 'Masterlist record with this ID already exists' },
        { status: 409 }
      );
    }

    const result = await masterlist.insertOne({
      id,
      section,
      students,
      batch_year,
      date_created: new Date(),
    });

    return NextResponse.json(
      { message: 'Masterlist record created successfully', id: result.insertedId },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}