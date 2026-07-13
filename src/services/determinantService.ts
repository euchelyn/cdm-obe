const BASE_URL = '/api/determinants';

// ─── CREATE ───────────────────────────────────────────────────────────────────
export async function createDeterminant(payload: {
    version: string;
    program: string;
    year_level: string;
    data: Record<string, Record<string, boolean>>;
}) {
    const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to create determinant');
    return data;
}

// ─── GET ALL ──────────────────────────────────────────────────────────────────
export async function getAllDeterminants() {
    const res = await fetch(BASE_URL);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to fetch determinants');
    return data;
}

// ─── GET BY ID ────────────────────────────────────────────────────────────────
export async function getDeterminantById(id: string) {
    const res = await fetch(`${BASE_URL}?id=${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to fetch determinant');
    return data;
}

// ─── GET BY VERSION ───────────────────────────────────────────────────────────
export async function getDeterminantsByVersion(version: string) {
    const res = await fetch(`${BASE_URL}?version=${version}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to fetch determinants by version');
    return data;
}

// ─── GET BY PROGRAM ───────────────────────────────────────────────────────────
export async function getDeterminantsByProgram(program: string) {
    const res = await fetch(`${BASE_URL}?program=${program}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to fetch determinants by program');
    return data;
}

// ─── GET BY YEAR LEVEL ────────────────────────────────────────────────────────
export async function getDeterminantsByYearLevel(year_level: string) {
    const res = await fetch(`${BASE_URL}?year_level=${year_level}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to fetch determinants by year level');
    return data;
}

// ─── GET BY VERSION + PROGRAM ─────────────────────────────────────────────────
export async function getDeterminantsByVersionAndProgram(version: string, program: string) {
    const res = await fetch(`${BASE_URL}?version=${version}&program=${program}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to fetch determinants by version and program');
    return data;
}

// ─── GET BY VERSION + PROGRAM + YEAR LEVEL ───────────────────────────────────
export async function getDeterminantsByAllFilters(version: string, program: string, year_level: string) {
    const res = await fetch(`${BASE_URL}?version=${version}&program=${program}&year_level=${year_level}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to fetch determinants by all filters');
    return data;
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────
export async function updateDeterminant(id: string, payload: {
    version: string;
    program: string;
    year_level: string;
    data: Record<string, Record<string, boolean>>;
}) {
    const res = await fetch(`${BASE_URL}?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to update determinant');
    return data;
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
export async function deleteDeterminant(id: string) {
    const res = await fetch(`${BASE_URL}?id=${id}`, {
        method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to delete determinant');
    return data;
}