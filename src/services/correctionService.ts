import { CorrectionPayload } from "@/shared/types/CorrectionPayload";
const BASE_PATH = "/api/corrections";

/* =========================
   CREATE CORRECTION
========================= */
export async function createCorrection(payload: CorrectionPayload) {
  const res = await fetch(BASE_PATH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return await res.json();
}


/* =========================
   GET CORRECTIONS
========================= */

export async function getCorrections() {
  const res = await fetch(BASE_PATH);
  return await res.json();
}

export async function getCorrectionById(id: string) {
  const res = await fetch(`${BASE_PATH}?id=${id}`);
  return await res.json();
}

export async function getCorrectionsByStudent(student_id: string) {
  const res = await fetch(`${BASE_PATH}?student_id=${student_id}`);
  return await res.json();
}

export async function getCorrectionsByProgram(program: string) {
  const res = await fetch(`${BASE_PATH}?program=${program}`);
  return await res.json();
}

export async function getCorrectionsByStatus(status: string) {
  const res = await fetch(`${BASE_PATH}?status=${status}`);
  return await res.json();
}

export async function getCorrectionsFiltered(filters: {
  student_id?: string;
  program?: string;
  status?: string;
}) {
  const params = new URLSearchParams();

  if (filters.student_id)
    params.append("student_id", filters.student_id);

  if (filters.program)
    params.append("program", filters.program);

  if (filters.status)
    params.append("status", filters.status);

  const res = await fetch(`${BASE_PATH}?${params.toString()}`);

  return await res.json();
}


/* =========================
   COUNT CORRECTIONS
========================= */

export async function countCorrections(filters?: {
  program?: string;
  status?: string;
}) {
  const params = new URLSearchParams({
    count: "true",
  });

  if (filters?.program)
    params.append("program", filters.program);

  if (filters?.status)
    params.append("status", filters.status);

  const res = await fetch(`${BASE_PATH}?${params.toString()}`);

  return await res.json();
}


/* =========================
   UPDATE CORRECTION
========================= */

export async function updateCorrection(
  id: string,
  payload: CorrectionPayload
) {
  const res = await fetch(`${BASE_PATH}?id=${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return await res.json();
}


/* =========================
   DELETE CORRECTION
========================= */

export async function deleteCorrection(id: string) {
  const res = await fetch(`${BASE_PATH}?id=${id}`, {
    method: "DELETE",
  });

  return await res.json();
}