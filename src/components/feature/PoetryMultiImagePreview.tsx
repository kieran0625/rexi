"use client";

import { memo, useState, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Eye, Loader2, RefreshCw, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type VerseData = {
    index: number;
    text: string;
    literalMeaning: string;
    imagery: string[];
    emotion: string;
    imagePrompt: string;
};

export type VerseImage = {
    verseIndex: number;
    imageUrl: string;
    isGenerating?: boolean;
};

export type PoetryData = {
    title: string;
    author: string;
    dynasty: string;
    verses: VerseData[];
    overallMeaning: string;
    literaryDevices: string[];
};

type Props = {
    poetryData: PoetryData;
    verseImages: VerseImage[];
    onGenerateVerse: (index: number, prompt: string) => void;
    onGenerateAll: () => void;
    isGeneratingAll?: boolean;
};

function PoetryMultiImagePreviewInner({
    poetryData,
    verseImages,
    onGenerateVerse,
    onGenerateAll,
    isGeneratingAll = false,
}: Props) {
    const [selectedVerse, setSelectedVerse] = useState(0);
    const [expandedImage, setExpandedImage] = useState<string | null>(null);

    const currentVerse = poetryData.verses[selectedVerse];
    const currentImage = verseImages.find((img) => img.verseIndex === selectedVerse);

    const handleDownload = useCallback((imageUrl: string, verseIndex: number) => {
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = `${poetryData.title}-${verseIndex + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [poetryData.title]);

    const handleDownloadAll = useCallback(() => {
        verseImages.forEach((img, i) => {
            if (img.imageUrl) {
                setTimeout(() => handleDownload(img.imageUrl, img.verseIndex), i * 500);
            }
        });
    }, [verseImages, handleDownload]);

    return (
        <div className="bg-white rounded-[24px] border border-stone-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-stone-100 bg-gradient-to-r from-amber-50/50 to-orange-50/50">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                            📜 {poetryData.title}
                        </h2>
                        <p className="text-sm text-stone-500 mt-1">
                            {poetryData.dynasty} · {poetryData.author}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onGenerateAll}
                            disabled={isGeneratingAll}
                            className="rounded-full"
                        >
                            {isGeneratingAll ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                    生成中...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-1.5" />
                                    一键生成全部
                                </>
                            )}
                        </Button>
                        {verseImages.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownloadAll}
                                className="rounded-full"
                            >
                                <Download className="w-4 h-4 mr-1.5" />
                                下载全部
                            </Button>
                        )}
                    </div>
                </div>

                {/* Overall Meaning */}
                <p className="text-sm text-stone-600 leading-relaxed bg-white/60 rounded-xl p-3 border border-stone-100">
                    <span className="font-medium text-stone-700">诗意：</span>
                    {poetryData.overallMeaning}
                </p>
            </div>

            {/* Verse Tabs */}
            <div className="flex border-b border-stone-100 overflow-x-auto">
                {poetryData.verses.map((verse, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedVerse(index)}
                        className={cn(
                            "flex-1 min-w-[120px] px-4 py-3 text-sm font-medium transition-all",
                            selectedVerse === index
                                ? "bg-primary/5 text-primary border-b-2 border-primary"
                                : "text-stone-500 hover:text-stone-700 hover:bg-stone-50"
                        )}
                    >
                        <span className="block text-xs text-stone-400 mb-1">第{index + 1}句</span>
                        <span className="block truncate">{verse.text.slice(0, 7)}...</span>
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Verse Analysis */}
                    <div className="space-y-4">
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
                            <h3 className="text-lg font-bold text-stone-800 mb-3 flex items-center gap-2">
                                ✨ {currentVerse?.text}
                            </h3>

                            <div className="space-y-3">
                                <div className="bg-white/70 rounded-xl p-3">
                                    <span className="text-xs font-medium text-amber-600 block mb-1">字面意思</span>
                                    <p className="text-sm text-stone-700">{currentVerse?.literalMeaning}</p>
                                </div>

                                <div className="bg-white/70 rounded-xl p-3">
                                    <span className="text-xs font-medium text-amber-600 block mb-1">意象</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {currentVerse?.imagery.map((img, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">
                                                {img}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white/70 rounded-xl p-3">
                                    <span className="text-xs font-medium text-amber-600 block mb-1">情感</span>
                                    <p className="text-sm text-stone-700">{currentVerse?.emotion}</p>
                                </div>
                            </div>
                        </div>

                        {/* Literary Devices */}
                        {poetryData.literaryDevices.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {poetryData.literaryDevices.map((device, i) => (
                                    <span key={i} className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-medium">
                                        {device}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Image Preview */}
                    <div className="relative aspect-[3/4] bg-stone-100 rounded-2xl overflow-hidden group">
                        {currentImage?.isGenerating ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
                                <p className="text-sm text-stone-500">正在生成第{selectedVerse + 1}句图片...</p>
                            </div>
                        ) : currentImage?.imageUrl ? (
                            <>
                                <Image
                                    src={currentImage.imageUrl}
                                    alt={currentVerse?.text || "Verse image"}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute bottom-4 left-4 right-4 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="rounded-full bg-white/90 hover:bg-white"
                                        onClick={() => setExpandedImage(currentImage.imageUrl)}
                                    >
                                        <Maximize2 className="w-4 h-4 mr-1.5" />
                                        放大
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="rounded-full bg-white/90 hover:bg-white"
                                        onClick={() => handleDownload(currentImage.imageUrl, selectedVerse)}
                                    >
                                        <Download className="w-4 h-4 mr-1.5" />
                                        下载
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                                    <Eye className="w-8 h-8 text-amber-500" />
                                </div>
                                <p className="text-sm text-stone-500 mb-4">尚未生成此句图片</p>
                                <Button
                                    onClick={() => onGenerateVerse(selectedVerse, currentVerse?.imagePrompt || "")}
                                    className="rounded-full"
                                >
                                    生成此句图片
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-stone-100">
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={selectedVerse === 0}
                        onClick={() => setSelectedVerse(selectedVerse - 1)}
                        className="rounded-full"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        上一句
                    </Button>
                    <span className="text-sm text-stone-400">
                        {selectedVerse + 1} / {poetryData.verses.length}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={selectedVerse === poetryData.verses.length - 1}
                        onClick={() => setSelectedVerse(selectedVerse + 1)}
                        className="rounded-full"
                    >
                        下一句
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </div>

            {/* Image Viewer Dialog */}
            <Dialog open={!!expandedImage} onOpenChange={() => setExpandedImage(null)}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl">
                    <DialogHeader className="p-4 border-b">
                        <DialogTitle>{poetryData.title} - 第{selectedVerse + 1}句</DialogTitle>
                    </DialogHeader>
                    {expandedImage && (
                        <div className="relative aspect-[3/4] max-h-[80vh]">
                            <Image
                                src={expandedImage}
                                alt="Expanded verse image"
                                fill
                                className="object-contain"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

export const PoetryMultiImagePreview = memo(PoetryMultiImagePreviewInner);
