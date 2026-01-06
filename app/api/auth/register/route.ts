import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUsersCollection } from "@/lib/mongodb";
import { encrypt } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, full_name } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        const usersCollection = await getUsersCollection();

        // Check if user already exists
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const result = await usersCollection.insertOne({
            email,
            password: hashedPassword,
            full_name: full_name || email.split("@")[0],
            created_at: new Date(),
        });

        const userId = result.insertedId.toString();
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        const session = await encrypt({ userId, expires });

        const response = NextResponse.json(
            {
                message: "User created successfully",
                userId: userId,
            },
            { status: 201 }
        );

        (await cookies()).set("session", session, { expires, httpOnly: true, secure: process.env.NODE_ENV === "production" });

        return response;
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
