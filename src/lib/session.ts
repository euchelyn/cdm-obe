import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { SessionPayload } from "../types/SessionToken";
export type UserRole =
    | "student"
    | "faculty"
    | "mis"
    | "pc"
    | "registrar";

const COOKIE_NAME = "session";

export async function setSession(payload: SessionPayload) {
    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET as string,
        {
            expiresIn: "1d",
        }
    );

    const cookieStore = await cookies();

    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 day
    });
}

export async function clearSession() {
    const cookieStore = await cookies();

    cookieStore.delete(COOKIE_NAME);
}