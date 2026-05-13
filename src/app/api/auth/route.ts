import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
    try {
        const db = await connectDB();
        const { searchParams } = new URL(req.url);

        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'id is required' },
                { status: 400 }
            );
        }

        let objectId: ObjectId;

        try {
            objectId = new ObjectId(id);
        } catch {
            return NextResponse.json(
                { error: 'Invalid ObjectId format' },
                { status: 400 }
            );
        }

        const users = db.collection('users');

        const user = await users.findOne({
            _id: objectId,
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                data: user,
            },
            { status: 200 }
        );

    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || 'Internal server error' },
            { status: 500 }
        );
    }
}