const BASE_URL = '/api/pc_reports';

// Fetch all data for the PC Reports & Analytics page.
// Returns { students[], gts: { schema[], responses[] }, detVersion, weightsVersion }
export async function getPcReports() {
    const res = await fetch(BASE_URL);
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error ?? 'Failed to fetch reports');
    }

    return data;
}
