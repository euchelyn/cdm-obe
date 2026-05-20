import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Computes PO scores from question results for a student assessment.
 * For each PO, sums the weights of correct questions mapped to it,
 * divided by the total weights of all questions mapped to it.
 * Returns: { A: 85, B: 90 }
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

  const poCorrect: Record<string, number> = {};
  const poTotal: Record<string, number> = {};

  results.forEach((r: any) => {
    const question = questionMap[r.question_id.toString()];
    if (!question) return;

    Object.entries(question.program_outcomes as Record<string, number>).forEach(
      ([po, weight]) => {
        if (!poCorrect[po]) { poCorrect[po] = 0; poTotal[po] = 0; }
        poTotal[po] += weight;
        if (r.is_correct) poCorrect[po] += weight;
      }
    );
  });

  const poScores: Record<string, number> = {};
  Object.keys(poTotal).forEach((po) => {
    poScores[po] = poTotal[po] > 0
      ? Math.round((poCorrect[po] / poTotal[po]) * 100)
      : 0;
  });

  return poScores;
}

/**
 * Builds the full aggregate pipeline for a question result,
 * joining question (with its program_outcomes) and student_assessment
 * (with student, block, and assessment).
 */
function buildAggregatePipeline(matchStage: object) {
  return [
    { $match: matchStage },
    // Join question
    {
      $lookup: {
        from: 'questions',
        localField: 'question_id',
        foreignField: '_id',
        as: 'question',
      },
    },
    { $unwind: { path: '$question', preserveNullAndEmptyArrays: true } },
    // Join student_assessment
    {
      $lookup: {
        from: 'student_assessments',
        localField: 'student_assessment_id',
        foreignField: '_id',
        as: 'student_assessment',
      },
    },
    { $unwind: { path: '$student_assessment', preserveNullAndEmptyArrays: true } },
    // Join student via student_assessment
    {
      $lookup: {
        from: 'students',
        localField: 'student_assessment.student_id',
        foreignField: '_id',
        as: 'student_assessment.student',
      },
    },
    { $unwind: { path: '$student_assessment.student', preserveNullAndEmptyArrays: true } },
    // Join block via student_assessment
    {
      $lookup: {
        from: 'blocks',
        localField: 'student_assessment.block_id',
        foreignField: '_id',
        as: 'student_assessment.block',
      },
    },
    { $unwind: { path: '$student_assessment.block', preserveNullAndEmptyArrays: true } },
    // Join assessment via student_assessment
    {
      $lookup: {
        from: 'assessments',
        localField: 'student_assessment.assessment_id',
        foreignField: '_id',
        as: 'student_assessment.assessment',
      },
    },
    { $unwind: { path: '$student_assessment.assessment', preserveNullAndEmptyArrays: true } },
  ];
}

// ─────────────────────────────────────────────────────────────
// POST - Submit a single question result
// ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { student_assessment_id, question_id, is_correct } = await req.json();

    if (!student_assessment_id || !question_id || is_correct === undefined || is_correct === null) {
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

    // Verify student_assessment exists
    const studentAssessment = await db
      .collection('student_assessments')
      .findOne({ _id: new ObjectId(student_assessment_id) });

    if (!studentAssessment) {
      return NextResponse.json(
        { error: 'student_assessment not found. Create it first.' },
        { status: 404 }
      );
    }

    // Verify question exists and belongs to the same assessment
    const question = await db
      .collection('questions')
      .findOne({ _id: new ObjectId(question_id) });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    if (question.assessment_id.toString() !== studentAssessment.assessment_id.toString()) {
      return NextResponse.json(
        { error: 'Question does not belong to the assessment of this submission' },
        { status: 400 }
      );
    }

    const questionResults = db.collection('question_results');

    // Prevent duplicate result for the same question in the same submission
    const existing = await questionResults.findOne({
      student_assessment_id: new ObjectId(student_assessment_id),
      question_id: new ObjectId(question_id),
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A result for this question already exists. Use PUT to update it.', existing_id: existing._id },
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
//   ?id=...                      → single result with full joins
//   ?student_assessment_id=...   → all results for a submission + PO scores
//   ?question_id=...             → all results for a question + pass rate summary
// ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const student_assessment_id = searchParams.get('student_assessment_id');
    const question_id = searchParams.get('question_id');

    const db = await connectDB();
    const questionResults = db.collection('question_results');

    // Single result by ID with full joins
    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
      }

      const result = await questionResults
        .aggregate(buildAggregatePipeline({ _id: new ObjectId(id) }))
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
          // Join question with its program_outcomes and order
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

      const poScores = await computePOScores(db, new ObjectId(student_assessment_id));

      return NextResponse.json(
        {
          results,
          po_scores: poScores,
          summary: {
            total: results.length,
            correct: results.filter((r: any) => r.is_correct).length,
            incorrect: results.filter((r: any) => !r.is_correct).length,
          },
        },
        { status: 200 }
      );
    }

    // All results for a specific question across all submissions + pass rate
    if (question_id) {
      if (!ObjectId.isValid(question_id)) {
        return NextResponse.json({ error: 'Invalid question_id' }, { status: 400 });
      }

      const results = await questionResults
        .aggregate(
          buildAggregatePipeline({ question_id: new ObjectId(question_id) })
        )
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
// DELETE - Delete results
//   ?id=...                      → delete single result
//   ?student_assessment_id=...   → delete all results for a submission
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