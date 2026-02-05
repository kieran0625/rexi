"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Image as ImageIcon, Wand2, Palette, Type } from "lucide-react";
import { cn } from "@/lib/utils";

interface HomePageProps {
    onStart: () => void;
}

export default function HomePage({ onStart }: HomePageProps) {
    return (
        <div className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-noise">

            {/* Dynamic Background Elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-peach/20 rounded-full blur-3xl -z-10 animate-pulse delay-700" />

            {/* Hero Content */}
            <div className="container px-4 text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 z-10 flex flex-col items-center">

                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 dark:bg-black/30 backdrop-blur-md border border-white/20 dark:border-white/10 text-sm font-medium shadow-sm ring-1 ring-white/50 hover:scale-105 transition-transform cursor-default">
                    <Sparkles className="w-4 h-4 text-accent-rose animate-pulse" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-rose to-accent-peach font-bold">
                        Rexi 4.0 Available Now
                    </span>
                </div>

                {/* Main Headline */}
                <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground max-w-5xl mx-auto leading-[1.1]">
                    Ignite Your <br />
                    <span className="text-gradient-primary">
                        Creative Spark
                    </span>
                </h1>

                {/* Subheadline */}
                <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-sans text-balance leading-relaxed">
                    The ultimate AI companion for Xiaohongshu creators.
                    Generate stunning copy, trend-setting visuals, and viral layouts in seconds.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                    <Button
                        size="lg"
                        onClick={onStart}
                        className="rounded-full text-lg h-14 px-10 shadow-primary hover:shadow-primary-lg transition-all hover:scale-105 hover:-translate-y-0.5 bg-gradient-to-r from-primary to-accent-rose border-0"
                    >
                        Start Creating <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    <Button
                        variant="outline"
                        size="lg"
                        className="rounded-full text-lg h-14 px-10 bg-white/50 dark:bg-black/30 backdrop-blur-sm border-white/40 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 transition-all hover:scale-105"
                    >
                        <span className="mr-2">✨</span> View Gallery
                    </Button>
                </div>
            </div>

            {/* Feature Bento Grid */}
            <div className="container mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-0 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-forwards max-w-5xl px-4">

                {/* Card 1: Copywriting */}
                <div className="group relative p-8 glass-enhanced rounded-[2rem] hover:translate-y-[-4px] transition-all duration-300 cursor-default overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Type className="w-24 h-24 rotate-12" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Zap className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="font-serif text-2xl font-bold mb-3 group-hover:text-primary transition-colors">Instant Copy</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Craft catchy headlines and engaging stories tailored for the XHS algorithm.
                        </p>
                    </div>
                </div>

                {/* Card 2: Visuals */}
                <div className="group relative p-8 glass-enhanced rounded-[2rem] hover:translate-y-[-4px] transition-all duration-300 cursor-default overflow-hidden md:col-span-1">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Palette className="w-24 h-24 rotate-12" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-accent-purple/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Wand2 className="w-6 h-6 text-accent-purple" />
                        </div>
                        <h3 className="font-serif text-2xl font-bold mb-3 group-hover:text-accent-purple transition-colors">Style Magic</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            One-click transformations: 3D Clay, Glassmorphism, Film Grain, and more.
                        </p>
                    </div>
                </div>

                {/* Card 3: Layouts */}
                <div className="group relative p-8 glass-enhanced rounded-[2rem] hover:translate-y-[-4px] transition-all duration-300 cursor-default overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ImageIcon className="w-24 h-24 rotate-12" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-accent-mint/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Sparkles className="w-6 h-6 text-accent-mint" />
                        </div>
                        <h3 className="font-serif text-2xl font-bold mb-3 group-hover:text-accent-mint transition-colors">Smart Layouts</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Auto-composition that balances text and visuals perfectly.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    )
}
