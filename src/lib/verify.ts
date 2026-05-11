import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { setSession } from "./session";
import { SessionPayload } from "@/types/SessionToken";
const COOKIE_NAME = "session";

export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();

    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) return null;

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        );

        return decoded as SessionPayload;
    } catch {
        return null;
    }
}