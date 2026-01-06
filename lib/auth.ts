import { cookies } from "next/headers";
import { decrypt } from "@/lib/jwt";
import { getUsersCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function getSession() {
    const session = (await cookies()).get("session")?.value;
    if (!session) return null;
    return await decrypt(session);
}

export async function auth() {
    const session = await getSession();
    if (!session || !session.userId) return null;

    try {
        const usersCollection = await getUsersCollection();
        const user = await usersCollection.findOne({ _id: new ObjectId(session.userId as string) });

        if (!user) return null;

        return {
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.full_name,
                created_at: user.created_at?.toISOString(),
            }
        };
    } catch (error) {
        console.error("Auth error:", error);
        return null;
    }
}
