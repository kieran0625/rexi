"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
    ArrowRight, 
    Sparkles, 
    Zap, 
    Image as ImageIcon, 
    Wand2, 
    Palette, 
    Type, 
    Layers, 
    Share2, 
    Smartphone,
    CheckCircle2,
    Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface HomePageProps {
    onStart: () => void;
}

export default function HomePage({ onStart }: HomePageProps) {
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleStart = () => {
        if (typeof window !== "undefined") {
            sessionStorage.removeItem("rexi:draft-state");
            sessionStorage.removeItem("rexi:generate:last-state-key");
            sessionStorage.removeItem("rexi:generating-task-id");
        }
        router.push("/generate");
    };

    return (
        <div className="min-h-screen bg-stone-50/50 font-sans selection:bg-rose-500/20 selection:text-rose-600 overflow-x-hidden">
            
            {/* Navigation Bar */}
            <nav className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
                scrolled ? "bg-white/80 backdrop-blur-md border-stone-200/50 py-3" : "bg-transparent py-5"
            )}>
                <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center text-white font-bold shadow-lg shadow-rose-500/20">
                            R
                        </div>
                        <span className="text-lg font-bold text-stone-900 tracking-tight">Rexi</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">Features</a>
                        <a href="#showcase" className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">Showcase</a>
                        <a href="#pricing" className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">Pricing</a>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" className="hidden sm:flex text-stone-600 hover:text-stone-900">Log in</Button>
                        <Button onClick={handleStart} className="rounded-full bg-stone-900 hover:bg-stone-800 text-white shadow-xl shadow-stone-900/20 transition-all hover:scale-105">
                            Get Started
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-rose-100/50 to-transparent rounded-[100%] blur-3xl -z-10 opacity-60 pointer-events-none" />
                <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-orange-100/40 rounded-full blur-3xl -z-10 animate-pulse-slow pointer-events-none" />

                <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-stone-200 shadow-sm mb-8 animate-fade-in-up">
                        <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                        <span className="text-xs font-medium text-stone-600 tracking-wide uppercase">Rexi 4.0 with Nano Banana Pro</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-stone-900 tracking-tight mb-6 leading-[1.1] animate-fade-in-up delay-100">
                        Create Viral <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500">
                            XHS Content
                        </span>
                        <span className="ml-4 inline-block align-middle w-12 h-12 md:w-20 md:h-20 bg-stone-900 rounded-full rotate-12 animate-float border-4 border-white shadow-xl overflow-hidden relative top-[-10px]">
                            <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop" alt="Avatar" className="w-full h-full object-cover opacity-80" />
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-stone-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
                        The AI-powered creative studio for Xiaohongshu creators. 
                        Generate stunning visuals, engaging copy, and trend-setting layouts in seconds.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
                        <Button 
                            onClick={handleStart}
                            size="lg" 
                            className="h-14 px-8 rounded-full text-lg bg-stone-900 hover:bg-stone-800 text-white shadow-2xl shadow-stone-900/30 hover:shadow-stone-900/40 transition-all hover:-translate-y-1 w-full sm:w-auto"
                        >
                            Start Creating Free <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        <Button 
                            variant="outline" 
                            size="lg" 
                            className="h-14 px-8 rounded-full text-lg border-stone-200 hover:bg-white hover:border-stone-300 text-stone-600 transition-all w-full sm:w-auto bg-white/50 backdrop-blur-sm"
                        >
                            <Play className="mr-2 w-4 h-4 fill-current" /> Watch Demo
                        </Button>
                    </div>

                    {/* Hero Visual / Dashboard Preview */}
                    <div className="mt-20 relative max-w-6xl mx-auto animate-fade-in-up delay-500 [perspective:2000px]">
                        <div className="relative rounded-2xl border border-stone-200/60 bg-white/80 backdrop-blur-xl overflow-hidden [transform:rotateX(12deg)] hover:[transform:rotateX(0deg)] transition-transform duration-700 ease-out p-2 origin-center">
                            <div className="rounded-xl overflow-hidden bg-stone-50 border border-stone-100 aspect-[16/9] relative group">
                                {/* Mock UI Elements */}
                                <div className="absolute top-0 left-0 right-0 h-12 bg-white border-b border-stone-100 flex items-center px-4 gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-400/80" />
                                        <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                                        <div className="w-3 h-3 rounded-full bg-green-400/80" />
                                    </div>
                                    <div className="mx-auto w-1/3 h-6 bg-stone-100 rounded-md" />
                                </div>
                                <div className="absolute inset-0 top-12 flex">
                                    <div className="w-64 border-r border-stone-100 bg-white p-4 space-y-3 hidden md:block">
                                        <div className="h-8 w-full bg-stone-100 rounded-lg" />
                                        <div className="h-8 w-3/4 bg-stone-50 rounded-lg" />
                                        <div className="h-8 w-5/6 bg-stone-50 rounded-lg" />
                                    </div>
                                    <div className="flex-1 p-8 flex items-center justify-center bg-stone-50/50">
                                        <div className="grid grid-cols-3 gap-4 w-full max-w-3xl">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="aspect-[3/4] rounded-xl bg-white shadow-sm border border-stone-100 p-3 space-y-3 hover:-translate-y-2 transition-transform duration-300">
                                                    <div className="w-full h-2/3 bg-stone-100 rounded-lg overflow-hidden relative">
                                                        <div className={`absolute inset-0 bg-gradient-to-br ${i === 1 ? 'from-rose-100 to-orange-100' : i === 2 ? 'from-blue-100 to-purple-100' : 'from-green-100 to-teal-100'}`} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="h-3 w-3/4 bg-stone-100 rounded" />
                                                        <div className="h-3 w-1/2 bg-stone-50 rounded" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Floating Elements */}
                                <div className="absolute top-1/4 right-1/4 bg-white p-4 rounded-2xl shadow-xl border border-stone-100 animate-float delay-100 hidden lg:block">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-stone-900">AI Magic</div>
                                            <div className="text-xs text-stone-500">Generating...</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid (Bento Style) */}
            <section id="features" className="py-24 bg-white relative">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">Everything you need to go viral</h2>
                        <p className="text-stone-500 text-lg">Powerful tools designed specifically for the Xiaohongshu ecosystem.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[300px]">
                        
                        {/* Large Card */}
                        <div className="md:col-span-2 lg:col-span-2 row-span-2 rounded-[2rem] bg-stone-50 border border-stone-100 p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-rose-200/50 transition-colors" />
                            <div className="relative z-10 h-full flex flex-col">
                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6">
                                    <Wand2 className="w-6 h-6 text-rose-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-stone-900 mb-2">AI Visual Generation</h3>
                                <p className="text-stone-500 mb-8 max-w-md">Create stunning, platform-native visuals with our specialized Nano Banana Pro model. From 3D clay styles to realistic photography.</p>
                                <div className="flex-1 bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden relative">
                                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1633511090164-b43840ea1607?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-90 group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-3 rounded-lg text-xs font-medium text-stone-600 shadow-sm">
                                        Prompt: "A cozy coffee shop corner, warm lighting, cinematic..."
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tall Card */}
                        <div className="md:col-span-1 lg:col-span-1 row-span-2 rounded-[2rem] bg-stone-900 text-white p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/50 to-transparent" />
                            <div className="relative z-10 h-full flex flex-col">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 backdrop-blur-sm">
                                    <Type className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Smart Copy</h3>
                                <p className="text-stone-400 mb-8">Generate engaging captions with proper emoji usage and line breaks.</p>
                                <div className="flex-1 space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 text-sm text-stone-300 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
                                            <div className="flex gap-2 mb-1">
                                                <span className="text-rose-400">✨</span>
                                                <span className="font-medium text-white">Viral Title {i}</span>
                                            </div>
                                            <div className="line-clamp-2 text-xs opacity-70">
                                                Discover the hidden gems of city life with this amazing guide...
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Small Card 1 */}
                        <div className="md:col-span-1 lg:col-span-1 rounded-[2rem] bg-orange-50 border border-orange-100 p-8 relative overflow-hidden group hover:shadow-lg transition-all">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center mb-4 text-orange-600">
                                <Palette className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-stone-900 mb-1">Style Transfer</h3>
                            <p className="text-sm text-stone-500">Apply trending art styles instantly.</p>
                        </div>

                        {/* Small Card 2 */}
                        <div className="md:col-span-1 lg:col-span-1 rounded-[2rem] bg-blue-50 border border-blue-100 p-8 relative overflow-hidden group hover:shadow-lg transition-all">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-4 text-blue-600">
                                <Layers className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-stone-900 mb-1">Layouts</h3>
                            <p className="text-sm text-stone-500">Auto-composition for posters.</p>
                        </div>

                         {/* Wide Card */}
                         <div className="md:col-span-2 lg:col-span-2 rounded-[2rem] bg-white border border-stone-200 p-8 relative overflow-hidden group hover:shadow-xl transition-all flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-1">
                                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center mb-4 text-stone-600">
                                    <Smartphone className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold text-stone-900 mb-2">Mobile First Preview</h3>
                                <p className="text-stone-500 mb-4">See exactly how your post looks on the phone before publishing.</p>
                                <Button variant="link" className="p-0 h-auto text-rose-500 hover:text-rose-600">Learn more <ArrowRight className="w-4 h-4 ml-1" /></Button>
                            </div>
                            <div className="w-full md:w-1/2 aspect-[16/9] bg-stone-50 rounded-xl border border-stone-100 relative overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-32 h-full bg-white border-x border-stone-200 shadow-sm" />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Social Proof / Stats */}
            <section className="py-20 bg-stone-900 text-white overflow-hidden">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { label: "Active Creators", value: "50K+" },
                            { label: "Posts Generated", value: "1M+" },
                            { label: "Avg. Engagement", value: "+150%" },
                            { label: "Time Saved", value: "20h/mo" },
                        ].map((stat, i) => (
                            <div key={i} className="space-y-2">
                                <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                                    {stat.value}
                                </div>
                                <div className="text-stone-400 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 bg-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-50 via-white to-white opacity-70" />
                <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
                    <h2 className="text-4xl md:text-6xl font-bold text-stone-900 mb-6 tracking-tight">
                        Ready to create your next <br />
                        <span className="text-rose-500">Viral Hit?</span>
                    </h2>
                    <p className="text-xl text-stone-500 mb-10 max-w-2xl mx-auto">
                        Join thousands of creators using Rexi to dominate the Xiaohongshu algorithm.
                    </p>
                    <Button 
                        onClick={handleStart}
                        size="lg" 
                        className="h-16 px-12 rounded-full text-xl bg-stone-900 hover:bg-stone-800 text-white shadow-2xl shadow-rose-500/20 hover:shadow-rose-500/30 transition-all hover:scale-105"
                    >
                        Start Creating Now
                    </Button>
                    <div className="mt-8 flex items-center justify-center gap-6 text-sm text-stone-400">
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> No credit card required</span>
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Free tier available</span>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-stone-50 border-t border-stone-200">
                <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-stone-900 flex items-center justify-center text-white text-xs font-bold">R</div>
                        <span className="font-bold text-stone-900">Rexi</span>
                    </div>
                    <div className="text-sm text-stone-500">
                        © 2026 Rexi Inc. All rights reserved.
                    </div>
                    <div className="flex gap-6">
                        <a href="#" className="text-stone-400 hover:text-stone-900 transition-colors"><Share2 className="w-4 h-4" /></a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
