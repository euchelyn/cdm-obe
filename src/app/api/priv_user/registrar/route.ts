import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const { registrar_id, name, email, contact_number } = await req.json();

    if (!registrar_id || !name) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const db = await connectDB();
    const registrar = db.collection('registrar');

    const existingId = await registrar.findOne({ registrar_id });
    if (existingId) {
      return NextResponse.json({ error: 'Registrar ID already exists' }, { status: 409 });
    }

    const existingEmail = await registrar.findOne({ email });
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const result = await registrar.insertOne({
      registrar_id,
      name,
      email,
      contact_number,
      role: 'registrar',
      is_active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { message: 'Registrar created successfully', id: result.insertedId },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const db = await connectDB();
    const registrar = db.collection('registrar');

    const { searchParams } = new URL(req.url);
    const registrar_id = searchParams.get('registrar_id');

    if (registrar_id) {
      const member = await registrar.findOne({ registrar_id });
      if (!member) {
        return NextResponse.json({ error: 'Registrar not found' }, { status: 404 });
      }
      return NextResponse.json({ data: member }, { status: 200 });
    }

    const allRegistrar = await registrar.find({ is_active: true }).toArray();
    return NextResponse.json(
      { message: 'Registrar fetched successfully', data: allRegistrar },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { registrar_id, ...updates } = await req.json();

    if (!registrar_id) {
      return NextResponse.json({ error: 'registrar_id is required' }, { status: 400 });
    }

    const db = await connectDB();
    const registrar = db.collection('registrar');

    const existing = await registrar.findOne({ registrar_id });
    if (!existing) {
      return NextResponse.json({ error: 'Registrar not found' }, { status: 404 });
    }

    if (updates.email) {
      const emailTaken = await registrar.findOne({
        email: updates.email,
        registrar_id: { $ne: registrar_id },
      });
      if (emailTaken) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
      }
    }

    const result = await registrar.updateOne(
      { registrar_id },
      { $set: { ...updates, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Registrar not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Registrar updated successfully' },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const registrar_id = searchParams.get('registrar_id');

    if (!registrar_id) {
      return NextResponse.json({ error: 'registrar_id is required' }, { status: 400 });
    }

    const db = await connectDB();
    const registrar = db.collection('registrar');

    const existing = await registrar.findOne({ registrar_id });
    if (!existing) {
      return NextResponse.json({ error: 'Registrar not found' }, { status: 404 });
    }

    await registrar.updateOne(
      { registrar_id },
      { $set: { is_active: false, updatedAt: new Date() } }
    );

    return NextResponse.json(
      { message: 'Registrar deleted successfully' },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}