"use client";

import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Heart, MessageCircle, Star, Share2, MoreHorizontal } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface PostPreviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  image: string | null;
  title: string;
  content: string;
}

export function PostPreviewModal({
  isOpen,
  onOpenChange,
  image,
  title,
  content,
}: PostPreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] h-[85vh] p-0 gap-0 overflow-hidden bg-white border-none shadow-2xl sm:rounded-[32px] flex flex-col md:flex-row">
        
        {/* Close Button (Absolute) */}
        <button 
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-50 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors md:hidden"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Left Column: Image */}
        <div className="w-full md:w-[60%] h-[40vh] md:h-full bg-black relative flex items-center justify-center overflow-hidden">
          {image ? (
            <div className="relative w-full h-full">
                {/* Blurred Background */}
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-50 blur-3xl scale-110"
                    style={{ backgroundImage: `url(${image})` }}
                />
                {/* Main Image */}
                <Image
                    src={image}
                    alt="预览图片"
                    fill
                    sizes="(min-width: 768px) 60vw, 95vw"
                    className="object-contain z-10"
                    unoptimized={image.startsWith("data:")}
                />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-white/30">
              <div className="w-20 h-20 border-2 border-white/20 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-4xl">📷</span>
              </div>
              <p className="font-light tracking-widest uppercase text-sm">No Image</p>
            </div>
          )}
        </div>

        {/* Right Column: Content */}
        <div className="w-full md:w-[40%] h-full flex flex-col bg-white relative">
            
            {/* Header / User Info */}
            <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-100 to-pink-100 border border-white shadow-sm" />
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">Rexi Creator</span>
                        <span className="text-[10px] text-gray-400">刚刚发布</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-900 rounded-full w-8 h-8">
                        <MoreHorizontal className="w-5 h-5" />
                    </Button>
                    <DialogClose asChild>
                         <Button variant="ghost" size="icon" className="hidden md:flex text-gray-400 hover:text-gray-900 rounded-full w-8 h-8">
                            <X className="w-5 h-5" />
                         </Button>
                    </DialogClose>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-8 py-6 rexi-scrollbar">
                <div className="max-w-xl mx-auto space-y-6">
                    {/* Title */}
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight tracking-tight">
                        {title || "未命名标题"}
                    </h1>

                    {/* Markdown Content */}
                    <div className="prose prose-gray prose-sm md:prose-base max-w-none text-gray-600 leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content || "暂无内容..."}
                        </ReactMarkdown>
                    </div>

                    {/* Tags (Mock) */}
                    <div className="flex flex-wrap gap-2 pt-4">
                        {["#小红书", "#生活记录", "#灵感", "Rexi"].map(tag => (
                            <span key={tag} className="text-blue-600 text-sm hover:underline cursor-pointer">
                                {tag}
                            </span>
                        ))}
                    </div>
                    
                    <div className="h-8" /> {/* Spacer */}
                </div>
            </div>

            {/* Footer / Interaction Bar */}
            <div className="px-6 py-4 border-t border-gray-50 bg-white shrink-0 pb-6 md:pb-4">
                <div className="flex items-center justify-between max-w-xl mx-auto">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-center gap-1 group cursor-pointer">
                            <div className="p-2 rounded-full group-hover:bg-red-50 transition-colors">
                                <Heart className="w-6 h-6 text-gray-700 group-hover:text-red-500 transition-colors" />
                            </div>
                            <span className="text-xs font-medium text-gray-500">1.2w</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 group cursor-pointer">
                             <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                                <Star className="w-6 h-6 text-gray-700 group-hover:text-blue-500 transition-colors" />
                            </div>
                            <span className="text-xs font-medium text-gray-500">854</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 group cursor-pointer">
                             <div className="p-2 rounded-full group-hover:bg-gray-100 transition-colors">
                                <MessageCircle className="w-6 h-6 text-gray-700 transition-colors" />
                            </div>
                            <span className="text-xs font-medium text-gray-500">236</span>
                        </div>
                    </div>
                    
                    <Button variant="ghost" size="icon" className="text-gray-700 hover:bg-gray-100 rounded-full">
                        <Share2 className="w-6 h-6" />
                    </Button>
                </div>
                
                {/* Input Placeholder */}
                <div className="mt-4 relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200" />
                    <input 
                        type="text" 
                        placeholder="说点什么..." 
                        className="w-full h-10 pl-12 pr-4 bg-gray-100 rounded-full text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                        readOnly
                    />
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
