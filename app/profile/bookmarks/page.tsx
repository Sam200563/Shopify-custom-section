"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { Loader2, ArrowLeft, Bookmark } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BookmarksPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [bookmarks, setBookmarks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    if (authLoading || isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/20 pt-24 pb-12 px-4">
            <div className="container mx-auto max-w-5xl space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/profile">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Bookmark className="h-6 w-6 text-blue-500 fill-current" />
                            My Bookmarks
                        </h1>
                    </div>
                </div>

                {/* Sections List */}
                <div className="space-y-4">
                    {bookmarks.length === 0 ? (
                        <div className="text-center py-20 bg-background rounded-lg border border-dashed flex flex-col items-center justify-center">
                            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                <Bookmark className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground mb-4 font-medium">No bookmarked sections yet.</p>
                            <Link href="/sections">
                                <Button variant="outline">Browse Library</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bookmarks.map((section) => (
                                <Card key={section.slug} className="overflow-hidden group hover:shadow-lg transition-all border-none shadow-md">
                                    <div className="relative aspect-video bg-muted">
                                        {section.preview_url || section.preview ? (
                                            <Image
                                                src={section.preview_url || section.preview}
                                                alt={section.title || section.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gray-100">
                                                No Preview
                                            </div>
                                        )}
                                    </div>
                                    <CardContent className="p-4 bg-white">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-semibold truncate text-gray-900 flex-1">{section.title || section.name}</h3>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mb-3 uppercase tracking-widest">{section.category || "General"}</p>

                                        <div className="flex justify-between items-center mt-4">
                                            <Link href={`/sections/${section.slug}${section.user_id ? '?custom=true' : ''}`} className="w-full">
                                                <Button variant="outline" size="sm" className="w-full hover:bg-primary hover:text-white transition-colors">
                                                    View Section
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
