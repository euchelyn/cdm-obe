import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST - Create a new determinant
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { version, program, year_level, data } = body;

        if (!version || !program || !year_level || !data) {
            return NextResponse.json(
                { error: 'version, program, year_level, and data are required' },
                { status: 400 }
            );
        }

        const db = await connectDB();
        const determinants = db.collection('determinants');

        const payload = {
            version,
            program,
            year_level,
            data,  // the course -> SO mapping object
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await determinants.insertOne(payload);

        return NextResponse.json(
            { message: 'Determinant created successfully', id: result.insertedId },
            { status: 201 }
        );
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// GET - Fetch all | ?id= | ?version= | ?program= | ?year_level= | combinations
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id         = searchParams.get('id');
        const version    = searchParams.get('version');
        const program    = searchParams.get('program');
        const year_level = searchParams.get('year_level');

        const db = await connectDB();
        const determinants = db.collection('determinants');

        if (id) {
            if (!ObjectId.isValid(id)) {
                return NextResponse.json({ error: 'Invalid determinant ID' }, { status: 400 });
            }
            const determinant = await determinants.findOne({ _id: new ObjectId(id) });
            if (!determinant) {
                return NextResponse.json({ error: 'Determinant not found' }, { status: 404 });
            }
            return NextResponse.json(determinant, { status: 200 });
        }

        const filter: Record<string, any> = {};
        if (version)    filter.version    = version;
        if (program)    filter.program    = program;
        if (year_level) filter.year_level = year_level;

        const result = await determinants.find(filter).toArray();
        return NextResponse.json(result, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// PUT - Update a determinant by ?id=
export async function PUT(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Valid determinant ID is required' }, { status: 400 });
        }

        const body = await req.json();
        const { version, program, year_level, data } = body;

        if (!version || !program || !year_level || !data) {
            return NextResponse.json(
                { error: 'version, program, year_level, and data are required' },
                { status: 400 }
            );
        }

        const db = await connectDB();
        const determinants = db.collection('determinants');

        const result = await determinants.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { version, program, year_level, data, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );

        if (!result) {
            return NextResponse.json({ error: 'Determinant not found' }, { status: 404 });
        }

        return NextResponse.json(
            { message: 'Determinant updated successfully', determinant: result },
            { status: 200 }
        );
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// DELETE - Delete a determinant by ?id=
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Valid determinant ID is required' }, { status: 400 });
        }

        const db = await connectDB();
        const determinants = db.collection('determinants');

        const result = await determinants.findOneAndDelete({ _id: new ObjectId(id) });

        if (!result) {
            return NextResponse.json({ error: 'Determinant not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Determinant deleted successfully' }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}