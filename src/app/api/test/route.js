import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("cdm_obe");
        return NextResponse.json({ status: "Success", message: "Connected to MongoDB!" });
    } catch (e) {
        return NextResponse.json({ status: "Error", error: e.message }, { status: 500 });
    }
}