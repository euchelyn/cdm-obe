import { LargeNumberLike } from "node:crypto";

export type DecodedToken = {
    id: string,
    username: string,
    role: "student" | "faculty" | "mis" | "pc" | "registrar";
    iat: number;
    exp: number;
}