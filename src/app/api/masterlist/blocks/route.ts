import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST - Create a new block under a faculty_course
export async function POST(req: NextRequest) {
  try {
    const { faculty_course_id, name, school_year, semester } = await req.json();

    if (!faculty_course_id || !name || !school_year || !semester) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(faculty_course_id)) {
      return NextResponse.json(
        { error: 'Invalid faculty_course_id' },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const blocks = db.collection('blocks');

    // Prevent duplicate block name under same course + semester
    const existing = await blocks.findOne({
      faculty_course_id: new ObjectId(faculty_course_id),
      name,
      school_year,
      semester,
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            'A block with this name already exists for this course and semester',
        },
        { status: 409 }
      );
    }

    const result = await blocks.insertOne({
      faculty_course_id: new ObjectId(faculty_course_id),
      name,
      school_year,
      semester,
      createdAt: new Date(),
    });

    console.log('Created block:', result.insertedId);

    return NextResponse.json(
      {
        message: 'Block created successfully',
        id: result.insertedId,
      },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// GET - Fetch all blocks or a single block by id (?id=...)
//       Filter by faculty_course (?faculty_course_id=...)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get('id');
    const faculty_course_id = searchParams.get('faculty_course_id');

    const db = await connectDB();
    const blocks = db.collection('blocks');

    // =========================
    // GET SINGLE BLOCK
    // =========================
    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json(
          { error: 'Invalid ID' },
          { status: 400 }
        );
      }

      const block = await blocks
        .aggregate([
          {
            $match: {
              _id: new ObjectId(id),
            },
          },

          {
            $lookup: {
              from: 'faculty_courses',
              localField: 'faculty_course_id',
              foreignField: '_id',
              as: 'faculty_course',
            },
          },

          {
            $unwind: {
              path: '$faculty_course',
              preserveNullAndEmptyArrays: true,
            },
          },

          {
            $lookup: {
              from: 'courses',
              localField: 'faculty_course.course_id',
              foreignField: '_id',
              as: 'faculty_course.course',
            },
          },

          {
            $unwind: {
              path: '$faculty_course.course',
              preserveNullAndEmptyArrays: true,
            },
          },

          {
            $lookup: {
              from: 'faculty',
              localField: 'faculty_course.faculty_id',
              foreignField: '_id',
              as: 'faculty_course.faculty',
            },
          },

          {
            $unwind: {
              path: '$faculty_course.faculty',
              preserveNullAndEmptyArrays: true,
            },
          },
        ])
        .toArray();

      if (!block.length) {
        return NextResponse.json(
          { error: 'Block not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(block[0], { status: 200 });
    }

    // =========================
    // GET ALL BLOCKS
    // =========================

    const filter: Record<string, any> = {};

    if (faculty_course_id) {
      if (!ObjectId.isValid(faculty_course_id)) {
        return NextResponse.json(
          { error: 'Invalid faculty_course_id' },
          { status: 400 }
        );
      }

      filter.faculty_course_id = new ObjectId(faculty_course_id);
    }

    const allBlocks = await blocks
      .aggregate([
        {
          $match: filter,
        },

        {
          $lookup: {
            from: 'faculty_courses',
            localField: 'faculty_course_id',
            foreignField: '_id',
            as: 'faculty_course',
          },
        },

        {
          $unwind: {
            path: '$faculty_course',
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $lookup: {
            from: 'courses',
            localField: 'faculty_course.course_id',
            foreignField: '_id',
            as: 'faculty_course.course',
          },
        },

        {
          $unwind: {
            path: '$faculty_course.course',
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $lookup: {
            from: 'faculty',
            localField: 'faculty_course.faculty_id',
            foreignField: '_id',
            as: 'faculty_course.faculty',
          },
        },

        {
          $unwind: {
            path: '$faculty_course.faculty',
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $sort: {
            createdAt: -1,
          },
        },
      ])
      .toArray();

    return NextResponse.json(allBlocks, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT - Update a block by id (?id=...)
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Valid ID is required' },
        { status: 400 }
      );
    }

    const { faculty_course_id, name, school_year, semester } =
      await req.json();

    if (!faculty_course_id || !name || !school_year || !semester) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(faculty_course_id)) {
      return NextResponse.json(
        { error: 'Invalid faculty_course_id' },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const blocks = db.collection('blocks');

    // Prevent duplicates when updating
    const duplicate = await blocks.findOne({
      _id: { $ne: new ObjectId(id) },
      faculty_course_id: new ObjectId(faculty_course_id),
      name,
      school_year,
      semester,
    });

    if (duplicate) {
      return NextResponse.json(
        {
          error:
            'A block with this name already exists for this course and semester',
        },
        { status: 409 }
      );
    }

    const result = await blocks.findOneAndUpdate(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          faculty_course_id: new ObjectId(faculty_course_id),
          name,
          school_year,
          semester,
          updatedAt: new Date(),
        },
      },
      {
        returnDocument: 'after',
      }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Block not found' },
        { status: 404 }
      );
    }

    console.log('Updated block:', id);

    return NextResponse.json(
      {
        message: 'Block updated successfully',
        block: result,
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE - Delete a block by id (?id=...)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Valid ID is required' },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const blocks = db.collection('blocks');

    const result = await blocks.findOneAndDelete({
      _id: new ObjectId(id),
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Block not found' },
        { status: 404 }
      );
    }

    console.log('Deleted block:', id);

    return NextResponse.json(
      { message: 'Block deleted successfully' },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}