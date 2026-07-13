const BASE_URL = '/api/surveys';

// ─── CREATE ───────────────────────────────────────────────────────────────────
export async function createSurvey(payload: {
    version: string;
    type: string;
    title: string;
    description?: string;
    questions?: Record<string, any>;
}) {
    const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to create survey');
    return data;
}

// ─── GET ALL ──────────────────────────────────────────────────────────────────
export async function getAllSurveys() {
    const res = await fetch(BASE_URL);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to fetch surveys');
    return data;
}

// ─── GET BY ID ────────────────────────────────────────────────────────────────
export async function getSurveyById(id: string) {
    const res = await fetch(`${BASE_URL}?id=${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to fetch survey');
    return data;
}

// ─── GET BY VERSION ───────────────────────────────────────────────────────────
export async function getSurveysByVersion(version: string) {
    const res = await fetch(`${BASE_URL}?version=${version}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to fetch surveys by version');
    return data;
}

// ─── GET BY TYPE ──────────────────────────────────────────────────────────────
export async function getSurveysByType(type: string) {
    const res = await fetch(`${BASE_URL}?type=${type}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to fetch surveys by type');
    return data;
}

// ─── GET BY VERSION + TYPE ────────────────────────────────────────────────────
export async function getSurveysByVersionAndType(version: string, type: string) {
    const res = await fetch(`${BASE_URL}?version=${version}&type=${type}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to fetch surveys by version and type');
    return data;
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────
export async function updateSurvey(id: string, payload: {
    version: string;
    type: string;
    title: string;
    description?: string;
    questions?: Record<string, any>;
}) {
    const res = await fetch(`${BASE_URL}?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to update survey');
    return data;
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
export async function deleteSurvey(id: string) {
    const res = await fetch(`${BASE_URL}?id=${id}`, {
        method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to delete survey');
    return data;
}