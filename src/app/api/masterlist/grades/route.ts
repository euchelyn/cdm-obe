import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST - Submit a grade for a student in a block
export async function POST(req: NextRequest) {
  try {
    const { block_id, student_id, grade, remarks } = await req.json();

    if (!block_id || !student_id || grade === undefined || grade === null) {
      return NextResponse.json({ error: 'block_id, student_id, and grade are required' }, { status: 400 });
    }

    if (!ObjectId.isValid(block_id) || !ObjectId.isValid(student_id)) {
      return NextResponse.json({ error: 'Invalid block_id or student_id' }, { status: 400 });
    }

    if (typeof grade !== 'number' || grade < 0 || grade > 5) {
      return NextResponse.json({ error: 'Grade must be a number between 0 and 5' }, { status: 400 });
    }

    const db = await connectDB();
    const grades = db.collection('grades');

    // Prevent duplicate grade for the same student in the same block
    const existing = await grades.findOne({
      block_id: new ObjectId(block_id),
      student_id: new ObjectId(student_id),
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A grade for this student in this block already exists. Use PUT to update it.' },
        { status: 409 }
      );
    }

    const result = await grades.insertOne({
      block_id: new ObjectId(block_id),
      student_id: new ObjectId(student_id),
      grade,
      remarks: remarks || deriveRemarks(grade),
      submitted_at: new Date(),
      createdAt: new Date(),
    });

    console.log('Submitted grade:', result.insertedId);
    return NextResponse.json(
      { message: 'Grade submitted successfully', id: result.insertedId },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// GET - Fetch all grades or a single grade by id (?id=...)
//       Filter by block    (?block_id=...)
//       Filter by student  (?student_id=...)
//       Filter by both     (?block_id=...&student_id=...)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const block_id = searchParams.get('block_id');
    const student_id = searchParams.get('student_id');

    const db = await connectDB();
    const grades = db.collection('grades');

    const aggregatePipeline = [
      {
        $lookup: {
          from: 'blocks',
          localField: 'block_id',
          foreignField: '_id',
          as: 'block',
        },
      },
      { $unwind: { path: '$block', preserveNullAndEmpty: true } },
      {
        $lookup: {
          from: 'students',
          localField: 'student_id',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: { path: '$student', preserveNullAndEmpty: true } },
      {
        $lookup: {
          from: 'faculty_courses',
          localField: 'block.faculty_course_id',
          foreignField: '_id',
          as: 'block.faculty_course',
        },
      },
      { $unwind: { path: '$block.faculty_course', preserveNullAndEmpty: true } },
      {
        $lookup: {
          from: 'courses',
          localField: 'block.faculty_course.course_id',
          foreignField: '_id',
          as: 'block.faculty_course.course',
        },
      },
      { $unwind: { path: '$block.faculty_course.course', preserveNullAndEmpty: true } },
    ];

    // Single record
    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
      }

      const record = await grades
        .aggregate([{ $match: { _id: new ObjectId(id) } }, ...aggregatePipeline])
        .toArray();

      if (!record.length) {
        return NextResponse.json({ error: 'Grade not found' }, { status: 404 });
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // Build filter from optional query params
    const filter: Record<string, any> = {};

    if (block_id) {
      if (!ObjectId.isValid(block_id)) {
        return NextResponse.json({ error: 'Invalid block_id' }, { status: 400 });
      }
      filter.block_id = new ObjectId(block_id);
    }

    if (student_id) {
      if (!ObjectId.isValid(student_id)) {
        return NextResponse.json({ error: 'Invalid student_id' }, { status: 400 });
      }
      filter.student_id = new ObjectId(student_id);
    }

    const records = await grades
      .aggregate([
        { $match: filter },
        ...aggregatePipeline,
        { $sort: { submitted_at: -1 } },
      ])
      .toArray();

    return NextResponse.json(records, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT - Update a grade by id (?id=...)
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
    }

    const { block_id, student_id, grade, remarks } = await req.json();

    if (!block_id || !student_id || grade === undefined || grade === null) {
      return NextResponse.json({ error: 'block_id, student_id, and grade are required' }, { status: 400 });
    }

    if (!ObjectId.isValid(block_id) || !ObjectId.isValid(student_id)) {
      return NextResponse.json({ error: 'Invalid block_id or student_id' }, { status: 400 });
    }

    if (typeof grade !== 'number' || grade < 0 || grade > 5) {
      return NextResponse.json({ error: 'Grade must be a number between 0 and 5' }, { status: 400 });
    }

    const db = await connectDB();
    const grades = db.collection('grades');

    const result = await grades.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          block_id: new ObjectId(block_id),
          student_id: new ObjectId(student_id),
          grade,
          remarks: remarks || deriveRemarks(grade),
          submitted_at: new Date(),
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Grade not found' }, { status: 404 });
    }

    console.log('Updated grade:', id);
    return NextResponse.json(
      { message: 'Grade updated successfully', grade: result },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE - Delete a grade by id (?id=...)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
    }

    const db = await connectDB();
    const grades = db.collection('grades');

    const result = await grades.findOneAndDelete({ _id: new ObjectId(id) });

    if (!result) {
      return NextResponse.json({ error: 'Grade not found' }, { status: 404 });
    }

    console.log('Deleted grade:', id);
    return NextResponse.json({ message: 'Grade deleted successfully' }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Helper - Auto-derive remarks from grade value (Philippine grading system)
function deriveRemarks(grade: number): string {
  if (grade === 0) return 'INCOMPLETE';
  if (grade <= 3.0) return 'PASSED';
  if (grade === 5.0) return 'FAILED';
  return 'PASSED';
}