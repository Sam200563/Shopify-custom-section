"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSectionStore } from "@/lib/section-store";
import { toast } from "sonner";
import { DynamicPreview } from "@/components/shared/DynamicPreview";
import { Niche } from "@/data/sections";
import { Loader2, ArrowLeft, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";

const availableNiches: Niche[] = [
    "Beauty", "Electronics", "Dropshipping", "Fashion", "Fitness",
    "Home Decor", "Jewelry", "Luxury", "Minimal", "Ready-To-Use Templates"
];

export default function UploadPage() {
    const router = useRouter();
    const { addSection } = useSectionStore();
    const { user, isLoading: authLoading } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Custom");
    const [niches, setNiches] = useState<string[]>([]);
    const [previewFile, setPreviewFile] = useState<File | null>(null);

    // Single Block Code
    const [code, setCode] = useState<string>(`{% stylesheet %}
  /* Add your CSS here */
  .my-section { padding: 40px; text-align: center; }
  .title { font-size: 2rem; color: #333; }
{% endstylesheet %}

{% javascript %}
  console.log('Section Loaded');
{% endjavascript %}

<div class="my-section">
  <h2 class="title">{{ section.settings.heading }}</h2>
  <p>Start editing the Liquid code to see changes live!</p>
</div>

{% schema %}
{
  "name": "My Custom Section",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Hello World"
    }
  ]
}
{% endschema %}`);

    // Auth check
    useEffect(() => {
        if (!authLoading && !user) {
            toast.error("Please login to upload sections");
            router.push("/");
        }
    }, [user, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (!name || !code) {
            toast.error("Name and Code are required");
            setIsLoading(false);
            return;
        }

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
        let previewUrl = "/custom_section_placeholder.png";

        try {
            // Upload Image if selected
            if (previewFile) {
                const fileExt = previewFile.name.split('.').pop();
                const fileName = `${slug}-${Date.now()}.${fileExt}`;
                const { data, error } = await supabase.storage
                    .from('section-previews')
                    .upload(fileName, previewFile);

                if (error) throw error;

                const { data: { publicUrl } } = supabase.storage
                    .from('section-previews')
                    .getPublicUrl(fileName);

                previewUrl = publicUrl;
            }

            await addSection({
                slug,
                name,
                description,
                category,
                niches: niches as any,
                preview: previewUrl,
                code: code,
                author_name: user?.user_metadata?.full_name // Explicitly pass it
            });

            toast.success("Section created successfully!");
            router.push(`/sections/${slug}?custom=true`);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to create section");
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-muted/20 pt-24 pb-12 px-4">
            <div className="container mx-auto max-w-[1600px]">
                <div className="flex items-center justify-between mb-8">
                    <Link href="/sections" className="inline-flex items-center text-sm text-gray-500 hover:text-black">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Library
                    </Link>
                    <h1 className="text-2xl font-bold">Upload Custom Section</h1>
                    <div className="w-24"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start h-full">
                    {/* Left: Input Form */}
                    <div className="space-y-6">
                        <Card className="border-0 shadow-md">
                            <CardHeader>
                                <CardTitle>Section Details</CardTitle>
                                <CardDescription>Define your section metadata.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Section Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="e.g. Hero Video"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Input
                                            id="category"
                                            placeholder="e.g. Hero"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="preview">Preview Image</Label>
                                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition cursor-pointer relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => setPreviewFile(e.target.files?.[0] || null)}
                                        />
                                        <div className="flex flex-col items-center gap-2">
                                            <UploadCloud className="w-8 h-8 text-gray-400" />
                                            <span className="text-sm text-gray-600">
                                                {previewFile ? previewFile.name : "Click to upload thumbnail"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Niches (Select multiple)</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {availableNiches.map((niche) => (
                                            <button
                                                key={niche}
                                                type="button"
                                                onClick={() => setNiches(prev =>
                                                    prev.includes(niche) ? prev.filter(n => n !== niche) : [...prev, niche]
                                                )}
                                                className={`rounded-full px-3 py-1 text-xs font-medium transition-all border ${niches.includes(niche)
                                                    ? "bg-primary text-primary-foreground border-primary"
                                                    : "bg-background text-muted-foreground border-zinc-200 hover:border-zinc-300"
                                                    }`}
                                            >
                                                {niche}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Brief description..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="h-20"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-md flex-1">
                            <CardHeader className="pb-3">
                                <CardTitle>Liquid Code</CardTitle>
                                <CardDescription>Paste your full .liquid file content here. Includes Schema, CSS, and JS.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Textarea
                                            id="code"
                                            className="font-mono text-xs h-[500px] leading-relaxed bg-muted/50 border-zinc-200 dark:border-zinc-800 resize-none"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            spellCheck={false}
                                        />
                                    </div>

                                    <Button type="submit" size="lg" className="w-full bg-black hover:bg-zinc-800" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Create & Save Section
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Live Preview */}
                    <div className="lg:sticky lg:top-24 space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="font-semibold text-gray-900">Live Preview</h3>
                            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">Autosyncing</span>
                        </div>

                        <div className="aspect-[16/10] w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative">
                            {/* If user uploaded an image and no code changes, we could show it, but dynamic preview is for code */}
                            <DynamicPreview code={code} className="w-full h-full" />
                        </div>

                        <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-lg border border-blue-100 flex gap-3 items-start">
                            <div className="mt-1 shrink-0">ℹ️</div>
                            <p>
                                This preview mocks Shopify Liquid logic.
                                Settings defined in <code>{'{% schema %}'}</code> are automatically populated with their
                                <code>default</code> values.
                                Loops like <code>{'{% for block in section.blocks %}'}</code> are simulated.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
