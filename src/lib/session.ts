import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { SessionPayload } from "../types/SessionToken";
import { UserRole } from "@/types/UserRole";


const SESSION_COOKIE = "session";
const USER_COOKIE = "user";

/* =========================
   AUTH SESSION
========================= */

export async function setSession(
  payload: SessionPayload
) {
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET as string,
    {
      expiresIn: "1d",
    }
  );

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure:
      process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

/* =========================
   USER PROFILE SESSION
========================= */

export async function setUserSession(
  payload: any
) {
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET as string,
    {
      expiresIn: "1d",
    }
  );

  const cookieStore = await cookies();

  cookieStore.set(USER_COOKIE, token, {
    httpOnly: false, // accessible in frontend
    secure:
      process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

/* =========================
   GET USER SESSION
========================= */

export async function getUserSession() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get(USER_COOKIE)?.value;

  if (!token) return null;

  try {
    return jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );
  } catch {
    return null;
  }
}

/* =========================
   CLEAR SESSIONS
========================= */

export async function clearSession() {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(USER_COOKIE);
}