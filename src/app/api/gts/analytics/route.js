export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const field = searchParams.get('field') || 'employment_status';

    const mockResponses = Array(70).fill(null).map((_, i) => ({
        employment_status: i < 45 ? "Regular or Permanent" : i < 55 ? "Contractual" : i < 65 ? "Temporary" : "Self-employed",
        employment_type: i < 50 ? "Working Full-time" : i < 60 ? "Working Part-time" : "Tenured",
        occupation: i < 40 ? "Professionals" : i < 55 ? "Officials of Government" : i < 65 ? "Clerks" : "Service Workers"
    }));

    const counts = {};
    mockResponses.forEach(res => {
        const value = res[field] || "No Response";
        counts[value] = (counts[value] || 0) + 1;
    });

    const totalRespondents = 70;
    const results = Object.keys(counts).map(key => {
        const frequency = counts[key];
        return {
            _id: key,
            frequency: frequency,
            percent: (frequency / totalRespondents) * 100
        };
    });

    results.sort((a, b) => b.frequency - a.frequency);

    return new Response(JSON.stringify({ 
        total: totalRespondents, 
        data: results 
    }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}