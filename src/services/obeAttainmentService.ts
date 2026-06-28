const BASE_URL = '/api/obe_attainment';

// Fetch a student's computed Program Outcome attainment.
// Returns { version, hasGrades, pos: { [PO]: { attainment, totalWeight, gradedWeight, courses[] } } }
export async function getObeAttainment(
    student_id: string,
    version?: string
) {
    const params = new URLSearchParams();
    params.append('student_id', student_id);
    if (version) params.append('version', version);

    const res = await fetch(`${BASE_URL}?${params.toString()}`);
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error ?? 'Failed to fetch OBE attainment');
    }

    return data;
}
