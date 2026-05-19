import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST - Create a new course
export async function POST(req: NextRequest) {
  try {
    const { version, program, code, course, year_level } = await req.json();

    if (!version || !program || !code || !course || !year_level) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const db = await connectDB();
    const courses = db.collection('courses');

    const existing = await courses.findOne({ code });
    if (existing) {
      return NextResponse.json({ error: 'Course code already exists' }, { status: 409 });
    }

    const result = await courses.insertOne({
      version,
      program,
      code,
      course,
      year_level,
      createdAt: new Date(),
    });

    console.log('Created course:', result.insertedId);
    return NextResponse.json(
      { message: 'Course created successfully', id: result.insertedId },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// GET - Fetch all courses or a single course by id (?id=...)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const db = await connectDB();
    const courses = db.collection('courses');

    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
      }

      const course = await courses.findOne({ _id: new ObjectId(id) });
      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }

      return NextResponse.json(course, { status: 200 });
    }

    const allCourses = await courses.find({}).toArray();
    return NextResponse.json(allCourses, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT - Update a course by id (?id=...)
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid course ID is required' }, { status: 400 });
    }

    const { version, program, code, course, year_level } = await req.json();

    if (!version || !program || !code || !course || !year_level) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const db = await connectDB();
    const courses = db.collection('courses');

    const result = await courses.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { version, program, code, course, year_level, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    console.log('Updated course:', id);
    return NextResponse.json(
      { message: 'Course updated successfully', course: result },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE - Delete a course by id (?id=...)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid course ID is required' }, { status: 400 });
    }

    const db = await connectDB();
    const courses = db.collection('courses');

    const result = await courses.findOneAndDelete({ _id: new ObjectId(id) });

    if (!result) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    console.log('Deleted course:', id);
    return NextResponse.json(
      { message: 'Course deleted successfully' },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}