/**
 * assessmentService.ts
 * ─────────────────────────────────────────────────────────────
 * Centralised service for all OBE assessment-related API calls.
 *
 * Base endpoints:
 *   /api/assessments
 *   /api/assessments/questions
 *   /api/assessments/rubrics
 *   /api/assessments/student-assessments
 *   /api/assessments/question/question-results
 *   /api/assessments/rubcrics/rubric-results
 * ─────────────────────────────────────────────────────────────
 */

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
import { Assessment } from "@/types/Assessment";
import { Question } from "@/types/Question";
import { Rubric } from "@/types/StudentAssessment";
import { StudentAssessment } from "@/types/StudentAssess";
import { QuestionResult } from "@/types/QuestionResult";
import { RubricResult } from "@/types/RubricResult";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    if (!res.ok) throw new Error(data.error || 'An unexpected error occurred');
    return data as T;
  } catch (e: any) {
    throw new Error(`Invalid response from server: ${text}`);
  }
}

// ═════════════════════════════════════════════════════════════
// ASSESSMENTS  →  /api/assessments
// ═════════════════════════════════════════════════════════════

const ASSESSMENTS_URL = '/api/assessments';

/**
 * Fetch all assessments.
 * Optionally filter by faculty_course or created_by.
 * Each record includes embedded questions/rubrics and faculty_course.
 *
 * @param params.faculty_course_id - (optional) Filter by faculty_course ObjectId
 * @param params.created_by        - (optional) Filter by faculty ObjectId
 *
 * @example
 * getAllAssessments({ faculty_course_id: '665f...' })
 */
export async function getAllAssessments(
  params: { faculty_course_id?: string; created_by?: string } = {}
): Promise<Assessment[]> {
  const query = new URLSearchParams();
  if (params.faculty_course_id) query.set('faculty_course_id', params.faculty_course_id);
  if (params.created_by) query.set('created_by', params.created_by);

  const url = query.toString() ? `${ASSESSMENTS_URL}?${query}` : ASSESSMENTS_URL;
  const res = await fetch(url, { method: 'GET' });
  return handleResponse<Assessment[]>(res);
}

/**
 * Fetch a single assessment by ID.
 * Response includes embedded questions/rubrics arrays.
 *
 * @param id - ObjectId of the assessment
 *
 * @example
 * getAssessmentById('665f...')
 */
export async function getAssessmentById(id: string): Promise<Assessment> {
  const res = await fetch(`${ASSESSMENTS_URL}?id=${id}`, { method: 'GET' });
  return handleResponse<Assessment>(res);
}

/**
 * Create a new assessment for a faculty course.
 * Only one assessment is allowed per faculty_course — returns 409 if exists.
 *
 * @param data.faculty_course_id - ObjectId of the faculty_course
 * @param data.type              - "final_exam" | "rubric"
 * @param data.program_outcomes  - Key-value of PO code and weight e.g. { A: 50, B: 50 }
 * @param data.created_by        - ObjectId of the faculty creating it
 *
 * @example
 * createAssessment({
 *   faculty_course_id: '665f...',
 *   type: 'final_exam',
 *   program_outcomes: { A: 50, B: 30, C: 20 },
 *   created_by: '665f...',
 * })
 */
export async function createAssessment(
  data: Omit<Assessment, '_id' | 'createdAt' | 'updatedAt' | 'questions' | 'rubrics' | 'faculty_course'>
): Promise<{ message: string; id: string }> {
  const res = await fetch(ASSESSMENTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * Update an existing assessment.
 * Note: changing type will orphan existing questions/rubrics.
 *
 * @param id   - ObjectId of the assessment to update
 * @param data - Same shape as createAssessment
 *
 * @example
 * updateAssessment('665f...', { faculty_course_id: '...', type: 'rubric', program_outcomes: { A: 100 }, created_by: '...' })
 */
export async function updateAssessment(
  id: string,
  data: Omit<Assessment, '_id' | 'createdAt' | 'updatedAt' | 'questions' | 'rubrics' | 'faculty_course'>
): Promise<{ message: string; assessment: Assessment }> {
  const res = await fetch(`${ASSESSMENTS_URL}?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * Delete an assessment and cascade delete all related data.
 * This includes questions, rubrics, student_assessments,
 * question_results, and rubric_results.
 *
 * @param id - ObjectId of the assessment to delete
 *
 * @example
 * deleteAssessment('665f...')
 */
export async function deleteAssessment(id: string): Promise<{ message: string }> {
  const res = await fetch(`${ASSESSMENTS_URL}?id=${id}`, { method: 'DELETE' });
  return handleResponse(res);
}

// ═════════════════════════════════════════════════════════════
// QUESTIONS  →  /api/assessments/questions
// ═════════════════════════════════════════════════════════════

const QUESTIONS_URL = '/api/assessments/questions';

/**
 * Fetch all questions for an assessment as a keyed bundle.
 * Returns: { q1: {...}, q2: {...}, q3: {...} }
 *
 * @param assessment_id - ObjectId of the assessment
 *
 * @example
 * getAllQuestions('665f...')
 */
export async function getAllQuestions(
  assessment_id: string
): Promise<Record<string, Question>> {
  const res = await fetch(`${QUESTIONS_URL}?assessment_id=${assessment_id}`, { method: 'GET' });
  return handleResponse<Record<string, Question>>(res);
}

/**
 * Fetch a single question by ID.
 *
 * @param id - ObjectId of the question
 *
 * @example
 * getQuestionById('665f...')
 */
export async function getQuestionById(id: string): Promise<Question> {
  const res = await fetch(`${QUESTIONS_URL}?id=${id}`, { method: 'GET' });
  return handleResponse<Question>(res);
}

/**
 * Add a question to an assessment.
 * PO weights in program_outcomes must total 100.
 *
 * @param data.assessment_id    - ObjectId of the assessment
 * @param data.question         - Question text
 * @param data.program_outcomes - PO weights e.g. { A: 60, B: 40 } (must total 100)
 * @param data.order            - (optional) Position order; auto-increments if omitted
 *
 * @example
 * createQuestion({
 *   assessment_id: '665f...',
 *   question: 'What is a logic gate?',
 *   program_outcomes: { A: 60, B: 40 },
 * })
 */
export async function createQuestion(
  data: Omit<Question, '_id' | 'createdAt' | 'updatedAt'>
): Promise<{ message: string; id: string }> {
  const res = await fetch(QUESTIONS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * Update an existing question.
 *
 * @param id   - ObjectId of the question to update
 * @param data - Same shape as createQuestion
 *
 * @example
 * updateQuestion('665f...', { assessment_id: '...', question: 'Updated?', program_outcomes: { A: 100 } })
 */
export async function updateQuestion(
  id: string,
  data: Omit<Question, '_id' | 'createdAt' | 'updatedAt'>
): Promise<{ message: string; question: Question }> {
  const res = await fetch(`${QUESTIONS_URL}?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * Delete a single question by ID.
 * Also cascade deletes its question_results.
 *
 * @param id - ObjectId of the question to delete
 *
 * @example
 * deleteQuestion('665f...')
 */
export async function deleteQuestion(id: string): Promise<{ message: string }> {
  const res = await fetch(`${QUESTIONS_URL}?id=${id}`, { method: 'DELETE' });
  return handleResponse(res);
}

/**
 * Delete all questions for an assessment.
 * Also cascade deletes all question_results.
 *
 * @param assessment_id - ObjectId of the assessment
 *
 * @example
 * deleteAllQuestions('665f...')
 */
export async function deleteAllQuestions(assessment_id: string): Promise<{ message: string }> {
  const res = await fetch(`${QUESTIONS_URL}?assessment_id=${assessment_id}`, { method: 'DELETE' });
  return handleResponse(res);
}

// ═════════════════════════════════════════════════════════════
// RUBRICS  →  /api/assessments/rubrics
// ═════════════════════════════════════════════════════════════

const RUBRICS_URL = '/api/assessments/rubrics';

/**
 * Fetch all rubrics for an assessment as a keyed bundle.
 * Returns: { r1: {...}, r2: {...}, r3: {...} }
 *
 * @param assessment_id - ObjectId of the assessment
 *
 * @example
 * getAllRubrics('665f...')
 */
export async function getAllRubrics(
  assessment_id: string
): Promise<Record<string, Rubric>> {
  const res = await fetch(`${RUBRICS_URL}?assessment_id=${assessment_id}`, { method: 'GET' });
  return handleResponse<Record<string, Rubric>>(res);
}

/**
 * Fetch a single rubric by ID.
 *
 * @param id - ObjectId of the rubric
 *
 * @example
 * getRubricById('665f...')
 */
export async function getRubricById(id: string): Promise<Rubric> {
  const res = await fetch(`${RUBRICS_URL}?id=${id}`, { method: 'GET' });
  return handleResponse<Rubric>(res);
}

/**
 * Add a rubric criteria to an assessment.
 * PO weights in program_outcomes must total 100.
 * levels must contain: excellent, good, fair, poor.
 *
 * @param data.assessment_id    - ObjectId of the assessment
 * @param data.criteria         - Criteria name e.g. "Problem Solving"
 * @param data.program_outcomes - PO weights e.g. { A: 60, B: 40 } (must total 100)
 * @param data.levels           - { excellent, good, fair, poor } descriptions
 * @param data.order            - (optional) Position order; auto-increments if omitted
 *
 * @example
 * createRubric({
 *   assessment_id: '665f...',
 *   criteria: 'Problem Solving',
 *   program_outcomes: { A: 60, B: 40 },
 *   levels: {
 *     excellent: 'Demonstrates complete mastery...',
 *     good: 'Demonstrates adequate understanding...',
 *     fair: 'Demonstrates partial understanding...',
 *     poor: 'Lacks understanding...',
 *   },
 * })
 */
export async function createRubric(
  data: Omit<Rubric, '_id' | 'createdAt' | 'updatedAt'>
): Promise<{ message: string; id: string }> {
  const res = await fetch(RUBRICS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * Update an existing rubric.
 *
 * @param id   - ObjectId of the rubric to update
 * @param data - Same shape as createRubric
 *
 * @example
 * updateRubric('665f...', { assessment_id: '...', criteria: 'Updated', program_outcomes: { A: 100 }, levels: { ... } })
 */
export async function updateRubric(
  id: string,
  data: Omit<Rubric, '_id' | 'createdAt' | 'updatedAt'>
): Promise<{ message: string; rubric: Rubric }> {
  const res = await fetch(`${RUBRICS_URL}?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * Delete a single rubric by ID.
 * Also cascade deletes its rubric_results.
 *
 * @param id - ObjectId of the rubric to delete
 *
 * @example
 * deleteRubric('665f...')
 */
export async function deleteRubric(id: string): Promise<{ message: string }> {
  const res = await fetch(`${RUBRICS_URL}?id=${id}`, { method: 'DELETE' });
  return handleResponse(res);
}

/**
 * Delete all rubrics for an assessment.
 * Also cascade deletes all rubric_results.
 *
 * @param assessment_id - ObjectId of the assessment
 *
 * @example
 * deleteAllRubrics('665f...')
 */
export async function deleteAllRubrics(assessment_id: string): Promise<{ message: string }> {
  const res = await fetch(`${RUBRICS_URL}?assessment_id=${assessment_id}`, { method: 'DELETE' });
  return handleResponse(res);
}

// ═════════════════════════════════════════════════════════════
// STUDENT ASSESSMENTS  →  /api/assessments/student-assessments
// ═════════════════════════════════════════════════════════════

const STUDENT_ASSESSMENTS_URL = '/api/assessments/student-assessments';

/**
 * Fetch student assessment submissions.
 * All results include computed po_scores.
 *
 * @param params.assessment_id - (optional) Filter by assessment ObjectId
 * @param params.block_id      - (optional) Filter by block ObjectId
 * @param params.student_id    - (optional) Filter by student ObjectId
 *
 * @example
 * // All submissions for a block in an assessment
 * getAllStudentAssessments({ assessment_id: '665f...', block_id: '665f...' })
 *
 * // All submissions for a student
 * getAllStudentAssessments({ student_id: '665f...' })
 */
export async function getAllStudentAssessments(
  params: { assessment_id?: string; block_id?: string; student_id?: string } = {}
): Promise<StudentAssessment[]> {
  const query = new URLSearchParams();
  if (params.assessment_id) query.set('assessment_id', params.assessment_id);
  if (params.block_id) query.set('block_id', params.block_id);
  if (params.student_id) query.set('student_id', params.student_id);

  const url = `${STUDENT_ASSESSMENTS_URL}?${query}`;
  const res = await fetch(url, { method: 'GET' });
  return handleResponse<StudentAssessment[]>(res);
}

/**
 * Fetch a single student assessment by ID.
 * Response includes full joins and computed po_scores.
 *
 * @param id - ObjectId of the student_assessment
 *
 * @example
 * getStudentAssessmentById('665f...')
 */
export async function getStudentAssessmentById(id: string): Promise<StudentAssessment> {
  const res = await fetch(`${STUDENT_ASSESSMENTS_URL}?id=${id}`, { method: 'GET' });
  return handleResponse<StudentAssessment>(res);
}

/**
 * Create a student assessment submission record.
 * One submission per student per assessment per block.
 *
 * @param data.assessment_id - ObjectId of the assessment
 * @param data.block_id      - ObjectId of the block
 * @param data.student_id    - ObjectId of the student
 *
 * @example
 * createStudentAssessment({
 *   assessment_id: '665f...',
 *   block_id: '665f...',
 *   student_id: '665f...',
 * })
 */
export async function createStudentAssessment(
  data: Omit<StudentAssessment, '_id' | 'submitted_at' | 'createdAt' | 'updatedAt' | 'assessment' | 'block' | 'student' | 'po_scores'>
): Promise<{ message: string; id: string }> {
  const res = await fetch(STUDENT_ASSESSMENTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * Update a student assessment submission.
 *
 * @param id   - ObjectId of the student_assessment to update
 * @param data - Same shape as createStudentAssessment
 *
 * @example
 * updateStudentAssessment('665f...', { assessment_id: '...', block_id: '...', student_id: '...' })
 */
export async function updateStudentAssessment(
  id: string,
  data: Omit<StudentAssessment, '_id' | 'submitted_at' | 'createdAt' | 'updatedAt' | 'assessment' | 'block' | 'student' | 'po_scores'>
): Promise<{ message: string; student_assessment: StudentAssessment }> {
  const res = await fetch(`${STUDENT_ASSESSMENTS_URL}?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * Delete a student assessment and cascade delete its results.
 *
 * @param id - ObjectId of the student_assessment to delete
 *
 * @example
 * deleteStudentAssessment('665f...')
 */
export async function deleteStudentAssessment(id: string): Promise<{ message: string }> {
  const res = await fetch(`${STUDENT_ASSESSMENTS_URL}?id=${id}`, { method: 'DELETE' });
  return handleResponse(res);
}

/**
 * Delete all student assessments for an assessment + cascade.
 *
 * @param assessment_id - ObjectId of the assessment
 *
 * @example
 * deleteAllStudentAssessments('665f...')
 */
export async function deleteAllStudentAssessments(
  assessment_id: string
): Promise<{ message: string }> {
  const res = await fetch(`${STUDENT_ASSESSMENTS_URL}?assessment_id=${assessment_id}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

// ═════════════════════════════════════════════════════════════
// QUESTION RESULTS  →  /api/assessments/question/question-results
// ═════════════════════════════════════════════════════════════

const QUESTION_RESULTS_URL = '/api/assessments/question/question-results';

/**
 * Fetch all question results for a student submission.
 * Response includes computed po_scores.
 *
 * @param student_assessment_id - ObjectId of the student_assessment
 *
 * @example
 * getQuestionResults('665f...')
 */
export async function getQuestionResults(
  student_assessment_id: string
): Promise<{ results: QuestionResult[]; po_scores: Record<string, number> }> {
  const res = await fetch(
    `${QUESTION_RESULTS_URL}?student_assessment_id=${student_assessment_id}`,
    { method: 'GET' }
  );
  return handleResponse(res);
}

/**
 * Fetch a single question result by ID.
 *
 * @param id - ObjectId of the question_result
 *
 * @example
 * getQuestionResultById('665f...')
 */
export async function getQuestionResultById(id: string): Promise<QuestionResult> {
  const res = await fetch(`${QUESTION_RESULTS_URL}?id=${id}`, { method: 'GET' });
  return handleResponse<QuestionResult>(res);
}

/**
 * Submit a question result for a student.
 * Returns updated po_scores after submission.
 *
 * @param data.student_assessment_id - ObjectId of the student_assessment
 * @param data.question_id           - ObjectId of the question
 * @param data.is_correct            - true | false
 *
 * @example
 * createQuestionResult({
 *   student_assessment_id: '665f...',
 *   question_id: '665f...',
 *   is_correct: true,
 * })
 */
export async function createQuestionResult(
  data: Omit<QuestionResult, '_id' | 'createdAt' | 'updatedAt' | 'question' | 'student_assessment'>
): Promise<{ message: string; id: string; po_scores: Record<string, number> }> {
  const res = await fetch(QUESTION_RESULTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * Update a question result (change is_correct).
 * Returns updated po_scores after update.
 *
 * @param id         - ObjectId of the question_result to update
 * @param is_correct - true | false
 *
 * @example
 * updateQuestionResult('665f...', false)
 */
export async function updateQuestionResult(
  id: string,
  is_correct: boolean
): Promise<{ message: string; question_result: QuestionResult; po_scores: Record<string, number> }> {
  const res = await fetch(`${QUESTION_RESULTS_URL}?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_correct }),
  });
  return handleResponse(res);
}

/**
 * Delete a single question result by ID.
 *
 * @param id - ObjectId of the question_result to delete
 *
 * @example
 * deleteQuestionResult('665f...')
 */
export async function deleteQuestionResult(id: string): Promise<{ message: string }> {
  const res = await fetch(`${QUESTION_RESULTS_URL}?id=${id}`, { method: 'DELETE' });
  return handleResponse(res);
}

/**
 * Delete all question results for a student submission.
 *
 * @param student_assessment_id - ObjectId of the student_assessment
 *
 * @example
 * deleteAllQuestionResults('665f...')
 */
export async function deleteAllQuestionResults(
  student_assessment_id: string
): Promise<{ message: string }> {
  const res = await fetch(
    `${QUESTION_RESULTS_URL}?student_assessment_id=${student_assessment_id}`,
    { method: 'DELETE' }
  );
  return handleResponse(res);
}

// ═════════════════════════════════════════════════════════════
// RUBRIC RESULTS  →  /api/assessments/rubrics/rubric-results
// ═════════════════════════════════════════════════════════════

const RUBRIC_RESULTS_URL = '/api/assessments/rubrics/rubric-results';

/**
 * Fetch all rubric results for a student submission.
 * Response includes computed po_scores.
 *
 * @param student_assessment_id - ObjectId of the student_assessment
 *
 * @example
 * getRubricResults('665f...')
 */
export async function getRubricResults(
  student_assessment_id: string
): Promise<{ results: RubricResult[]; po_scores: Record<string, number> }> {
  const res = await fetch(
    `${RUBRIC_RESULTS_URL}?student_assessment_id=${student_assessment_id}`,
    { method: 'GET' }
  );
  return handleResponse(res);
}

/**
 * Fetch a single rubric result by ID.
 *
 * @param id - ObjectId of the rubric_result
 *
 * @example
 * getRubricResultById('665f...')
 */
export async function getRubricResultById(id: string): Promise<RubricResult> {
  const res = await fetch(`${RUBRIC_RESULTS_URL}?id=${id}`, { method: 'GET' });
  return handleResponse<RubricResult>(res);
}

/**
 * Submit a rubric result for a student.
 * Score is auto-derived from level: excellent=100, good=85, fair=70, poor=50.
 * Returns updated po_scores after submission.
 *
 * @param data.student_assessment_id - ObjectId of the student_assessment
 * @param data.rubric_id             - ObjectId of the rubric
 * @param data.level                 - "excellent" | "good" | "fair" | "poor"
 *
 * @example
 * createRubricResult({
 *   student_assessment_id: '665f...',
 *   rubric_id: '665f...',
 *   level: 'excellent',
 * })
 */
export async function createRubricResult(
  data: Omit<RubricResult, '_id' | 'score' | 'createdAt' | 'updatedAt' | 'rubric' | 'student_assessment'>
): Promise<{ message: string; id: string; score: number; po_scores: Record<string, number> }> {
  const res = await fetch(RUBRIC_RESULTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * Update a rubric result (change level).
 * Score is auto-updated from the new level.
 * Returns updated po_scores after update.
 *
 * @param id    - ObjectId of the rubric_result to update
 * @param level - "excellent" | "good" | "fair" | "poor"
 *
 * @example
 * updateRubricResult('665f...', 'good')
 */
export async function updateRubricResult(
  id: string,
  level: 'excellent' | 'good' | 'fair' | 'poor'
): Promise<{ message: string; rubric_result: RubricResult; po_scores: Record<string, number> }> {
  const res = await fetch(`${RUBRIC_RESULTS_URL}?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ level }),
  });
  return handleResponse(res);
}

/**
 * Delete a single rubric result by ID.
 *
 * @param id - ObjectId of the rubric_result to delete
 *
 * @example
 * deleteRubricResult('665f...')
 */
export async function deleteRubricResult(id: string): Promise<{ message: string }> {
  const res = await fetch(`${RUBRIC_RESULTS_URL}?id=${id}`, { method: 'DELETE' });
  return handleResponse(res);
}

/**
 * Delete all rubric results for a student submission.
 *
 * @param student_assessment_id - ObjectId of the student_assessment
 *
 * @example
 * deleteAllRubricResults('665f...')
 */
export async function deleteAllRubricResults(
  student_assessment_id: string
): Promise<{ message: string }> {
  const res = await fetch(
    `${RUBRIC_RESULTS_URL}?student_assessment_id=${student_assessment_id}`,
    { method: 'DELETE' }
  );
  return handleResponse(res);
}