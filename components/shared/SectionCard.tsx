"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Copy, Heart, Bookmark } from "lucide-react";
import { toast } from "sonner";
import { Section } from "@/data/sections";
import { useAuth } from "@/components/providers/AuthProvider";
import { cn } from "@/lib/utils";

interface SectionCardProps {
    section: Section & {
        likes_count?: number;
        saves_count?: number;
        is_liked?: boolean;
        is_saved?: boolean;
    };
}

export const SectionCard = ({ section }: SectionCardProps) => {
    const { user } = useAuth();
    const {
        slug = "fallback",
        name = "Untitled Section",
        preview = "/previews/placeholder.png",
        niches = [],
        code = "",
        author_name,
        likes_count: initialLikesCount = 0,
        saves_count: initialSavesCount = 0,
        is_liked: initialIsLiked = false,
        is_saved: initialIsSaved = false,
    } = section;

    const [likesCount, setLikesCount] = React.useState(initialLikesCount);
    const [savesCount, setSavesCount] = React.useState(initialSavesCount);
    const [isLiked, setIsLiked] = React.useState(initialIsLiked);
    const [isSaved, setIsSaved] = React.useState(initialIsSaved);
    const [isInteracting, setIsInteracting] = React.useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!code) return;
        navigator.clipboard.writeText(code);
        toast.success("Code copied to clipboard!");
    };

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
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

    const handleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
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

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="group relative flex flex-col overflow-hidden rounded-[2rem] bg-[#0A0A0A] border border-zinc-900 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
            <Link href={`/sections/${slug}`} className="absolute inset-0 z-[10]" />

            <div className="relative p-2">
                <div className="aspect-[4/3] overflow-hidden rounded-[1.8rem]">
                    <img
                        src={preview}
                        alt={name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800";
                        }}
                    />

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-20 flex items-center justify-center pointer-events-none">
                        {/* Center Button */}
                        <div className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 pointer-events-none">
                            Inspect Section
                        </div>

                        {/* Right Vertical Actions */}
                        <div className="absolute top-4 right-4 flex flex-col gap-3 transform translate-x-4 group-hover:translate-x-0 transition-transform duration-300 z-[40] pointer-events-auto">
                            <button
                                onClick={handleLike}
                                disabled={isInteracting}
                                className={cn(
                                    "h-10 w-10 flex items-center justify-center rounded-full transition-all shadow-lg border",
                                    isLiked
                                        ? "bg-red-500 border-red-500 text-white"
                                        : "bg-transparent border-white/30 text-white hover:bg-red-500 hover:border-red-500"
                                )}
                            >
                                <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isInteracting}
                                className={cn(
                                    "h-10 w-10 flex items-center justify-center rounded-full transition-all shadow-lg border",
                                    isSaved
                                        ? "bg-white border-white text-black"
                                        : "bg-transparent border-white/30 text-white hover:bg-white hover:text-black"
                                )}
                            >
                                <Bookmark className={cn("h-5 w-5", isSaved && "fill-current")} />
                            </button>
                            <button
                                onClick={handleCopy}
                                className="h-10 w-10 flex items-center justify-center rounded-2xl bg-white text-black transition-all shadow-lg hover:scale-110"
                            >
                                <Copy className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 flex-col px-6 pb-6 pt-2">
                {/* Header Row: Niches & Stats */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-wrap gap-2">
                        {niches.slice(0, 2).map((niche) => (
                            <span
                                key={niche}
                                className="inline-flex items-center rounded-full bg-zinc-800/50 px-3 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider"
                            >
                                {niche}
                            </span>
                        ))}
                    </div>
                    <div className="flex items-center gap-4 text-zinc-400">
                        <div className="flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all">
                            <Heart className={cn("h-4 w-4", isLiked ? "text-red-500 fill-current" : "text-red-500")} />
                            <span className="text-[10px] font-bold">{likesCount}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Bookmark className={cn("h-4 w-4", isSaved ? "text-white fill-current" : "text-white")} />
                            <span className="text-[10px] font-bold text-white">{savesCount}</span>
                        </div>
                    </div>
                </div>

                <h3 className="text-xl font-extrabold text-white mb-3 group-hover:text-primary transition-colors leading-tight">
                    {name}
                </h3>

                <div className="flex items-center gap-2 text-zinc-500">
                    <div className="h-[1px] w-4 bg-zinc-800" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                        {author_name ? `By ${author_name}` : "Verified Liquid Source"}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};
