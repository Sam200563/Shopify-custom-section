import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSectionsCollection } from "@/lib/mongodb";
import { sections as staticSections } from "@/data/sections";

// POST /api/sections/[slug]/like - Toggle like on a section
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "You must be logged in to like a section" },
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

        // Check if already liked
        const likes = section.likes || [];
        const isLiked = likes.includes(userId);

        if (isLiked) {
            // Unlike: Remove userId from likes array
            await sectionsCollection.updateOne(
                { slug },
                { $pull: { likes: userId } as any }
            );
        } else {
            // Like: Add userId to likes array
            await sectionsCollection.updateOne(
                { slug },
                { $addToSet: { likes: userId } as any }
            );
        }

        // Get updated counts
        const updatedSection = await sectionsCollection.findOne({ slug });

        return NextResponse.json({
            liked: !isLiked,
            likes_count: (updatedSection?.likes || []).length
        });

    } catch (error) {
        console.error("Error toggling like:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
