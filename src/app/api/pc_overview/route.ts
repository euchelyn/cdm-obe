import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

// ─────────────────────────────────────────────────────────────
// GET - Program Chair "Program Overview" headline numbers.
//
//   totalAlumni                -> count of students (the masterlist)
//   tracerCompletionRate       -> % of students who answered the GTS
//   pendingDirectAssessments   -> students not yet graded (no grade record)
// ─────────────────────────────────────────────────────────────
export async function GET() {
    try {
        const db = await connectDB();

        // Total Registered Alumni
        const totalAlumni = await db.collection('students').countDocuments();

        // Tracer Study Completion — distinct students with an answered GTS
        const tracerDocs = await db
            .collection('answered_survey')
            .find({ survey_type: 'tracer_study', status: 'answered' })
            .project({ student_id: 1 })
            .toArray();

        const tracerStudents = new Set(
            tracerDocs.map((d) => String(d.student_id))
        );
        const tracerCompletedCount = tracerStudents.size;
        const tracerCompletionRate =
            totalAlumni > 0
                ? Math.round((tracerCompletedCount / totalAlumni) * 100)
                : 0;

        // Pending Direct Assessments — students with no grade recorded yet.
        // A student is "assessed" once they have at least one grade
        // (grades -> student_assessments -> student_id).
        const grades = await db
            .collection('grades')
            .find({})
            .project({ student_assessment_id: 1 })
            .toArray();

        const studentAssessmentIds = grades.map((g) => g.student_assessment_id);

        const sas = studentAssessmentIds.length
            ? await db
                  .collection('student_assessments')
                  .find({ _id: { $in: studentAssessmentIds } })
                  .project({ student_id: 1 })
                  .toArray()
            : [];

        const assessedStudents = new Set(sas.map((s) => String(s.student_id)));
        const assessedCount = assessedStudents.size;
        const pendingDirectAssessments = Math.max(0, totalAlumni - assessedCount);

        return NextResponse.json(
            {
                totalAlumni,
                tracerCompletionRate,
                tracerCompletedCount,
                pendingDirectAssessments,
                assessedCount,
            },
            { status: 200 }
        );
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
