import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

// GET /api/questions
export async function GET(req: NextRequest) {
  try {
    const db = await connectDB();
    const questions = db.collection('questions');
    const { searchParams } = new URL(req.url);
    const question_set_id = searchParams.get('question_set_id');

    if (question_set_id) {
      const questionSet = await questions.findOne({ question_set_id });
      if (!questionSet) {
        return NextResponse.json({ error: 'Question set not found' }, { status: 404 });
      }
      return NextResponse.json(questionSet, { status: 200 });
    }

    const allQuestions = await questions.find({}).toArray();
    return NextResponse.json(allQuestions, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/questions
export async function POST(req: NextRequest) {
  try {
    const { question_set_id, question_category, questions, version } = await req.json();

    if (!question_set_id || !question_category || !questions || !version) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'questions must be a non-empty array' }, { status: 400 });
    }

    const invalidQuestion = questions.find(q => !q.question_id || !q.question);
    if (invalidQuestion) {
      return NextResponse.json({ error: 'Each question must have a question_id and question' }, { status: 400 });
    }

    const db = await connectDB();
    const questionsCollection = db.collection('questions');

    const existing = await questionsCollection.findOne({ question_set_id });
    if (existing) {
      return NextResponse.json({ error: 'Question set with this ID already exists' }, { status: 409 });
    }

    const result = await questionsCollection.insertOne({
      question_set_id,
      question_category,
      questions,
      version,
      date_created: new Date(),
    });

    return NextResponse.json(
      { message: 'Question set created successfully', id: result.insertedId },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}