import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST - Assign a course to a faculty
export async function POST(req: NextRequest) {
  try {
    const { faculty_id, course_id, school_year, semester } = await req.json();

    if (!faculty_id || !course_id || !school_year || !semester) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!ObjectId.isValid(faculty_id) || !ObjectId.isValid(course_id)) {
      return NextResponse.json({ error: 'Invalid faculty_id or course_id' }, { status: 400 });
    }

    const db = await connectDB();
    const facultyCourses = db.collection('faculty_courses');

    // Prevent duplicate assignment for the same semester
    const existing = await facultyCourses.findOne({
      faculty_id: new ObjectId(faculty_id),
      course_id: new ObjectId(course_id),
      school_year,
      semester,
    });

    if (existing) {
      return NextResponse.json(
        { error: 'This course is already assigned to this faculty for the given semester' },
        { status: 409 }
      );
    }

    const result = await facultyCourses.insertOne({
      faculty_id: new ObjectId(faculty_id),
      course_id: new ObjectId(course_id),
      school_year,
      semester,
      createdAt: new Date(),
    });

    console.log('Assigned course to faculty:', result.insertedId);
    return NextResponse.json(
      { message: 'Course assigned to faculty successfully', id: result.insertedId },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// GET - Fetch all faculty_courses or a single one by id (?id=...)
//       Filter by faculty  (?faculty_id=...)
//       Filter by course   (?course_id=...)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const faculty_id = searchParams.get('faculty_id');
    const course_id = searchParams.get('course_id');

    const db = await connectDB();
    const facultyCourses = db.collection('faculty_courses');

    // Single record
    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
      }

      const record = await facultyCourses
        .aggregate([
          { $match: { _id: new ObjectId(id) } },
          {
            $lookup: {
              from: 'faculty',
              localField: 'faculty_id',
              foreignField: '_id',
              as: 'faculty',
            },
          },
          { $unwind: { path: '$faculty', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: 'courses',
              localField: 'course_id',
              foreignField: '_id',
              as: 'course',
            },
          },
          { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
        ])
        .toArray();

      if (!record.length) {
        return NextResponse.json({ error: 'Record not found' }, { status: 404 });
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // Build filter from optional query params
    const filter: Record<string, any> = {};

    if (faculty_id) {
      if (!ObjectId.isValid(faculty_id)) {
        return NextResponse.json({ error: 'Invalid faculty_id' }, { status: 400 });
      }
      filter.faculty_id = new ObjectId(faculty_id);
    }

    if (course_id) {
      if (!ObjectId.isValid(course_id)) {
        return NextResponse.json({ error: 'Invalid course_id' }, { status: 400 });
      }
      filter.course_id = new ObjectId(course_id);
    }

    const records = await facultyCourses
      .aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'faculty',
            localField: 'faculty_id',
            foreignField: '_id',
            as: 'faculty',
          },
        },
        { $unwind: { path: '$faculty', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'courses',
            localField: 'course_id',
            foreignField: '_id',
            as: 'course',
          },
        },
        { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    return NextResponse.json(records, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT - Update a faculty_course by id (?id=...)
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
    }

    const { faculty_id, course_id, school_year, semester } = await req.json();

    if (!faculty_id || !course_id || !school_year || !semester) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!ObjectId.isValid(faculty_id) || !ObjectId.isValid(course_id)) {
      return NextResponse.json({ error: 'Invalid faculty_id or course_id' }, { status: 400 });
    }

    const db = await connectDB();
    const facultyCourses = db.collection('faculty_courses');

    const result = await facultyCourses.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          faculty_id: new ObjectId(faculty_id),
          course_id: new ObjectId(course_id),
          school_year,
          semester,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    console.log('Updated faculty_course:', id);
    return NextResponse.json(
      { message: 'Faculty course updated successfully', faculty_course: result },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE - Remove a faculty_course by id (?id=...)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
    }

    const db = await connectDB();
    const facultyCourses = db.collection('faculty_courses');

    const result = await facultyCourses.findOneAndDelete({ _id: new ObjectId(id) });

    if (!result) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    console.log('Deleted faculty_course:', id);
    return NextResponse.json({ message: 'Faculty course deleted successfully' }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}