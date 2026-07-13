import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { student_id, det1, det2, det3, version, program } = body;

        if (!student_id) {
            return NextResponse.json({ error: 'student_id is required' }, { status: 400 });
        }

        const db = await connectDB();
        const obe_grades = db.collection('obe_grades');

        // prevent duplicates per student per version
        const existing = await obe_grades.findOne({ student_id, version });
        if (existing) {
            return NextResponse.json({ error: 'OBE grade already exists for this student and version. Use PUT to update.' }, { status: 409 });
        }

        const result = await obe_grades.insertOne({
            student_id,
            version:  version  ?? new Date().getFullYear().toString(),
            program:  program  ?? 'BSCPE',
            det1:     det1     ?? null,
            det2:     det2     ?? null,
            det3:     det3     ?? null,
            status:   det1 || det2 || det3 ? 'Graded' : 'Pending',
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return NextResponse.json(
            { message: 'OBE grade created successfully', id: result.insertedId },
            { status: 201 }
        );
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id         = searchParams.get('id');
        const student_id = searchParams.get('student_id');
        const version    = searchParams.get('version');
        const program    = searchParams.get('program');
        const status     = searchParams.get('status');

        const db = await connectDB();
        const obe_grades = db.collection('obe_grades');

        // get single by mongo _id
        if (id) {
            if (!ObjectId.isValid(id)) {
                return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
            }
            const doc = await obe_grades.findOne({ _id: new ObjectId(id) });
            if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
            return NextResponse.json(doc, { status: 200 });
        }

        const filter: Record<string, any> = {};
        if (student_id) filter.student_id = student_id;
        if (version)    filter.version    = version;
        if (program)    filter.program    = program;
        if (status)     filter.status     = status;

        const result = await obe_grades.find(filter).toArray();
        return NextResponse.json(result, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
        }

        const body = await req.json();
        const { det1, det2, det3, version, program } = body;

        const db = await connectDB();
        const obe_grades = db.collection('obe_grades');

        const result = await obe_grades.findOneAndUpdate(
            { _id: new ObjectId(id) },
            {
                $set: {
                    ...(det1     !== undefined && { det1 }),
                    ...(det2     !== undefined && { det2 }),
                    ...(det3     !== undefined && { det3 }),
                    ...(version  !== undefined && { version }),
                    ...(program  !== undefined && { program }),
                    status:    det1 || det2 || det3 ? 'Graded' : 'Pending',
                    updatedAt: new Date(),
                },
            },
            { returnDocument: 'after' }
        );

        if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json({ message: 'OBE grade updated successfully', grade: result }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
        }

        const db = await connectDB();
        const obe_grades = db.collection('obe_grades');

        const result = await obe_grades.findOneAndDelete({ _id: new ObjectId(id) });
        if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json({ message: 'OBE grade deleted successfully' }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}