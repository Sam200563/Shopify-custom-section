import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthProvider";

interface InteractionState {
    likesCount: number;
    savesCount: number;
    isLiked: boolean;
    isSaved: boolean;
}

interface UseSectionInteractionProps {
    slug: string;
    initialData?: Partial<InteractionState>;
}

export function useSectionInteraction({ slug, initialData }: UseSectionInteractionProps) {
    const { user } = useAuth();
    const [likesCount, setLikesCount] = useState(initialData?.likesCount || 0);
    const [savesCount, setSavesCount] = useState(initialData?.savesCount || 0);
    const [isLiked, setIsLiked] = useState(initialData?.isLiked || false);
    const [isSaved, setIsSaved] = useState(initialData?.isSaved || false);
    const [isInteracting, setIsInteracting] = useState(false);

    // Sync initialData if it changes (e.g. from a fresh fetch)
    useEffect(() => {
        if (initialData) {
            if (initialData.likesCount !== undefined) setLikesCount(initialData.likesCount);
            if (initialData.savesCount !== undefined) setSavesCount(initialData.savesCount);
            if (initialData.isLiked !== undefined) setIsLiked(initialData.isLiked);
            if (initialData.isSaved !== undefined) setIsSaved(initialData.isSaved);
        }
    }, [initialData?.likesCount, initialData?.savesCount, initialData?.isLiked, initialData?.isSaved]);


    const handleLike = async (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!user) {
            toast.error("Please login to like sections");
            return;
        }

        if (isInteracting) return;

        setIsInteracting(true);
        try {
            const res = await fetch(`/api/sections/${slug}/like`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                setIsLiked(data.liked);
                setLikesCount(data.likes_count);
            }
        } catch (err) {
            toast.error("Failed to update like");
        } finally {
            setIsInteracting(false);
        }
    };

    const handleSave = async (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!user) {
            toast.error("Please login to save sections");
            return;
        }

        if (isInteracting) return;

        setIsInteracting(true);
        try {
            const res = await fetch(`/api/sections/${slug}/bookmark`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                setIsSaved(data.bookmarked);
                setSavesCount(data.saves_count);
                if (data.bookmarked) {
                    toast.success("Added to bookmarks");
                } else {
                    toast.success("Removed from bookmarks");
                }
            }
        } catch (err) {
            toast.error("Failed to update save status");
        } finally {
            setIsInteracting(false);
        }
    };

    return {
        likesCount,
        savesCount,
        isLiked,
        isSaved,
        isInteracting,
        handleLike,
        handleSave,
        setLikesCount,
        setSavesCount,
        setIsLiked,
        setIsSaved
    };
}
