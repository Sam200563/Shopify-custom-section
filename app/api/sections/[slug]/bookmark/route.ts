import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSectionsCollection } from "@/lib/mongodb";
import { sections as staticSections } from "@/data/sections";

// POST /api/sections/[slug]/bookmark - Toggle bookmark on a section
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "You must be logged in to bookmark a section" },
                { status: 401 }
            );
        }

        const { slug } = await params;
        const sectionsCollection = await getSectionsCollection();
        const userId = session.user.id;

        // Find the section
        let section = await sectionsCollection.findOne({ slug });

        if (!section) {
            // Check if it's a static section to materialize
            const staticSection = staticSections.find(s => s.slug === slug);
            if (!staticSection) {
                return NextResponse.json(
                    { error: "Section not found" },
                    { status: 404 }
                );
            }

            // Materialize the static section in DB
            const newDoc = {
                title: staticSection.name,
                slug: staticSection.slug,
                description: staticSection.description,
                code: staticSection.code,
                category: staticSection.category,
                niches: staticSection.niches,
                preview_url: staticSection.preview,
                created_at: new Date(),
                likes: [],
                saved_by: []
            };
            await sectionsCollection.insertOne(newDoc);
            section = await sectionsCollection.findOne({ slug });
        }

        if (!section) {
            return NextResponse.json(
                { error: "Failed to materialize section" },
                { status: 500 }
            );
        }

        // Check if already bookmarked
        const bookmarks = section.saved_by || [];
        const isBookmarked = bookmarks.includes(userId);

        if (isBookmarked) {
            // Unbookmark: Remove userId from saved_by array
            await sectionsCollection.updateOne(
                { slug },
                { $pull: { saved_by: userId } as any }
            );
        } else {
            // Bookmark: Add userId to saved_by array
            await sectionsCollection.updateOne(
                { slug },
                { $addToSet: { saved_by: userId } as any }
            );
        }

        // Get updated counts
        const updatedSection = await sectionsCollection.findOne({ slug });

        return NextResponse.json({
            bookmarked: !isBookmarked,
            saves_count: (updatedSection?.saved_by || []).length
        });

    } catch (error) {
        console.error("Error toggling bookmark:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
