import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const LEVEL_SCORES: Record<string, number> = {
  excellent: 100,
  good: 85,
  fair: 70,
  poor: 50,
};

/**
 * Computes PO scores for a student assessment.
 * Handles both final_exam and rubric types automatically
 * based on the assessment type.
 */
async function computePOScores(
  db: any,
  student_assessment_id: ObjectId,
  assessment_type: string
): Promise<Record<string, number>> {
  if (assessment_type === 'final_exam') {
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

  if (assessment_type === 'rubric') {
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

    const poScores: Record<string, number> = {};
    Object.keys(poWeightTotal).forEach((po) => {
      poScores[po] =
        poWeightTotal[po] > 0
          ? Math.round((poWeightedScore[po] / (poWeightTotal[po] / 100)) * 100) / 100
          : 0;
    });

    return poScores;
  }

  return {};
}

// ─────────────────────────────────────────────────────────────
// POST - Create a student assessment submission record
// ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { assessment_id, block_id, student_id } = await req.json();

    if (!assessment_id || !block_id || !student_id) {
      return NextResponse.json(
        { error: 'assessment_id, block_id, and student_id are required' },
        { status: 400 }
      );
    }

    if (
      !ObjectId.isValid(assessment_id) ||
      !ObjectId.isValid(block_id) ||
      !ObjectId.isValid(student_id)
    ) {
      return NextResponse.json(
        { error: 'Invalid assessment_id, block_id, or student_id' },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const studentAssessments = db.collection('student_assessments');

    // Prevent duplicate submission for same student in same assessment and block
    const existing = await studentAssessments.findOne({
      assessment_id: new ObjectId(assessment_id),
      block_id: new ObjectId(block_id),
      student_id: new ObjectId(student_id),
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            'A submission already exists for this student in this assessment. Use PUT to update it.',
          existing_id: existing._id,
        },
        { status: 409 }
      );
    }

    const result = await studentAssessments.insertOne({
      assessment_id: new ObjectId(assessment_id),
      block_id: new ObjectId(block_id),
      student_id: new ObjectId(student_id),
      submitted_at: new Date(),
      createdAt: new Date(),
    });

    console.log('Created student assessment:', result.insertedId);
    return NextResponse.json(
      { message: 'Student assessment created successfully', id: result.insertedId },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────
// GET - Fetch student assessments
//   ?id=...             → single record with full joins + PO scores
//   ?assessment_id=...  → all submissions for an assessment
//   ?block_id=...       → all submissions in a block
//   ?student_id=...     → all submissions for a student across assessments
//   ?assessment_id=...&block_id=... → all submissions for a block in an assessment
//   ?assessment_id=...&student_id=... → a student's submission for an assessment
// ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const assessment_id = searchParams.get('assessment_id');
    const block_id = searchParams.get('block_id');
    const student_id = searchParams.get('student_id');

    const db = await connectDB();
    const studentAssessments = db.collection('student_assessments');

    const basePipeline = [
      {
        $lookup: {
          from: 'assessments',
          localField: 'assessment_id',
          foreignField: '_id',
          as: 'assessment',
        },
      },
      { $unwind: { path: '$assessment', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'blocks',
          localField: 'block_id',
          foreignField: '_id',
          as: 'block',
        },
      },
      { $unwind: { path: '$block', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'students',
          localField: 'student_id',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },
    ];

    // Single record with full joins + PO scores
    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
      }

      const records = await studentAssessments
        .aggregate([{ $match: { _id: new ObjectId(id) } }, ...basePipeline])
        .toArray();

      if (!records.length) {
        return NextResponse.json({ error: 'Student assessment not found' }, { status: 404 });
      }

      const record = records[0];
      const assessmentType = record.assessment?.type;
      const poScores = await computePOScores(db, new ObjectId(id), assessmentType);

      return NextResponse.json({ ...record, po_scores: poScores }, { status: 200 });
    }

    // Build filter from query params
    const filter: Record<string, any> = {};

    if (assessment_id) {
      if (!ObjectId.isValid(assessment_id)) {
        return NextResponse.json({ error: 'Invalid assessment_id' }, { status: 400 });
      }
      filter.assessment_id = new ObjectId(assessment_id);
    }

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

    if (!Object.keys(filter).length) {
      return NextResponse.json(
        { error: 'At least one query param is required: id, assessment_id, block_id, or student_id' },
        { status: 400 }
      );
    }

    const records = await studentAssessments
      .aggregate([
        { $match: filter },
        ...basePipeline,
        { $sort: { submitted_at: -1 } },
      ])
      .toArray();

    // Attach PO scores to each record
    const recordsWithPO = await Promise.all(
      records.map(async (record: any) => {
        const assessmentType = record.assessment?.type;
        const poScores = await computePOScores(db, record._id, assessmentType);
        return { ...record, po_scores: poScores };
      })
    );

    return NextResponse.json(recordsWithPO, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────
// PUT - Update submitted_at timestamp by id (?id=...)
// ─────────────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
    }

    const { assessment_id, block_id, student_id } = await req.json();

    if (!assessment_id || !block_id || !student_id) {
      return NextResponse.json(
        { error: 'assessment_id, block_id, and student_id are required' },
        { status: 400 }
      );
    }

    if (
      !ObjectId.isValid(assessment_id) ||
      !ObjectId.isValid(block_id) ||
      !ObjectId.isValid(student_id)
    ) {
      return NextResponse.json(
        { error: 'Invalid assessment_id, block_id, or student_id' },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const studentAssessments = db.collection('student_assessments');

    const result = await studentAssessments.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          assessment_id: new ObjectId(assessment_id),
          block_id: new ObjectId(block_id),
          student_id: new ObjectId(student_id),
          submitted_at: new Date(),
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Student assessment not found' }, { status: 404 });
    }

    console.log('Updated student assessment:', id);
    return NextResponse.json(
      { message: 'Student assessment updated successfully', student_assessment: result },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────
// DELETE - Delete a student assessment and cascade its results
//   ?id=...             → delete single record + cascade
//   ?assessment_id=...  → delete all submissions for an assessment + cascade
// ─────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const assessment_id = searchParams.get('assessment_id');

    const db = await connectDB();
    const studentAssessments = db.collection('student_assessments');

    // Delete all submissions for an assessment + cascade
    if (assessment_id) {
      if (!ObjectId.isValid(assessment_id)) {
        return NextResponse.json({ error: 'Invalid assessment_id' }, { status: 400 });
      }

      const records = await studentAssessments
        .find({ assessment_id: new ObjectId(assessment_id) })
        .toArray();

      const ids = records.map((r: any) => r._id);

      await studentAssessments.deleteMany({ assessment_id: new ObjectId(assessment_id) });

      if (ids.length > 0) {
        await db.collection('question_results').deleteMany({
          student_assessment_id: { $in: ids },
        });
        await db.collection('rubric_results').deleteMany({
          student_assessment_id: { $in: ids },
        });
      }

      console.log(`Deleted ${ids.length} student assessments for assessment:`, assessment_id);
      return NextResponse.json(
        { message: `${ids.length} student assessment(s) and their results deleted successfully` },
        { status: 200 }
      );
    }

    // Delete single record + cascade
    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
      }

      const result = await studentAssessments.findOneAndDelete({ _id: new ObjectId(id) });

      if (!result) {
        return NextResponse.json({ error: 'Student assessment not found' }, { status: 404 });
      }

      // Cascade delete question and rubric results
      await db.collection('question_results').deleteMany({
        student_assessment_id: new ObjectId(id),
      });
      await db.collection('rubric_results').deleteMany({
        student_assessment_id: new ObjectId(id),
      });

      console.log('Deleted student assessment and cascaded:', id);
      return NextResponse.json(
        { message: 'Student assessment and all results deleted successfully' },
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