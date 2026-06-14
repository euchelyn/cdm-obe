import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// ─────────────────────────────────────────────────────────────
// POST - Submit a correction request
// ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { student_id, batch, program, name, data, status } = await req.json();

    if (!student_id || !batch || !program || !name || !data) {
      return NextResponse.json(
        { error: 'student_id, batch, program, name, and data are required' },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const corrections = db.collection('corrections');

    const result = await corrections.insertOne({
      student_id,
      batch,
      program,
      name,
      data,
      status: status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('Created correction:', result.insertedId);
    return NextResponse.json(
      { message: 'Correction request submitted successfully', id: result.insertedId },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────
// GET - Fetch corrections
//   ?id=...          → single correction by ID
//   ?student_id=...  → all corrections for a student
//   ?program=...     → all corrections for a program
//   ?status=...      → filter by status (pending, approved, rejected)
//   ?program=...&status=... → filter by both
//   ?count=true      → return count instead of documents
//   ?count=true&program=... → count filtered by program
//   ?count=true&status=...  → count filtered by status
//   ?count=true&program=...&status=... → count filtered by both
// ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const student_id = searchParams.get('student_id');
    const program = searchParams.get('program');
    const status = searchParams.get('status');
    const count = searchParams.get('count');

    const db = await connectDB();
    const corrections = db.collection('corrections');

    // ─── Single record ────────────────────────────────────────
    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
      }

      const correction = await corrections.findOne({ _id: new ObjectId(id) });

      if (!correction) {
        return NextResponse.json({ error: 'Correction not found' }, { status: 404 });
      }

      return NextResponse.json(correction, { status: 200 });
    }

    // ─── Build filter ─────────────────────────────────────────
    const filter: Record<string, any> = {};

    if (student_id) filter.student_id = student_id;
    if (program) filter.program = program;
    if (status) filter.status = status;

    // ─── Count mode ───────────────────────────────────────────
    if (count === 'true') {
      const total = await corrections.countDocuments(filter);
      return NextResponse.json({ count: total, filter }, { status: 200 });
    }

    // ─── List mode ────────────────────────────────────────────
    const records = await corrections
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(records, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────
// PUT - Update a correction by id (?id=...)
//       Mainly used to update status (pending → approved/rejected)
//       or update the correction data
// ─────────────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
    }

    const { student_id, batch, program, name, data, status } = await req.json();

    if (!student_id || !batch || !program || !name || !data || !status) {
      return NextResponse.json(
        { error: 'student_id, batch, program, name, data, and status are required' },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const corrections = db.collection('corrections');

    const result = await corrections.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          student_id,
          batch,
          program,
          name,
          data,
          status,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Correction not found' }, { status: 404 });
    }

    console.log('Updated correction:', id);
    return NextResponse.json(
      { message: 'Correction updated successfully', correction: result },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────
// DELETE - Delete a correction by id (?id=...)
// ─────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
    }

    const db = await connectDB();
    const corrections = db.collection('corrections');

    const result = await corrections.findOneAndDelete({ _id: new ObjectId(id) });

    if (!result) {
      return NextResponse.json({ error: 'Correction not found' }, { status: 404 });
    }

    console.log('Deleted correction:', id);
    return NextResponse.json(
      { message: 'Correction deleted successfully' },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}