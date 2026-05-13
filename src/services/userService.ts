const BASE_URL = '/api/auth';

async function request(url: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

/* =========================
   GET USER AUTH BY OBJECT ID
========================= */

export async function getUserAuthById(id: string) {
  return request(`?id=${id}`, {
    method: 'GET',
  });
}