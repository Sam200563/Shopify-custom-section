import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ user: null });
    }
    return NextResponse.json({ user: session.user });
}
