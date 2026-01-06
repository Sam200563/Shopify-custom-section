import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSectionsCollection } from "@/lib/mongodb";

// GET /api/sections/bookmarks - Get all bookmarked sections for the current user
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "You must be logged in to view bookmarks" },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const sectionsCollection = await getSectionsCollection();

        // Find sections where userId is in the saved_by array
        const bookmarkedSections = await sectionsCollection
            .find({ saved_by: userId })
            .sort({ created_at: -1 })
            .toArray();

        // Transform for frontend
        const transformed = bookmarkedSections.map(section => ({
            ...section,
            _id: section._id.toString(),
            user_id: section.user_id?.toString(),
            likes_count: (section.likes || []).length,
            saves_count: (section.saved_by || []).length,
            is_liked: (section.likes || []).includes(userId),
            is_saved: true, // By definition in this query
        }));

        return NextResponse.json(transformed);

    } catch (error) {
        console.error("Error fetching bookmarked sections:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
