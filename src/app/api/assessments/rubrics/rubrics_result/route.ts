import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const LEVEL_SCORES: Record<string, number> = {
  excellent: 100,
  good: 85,
  fair: 70,
  poor: 50,
};

const VALID_LEVELS = Object.keys(LEVEL_SCORES);

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Computes PO scores from rubric results for a student assessment.
 * Each rubric has program_outcomes: { A: 60, B: 40 }
 * PO score = weighted average of rubric scores mapped to that PO
 * Returns: { A: 85, B: 92, G: 70 }
 */
async function computePOScores(
  db: any,
  student_assessment_id: ObjectId
): Promise<Record<string, number>> {
  const results = await db
    .collection('rubric_results')
    .find({ student_assessment_id })
    .toArray();

  if (!results.length) return {};

  const rubricIds = results.map((r: any) => r.rubric_id);
  const rubrics = await db
    .collection('rubrics')
    .find({ _id: { $in: rubricIds } })
    .toArray();

  const rubricMap = rubrics.reduce((acc: any, r: any) => {
    acc[r._id.toString()] = r;
    return acc;
  }, {});

  // Track weighted score and weight total per PO
  const poWeightedScore: Record<string, number> = {};
  const poWeightTotal: Record<string, number> = {};

  results.forEach((r: any) => {
    const rubric = rubricMap[r.rubric_id.toString()];
    if (!rubric) return;

    const levelScore = LEVEL_SCORES[r.level] ?? 0;

    Object.entries(rubric.program_outcomes as Record<string, number>).forEach(
      ([po, weight]) => {
        if (!poWeightedScore[po]) {
          poWeightedScore[po] = 0;
          poWeightTotal[po] = 0;
        }
        poWeightedScore[po] += levelScore * (weight / 100);
        poWeightTotal[po] += weight;
      }
    );
  });

  // Normalize to 0-100
  const poScores: Record<string, number> = {};
  Object.keys(poWeightTotal).forEach((po) => {
    poScores[po] =
      poWeightTotal[po] > 0
        ? Math.round((poWeightedScore[po] / (poWeightTotal[po] / 100)) * 100) / 100
        : 0;
  });

  return poScores;
}

// ─────────────────────────────────────────────────────────────
// POST - Submit a single rubric result
// ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { student_assessment_id, rubric_id, level } = await req.json();

    if (!student_assessment_id || !rubric_id || !level) {
      return NextResponse.json(
        { error: 'student_assessment_id, rubric_id, and level are required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(student_assessment_id) || !ObjectId.isValid(rubric_id)) {
      return NextResponse.json(
        { error: 'Invalid student_assessment_id or rubric_id' },
        { status: 400 }
      );
    }

    if (!VALID_LEVELS.includes(level)) {
      return NextResponse.json(
        { error: `level must be one of: ${VALID_LEVELS.join(', ')}` },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const rubricResults = db.collection('rubric_results');

    // Prevent duplicate result for the same rubric in the same submission
    const existing = await rubricResults.findOne({
      student_assessment_id: new ObjectId(student_assessment_id),
      rubric_id: new ObjectId(rubric_id),
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            'A result for this rubric already exists in this submission. Use PUT to update it.',
        },
        { status: 409 }
      );
    }

    const score = LEVEL_SCORES[level];

    const result = await rubricResults.insertOne({
      student_assessment_id: new ObjectId(student_assessment_id),
      rubric_id: new ObjectId(rubric_id),
      level,
      score,
      createdAt: new Date(),
    });

    // Compute updated PO scores after insert
    const poScores = await computePOScores(db, new ObjectId(student_assessment_id));

    console.log('Created rubric result:', result.insertedId);
    return NextResponse.json(
      {
        message: 'Rubric result submitted successfully',
        id: result.insertedId,
        score,
        po_scores: poScores,
      },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────
// GET - Fetch rubric results
//   ?id=...                      → single result with joins
//   ?student_assessment_id=...   → all results for a submission + PO scores
//   ?rubric_id=...               → all results for a specific rubric + level distribution
// ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const student_assessment_id = searchParams.get('student_assessment_id');
    const rubric_id = searchParams.get('rubric_id');

    const db = await connectDB();
    const rubricResults = db.collection('rubric_results');

    // Single result by ID
    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
      }

      const result = await rubricResults
        .aggregate([
          { $match: { _id: new ObjectId(id) } },
          {
            $lookup: {
              from: 'rubrics',
              localField: 'rubric_id',
              foreignField: '_id',
              as: 'rubric',
            },
          },
          { $unwind: { path: '$rubric', preserveNullAndEmptyArrays: true } },
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
          {
            $unwind: {
              path: '$student_assessment.student',
              preserveNullAndEmptyArrays: true,
            },
          },
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

      const results = await rubricResults
        .aggregate([
          { $match: { student_assessment_id: new ObjectId(student_assessment_id) } },
          {
            $lookup: {
              from: 'rubrics',
              localField: 'rubric_id',
              foreignField: '_id',
              as: 'rubric',
            },
          },
          { $unwind: { path: '$rubric', preserveNullAndEmptyArrays: true } },
          { $sort: { 'rubric.order': 1 } },
        ])
        .toArray();

      const poScores = await computePOScores(
        db,
        new ObjectId(student_assessment_id)
      );

      return NextResponse.json({ results, po_scores: poScores }, { status: 200 });
    }

    // All results for a specific rubric — includes level distribution summary
    if (rubric_id) {
      if (!ObjectId.isValid(rubric_id)) {
        return NextResponse.json({ error: 'Invalid rubric_id' }, { status: 400 });
      }

      const results = await rubricResults
        .aggregate([
          { $match: { rubric_id: new ObjectId(rubric_id) } },
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
          {
            $unwind: {
              path: '$student_assessment.student',
              preserveNullAndEmptyArrays: true,
            },
          },
          { $sort: { createdAt: -1 } },
        ])
        .toArray();

      // Level distribution: { excellent: 5, good: 10, fair: 3, poor: 2 }
      const distribution = VALID_LEVELS.reduce((acc, lvl) => {
        acc[lvl] = results.filter((r: any) => r.level === lvl).length;
        return acc;
      }, {} as Record<string, number>);

      const totalCount = results.length;
      const averageScore =
        totalCount > 0
          ? Math.round(
              results.reduce((sum: number, r: any) => sum + (r.score ?? 0), 0) / totalCount
            )
          : 0;

      return NextResponse.json(
        {
          results,
          summary: {
            total: totalCount,
            average_score: averageScore,
            distribution,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        error:
          'At least one query param is required: id, student_assessment_id, or rubric_id',
      },
      { status: 400 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────
// PUT - Update a single rubric result by id (?id=...)
// ─────────────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
    }

    const { level } = await req.json();

    if (!level) {
      return NextResponse.json({ error: 'level is required' }, { status: 400 });
    }

    if (!VALID_LEVELS.includes(level)) {
      return NextResponse.json(
        { error: `level must be one of: ${VALID_LEVELS.join(', ')}` },
        { status: 400 }
      );
    }

    const score = LEVEL_SCORES[level];

    const db = await connectDB();
    const rubricResults = db.collection('rubric_results');

    const result = await rubricResults.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          level,
          score,
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

    console.log('Updated rubric result:', id);
    return NextResponse.json(
      {
        message: 'Rubric result updated successfully',
        rubric_result: result,
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
    const rubricResults = db.collection('rubric_results');

    // Delete all results for a student submission
    if (student_assessment_id) {
      if (!ObjectId.isValid(student_assessment_id)) {
        return NextResponse.json({ error: 'Invalid student_assessment_id' }, { status: 400 });
      }

      const result = await rubricResults.deleteMany({
        student_assessment_id: new ObjectId(student_assessment_id),
      });

      console.log(
        `Deleted ${result.deletedCount} rubric results for submission:`,
        student_assessment_id
      );
      return NextResponse.json(
        { message: `${result.deletedCount} rubric result(s) deleted successfully` },
        { status: 200 }
      );
    }

    // Delete single result by ID
    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
      }

      const result = await rubricResults.findOneAndDelete({ _id: new ObjectId(id) });

      if (!result) {
        return NextResponse.json({ error: 'Result not found' }, { status: 404 });
      }

      console.log('Deleted rubric result:', id);
      return NextResponse.json(
        { message: 'Rubric result deleted successfully' },
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