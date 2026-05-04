import { api_links } from "./links";
import { page_links } from "./links";
import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "../models/DecodedToken";


type Role = keyof typeof page_links;

type DecodedToken = {
  id: string;
  username: string;
  role: Role;
  iat: number;
  exp: number;
};

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

  if (typeof window !== "undefined") {
    localStorage.setItem("token", data.token);
  }

  const decoded = jwtDecode<DecodedToken>(data.token);
  const role = decoded.role;

  const redirectPath = page_links[role] || "/";

  return {
    ok: true,
    token: data.token,
    role,
    redirectPath,
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
