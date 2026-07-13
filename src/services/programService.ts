const BASE_URL = '/api/curriculum/programs';

/* =========================
   BASE REQUEST WRAPPER
========================= */
async function request(url: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

/* =========================
   GET ALL PROGRAMS
========================= */
export async function getPrograms() {
  return request('');
}

/* =========================
   GET SINGLE PROGRAM
========================= */
export async function getProgramById(id: string) {
  return request(`?id=${id}`);
}

/* =========================
   CREATE PROGRAM
========================= */
export async function createProgram(payload: {
  code: string;
  program: string;
}) {
  return request('', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/* =========================
   UPDATE PROGRAM
========================= */
export async function updateProgram(payload: {
  id: string;
  code?: string;
  program?: string;
}) {
  return request('', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

/* =========================
   DELETE PROGRAM
========================= */
export async function deleteProgram(id: string) {
  return request(`?id=${id}`, {
    method: 'DELETE',
  });
}

/* =========================
   GET PROGRAM COUNT (NEW)
========================= */
export async function getProgramCount() {
  return request(`?mode=count`);
}