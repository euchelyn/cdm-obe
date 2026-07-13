import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const { faculty_id, name, email, contact_number, department, program } = await req.json();

    if (!faculty_id || !name) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const db = await connectDB();
    const faculty = db.collection('faculty');

    const existingId = await faculty.findOne({ faculty_id });
    if (existingId) {
      return NextResponse.json({ error: 'Faculty ID already exists' }, { status: 409 });
    }

    /*
    const existingEmail = await faculty.findOne({ email });
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }
    */
    const result = await faculty.insertOne({
      faculty_id,
      name,
      email,
      contact_number,
      department,
      program,
      role: 'faculty',
      is_active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("Faculty API: " + result.insertedId);
    return NextResponse.json(
      { message: 'Faculty created successfully', id: result.insertedId },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const db = await connectDB();
    const faculty = db.collection('faculty');

    const { searchParams } = new URL(req.url);
    const faculty_id = searchParams.get('faculty_id');

    if (faculty_id) {
      const member = await faculty.findOne({ faculty_id });
      if (!member) {
        return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
      }
      return NextResponse.json({ data: member }, { status: 200 });
    }

    const allFaculty = await faculty.find({ is_active: true }).toArray();
    return NextResponse.json(
      { message: 'Faculty fetched successfully', data: allFaculty },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { faculty_id, ...updates } = await req.json();

    if (!faculty_id) {
      return NextResponse.json({ error: 'faculty_id is required' }, { status: 400 });
    }

    // Prevent updating to an already existing email
    const db = await connectDB();
    const faculty = db.collection('faculty');

    const existing = await faculty.findOne({ faculty_id });
    if (!existing) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
    }

    if (updates.email) {
      const emailTaken = await faculty.findOne({
        email: updates.email,
        faculty_id: { $ne: faculty_id },
      });
      if (emailTaken) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
      }
    }

    const result = await faculty.updateOne(
      { faculty_id },
      { $set: { ...updates, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Faculty updated successfully' },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const faculty_id = searchParams.get('faculty_id');

    if (!faculty_id) {
      return NextResponse.json({ error: 'faculty_id is required' }, { status: 400 });
    }

    const db = await connectDB();
    const faculty = db.collection('faculty');

    const existing = await faculty.findOne({ faculty_id });
    if (!existing) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
    }

    // Soft delete
    await faculty.updateOne(
      { faculty_id },
      { $set: { is_active: false, updatedAt: new Date() } }
    );

    return NextResponse.json(
      { message: 'Faculty deleted successfully' },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}