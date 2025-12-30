import { Section } from "@/data/sections";
import { useState, useEffect } from "react";
import { create } from "zustand";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export interface CustomSection extends Section {
    isCustom: true;
    createdAt: string;
    user_id: string;
    author_name?: string;
}

export function useSectionStore() {
    const [customSections, setCustomSections] = useState<CustomSection[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [mounted, setMounted] = useState(false); // Keep mounted state for consistency if needed elsewhere

    const fetchSections = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('sections')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching sections:', error);
            toast.error("Failed to load sections");
            setCustomSections([]);
        } else {
            // Map DB columns to our Interface
            const mappedSections: CustomSection[] = (data || []).map(row => ({
                slug: row.slug,
                name: row.title, // Map 'title' to 'name'
                description: row.description,
                code: row.code,
                category: row.category,
                niches: row.niches,
                preview: row.preview_url, // Map 'preview_url' to 'preview'
                author_name: row.author_name,
                user_id: row.user_id,
                createdAt: row.created_at,
                isCustom: true
            }));
            setCustomSections(mappedSections);
        }
        setIsLoading(false);
        setMounted(true);
    };

    useEffect(() => {
        fetchSections();
    }, []); // Fetch sections on mount

    const addSection = async (section: Omit<CustomSection, "createdAt" | "isCustom" | "user_id">) => {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) {
            toast.error("You must be logged in to add a section.");
            return;
        }

        // Map JS properties to SQL columns
        const dbPayload = {
            title: section.name,
            slug: section.slug,
            description: section.description,
            code: section.code,
            category: section.category,
            niches: section.niches,
            preview_url: section.preview,
            user_id: user.id,
            author_name: user.user_metadata?.full_name || user.email,
            // id and created_at are handled by default in DB
        };

        const { data, error } = await supabase
            .from('sections')
            .insert(dbPayload)
            .select()
            .single();

        if (error) {
            console.error('Error adding section:', error);
            toast.error("Failed to save section");
            return;
        }

        // Map back SQL result to JS object for local state
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
            isCustom: true
        };

        setCustomSections(prev => [savedSection, ...prev]);
        toast.success("Section saved!");
    };

    const removeSection = async (slug: string) => {
        const { error } = await supabase
            .from('sections')
            .delete()
            .eq('slug', slug);

        if (error) {
            console.error('Error deleting section:', error);
            toast.error("Failed to delete section");
            return;
        }

        setCustomSections(prev => prev.filter(s => s.slug !== slug));
        toast.success("Section deleted!");
    };

    const updateSection = async (slug: string, updates: Partial<Omit<CustomSection, "createdAt" | "isCustom" | "user_id">>) => {

        const dbUpdates: any = {};
        if (updates.name) dbUpdates.title = updates.name;
        if (updates.preview) dbUpdates.preview_url = updates.preview;
        if (updates.description) dbUpdates.description = updates.description;
        if (updates.code) dbUpdates.code = updates.code;
        if (updates.category) dbUpdates.category = updates.category;
        if (updates.niches) dbUpdates.niches = updates.niches;

        const { error } = await supabase
            .from('sections')
            .update(dbUpdates)
            .eq('slug', slug);

        if (error) {
            console.error('Error updating section:', error);
            toast.error("Failed to update section");
            return;
        }

        setCustomSections(prev => prev.map(s => {
            if (s.slug === slug) {
                return { ...s, ...updates };
            }
            return s;
        }));
        toast.success("Section updated!");
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
