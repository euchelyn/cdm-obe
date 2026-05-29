import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { version, program, data } = body;

        if (!version || !program || !data) {
            return NextResponse.json(
                { error: 'version, program, and data are required' },
                { status: 400 }
            );
        }

        const db = await connectDB();
        const weights = db.collection('da_weights');

        const result = await weights.insertOne({
            version, program, data,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return NextResponse.json(
            { message: 'Weights created successfully', id: result.insertedId },
            { status: 201 }
        );
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id      = searchParams.get('id');
        const version = searchParams.get('version');
        const program = searchParams.get('program');

        const db = await connectDB();
        const weights = db.collection('da_weights');

        if (id) {
            if (!ObjectId.isValid(id)) {
                return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
            }
            const doc = await weights.findOne({ _id: new ObjectId(id) });
            if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
            return NextResponse.json(doc, { status: 200 });
        }

        const filter: Record<string, any> = {};
        if (version) filter.version = version;
        if (program) filter.program = program;

        const result = await weights.find(filter).toArray();
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

        const { version, program, data } = await req.json();

        if (!version || !program || !data) {
            return NextResponse.json(
                { error: 'version, program, and data are required' },
                { status: 400 }
            );
        }

        const db = await connectDB();
        const weights = db.collection('da_weights');

        const result = await weights.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { version, program, data, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );

        if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json({ message: 'Weights updated successfully', weights: result }, { status: 200 });
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
        const weights = db.collection('da_weights');

        const result = await weights.findOneAndDelete({ _id: new ObjectId(id) });
        if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json({ message: 'Weights deleted successfully' }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}