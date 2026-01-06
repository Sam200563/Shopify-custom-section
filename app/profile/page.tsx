"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useSectionStore } from "@/lib/section-store";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ProfilePage() {
    const { user, isLoading: authLoading, signOut } = useAuth();
    const { customSections, isLoading: sectionsLoading, removeSection } = useSectionStore();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/");
        }
    }, [user, authLoading, router]);

    if (authLoading || sectionsLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        );
    }

    if (!user) return null;

    const mySections = customSections.filter(s => s.user_id === user.id);

    return (
        <div className="min-h-screen bg-muted/20 pt-24 pb-12 px-4">
            <div className="container mx-auto max-w-5xl space-y-8">
                {/* Header */}
                <Card>
                    <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-3xl font-bold text-muted-foreground uppercase overflow-hidden">
                            {/* Initials */}
                            {user.user_metadata?.full_name?.[0] || user.email?.[0]}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-2xl font-bold">{user.user_metadata?.full_name || "User"}</h1>
                            <p className="text-muted-foreground">{user.email}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Member since {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Uploaded Sections</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{mySections.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:bg-muted/10 transition-colors" onClick={() => router.push("/profile/bookmarks")}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Saved Sections</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <div className="text-2xl font-bold">View</div>
                            <Button size="sm" variant="ghost">Go →</Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Sections List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold">My Uploads</h2>
                    {mySections.length === 0 ? (
                        <div className="text-center py-12 bg-background rounded-lg border border-dashed">
                            <p className="text-muted-foreground mb-4">You haven't uploaded any sections yet.</p>
                            <Link href="/upload">
                                <Button>Upload Your First Section</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {mySections.map((section) => (
                                <Card key={section.slug} className="overflow-hidden group hover:shadow-lg transition-shadow">
                                    <div className="relative aspect-video bg-muted">
                                        {section.preview ? (
                                            <Image
                                                src={section.preview}
                                                alt={section.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Preview</div>
                                        )}
                                    </div>
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold truncate">{section.name}</h3>
                                        <p className="text-xs text-muted-foreground mb-2 truncate">{section.category}</p>
                                        <div className="flex justify-between items-center mt-4">
                                            <Link href={`/upload/${section.slug}`}>
                                                <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                                            </Link>
                                            <Link href={`/sections/${section.slug}?custom=true`}>
                                                <Button variant="ghost" size="sm">View</Button>
                                            </Link>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={async () => {
                                                    if (confirm("Are you sure?")) {
                                                        await removeSection(section.slug);
                                                        toast.success("Section deleted");
                                                    }
                                                }}
                                            >Delete</Button>
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
