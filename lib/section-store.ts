import { Section } from "@/data/sections";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export interface CustomSection extends Section {
    isCustom: true;
    createdAt: string;
    user_id: string;
    author_name?: string;
    likes_count: number;
    saves_count: number;
    is_liked: boolean;
    is_saved: boolean;
}

export function useSectionStore() {
    const [customSections, setCustomSections] = useState<CustomSection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    const fetchSections = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/sections');

            if (!response.ok) {
                throw new Error('Failed to fetch sections');
            }

            const data = await response.json();

            // Map DB columns to our Interface
            const mappedSections: CustomSection[] = (data || []).map((row: any) => ({
                slug: row.slug,
                name: row.title,
                description: row.description,
                code: row.code,
                category: row.category,
                niches: row.niches,
                preview: row.preview_url,
                author_name: row.author_name,
                user_id: row.user_id,
                createdAt: row.created_at,
                likes_count: row.likes_count || 0,
                saves_count: row.saves_count || 0,
                is_liked: row.is_liked || false,
                is_saved: row.is_saved || false,
                isCustom: true
            }));
            setCustomSections(mappedSections);
        } catch (error) {
            console.error('Error fetching sections:', error);
            toast.error("Failed to load sections");
            setCustomSections([]);
        }
        setIsLoading(false);
        setMounted(true);
    };

    useEffect(() => {
        fetchSections();
    }, []);

    const addSection = async (section: Omit<CustomSection, "createdAt" | "isCustom" | "user_id" | "likes_count" | "saves_count" | "is_liked" | "is_saved">) => {
        try {
            const response = await fetch('/api/sections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: section.name,
                    slug: section.slug,
                    description: section.description,
                    code: section.code,
                    category: section.category,
                    niches: section.niches,
                    preview_url: section.preview,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save section');
            }

            const data = await response.json();

            const savedSection: CustomSection = {
                slug: data.slug,
                name: data.title,
                description: data.description,
                code: data.code,
                category: data.category,
                niches: data.niches,
                preview: data.preview_url,
                author_name: data.author_name,
                user_id: data.user_id,
                createdAt: data.created_at,
                likes_count: 0,
                saves_count: 0,
                is_liked: false,
                is_saved: false,
                isCustom: true
            };

            setCustomSections(prev => [savedSection, ...prev]);
            toast.success("Section saved!");
        } catch (error: any) {
            console.error('Error adding section:', error);
            toast.error(error.message || "Failed to save section");
        }
    };

    const removeSection = async (slug: string) => {
        try {
            const response = await fetch(`/api/sections/${slug}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete section');
            }

            setCustomSections(prev => prev.filter(s => s.slug !== slug));
            toast.success("Section deleted!");
        } catch (error: any) {
            console.error('Error deleting section:', error);
            toast.error(error.message || "Failed to delete section");
        }
    };

    const updateSection = async (slug: string, updates: Partial<Omit<CustomSection, "createdAt" | "isCustom" | "user_id" | "likes_count" | "saves_count" | "is_liked" | "is_saved">>) => {
        try {
            const apiUpdates: Record<string, any> = {};
            if (updates.name) apiUpdates.title = updates.name;
            if (updates.preview) apiUpdates.preview_url = updates.preview;
            if (updates.description !== undefined) apiUpdates.description = updates.description;
            if (updates.code) apiUpdates.code = updates.code;
            if (updates.category) apiUpdates.category = updates.category;
            if (updates.niches) apiUpdates.niches = updates.niches;

            const response = await fetch(`/api/sections/${slug}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiUpdates),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update section');
            }

            setCustomSections(prev => prev.map(s => {
                if (s.slug === slug) {
                    return { ...s, ...updates };
                }
                return s;
            }));
            toast.success("Section updated!");
        } catch (error: any) {
            console.error('Error updating section:', error);
            toast.error(error.message || "Failed to update section");
        }
    };

    return {
        customSections,
        addSection,
        removeSection,
        updateSection,
        isLoading,
        mounted
    };
}
