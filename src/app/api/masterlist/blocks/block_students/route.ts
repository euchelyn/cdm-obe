import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST - Enroll a student into a block
export async function POST(req: NextRequest) {
  try {
    const { block_id, student_id } = await req.json();

    if (!block_id || !student_id) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!ObjectId.isValid(block_id) || !ObjectId.isValid(student_id)) {
      return NextResponse.json({ error: 'Invalid block_id or student_id' }, { status: 400 });
    }

    const db = await connectDB();
    const blockStudents = db.collection('block_students');

    // Prevent enrolling the same student twice in the same block
    const existing = await blockStudents.findOne({
      block_id: new ObjectId(block_id),
      student_id: new ObjectId(student_id),
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Student is already enrolled in this block' },
        { status: 409 }
      );
    }

    const result = await blockStudents.insertOne({
      block_id: new ObjectId(block_id),
      student_id: new ObjectId(student_id),
      createdAt: new Date(),
    });

    console.log('Enrolled student in block:', result.insertedId);
    return NextResponse.json(
      { message: 'Student enrolled in block successfully', id: result.insertedId },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// GET - Fetch all block_students or a single one by id (?id=...)
//       Filter by block    (?block_id=...)
//       Filter by student  (?student_id=...)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const block_id = searchParams.get('block_id');
    const student_id = searchParams.get('student_id');

    const db = await connectDB();
    const blockStudents = db.collection('block_students');

    // Single record
    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
      }

      const record = await blockStudents
        .aggregate([
          { $match: { _id: new ObjectId(id) } },
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
        ])
        .toArray();

      if (!record.length) {
        return NextResponse.json({ error: 'Record not found' }, { status: 404 });
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

    const records = await blockStudents
      .aggregate([
        { $match: filter },
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
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    return NextResponse.json(records, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT - Update a block_student record by id (?id=...)
//       e.g. move a student to a different block
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
    }

    const { block_id, student_id } = await req.json();

    if (!block_id || !student_id) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!ObjectId.isValid(block_id) || !ObjectId.isValid(student_id)) {
      return NextResponse.json({ error: 'Invalid block_id or student_id' }, { status: 400 });
    }

    const db = await connectDB();
    const blockStudents = db.collection('block_students');

    // Prevent duplicate if moving to a block the student is already in
    const duplicate = await blockStudents.findOne({
      _id: { $ne: new ObjectId(id) },
      block_id: new ObjectId(block_id),
      student_id: new ObjectId(student_id),
    });

    if (duplicate) {
      return NextResponse.json(
        { error: 'Student is already enrolled in this block' },
        { status: 409 }
      );
    }

    const result = await blockStudents.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          block_id: new ObjectId(block_id),
          student_id: new ObjectId(student_id),
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    console.log('Updated block_student:', id);
    return NextResponse.json(
      { message: 'Block student updated successfully', block_student: result },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE - Remove a student from a block by id (?id=...)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
    }

    const db = await connectDB();
    const blockStudents = db.collection('block_students');

    const result = await blockStudents.findOneAndDelete({ _id: new ObjectId(id) });

    if (!result) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    console.log('Removed student from block:', id);
    return NextResponse.json(
      { message: 'Student removed from block successfully' },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}