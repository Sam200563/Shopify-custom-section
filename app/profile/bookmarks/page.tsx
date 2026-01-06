"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { Loader2, ArrowLeft, Bookmark, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { SectionCard } from "@/components/shared/SectionCard";

export default function BookmarksPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [bookmarks, setBookmarks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/");
            return;
        }

        const fetchBookmarks = async () => {
            try {
                const res = await fetch("/api/sections/bookmarks");
                if (res.ok) {
                    const data = await res.json();
                    setBookmarks(data);
                }
            } catch (err) {
                console.error("Failed to fetch bookmarks:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) fetchBookmarks();
    }, [user, authLoading, router]);

    const filteredBookmarks = useMemo(() => {
        return bookmarks.filter((section) => {
            const name = section.name || section.title || "";
            return name.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [bookmarks, searchQuery]);

    if (authLoading || isLoading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-black">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black pt-24 pb-12 px-4 selection:bg-zinc-800 selection:text-white">
            <div className="container mx-auto max-w-7xl space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <Link href="/profile">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-zinc-900 border border-zinc-900">
                                <ArrowLeft className="h-4 w-4 text-zinc-400" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-4xl font-black text-white flex items-center gap-3 tracking-tighter">
                                <Bookmark className="h-8 w-8 text-white fill-current" />
                                My Bookmarks
                            </h1>
                            <p className="text-zinc-500 font-medium mt-1">Your curated collection of premium Shopify sections</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search your bookmarks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-14 w-full rounded-2xl border border-zinc-900 bg-zinc-950/50 pl-12 pr-12 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/5 transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Sections List */}
                <div className="space-y-4">
                    {bookmarks.length === 0 ? (
                        <div className="text-center py-32 bg-zinc-950/50 rounded-[2.5rem] border border-zinc-900 border-dashed flex flex-col items-center justify-center">
                            <div className="h-24 w-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                                <Bookmark className="h-10 w-10 text-zinc-700" />
                            </div>
                            <p className="text-zinc-500 mb-6 font-bold text-xl">Your collection is empty</p>
                            <Link href="/sections">
                                <Button className="bg-white text-black hover:bg-zinc-200 rounded-full px-8 py-6 font-bold text-lg transition-all hover:scale-105">
                                    Browse Library
                                </Button>
                            </Link>
                        </div>
                    ) : filteredBookmarks.length === 0 ? (
                        <div className="text-center py-32 bg-zinc-950/50 rounded-[2.5rem] border border-zinc-900 border-dashed flex flex-col items-center justify-center">
                            <div className="h-24 w-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                                <Search className="h-10 w-10 text-zinc-700" />
                            </div>
                            <p className="text-zinc-500 mb-2 font-bold text-xl">No results for "{searchQuery}"</p>
                            <p className="text-zinc-600 mb-6 font-medium">Try searching for something else in your bookmarks</p>
                            <Button
                                onClick={() => setSearchQuery("")}
                                variant="outline"
                                className="rounded-full border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white"
                            >
                                Clear search
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredBookmarks.map((section) => (
                                <SectionCard key={section.slug} section={section} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
