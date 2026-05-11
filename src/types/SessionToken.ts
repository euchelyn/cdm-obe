export type SessionPayload = {
    id: string;
    username: string;
    role: "student" | "faculty" | "mis" | "pc" | "registrar";
}