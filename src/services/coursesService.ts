const BASE_URL = '/api/courses';

export interface Course {
  _id?: string;
  version: string;
  program: string;
  code: string;
  course: string;
  year_level: string;
  createdAt?: string;
  updatedAt?: string;
}

// GET - Fetch all courses
export async function getAllCourses(): Promise<Course[]> {
  const res = await fetch(BASE_URL, {
    method: 'GET',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to fetch courses');
  }

  return res.json();
}

// GET - Fetch a single course by ID
export async function getCourseById(id: string): Promise<Course> {
  const res = await fetch(`${BASE_URL}?id=${id}`, {
    method: 'GET',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `Failed to fetch course with id: ${id}`);
  }

  return res.json();
}

// POST - Create a new course
export async function createCourse(data: Omit<Course, '_id' | 'createdAt' | 'updatedAt'>): Promise<{ message: string; id: string }> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create course');
  }

  return res.json();
}

// PUT - Update a course by ID
export async function updateCourse(id: string, data: Omit<Course, '_id' | 'createdAt' | 'updatedAt'>): Promise<{ message: string; course: Course }> {
  const res = await fetch(`${BASE_URL}?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `Failed to update course with id: ${id}`);
  }

  return res.json();
}

// DELETE - Delete a course by ID
export async function deleteCourse(id: string): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}?id=${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `Failed to delete course with id: ${id}`);
  }

  return res.json();
}