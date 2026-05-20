/**
 * masterlistService.ts
 * ─────────────────────────────────────────────────────────────
 * Centralised service for all student-related API calls.
 *
 * Base endpoints:
 *   /api/students
 * ─────────────────────────────────────────────────────────────
 */

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
import { Student } from "@/types/Student";
import { StudentPaginatedResponse } from "@/types/StudentPaginatedResponse";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'An unexpected error occurred');
  return data as T;
}

// ═════════════════════════════════════════════════════════════
// STUDENTS  →  /api/students
// ═════════════════════════════════════════════════════════════

const STUDENTS_URL = '/api/students';

/**
 * Fetch all students with pagination.
 *
 * @param page  - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @param batch - (optional) Filter by batch
 *
 * @example
 * getStudents(1, 10)
 * getStudents(1, 10, '2021')
 */
export async function getStudents(
  page: number = 1,
  limit: number = 10,
  batch?: string
): Promise<StudentPaginatedResponse> {
  let url = `${STUDENTS_URL}?page=${page}&limit=${limit}`;

  if (batch && batch !== "All") {
    url += `&batch=${encodeURIComponent(batch)}`;
  }

  const res = await fetch(url, { method: 'GET' });
  return handleResponse<StudentPaginatedResponse>(res);
}

/**
 * Fetch all students (non-paginated, for masterlist).
 *
 * @example
 * getAllStudents()
 */
export async function getAllStudents(): Promise<Student[]> {
  const page = 1;
  const limit = 10000;
  
  const res = await fetch(`${STUDENTS_URL}?page=${page}&limit=${limit}`, { 
    method: 'GET' 
  });
  const data = await handleResponse<StudentPaginatedResponse>(res);
  return data.data;
}

/**
 * Fetch a single student by ID.
 *
 * @param id - ObjectId of the student
 *
 * @example
 * getStudentById('665f...')
 */
export async function getStudentById(id: string): Promise<Student> {
  const res = await fetch(`${STUDENTS_URL}?id=${id}`, { method: 'GET' });
  return handleResponse<Student>(res);
}

/**
 * Create a new student.
 *
 * @param student - Student data object
 *
 * @example
 * createStudent({
 *   id: '20214213581',
 *   name: 'John Doe',
 *   batch: '2021',
 *   program: 'BS CpE',
 *   birthday: '01/01/2000',
 *   status: 'Active'
 * })
 */
export async function createStudent(
  student: Omit<Student, '_id' | 'createdAt' | 'updatedAt'>
): Promise<{ message: string; id: string }> {
  const res = await fetch(STUDENTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student),
  });
  return handleResponse(res);
}

/**
 * Update an existing student.
 *
 * @param id      - ObjectId of the student
 * @param updates - Partial student data to update
 *
 * @example
 * updateStudent('665f...', { name: 'John Smith', status: 'Inactive' })
 */
export async function updateStudent(
  id: string,
  updates: Partial<Student>
): Promise<{ message: string; student: Student }> {
  const res = await fetch(STUDENTS_URL, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates }),
  });
  return handleResponse(res);
}

/**
 * Delete a student by ID.
 *
 * @param id - ObjectId of the student to delete
 *
 * @example
 * deleteStudent('665f...')
 */
export async function deleteStudent(id: string): Promise<{ message: string }> {
  const res = await fetch(`${STUDENTS_URL}?id=${id}`, { method: 'DELETE' });
  return handleResponse(res);
}

/**
 * Search students by name or ID.
 *
 * @param search - Search term (name or student ID)
 * @param page   - Page number (default: 1)
 * @param limit  - Items per page (default: 10)
 * @param batch  - (optional) Filter by batch
 *
 * @example
 * searchStudentsByName('mona')
 * searchStudentsByName('mona', 1, 10, '2021')
 */
export async function searchStudentsByName(
  search: string,
  page: number = 1,
  limit: number = 10,
  batch?: string
): Promise<StudentPaginatedResponse> {
  let url = `${STUDENTS_URL}?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`;

  if (batch && batch !== "All") {
    url += `&batch=${encodeURIComponent(batch)}`;
  }

  const res = await fetch(url, { method: 'GET' });
  return handleResponse<StudentPaginatedResponse>(res);
}

/**
 * Quick search students (returns just students array).
 * Use this for dropdown searches.
 *
 * @param search - Search term
 *
 * @example
 * searchStudentsForSelect('lisa')
 */
export async function searchStudentsForSelect(
  search: string
): Promise<Student[]> {
  const res = await fetch(`${STUDENTS_URL}?search=${encodeURIComponent(search)}&page=1&limit=10`, { 
    method: 'GET' 
  });
  const data = await handleResponse<StudentPaginatedResponse>(res);
  return data.data;
}