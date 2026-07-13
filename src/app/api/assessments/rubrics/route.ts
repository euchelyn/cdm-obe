import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Validates that PO weights in a rubric sum to 100.
 * program_outcomes: { A: 60, B: 40 } → valid
 * program_outcomes: { A: 60, B: 60 } → invalid
 */
function validatePOWeights(program_outcomes: Record<string, number>): boolean {
  if (typeof program_outcomes !== 'object' || !program_outcomes) return false;

  return Object.entries(program_outcomes).every(([key, value]) => {
    return typeof key === 'string' && typeof value === 'number' && value >= 0;
  });
}
/**
 * Validates that levels has exactly the four required keys.
 */
function validateLevels(levels: Record<string, string>): boolean {
  const required = ['excellent', 'good', 'fair', 'poor'];
  return required.every((key) => key in levels && typeof levels[key] === 'string' && levels[key].trim() !== '');
}

/**
 * Converts a flat array of rubric docs into a keyed bundle:
 * [ { _id, order, criteria, ... }, ... ] → { r1: {...}, r2: {...}, ... }
 */
function toBundle(rubrics: any[]): Record<string, any> {
  const sorted = [...rubrics].sort((a, b) => a.order - b.order);
  return sorted.reduce((acc, r, idx) => {
    acc[`r${idx + 1}`] = r;
    return acc;
  }, {} as Record<string, any>);
}

// ─────────────────────────────────────────────────────────────
// POST - Add a single rubric criteria to an assessment
// ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { assessment_id, criteria, program_outcomes, levels, order } = await req.json();

    if (!assessment_id || !criteria || !program_outcomes || !levels) {
      return NextResponse.json(
        { error: 'assessment_id, criteria, program_outcomes, and levels are required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(assessment_id)) {
      return NextResponse.json({ error: 'Invalid assessment_id' }, { status: 400 });
    }

    if (typeof program_outcomes !== 'object' || Array.isArray(program_outcomes)) {
      return NextResponse.json(
        { error: 'program_outcomes must be a key-value object e.g. { "A": 60, "B": 40 }' },
        { status: 400 }
      );
    }

    if (!validatePOWeights(program_outcomes)) {
      const total = Object.values(program_outcomes as Record<string, number>).reduce((s, v) => s + v, 0);
      return NextResponse.json(
        { error: `PO weights must total 100. Current total: ${total}` },
        { status: 400 }
      );
    }

    if (typeof levels !== 'object' || Array.isArray(levels)) {
      return NextResponse.json(
        { error: 'levels must be an object with keys: excellent, good, fair, poor' },
        { status: 400 }
      );
    }

    if (!validateLevels(levels)) {
      return NextResponse.json(
        { error: 'levels must contain non-empty values for: excellent, good, fair, poor' },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const rubrics = db.collection('rubrics');

    // Auto-assign order if not provided
    const lastRubric = await rubrics
      .find({ assessment_id: new ObjectId(assessment_id) })
      .sort({ order: -1 })
      .limit(1)
      .toArray();

    const nextOrder = order ?? (lastRubric.length > 0 ? lastRubric[0].order + 1 : 1);

    const result = await rubrics.insertOne({
      assessment_id: new ObjectId(assessment_id),
      criteria,
      program_outcomes,
      levels,
      order: nextOrder,
      createdAt: new Date(),
    });

    console.log('Created rubric:', result.insertedId);
    return NextResponse.json(
      { message: 'Rubric created successfully', id: result.insertedId },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────
// GET - Fetch rubrics
//   ?id=...              → single rubric
//   ?assessment_id=...   → all rubrics for an assessment (returns bundle)
//   (no params)          → all rubrics
// ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const assessment_id = searchParams.get('assessment_id');

    const db = await connectDB();
    const rubrics = db.collection('rubrics');

    // Single rubric by ID
    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
      }

      const rubric = await rubrics.findOne({ _id: new ObjectId(id) });

      if (!rubric) {
        return NextResponse.json({ error: 'Rubric not found' }, { status: 404 });
      }

      return NextResponse.json(rubric, { status: 200 });
    }

    // All rubrics for a specific assessment — returned as a keyed bundle
    if (assessment_id) {
      if (!ObjectId.isValid(assessment_id)) {
        return NextResponse.json({ error: 'Invalid assessment_id' }, { status: 400 });
      }

      const docs = await rubrics
        .find({ assessment_id: new ObjectId(assessment_id) })
        .sort({ order: 1 })
        .toArray();

      return NextResponse.json(toBundle(docs), { status: 200 });
    }

    // All rubrics (admin/fallback)
    const all = await rubrics.find({}).sort({ assessment_id: 1, order: 1 }).toArray();
    return NextResponse.json(toBundle(all), { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────
// PUT - Update a single rubric by id (?id=...)
// ─────────────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
    }

    const { assessment_id, criteria, program_outcomes, levels, order } = await req.json();

    if (!assessment_id || !criteria || !program_outcomes || !levels) {
      return NextResponse.json(
        { error: 'assessment_id, criteria, program_outcomes, and levels are required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(assessment_id)) {
      return NextResponse.json({ error: 'Invalid assessment_id' }, { status: 400 });
    }

    if (typeof program_outcomes !== 'object' || Array.isArray(program_outcomes)) {
      return NextResponse.json(
        { error: 'program_outcomes must be a key-value object e.g. { "A": 60, "B": 40 }' },
        { status: 400 }
      );
    }

    if (!validatePOWeights(program_outcomes)) {
      const total = Object.values(program_outcomes as Record<string, number>).reduce((s, v) => s + v, 0);
      return NextResponse.json(
        { error: `PO weights must total 100. Current total: ${total}` },
        { status: 400 }
      );
    }

    if (typeof levels !== 'object' || Array.isArray(levels)) {
      return NextResponse.json(
        { error: 'levels must be an object with keys: excellent, good, fair, poor' },
        { status: 400 }
      );
    }

    if (!validateLevels(levels)) {
      return NextResponse.json(
        { error: 'levels must contain non-empty values for: excellent, good, fair, poor' },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const rubrics = db.collection('rubrics');

    const result = await rubrics.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          assessment_id: new ObjectId(assessment_id),
          criteria,
          program_outcomes,
          levels,
          ...(order !== undefined && { order }),
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Rubric not found' }, { status: 404 });
    }

    console.log('Updated rubric:', id);
    return NextResponse.json(
      { message: 'Rubric updated successfully', rubric: result },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────
// DELETE - Delete a single rubric (?id=...)
//          or all rubrics for an assessment (?assessment_id=...)
// ─────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const assessment_id = searchParams.get('assessment_id');

    const db = await connectDB();
    const rubrics = db.collection('rubrics');

    // Delete all rubrics for an assessment
    if (assessment_id) {
      if (!ObjectId.isValid(assessment_id)) {
        return NextResponse.json({ error: 'Invalid assessment_id' }, { status: 400 });
      }

      // Get rubric IDs before deleting for cascade
      const rubricDocs = await rubrics
        .find({ assessment_id: new ObjectId(assessment_id) })
        .toArray();

      const rubricIds = rubricDocs.map((r) => r._id);

      await rubrics.deleteMany({ assessment_id: new ObjectId(assessment_id) });

      // Cascade delete rubric_results
      if (rubricIds.length > 0) {
        await db.collection('rubric_results').deleteMany({
          rubric_id: { $in: rubricIds },
        });
      }

      console.log(`Deleted ${rubricIds.length} rubrics for assessment:`, assessment_id);
      return NextResponse.json(
        { message: `${rubricIds.length} rubric(s) deleted successfully` },
        { status: 200 }
      );
    }

    // Delete single rubric by ID
    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
      }

      const result = await rubrics.findOneAndDelete({ _id: new ObjectId(id) });

      if (!result) {
        return NextResponse.json({ error: 'Rubric not found' }, { status: 404 });
      }

      // Cascade delete rubric_results for this rubric
      await db.collection('rubric_results').deleteMany({
        rubric_id: new ObjectId(id),
      });

      console.log('Deleted rubric:', id);
      return NextResponse.json(
        { message: 'Rubric deleted successfully' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Either id or assessment_id query param is required' },
      { status: 400 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}