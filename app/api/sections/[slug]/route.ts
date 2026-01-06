import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSectionsCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { sections as staticSections } from "@/data/sections";

// GET /api/sections/[slug] - Get a single section
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const sectionsCollection = await getSectionsCollection();
        let section = await sectionsCollection.findOne({ slug });

        const session = await auth();
        const userId = session?.user?.id;

        if (!section) {
            // Fallback to static sections
            const staticSection = staticSections.find(s => s.slug === slug);
            if (!staticSection) {
                return NextResponse.json(
                    { error: "Section not found" },
                    { status: 404 }
                );
            }

            // Return static section formatted for frontend
            return NextResponse.json({
                ...staticSection,
                title: staticSection.name,
                preview_url: staticSection.preview,
                likes_count: 0,
                saves_count: 0,
                is_liked: false,
                is_saved: false,
            });
        }

        return NextResponse.json({
            ...section,
            _id: section._id.toString(),
            user_id: section.user_id?.toString(),
            likes_count: (section.likes || []).length,
            saves_count: (section.saved_by || []).length,
            is_liked: userId ? (section.likes || []).includes(userId) : false,
            is_saved: userId ? (section.saved_by || []).includes(userId) : false,
        });
    } catch (error) {
        console.error("Error fetching section:", error);
        return NextResponse.json(
            { error: "Failed to fetch section" },
            { status: 500 }
        );
    }
}

// PUT /api/sections/[slug] - Update a section
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "You must be logged in to update a section" },
                { status: 401 }
            );
        }

        const { slug } = await params;
        const body = await request.json();
        const { title, description, code, category, niches, preview_url } = body;

        const sectionsCollection = await getSectionsCollection();

        // Find and verify ownership
        const existingSection = await sectionsCollection.findOne({ slug });
        if (!existingSection) {
            return NextResponse.json(
                { error: "Section not found" },
                { status: 404 }
            );
        }

        if (existingSection.user_id?.toString() !== session.user.id) {
            return NextResponse.json(
                { error: "You can only update your own sections" },
                { status: 403 }
            );
        }

        // Build update object
        const updateData: Record<string, unknown> = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (code !== undefined) updateData.code = code;
        if (category !== undefined) updateData.category = category;
        if (niches !== undefined) updateData.niches = niches;
        if (preview_url !== undefined) updateData.preview_url = preview_url;
        updateData.updated_at = new Date();

        await sectionsCollection.updateOne({ slug }, { $set: updateData });

        const updatedSection = await sectionsCollection.findOne({ slug });

        return NextResponse.json({
            ...updatedSection,
            _id: updatedSection?._id.toString(),
            user_id: updatedSection?.user_id?.toString(),
        });
    } catch (error) {
        console.error("Error updating section:", error);
        return NextResponse.json(
            { error: "Failed to update section" },
            { status: 500 }
        );
    }
}

// DELETE /api/sections/[slug] - Delete a section
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "You must be logged in to delete a section" },
                { status: 401 }
            );
        }

        const { slug } = await params;
        const sectionsCollection = await getSectionsCollection();

        // Find and verify ownership
        const existingSection = await sectionsCollection.findOne({ slug });
        if (!existingSection) {
            return NextResponse.json(
                { error: "Section not found" },
                { status: 404 }
            );
        }

        if (existingSection.user_id?.toString() !== session.user.id) {
            return NextResponse.json(
                { error: "You can only delete your own sections" },
                { status: 403 }
            );
        }

        await sectionsCollection.deleteOne({ slug });

        return NextResponse.json({ message: "Section deleted successfully" });
    } catch (error) {
        console.error("Error deleting section:", error);
        return NextResponse.json(
            { error: "Failed to delete section" },
            { status: 500 }
        );
    }
}
