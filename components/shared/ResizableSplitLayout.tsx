"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ResizableSplitLayoutProps {
    leftSide: React.ReactNode;
    rightSide: React.ReactNode;
    initialLeftWidth?: number; // percentage
    minLeftWidth?: number; // percentage
    maxLeftWidth?: number; // percentage
    className?: string;
}

export function ResizableSplitLayout({
    leftSide,
    rightSide,
    initialLeftWidth = 50,
    minLeftWidth = 20,
    maxLeftWidth = 80,
    className
}: ResizableSplitLayoutProps) {
    const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDragging || !containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

            if (newLeftWidth >= minLeftWidth && newLeftWidth <= maxLeftWidth) {
                setLeftWidth(newLeftWidth);
            }
        },
        [isDragging, minLeftWidth, maxLeftWidth]
    );

    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "col-resize";
        } else {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "";
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "";
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <div
            ref={containerRef}
            className={cn("flex flex-1 overflow-hidden relative", className)}
        >
            <div
                style={{ width: `${leftWidth}%` }}
                className="overflow-hidden flex flex-col"
            >
                {leftSide}
            </div>

            {/* Resizable Divider */}
            <div
                onMouseDown={handleMouseDown}
                className={cn(
                    "w-1.5 hover:w-2 bg-border hover:bg-primary transition-all cursor-col-resize z-50 flex items-center justify-center group relative",
                    isDragging && "bg-primary w-2"
                )}
            >
                <div className="h-8 w-1 rounded-full bg-muted-foreground/30 group-hover:bg-primary-foreground/50" />

                {/* Visual handle tooltip-like indicator */}
                <div className={cn(
                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity",
                    isDragging && "opacity-100"
                )}>
                    <div className="w-1 h-4 bg-white/50 rounded-full" />
                </div>
            </div>

            <div
                style={{ width: `${100 - leftWidth}%` }}
                className="overflow-hidden flex flex-col"
            >
                {rightSide}
            </div>
        </div>
    );
}
