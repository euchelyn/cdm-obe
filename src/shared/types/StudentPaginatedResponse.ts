import { Student } from "@/shared/types/Student";

export type StudentPaginatedResponse = {
    data: Student[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}