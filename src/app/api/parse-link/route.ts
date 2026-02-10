import { NextResponse } from "next/server";
import { chooseBestModelId, generateContentText, listModelsAnyVersion } from "@/lib/gemini";

function normalizeUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const withScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    return null;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  return parsed.toString();
}

function detectBlockedContent(fullText: string, markdown: string) {
  const verifyMatch = markdown.match(/\[去验证\]\((https?:\/\/[^\s)]+)\)/);
  const actionUrl = verifyMatch?.[1];

  const wechatCaptchaSignals = [
    "环境异常",
    "CAPTCHA",
    "完成验证后即可继续访问",
  ];
  const wechatRateLimitSignals = [
    "访问过于频繁",
  ];

  const hasWechatCaptchaSignal =
    wechatCaptchaSignals.some((s) => markdown.includes(s)) ||
    fullText.toLowerCase().includes("requiring captcha");

  if (hasWechatCaptchaSignal) {
    return {
      status: 429,
      code: "WECHAT_CAPTCHA",
      error: "微信公众号触发环境验证（CAPTCHA），暂时无法自动获取内容。请稍后再试，或在浏览器打开链接完成验证后手动复制文章内容。",
      actionUrl,
    };
  }

  if (wechatRateLimitSignals.some((s) => markdown.includes(s))) {
    return {
      status: 429,
      code: "WECHAT_RATE_LIMIT",
      error: "微信公众号访问过于频繁被限制，暂时无法自动获取内容。请稍后再试或手动复制文章内容。",
      actionUrl,
    };
  }

  if (markdown.includes("Parameter error")) {
    return {
      status: 400,
      code: "SOURCE_PARAMETER_ERROR",
      error: "来源链接参数错误或已失效，请检查链接是否完整，或手动复制文章内容。",
      actionUrl,
    };
  }

  if (fullText.includes("Title: Weixin Official Accounts Platform")) {
    return {
      status: 429,
      code: "WECHAT_PLATFORM_BLOCKED",
      error: "微信公众号平台暂时拒绝获取内容，可能需要验证或权限。请稍后再试或手动复制文章内容。",
      actionUrl,
    };
  }

  return null;
}

function extractMarkdownContent(text: string) {
  const marker = "Markdown Content:";
  const idx = text.indexOf(marker);
  if (idx === -1) return text;

  let after = text.slice(idx + marker.length);
  const endMarkers = ["\nImages:\n", "\nLinks/Buttons:\n", "\nLinks:\n"];
  const endIdx = endMarkers
    .map((m) => after.indexOf(m))
    .filter((i) => i >= 0)
    .sort((a, b) => a - b)[0];
  if (typeof endIdx === "number" && endIdx >= 0) after = after.slice(0, endIdx);
  return after;
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const rawUrl = String(url || "");
    if (!rawUrl.trim()) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    const normalizedUrl = normalizeUrl(rawUrl);
    if (!normalizedUrl) {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    // 使用 Jina Reader 解析文章（支持微信公众号转 Markdown）
    console.log("Parsing with Jina Reader...");
    const jinaUrl = `https://r.jina.ai/${normalizedUrl}`;
    const controller = new AbortController();
    // Increase default timeout to 90s for long articles
    const timeoutMs = Number(process.env.PARSE_LINK_TIMEOUT_MS || 90000);
    const timeout = setTimeout(() => controller.abort(), Number.isFinite(timeoutMs) ? timeoutMs : 90000);

    let res: Response;
    try {
      const headers: Record<string, string> = {
        "X-With-Images-Summary": "false", // Disable image summary for speed
        "X-With-Links-Summary": "false",
        "Accept": "text/plain",
        "Cache-Control": "no-cache",
        "X-No-Cache": "true"
      };

      const apiKey = (process.env.JINA_API_KEY || "").trim();
      if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

      try {
        res = await fetch(jinaUrl, { headers, signal: controller.signal });
      } catch (e: unknown) {
        const name = typeof e === "object" && e && "name" in e ? String((e as any).name) : "";
        if (name === "AbortError") {
          return NextResponse.json({ error: "解析超时，请稍后重试或手动复制文章内容" }, { status: 504 });
        }
        throw e;
      }
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) {
      const status = res.status;
      if (status === 429) {
        return NextResponse.json({ error: "解析服务繁忙，请稍后重试" }, { status: 429 });
      }
      if (status === 403) {
        return NextResponse.json({ error: "解析服务拒绝访问（403），请稍后重试或配置 JINA_API_KEY" }, { status: 502 });
      }
      return NextResponse.json({ error: `解析服务请求失败（${status}）` }, { status: 502 });
    }

    const text = await res.text();
    const markdown = extractMarkdownContent(text);

    const blocked = detectBlockedContent(text, markdown);
    if (blocked) {
      return NextResponse.json(
        { error: blocked.error, code: blocked.code, ...(blocked.actionUrl ? { actionUrl: blocked.actionUrl } : {}) },
        { status: blocked.status },
      );
    }

    const cleanText = markdown
      .replace(/!\[.*?\]\(.*?\)/g, "")
      .replace(/\[.*?\]\(.*?\)/g, "")
      .replace(/[#*`]/g, "")
      .replace(/\n+/g, "\n")
      .trim()
      .slice(0, 50000);

    if (cleanText.length < 50) {
      return NextResponse.json({ error: "无法获取有效内容，请尝试手动复制文章内容" }, { status: 404 });
    }

    // AI Summarization
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const { apiVersion, models } = await listModelsAnyVersion(apiKey);
        // Prefer faster models for summarization
        const preferredModel = (process.env.GEMINI_MODEL || "gemini-1.5-flash").trim();
        const bestModel = chooseBestModelId({
          models,
          preferredModelId: preferredModel,
          requiredMethod: "generateContent",
          excludeText: ["image", "imagen"],
        });

        if (bestModel) {
          const prompt = `
You are an expert content editor for Xiaohongshu (Red Note).
Please summarize the following content into a concise, inspiring format suitable for a Xiaohongshu post input.
Focus on the core message, key details, and emotional vibe.
The summary should be in Chinese (if the content is Chinese) or the original language, but optimized for inspiration.
Keep it under 800 characters.

Content to summarize:
${cleanText.slice(0, 30000)}
`.trim();

          // Add timeout for AI summarization (15s)
          const summaryPromise = generateContentText({
            apiKey,
            apiVersion,
            modelId: bestModel,
            prompt,
          });

          const timeoutPromise = new Promise<null>((resolve) => 
            setTimeout(() => resolve(null), 15000)
          );

          const result = await Promise.race([summaryPromise, timeoutPromise]);

          if (result && result.text && result.text.trim()) {
            return NextResponse.json({ text: result.text.trim() });
          } else {
            console.log("AI Summarization timed out or returned empty, falling back to raw text");
          }
        }
      } catch (e) {
        console.error("AI Summarization failed, falling back to raw text:", e);
      }
    }

    return NextResponse.json({ text: cleanText });

  } catch (error: unknown) {
    console.error("Parse Link Error:", error);
    const name = typeof error === "object" && error && "name" in error ? String((error as any).name) : "";
    if (name === "AbortError") {
      return NextResponse.json({ error: "解析超时，请稍后重试或手动复制文章内容" }, { status: 504 });
    }
    const message = error instanceof Error ? error.message : "Failed to parse link";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
