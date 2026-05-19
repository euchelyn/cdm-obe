import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

import { setSession, setUserSession } from "@/lib/session";
import { getAccountLinkByUserId } from "@/services/accountLinkService";
import { getPrivUserByObjectId } from "@/services/privUserService";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const users = db.collection("users");

    const user = await users.findOne({ username });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    /* =========================
       AUTH PAYLOAD
    ========================= */

    const payload = {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
    };

    /* =========================
       SESSION 1 (SECURE AUTH)
    ========================= */

    await setSession(payload);

    /* =========================
       RESOLVE ACCOUNT LINK
    ========================= */

    let link = null;
    let profile = null;

    try {
      const linkRes = await getAccountLinkByUserId(
        user._id.toString()
      );

      link = linkRes?.data ?? linkRes ?? null;

      /* =========================
         RESOLVE ROLE DATA (FACULTY / PC / MIS / REGISTRAR)
      ========================= */

      if (link?.role && link?.role_account_id) {
        const roleRes = await getPrivUserByObjectId(
          link.role,
          link.role_account_id
        );

        profile = roleRes?.data ?? roleRes ?? null;
      }
    } catch (err) {
      console.error("Profile resolution error:", err);
    }

    /* =========================
       SESSION 2 (FRONTEND USER STATE)
    ========================= */
    console.log("===== FINAL SESSION DATA (BEFORE SAVE) =====", {
  auth: payload,
  link,
  profile,
});


    await setUserSession({
      auth: payload,
      link,
      profile,
    });


    /* =========================
       RESPONSE
    ========================= */

    return NextResponse.json(
      {
        message: "Login successful",
        user: payload,
        link,
        profile,
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: 500 }
    );
  }
}