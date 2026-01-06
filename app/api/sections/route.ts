import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSectionsCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET /api/sections - List all sections
export async function GET() {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        const sectionsCollection = await getSectionsCollection();
        const sections = await sectionsCollection
            .find({})
            .sort({ created_at: -1 })
            .toArray();

        // Transform _id to string for JSON serialization and add interaction info
        const transformedSections = sections.map((section) => ({
            ...section,
            _id: section._id.toString(),
            user_id: section.user_id?.toString(),
            name: section.title, // Map title to name for frontend compatibility
            preview: section.preview_url, // Map preview_url to preview
            likes_count: (section.likes || []).length,
            saves_count: (section.saved_by || []).length,
            is_liked: userId ? (section.likes || []).includes(userId) : false,
            is_saved: userId ? (section.saved_by || []).includes(userId) : false,
        }));

        return NextResponse.json(transformedSections);
    } catch (error) {
        console.error("Error fetching sections:", error);
        return NextResponse.json(
            { error: "Failed to fetch sections" },
            { status: 500 }
        );
    }
}

// POST /api/sections - Create a new section
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "You must be logged in to create a section" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { title, slug, description, code, category, niches, preview_url } = body;

        if (!title || !slug || !code) {
            return NextResponse.json(
                { error: "Title, slug, and code are required" },
                { status: 400 }
            );
        }

        const sectionsCollection = await getSectionsCollection();

        // Check if slug already exists
        const existingSection = await sectionsCollection.findOne({ slug });
        if (existingSection) {
            return NextResponse.json(
                { error: "A section with this slug already exists" },
                { status: 409 }
            );
        }

        const newSection = {
            title,
            slug,
            description: description || "",
            code,
            category: category || "Custom",
            niches: niches || [],
            preview_url: preview_url || "/custom_section_placeholder.png",
            user_id: new ObjectId(session.user.id),
            author_name: session.user.name || session.user.email,
            created_at: new Date(),
        };

        const result = await sectionsCollection.insertOne(newSection);

        return NextResponse.json(
            {
                ...newSection,
                _id: result.insertedId.toString(),
                user_id: session.user.id,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating section:", error);
        return NextResponse.json(
            { error: "Failed to create section" },
            { status: 500 }
        );
    }
}
