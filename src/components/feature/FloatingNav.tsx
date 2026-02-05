"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Home, Sparkles, Image as ImageIcon, Plus, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const navItems = [
    { icon: Home, label: "首页", href: "/" },
    { icon: Sparkles, label: "创作", href: "/generate" },
    { icon: ImageIcon, label: "作品", href: "/works" },
];

export function FloatingNav() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            {/* Desktop: Top Horizontal Nav */}
            <nav className="fixed top-0 left-0 right-0 h-16 z-[60] hidden md:flex items-center justify-between px-6 lg:px-8">
                {/* Glassmorphism background */}
                <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-stone-200/50 dark:border-slate-700/50 shadow-sm" />

                {/* Content */}
                <div className="relative z-10 flex items-center justify-between w-full max-w-[1800px] mx-auto">
                    {/* Left: Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-rose-500 to-orange-400 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/25 group-hover:shadow-primary/40 group-hover:scale-105 transition-all duration-300">
                            <span className="relative z-10">R</span>
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary via-rose-500 to-orange-400 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-stone-900 dark:text-white">Rexi</span>
                    </Link>

                    {/* Center: Navigation Menu */}
                    <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
                        <div className="flex items-center gap-1 p-1 bg-stone-100/80 dark:bg-slate-800/80 rounded-full backdrop-blur-sm">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href ||
                                    (item.href !== "/" && pathname.startsWith(item.href));
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                                            isActive
                                                ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                                                : "text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50"
                                        )}
                                    >
                                        <Icon className={cn("w-4 h-4", isActive && "text-primary")} />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/generate"
                            onClick={() => {
                                if (typeof window !== "undefined") {
                                    sessionStorage.removeItem("rexi:draft-state");
                                    sessionStorage.removeItem("rexi:generate:last-state-key");
                                    sessionStorage.removeItem("rexi:generating-task-id");
                                    // Also force clear edit work state if user explicitly clicks "New"
                                    sessionStorage.removeItem("rexi:edit-work");
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-300"
                        >
                            <Plus className="w-4 h-4" />
                            <span>新建</span>
                        </Link>
                        <button className="w-9 h-9 rounded-full bg-gradient-to-br from-stone-200 to-stone-100 dark:from-slate-700 dark:to-slate-600 border border-stone-200/50 dark:border-slate-600/50 flex items-center justify-center hover:scale-105 transition-transform duration-200 overflow-hidden">
                            <span className="text-stone-500 dark:text-slate-400 text-sm font-medium">U</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile: Top Bar */}
            <nav className="fixed top-0 left-0 right-0 h-14 z-[60] md:hidden">
                <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-stone-200/50 dark:border-slate-700/50" />
                <div className="relative z-10 h-full flex items-center justify-between px-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary via-rose-500 to-orange-400 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20">
                            R
                        </div>
                        <span className="font-bold text-lg text-stone-900 dark:text-white">Rexi</span>
                    </Link>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="w-9 h-9 rounded-full bg-stone-100 dark:bg-slate-800 flex items-center justify-center"
                    >
                        {mobileMenuOpen ? (
                            <X className="w-5 h-5 text-stone-600 dark:text-slate-400" />
                        ) : (
                            <Menu className="w-5 h-5 text-stone-600 dark:text-slate-400" />
                        )}
                    </button>
                </div>
            </nav>

            {/* Mobile: Bottom Tab Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-bottom">
                <div className="mx-4 mb-4">
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-stone-200/50 dark:border-slate-700/50 shadow-2xl rounded-2xl px-2 py-2 flex items-center justify-around">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href !== "/" && pathname.startsWith(item.href));
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-stone-400 dark:text-slate-500"
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-[10px] font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Mobile: Slide-down Menu */}
            <div className={cn(
                "fixed inset-x-0 top-14 z-50 md:hidden transition-all duration-300 transform origin-top",
                mobileMenuOpen
                    ? "opacity-100 scale-y-100"
                    : "opacity-0 scale-y-0 pointer-events-none"
            )}>
                <div className="mx-4 mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/50 dark:border-slate-700/50 shadow-xl p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-stone-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
