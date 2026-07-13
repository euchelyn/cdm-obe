const BASE_URL = '/api/pc_overview';

// Fetch the Program Chair overview headline numbers.
// Returns { totalAlumni, tracerCompletionRate, tracerCompletedCount,
//           pendingDirectAssessments, assessedCount }
export async function getProgramOverview() {
    const res = await fetch(BASE_URL);
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error ?? 'Failed to fetch program overview');
    }

    return data;
}
