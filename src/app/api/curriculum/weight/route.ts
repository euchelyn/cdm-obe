import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

// GET /api/curriculum/weight
export async function GET(req: NextRequest) {
  try {
    const db = await connectDB();
    const weightsCollection = db.collection('curriculum_weights');
    const { searchParams } = new URL(req.url);

    const weight_id = searchParams.get('weight_id');
    const program = searchParams.get('program');

    if (weight_id) {
      const result = await weightsCollection.findOne({ weight_id });
      if (!result) {
        return NextResponse.json({ error: 'Weight not found' }, { status: 404 });
      }
      return NextResponse.json(result, { status: 200 });
    }

    if (program) {
      const result = await weightsCollection.find({ program }).toArray();
      return NextResponse.json(result, { status: 200 });
    }

    const all = await weightsCollection.find({}).toArray();
    return NextResponse.json(all, { status: 200 });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/curriculum/weight
export async function POST(req: NextRequest) {
  try {
    const { weight_id, program, version, weights } = await req.json();

    // Basic validation
    if (!weight_id || !program || !version || !weights) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(weights) || weights.length === 0) {
      return NextResponse.json(
        { error: 'weights must be a non-empty array' },
        { status: 400 }
      );
    }

    // Validate each PO block
    for (const w of weights) {
      if (!w.po_id || !Array.isArray(w.courses) || w.courses.length === 0) {
        return NextResponse.json(
          { error: 'Each weight must have po_id and non-empty courses array' },
          { status: 400 }
        );
      }

      for (const c of w.courses) {
        if (!c.course_name || typeof c.weight !== 'number') {
          return NextResponse.json(
            { error: 'Each course must have course_name and numeric weight' },
            { status: 400 }
          );
        }
      }

      // Optional: enforce total = 100 per PO
      const total = w.courses.reduce((sum: number, c: any) => sum + c.weight, 0);
      if (total !== 100) {
        return NextResponse.json(
          { error: `Weights for PO ${w.po_id} must total 100` },
          { status: 400 }
        );
      }
    }

    const db = await connectDB();
    const weightsCollection = db.collection('curriculum_weights');

    const existing = await weightsCollection.findOne({ weight_id });
    if (existing) {
      return NextResponse.json(
        { error: 'Weight with this ID already exists' },
        { status: 409 }
      );
    }

    const result = await weightsCollection.insertOne({
      weight_id,
      program,
      version,
      weights,
      date_created: new Date(),
    });

    return NextResponse.json(
      {
        message: 'Curriculum weight created successfully',
        id: result.insertedId,
      },
      { status: 201 }
    );

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}