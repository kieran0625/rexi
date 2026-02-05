import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    // 使用 Jina Reader 解析文章（支持微信公众号转 Markdown）
    console.log("Parsing with Jina Reader...");
    const jinaUrl = `https://r.jina.ai/${url}`;
    const res = await fetch(jinaUrl, {
      headers: {
        "X-With-Images-Summary": "true",
        "X-With-Links-Summary": "false",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch content from Jina Reader" }, { status: 502 });
    }

    const text = await res.text();

    // 检查是否包含反爬提示
    if (text.includes("环境异常") || text.includes("CAPTCHA") || text.includes("访问过于频繁")) {
      return NextResponse.json({ error: "内容暂时无法获取，请稍后再试或手动复制文章内容" }, { status: 429 });
    }

    const cleanText = text
      .replace(/!\[.*?\]\(.*?\)/g, "")
      .replace(/\[.*?\]\(.*?\)/g, "")
      .replace(/[#*`]/g, "")
      .replace(/\n+/g, "\n")
      .trim()
      .slice(0, 3000);

    if (cleanText.length < 50) {
      return NextResponse.json({ error: "无法获取有效内容，请尝试手动复制文章内容" }, { status: 404 });
    }

    return NextResponse.json({ text: cleanText });

  } catch (error: unknown) {
    console.error("Parse Link Error:", error);
    const message = error instanceof Error ? error.message : "Failed to parse link";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}