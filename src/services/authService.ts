import { api_links } from "../types/links";
import { page_links } from "../types/links";
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

export async function api_register(username: string, password: string, role: string) {

    const res = await fetch(api_links.register, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, role}),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || "Registration failed");
    }

    return data;
} 

    async function safeJson(res) {
        const text = await res.text();

        if (!text) return null;

        try {
            return JSON.parse(text);
        } catch {
            return null;
        }
    }

export async function api_deleteUser(params) {
    const searchParams = new URLSearchParams();

    if (params.user_account_id) {
        searchParams.append('user_account_id', params.user_account_id);
    }

    if (params.username) {
        searchParams.append('username', params.username);
    }

    const res = await fetch(`/api/auth/register?${searchParams.toString()}`, {
        method: 'DELETE',
    });

    const data = await safeJson(res);

    if (!res.ok) {
        throw new Error(data?.error || 'Failed to delete auth user');
    }

    return data;
}