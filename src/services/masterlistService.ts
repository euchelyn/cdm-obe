import { Student } from "@/types/Student";
import { StudentPaginatedResponse } from "@/types/StudentPaginatedResponse";

const API_URL = "api/students"

export async function getStudents(
    page: number,
    limit: number,
    batch?: string
): Promise<StudentPaginatedResponse> {

    let url = `${API_URL}?page=${page}&limit=${limit}`;

    if (batch && batch !== "All") {
        url += `&batch=${encodeURIComponent(batch)}`;
    }

    const res = await fetch(url);

    if (!res.ok) {
        throw new Error("Failed to fetch students");
    }

    return res.json();
}

export async function getStudentById(id: string): Promise<Student> {
    const res = await fetch(`${API_URL}?id=${id}`);

    if (!res.ok) {
        throw new Error("Student not found");
    }

    return res.json();
}

export async function createStudent(student: Student) {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(student),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || "Failed to create student");
    }

    return data;
}

export async function updateStudent(
    id: string,
    updates: Partial<Student>
) {
    const res = await fetch("/api/students", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            id,
            ...updates,
        }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update student");
    }

    return res.json();
}

export async function deleteStudent(id: string) {
    const res = await fetch(`/api/students?id=${id}`, {
        method: "DELETE",
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete student");
    }

    return res.json();
}