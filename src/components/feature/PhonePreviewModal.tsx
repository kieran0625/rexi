"use client";

import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Smartphone, RotateCw, ZoomIn, ZoomOut, Download, Share2, Heart, MessageCircle, Star } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

interface PhonePreviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  image: string | null;
  title: string;
  content: string;
}

export function PhonePreviewModal({
  isOpen,
  onOpenChange,
  image,
  title,
  content,
}: PhonePreviewModalProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full h-[90vh] p-0 bg-gray-100/95 backdrop-blur-xl border-none shadow-2xl flex flex-col overflow-hidden">
        
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
            <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-gray-700" />
                <span className="font-semibold text-gray-700">真机预览</span>
            </div>
            
            <div className="flex items-center gap-6">
                {/* Scale Control */}
                <div className="flex items-center gap-2 hidden sm:flex">
                    <ZoomOut className="w-4 h-4 text-gray-400" />
                    <Slider 
                        value={[scale]} 
                        onValueChange={(vals) => setScale(vals[0])} 
                        min={0.5} 
                        max={1.5} 
                        step={0.1} 
                        className="w-32"
                    />
                    <ZoomIn className="w-4 h-4 text-gray-400" />
                </div>

                {/* Rotate Control */}
                <Button variant="ghost" size="icon" onClick={handleRotate} title="旋转屏幕">
                    <RotateCw className="w-5 h-5 text-gray-600" />
                </Button>

                <div className="w-px h-6 bg-gray-300 mx-2 hidden sm:block" />

                <DialogClose asChild>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-200">
                        <X className="w-5 h-5 text-gray-600" />
                    </Button>
                </DialogClose>
            </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-hidden relative flex items-center justify-center p-8 bg-dot-pattern">
            
            <div 
                className="transition-all duration-500 ease-in-out origin-center"
                style={{
                    transform: `scale(${scale}) rotate(${rotation}deg)`
                }}
            >
                {/* Phone Shell */}
                <div className="relative bg-white rounded-[3rem] shadow-[0_0_0_12px_#1a1a1a,0_0_0_14px_#333,0_20px_50px_-10px_rgba(0,0,0,0.5)] overflow-hidden w-[375px] h-[812px] border-8 border-gray-900 mx-auto select-none">
                    
                    {/* Notch / Status Bar */}
                    <div className="absolute top-0 inset-x-0 h-12 bg-transparent z-50 flex justify-between items-center px-6">
                        <div className="text-sm font-semibold text-white mix-blend-difference">9:41</div>
                        <div className="flex gap-1.5">
                           <div className="w-4 h-2.5 bg-white mix-blend-difference rounded-[1px]" />
                           <div className="w-4 h-2.5 bg-white mix-blend-difference rounded-[1px]" />
                           <div className="w-5 h-2.5 bg-white mix-blend-difference rounded-[1px]" />
                        </div>
                    </div>
                    {/* Dynamic Island / Notch Mockup */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 h-7 w-32 bg-black rounded-b-2xl z-50" />

                    {/* Screen Content */}
                    <div className="w-full h-full overflow-y-auto scrollbar-hide bg-white flex flex-col">
                        
                        {/* Image Section */}
                        <div className="relative w-full aspect-[3/4] bg-gray-100 shrink-0">
                            {image ? (
                                <Image
                                  src={image}
                                  alt="预览图片"
                                  fill
                                  sizes="375px"
                                  className="object-cover"
                                  unoptimized={image.startsWith("data:")}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                                    <span className="text-xs">No Image</span>
                                </div>
                            )}
                            
                            {/* Overlay Controls (Simulated) */}
                            <div className="absolute top-4 right-4 flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center">
                                    <Share2 className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Text Content Section */}
                        <div className="p-4 space-y-4 pb-20">
                            <h1 className="text-lg font-bold text-gray-900 leading-snug">
                                {title || "这里是标题"}
                            </h1>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-full bg-gray-200" />
                                <span className="text-xs text-gray-500">Rexi Creator</span>
                                <span className="text-xs text-gray-300">•</span>
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-xhs-red font-medium hover:bg-red-50">关注</Button>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {content || "这里是正文内容..."}
                            </p>
                            
                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5 pt-2">
                                {["#小红书", "#生活", "#OOTD", "#灵感"].map(tag => (
                                    <span key={tag} className="text-blue-900 text-xs">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            
                            <div className="text-xs text-gray-400 pt-2">02-01 编辑于 上海</div>
                            
                            <div className="h-px bg-gray-100 my-4" />
                            
                            {/* Comments Preview */}
                            <div className="space-y-3">
                                <div className="text-sm font-medium text-gray-900">共 10 条评论</div>
                                <div className="flex gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0" />
                                    <div className="flex-1">
                                        <div className="text-xs text-gray-500">用户A</div>
                                        <div className="text-sm text-gray-800">这也太好看了吧！😍</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="absolute bottom-0 inset-x-0 h-20 bg-white border-t border-gray-100 flex items-center justify-between px-6 pb-4 z-40">
                         <div className="flex items-center gap-1 bg-gray-100 rounded-full px-4 py-2 flex-1 mr-4">
                            <span className="text-sm text-gray-400">说点什么...</span>
                         </div>
                         <div className="flex items-center gap-5 text-gray-600">
                             <div className="flex flex-col items-center gap-0.5">
                                 <Heart className="w-6 h-6" />
                                 <span className="text-[10px]">1.2k</span>
                             </div>
                             <div className="flex flex-col items-center gap-0.5">
                                 <Star className="w-6 h-6" />
                                 <span className="text-[10px]">852</span>
                             </div>
                             <div className="flex flex-col items-center gap-0.5">
                                 <MessageCircle className="w-6 h-6" />
                                 <span className="text-[10px]">234</span>
                             </div>
                         </div>
                    </div>

                    {/* Home Indicator */}
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/20 rounded-full z-50" />
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
