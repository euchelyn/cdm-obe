import { AccountLinkPayload } from "@/types/AccountLinkPayload";
import { UserRole } from "@/lib/session";

const BASE_PATH = "/api/auth/register/account_links";

/* =========================
   BASE REQUEST WRAPPER
========================= */

async function request(url: string, options?: RequestInit) {
  const isServer = typeof window === "undefined";

  const baseUrl = isServer
    ? process.env.NEXT_PUBLIC_BASE_URL ||
      "http://localhost:3000"
    : "";

  const res = await fetch(
    `${baseUrl}${BASE_PATH}${url}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.error || "Request failed"
    );
  }

  return data;
}

/* =========================
   GET USER BY ROLE + ID
========================= */

export async function getUserByRoleAndId(
  role: UserRole,
  id: string
) {
  return request(
    `?mode=user&role=${role}&id=${id}`
  );
}

/* =========================
   GET ACCOUNT BY USERNAME
========================= */

export async function getAccountByUsername(
  username: string
) {
  return request(
    `?mode=account&username=${username}`
  );
}

/* =========================
   CREATE ACCOUNT LINK
========================= */

export async function createAccountLink(
  payload: AccountLinkPayload
) {
  return request("", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* =========================
   GET FULL ACCOUNT LINK
========================= */

export async function getAccountLink(
  params: {
    user_account_id?: string;
    role_account_id?: string;
  }
) {
  const query = new URLSearchParams({
    mode: "link",
    ...(params.user_account_id && {
      user_account_id:
        params.user_account_id,
    }),
    ...(params.role_account_id && {
      role_account_id:
        params.role_account_id,
    }),
  });

  return request(`?${query.toString()}`);
}

/* =========================
   GET BY USER ID
========================= */

export async function getAccountLinkByUserId(
  user_account_id: string
) {
  return getAccountLink({
    user_account_id,
  });
}

/* =========================
   GET BY ROLE ID
========================= */

export async function getAccountLinkByRoleId(
  role_account_id: string
) {
  return getAccountLink({
    role_account_id,
  });
}

/* =========================
   STATS
========================= */

export async function getAccountLinkStats() {
  return request("?mode=count");
}

export async function getAllAccountLinks() {
  return request("?mode=all");
}

/* =========================
   SAFE JSON
========================= */

async function safeJson(res: Response) {
  const text = await res.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/* =========================
   DELETE LINK
========================= */

export async function deleteAccountLink(
  user_account_id?: string,
  role_account_id?: string
) {
  const params = new URLSearchParams();

  if (user_account_id) {
    params.append(
      "user_account_id",
      user_account_id
    );
  }

  if (role_account_id) {
    params.append(
      "role_account_id",
      role_account_id
    );
  }

  const baseUrl = typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_BASE_URL ||
      "http://localhost:3000"
    : "";

  const res = await fetch(
    `${baseUrl}${BASE_PATH}?${params.toString()}`,
    {
      method: "DELETE",
    }
  );

  const data = await safeJson(res);

  if (!res.ok) {
    throw new Error(
      data?.error ||
        "Failed to delete account link"
    );
  }

  return data;
}