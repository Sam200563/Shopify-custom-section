"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Moon, Sun, Menu, X, User } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";
import { AuthModal } from "@/components/auth/AuthModal";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
    const { theme, setTheme } = useTheme();
    const { user } = useAuth();
    const [mounted, setMounted] = React.useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="bg-primary h-8 w-8 rounded-lg flex items-center justify-center">
                            <span className="text-primary-foreground font-bold font-mono">S</span>
                        </div>
                        <span className="hidden font-bold sm:inline-block">SectionStudio</span>
                    </Link>

                    <div className="hidden md:flex gap-6 text-sm font-medium">
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <Link href="/sections" className="hover:text-primary transition-colors">Sections</Link>
                        <Link href="/upload" className="hover:text-primary transition-colors">Create</Link>
                    </div>
                </div>

                <div className="flex flex-1 items-center justify-end gap-4 md:gap-8">
                    <div className={cn(
                        "relative hidden w-full max-w-[300px] items-center transition-all lg:flex",
                        isSearchFocused ? "max-w-[400px]" : "max-w-[300px]"
                    )}>
                        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search sections..."
                            className="h-10 w-full rounded-full border bg-muted/50 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        {user ? (
                            <Link href="/profile">
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <User className="h-5 w-5" />
                                </Button>
                            </Link>
                        ) : (
                            <AuthModal>
                                <Button variant="default" size="sm" className="rounded-full px-4">Sign In</Button>
                            </AuthModal>
                        )}

                        <button
                            onClick={() => mounted && setTheme(theme === "dark" ? "light" : "dark")}
                            className="rounded-full p-2 hover:bg-muted transition-colors relative"
                            aria-label="Toggle theme"
                        >
                            <Sun className={cn(
                                "h-5 w-5 rotate-0 scale-100 transition-all",
                                mounted && theme === "dark" ? "-rotate-90 scale-0" : ""
                            )} />
                            <Moon className={cn(
                                "absolute left-2 top-2 h-5 w-5 rotate-90 scale-0 transition-all",
                                mounted && theme === "dark" ? "rotate-0 scale-100" : ""
                            )} />
                            <span className="sr-only">Toggle theme</span>
                        </button>
                        <button
                            className="md:hidden p-2 rounded-full hover:bg-muted"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t bg-background px-4 py-4"
                    >
                        <div className="flex flex-col gap-4">
                            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                            <Link href="/sections" onClick={() => setIsMobileMenuOpen(false)}>Sections</Link>
                            <Link href="/upload" onClick={() => setIsMobileMenuOpen(false)}>Create Section</Link>
                            {user ? (
                                <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>My Profile</Link>
                            ) : (
                                <div onClick={() => setIsMobileMenuOpen(false)}>
                                    <AuthModal />
                                </div>
                            )}
                            <div className="relative flex items-center">
                                <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search sections..."
                                    className="h-10 w-full rounded-lg border bg-muted/50 pl-10 pr-4 text-sm focus:outline-none"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};
