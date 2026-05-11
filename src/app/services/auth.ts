import { api_links } from "./links";
import { page_links } from "./links";
import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "../types/DecodedToken";
import { useRouter } from "next/navigation";
import { SessionPayload } from "../types/SessionToken";
import { setSession, clearSession } from "../lib/session";

type Role = keyof typeof page_links;

export async function api_login(username: string, password: string) {
  const res = await fetch(api_links.login, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    return {
      ok: false,
      error: data.error || "Login failed",
    };
  }

  const role = data.user.role;

  return {
    ok: true,
    role,
    redirectPath: page_links[role] || "/",
    message: data.message,
  };
}

export async function api_register(username: string, password: string) {

    const res = await fetch(api_links.register, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password}),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || "Registration failed");
    }

    return data;
} 
