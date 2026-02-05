"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-6">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full">
                <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400" />
            </div>

            <div className="space-y-2 max-w-md">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    出了一点小问题
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                    抱歉，加载此页面时发生了错误。请尝试刷新或返回首页。
                </p>
                <div className="text-xs text-gray-400 font-mono mt-4 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                    {error.message || "Unknown error occurred"}
                </div>
            </div>

            <div className="flex gap-4">
                <Button
                    onClick={reset}
                    variant="default"
                    className="gap-2"
                >
                    <RotateCcw className="w-4 h-4" />
                    重试
                </Button>
                <Button
                    variant="outline"
                    asChild
                    className="gap-2"
                >
                    <Link href="/">
                        <Home className="w-4 h-4" />
                        返回首页
                    </Link>
                </Button>
            </div>
        </div>
    );
}
