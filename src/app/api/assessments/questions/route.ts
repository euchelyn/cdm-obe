import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

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

    {
      $unwind: {
        path: '$question',
        preserveNullAndEmptyArrays: true,
      },
    },
  ];
}

// ─────────────────────────────────────────────────────────────
// POST - Create Question
// ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const {
      assessment_id,
      question,
      program_outcomes,
      order,
    } = await req.json();

    // Validate required fields
    if (!assessment_id || !question) {
      return NextResponse.json(
        {
          error: 'assessment_id and question are required',
        },
        { status: 400 }
      );
    }

    // Validate assessment_id
    if (!ObjectId.isValid(assessment_id)) {
      return NextResponse.json(
        {
          error: 'Invalid assessment_id',
        },
        { status: 400 }
      );
    }

    const db = await connectDB();

    // Verify assessment exists
    const assessment = await db
      .collection('assessments')
      .findOne({
        _id: new ObjectId(assessment_id),
      });

    if (!assessment) {
      return NextResponse.json(
        {
          error: 'Assessment not found',
        },
        { status: 404 }
      );
    }

    // Insert question
    const result = await db
      .collection('questions')
      .insertOne({
        assessment_id: new ObjectId(assessment_id),
        question,
        program_outcomes: program_outcomes || {},
        order: order || 1,
        createdAt: new Date(),
      });

    return NextResponse.json(
      {
        message: 'Question created successfully',
        id: result.insertedId,
      },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json(
      {
        error: e.message,
      },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// GET
// ?id=...
// ?question_id=...
// ?assessment_id=...
// ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get('id');
    const question_id = searchParams.get('question_id');
    const assessment_id = searchParams.get('assessment_id');

    const db = await connectDB();

    const questionResults = db.collection('question_results');

    // ─────────────────────────────────────────────────────────────
    // Single result by ID
    // ─────────────────────────────────────────────────────────────
    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json(
          {
            error: 'Invalid ID',
          },
          { status: 400 }
        );
      }

      const result = await questionResults
        .aggregate(
          buildAggregatePipeline({
            _id: new ObjectId(id),
          })
        )
        .toArray();

      if (!result.length) {
        return NextResponse.json(
          {
            error: 'Result not found',
          },
          { status: 404 }
        );
      }

      return NextResponse.json(result[0], {
        status: 200,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // Results by question_id
    // ─────────────────────────────────────────────────────────────
    if (question_id) {
      if (!ObjectId.isValid(question_id)) {
        return NextResponse.json(
          {
            error: 'Invalid question_id',
          },
          { status: 400 }
        );
      }

      const results = await questionResults
        .aggregate(
          buildAggregatePipeline({
            question_id: new ObjectId(question_id),
          })
        )
        .toArray();

      const totalCount = results.length;

      const correctCount = results.filter(
        (r: any) => r.is_correct
      ).length;

      return NextResponse.json(
        {
          results,

          summary: {
            total: totalCount,
            correct: correctCount,
            incorrect: totalCount - correctCount,

            pass_rate:
              totalCount > 0
                ? Math.round(
                    (correctCount / totalCount) * 100
                  )
                : 0,
          },
        },
        { status: 200 }
      );
    }

    // ─────────────────────────────────────────────────────────────
    // Questions by assessment_id
    // ─────────────────────────────────────────────────────────────
    if (assessment_id) {
      if (!ObjectId.isValid(assessment_id)) {
        return NextResponse.json(
          {
            error: 'Invalid assessment_id',
          },
          { status: 400 }
        );
      }

      const questions = await db
        .collection('questions')
        .find({
          assessment_id: new ObjectId(assessment_id),
        })
        .sort({ order: 1 })
        .toArray();

      return NextResponse.json(
        {
          assessment_id,
          questions,
          total: questions.length,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        error:
          'At least one query param is required: id, question_id, or assessment_id',
      },
      { status: 400 }
    );
  } catch (e: any) {
    return NextResponse.json(
      {
        error: e.message,
      },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// PUT - Update Question Result
// ?id=...
// ─────────────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
        },
        { status: 400 }
      );
    }

    const { is_correct } = await req.json();

    if (is_correct === undefined || is_correct === null) {
      return NextResponse.json(
        {
          error: 'is_correct is required',
        },
        { status: 400 }
      );
    }

    if (typeof is_correct !== 'boolean') {
      return NextResponse.json(
        {
          error: 'is_correct must be boolean',
        },
        { status: 400 }
      );
    }

    const db = await connectDB();

    const questionResults = db.collection('question_results');

    const result = await questionResults.findOneAndUpdate(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          is_correct,
          updatedAt: new Date(),
        },
      },
      {
        returnDocument: 'after',
      }
    );

    if (!result) {
      return NextResponse.json(
        {
          error: 'Result not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Question result updated successfully',
        question_result: result,
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      {
        error: e.message,
      },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// DELETE
// ?id=...
// ─────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
        },
        { status: 400 }
      );
    }

    const db = await connectDB();

    const questionResults = db.collection('question_results');

    const result = await questionResults.findOneAndDelete({
      _id: new ObjectId(id),
    });

    if (!result) {
      return NextResponse.json(
        {
          error: 'Result not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Question result deleted successfully',
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      {
        error: e.message,
      },
      { status: 500 }
    );
  }
}