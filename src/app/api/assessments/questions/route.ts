import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Converts a flat array of question docs into a keyed bundle:
 * [ { _id, order, question, ... }, ... ] → { q1: {...}, q2: {...}, ... }
 */
function toBundle(questions: any[]): Record<string, any> {
  const sorted = [...questions].sort((a, b) => a.order - b.order);
  return sorted.reduce((acc, q, idx) => {
    acc[`q${idx + 1}`] = q;
    return acc;
  }, {} as Record<string, any>);
}


function validateQuestionPOWeights(questionPOs: Record<string, number>) {
  const totals: Record<string, number> = {};

  for (const key in questionPOs) {
    const value = Number(questionPOs[key] || 0);

    // key format: "0-A", "1-B"
    const parts = key.split('-');
    if (parts.length !== 2) continue;

    const po = parts[1]; // A, B, C, D

    if (!totals[po]) totals[po] = 0;
    totals[po] += value;
  }

  console.log('PO totals per category:', totals);

  for (const po in totals) {
    if (totals[po] !== 100) {
      return {
        valid: false,
        po,
        total: totals[po],
      };
    }
  }

  return { valid: true };
}

// ─────────────────────────────────────────────────────────────
// POST - Add a single question to an assessment
// ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { assessment_id, question, program_outcomes, order } = await req.json();

    if (!assessment_id || !question || !program_outcomes) {
      return NextResponse.json(
        { error: 'assessment_id, question, and program_outcomes are required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(assessment_id)) {
      return NextResponse.json({ error: 'Invalid assessment_id' }, { status: 400 });
    }

    if (typeof program_outcomes !== 'object' || Array.isArray(program_outcomes)) {
      return NextResponse.json(
        { error: 'program_outcomes must be a key-value object' },
        { status: 400 }
      );
    }

    // ❌ REMOVE OLD VALIDATION (DO NOT USE OBJECT KEYS HERE ANYMORE)

    // OPTIONAL: if you still want backend safety
    const db = await connectDB();
    const questions = db.collection('questions');

    const lastQuestion = await questions
      .find({ assessment_id: new ObjectId(assessment_id) })
      .sort({ order: -1 })
      .limit(1)
      .toArray();

    const nextOrder =
      order ?? (lastQuestion.length > 0 ? lastQuestion[0].order + 1 : 1);

    const result = await questions.insertOne({
      assessment_id: new ObjectId(assessment_id),
      question,
      program_outcomes,
      order: nextOrder,
      createdAt: new Date(),
    });

    console.log('Created question:', result.insertedId);

    return NextResponse.json(
      { message: 'Question created successfully', id: result.insertedId },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────
// GET - Fetch questions
//   ?id=...              → single question
//   ?assessment_id=...   → all questions for an assessment (returns bundle)
//   (no params)          → all questions
// ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const assessment_id = searchParams.get('assessment_id');

    const db = await connectDB();
    const questions = db.collection('questions');

    // Single question by ID
    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
      }

      const question = await questions.findOne({ _id: new ObjectId(id) });

      if (!question) {
        return NextResponse.json({ error: 'Question not found' }, { status: 404 });
      }

      return NextResponse.json(question, { status: 200 });
    }

    // All questions for a specific assessment — returned as a keyed bundle
    if (assessment_id) {
      if (!ObjectId.isValid(assessment_id)) {
        return NextResponse.json({ error: 'Invalid assessment_id' }, { status: 400 });
      }

      const docs = await questions
        .find({ assessment_id: new ObjectId(assessment_id) })
        .sort({ order: 1 })
        .toArray();

      return NextResponse.json(toBundle(docs), { status: 200 });
    }

    // All questions (admin/fallback)
    const all = await questions.find({}).sort({ assessment_id: 1, order: 1 }).toArray();
    return NextResponse.json(toBundle(all), { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────
// PUT - Update a single question by id (?id=...)
// ─────────────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
    }

    const { assessment_id, question, program_outcomes, order } = await req.json();

    if (!assessment_id || !question || !program_outcomes) {
      return NextResponse.json(
        { error: 'assessment_id, question, and program_outcomes are required' },
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

    if (!validateQuestionPOWeights(program_outcomes)) {
      const total = Object.values(program_outcomes as Record<string, number>).reduce((s, v) => s + v, 0);
      return NextResponse.json(
        { error: `PO weights must total 100. Current total: ${total}` },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const questions = db.collection('questions');

    const result = await questions.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          assessment_id: new ObjectId(assessment_id),
          question,
          program_outcomes,
          ...(order !== undefined && { order }),
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    console.log('Updated question:', id);
    return NextResponse.json(
      { message: 'Question updated successfully', question: result },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────
// DELETE - Delete a single question (?id=...)
//          or all questions for an assessment (?assessment_id=...)
// ─────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const assessment_id = searchParams.get('assessment_id');

    const db = await connectDB();
    const questions = db.collection('questions');

    // Delete all questions for an assessment
    if (assessment_id) {
      if (!ObjectId.isValid(assessment_id)) {
        return NextResponse.json({ error: 'Invalid assessment_id' }, { status: 400 });
      }

      const result = await questions.deleteMany({
        assessment_id: new ObjectId(assessment_id),
      });

      // Also cascade delete question_results for this assessment's questions
      const questionIds = await questions
        .find({ assessment_id: new ObjectId(assessment_id) })
        .toArray()
        .then((docs) => docs.map((d) => d._id));

      if (questionIds.length > 0) {
        await db.collection('question_results').deleteMany({
          question_id: { $in: questionIds },
        });
      }

      console.log(`Deleted ${result.deletedCount} questions for assessment:`, assessment_id);
      return NextResponse.json(
        { message: `${result.deletedCount} question(s) deleted successfully` },
        { status: 200 }
      );
    }

    // Delete single question by ID
    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
      }

      const result = await questions.findOneAndDelete({ _id: new ObjectId(id) });

      if (!result) {
        return NextResponse.json({ error: 'Question not found' }, { status: 404 });
      }

      // Cascade delete question_results for this question
      await db.collection('question_results').deleteMany({
        question_id: new ObjectId(id),
      });

      console.log('Deleted question:', id);
      return NextResponse.json(
        { message: 'Question deleted successfully' },
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

