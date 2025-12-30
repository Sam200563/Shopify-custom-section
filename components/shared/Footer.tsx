"use client";
import React, { useEffect, useState } from "react";

export const Footer = () => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <footer className="border-t bg-muted/30 py-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                    <div className="flex flex-col gap-2">
                        <span className="text-lg font-bold">Section Builder Studio</span>
                        <p className="text-sm text-muted-foreground">Premium Shopify sections for high-converting stores.</p>
                    </div>
                    <div className="flex gap-8 text-sm text-muted-foreground">
                        <a href="#" className="hover:text-primary transition-colors">Documentation</a>
                        <a href="#" className="hover:text-primary transition-colors">License</a>
                        <a href="#" className="hover:text-primary transition-colors">Support</a>
                    </div>
                </div>
                <div className="mt-12 text-center text-xs text-muted-foreground">
                    &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> Section Builder Studio. All rights reserved.
                </div>
            </div>
        </footer>
    );
};
