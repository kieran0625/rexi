"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Copy, Download, Loader2, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

type HistoryItem = {
  id: string;
  originalText: string;
  generatedPrompt: string;
  xhsTitle?: string | null;
  xhsContent?: string | null;
  imageUrl?: string | null;
  style?: string | null;
  status?: string; // PENDING, PROCESSING, COMPLETED, FAILED
  createdAt: string;
};

type HistoryResponse = {
  items: HistoryItem[];
  totalCount: number;
};

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("zh-CN", { hour12: false });
}

const ITEMS_PER_PAGE = 6;

export default function WorksApp() {
  const router = useRouter();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<HistoryItem | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const fetchPage = useCallback(async (page: number) => {
    const params = new URLSearchParams();
    params.set("take", ITEMS_PER_PAGE.toString());
    params.set("skip", ((page - 1) * ITEMS_PER_PAGE).toString());
    const res = await fetch(`/api/history?${params.toString()}`);
    if (!res.ok) throw new Error("加载失败，请重试");
    return (await res.json()) as HistoryResponse;
  }, []);

  const loadData = useCallback(async (page: number) => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchPage(page);
      setItems(data.items);
      setTotalCount(data.totalCount);
      setCurrentPage(page);
    } catch (e: any) {
      setError(e?.message || "加载失败，请重试");
    } finally {
      setLoading(false);
    }
  }, [fetchPage]);

  useEffect(() => {
    loadData(1);
  }, [loadData]);

  const handleClearAll = () => {
    setShowClearDialog(true);
  };

  const performClearAll = async () => {
    setClearing(true);
    setError("");
    try {
      const res = await fetch("/api/history", { method: "DELETE" });
      if (!res.ok) throw new Error("清空失败，请重试");
      setItems([]);
      setTotalCount(0);
      setCurrentPage(1);
      setSelected(null);
      setShowClearDialog(false);
    } catch (e: any) {
      setError(e?.message || "清空失败，请重试");
    } finally {
      setClearing(false);
    }
  };

  const handleDeleteOne = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setItemToDelete(id);
  };

  const performDeleteOne = async () => {
    if (!itemToDelete) return;
    const id = itemToDelete;

    setDeletingId(id);
    setError("");
    try {
      const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("删除失败，请重试");
      setSelected((prev) => (prev?.id === id ? null : prev));
      setItemToDelete(null);
      // Re-fetch current page to handle pagination correctly
      loadData(currentPage);
    } catch (e: any) {
      const msg = e?.message || "删除失败，请重试";
      setError(msg);
      alert(msg); // Ensure user sees the error
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (item: HistoryItem) => {
    try {
      setEditingId(item.id);
      sessionStorage.setItem(
        "rexi:edit-work",
        JSON.stringify({
          id: item.id,
          originalText: item.originalText,
          generatedPrompt: item.generatedPrompt,
          xhsTitle: item.xhsTitle ?? null,
          xhsContent: item.xhsContent ?? null,
          imageUrl: item.imageUrl ?? null,
          style: item.style ?? null,
          createdAt: item.createdAt,
        })
      );
    } catch {
    } finally {
      router.push(`/generate?edit=${encodeURIComponent(item.id)}`);
    }
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      setError("复制失败，请检查浏览器权限");
    }
  };

  const downloadImage = (url?: string | null) => {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `rexi-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-full pt-20 md:pt-24 pb-24 md:pb-8 px-4 md:px-8 bg-zinc-50">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">我的作品</h1>
            <p className="text-sm text-zinc-500">集中管理你的历史创作内容，支持查看、复制提示词与删除。</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="bg-white" onClick={() => loadData(currentPage)} disabled={loading || clearing}>
              刷新
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearAll}
              disabled={loading || clearing}
              className="shadow-sm"
            >
              {clearing ? <Loader2 className="h-4 w-4 animate-spin" /> : "清空"}
            </Button>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-video bg-zinc-100 animate-pulse" />
                <CardContent className="p-4 space-y-2">
                  <div className="h-4 w-2/3 bg-zinc-100 rounded animate-pulse" />
                  <div className="h-3 w-full bg-zinc-100 rounded animate-pulse" />
                  <div className="h-3 w-5/6 bg-zinc-100 rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-10 text-center">
            <div className="text-base font-semibold text-zinc-900">还没有作品</div>
            <div className="mt-1 text-sm text-zinc-500">去“生成页面”创建你的第一个作品吧。</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className="group overflow-hidden border-zinc-200 bg-white hover:shadow-md transition-shadow"
                >
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => setSelected(item)}
                  >
                    <div className="relative aspect-video bg-zinc-100">
                      {(item.status === "PENDING" || item.status === "PROCESSING") && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10">
                          <Loader2 className="w-8 h-8 text-xhs-red animate-spin mb-2" />
                          <span className="text-xs font-medium text-gray-500">正在创作中...</span>
                        </div>
                      )}
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt="作品图片"
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                          unoptimized={item.imageUrl.startsWith("data:")}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-sm text-zinc-400">
                          {item.status === "FAILED" ? "生成失败" : "无图片"}
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs text-zinc-500">{formatDate(item.createdAt)}</div>
                        {item.style ? (
                          <div className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">{item.style}</div>
                        ) : null}
                      </div>
                      <div className="text-sm font-semibold text-zinc-900 truncate">
                        {item.originalText || "(empty)"}
                      </div>
                      <div className="text-xs text-zinc-500 leading-4 max-h-8 overflow-hidden">
                        {item.generatedPrompt || "暂无提示词"}
                      </div>
                    </CardContent>
                  </button>
                  <div className="px-4 pb-4 flex items-center gap-2">
                    <Button
                      size="sm"
                      className="h-8"
                      onClick={() => handleEdit(item)}
                      disabled={editingId === item.id}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      编辑
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-zinc-500 hover:bg-zinc-100"
                      onClick={() => downloadImage(item.imageUrl)}
                      disabled={!item.imageUrl}
                      aria-label="下载"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-zinc-500 hover:bg-red-50 hover:text-red-600 px-2"
                      onClick={(e) => handleDeleteOne(item.id, e)}
                      disabled={deletingId === item.id}
                      type="button"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      删除
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 py-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => loadData(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  // Show current page, first, last, and pages around current
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        className={cn("h-9 w-9 p-0", currentPage === pageNum ? "shadow-sm" : "bg-white")}
                        onClick={() => loadData(pageNum)}
                        disabled={loading}
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                  // Show ellipsis
                  if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return <span key={pageNum} className="text-zinc-400">...</span>;
                  }
                  return null;
                })}

                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => loadData(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="sm:max-w-5xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-4">
              <span className="truncate">作品详情</span>
            </DialogTitle>
          </DialogHeader>
          {selected ? (
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] gap-4 h-[70vh] min-h-0">
              <div className="flex flex-col gap-3 min-h-0 overflow-y-auto pr-1">
                <Card className="overflow-hidden shrink-0">
                  <div className="aspect-video bg-zinc-100 relative">
                    {selected.imageUrl ? (
                      <Image
                        src={selected.imageUrl}
                        alt="作品图片"
                        fill
                        sizes="(min-width: 1024px) 60vw, 100vw"
                        className="object-cover"
                        unoptimized={selected.imageUrl.startsWith("data:")}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-sm text-zinc-400">无图片</div>
                    )}
                  </div>
                </Card>

                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">生成文案</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="w-full rounded-xl border border-zinc-200/60 bg-zinc-50/80 p-5">
                      {selected.xhsTitle ? (
                        <div className="text-base font-bold text-primary whitespace-pre-wrap break-words leading-relaxed tracking-tight">
                          {selected.xhsTitle}
                        </div>
                      ) : null}
                      {selected.xhsContent ? (
                        <div className={cn(selected.xhsTitle ? "mt-3" : "", "text-sm text-zinc-700 whitespace-pre-wrap break-words leading-relaxed")}>
                          {selected.xhsContent}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <div className="text-sm text-zinc-400 max-w-[240px]">
                            当前历史记录未包含生成文案（旧版本作品）。新生成的作品会自动保存并在这里完整展示。
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col gap-3 min-h-0 overflow-y-auto pr-1">
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">原始输入</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-sm text-zinc-700 whitespace-pre-wrap break-words bg-zinc-50/80 p-4 rounded-xl border border-zinc-200/60">
                      {selected.originalText}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">生成提示词</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className={cn("text-sm text-zinc-700 whitespace-pre-wrap break-words font-mono bg-zinc-50/80 p-4 rounded-xl border border-zinc-200/60")}>
                      {selected.generatedPrompt}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button size="sm" onClick={() => handleEdit(selected)} disabled={editingId === selected.id}>
                        <Pencil className="h-4 w-4 mr-2" />
                        编辑
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white"
                        onClick={() => copyText([selected.xhsTitle, selected.xhsContent].filter(Boolean).join("\n\n"))}
                        disabled={!selected.xhsTitle && !selected.xhsContent}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        复制文案
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white"
                        onClick={() => downloadImage(selected.imageUrl)}
                        disabled={!selected.imageUrl}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        下载图片
                      </Button>
                      <Button size="sm" variant="destructive" onClick={(e) => handleDeleteOne(selected.id, e)} disabled={deletingId === selected.id} type="button">
                        {deletingId === selected.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        删除
                      </Button>
                    </div>
                    <div className="mt-2 text-xs text-zinc-500">{formatDate(selected.createdAt)}</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Clear All Confirmation Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认清空所有作品？</DialogTitle>
            <DialogDescription>
              此操作将永久删除所有历史生成记录，无法恢复。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearDialog(false)}>取消</Button>
            <Button variant="destructive" onClick={performClearAll} disabled={clearing}>
              {clearing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              确认清空
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete One Confirmation Dialog */}
      <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除此作品？</DialogTitle>
            <DialogDescription>
              删除后无法恢复。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemToDelete(null)}>取消</Button>
            <Button variant="destructive" onClick={performDeleteOne} disabled={!!deletingId}>
              {deletingId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
