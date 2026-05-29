const BASE_URL = '/api/weights';

export async function createWeights(payload: {
    version: string;
    program: string;
    data: Record<string, Record<string, string>>;
}) {
    const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to create weights');
    return data;
}

export async function getAllWeights() {
    const res = await fetch(BASE_URL);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to fetch weights');
    return data;
}

export async function getWeightsByVersion(version: string) {
    const res = await fetch(`${BASE_URL}?version=${version}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to fetch weights by version');
    return data;
}

export async function getWeightsByVersionAndProgram(version: string, program: string) {
    const res = await fetch(`${BASE_URL}?version=${version}&program=${program}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to fetch weights');
    return data;
}

export async function updateWeights(id: string, payload: {
    version: string;
    program: string;
    data: Record<string, Record<string, string>>;
}) {
    const res = await fetch(`${BASE_URL}?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to update weights');
    return data;
}

export async function deleteWeights(id: string) {
    const res = await fetch(`${BASE_URL}?id=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to delete weights');
    return data;
}