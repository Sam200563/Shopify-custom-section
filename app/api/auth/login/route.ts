import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUsersCollection } from "@/lib/mongodb";
import { encrypt } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        const usersCollection = await getUsersCollection();
        const user = await usersCollection.findOne({ email });

        if (!user) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        // Create session
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        const session = await encrypt({ userId: user._id.toString(), expires });

        const response = NextResponse.json({
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.full_name,
            }
        });

        (await cookies()).set("session", session, { expires, httpOnly: true, secure: process.env.NODE_ENV === "production" });

        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
