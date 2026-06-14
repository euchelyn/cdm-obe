import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// ─────────────────────────────────────────────────────────────
// POST - Submit answered survey
// Prevent duplicate submissions per student + survey type + year
// ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const {
            student_id,
            batch,
            program,
            name,
            survey_id,
            survey_type,
            survey_version,
            answers,
            status
        } = await req.json();

        if (
            !student_id ||
            !batch ||
            !program ||
            !name ||
            !survey_type ||
            !survey_version
        ) {
            return NextResponse.json(
                {
                    error: 'student_id, batch, program, name, survey_id, survey_type, survey_version, and answers are required'
                },
                { status: 400 }
            );
        }

        const db = await connectDB();
        const answeredSurveys = db.collection('answered_survey');

        const filter = {
            student_id,
            survey_type,
            survey_version
        };

        const update = {
            $set: {
                student_id,
                batch,
                program,
                name,
                survey_id,
                survey_type,
                survey_version,
                answers,
                status,
                updatedAt: new Date()
            },
            $setOnInsert: {
                createdAt: new Date()
            }
        };

        const result = await answeredSurveys.updateOne(
            filter,
            update,
            { upsert: true }
        );

        return NextResponse.json(
            {
                message: result.upsertedId
                    ? 'Survey created successfully'
                    : 'Survey updated successfully',
                id: result.upsertedId ?? null
            },
            { status: 200 }
        );

    } catch (e: any) {
        return NextResponse.json(
            { error: e.message },
            { status: 500 }
        );
    }
}


// ─────────────────────────────────────────────────────────────
// GET - Fetch answered surveys
//
// ?id=...                 → single response
// ?student_id=...         → responses of a student
// ?program=...            → responses by program
// ?batch=...              → responses by batch
// ?survey_id=...          → responses of a survey
// ?survey_type=...        → SO / Graduate / Tracer
// ?survey_version=...     → responses by year
// ?count=true             → return count only
// ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const id = searchParams.get('id');
        const student_id = searchParams.get('student_id');
        const batch = searchParams.get('batch');
        const program = searchParams.get('program');
        const survey_id = searchParams.get('survey_id');
        const survey_type = searchParams.get('survey_type');
        const survey_version = searchParams.get('survey_version');
        const count = searchParams.get('count');

        const db = await connectDB();
        const answeredSurveys = db.collection('answered_survey');

        // Get single document
        if (id) {
            if (!ObjectId.isValid(id)) {
                return NextResponse.json(
                    { error: 'Invalid ID' },
                    { status: 400 }
                );
            }

            const response = await answeredSurveys.findOne({
                _id: new ObjectId(id)
            });

            if (!response) {
                return NextResponse.json(
                    { error: 'Answered survey not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json(response, {
                status: 200
            });
        }

        // Build dynamic filter
        const filter: Record<string, any> = {};

        if (student_id) filter.student_id = student_id;
        if (batch) filter.batch = batch;
        if (program) filter.program = program;
        if (survey_id) filter.survey_id = survey_id;
        if (survey_type) filter.survey_type = survey_type;
        if (survey_version) filter.survey_version = survey_version;


        // Count mode
        if (count === 'true') {
            const total = await answeredSurveys.countDocuments(filter);

            return NextResponse.json(
                {
                    count: total,
                    filter
                },
                { status: 200 }
            );
        }


        // Get all matching responses
        const responses = await answeredSurveys
            .find(filter)
            .sort({
                createdAt: -1
            })
            .toArray();


        return NextResponse.json(
            responses,
            { status: 200 }
        );

    } catch (e: any) {
        return NextResponse.json(
            { error: e.message },
            { status: 500 }
        );
    }
}


// ─────────────────────────────────────────────────────────────
// PUT - Update answers of a submitted survey
// ?id=...
// ─────────────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json(
                {
                    error: 'Valid ID is required'
                },
                { status: 400 }
            );
        }

        const { answers } = await req.json();

        if (!answers) {
            return NextResponse.json(
                {
                    error: 'answers are required'
                },
                { status: 400 }
            );
        }

        const db = await connectDB();
        const answeredSurveys = db.collection('answered_survey');

        const result = await answeredSurveys.findOneAndUpdate(
            {
                _id: new ObjectId(id)
            },
            {
                $set: {
                    answers,
                    updatedAt: new Date()
                }
            },
            {
                returnDocument: 'after'
            }
        );

        if (!result) {
            return NextResponse.json(
                {
                    error: 'Answered survey not found'
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                message: 'Answered survey updated successfully',
                response: result
            },
            { status: 200 }
        );

    } catch (e: any) {
        return NextResponse.json(
            {
                error: e.message
            },
            {
                status: 500
            }
        );
    }
}


// ─────────────────────────────────────────────────────────────
// DELETE - Delete answered survey
// ?id=...
// ─────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json(
                {
                    error: 'Valid ID is required'
                },
                {
                    status: 400
                }
            );
        }

        const db = await connectDB();
        const answeredSurveys = db.collection('answered_survey');

        const result = await answeredSurveys.findOneAndDelete({
            _id: new ObjectId(id)
        });

        if (!result) {
            return NextResponse.json(
                {
                    error: 'Answered survey not found'
                },
                {
                    status: 404
                }
            );
        }

        return NextResponse.json(
            {
                message: 'Answered survey deleted successfully'
            },
            {
                status: 200
            }
        );

    } catch (e: any) {
        return NextResponse.json(
            {
                error: e.message
            },
            {
                status: 500
            }
        );
    }
}