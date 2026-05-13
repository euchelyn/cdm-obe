import { UserPayload, PrivRole } from "@/types/PrivUser";
import { getStudentById } from "./masterlistService";
import { createAccountLink } from "./accountLinkService";
import { api_register } from "./authService";
import { getUserByRoleAndId } from "./accountLinkService";
import { getAllAccountLinks } from "./accountLinkService";
import { getUserAuthById } from "./userService";

const BASE_URL = '/api/priv_user';

async function request(
  endpoint: string,
  method: string,
  body?: any
) {
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

/* =========================
   CREATE
========================= */

export async function createPrivUser(
  role: PrivRole,
  payload: UserPayload
) {
  return request(role, 'POST', payload);
}

/* =========================
   GET ALL
========================= */

export async function getAllPrivUsers(
  role: PrivRole
) {
  return request(role, 'GET');
}

/* =========================
   GET ONE
========================= */

export async function getPrivUser(
  role: PrivRole,
  id: string
) {
  const keyMap: Record<PrivRole, string> = {
    faculty: 'faculty_id',
    mis: 'mis_id',
    pc: 'program_chair_id',
    registrar: 'registrar_id',
  };

  const key = keyMap[role];

  return request(
    `${role}?${key}=${id}`,
    'GET'
  );
}

/* =========================
   UPDATE
========================= */

export async function updatePrivUser(
  role: PrivRole,
  payload: Partial<UserPayload>
) {
  return request(role, 'PATCH', payload);
}

/* =========================
   DELETE
========================= */

export async function deletePrivUser(
  role: PrivRole,
  id: string
) {
  const keyMap: Record<PrivRole, string> = {
    faculty: 'faculty_id',
    mis: 'mis_id',
    pc: 'program_chair_id',
    registrar: 'registrar_id',
  };

  const key = keyMap[role];

  return request(
    `${role}?${key}=${id}`,
    'DELETE'
  );
}

export async function createStudentAccountFlow(
    studentId: string,
    codename: string,
    password: string,
    role: string,
) {
    if (!studentId || !password) {
        throw new Error('Student ID and password are required');
    }

    /* -------------------------
       1. GET STUDENT FROM MASTERLIST
    ------------------------- */
    const student = await getStudentById(studentId);

    if (!student) {
        throw new Error('Student does not exist in masterlist');
    }

    /* -------------------------
       2. CHECK IF AUTH ALREADY EXISTS
    ------------------------- */
    try {
        await getUserByRoleAndId('student', studentId);
        throw new Error('Student account already exists');
    } catch {
        // not found → OK
    }

    /* -------------------------
       3. CREATE AUTH USER
    ------------------------- */
    const authRes = await api_register(codename, password, role);
    const userAccountId = authRes?.id;

    if (!userAccountId) {
        throw new Error('Failed to create auth account');
    }

    /* -------------------------
       4. LINK USING STUDENT._id (IMPORTANT FIX)
    ------------------------- */
    const studentRoleId = student._id;

    await createAccountLink({
        user_account_id: userAccountId,
        role: 'student',
        role_account_id: studentRoleId,
    });

    return {
        success: true,
        student,
        userAccountId,
        studentRoleId,
    };
}

export async function getPrivUserByObjectId(role: PrivRole, id: string) {
  return request(`${role}?role=${role}&id=${id}`, 'GET');
}



export async function getAllPrivUsersResolved() {
  const res = await getAllAccountLinks();

  const links = res.data || [];

  const allowedRoles: PrivRole[] = ["faculty", "registrar", "pc"];

  const filtered = links.filter((link: any) =>
    allowedRoles.includes(link.role)
  );

  const resolved = await Promise.all(
    filtered.map(async (link: any) => {
      try {
        /* =========================
           ROLE DATA (faculty / registrar / pc)
        ========================= */
        const roleRes = await getPrivUserByObjectId(
          link.role,
          link.role_account_id
        );

        /* =========================
           USER AUTH DATA
        ========================= */
        const userAuthRes = await getUserAuthById(link.user_account_id);

        return {
          link,
          roleData: roleRes.data,
          userAuthData: userAuthRes.data,
        };
      } catch (err) {
        return {
          link,
          roleData: null,
          userAuthData: null,
          error: "Failed to resolve full user data",
        };
      }
    })
  );

  return {
    total: resolved.length,
    data: resolved,
  };
}

