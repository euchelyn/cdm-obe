import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

/* =========================
   ROLE → COLLECTION MAP
========================= */
const roleCollectionMap: Record<string, string> = {
    faculty: 'faculty',
    mis: 'mis',
    student: 'students',
    registrar: 'registrar',
    pc: 'program_chair', // ✅ FIXED HERE
};

/* =========================
   GET (MULTI-MODE)
========================= */
export async function GET(req: NextRequest) {
    try {
        const db = await connectDB();
        const { searchParams } = new URL(req.url);

        const mode = searchParams.get('mode');

        /* =========================
           MODE 1: GET USER BY ROLE + ID
        ========================= */
        if (mode === 'user') {
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

            const user = await collection.findOne({
                [`${role}_id`]: id,
            });

            if (!user) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({ data: user }, { status: 200 });
        }

        /* =========================
           MODE 2: GET ACCOUNT BY USERNAME
        ========================= */
        if (mode === 'account') {
            const username = searchParams.get('username');

            if (!username) {
                return NextResponse.json(
                    { error: 'username is required' },
                    { status: 400 }
                );
            }

            const users = db.collection('users');

            const account = await users.findOne({ username });

            if (!account) {
                return NextResponse.json(
                    { error: 'Account not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({ data: account }, { status: 200 });
        }

        /* =========================
           MODE 3: GET LINK + RESOLVE FULL DATA
        ========================= */
        if (mode === 'link') {
            const user_account_id = searchParams.get('user_account_id');
            const role_account_id = searchParams.get('role_account_id');

            if (!user_account_id && !role_account_id) {
                return NextResponse.json(
                    { error: 'user_account_id or role_account_id is required' },
                    { status: 400 }
                );
            }

            const links = db.collection('account_links');

            const query: any = {};
            if (user_account_id) query.user_account_id = user_account_id;
            if (role_account_id) query.role_account_id = role_account_id;

            const link = await links.findOne(query);

            if (!link) {
                return NextResponse.json(
                    { error: 'Account link not found' },
                    { status: 404 }
                );
            }

            const users = db.collection('users');

            const userAccount = await users.findOne({
                _id: new ObjectId(link.user_account_id),
            });

            const roleCollection = roleCollectionMap[link.role];

            if (!roleCollection) {
                return NextResponse.json(
                    { error: 'Invalid role mapping' },
                    { status: 400 }
                );
            }

            const roleCol = db.collection(roleCollection);

            const roleAccount = await roleCol.findOne({
                _id: new ObjectId(link.role_account_id),
            });

            return NextResponse.json(
                {
                    link,
                    userAccount,
                    roleAccount,
                },
                { status: 200 }
            );
        }

        /* =========================
           MODE 4: ROLE COUNTS
        ========================= */
        if (mode === 'count') {
            const links = db.collection('account_links');

            const [academicCount, registrarCount] = await Promise.all([
                links.countDocuments({
                    role: { $in: ['student', 'faculty', 'pc'] }, // ✅ FIXED HERE
                }),

                links.countDocuments({
                    role: 'registrar',
                }),
            ]);

            return NextResponse.json(
                {
                    academic: {
                        students: await links.countDocuments({ role: 'student' }),
                        faculty: await links.countDocuments({ role: 'faculty' }),
                        pc: await links.countDocuments({ role: 'pc' }), // ✅ FIXED HERE
                    },
                    registrar: registrarCount,
                    totalAcademic: academicCount,
                },
                { status: 200 }
            );
        }

        /* =========================
        MODE 5: GET ALL ACCOUNT LINKS
        ========================= */
        if (mode === 'all') {
            const links = db.collection('account_links');

            const data = await links.find({}).toArray();

            return NextResponse.json(
                {
                    total: data.length,
                    data,
                },
                { status: 200 }
            );
        }

        return NextResponse.json(
            { error: 'Invalid mode' },
            { status: 400 }
        );


    } catch (e: any) {
        return NextResponse.json(
            { error: e.message },
            { status: 500 }
        );
    }
}

/* =========================
   POST (CREATE LINK)
========================= */
export async function POST(req: NextRequest) {
    try {
        const db = await connectDB();

        const { user_account_id, role, role_account_id } = await req.json();

        if (!user_account_id || !role || !role_account_id) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const collection = db.collection('account_links');

        const existing = await collection.findOne({
            user_account_id,
            role,
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Account already linked' },
                { status: 409 }
            );
        }

        const result = await collection.insertOne({
            user_account_id,
            role,
            role_account_id,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return NextResponse.json(
            {
                message: 'Account linked successfully',
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
   DELETE (REMOVE ACCOUNT LINK)
========================= */
export async function DELETE(req: NextRequest) {
    try {
        const db = await connectDB();
        const { searchParams } = new URL(req.url);

        const user_account_id = searchParams.get('user_account_id');
        const role_account_id = searchParams.get('role_account_id');

        if (!user_account_id && !role_account_id) {
            return NextResponse.json(
                { error: 'user_account_id or role_account_id is required' },
                { status: 400 }
            );
        }

        const collection = db.collection('account_links');

        const query: any = {};

        if (user_account_id) {
            query.user_account_id = user_account_id;
        }

        if (role_account_id) {
            query.role_account_id = role_account_id;
        }

        const existing = await collection.findOne(query);

        if (!existing) {
            return NextResponse.json(
                { error: 'Account link not found' },
                { status: 404 }
            );
        }

        await collection.deleteOne({ _id: existing._id });

        return NextResponse.json(
            {
                message: 'Account link deleted successfully',
                deleted: existing,
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