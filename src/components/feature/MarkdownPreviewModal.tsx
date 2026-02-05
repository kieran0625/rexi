"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-markdown";
import "prismjs/themes/prism.css"; 
import { Check, FileText, Loader2, RefreshCcw, Undo2, Redo2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkdownPreviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialContent: string;
  originalText?: string;
  onSave?: (content: string) => void;
  onAutoSave?: (content: string) => void;
}

type HistoryVersion = {
  content: string;
  timestamp: number;
};

export function MarkdownPreviewModal({
  isOpen,
  onOpenChange,
  initialContent,
  originalText,
  onSave,
  onAutoSave,
}: MarkdownPreviewModalProps) {
  const [content, setContent] = useState(initialContent);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [history, setHistory] = useState<HistoryVersion[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Initialize content when modal opens
  useEffect(() => {
    if (isOpen) {
      setContent(initialContent);
      setHistory([{ content: initialContent, timestamp: Date.now() }]);
      setHistoryIndex(0);
    }
  }, [isOpen, initialContent]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      onAutoSave?.(content);
    }, 800);
    return () => clearTimeout(timer);
  }, [content, isOpen, onAutoSave]);

  const updateContent = (newContent: string) => {
    setContent(newContent);
    
    // Add to history (debounced in a real app, but here strictly on regenerate/major edit)
    // For manual edits, we might not want to spam history. 
    // But for consistency with "undo", we should probably track it.
    // For now, we only add to history on AI Rewrite or initial load to keep it simple as requested for "Regenerate History"
  };

  const handleManualEdit = (newVal: string) => {
    setContent(newVal);
    // Optional: Add debounce logic here to track manual history
  };

  const handleAiRewrite = async () => {
    if (isRegenerating) return;
    setIsRegenerating(true);

    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          originalText: originalText,
          currentContent: content // Optional context
        }),
      });
      
      const data = await res.json();
      
      if (data.xhsTitle || data.xhsContent) {
        const newText = data.xhsTitle ? `# ${data.xhsTitle}\n\n${data.xhsContent}` : data.xhsContent;
        
        // Update State
        setContent(newText);
        
        // Update History
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ content: newText, timestamp: Date.now() });
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        
        // Trigger Auto-Save (Sync to Parent & DB)
        onAutoSave?.(newText);
      }
    } catch (error) {
      console.error("Rewrite failed", error);
      // You could add toast notification here
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const prevVersion = history[newIndex];
      setContent(prevVersion.content);
      setHistoryIndex(newIndex);
      onAutoSave?.(prevVersion.content);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextVersion = history[newIndex];
      setContent(nextVersion.content);
      setHistoryIndex(newIndex);
      onAutoSave?.(nextVersion.content);
    }
  };

  const handleSave = () => {
    onSave?.(content);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[90vw] h-[80vh] flex flex-col p-0 gap-0 overflow-hidden sm:rounded-xl">
        <DialogHeader className="px-6 py-4 border-b bg-background z-10">
          <DialogTitle className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-xl font-semibold">
                <FileText className="w-5 h-5 text-primary" />
                文案编辑与预览
            </div>
            
            <div className="flex items-center gap-2 mr-8">
                {/* History Controls */}
                <div className="flex items-center bg-muted/50 rounded-lg p-1 mr-2">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7" 
                        onClick={handleUndo} 
                        disabled={historyIndex <= 0 || isRegenerating}
                        title="撤销 (Undo)"
                    >
                        <Undo2 className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground w-12 text-center">
                        v{historyIndex + 1} / {history.length}
                    </span>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7" 
                        onClick={handleRedo} 
                        disabled={historyIndex >= history.length - 1 || isRegenerating}
                        title="重做 (Redo)"
                    >
                        <Redo2 className="w-4 h-4" />
                    </Button>
                </div>

                {/* AI Regenerate Button */}
                <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={handleAiRewrite}
                    disabled={isRegenerating}
                    className="gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200"
                >
                    {isRegenerating ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>AI 创作中...</span>
                        </>
                    ) : (
                        <>
                            <RefreshCcw className="w-4 h-4" />
                            <span>AI 重新生成</span>
                        </>
                    )}
                </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Editor Section */}
          <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r overflow-hidden relative group">
            <div className="absolute top-0 left-0 right-0 bg-muted/80 backdrop-blur-sm px-4 py-2 text-xs font-medium text-muted-foreground border-b z-10 flex justify-between items-center">
              <span>编辑 (Markdown)</span>
              <span className="text-[10px] opacity-70">支持 Markdown 语法</span>
            </div>
            <div className="flex-1 overflow-auto bg-background pt-10">
               <Editor
                value={content}
                onValueChange={handleManualEdit}
                highlight={(code) => highlight(code, languages.markdown, 'markdown')}
                padding={24}
                style={{
                  fontFamily: '"Fira code", "Fira Mono", monospace',
                  fontSize: 14,
                  minHeight: "100%",
                  backgroundColor: "transparent",
                }}
                textareaClassName="focus:outline-none"
                className="min-h-full"
              />
            </div>
          </div>

          {/* Preview Section */}
          <div className="flex-1 flex flex-col overflow-hidden bg-muted/10 relative">
             <div className="absolute top-0 left-0 right-0 bg-muted/80 backdrop-blur-sm px-4 py-2 text-xs font-medium text-muted-foreground border-b z-10">
              <span>实时预览</span>
            </div>
            <div className="flex-1 overflow-auto p-8 pt-12 prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-primary prose-img:rounded-lg">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/20">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Check className="w-4 h-4" />
            确认保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
