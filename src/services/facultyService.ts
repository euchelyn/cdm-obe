/**
 * facultyService.ts
 * ─────────────────────────────────────────────────────────────
 * Centralised service for all faculty-related API calls.
 *
 * Base endpoints:
 *   /api/masterlist/grades
 *   /api/blocks
 *   /api/blocks/block_students
 *   /api/courses/faculty_courses
 * ─────────────────────────────────────────────────────────────
 */

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
import { FacultyCourse } from "@/types/FacultyCourse";
import { Block } from "@/types/Block";
import { BlockStudent } from "@/types/BlockStudent";
import { Grade } from "@/types/Grade";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'An unexpected error occurred');
  return data as T;
}

// ═════════════════════════════════════════════════════════════
// FACULTY COURSES  →  /api/courses/faculty_courses
// ═════════════════════════════════════════════════════════════

const FACULTY_COURSES_URL = '/api/courses/faculty_courses';

/**
 * Fetch all faculty course assignments.
 * Optionally filter by faculty or course.
 *
 * @param params.faculty_id  - (optional) Filter by faculty ObjectId
 * @param params.course_id   - (optional) Filter by course ObjectId
 *
 * @example
 * // All assignments
 * getAllFacultyCourses()
 *
 * // All courses taught by a specific faculty
 * getAllFacultyCourses({ faculty_id: '665f...' })
 */
export async function getAllFacultyCourses(
  params: { faculty_id?: string; course_id?: string } = {}
): Promise<FacultyCourse[]> {
  const query = new URLSearchParams();
  if (params.faculty_id) query.set('faculty_id', params.faculty_id);
  if (params.course_id) query.set('course_id', params.course_id);

  const url = query.toString() ? `${FACULTY_COURSES_URL}?${query}` : FACULTY_COURSES_URL;
  const res = await fetch(url, { method: 'GET' });
  return handleResponse<FacultyCourse[]>(res);
}

/**
 * Fetch a single faculty course assignment by its ID.
 *
 * @param id - ObjectId of the faculty_course record
 *
 * @example
 * getFacultyCourseById('665f...')
 */
export async function getFacultyCourseById(id: string): Promise<FacultyCourse> {
  const res = await fetch(`${FACULTY_COURSES_URL}?id=${id}`, { method: 'GET' });
  return handleResponse<FacultyCourse>(res);
}

/**
 * Assign a course to a faculty member.
 *
 * @param data.faculty_id   - ObjectId of the faculty
 * @param data.course_id    - ObjectId of the course
 * @param data.school_year  - e.g. "2024-2025"
 * @param data.semester     - e.g. "1st" | "2nd"
 *
 * @example
 * createFacultyCourse({
 *   faculty_id: '665f...',
 *   course_id:  '665f...',
 *   school_year: '2024-2025',
 *   semester: '1st',
 * })
 */
export async function createFacultyCourse(
  data: Omit<FacultyCourse, '_id' | 'createdAt' | 'updatedAt' | 'faculty' | 'course'>
): Promise<{ message: string; id: string }> {
  const res = await fetch(FACULTY_COURSES_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * Update an existing faculty course assignment.
 *
 * @param id                - ObjectId of the faculty_course record to update
 * @param data.faculty_id   - ObjectId of the faculty
 * @param data.course_id    - ObjectId of the course
 * @param data.school_year  - e.g. "2024-2025"
 * @param data.semester     - e.g. "1st" | "2nd"
 *
 * @example
 * updateFacultyCourse('665f...', { faculty_id: '...', course_id: '...', school_year: '2024-2025', semester: '2nd' })
 */
export async function updateFacultyCourse(
  id: string,
  data: Omit<FacultyCourse, '_id' | 'createdAt' | 'updatedAt' | 'faculty' | 'course'>
): Promise<{ message: string; faculty_course: FacultyCourse }> {
  const res = await fetch(`${FACULTY_COURSES_URL}?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * Delete a faculty course assignment by ID.
 *
 * @param id - ObjectId of the faculty_course record to delete
 *
 * @example
 * deleteFacultyCourse('665f...')
 */
export async function deleteFacultyCourse(id: string): Promise<{ message: string }> {
  const res = await fetch(`${FACULTY_COURSES_URL}?id=${id}`, { method: 'DELETE' });
  return handleResponse(res);
}

// ═════════════════════════════════════════════════════════════
// BLOCKS  →  /api/blocks
// ═════════════════════════════════════════════════════════════

const BLOCKS_URL = '/api/masterlist/blocks';

/**
 * Fetch all blocks.
 * Optionally filter by faculty_course.
 *
 * @param params.faculty_course_id - (optional) Filter by faculty_course ObjectId
 *
 * @example
 * // All blocks
 * getAllBlocks()
 *
 * // Blocks under a specific faculty course
 * getAllBlocks({ faculty_course_id: '665f...' })
 */
export async function getAllBlocks(
  params: { faculty_course_id?: string } = {}
): Promise<Block[]> {
  const query = new URLSearchParams();
  if (params.faculty_course_id) query.set('faculty_course_id', params.faculty_course_id);

  const url = query.toString() ? `${BLOCKS_URL}?${query}` : BLOCKS_URL;
  const res = await fetch(url, { method: 'GET' });
  return handleResponse<Block[]>(res);
}

/**
 * Fetch a single block by its ID.
 *
 * @param id - ObjectId of the block
 *
 * @example
 * getBlockById('665f...')
 */
export async function getBlockById(id: string): Promise<Block> {
  const res = await fetch(`${BLOCKS_URL}?id=${id}`, { method: 'GET' });
  return handleResponse<Block>(res);
}

/**
 * Create a new block under a faculty course.
 *
 * @param data.faculty_course_id - ObjectId of the faculty_course
 * @param data.name              - Block name e.g. "CpE 2A"
 * @param data.school_year       - e.g. "2024-2025"
 * @param data.semester          - e.g. "1st" | "2nd"
 *
 * @example
 * createBlock({
 *   faculty_course_id: '665f...',
 *   name: 'CpE 2A',
 *   school_year: '2024-2025',
 *   semester: '1st',
 * })
 */
export async function createBlock(
  data: Omit<Block, '_id' | 'createdAt' | 'updatedAt' | 'faculty_course'>
): Promise<{ message: string; id: string }> {
  const res = await fetch(BLOCKS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * Update an existing block.
 *
 * @param id                     - ObjectId of the block to update
 * @param data.faculty_course_id - ObjectId of the faculty_course
 * @param data.name              - Block name e.g. "CpE 2B"
 * @param data.school_year       - e.g. "2024-2025"
 * @param data.semester          - e.g. "1st" | "2nd"
 *
 * @example
 * updateBlock('665f...', { faculty_course_id: '...', name: 'CpE 2B', school_year: '2024-2025', semester: '1st' })
 */
export async function updateBlock(
  id: string,
  data: Omit<Block, '_id' | 'createdAt' | 'updatedAt' | 'faculty_course'>
): Promise<{ message: string; block: Block }> {
  const res = await fetch(`${BLOCKS_URL}?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * Delete a block by ID.
 *
 * @param id - ObjectId of the block to delete
 *
 * @example
 * deleteBlock('665f...')
 */
export async function deleteBlock(id: string): Promise<{ message: string }> {
  const res = await fetch(`${BLOCKS_URL}?id=${id}`, { method: 'DELETE' });
  return handleResponse(res);
}

// ═════════════════════════════════════════════════════════════
// BLOCK STUDENTS  →  /api/blocks/block_students
// ═════════════════════════════════════════════════════════════

const BLOCK_STUDENTS_URL = '/api/masterlist/blocks/block_students';

/**
 * Fetch all block-student enrollments.
 * Optionally filter by block or student.
 *
 * @param params.block_id   - (optional) Filter by block ObjectId
 * @param params.student_id - (optional) Filter by student ObjectId
 *
 * @example
 * // All students in a block
 * getAllBlockStudents({ block_id: '665f...' })
 *
 * // All blocks a student is enrolled in
 * getAllBlockStudents({ student_id: '665f...' })
 */
export async function getAllBlockStudents(
  params: { block_id?: string; student_id?: string } = {}
): Promise<BlockStudent[]> {
  const query = new URLSearchParams();
  if (params.block_id) query.set('block_id', params.block_id);
  if (params.student_id) query.set('student_id', params.student_id);

  const url = query.toString() ? `${BLOCK_STUDENTS_URL}?${query}` : BLOCK_STUDENTS_URL;
  const res = await fetch(url, { method: 'GET' });
  return handleResponse<BlockStudent[]>(res);
}

/**
 * Fetch a single block-student record by its ID.
 *
 * @param id - ObjectId of the block_student record
 *
 * @example
 * getBlockStudentById('665f...')
 */
export async function getBlockStudentById(id: string): Promise<BlockStudent> {
  const res = await fetch(`${BLOCK_STUDENTS_URL}?id=${id}`, { method: 'GET' });
  return handleResponse<BlockStudent>(res);
}

/**
 * Enroll a student into a block.
 *
 * @param data.block_id   - ObjectId of the block
 * @param data.student_id - ObjectId of the student
 *
 * @example
 * createBlockStudent({
 *   block_id:   '665f...',
 *   student_id: '665f...',
 * })
 */
export async function createBlockStudent(
  data: Omit<BlockStudent, '_id' | 'createdAt' | 'updatedAt' | 'block' | 'student'>
): Promise<{ message: string; id: string }> {
  const res = await fetch(BLOCK_STUDENTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * Move a student to a different block.
 *
 * @param id              - ObjectId of the block_student record to update
 * @param data.block_id   - ObjectId of the new block
 * @param data.student_id - ObjectId of the student
 *
 * @example
 * updateBlockStudent('665f...', { block_id: '665f...', student_id: '665f...' })
 */
export async function updateBlockStudent(
  id: string,
  data: Omit<BlockStudent, '_id' | 'createdAt' | 'updatedAt' | 'block' | 'student'>
): Promise<{ message: string; block_student: BlockStudent }> {
  const res = await fetch(`${BLOCK_STUDENTS_URL}?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * Remove a student from a block.
 *
 * @param id - ObjectId of the block_student record to delete
 *
 * @example
 * deleteBlockStudent('665f...')
 */
export async function deleteBlockStudent(id: string): Promise<{ message: string }> {
  const res = await fetch(`${BLOCK_STUDENTS_URL}?id=${id}`, { method: 'DELETE' });
  return handleResponse(res);
}

// ═════════════════════════════════════════════════════════════
// GRADES  →  /api/masterlist/grades
// ═════════════════════════════════════════════════════════════

const GRADES_URL = '/api/masterlist/grades';

/**
 * Fetch all grades.
 * Optionally filter by block, student, or both.
 *
 * @param params.block_id   - (optional) Filter by block ObjectId
 * @param params.student_id - (optional) Filter by student ObjectId
 *
 * @example
 * // All grades in a block (grade sheet)
 * getAllGrades({ block_id: '665f...' })
 *
 * // All grades of a student across all courses
 * getAllGrades({ student_id: '665f...' })
 *
 * // A student's grade in a specific block
 * getAllGrades({ block_id: '665f...', student_id: '665f...' })
 */
export async function getAllGrades(
  params: { block_id?: string; student_id?: string } = {}
): Promise<Grade[]> {
  const query = new URLSearchParams();
  if (params.block_id) query.set('block_id', params.block_id);
  if (params.student_id) query.set('student_id', params.student_id);

  const url = query.toString() ? `${GRADES_URL}?${query}` : GRADES_URL;
  const res = await fetch(url, { method: 'GET' });
  return handleResponse<Grade[]>(res);
}

/**
 * Fetch a single grade record by its ID.
 *
 * @param id - ObjectId of the grade record
 *
 * @example
 * getGradeById('665f...')
 */
export async function getGradeById(id: string): Promise<Grade> {
  const res = await fetch(`${GRADES_URL}?id=${id}`, { method: 'GET' });
  return handleResponse<Grade>(res);
}

/**
 * Submit a grade for a student in a block.
 *
 * @param data.block_id   - ObjectId of the block
 * @param data.student_id - ObjectId of the student
 * @param data.grade      - Numeric grade value (0–5, Philippine grading system)
 * @param data.remarks    - (optional) "PASSED" | "FAILED" | "INCOMPLETE". Auto-derived if omitted.
 *
 * @example
 * createGrade({
 *   block_id:   '665f...',
 *   student_id: '665f...',
 *   grade:      1.25,
 *   remarks:    'PASSED',
 * })
 */
export async function createGrade(
  data: Omit<Grade, '_id' | 'submitted_at' | 'createdAt' | 'updatedAt'>
): Promise<{ message: string; id: string }> {
  const res = await fetch(GRADES_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * Update an existing grade record.
 *
 * @param id              - ObjectId of the grade record to update
 * @param data.block_id   - ObjectId of the block
 * @param data.student_id - ObjectId of the student
 * @param data.grade      - Numeric grade value (0–5)
 * @param data.remarks    - (optional) "PASSED" | "FAILED" | "INCOMPLETE". Auto-derived if omitted.
 *
 * @example
 * updateGrade('665f...', { block_id: '...', student_id: '...', grade: 2.0 })
 */
export async function updateGrade(
  id: string,
  data: Omit<Grade, '_id' | 'submitted_at' | 'createdAt' | 'updatedAt'>
): Promise<{ message: string; grade: Grade }> {
  const res = await fetch(`${GRADES_URL}?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * Delete a grade record by ID.
 *
 * @param id - ObjectId of the grade record to delete
 *
 * @example
 * deleteGrade('665f...')
 */
export async function deleteGrade(id: string): Promise<{ message: string }> {
  const res = await fetch(`${GRADES_URL}?id=${id}`, { method: 'DELETE' });
  return handleResponse(res);
}