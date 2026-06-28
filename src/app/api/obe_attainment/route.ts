import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// ─────────────────────────────────────────────────────────────
// GET - Compute a student's Program Outcome (PO) attainment.
//
// WHICH courses belong to each PO comes from the `determinants`
// mapping (course -> PO), exactly like the PC "Direct Assessment"
// page. The per-course WEIGHT comes from `da_weights`. The student's
// grade percentage is recomputed from the assessment results.
//
// Both collections are read at their LATEST available version
// (determinants and da_weights are currently on different versions).
//
//   ?student_id=<student _id>   (required)
//
// Returns:
//   {
//     determinantsVersion, weightsVersion, hasGrades,
//     pos: {
//       A: {
//         attainment: 78 | null,          // weighted % over graded courses
//         totalWeight, gradedWeight,
//         courses: [ { key, weight, percentage|null, graded } ]
//       }, ...
//     }
//   }
// ─────────────────────────────────────────────────────────────

const LEVEL_VALUES: Record<string, number> = {
    excellent: 100,
    good: 85,
    fair: 70,
    poor: 50,
};

// Normalize course identity so the curriculum strings ("COEN 4103 ...")
// match the courses collection (code "COEN4103" + name).
const norm = (s: string) => String(s ?? '').replace(/\s+/g, '').toLowerCase();

// Pick the most recent version string present in a set of docs.
function latestVersion(docs: any[]): string | null {
    const versions = docs.map((d) => d.version).filter(Boolean);
    if (versions.length === 0) return null;
    return [...versions].sort().reverse()[0]; // "2026" > "2024"
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get('student_id');

        if (!studentId || !ObjectId.isValid(studentId)) {
            return NextResponse.json(
                { error: 'A valid student_id is required' },
                { status: 400 }
            );
        }

        const db = await connectDB();
        const studentObjId = new ObjectId(studentId);

        // 1. Course -> PO mapping from determinants (latest version)
        const allDeterminants = await db
            .collection('determinants')
            .find({ program: 'BSCPE' })
            .toArray();

        const determinantsVersion = latestVersion(allDeterminants);

        const mappings: Record<string, Record<string, boolean>> = {};
        for (const doc of allDeterminants) {
            if (doc.version !== determinantsVersion) continue;
            if (doc.data) Object.assign(mappings, doc.data);
        }

        // 2. Per-course weights from da_weights (latest version)
        const allWeights = await db
            .collection('da_weights')
            .find({ program: 'BSCPE' })
            .toArray();

        const weightsVersion = latestVersion(allWeights);
        const weightsDoc = allWeights.find((d) => d.version === weightsVersion);
        const weights: Record<string, Record<string, number | string>> =
            weightsDoc?.data || {};

        // 3. Build the student's course -> percentage map (recomputed from results)
        const studentAssessments = await db
            .collection('student_assessments')
            .find({ student_id: studentObjId })
            .toArray();

        const gradeMap: Record<string, number[]> = {}; // normKey -> percentages[]

        for (const sa of studentAssessments) {
            const assessment = await db
                .collection('assessments')
                .findOne({ _id: sa.assessment_id });
            if (!assessment) continue;

            const grade = await db
                .collection('grades')
                .findOne({ student_assessment_id: sa._id });
            if (!grade) continue;

            const facultyCourse = await db
                .collection('faculty_courses')
                .findOne({ _id: assessment.faculty_course_id });
            if (!facultyCourse) continue;

            const course = await db
                .collection('courses')
                .findOne({ _id: facultyCourse.course_id });
            if (!course) continue;

            let percentage: number | null = null;

            if (assessment.type === 'final_exam') {
                const totalQuestions = await db
                    .collection('questions')
                    .countDocuments({ assessment_id: assessment._id });

                const results = await db
                    .collection('question_results')
                    .find({ student_assessment_id: sa._id })
                    .toArray();

                const correct = results.filter((r) => r.is_correct === true).length;
                if (totalQuestions > 0) {
                    percentage = Math.round((correct / totalQuestions) * 100);
                }
            } else {
                const results = await db
                    .collection('rubric_results')
                    .find({ student_assessment_id: sa._id })
                    .toArray();

                const vals = results
                    .map((r) => LEVEL_VALUES[String(r.level || '').toLowerCase()] || 0)
                    .filter((v) => v > 0);

                if (vals.length > 0) {
                    percentage = Math.round(
                        vals.reduce((a, b) => a + b, 0) / vals.length
                    );
                }
            }

            if (percentage == null) continue;

            const key = norm(`${course.code} ${course.course}`);
            (gradeMap[key] ||= []).push(percentage);
        }

        const percentByKey: Record<string, number> = {};
        for (const [key, arr] of Object.entries(gradeMap)) {
            percentByKey[key] = Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
        }

        // 4. Per-PO attainment — courses come from the determinants mapping
        const poIds = new Set<string>();
        for (const course of Object.keys(mappings)) {
            for (const [po, on] of Object.entries(mappings[course])) {
                if (on) poIds.add(po);
            }
        }

        const pos: Record<string, any> = {};
        let hasGrades = false;

        for (const po of poIds) {
            const mappedCourses = Object.keys(mappings).filter(
                (course) => mappings[course][po]
            );

            const courses: any[] = [];
            let totalWeight = 0;
            let gradedWeight = 0;
            let weightedSum = 0;

            for (const courseKey of mappedCourses) {
                const weight = Number(weights[po]?.[courseKey]) || 0;
                totalWeight += weight;

                const percentage = percentByKey[norm(courseKey)] ?? null;
                if (percentage != null) {
                    gradedWeight += weight;
                    weightedSum += percentage * weight;
                    hasGrades = true;
                }

                courses.push({
                    key: courseKey,
                    weight,
                    percentage,
                    graded: percentage != null,
                });
            }

            // Each course contributes (grade% × its weight share of the PO).
            // Divide by the PO's TOTAL weight so each subject is scaled by the
            // percentage it occupies on the PO; ungraded courses contribute 0.
            // Still null (Pending) when nothing has been graded yet.
            pos[po] = {
                attainment:
                    gradedWeight > 0 && totalWeight > 0
                        ? Math.round(weightedSum / totalWeight)
                        : null,
                totalWeight,
                gradedWeight,
                courses,
            };
        }

        return NextResponse.json(
            { determinantsVersion, weightsVersion, hasGrades, pos },
            { status: 200 }
        );
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
