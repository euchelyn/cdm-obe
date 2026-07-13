import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

// GET /api/curriculum/mappings
export async function GET(req: NextRequest) {
  try {
    const db = await connectDB();
    const mappings = db.collection('curriculum_mappings');
    const { searchParams } = new URL(req.url);
    const mapping_id = searchParams.get('mapping_id');
    const program = searchParams.get('program');

    if (mapping_id) {
      const result = await mappings.findOne({ mapping_id });
      if (!result) {
        return NextResponse.json({ error: 'Mapping not found' }, { status: 404 });
      }
      return NextResponse.json(result, { status: 200 });
    }

    if (program) {
      const result = await mappings.find({ program }).toArray();
      return NextResponse.json(result, { status: 200 });
    }

    const all = await mappings.find({}).toArray();
    return NextResponse.json(all, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/curriculum/mappings
export async function POST(req: NextRequest) {
  try {
    const { mapping_id, program, version, mappings } = await req.json();

    if (!mapping_id || !program || !version || !mappings) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!Array.isArray(mappings) || mappings.length === 0) {
      return NextResponse.json({ error: 'mappings must be a non-empty array' }, { status: 400 });
    }

    const invalidMapping = mappings.find(
      (m) => !m.course_name || !Array.isArray(m.po_ids) || m.po_ids.length === 0
    );
    if (invalidMapping) {
      return NextResponse.json(
        { error: 'Each mapping must have a course_name and a non-empty po_ids array' },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const curriculumMappings = db.collection('curriculum_mappings');

    const existing = await curriculumMappings.findOne({ mapping_id });
    if (existing) {
      return NextResponse.json(
        { error: 'Mapping with this ID already exists' },
        { status: 409 }
      );
    }

    const result = await curriculumMappings.insertOne({
      mapping_id,
      program,
      version,
      mappings,
      date_created: new Date(),
    });

    return NextResponse.json(
      { message: 'Curriculum mapping created successfully', id: result.insertedId },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}