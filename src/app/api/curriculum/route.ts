import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

// GET /api/curriculum
export async function GET(req: NextRequest) {
  try {
    const db = await connectDB();
    const curriculum = db.collection('curriculum');
    const { searchParams } = new URL(req.url);
    const curriculum_id = searchParams.get('curriculum_id');
    const program = searchParams.get('program');

    if (curriculum_id) {
      const result = await curriculum.findOne({ curriculum_id });
      if (!result) {
        return NextResponse.json({ error: 'Curriculum not found' }, { status: 404 });
      }
      return NextResponse.json(result, { status: 200 });
    }

    if (program) {
      const result = await curriculum.find({ program }).toArray();
      return NextResponse.json(result, { status: 200 });
    }

    const all = await curriculum.find({}).toArray();
    return NextResponse.json(all, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/curriculum
export async function POST(req: NextRequest) {
  try {
    const { curriculum_id, program, courses, version } = await req.json();

    if (!curriculum_id || !program || !courses || !version) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!Array.isArray(courses) || courses.length === 0) {
      return NextResponse.json({ error: 'courses must be a non-empty array' }, { status: 400 });
    }

    const invalidCourse = courses.find(c => !c.year_level || !c.course_list || !Array.isArray(c.course_list));
    if (invalidCourse) {
      return NextResponse.json({ error: 'Each entry must have year_level and course_list array' }, { status: 400 });
    }

    const db = await connectDB();
    const curriculum = db.collection('curriculum');

    const existing = await curriculum.findOne({ curriculum_id });
    if (existing) {
      return NextResponse.json({ error: 'Curriculum with this ID already exists' }, { status: 409 });
    }

    const result = await curriculum.insertOne({
      curriculum_id,
      program,
      courses,
      version,
      date_created: new Date(),
    });

    return NextResponse.json(
      { message: 'Curriculum created successfully', id: result.insertedId },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
