import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST - Create a new survey
export async function POST(req: NextRequest) {
    try {
        const { version, type, title, description, questions } = await req.json();

        if (!version || !type || !title) {
            return NextResponse.json({ error: 'version, type, and title are required' }, { status: 400 });
        }

        const db = await connectDB();
        const surveys = db.collection('surveys');

        const result = await surveys.insertOne({
            version,
            type,
            title,
            description: description ?? '',
            questions: questions ?? {},
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return NextResponse.json(
            { message: 'Survey created successfully', id: result.insertedId },
            { status: 201 }
        );
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// GET - Fetch all | ?id= | ?version= | ?type= | ?version=&type=
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id      = searchParams.get('id');
        const version = searchParams.get('version');
        const type    = searchParams.get('type');

        const db = await connectDB();
        const surveys = db.collection('surveys');

        if (id) {
            if (!ObjectId.isValid(id)) {
                return NextResponse.json({ error: 'Invalid survey ID' }, { status: 400 });
            }
            const survey = await surveys.findOne({ _id: new ObjectId(id) });
            if (!survey) {
                return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
            }
            return NextResponse.json(survey, { status: 200 });
        }

        const filter: Record<string, any> = {};
        if (version) filter.version = version;
        if (type)    filter.type    = type;

        const result = await surveys.find(filter).toArray();
        return NextResponse.json(result, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// PUT - Update a survey by ?id=
export async function PUT(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Valid survey ID is required' }, { status: 400 });
        }

        const { version, type, title, description, questions } = await req.json();

        if (!version || !type || !title) {
            return NextResponse.json({ error: 'version, type, and title are required' }, { status: 400 });
        }

        const db = await connectDB();
        const surveys = db.collection('surveys');

        const result = await surveys.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { version, type, title, description: description ?? '', questions: questions ?? {}, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );

        if (!result) {
            return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Survey updated successfully', survey: result }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// DELETE - Delete a survey by ?id=
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Valid survey ID is required' }, { status: 400 });
        }

        const db = await connectDB();
        const surveys = db.collection('surveys');

        const result = await surveys.findOneAndDelete({ _id: new ObjectId(id) });

        if (!result) {
            return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Survey deleted successfully' }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}