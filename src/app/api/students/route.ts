import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Student } from "@/types/Student";

export async function GET(req: NextRequest) {
    try {
        const db = await connectDB();
        const students = db.collection("students");

        const { searchParams } = new URL(req.url);

        const id = searchParams.get("id");
        const batch = searchParams.get("batch");
        const search = searchParams.get("search");

        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");

        const filter: any = {};

        // Filter by batch
        if (batch && batch !== "All") {
            filter.batch = batch;
        }

        // 🔥 Search by name (wildcard, case-insensitive)
        if (search) {
            filter.name = {
                $regex: search,
                $options: "i"
            };
        }

        // Fetch single student by ID (kept as-is)
        if (id) {
            const student = await students.findOne({ id });

            if (!student) {
                return NextResponse.json(
                    { error: "Student not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json(student);
        }

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            students
                .find(filter)
                .skip(skip)
                .limit(limit)
                .toArray(),

            students.countDocuments(filter),
        ]);

        return NextResponse.json({
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });

    } catch (e: any) {
        return NextResponse.json(
            { error: e.message },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body: Student = await req.json();

        const {
            name,
            id,
            batch,
            program,
            birthday,
            status,
        } = body;

        if (
            !name ||
            !id ||
            !batch ||
            !program ||
            !birthday ||
            !status
        ) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        const db = await connectDB();
        const students = db.collection("students");

        const existing = await students.findOne({ id });

        if (existing) {
            return NextResponse.json(
                { error: "Student ID already exists" },
                { status: 409 }
            );
        }

        const result = await students.insertOne({
            name,
            id,
            batch,
            program,
            birthday,
            status,
            date_created: new Date(),
        });

        return NextResponse.json(
            {
                message: "Student created successfully",
                insertedId: result.insertedId,
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

export async function PATCH(req: NextRequest) {
    try {
        const db = await connectDB();
        const students = db.collection("students");

        const body = await req.json();

        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json(
                { error: "Student ID is required" },
                { status: 400 }
            );
        }

        delete updates._id;
        delete updates.id;

        const result = await students.updateOne(
            { id },
            { $set: updates }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: "Student not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Student updated successfully",
            updated: result.modifiedCount > 0
        });

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
        const students = db.collection("students");

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Student ID is required" },
                { status: 400 }
            );
        }

        const result = await students.deleteOne({ id });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { error: "Student not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Student deleted successfully",
            deleted: true
        });

    } catch (e: any) {
        return NextResponse.json(
            { error: e.message },
            { status: 500 }
        );
    }
}