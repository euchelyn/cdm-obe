import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST - Create a new assessment for a faculty course
export async function POST(req: NextRequest) {
  try {
    const { faculty_course_id, type, program_outcomes, created_by } = await req.json();

    if (!faculty_course_id || !type || !program_outcomes || !created_by) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!ObjectId.isValid(faculty_course_id) || !ObjectId.isValid(created_by)) {
      return NextResponse.json({ error: 'Invalid faculty_course_id or created_by' }, { status: 400 });
    }

    if (!['final_exam', 'rubric'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either "final_exam" or "rubric"' },
        { status: 400 }
      );
    }

    if (typeof program_outcomes !== 'object' || Array.isArray(program_outcomes) || Object.keys(program_outcomes).length === 0) {
      return NextResponse.json(
        { error: 'program_outcomes must be a non-empty object e.g. { "A": 50, "B": 50 }' },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const assessments = db.collection('assessments');

    // One assessment per faculty course
    const existing = await assessments.findOne({
      faculty_course_id: new ObjectId(faculty_course_id),
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An assessment already exists for this faculty course. Use PUT to update it.' },
        { status: 409 }
      );
    }

    const result = await assessments.insertOne({
      faculty_course_id: new ObjectId(faculty_course_id),
      type,
      program_outcomes,
      created_by: new ObjectId(created_by),
      createdAt: new Date(),
    });

    console.log('Created assessment:', result.insertedId);
    return NextResponse.json(
      { message: 'Assessment created successfully', id: result.insertedId },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// GET - Fetch all assessments or a single one
//       Filter by faculty_course (?faculty_course_id=...)
//       Filter by created_by     (?created_by=...)
//       Single record            (?id=...)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const faculty_course_id = searchParams.get('faculty_course_id');
    const created_by = searchParams.get('created_by');

    const db = await connectDB();
    const assessments = db.collection('assessments');

    const aggregatePipeline = [
      {
        $lookup: {
          from: 'faculty_courses',
          localField: 'faculty_course_id',
          foreignField: '_id',
          as: 'faculty_course',
        },
      },
      { $unwind: { path: '$faculty_course', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'courses',
          localField: 'faculty_course.course_id',
          foreignField: '_id',
          as: 'faculty_course.course',
        },
      },
      { $unwind: { path: '$faculty_course.course', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'questions',
          localField: '_id',
          foreignField: 'assessment_id',
          as: 'questions',
        },
      },
      {
        $lookup: {
          from: 'rubrics',
          localField: '_id',
          foreignField: 'assessment_id',
          as: 'rubrics',
        },
      },
    ];

    // Single record
    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
      }

      const record = await assessments
        .aggregate([{ $match: { _id: new ObjectId(id) } }, ...aggregatePipeline])
        .toArray();

      if (!record.length) {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // Build filter
    const filter: Record<string, any> = {};

    if (faculty_course_id) {
      if (!ObjectId.isValid(faculty_course_id)) {
        return NextResponse.json({ error: 'Invalid faculty_course_id' }, { status: 400 });
      }
      filter.faculty_course_id = new ObjectId(faculty_course_id);
    }

    if (created_by) {
      if (!ObjectId.isValid(created_by)) {
        return NextResponse.json({ error: 'Invalid created_by' }, { status: 400 });
      }
      filter.created_by = new ObjectId(created_by);
    }

    const records = await assessments
      .aggregate([
        { $match: filter },
        ...aggregatePipeline,
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    return NextResponse.json(records, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT - Update an assessment by id (?id=...)
//       Allows changing type, program_outcomes
//       Note: changing type will orphan existing questions/rubrics — handle with caution
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
    }

    const { faculty_course_id, type, program_outcomes, created_by } = await req.json();

    if (!faculty_course_id || !type || !program_outcomes || !created_by) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!ObjectId.isValid(faculty_course_id) || !ObjectId.isValid(created_by)) {
      return NextResponse.json({ error: 'Invalid faculty_course_id or created_by' }, { status: 400 });
    }

    if (!['final_exam', 'rubric'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either "final_exam" or "rubric"' },
        { status: 400 }
      );
    }

    if (!Array.isArray(program_outcomes) || program_outcomes.length === 0) {
      return NextResponse.json(
        { error: 'program_outcomes must be a non-empty array' },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const assessments = db.collection('assessments');

    const result = await assessments.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          faculty_course_id: new ObjectId(faculty_course_id),
          type,
          program_outcomes,
          created_by: new ObjectId(created_by),
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    console.log('Updated assessment:', id);
    return NextResponse.json(
      { message: 'Assessment updated successfully', assessment: result },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE - Delete an assessment and cascade delete its questions/rubrics
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
    }

    const db = await connectDB();
    const assessments = db.collection('assessments');

    const result = await assessments.findOneAndDelete({ _id: new ObjectId(id) });

    if (!result) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Cascade delete questions and rubrics tied to this assessment
    await db.collection('questions').deleteMany({ assessment_id: new ObjectId(id) });
    await db.collection('rubrics').deleteMany({ assessment_id: new ObjectId(id) });

    // Cascade delete student_assessments and their results
    const studentAssessments = await db
      .collection('student_assessments')
      .find({ assessment_id: new ObjectId(id) })
      .toArray();

    const studentAssessmentIds = studentAssessments.map((sa) => sa._id);

    if (studentAssessmentIds.length > 0) {
      await db.collection('question_results').deleteMany({
        student_assessment_id: { $in: studentAssessmentIds },
      });
      await db.collection('rubric_results').deleteMany({
        student_assessment_id: { $in: studentAssessmentIds },
      });
      await db.collection('student_assessments').deleteMany({
        assessment_id: new ObjectId(id),
      });
    }

    console.log('Deleted assessment and cascaded:', id);
    return NextResponse.json(
      { message: 'Assessment and all related data deleted successfully' },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}