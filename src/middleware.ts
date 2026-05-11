import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { UserRole } from "./lib/session";

const ROLE_ROUTES: Record<UserRole, string> = {
    student: "/alumni",
    faculty: "/faculty",
    mis: "/mis",
    pc: "/pc",
    registrar: "/registrar",
};

const secret = new TextEncoder().encode(
    process.env.JWT_SECRET as string
);

export async function middleware(req: NextRequest) {
    const token = req.cookies.get("session")?.value;
    const { pathname } = req.nextUrl;
    if (!token) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    try {
        const { payload } = await jwtVerify(token, secret);

        const user = payload as {
            id: string;
            username: string;
            role: UserRole;
        };


        const allowedRoute = ROLE_ROUTES[user.role];


        if (!pathname.startsWith(allowedRoute)) {
            return NextResponse.redirect(
                new URL("/unauthorized", req.url)
            );
        }

        return NextResponse.next();
    } catch (err) {
        return NextResponse.redirect(new URL("/", req.url));
    }
}

export const config = {
    matcher: [
        "/registrar/:path*",
        "/faculty/:path*",
        "/mis/:path*",
        "/pc/:path*",
        "/alumni/:path*",
    ],
};