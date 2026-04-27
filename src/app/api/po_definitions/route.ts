import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

// GET /api/po_definitions
export async function GET(req: NextRequest) {
  try {
    const db = await connectDB();
    const definitions = db.collection('po_definitions');
    const { searchParams } = new URL(req.url);
    const def_id = searchParams.get('def_id');

    if (def_id) {
      const definition = await definitions.findOne({ def_id });
      if (!definition) {
        return NextResponse.json({ error: 'Definition not found' }, { status: 404 });
      }
      return NextResponse.json(definition, { status: 200 });
    }

    const allDefinitions = await definitions.find({}).toArray();
    return NextResponse.json(allDefinitions, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/po_definitions
export async function POST(req: NextRequest) {
  try {
    const { def_id, po_definitions, version } = await req.json();

    if (!def_id || !po_definitions || !version) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!Array.isArray(po_definitions) || po_definitions.length === 0) {
      return NextResponse.json({ error: 'po_definitions must be a non-empty array' }, { status: 400 });
    }

    const db = await connectDB();
    const definitions = db.collection('po_definitions');

    const existing = await definitions.findOne({ def_id });
    if (existing) {
      return NextResponse.json({ error: 'Definition with this ID already exists' }, { status: 409 });
    }

    const result = await definitions.insertOne({
      def_id,
      po_definitions,
      version,
      date_created: new Date(),
    });

    return NextResponse.json(
      { message: 'Definition created successfully', id: result.insertedId },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}