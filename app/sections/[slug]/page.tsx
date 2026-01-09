"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { sections } from "@/data/sections";
import { motion } from "framer-motion";
import { Copy, ArrowLeft, Monitor, Tablet, Smartphone, Check, Loader2, Heart, Bookmark } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSectionStore } from "@/lib/section-store";
import { DynamicPreview } from "@/components/shared/DynamicPreview";
import { ResizableSplitLayout } from "@/components/shared/ResizableSplitLayout";
import { useAuth } from "@/components/providers/AuthProvider";
import { useSectionInteraction } from "@/hooks/use-section-interaction";

export default function SectionDetailPage() {
    const { slug } = useParams();
    const router = useRouter();
    const { customSections, mounted } = useSectionStore();
    const { user } = useAuth();
    const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
    const [isCopied, setIsCopied] = useState(false);

    // Interaction state managed by hook
    const {
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
    } = useSectionInteraction({ slug: slug as string });

    const section = useMemo(() => {
        const staticSection = sections.find((s) => s.slug === slug);
        if (staticSection) return staticSection;
        if (!mounted) return undefined;
        return customSections.find((s: any) => s.slug === slug);
    }, [slug, customSections, mounted]);

    // Fetch latest interaction data
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await fetch(`/api/sections/${slug}`);
                if (res.ok) {
                    const data = await res.json();
                    setLikesCount(data.likes_count || 0);
                    setSavesCount(data.saves_count || 0);
                    setIsLiked(data.is_liked || false);
                    setIsSaved(data.is_saved || false);
                }
            } catch (err) {
                console.error("Failed to fetch section interactions:", err);
            }
        };
        if (slug) fetchDetails();
    }, [slug, user, setLikesCount, setSavesCount, setIsLiked, setIsSaved]);

    if (!section) {
        if (!mounted) {
            return (
                <div className="flex min-h-screen items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            );
        }
        return (
            <div className="flex min-h-screen flex-col items-center justify-center">
                <h1 className="text-2xl font-bold">Section not found</h1>
                <button onClick={() => router.push("/sections")} className="mt-4 text-primary hover:underline">
                    Back to all sections
                </button>
            </div>
        );
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(section.code);
        setIsCopied(true);
        toast.success("Code copied successfully!");
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-background">
            <ResizableSplitLayout
                initialLeftWidth={55}
                minLeftWidth={30}
                maxLeftWidth={70}
                leftSide={
                    <div className="flex h-full flex-col border-r bg-muted/30">
                        <div className="flex items-center justify-between border-b bg-background px-6 py-3">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => router.back()}
                                    className="rounded-full p-2 hover:bg-muted"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </button>
                                <div>
                                    <h1 className="text-sm font-semibold">{section.name}</h1>
                                    <div className="flex gap-2">
                                        {(section.niches || []).map((n: string) => (
                                            <span key={n} className="text-[10px] text-muted-foreground uppercase tracking-wider">{n}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Interaction Buttons */}
                                <div className="flex items-center gap-1 ">
                                    <button
                                        onClick={handleLike}
                                        disabled={isInteracting}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer",
                                            isLiked
                                                ? "bg-red-50 text-red-600 border-red-200"
                                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                        )}
                                    >
                                        <Heart className={cn("h-3.5 w-3.5", isLiked && "fill-current")} />
                                        <span>{likesCount}</span>
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isInteracting}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer",
                                            isSaved
                                                ? "bg-blue-50 text-blue-600 border-blue-200"
                                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                        )}
                                    >
                                        <Bookmark className={cn("h-3.5 w-3.5", isSaved && "fill-current")} />
                                        <span>{savesCount}</span>
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 rounded-lg border bg-background p-1">
                                    <button
                                        onClick={() => setViewport("desktop")}
                                        className={cn("rounded p-1.5 cursor-pointer", viewport === "desktop" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50")}
                                    >
                                        <Monitor className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewport("tablet")}
                                        className={cn("rounded p-1.5 cursor-pointer", viewport === "tablet" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50")}
                                    >
                                        <Tablet className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewport("mobile")}
                                        className={cn("rounded p-1.5 cursor-pointer", viewport === "mobile" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50")}
                                    >
                                        <Smartphone className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden p-4 md:p-8 bg-muted/20 flex flex-col items-center justify-start overflow-y-auto">
                            <div className="w-full flex justify-center mb-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-1 rounded">
                                    {viewport} View — {viewport === "desktop" ? "Full Width" : viewport === "tablet" ? "768px" : "375px"}
                                </span>
                            </div>
                            <motion.div
                                layout
                                animate={{
                                    width: viewport === "desktop" ? "100%" : viewport === "tablet" ? "768px" : "375px",
                                    maxWidth: "100%",
                                    height: viewport === "desktop" ? "100%" : "auto",
                                    minHeight: viewport === "desktop" ? "100%" : "667px"
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="overflow-hidden rounded-2xl border-8 border-gray-800 bg-white shadow-2xl relative flex-shrink-0"
                                style={{
                                    aspectRatio: viewport === "desktop" ? "auto" : viewport === "tablet" ? "3/4" : "9/16",
                                }}
                            >
                                <div className="absolute top-0 left-0 right-0 h-6 bg-gray-800 flex items-center justify-center gap-1.5 px-4 z-30">
                                    <div className="w-2 h-2 rounded-full bg-red-500/50" />
                                    <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                                    <div className="w-2 h-2 rounded-full bg-green-500/50" />
                                    <div className="flex-1" />
                                </div>
                                <div className="pt-6 h-full w-full">
                                    <DynamicPreview
                                        code={section.code}
                                        className="h-full w-full"
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                }
                rightSide={
                    <div className="flex h-full flex-col bg-[#1e1e1e]">
                        <div className="flex items-center justify-between border-b border-white/10 bg-[#1e1e1e] px-6 py-3">
                            <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                custom-liquid-block.liquid
                            </div>
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/20"
                            >
                                {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                {isCopied ? "Copied!" : "Copy Code"}
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto bg-[#1e1e1e]">
                            <SyntaxHighlighter
                                language="html"
                                style={vscDarkPlus}
                                customStyle={{
                                    margin: 0,
                                    padding: "24px",
                                    background: "transparent",
                                    fontSize: "13px",
                                    minHeight: "100%",
                                }}
                                lineNumberStyle={{ color: "rgba(255,255,255,0.2)" }}
                                showLineNumbers
                            >
                                {section.code.trim()}
                            </SyntaxHighlighter>
                        </div>
                    </div>
                }
            />
        </div>
    );
}
