"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
    Copy,
    Download,
    Eye,
    FileText,
    Image as ImageIcon,
    Link as LinkIcon,
    Loader2,
    Maximize2,
    Palette,
    RefreshCw,
    RotateCcw,
    Sparkles,
    Wand2,
    Share2,
    ArrowRight,
    MoreHorizontal,
    Trash2,
    X,
    AlertTriangle,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import { MarkdownPreviewModal } from "./MarkdownPreviewModal";
import { PoetryMultiImagePreview, type PoetryData, type VerseImage } from "./PoetryMultiImagePreview";

const ART_STYLES = [
    {
        category: "Photography & Realism",
        styles: ["Cinematic Shot (电影感)", "Street Photography (街头摄影)", "Product Photography (产品静物)", "Portrait Photography (人像写真)", "Film Grain (胶片感)"]
    },
    {
        category: "Classical & Traditional",
        styles: ["Chinese Ink Wash (水墨)", "Oil Painting (油画)", "Ukiyo-e (浮世绘)", "Fresco (壁画)", "Gongbi (工笔)"]
    },
    {
        category: "Modern Art",
        styles: ["Impressionism (印象派)", "Expressionism (表现主义)", "Surrealism (超现实主义)", "Art Nouveau (新艺术运动)", "Fauvism (野兽派)"]
    },
    {
        category: "Digital & Pop",
        styles: ["Cyberpunk (赛博朋克)", "Steampunk (蒸汽朋克)", "Vaporwave", "Dreamcore (梦核)", "Pixel Art (像素)", "Ghibli Style (吉卜力)", "3D Render"]
    },
    {
        category: "Texture & Craft",
        styles: ["Watercolor (水彩)", "Charcoal Sketch (炭笔)", "Paper Cutout (剪纸)", "Embroidery (刺绣)", "Ceramic Glaze (釉色)"]
    },
    {
        category: "XHS Trending",
        styles: ["3D Clay (3D粘土风)", "Collage Poster (海报拼贴)", "Glassmorphism (毛玻璃)", "Paper Cut Lightbox (纸雕灯)", "Isometric Room (等轴微缩)"]
    }
];

const INSPIRATION_EXAMPLES = [
    {
        icon: "☕️",
        text: "周末阳光明媚的咖啡馆，法式碎花裙，氛围感满满",
        label: "生活记录"
    },
    {
        icon: "💄",
        text: "这支口红颜色太绝了！显白不挑皮，伪素颜必备",
        label: "美妆种草"
    },
    {
        icon: "🏝️",
        text: "逃离城市计划，去海边看一场橘子味的日落",
        label: "旅行打卡"
    },
    {
        icon: "📜",
        text: "床前明月光，疑是地上霜。举头望明月，低头思故乡。",
        label: "古诗词"
    }
];

const DEFAULT_XHS_TAGS = ["#生活记录", "#OOTD", "#氛围感", "#小红书文案"];

type XhsContent = { title: string; content: string };

type GeneratorDraftStateV1 = {
    version: 1;
    workId: string | null;
    savedAt: number;
    inputText: string;
    sourceCharCount: number;
    inputUrl: string;
    generatedPrompt: string;
    imagePrompts: any[];
    selectedPromptIndex: number;
    xhsContent: XhsContent | null;
    analysisError: string;
    warningMsg: string;
    generatedImages: string[];
    displayImage: string | null;
    isLinkDialogOpen: boolean;
    isPreviewOpen: boolean;
    isImageViewerOpen: boolean;
    isPromptOpen: boolean;
    isStyleDialogOpen: boolean;
    selectedStyle: string | null;
    showStyleConfirm: boolean;
    currentWorkId: string | null;
};

const LAST_STATE_KEY = "rexi:generate:last-state-key";
const EDIT_WORK_KEY = "rexi:edit-work";

export default function GeneratorApp({
    editId,
    initialHistory,
    initialText,
    autoGenerate
}: {
    editId?: string;
    initialHistory?: any | null;
    initialText?: string;
    autoGenerate?: boolean;
}) {
    const initialDraft = useMemo<GeneratorDraftStateV1 | null>(() => {
        if (typeof window === "undefined") return null;
        if (autoGenerate && !editId) return null;

        const parseJson = (value: string | null) => {
            if (!value) return null;
            try {
                return JSON.parse(value);
            } catch {
                return null;
            }
        };

        const candidateKeys: string[] = [];
        if (editId) candidateKeys.push(`rexi:edit-state:${editId}`);
        else candidateKeys.push("rexi:draft-state");
        const lastKey = sessionStorage.getItem(LAST_STATE_KEY);
        if (lastKey && !candidateKeys.includes(lastKey)) candidateKeys.push(lastKey);

        const candidates = candidateKeys
            .map((k) => parseJson(sessionStorage.getItem(k)) as GeneratorDraftStateV1 | null)
            .filter(Boolean) as GeneratorDraftStateV1[];

        const chosenCandidates = candidates.filter((s) => (editId ? !s.workId || s.workId === editId : true));
        const chosen =
            chosenCandidates.sort((a, b) => (Number(b.savedAt) || 0) - (Number(a.savedAt) || 0))[0] || null;

        if (chosen) return chosen;

        const editWorkState = parseJson(sessionStorage.getItem(EDIT_WORK_KEY));
        if (editWorkState && editWorkState.id === editId) {
            const originalTextStr = typeof editWorkState.originalText === "string" ? editWorkState.originalText : "";
            const img = editWorkState.imageUrl ? String(editWorkState.imageUrl) : null;
            const xhsTitle = editWorkState.xhsTitle ? String(editWorkState.xhsTitle) : "";
            const xhsContent = editWorkState.xhsContent ? String(editWorkState.xhsContent) : "";
            return {
                version: 1,
                workId: String(editWorkState.id),
                savedAt: Date.now(),
                inputText: originalTextStr,
                sourceCharCount: originalTextStr.length,
                inputUrl: "",
                generatedPrompt: typeof editWorkState.generatedPrompt === "string" ? editWorkState.generatedPrompt : "",
                imagePrompts: [],
                selectedPromptIndex: 0,
                xhsContent: xhsTitle || xhsContent ? { title: xhsTitle, content: xhsContent } : null,
                analysisError: "",
                warningMsg: "",
                generatedImages: img ? [img] : [],
                displayImage: img,
                isLinkDialogOpen: false,
                isPreviewOpen: false,
                isImageViewerOpen: false,
                isPromptOpen: false,
                isStyleDialogOpen: false,
                selectedStyle: null,
                showStyleConfirm: false,
                currentWorkId: String(editWorkState.id),
            };
        }

        return null;
    }, [autoGenerate, editId]);

    const [inputText, setInputText] = useState(() => String(initialDraft?.inputText ?? initialHistory?.originalText ?? initialText ?? ""));
    const [sourceCharCount, setSourceCharCount] = useState<number>(() => {
        if (Number.isFinite(initialDraft?.sourceCharCount)) return Number(initialDraft?.sourceCharCount);
        const t = String(initialDraft?.inputText ?? initialHistory?.originalText ?? initialText ?? "");
        return t.length;
    });
    const [inputUrl, setInputUrl] = useState(() => String(initialDraft?.inputUrl ?? ""));
    const [isParsing, setIsParsing] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPrompt, setGeneratedPrompt] = useState(() => String(initialDraft?.generatedPrompt ?? initialHistory?.generatedPrompt ?? ""));
    const [imagePrompts, setImagePrompts] = useState<any[]>(() => (Array.isArray(initialDraft?.imagePrompts) ? initialDraft!.imagePrompts : []));
    const [selectedPromptIndex, setSelectedPromptIndex] = useState(() => (Number.isFinite(initialDraft?.selectedPromptIndex) ? Number(initialDraft!.selectedPromptIndex) : 0));
    const [xhsContent, setXhsContent] = useState<XhsContent | null>(() => {
        if (initialDraft?.xhsContent) return initialDraft.xhsContent;
        return initialHistory?.xhsTitle || initialHistory?.xhsContent
            ? { title: String(initialHistory?.xhsTitle || ""), content: String(initialHistory?.xhsContent || "") }
            : null;
    });
    const [analysisError, setAnalysisError] = useState(() => String(initialDraft?.analysisError ?? ""));
    const [warningMsg, setWarningMsg] = useState(() => String(initialDraft?.warningMsg ?? ""));

    const [generatedImages, setGeneratedImages] = useState<string[]>(() => {
        if (Array.isArray(initialDraft?.generatedImages)) return initialDraft!.generatedImages;
        const initialImage = initialHistory?.imageUrl ? String(initialHistory.imageUrl) : null;
        return initialImage ? [initialImage] : [];
    });

    const [displayImage, setDisplayImage] = useState<string | null>(() => {
        if (typeof initialDraft?.displayImage === "string" || initialDraft?.displayImage === null) return initialDraft.displayImage;
        return initialHistory?.imageUrl ? String(initialHistory.imageUrl) : null;
    });

    // Modals & UI State
    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(() => !!initialDraft?.isLinkDialogOpen);
    const [isPreviewOpen, setIsPreviewOpen] = useState(() => !!initialDraft?.isPreviewOpen);
    const [isImageViewerOpen, setIsImageViewerOpen] = useState(() => !!initialDraft?.isImageViewerOpen);
    const [isPromptOpen, setIsPromptOpen] = useState(() => !!initialDraft?.isPromptOpen);
    const [isStyleDialogOpen, setIsStyleDialogOpen] = useState(() => !!initialDraft?.isStyleDialogOpen);
    const [selectedStyle, setSelectedStyle] = useState<string | null>(() => (initialDraft?.selectedStyle ? String(initialDraft.selectedStyle) : null));
    const [showStyleConfirm, setShowStyleConfirm] = useState(() => !!initialDraft?.showStyleConfirm);

    // Work replacement confirmation
    const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);
    const [pendingNewWork, setPendingNewWork] = useState(false);

    // Async Task
    const [generatingTaskId, setGeneratingTaskId] = useState<string | null>(null);
    const [currentWorkId, setCurrentWorkId] = useState<string | null>(() => (initialDraft?.currentWorkId ? String(initialDraft.currentWorkId) : editId || null));

    // Poetry Mode
    const [poetryMode, setPoetryMode] = useState(false);
    const [poetryData, setPoetryData] = useState<PoetryData | null>(null);
    const [verseImages, setVerseImages] = useState<VerseImage[]>([]);
    const [isGeneratingPoetry, setIsGeneratingPoetry] = useState(false);

    // Derived
    const [previewDate, setPreviewDate] = useState("");
    useEffect(() => {
        setPreviewDate(new Date().toLocaleDateString());
    }, []);

    // --- Callbacks ---
    const handleNewImageGenerated = useCallback((url: string) => {
        setGeneratedImages(prev => {
            if (prev.includes(url)) return prev;
            return [...prev, url];
        });
        setDisplayImage(url);
    }, []);

    // 1. Recover Task State
    useEffect(() => {
        const savedTaskId = sessionStorage.getItem("rexi:generating-task-id");
        if (savedTaskId) {
            setGeneratingTaskId(savedTaskId);
            // If we are recovering a task, it implies this is the current work
            setCurrentWorkId(prev => prev || savedTaskId);
            setIsGenerating(true);
        }
    }, []);

    // 2. Poll Task Status
    useEffect(() => {
        if (!generatingTaskId) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/history/${generatingTaskId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === "COMPLETED") {
                        handleNewImageGenerated(data.imageUrl);

                        // Update URL to reflect the new edit ID so refresh keeps the latest state
                        if (generatingTaskId) {
                            const newUrl = new URL(window.location.href);
                            newUrl.searchParams.set("edit", generatingTaskId);
                            window.history.replaceState({}, "", newUrl.toString());
                        }

                        // Sync text content from server if available (important for page refreshes)
                        if (data.xhsTitle || data.xhsContent) {
                            setXhsContent({
                                title: data.xhsTitle || "",
                                content: data.xhsContent || ""
                            });
                        }

                        setGeneratingTaskId(null);
                        setIsGenerating(false);
                        sessionStorage.removeItem("rexi:generating-task-id");
                    } else if (data.status === "FAILED") {
                        setAnalysisError("生成失败，请重试");
                        setGeneratingTaskId(null);
                        setIsGenerating(false);
                        sessionStorage.removeItem("rexi:generating-task-id");
                    }
                }
            } catch (e) {
                console.error("Poll failed", e);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [generatingTaskId, handleNewImageGenerated]);

    // Style Redraw Logic
    const confirmStyleSelection = (style: string) => {
        setSelectedStyle(style);
        setShowStyleConfirm(true);
    };

    const executeStyleRedraw = () => {
        if (selectedStyle) {
            setShowStyleConfirm(false);
            setIsStyleDialogOpen(false);

            // Ensure current image is added to history before starting new generation
            if (displayImage) {
                setGeneratedImages(prev => {
                    if (prev.includes(displayImage)) return prev;
                    return [...prev, displayImage];
                });
            }

            handleOneClickGenerate(selectedStyle);
            setSelectedStyle(null);
        }
    };

    const stateRef = useRef<GeneratorDraftStateV1>({
        version: 1,
        workId: currentWorkId || editId || null,
        savedAt: Date.now(),
        inputText,
        sourceCharCount,
        inputUrl,
        generatedPrompt,
        imagePrompts,
        selectedPromptIndex,
        xhsContent,
        analysisError,
        warningMsg,
        generatedImages,
        displayImage,
        isLinkDialogOpen,
        isPreviewOpen,
        isImageViewerOpen,
        isPromptOpen,
        isStyleDialogOpen,
        selectedStyle,
        showStyleConfirm,
        currentWorkId: currentWorkId || editId || null,
    });
    stateRef.current = {
        version: 1,
        workId: currentWorkId || editId || null,
        savedAt: Date.now(),
        inputText,
        sourceCharCount,
        inputUrl,
        generatedPrompt,
        imagePrompts,
        selectedPromptIndex,
        xhsContent,
        analysisError,
        warningMsg,
        generatedImages,
        displayImage,
        isLinkDialogOpen,
        isPreviewOpen,
        isImageViewerOpen,
        isPromptOpen,
        isStyleDialogOpen,
        selectedStyle,
        showStyleConfirm,
        currentWorkId: currentWorkId || editId || null,
    };

    const saveToSession = useCallback(() => {
        const state = stateRef.current;
        const targetId = state.currentWorkId || editId;
        const key = targetId ? `rexi:edit-state:${targetId}` : "rexi:draft-state";
        try {
            const next = { ...state, workId: targetId || null, savedAt: Date.now() } satisfies GeneratorDraftStateV1;
            const isEmpty = (s: GeneratorDraftStateV1) =>
                !String(s.inputText || "").trim() &&
                !String(s.inputUrl || "").trim() &&
                !String(s.generatedPrompt || "").trim() &&
                !s.xhsContent &&
                (!Array.isArray(s.generatedImages) || s.generatedImages.length === 0) &&
                !s.displayImage;

            const existingRaw = sessionStorage.getItem(key);
            if (existingRaw) {
                try {
                    const existing = JSON.parse(existingRaw) as GeneratorDraftStateV1;
                    if (existing && !isEmpty(existing) && isEmpty(next)) {
                        sessionStorage.setItem(LAST_STATE_KEY, key);
                        return;
                    }
                } catch { }
            }

            sessionStorage.setItem(key, JSON.stringify(next));
            sessionStorage.setItem(LAST_STATE_KEY, key);
        } catch { }
    }, [editId]);

    useEffect(() => {
        const timer = setTimeout(saveToSession, 1000);
        return () => clearTimeout(timer);
    }, [
        saveToSession,
        inputText,
        sourceCharCount,
        inputUrl,
        generatedPrompt,
        imagePrompts,
        selectedPromptIndex,
        xhsContent,
        analysisError,
        warningMsg,
        generatedImages,
        displayImage,
        isLinkDialogOpen,
        isPreviewOpen,
        isImageViewerOpen,
        isPromptOpen,
        isStyleDialogOpen,
        selectedStyle,
        showStyleConfirm,
        currentWorkId,
    ]);

    useEffect(() => {
        return () => saveToSession();
    }, [saveToSession]);

    useEffect(() => {
        const onVisibilityChange = () => {
            if (document.visibilityState === "hidden") saveToSession();
        };
        window.addEventListener("pagehide", saveToSession);
        document.addEventListener("visibilitychange", onVisibilityChange);
        return () => {
            window.removeEventListener("pagehide", saveToSession);
            document.removeEventListener("visibilitychange", onVisibilityChange);
        };
    }, [saveToSession]);

    useEffect(() => {
        const onClickCapture = (event: MouseEvent) => {
            const target = event.target as HTMLElement | null;
            const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
            if (!anchor) return;
            saveToSession();
        };
        document.addEventListener("click", onClickCapture, true);
        return () => document.removeEventListener("click", onClickCapture, true);
    }, [saveToSession]);

    // Handlers
    const handleParseUrl = async () => {
        if (!inputUrl) return;
        setIsParsing(true);
        try {
            const res = await fetch("/api/parse-link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: inputUrl }),
            });
            const data = await res.json();
            if (data.text) {
                setInputText(data.text);
                setSourceCharCount(String(data.text).length);
                setIsLinkDialogOpen(false);
            }
        } catch (error: any) {
            setAnalysisError("链接解析失败，请检查链接是否有效");
        } finally {
            setIsParsing(false);
        }
    };

    const handleGenerate = async () => {
        if (!generatedPrompt) return;
        setIsGenerating(true);
        try {
            const initRes = await fetch("/api/generate/init", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: generatedPrompt,
                    originalText: inputText,
                    xhsTitle: xhsContent?.title,
                    xhsContent: xhsContent?.content
                })
            });
            const initData = await initRes.json();
            const taskId = initData.id;
            setGeneratingTaskId(taskId);
            sessionStorage.setItem("rexi:generating-task-id", taskId);

            await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    taskId,
                    prompt: generatedPrompt,
                    originalText: inputText,
                    xhsTitle: xhsContent?.title || "",
                    xhsContent: xhsContent?.content || "",
                }),
            });
        } catch (error) {
            console.error(error);
            setIsGenerating(false);
        }
    };

    // Check if there's active work (has content or generated images)
    const hasActiveWork = useMemo(() => {
        return !!(inputText.trim() || displayImage || xhsContent || generatedPrompt);
    }, [inputText, displayImage, xhsContent, generatedPrompt]);

    // Handler to start new work with confirmation
    const handleStartNewWork = useCallback(() => {
        if (hasActiveWork && (currentWorkId || editId)) {
            setShowReplaceConfirm(true);
            setPendingNewWork(true);
        } else {
            // No active work, just reset directly
            handleReset();
        }
    }, [hasActiveWork, currentWorkId, editId]);

    // Confirm replacing current work
    const confirmReplaceWork = useCallback(() => {
        // Save current work state to sessionStorage before resetting
        const targetId = currentWorkId || editId || null;
        if (targetId) {
            const savedState: GeneratorDraftStateV1 = {
                version: 1,
                workId: targetId,
                savedAt: Date.now(),
                inputText,
                sourceCharCount,
                inputUrl,
                generatedPrompt,
                imagePrompts,
                selectedPromptIndex,
                xhsContent,
                analysisError,
                warningMsg,
                generatedImages,
                displayImage,
                isLinkDialogOpen,
                isPreviewOpen,
                isImageViewerOpen,
                isPromptOpen,
                isStyleDialogOpen,
                selectedStyle,
                showStyleConfirm,
                currentWorkId,
            };
            sessionStorage.setItem(`rexi:paused-work:${targetId}`, JSON.stringify(savedState));
        }

        // Reset everything for new work
        setInputText("");
        setSourceCharCount(0);
        setInputUrl("");
        setXhsContent(null);
        setGeneratedImages([]);
        setDisplayImage(null);
        setGeneratedPrompt("");
        setImagePrompts([]);
        setCurrentWorkId(null);
        setGeneratingTaskId(null);
        sessionStorage.removeItem("rexi:generating-task-id");
        sessionStorage.removeItem("rexi:draft-state");
        sessionStorage.removeItem(LAST_STATE_KEY);
        sessionStorage.removeItem(EDIT_WORK_KEY);

        setShowReplaceConfirm(false);
        setPendingNewWork(false);

        // Navigate to clean generate page
        if (editId) {
            window.location.href = "/generate";
        }
    }, [currentWorkId, editId, inputText, sourceCharCount, inputUrl, generatedPrompt, imagePrompts, selectedPromptIndex, xhsContent, analysisError, warningMsg, generatedImages, displayImage, isLinkDialogOpen, isPreviewOpen, isImageViewerOpen, isPromptOpen, isStyleDialogOpen, selectedStyle, showStyleConfirm]);

    const handleOneClickGenerate = useCallback(async (styleOverride?: string) => {
        if (!inputText) return;
        setSourceCharCount(inputText.length);
        setIsAnalyzing(true);
        if (!styleOverride) setXhsContent(null);
        setAnalysisError("");
        // Don't clear displayImage to avoid flickering
        // setDisplayImage(null);

        try {
            // Always start a new task for each generation to preserve history
            let taskId: string | null = null;

            const initRes = await fetch("/api/generate/init", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ originalText: inputText, style: styleOverride })
            });
            const initData = await initRes.json();
            taskId = initData.id;

            // Update current work ID to the new task
            setCurrentWorkId(taskId);

            if (!taskId) throw new Error("Task ID not available");

            setGeneratingTaskId(taskId);
            sessionStorage.setItem("rexi:generating-task-id", taskId);

            const analyzeRes = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: inputText, style: styleOverride }),
            });
            const analyzeData = await analyzeRes.json();
            const prompt = analyzeData.prompt;
            setGeneratedPrompt(prompt);
            setImagePrompts(Array.isArray(analyzeData.imagePrompts) ? analyzeData.imagePrompts : []);

            const title = analyzeData.xhsTitle || "";
            const content = analyzeData.xhsContent || "";

            if (!styleOverride && (title || content)) {
                setXhsContent({ title, content });
            }

            setIsAnalyzing(false);
            setIsGenerating(true);

            await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    taskId,
                    prompt: prompt,
                    originalText: inputText,
                    xhsTitle: title,
                    xhsContent: content
                }),
            });
        } catch (e) {
            setAnalysisError("生成过程中出错，请重试");
            setIsAnalyzing(false);
            setIsGenerating(false);
        }
    }, [inputText, currentWorkId]);

    // Poetry Detection
    const detectPoetry = useCallback((text: string): boolean => {
        const trimmed = text.trim();
        // Check for classical poetry patterns
        const lines = trimmed.split(/[，。！？、\n]+/).filter(l => l.trim());
        if (lines.length < 2) return false;

        // Check character counts (5 or 7 char lines typical for classical poetry)
        const isRegularLength = lines.every(l => {
            const len = l.trim().length;
            return len === 5 || len === 7 || len <= 2; // Allow short particles
        });

        // Check for poetry keywords
        const poetryKeywords = ["诗", "词", "曲", "赋", "古", "唐", "宋", "元", "明", "清"];
        const hasPoetryHint = poetryKeywords.some(k => trimmed.includes(k));

        // Check for classical punctuation patterns
        const hasClassicalPattern = /[，。]+/.test(trimmed) && lines.length >= 2;

        return (isRegularLength && hasClassicalPattern) || hasPoetryHint;
    }, []);

    // Poetry Mode Handler
    const handlePoetryGenerate = useCallback(async () => {
        if (!inputText) return;
        setIsAnalyzing(true);
        setPoetryMode(false);
        setPoetryData(null);
        setVerseImages([]);
        setAnalysisError("");

        try {
            const res = await fetch("/api/analyze/poetry", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: inputText }),
            });
            const data = await res.json();

            if (data.isPoetry && data.poemInfo) {
                setPoetryMode(true);
                setPoetryData(data.poemInfo);
                setXhsContent({
                    title: data.xhsTitle || "",
                    content: data.xhsContent || ""
                });
                // Initialize empty verse images
                setVerseImages(data.poemInfo.verses.map((v: any) => ({
                    verseIndex: v.index,
                    imageUrl: "",
                    isGenerating: false,
                })));
            } else {
                // Not poetry, fall back to normal generation
                setPoetryMode(false);
                handleOneClickGenerate();
            }
        } catch (e) {
            setAnalysisError("诗词分析失败，请重试");
        } finally {
            setIsAnalyzing(false);
        }
    }, [inputText, handleOneClickGenerate]);

    // Generate Single Verse Image
    const handleGenerateVerseImage = useCallback(async (verseIndex: number, prompt: string) => {
        setVerseImages(prev => prev.map(v =>
            v.verseIndex === verseIndex ? { ...v, isGenerating: true } : v
        ));

        try {
            // Initialize task
            const initRes = await fetch("/api/generate/init", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    originalText: poetryData?.verses[verseIndex]?.text || "",
                    style: "Chinese Ink Wash"
                })
            });
            const initData = await initRes.json();
            const taskId = initData.id;

            // Generate image
            await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    taskId,
                    prompt,
                    originalText: poetryData?.verses[verseIndex]?.text || "",
                }),
            });

            // Poll for result
            const pollForResult = async (): Promise<string> => {
                for (let i = 0; i < 30; i++) {
                    await new Promise(r => setTimeout(r, 2000));
                    const res = await fetch(`/api/history/${taskId}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.status === "COMPLETED" && data.imageUrl) {
                            return data.imageUrl;
                        } else if (data.status === "FAILED") {
                            throw new Error("Generation failed");
                        }
                    }
                }
                throw new Error("Timeout");
            };

            const imageUrl = await pollForResult();
            setVerseImages(prev => prev.map(v =>
                v.verseIndex === verseIndex
                    ? { ...v, imageUrl, isGenerating: false }
                    : v
            ));
        } catch (e) {
            setVerseImages(prev => prev.map(v =>
                v.verseIndex === verseIndex ? { ...v, isGenerating: false } : v
            ));
            setAnalysisError(`第${verseIndex + 1}句图片生成失败`);
        }
    }, [poetryData]);

    // Generate All Verses
    const handleGenerateAllVerses = useCallback(async () => {
        if (!poetryData) return;
        setIsGeneratingPoetry(true);

        // Generate images sequentially to avoid rate limits
        for (const verse of poetryData.verses) {
            await handleGenerateVerseImage(verse.index, verse.imagePrompt);
        }

        setIsGeneratingPoetry(false);
    }, [poetryData, handleGenerateVerseImage]);

    // Smart Generate: Detect poetry or use normal flow
    const handleSmartGenerate = useCallback(() => {
        if (detectPoetry(inputText)) {
            handlePoetryGenerate();
        } else {
            setPoetryMode(false);
            handleOneClickGenerate();
        }
    }, [inputText, detectPoetry, handlePoetryGenerate, handleOneClickGenerate]);

    // Auto-generate Effect
    const autoGenerateTriggeredRef = useRef(false);
    useEffect(() => {
        if (!autoGenerate || editId || autoGenerateTriggeredRef.current || !inputText) return;
        autoGenerateTriggeredRef.current = true;
        setTimeout(() => handleSmartGenerate(), 500);
    }, [autoGenerate, editId, inputText, handleSmartGenerate]);

    const handleReset = () => {
        const targetId = currentWorkId || editId || null;
        setInputText("");
        setSourceCharCount(0);
        setInputUrl("");
        setXhsContent(null);
        setGeneratedImages([]);
        setDisplayImage(null);
        setGeneratingTaskId(null);
        sessionStorage.removeItem("rexi:generating-task-id");
        sessionStorage.removeItem("rexi:draft-state");
        sessionStorage.removeItem(LAST_STATE_KEY);
        sessionStorage.removeItem(EDIT_WORK_KEY);
        if (targetId) sessionStorage.removeItem(`rexi:edit-state:${targetId}`);
        if (editId) window.location.href = "/generate";
    };

    const handleDownload = useCallback(() => {
        if (!displayImage) return;
        const link = document.createElement("a");
        link.href = displayImage;
        link.download = `rexi-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [displayImage]);

    const handleCopyXhs = useCallback(async () => {
        if (!xhsContent) return;
        const text = xhsContent.title ? `${xhsContent.title}\n\n${xhsContent.content}` : xhsContent.content;
        await navigator.clipboard.writeText(text);
    }, [xhsContent]);


    const handleUpdateText = useCallback((newContent: string) => {
        let title = "";
        let content = newContent;

        // Simple parser to extract H1 title
        const match = newContent.match(/^#\s+(.*?)(\n|$)/);
        if (match) {
            title = match[1].trim();
            content = newContent.slice(match[0].length).trim();
        }

        setXhsContent({ title, content });
    }, []);

    const lastSyncedTextRef = useRef<string>("");
    useEffect(() => {
        const id = currentWorkId || editId;
        if (!id || !xhsContent) return;

        const payload = JSON.stringify({ xhsTitle: xhsContent.title, xhsContent: xhsContent.content });
        if (payload === lastSyncedTextRef.current) return;

        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/history/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: payload,
                });
                if (res.ok) lastSyncedTextRef.current = payload;
            } catch { }
        }, 1200);

        return () => clearTimeout(timer);
    }, [currentWorkId, editId, xhsContent]);

    // --- UI Render ---
    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10 selection:text-primary">
            {/* Top Spacer for Fixed Nav */}
            <div className="h-16 hidden md:block" />
            <div className="h-14 md:hidden" />

            <main className="pb-24 md:pb-4 px-4 md:px-6 lg:px-8 max-w-[1920px] mx-auto min-h-[calc(100vh-5rem)] lg:h-[calc(100vh-4rem)] lg:overflow-hidden flex flex-col lg:flex-row gap-4 md:gap-6">

                {/* Left Column: Creator Studio */}
                <section className="w-full lg:w-[420px] xl:w-[480px] flex flex-col gap-4 flex-shrink-0 h-full">
                    <div className="bg-white rounded-[24px] border border-stone-100 shadow-sm p-6 flex flex-col gap-6 h-full relative overflow-hidden group">
                        {/* Decorative Gradient */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/80 to-orange-400/80 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        {/* Input Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                <h2 className="text-lg font-bold text-stone-900">创意工坊</h2>
                            </div>
                            <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-xs text-stone-500 bg-stone-50 hover:bg-stone-100 rounded-full h-8 px-3">
                                        <LinkIcon className="w-3.5 h-3.5 mr-1.5" />
                                        解析链接
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md rounded-2xl p-6">
                                    <DialogHeader>
                                        <DialogTitle>链接解析</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 pt-4">
                                        <Input
                                            placeholder="粘贴小红书/公众号链接..."
                                            value={inputUrl}
                                            onChange={(e) => setInputUrl(e.target.value)}
                                            className="h-12 rounded-xl"
                                        />
                                        <Button onClick={handleParseUrl} disabled={!inputUrl || isParsing} className="w-full h-12 rounded-xl">
                                            {isParsing ? <Loader2 className="animate-spin" /> : "开始解析"}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Text Input */}
                        <div className="relative flex-1 min-h-[200px] group/input">
                            <Textarea
                                placeholder="描述你的灵感，例如：
周末在阳光明媚的咖啡馆喝拿铁，穿着法式碎花裙，氛围感满满..."
                                className="w-full h-full resize-none p-4 text-base leading-relaxed border-stone-200 bg-stone-50/50 focus:bg-white focus:ring-1 focus:ring-primary/20 rounded-xl transition-all rexi-scrollbar"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                            />
                            <div className="absolute bottom-3 right-3 text-xs text-stone-400 font-medium px-2 py-1 bg-white/80 backdrop-blur rounded-md border border-stone-100">
                                {inputText.length} 字
                            </div>
                        </div>

                        {/* Quick Actions / Inspiration */}
                        {!inputText && (
                            <div className="grid gap-2">
                                {INSPIRATION_EXAMPLES.map((item, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setInputText(item.text)}
                                        className="text-left p-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-transparent hover:border-stone-200 transition-all flex items-center gap-3 group/item"
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                        <div className="min-w-0">
                                            <div className="text-xs font-bold text-stone-900 mb-0.5">{item.label}</div>
                                            <div className="text-xs text-stone-500 truncate group-hover/item:text-stone-700">{item.text}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Generate Button */}
                        <Button
                            onClick={() => handleSmartGenerate()}
                            disabled={!inputText || isAnalyzing || isGenerating}
                            className="h-14 rounded-xl text-lg font-bold shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden"
                        >
                            {(isAnalyzing || isGenerating) ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>{isAnalyzing ? "正在构思..." : "正在绘制..."}</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Wand2 className="w-5 h-5 fill-current" />
                                    <span>一键生成笔记</span>
                                </div>
                            )}
                        </Button>

                        {/* Status Messages */}
                        {(analysisError || warningMsg) && (
                            <div className={cn(
                                "p-3 rounded-lg text-sm font-medium flex items-center gap-2",
                                analysisError ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                            )}>
                                {analysisError ? "⚠️" : "💡"}
                                <span>{analysisError || warningMsg}</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* Right Column: Preview Stage (Full Pane) */}
                <section className="w-full lg:flex-1 bg-white rounded-2xl lg:rounded-[28px] border border-stone-200 relative flex flex-col responsive-container smooth-scale min-w-0 overflow-hidden">

                    {/* Header */}
                    <div className="h-16 border-b border-stone-100 flex items-center justify-between px-6 bg-white/80 backdrop-blur sticky top-0 z-30">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold shadow-md shadow-primary/20">
                                R
                            </div>
                            <span className="text-sm font-bold text-stone-900">Rexi Creator</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => setIsPromptOpen(true)} disabled={!generatedPrompt} className="rounded-full hover:bg-stone-100 text-stone-500" title="查看提示词">
                                <Sparkles className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setIsPreviewOpen(true)} disabled={!xhsContent} className="rounded-full hover:bg-stone-100 text-stone-500" title="编辑文案">
                                <FileText className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handleDownload} disabled={!displayImage} className="rounded-full hover:bg-stone-100 text-stone-500" title="下载图片">
                                <Download className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Poetry Mode or Normal Mode */}
                    {poetryMode && poetryData ? (
                        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                            <PoetryMultiImagePreview
                                poetryData={poetryData}
                                verseImages={verseImages}
                                onGenerateVerse={handleGenerateVerseImage}
                                onGenerateAll={handleGenerateAllVerses}
                                isGeneratingAll={isGeneratingPoetry}
                            />
                        </div>
                    ) : (
                        <>
                            {/* Image Area with Carousel */}
                            <div className="relative w-full flex-shrink-0 min-h-[200px]" style={{ height: 'clamp(200px, 50cqh, 600px)' }}>
                                <div className="w-[92%] mx-auto h-full preview-content transition-all duration-300">
                                    <div className="relative w-full h-full bg-stone-50 group cursor-pointer smooth-scale flex items-center justify-center overflow-hidden rounded-2xl border border-stone-100" onClick={() => displayImage && setIsImageViewerOpen(true)}>
                                        {displayImage ? (
                                            <>
                                                <Image
                                                    src={displayImage}
                                                    alt="Generated"
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                    unoptimized={displayImage.startsWith("data:")}
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                                                {/* Carousel Navigation - Left Arrow */}
                                                {generatedImages.length > 1 && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const currentIdx = generatedImages.indexOf(displayImage);
                                                            const prevIdx = currentIdx <= 0 ? generatedImages.length - 1 : currentIdx - 1;
                                                            setDisplayImage(generatedImages[prevIdx]);
                                                        }}
                                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60 hover:scale-110"
                                                    >
                                                        <ChevronLeft className="w-5 h-5" />
                                                    </button>
                                                )}

                                                {/* Carousel Navigation - Right Arrow */}
                                                {generatedImages.length > 1 && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const currentIdx = generatedImages.indexOf(displayImage);
                                                            const nextIdx = currentIdx >= generatedImages.length - 1 ? 0 : currentIdx + 1;
                                                            setDisplayImage(generatedImages[nextIdx]);
                                                        }}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60 hover:scale-110"
                                                    >
                                                        <ChevronRight className="w-5 h-5" />
                                                    </button>
                                                )}

                                                {/* Carousel Indicators */}
                                                {generatedImages.length > 1 && (
                                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur">
                                                        {generatedImages.map((img, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setDisplayImage(img);
                                                                }}
                                                                className={cn(
                                                                    "w-2 h-2 rounded-full transition-all",
                                                                    displayImage === img
                                                                        ? "bg-white scale-125"
                                                                        : "bg-white/50 hover:bg-white/80"
                                                                )}
                                                            />
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Image Counter Badge */}
                                                {generatedImages.length > 1 && (
                                                    <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur text-white text-xs font-medium">
                                                        {generatedImages.indexOf(displayImage) + 1} / {generatedImages.length}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-300 gap-4">
                                                {isGenerating ? (
                                                    <>
                                                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                                                        <span className="text-sm font-medium text-stone-400 tracking-wide animate-pulse">AI 正在绘制...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ImageIcon className="w-16 h-16 text-stone-200" />
                                                        <span className="text-sm font-medium text-stone-400">预览区域</span>
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        {/* Floating Actions */}
                                        {displayImage && (
                                            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                                <Button size="icon" className="h-9 w-9 rounded-full bg-black/40 backdrop-blur text-white border-none hover:bg-black/60" onClick={(e) => { e.stopPropagation(); setIsStyleDialogOpen(true); }}>
                                                    <Palette className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" className="h-9 w-9 rounded-full bg-black/40 backdrop-blur text-white border-none hover:bg-black/60" onClick={(e) => { e.stopPropagation(); setIsImageViewerOpen(true); }}>
                                                    <Maximize2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Text Content - Scrollable & Responsive */}
                            <div className="flex-1 overflow-y-auto rexi-scrollbar">
                                <div className="w-[92%] mx-auto transition-all duration-300">
                                    <div className="p-4 md:p-6 space-y-4 text-content pb-24">
                                        {xhsContent?.title ? (
                                            <h1 className="text-lg sm:text-xl font-bold text-stone-900 leading-snug tracking-tight">{xhsContent.title}</h1>
                                        ) : (
                                            <div className="h-6 sm:h-7 bg-stone-100 rounded-md w-3/4 animate-pulse" />
                                        )}

                                        {xhsContent?.content ? (
                                            <div className="text-sm sm:text-[15px] text-stone-800 leading-[1.7] whitespace-pre-wrap font-normal">
                                                {xhsContent.content}
                                            </div>
                                        ) : (
                                            <div className="space-y-2.5">
                                                <div className="h-4 bg-stone-50 rounded w-full animate-pulse" />
                                                <div className="h-4 bg-stone-50 rounded w-full animate-pulse" />
                                                <div className="h-4 bg-stone-50 rounded w-2/3 animate-pulse" />
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-2">
                                            {DEFAULT_XHS_TAGS.map(tag => (
                                                <span key={tag} className="text-[#13386c] text-sm font-medium">#{tag.replace('#', '')}</span>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between pt-2 pb-4 border-b border-stone-100">
                                            <div className="text-xs text-stone-400">{previewDate} · 上海</div>
                                            <Button variant="ghost" size="sm" className="h-7 px-3 rounded-full bg-stone-100 text-stone-600 text-xs font-medium hover:bg-stone-200">
                                                不感兴趣
                                            </Button>
                                        </div>

                                        {/* Comments Preview */}
                                        <div className="space-y-4 pt-2">
                                            <div className="text-sm font-medium text-stone-900">共 10 条评论</div>
                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 rounded-full bg-stone-200 shrink-0" />
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-medium text-stone-500">Momo</span>
                                                    </div>
                                                    <p className="text-[13px] text-stone-800">求原图！太好看了吧 😍</p>
                                                </div>
                                                <div className="flex flex-col items-center gap-0.5">
                                                    <span className="text-stone-400 text-xs">♡</span>
                                                    <span className="text-[10px] text-stone-400">12</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Action Bar - Simplified */}
                            <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl border border-stone-200/50 shadow-xl rounded-full p-1.5 flex items-center gap-2 z-30 smooth-scale transition-all duration-300">
                                <Button variant="ghost" size="icon" onClick={() => setIsStyleDialogOpen(true)} className="w-9 h-9 rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-900" title="更换风格">
                                    <Palette className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={handleDownload} disabled={!displayImage} className="w-9 h-9 rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-900" title="下载图片">
                                    <Download className="w-4 h-4" />
                                </Button>
                                <div className="w-px h-6 bg-stone-200" />
                                <Button onClick={handleCopyXhs} disabled={!xhsContent} className="rounded-full bg-stone-900 hover:bg-stone-800 text-white shadow-md h-9 text-xs px-4 whitespace-nowrap">
                                    <Copy className="w-3.5 h-3.5 mr-1.5" /> 复制文案
                                </Button>
                            </div>
                        </>
                    )}
                </section>

            </main>

            {/* --- Modals --- */}

            {/* Markdown Preview */}
            <MarkdownPreviewModal
                isOpen={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
                initialContent={xhsContent ? (xhsContent.title ? `# ${xhsContent.title}\n\n${xhsContent.content}` : xhsContent.content) : ""}
                originalText={inputText}
                onSave={handleUpdateText}
                onAutoSave={handleUpdateText}
            />

            {/* Full Screen Image */}
            <Dialog open={isImageViewerOpen} onOpenChange={setIsImageViewerOpen}>
                <DialogContent className="max-w-screen-xl w-fit h-fit p-0 bg-transparent border-none shadow-none focus:outline-none overflow-visible">
                    <div className="relative flex flex-col items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute -top-12 right-0 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                            onClick={() => setIsImageViewerOpen(false)}
                        >
                            <X className="w-6 h-6" />
                        </Button>

                        {displayImage && (
                            <div className="relative rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black/50 backdrop-blur-sm">
                                <img
                                    src={displayImage}
                                    alt="Full View"
                                    className="max-h-[85vh] max-w-[90vw] w-auto h-auto object-contain block"
                                />
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 hover:opacity-100 transition-opacity duration-300">
                                    <Button size="sm" variant="secondary" className="h-9 px-4 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur border border-white/10 shadow-lg" onClick={handleDownload}>
                                        <Download className="w-4 h-4 mr-2" /> 保存原图
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Prompt Dialog */}
            <Dialog open={isPromptOpen} onOpenChange={setIsPromptOpen}>
                <DialogContent className="sm:max-w-lg rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle>AI 绘画提示词</DialogTitle>
                    </DialogHeader>
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 text-sm font-mono text-stone-600 max-h-[300px] overflow-y-auto">
                        {generatedPrompt || "暂无提示词"}
                    </div>
                    <DialogFooter>
                        <Button onClick={() => { setIsPromptOpen(false); handleGenerate(); }} disabled={!generatedPrompt || isGenerating}>
                            <RefreshCw className="w-4 h-4 mr-2" /> 使用此方案重绘
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Style Dialog */}
            <Dialog open={isStyleDialogOpen} onOpenChange={setIsStyleDialogOpen}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 rounded-2xl overflow-hidden">
                    <DialogHeader className="p-6 pb-2 border-b border-stone-100">
                        <DialogTitle>选择艺术风格</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 gap-8">
                        {ART_STYLES.map((cat) => (
                            <div key={cat.category}>
                                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">{cat.category}</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {cat.styles.map(style => (
                                        <button
                                            key={style}
                                            onClick={() => confirmStyleSelection(style)}
                                            className="p-3 rounded-xl bg-stone-50 border border-stone-100 hover:border-primary/50 hover:bg-white hover:shadow-md transition-all text-center"
                                        >
                                            <div className="text-sm font-medium text-stone-800">{style.split(' ')[0]}</div>
                                            <div className="text-[10px] text-stone-400 mt-1">{style.split('(')[1]?.replace(')', '')}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Confirm Style */}
            <Dialog open={showStyleConfirm} onOpenChange={setShowStyleConfirm}>
                <DialogContent className="sm:max-w-sm rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle>确认重绘</DialogTitle>
                        <DialogDescription>
                            使用风格 <strong>{selectedStyle}</strong> 重新绘制图片？文案将保持不变。
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowStyleConfirm(false)}>取消</Button>
                        <Button onClick={executeStyleRedraw}>确认</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Replace Work Confirmation Dialog */}
            <Dialog open={showReplaceConfirm} onOpenChange={setShowReplaceConfirm}>
                <DialogContent className="sm:max-w-md rounded-2xl p-6">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                            </div>
                            <DialogTitle className="text-lg">正在编辑作品</DialogTitle>
                        </div>
                        <DialogDescription className="text-stone-600">
                            您当前正在编辑一个作品。开始新的创作将会暂停当前工作。
                            <br />
                            <span className="text-stone-500 text-sm">当前工作进度会被自动保存，您可以稍后在「作品」页面继续编辑。</span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => { setShowReplaceConfirm(false); setPendingNewWork(false); }}>
                            继续当前作品
                        </Button>
                        <Button onClick={confirmReplaceWork} className="bg-primary hover:bg-primary/90">
                            开始新创作
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
