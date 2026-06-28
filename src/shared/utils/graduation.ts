// Graduation rules — single source of truth.
//
// `batch` on a student is the ENTRY year. A program is assumed to take
// at least YEARS_TO_GRADUATE years, so the default graduation year is
// `batch + YEARS_TO_GRADUATE`. The registrar may override this by setting
// an explicit `graduation_year` on the student document.

export const YEARS_TO_GRADUATE = 4;

type GradStudent = {
    batch?: string | number | null;
    graduation_year?: number | string | null;
};

/**
 * Resolve a student's graduation year.
 * Prefers an explicit `graduation_year`; otherwise derives `batch + 4`.
 * Returns null when neither yields a valid year.
 */
export function getGraduationYear(student: GradStudent | null | undefined): number | null {
    if (student?.graduation_year != null && student.graduation_year !== '') {
        const explicit = Number(student.graduation_year);
        if (Number.isFinite(explicit)) return explicit;
    }

    const entryYear = parseInt(String(student?.batch ?? ''), 10);
    if (Number.isFinite(entryYear)) return entryYear + YEARS_TO_GRADUATE;

    return null;
}

/**
 * Whether a student is considered a graduate for the given year.
 * True when the current year is past the (resolved) graduation year.
 */
export function isGraduate(
    student: GradStudent | null | undefined,
    currentYear: number = new Date().getFullYear()
): boolean {
    const gradYear = getGraduationYear(student);
    if (gradYear == null) return false;
    return currentYear > gradYear;
}
