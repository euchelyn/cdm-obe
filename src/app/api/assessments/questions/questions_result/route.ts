import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Computes PO scores from question results for a student assessment.
 * Returns: { A: 80, B: 100, C: 60 }
 */
async function computePOScores(
  db: any,
  student_assessment_id: ObjectId
): Promise<Record<string, number>> {
  const results = await db
    .collection('question_results')
    .find({ student_assessment_id })
    .toArray();

  if (!results.length) return {};

  const questionIds = results.map((r: any) => r.question_id);
  const questions = await db
    .collection('questions')
    .find({ _id: { $in: questionIds } })
    .toArray();

  const questionMap = questions.reduce((acc: any, q: any) => {
    acc[q._id.toString()] = q;
    return acc;
  }, {});

  // Track correct count and total count per PO
  const poCorrect: Record<string, number> = {};
  const poTotal: Record<string, number> = {};

  results.forEach((r: any) => {
    const question = questionMap[r.question_id.toString()];
    if (!question) return;

    Object.entries(question.program_outcomes as Record<string, number>).forEach(([po, weight]) => {
      if (!poCorrect[po]) { poCorrect[po] = 0; poTotal[po] = 0; }
      poTotal[po] += weight;
      if (r.is_correct) poCorrect[po] += weight;
    });
  });

  // PO score = (correct weight / total weight) * 100
  const poScores: Record<string, number> = {};
  Object.keys(poTotal).forEach((po) => {
    poScores[po] = poTotal[po] > 0
      ? Math.round((poCorrect[po] / poTotal[po]) * 100)
      : 0;
  });

  return poScores;
}

// ─────────────────────────────────────────────────────────────
// POST - Submit a single question result
// ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { student_assessment_id, question_id, is_correct } = await req.json();

    if (!student_assessment_id || !question_id || is_correct === undefined) {
      return NextResponse.json(
        { error: 'student_assessment_id, question_id, and is_correct are required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(student_assessment_id) || !ObjectId.isValid(question_id)) {
      return NextResponse.json(
        { error: 'Invalid student_assessment_id or question_id' },
        { status: 400 }
      );
    }

    if (typeof is_correct !== 'boolean') {
      return NextResponse.json(
        { error: 'is_correct must be a boolean (true or false)' },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const questionResults = db.collection('question_results');

    // Prevent duplicate result for the same question in the same submission
    const existing = await questionResults.findOne({
      student_assessment_id: new ObjectId(student_assessment_id),
      question_id: new ObjectId(question_id),
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A result for this question already exists in this submission. Use PUT to update it.' },
        { status: 409 }
      );
    }

    const result = await questionResults.insertOne({
      student_assessment_id: new ObjectId(student_assessment_id),
      question_id: new ObjectId(question_id),
      is_correct,
      createdAt: new Date(),
    });

    // Compute updated PO scores after insert
    const poScores = await computePOScores(db, new ObjectId(student_assessment_id));

    console.log('Created question result:', result.insertedId);
    return NextResponse.json(
      {
        message: 'Question result submitted successfully',
        id: result.insertedId,
        po_scores: poScores,
      },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────
// GET - Fetch question results
//   ?id=...                      → single result
//   ?student_assessment_id=...   → all results for a submission (with PO scores)
//   ?question_id=...             → all results for a specific question across submissions
// ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const student_assessment_id = searchParams.get('student_assessment_id');
    const question_id = searchParams.get('question_id');

    const db = await connectDB();
    const questionResults = db.collection('question_results');

    // Single result by ID
    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
      }

      const result = await questionResults
        .aggregate([
          { $match: { _id: new ObjectId(id) } },
          {
            $lookup: {
              from: 'questions',
              localField: 'question_id',
              foreignField: '_id',
              as: 'question',
            },
          },
          { $unwind: { path: '$question', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: 'student_assessments',
              localField: 'student_assessment_id',
              foreignField: '_id',
              as: 'student_assessment',
            },
          },
          { $unwind: { path: '$student_assessment', preserveNullAndEmptyArrays: true } },
        ])
        .toArray();

      if (!result.length) {
        return NextResponse.json({ error: 'Result not found' }, { status: 404 });
      }

      return NextResponse.json(result[0], { status: 200 });
    }

    // All results for a student submission — includes computed PO scores
    if (student_assessment_id) {
      if (!ObjectId.isValid(student_assessment_id)) {
        return NextResponse.json({ error: 'Invalid student_assessment_id' }, { status: 400 });
      }

      const results = await questionResults
        .aggregate([
          { $match: { student_assessment_id: new ObjectId(student_assessment_id) } },
          {
            $lookup: {
              from: 'questions',
              localField: 'question_id',
              foreignField: '_id',
              as: 'question',
            },
          },
          { $unwind: { path: '$question', preserveNullAndEmptyArrays: true } },
          { $sort: { 'question.order': 1 } },
        ])
        .toArray();

      const poScores = await computePOScores(
        db,
        new ObjectId(student_assessment_id)
      );

      return NextResponse.json({ results, po_scores: poScores }, { status: 200 });
    }

    // All results for a specific question across all submissions
    if (question_id) {
      if (!ObjectId.isValid(question_id)) {
        return NextResponse.json({ error: 'Invalid question_id' }, { status: 400 });
      }

      const results = await questionResults
        .aggregate([
          { $match: { question_id: new ObjectId(question_id) } },
          {
            $lookup: {
              from: 'student_assessments',
              localField: 'student_assessment_id',
              foreignField: '_id',
              as: 'student_assessment',
            },
          },
          { $unwind: { path: '$student_assessment', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: 'students',
              localField: 'student_assessment.student_id',
              foreignField: '_id',
              as: 'student_assessment.student',
            },
          },
          { $unwind: { path: '$student_assessment.student', preserveNullAndEmptyArrays: true } },
          { $sort: { createdAt: -1 } },
        ])
        .toArray();

      const totalCount = results.length;
      const correctCount = results.filter((r: any) => r.is_correct).length;

      return NextResponse.json(
        {
          results,
          summary: {
            total: totalCount,
            correct: correctCount,
            incorrect: totalCount - correctCount,
            pass_rate: totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'At least one query param is required: id, student_assessment_id, or question_id' },
      { status: 400 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────
// PUT - Update a single question result by id (?id=...)
// ─────────────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
    }

    const { is_correct } = await req.json();

    if (is_correct === undefined || is_correct === null) {
      return NextResponse.json({ error: 'is_correct is required' }, { status: 400 });
    }

    if (typeof is_correct !== 'boolean') {
      return NextResponse.json(
        { error: 'is_correct must be a boolean (true or false)' },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const questionResults = db.collection('question_results');

    const result = await questionResults.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          is_correct,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 });
    }

    // Recompute PO scores after update
    const poScores = await computePOScores(db, result.student_assessment_id);

    console.log('Updated question result:', id);
    return NextResponse.json(
      {
        message: 'Question result updated successfully',
        question_result: result,
        po_scores: poScores,
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────
// DELETE - Delete a single result (?id=...)
//          or all results for a student submission (?student_assessment_id=...)
// ─────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const student_assessment_id = searchParams.get('student_assessment_id');

    const db = await connectDB();
    const questionResults = db.collection('question_results');

    // Delete all results for a student submission
    if (student_assessment_id) {
      if (!ObjectId.isValid(student_assessment_id)) {
        return NextResponse.json({ error: 'Invalid student_assessment_id' }, { status: 400 });
      }

      const result = await questionResults.deleteMany({
        student_assessment_id: new ObjectId(student_assessment_id),
      });

      console.log(`Deleted ${result.deletedCount} question results for submission:`, student_assessment_id);
      return NextResponse.json(
        { message: `${result.deletedCount} question result(s) deleted successfully` },
        { status: 200 }
      );
    }

    // Delete single result by ID
    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
      }

      const result = await questionResults.findOneAndDelete({ _id: new ObjectId(id) });

      if (!result) {
        return NextResponse.json({ error: 'Result not found' }, { status: 404 });
      }

      console.log('Deleted question result:', id);
      return NextResponse.json(
        { message: 'Question result deleted successfully' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Either id or student_assessment_id query param is required' },
      { status: 400 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}