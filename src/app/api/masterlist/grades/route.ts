import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST - Submit a grade for a student assessment
export async function POST(req: NextRequest) {
  try {
    const { student_assessment_id, overall_grade, outcome_grades, remarks } = await req.json();

    if (!student_assessment_id || overall_grade === undefined) {
      return NextResponse.json({ error: 'student_assessment_id and overall_grade are required' }, { status: 400 });
    }

    if (!ObjectId.isValid(student_assessment_id)) {
      return NextResponse.json({ error: 'Invalid student_assessment_id' }, { status: 400 });
    }

    // Assuming a 1.0-5.0 grading scale. Adjust max if needed.
    if (typeof overall_grade !== 'number' || overall_grade < 1.0 || overall_grade > 5.0) {
      return NextResponse.json({ error: 'overall_grade must be a number between 1.0 and 5.0' }, { status: 400 });
    }

    const db = await connectDB();
    const grades = db.collection('grades');

    // Prevent duplicate grade for the same student assessment
    const existing = await grades.findOne({
      student_assessment_id: new ObjectId(student_assessment_id),
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A grade for this student_assessment already exists. Use PUT to update it.' },
        { status: 409 }
      );
    }

    // Auto-generate remarks if not provided
    const finalRemarks = remarks || deriveRemarks(overall_grade);

    const result = await grades.insertOne({
      student_assessment_id: new ObjectId(student_assessment_id),
      overall_grade,
      outcome_grades: outcome_grades || {}, // Stores detailed PO scores e.g., { "A": { "po_score": 85 } }
      remarks: finalRemarks,
      submitted_at: new Date(),
      createdAt: new Date(),
    });

    console.log('Submitted grade:', result.insertedId);
    return NextResponse.json(
      { message: 'Grade submitted successfully', id: result.insertedId },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// GET - Fetch all grades or a single grade by id
//       Filter by student_assessment_id 
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const student_assessment_id = searchParams.get('student_assessment_id');

    const db = await connectDB();
    const grades = db.collection('grades');

    // We might want to look up details about the assessment or student in a real app, 
    // but we will keep it simple here to match the JSON structure provided.

    // Single record
    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
      }

      const record = await grades.findOne({ _id: new ObjectId(id) });

      if (!record) {
        return NextResponse.json({ error: 'Grade not found' }, { status: 404 });
      }

      return NextResponse.json(record, { status: 200 });
    }

    // Build filter
    const filter: Record<string, any> = {};

    if (student_assessment_id) {
      if (!ObjectId.isValid(student_assessment_id)) {
        return NextResponse.json({ error: 'Invalid student_assessment_id' }, { status: 400 });
      }
      filter.student_assessment_id = new ObjectId(student_assessment_id);
    }

    const records = await grades
      .find(filter)
      .sort({ submitted_at: -1 })
      .toArray();

    return NextResponse.json(records, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT - Update a grade by id
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
    }

    const { overall_grade, outcome_grades, remarks } = await req.json();

    if (!overall_grade && !outcome_grades && !remarks) {
      return NextResponse.json({ error: 'At least one detail to update is required' }, { status: 400 });
    }

    if (overall_grade && (typeof overall_grade !== 'number' || overall_grade < 1.0 || overall_grade > 5.0)) {
      return NextResponse.json({ error: 'overall_grade must be between 1.0 and 5.0' }, { status: 400 });
    }

    const db = await connectDB();
    const grades = db.collection('grades');

    // Calculate new remarks if grade is being updated and remarks aren't manually set
    let finalRemarks = remarks;
    if (overall_grade && !remarks) {
        finalRemarks = deriveRemarks(overall_grade);
    }

    const updateFields: any = {};
    if (overall_grade !== undefined) updateFields.overall_grade = overall_grade;
    if (outcome_grades) updateFields.outcome_grades = outcome_grades;
    if (finalRemarks) updateFields.remarks = finalRemarks;

    const result = await grades.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateFields,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Grade not found' }, { status: 404 });
    }

    console.log('Updated grade:', id);
    return NextResponse.json(
      { message: 'Grade updated successfully', grade: result },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE - Delete a grade by id
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
    }

    const db = await connectDB();
    const grades = db.collection('grades');

    const result = await grades.findOneAndDelete({ _id: new ObjectId(id) });

    if (!result) {
      return NextResponse.json({ error: 'Grade not found' }, { status: 404 });
    }

    console.log('Deleted grade:', id);
    return NextResponse.json({ message: 'Grade deleted successfully' }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Helper - Auto-derive remarks from grade value (Philippine 1.0-5.0 scale)
function deriveRemarks(grade: number): string {
  if (grade <= 3.0) return 'PASSED';
  if (grade >= 3.1 && grade <= 5.0) return 'FAILED';
  // Incomplete is usually for missing grades, assuming 0 or incomplete.
  return 'INCOMPLETE';
}