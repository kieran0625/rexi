import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export type SyncOperation = 
  | { type: "ADD"; data: any }
  | { type: "DELETE"; data: { id: string; version?: number } };

interface SyncResult {
  success: boolean;
  results?: any[];
  error?: string;
}

interface UseDataSyncOptions {
  onSuccess?: (results: any[]) => void;
  onError?: (error: string) => void;
  onRetry?: (attempt: number) => void;
}

export function useDataSync(options: UseDataSyncOptions = {}) {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const logSync = (action: string, details: any) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      component: "useDataSync",
      action,
      ...details
    }));
  };

  const sync = useCallback(async (operations: SyncOperation[]) => {
    setIsSyncing(true);
    let attempt = 0;
    const maxRetries = 3;

    logSync("SYNC_START", { operations });

    while (attempt <= maxRetries) {
      try {
        const response = await fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ operations }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Sync failed on server");
        }

        logSync("SYNC_SUCCESS", { results: result.results });
        
        toast({
          title: "同步成功",
          description: `成功处理 ${operations.length} 条数据变更`,
          variant: "default", // Success usually is default or we can customize
        });

        if (options.onSuccess) {
          options.onSuccess(result.results);
        }

        setIsSyncing(false);
        return { success: true, results: result.results };

      } catch (error: any) {
        logSync("SYNC_ERROR", { attempt, error: error.message });

        if (attempt < maxRetries) {
          attempt++;
          if (options.onRetry) options.onRetry(attempt);
          
          toast({
            title: "同步失败，正在重试...",
            description: `第 ${attempt}/${maxRetries} 次重试`,
            variant: "destructive",
          });
          
          // Exponential backoff: 1s, 2s, 4s
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
        } else {
          logSync("SYNC_FAILED_FINAL", { error: error.message });
          
          toast({
            title: "同步失败",
            description: "网络异常或服务器错误，请稍后重试",
            variant: "destructive",
          });

          if (options.onError) {
            options.onError(error.message);
          }
          
          setIsSyncing(false);
          return { success: false, error: error.message };
        }
      }
    }
    
    return { success: false, error: "Unexpected loop exit" };
  }, [toast, options]);

  return { sync, isSyncing };
}
