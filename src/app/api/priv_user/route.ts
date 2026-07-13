import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const roleCollectionMap: Record<string, string> = {
    faculty: 'faculty',
    mis: 'mis',
    registrar: 'registrar',
    pc: 'program_chair',
};

export async function GET(req: NextRequest) {
    try {
        const db = await connectDB();
        const { searchParams } = new URL(req.url);

        const role = searchParams.get('role');
        const id = searchParams.get('id');

        if (!role || !id) {
            return NextResponse.json(
                { error: 'role and id are required' },
                { status: 400 }
            );
        }

        const collectionName = roleCollectionMap[role];

        if (!collectionName) {
            return NextResponse.json(
                { error: 'Invalid role' },
                { status: 400 }
            );
        }

        const collection = db.collection(collectionName);

        const data = await collection.findOne({
            _id: new ObjectId(id),
        });

        if (!data) {
            return NextResponse.json(
                { error: 'Not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ data }, { status: 200 });

    } catch (e: any) {
        return NextResponse.json(
            { error: e.message },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const db = await connectDB();
        const { searchParams } = new URL(req.url);

        const username = searchParams.get('username');

        if (!username) {
            return NextResponse.json(
                { error: 'username is required' },
                { status: 400 }
            );
        }

        const usersCollection = db.collection('users');

        // 1. Find auth user
        const userAccount = await usersCollection.findOne({ username });

        if (!userAccount) {
            return NextResponse.json(
                { error: 'User account not found' },
                { status: 404 }
            );
        }

        const userAccountId = userAccount._id.toString();

        const linksCollection = db.collection('account_links');

        // 2. Find role link
        const link = await linksCollection.findOne({
            user_account_id: userAccountId,
        });

        if (!link) {
            return NextResponse.json(
                { error: 'Account link not found' },
                { status: 404 }
            );
        }

        const roleCollectionName = roleCollectionMap[link.role];

        if (!roleCollectionName) {
            return NextResponse.json(
                { error: 'Invalid role mapping' },
                { status: 400 }
            );
        }

        const roleCollection = db.collection(roleCollectionName);

        // 3. Delete role data
        await roleCollection.deleteOne({
            _id: new ObjectId(link.role_account_id),
        });

        // 4. Delete account link
        await linksCollection.deleteOne({
            _id: link._id,
        });

        // 5. (Optional) delete auth user
        await usersCollection.deleteOne({
            _id: new ObjectId(userAccountId),
        });

        return NextResponse.json(
            {
                message: 'User deleted successfully by username',
                deleted: {
                    username,
                    userAccountId,
                    role: link.role,
                    roleAccountId: link.role_account_id,
                },
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