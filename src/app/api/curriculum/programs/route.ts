import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

/* =========================
   COLLECTION
========================= */
const COLLECTION = 'programs';

/* =========================
   GET (READ ALL / ONE / COUNT)
   - ?id=xxx → single program
   - ?mode=count → total programs
   - no params → all programs
========================= */
export async function GET(req: NextRequest) {
    try {
        const db = await connectDB();
        const collection = db.collection(COLLECTION);

        const { searchParams } = new URL(req.url);

        const id = searchParams.get('id');
        const mode = searchParams.get('mode');

        /* =========================
           COUNT MODE
        ========================= */
        if (mode === 'count') {
            const totalPrograms = await collection.countDocuments();

            return NextResponse.json(
                {
                    total: totalPrograms,
                },
                { status: 200 }
            );
        }

        /* =========================
           GET ONE PROGRAM
        ========================= */
        if (id) {
            const program = await collection.findOne({
                _id: new ObjectId(id),
            });

            if (!program) {
                return NextResponse.json(
                    { error: 'Program not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({ data: program }, { status: 200 });
        }

        /* =========================
           GET ALL PROGRAMS
        ========================= */
        const programs = await collection.find({}).toArray();

        return NextResponse.json({ data: programs }, { status: 200 });

    } catch (e: any) {
        return NextResponse.json(
            { error: e.message },
            { status: 500 }
        );
    }
}

/* =========================
   POST (CREATE)
========================= */
export async function POST(req: NextRequest) {
    try {
        const db = await connectDB();
        const collection = db.collection(COLLECTION);

        const body = await req.json();
        const { code, program } = body;

        if (!code || !program) {
            return NextResponse.json(
                { error: 'code and program are required' },
                { status: 400 }
            );
        }

        const existing = await collection.findOne({ code });

        if (existing) {
            return NextResponse.json(
                { error: 'Program already exists' },
                { status: 409 }
            );
        }

        const result = await collection.insertOne({
            code,
            program,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return NextResponse.json(
            {
                message: 'Program created successfully',
                id: result.insertedId,
            },
            { status: 201 }
        );

    } catch (e: any) {
        return NextResponse.json(
            { error: e.message },
            { status: 500 }
        );
    }
}

/* =========================
   PATCH (UPDATE)
========================= */
export async function PATCH(req: NextRequest) {
    try {
        const db = await connectDB();
        const collection = db.collection(COLLECTION);

        const body = await req.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'id is required' },
                { status: 400 }
            );
        }

        delete updates._id;

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    ...updates,
                    updatedAt: new Date(),
                },
            }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: 'Program not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Program updated successfully',
            updated: result.modifiedCount > 0,
        });

    } catch (e: any) {
        return NextResponse.json(
            { error: e.message },
            { status: 500 }
        );
    }
}

/* =========================
   DELETE
========================= */
export async function DELETE(req: NextRequest) {
    try {
        const db = await connectDB();
        const collection = db.collection(COLLECTION);

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'id is required' },
                { status: 400 }
            );
        }

        const result = await collection.deleteOne({
            _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { error: 'Program not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Program deleted successfully',
            deleted: true,
        });

    } catch (e: any) {
        return NextResponse.json(
            { error: e.message },
            { status: 500 }
        );
    }
}