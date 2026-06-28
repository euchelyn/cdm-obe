import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

// ─────────────────────────────────────────────────────────────
// GET - All data for the PC "Reports & Analytics" page.
//
//   students[]  -> per student: det1/det2/det3 (computed PO attainment,
//                  grouped A–D / E–H / I–L), directStatus, and survey flags
//                  (so_answered, peo_answered, tracer_answered)
//   gts.schema  -> latest tracer_study question schema
//   gts.responses -> tracer_study answers (with name/batch/program)
// ─────────────────────────────────────────────────────────────

const LEVEL_VALUES: Record<string, number> = {
    excellent: 100, good: 85, fair: 70, poor: 50,
};
const norm = (s: string) => String(s ?? '').replace(/\s+/g, '').toLowerCase();
function latestVersion(docs: any[]): string | null {
    const v = docs.map((d) => d.version).filter(Boolean);
    return v.length ? [...v].sort().reverse()[0] : null;
}

const DET_GROUPS: Record<string, string[]> = {
    det1: ['A', 'B', 'C', 'D'],
    det2: ['E', 'F', 'G', 'H'],
    det3: ['I', 'J', 'K', 'L'],
};

export async function GET() {
    try {
        const db = await connectDB();

        // ── Reference data ───────────────────────────────────────────────
        const [students, allDet, allW] = await Promise.all([
            db.collection('students').find({}).sort({ name: 1 }).toArray(),
            db.collection('determinants').find({ program: 'BSCPE' }).toArray(),
            db.collection('da_weights').find({ program: 'BSCPE' }).toArray(),
        ]);

        const detVersion = latestVersion(allDet);
        const mappings: Record<string, Record<string, boolean>> = {};
        allDet.filter((d) => d.version === detVersion).forEach((d) => {
            if (d.data) Object.assign(mappings, d.data);
        });

        const wVersion = latestVersion(allW);
        const weights: Record<string, Record<string, number | string>> =
            allW.find((d) => d.version === wVersion)?.data || {};

        // ── Grade graph (loaded once, built into maps) ───────────────────
        const [grades, sas, assessments, facultyCourses, courses, qResults, questions, rResults] =
            await Promise.all([
                db.collection('grades').find({}).toArray(),
                db.collection('student_assessments').find({}).toArray(),
                db.collection('assessments').find({}).toArray(),
                db.collection('faculty_courses').find({}).toArray(),
                db.collection('courses').find({}).toArray(),
                db.collection('question_results').find({}).toArray(),
                db.collection('questions').find({}).toArray(),
                db.collection('rubric_results').find({}).toArray(),
            ]);

        const saMap = new Map(sas.map((s) => [String(s._id), s]));
        const aMap = new Map(assessments.map((a) => [String(a._id), a]));
        const fcMap = new Map(facultyCourses.map((f) => [String(f._id), f]));
        const courseMap = new Map(courses.map((c) => [String(c._id), c]));

        const questionCountByAssessment: Record<string, number> = {};
        questions.forEach((q) => {
            const k = String(q.assessment_id);
            questionCountByAssessment[k] = (questionCountByAssessment[k] || 0) + 1;
        });

        const qrBySa: Record<string, any[]> = {};
        qResults.forEach((r) => {
            (qrBySa[String(r.student_assessment_id)] ||= []).push(r);
        });
        const rrBySa: Record<string, any[]> = {};
        rResults.forEach((r) => {
            (rrBySa[String(r.student_assessment_id)] ||= []).push(r);
        });

        // studentId -> { normCourseKey -> [percentages] }
        const studentCoursePct: Record<string, Record<string, number[]>> = {};

        for (const grade of grades) {
            const sa = saMap.get(String(grade.student_assessment_id));
            if (!sa) continue;
            const assessment = aMap.get(String(sa.assessment_id));
            if (!assessment) continue;
            const fc = fcMap.get(String(assessment.faculty_course_id));
            if (!fc) continue;
            const course = courseMap.get(String(fc.course_id));
            if (!course) continue;

            let percentage: number | null = null;
            const saId = String(sa._id);

            if (assessment.type === 'final_exam') {
                const totalQ = questionCountByAssessment[String(assessment._id)] || 0;
                const correct = (qrBySa[saId] || []).filter((r) => r.is_correct === true).length;
                if (totalQ > 0) percentage = Math.round((correct / totalQ) * 100);
            } else {
                const vals = (rrBySa[saId] || [])
                    .map((r) => LEVEL_VALUES[String(r.level || '').toLowerCase()] || 0)
                    .filter((v) => v > 0);
                if (vals.length) percentage = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
            }
            if (percentage == null) continue;

            const studentKey = String(sa.student_id);
            const courseKey = norm(`${course.code} ${course.course}`);
            ((studentCoursePct[studentKey] ||= {})[courseKey] ||= []).push(percentage);
        }

        // ── Answered surveys per student ─────────────────────────────────
        const answered = await db.collection('answered_survey').find({}).toArray();
        const answeredByStudent: Record<string, Set<string>> = {};
        answered.forEach((a) => {
            if (a.status === 'answered') {
                (answeredByStudent[String(a.student_id)] ||= new Set()).add(a.survey_type);
            }
        });

        // Per-PO attainment for a single student's course-percent map
        const poAttainmentFor = (pctByKeyRaw: Record<string, number[]>) => {
            const pctByKey: Record<string, number> = {};
            for (const [k, arr] of Object.entries(pctByKeyRaw || {})) {
                pctByKey[k] = Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
            }
            const poVal: Record<string, number | null> = {};
            const poIds = new Set<string>();
            Object.keys(mappings).forEach((crs) =>
                Object.entries(mappings[crs]).forEach(([po, on]) => { if (on) poIds.add(po); })
            );
            for (const po of poIds) {
                const mapped = Object.keys(mappings).filter((crs) => mappings[crs][po]);
                let totalW = 0, gradedW = 0, sum = 0;
                for (const ck of mapped) {
                    const w = Number(weights[po]?.[ck]) || 0;
                    totalW += w;
                    const p = pctByKey[norm(ck)];
                    if (p != null) { gradedW += w; sum += p * w; }
                }
                poVal[po] = gradedW > 0 && totalW > 0 ? Math.round(sum / totalW) : null;
            }
            return poVal;
        };

        const detAvg = (poVal: Record<string, number | null>, group: string[]) => {
            const vals = group.map((p) => poVal[p]).filter((v): v is number => v != null);
            if (!vals.length) return null;
            return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
        };

        // ── Assemble per-student rows ────────────────────────────────────
        const studentRows = students.map((s) => {
            const sid = String(s._id);
            const pctMap = studentCoursePct[sid];
            const poVal = pctMap ? poAttainmentFor(pctMap) : {};
            const det1 = detAvg(poVal, DET_GROUPS.det1);
            const det2 = detAvg(poVal, DET_GROUPS.det2);
            const det3 = detAvg(poVal, DET_GROUPS.det3);
            // "Graded" only when a determinant outcome was actually evaluated
            const hasAnyDet = det1 != null || det2 != null || det3 != null;
            const surveys = answeredByStudent[sid] || new Set();

            return {
                _id: sid,
                id: s.id,
                name: s.name,
                batch: s.batch,
                program: s.program,
                det1, det2, det3,
                directStatus: hasAnyDet ? 'Graded' : 'Pending',
                so_answered: surveys.has('so_survey'),
                peo_answered: surveys.has('graduate_survey'),
                tracer_answered: surveys.has('tracer_study'),
            };
        });

        // ── GTS schema + responses ───────────────────────────────────────
        const tracerSurveys = await db.collection('surveys').find({ type: 'tracer_study' }).toArray();
        const tracerVersion = latestVersion(tracerSurveys);
        const tracerSurvey = tracerSurveys.find((s) => s.version === tracerVersion);
        const schema = Object.values(tracerSurvey?.questions || {}).sort((a: any, b: any) => {
            const na = parseInt(String(a.id).replace(/\D/g, ''), 10) || 0;
            const nb = parseInt(String(b.id).replace(/\D/g, ''), 10) || 0;
            return na - nb;
        });

        const responses = answered
            .filter((a) => a.survey_type === 'tracer_study' && a.status === 'answered')
            .map((a) => ({
                student_id: String(a.student_id),
                name: a.name,
                batch: a.batch,
                program: a.program,
                answers: a.answers || {},
            }));

        return NextResponse.json(
            {
                detVersion,
                weightsVersion: wVersion,
                students: studentRows,
                gts: { schema, responses, version: tracerVersion },
            },
            { status: 200 }
        );
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
