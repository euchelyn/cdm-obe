const BASE_URL = '/api/obe_grade';

export async function createObeGrade(payload: {
    student_id: string;
    det1?: string | null;
    det2?: string | null;
    det3?: string | null;
    version?: string;
    program?: string;
}) {
    const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to create OBE grade');
    return data;
}

export async function getAllObeGrades() {
    const res = await fetch(BASE_URL);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to fetch OBE grades');
    return data;
}

export async function getObeGradeById(id: string) {
    const res = await fetch(`${BASE_URL}?id=${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to fetch OBE grade');
    return data;
}

export async function getObeGradeByStudentId(student_id: string) {
    const res = await fetch(`${BASE_URL}?student_id=${student_id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to fetch OBE grade');
    return data;
}

export async function getObeGradesByVersion(version: string) {
    const res = await fetch(`${BASE_URL}?version=${version}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to fetch OBE grades by version');
    return data;
}

export async function getObeGradesByVersionAndProgram(version: string, program: string) {
    const res = await fetch(`${BASE_URL}?version=${version}&program=${program}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to fetch OBE grades');
    return data;
}

export async function getObeGradesByStatus(status: 'Pending' | 'Graded') {
    const res = await fetch(`${BASE_URL}?status=${status}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to fetch OBE grades by status');
    return data;
}

export async function updateObeGrade(id: string, payload: {
    det1?: string | null;
    det2?: string | null;
    det3?: string | null;
    version?: string;
    program?: string;
}) {
    const res = await fetch(`${BASE_URL}?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to update OBE grade');
    return data;
}

export async function deleteObeGrade(id: string) {
    const res = await fetch(`${BASE_URL}?id=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to delete OBE grade');
    return data;
}