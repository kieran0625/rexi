import { renderHook, act } from "@testing-library/react";
import { useDataSync } from "./use-data-sync";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock toast
const mockToast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe("useDataSync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("should sync successfully (Normal Flow)", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, results: [{ id: "1", status: "success" }] }),
    });

    const onSuccess = vi.fn();
    const { result } = renderHook(() => useDataSync({ onSuccess }));

    await act(async () => {
      const res = await result.current.sync([{ type: "ADD", data: { foo: "bar" } }]);
      expect(res.success).toBe(true);
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: "同步成功" }));
    expect(onSuccess).toHaveBeenCalled();
  });

  it("should retry on failure and eventually fail (Exception Flow)", async () => {
    (global.fetch as any).mockRejectedValue(new Error("Network Error"));

    const onError = vi.fn();
    const onRetry = vi.fn();
    const { result } = renderHook(() => useDataSync({ onError, onRetry }));

    await act(async () => {
      const res = await result.current.sync([{ type: "DELETE", data: { id: "1" } }]);
      expect(res.success).toBe(false);
    });

    // Initial + 3 retries = 4 calls
    expect(global.fetch).toHaveBeenCalledTimes(4);
    expect(onRetry).toHaveBeenCalledTimes(3);
    expect(onError).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: "同步失败" }));
  });

  it("should handle server error response (Boundary Condition)", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ success: false, error: "Server Internal Error" }),
    });

    const { result } = renderHook(() => useDataSync());

    await act(async () => {
      const res = await result.current.sync([{ type: "ADD", data: {} }]);
      expect(res.success).toBe(false);
    });

    // Should retry 3 times for 500 errors too based on current logic (throw inside hook)
    expect(global.fetch).toHaveBeenCalledTimes(4);
  });
});
