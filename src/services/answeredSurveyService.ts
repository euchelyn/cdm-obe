const BASE_URL = '/api/surveys/answered';


// ─── CREATE ──────────────────────────────────────────────────
// Submit an answered survey
export async function createAnsweredSurvey(payload: {
    student_id: string;
    batch: string;
    program: string;
    name: string;
    survey_id: string;
    survey_type: string;
    survey_version: string;
    answers: Record<string, any>;
}) {
    const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error ?? 'Failed to submit survey');
    }

    return data;
}


// ─── GET ALL ─────────────────────────────────────────────────
export async function getAllAnsweredSurveys() {
    const res = await fetch(BASE_URL);

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error ?? 'Failed to fetch answered surveys');
    }

    return data;
}


// ─── GET BY ID ───────────────────────────────────────────────
export async function getAnsweredSurveyById(id: string) {
    const res = await fetch(`${BASE_URL}?id=${id}`);

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error ?? 'Failed to fetch answered survey');
    }

    return data;
}


// ─── GET BY STUDENT ──────────────────────────────────────────
export async function getAnsweredSurveysByStudent(student_id: string) {
    const res = await fetch(
        `${BASE_URL}?student_id=${student_id}`
    );

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error ?? 'Failed to fetch student surveys');
    }

    return data;
}


// ─── GET BY PROGRAM ──────────────────────────────────────────
export async function getAnsweredSurveysByProgram(program: string) {
    const res = await fetch(
        `${BASE_URL}?program=${program}`
    );

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error ?? 'Failed to fetch program surveys');
    }

    return data;
}


// ─── GET BY BATCH ────────────────────────────────────────────
export async function getAnsweredSurveysByBatch(batch: string) {
    const res = await fetch(
        `${BASE_URL}?batch=${batch}`
    );

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error ?? 'Failed to fetch batch surveys');
    }

    return data;
}


// ─── GET BY SURVEY TYPE ──────────────────────────────────────
export async function getAnsweredSurveysByType(survey_type: string) {
    const res = await fetch(
        `${BASE_URL}?survey_type=${survey_type}`
    );

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error ?? 'Failed to fetch survey type');
    }

    return data;
}


// ─── GET BY SURVEY VERSION ───────────────────────────────────
export async function getAnsweredSurveysByVersion(
    survey_version: string
) {
    const res = await fetch(
        `${BASE_URL}?survey_version=${survey_version}`
    );

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error ?? 'Failed to fetch survey version');
    }

    return data;
}


// ─── GET BY SURVEY ID ────────────────────────────────────────
export async function getAnsweredSurveysBySurveyId(
    survey_id: string
) {
    const res = await fetch(
        `${BASE_URL}?survey_id=${survey_id}`
    );

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error ?? 'Failed to fetch survey');
    }

    return data;
}


// ─── GET COUNT ───────────────────────────────────────────────
export async function getAnsweredSurveyCount(
    filters?: {
        student_id?: string;
        program?: string;
        batch?: string;
        survey_id?: string;
        survey_type?: string;
        survey_version?: string;
    }
) {
    const params = new URLSearchParams();

    params.append('count', 'true');

    if (filters?.student_id)
        params.append('student_id', filters.student_id);

    if (filters?.program)
        params.append('program', filters.program);

    if (filters?.batch)
        params.append('batch', filters.batch);

    if (filters?.survey_id)
        params.append('survey_id', filters.survey_id);

    if (filters?.survey_type)
        params.append('survey_type', filters.survey_type);

    if (filters?.survey_version)
        params.append('survey_version', filters.survey_version);


    const res = await fetch(
        `${BASE_URL}?${params.toString()}`
    );

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error ?? 'Failed to fetch count');
    }

    return data;
}


// ─── UPDATE ANSWERS ──────────────────────────────────────────
export async function updateAnsweredSurvey(
    id: string,
    answers: Record<string, any>
) {
    const res = await fetch(`${BASE_URL}?id=${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            answers
        })
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error ?? 'Failed to update survey');
    }

    return data;
}


// ─── DELETE ──────────────────────────────────────────────────
export async function deleteAnsweredSurvey(id: string) {
    const res = await fetch(`${BASE_URL}?id=${id}`, {
        method: 'DELETE'
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error ?? 'Failed to delete survey');
    }

    return data;
}

// ─── GET BY TYPE + VERSION ───────────────────────────────────
export async function getAnsweredSurveysByTypeAndVersion(
    survey_type: string,
    survey_version: string
) {
    const params = new URLSearchParams();

    if (survey_type) params.append('survey_type', survey_type);
    if (survey_version) params.append('survey_version', survey_version);

    const res = await fetch(`${BASE_URL}?${params.toString()}`);

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error ?? 'Failed to fetch surveys by type and version');
    }

    return data;
}