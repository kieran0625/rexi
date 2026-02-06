import { NextResponse } from "next/server";
import { chooseBestModelId, generateContentText, listModelsAnyVersion, type ApiVersion, type GroundingMetadata } from "@/lib/gemini";

type AnalyzeRequestBody = {
  text?: string;
  style?: string;
};

let cachedModelChoice:
  | {
    apiVersion: ApiVersion;
    modelId: string;
    expiresAt: number;
  }
  | undefined;

function buildPrompt(text: string, style?: string) {
  const styleDirective = style
    ? `
### USER OVERRIDE: FORCED STYLE
The user has explicitly selected the art style: "${style}".
You MUST ignore any style inference and generate exactly 3 distinct variants using ONLY "${style}".
Explore different interpretations inside that style (e.g., close-up vs wide, minimal vs rich background, vibrant vs muted).

CRITICAL: For this redraw task, do NOT generate any Xiaohongshu copy.
Return empty strings for xhsTitle and xhsContent.
`
    : `
### STYLE INFERENCE (3–6 options)
Infer 3–6 plausible image styles from the user's text and implied intent, then pick the best 3 for prompt generation.

Hard constraints:
- No extreme abstraction where the subject is unrecognizable.
- No low-quality or muddy/underexposed results.
- Prefer Xiaohongshu-friendly visuals: clean, bright, aesthetically pleasing, high clarity, tasteful composition.

Allowed style pool (examples, mix as needed):
1) Photography & Realism: cinematic photo, street photo, product photo, portrait, film grain
2) East Asian illustration: ink wash, gongbi, ukiyo-e
3) Fine art: oil painting (impasto / baroque), impressionism, art nouveau, surrealism
4) Digital art: cyberpunk, dreamcore, vaporwave, anime/ghibli-like, 3D render
5) Material/medium: watercolor, charcoal sketch, paper cut, embroidery, ceramic glaze
6) XHS-trending: 3D clay toy style, collage poster, glassmorphism, paper-cut lightbox, isometric room
`;

  return `
You are an expert AI Art Director and Prompt Refactoring Specialist.

User text: "${text}"

Goal: Convert the user text into high-quality image-generation prompts and Xiaohongshu-style copywriting.

Language rules:
- Image generation prompts MUST be in English (positive / negative / params / variables / tips).
- Xiaohongshu copywriting MUST be in Chinese (xhsTitle / xhsContent).

### A) Deep content analysis (extract and infer)
1) Keywords:
   - subject/character (age, gender if implied, occupation/species)
   - scene/environment (place, time, weather, atmosphere)
   - action/pose
   - props/objects
   - explicit style cues from the user (if any)
   - color & lighting cues
2) Emotional tone:
   - 1–3 words label
   - evidence: quote or paraphrase the exact phrase that signals the emotion
3) Implied needs:
   - intended effect (cute / premium / cinematic / realistic / dreamy, etc.)
   - likely usage (avatar / cover / poster / product image)
   - missing-but-critical details you should propose (composition, lens, background complexity, material, lighting)

${styleDirective}

### B) Universal prompt structure (per variant)
Build each variant as:
[Art Style] + [Subject/Scene] + [Color Palette & Lighting] + [Composition & Lens] + [Material/Texture Details] + [Quality Boosters]

Requirements:
- Make the style unmistakable (use medium-specific vocabulary: brushstrokes, ink wash, film grain, ray tracing, volumetric light, etc.).
- Photography variants must be bright, clean, well-exposed, with natural skin/food/product tones when relevant.
- Include 3–6 replaceable variables in curly braces, e.g. {outfit}, {main color}, {time of day}.

Negative prompt must be style-aware and include at least:
text, watermark, logo, lowres, blurry, jpeg artifacts, deformed hands, extra fingers, bad anatomy, overexposed, underexposed, muddy shadows.

### C) 小红书文案生成（中文，XHS 口吻，内容更丰满）
基于用户原文主题生成一篇“可直接发布”的小红书笔记，内容必须更充实、有收藏价值。

长度要求：
- xhsContent 约 300–800 字（中文为主），不要只写几句话。

🚫 禁止：
- 不要学术/科普腔：禁止“研究表明 / 机制 / 效应 / 论文 / 数据来源”等。
- 不要编造数据：不要写百分比、排行榜、虚构对比实验。
- 不要跑题：每一句都要围绕用户原文主题。
- 不要硬广：避免过度营销话术。

✅ 必须做到（参考小红书排版习惯）：
- 开头 2–4 句快速共鸣 + 说明“这篇笔记能带走什么”，末尾可加“往下看 ⬇️”。
- 正文用 3–5 个小节（每节 1–3 句），用【小标题】+ 短段落，段落之间用 “—————” 分隔。
- 至少给出 3–5 条可执行的干货清单（用 • 或 ✓ 列表）。
- Emoji 适度：标题最多 1–2 个；正文每段 0–1 个即可，不要堆砌。
- 结尾要有总结（✓✓✓）+ 互动提问 1 句 + 5–8 个相关话题标签（#...）。

标题要求（xhsTitle）：
- 20 字以内，口语、有钩子，可用 1 个 Emoji。
- 优先使用：对比/数字/场景化，例如“XX 的 3 种打开方式”“为什么我更爱 XX”。

### Output (STRICT JSON ONLY)
Return a valid JSON object. No markdown, no trailing commas.

JSON structure:
{
  "analysis": {
    "keywords": {
      "subjects": [],
      "scene": [],
      "actions": [],
      "props": [],
      "styleCues": [],
      "colorLighting": []
    },
    "emotionalTone": { "label": "", "evidence": "" },
    "impliedNeeds": []
  },
  "styleHypotheses": [
    { "style": "", "reason": "" }
  ],
  "imagePrompts": [
    {
      "id": "variant_a",
      "focus": "Style Name",
      "positive": "Full positive prompt (English)...",
      "negative": "Full negative prompt (English)...",
      "params": "--ar 3:4 --stylize 250",
      "variables": ["{var1}", "{var2}", "{var3}"],
      "tips": "Definition: ...\\nWhy it fits: ...\\nVisual traits: ...\\nWhat to look for: ..."
    },
    { "id": "variant_b", "focus": "", "positive": "", "negative": "", "params": "", "variables": [], "tips": "" },
    { "id": "variant_c", "focus": "", "positive": "", "negative": "", "params": "", "variables": [], "tips": "" }
  ],
  "xhsTitle": "",
  "xhsContent": ""
}
`.trim();
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AnalyzeRequestBody;
    const text = (body.text || "").trim();
    const style = (body.style || "").trim();
    if (!text) {
      return NextResponse.json({ error: "缺少 text" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        prompt: `(Mock) Artistic oil painting of ${text}, expressive brushstrokes, dramatic lighting, masterpiece, 8k, surreal atmosphere`,
        xhsTitle: "✨ 演示模式（未配置 Key）",
        xhsContent: "由于未配置 GEMINI_API_KEY，当前为演示模式。\n\n请配置 GEMINI_API_KEY 以启用更完整的提示词分析与更丰富的小红书文案生成。"
      });
    }

    const preferredModel = (process.env.GEMINI_MODEL || "gemini-3-pro-preview").trim();
    const prompt = buildPrompt(text, style);

    const now = Date.now();
    if (!cachedModelChoice || cachedModelChoice.expiresAt <= now) {
      cachedModelChoice = undefined;
      const { apiVersion, models } = await listModelsAnyVersion(apiKey);
      const best = chooseBestModelId({
        models,
        preferredModelId: preferredModel,
        requiredMethod: "generateContent",
        excludeText: ["image", "imagen"],
      });
      if (!best) {
        return NextResponse.json(
          {
            prompt: `(Mock/Fallback) Xiaohongshu style photo, soft natural lighting, pastel colors, high resolution, 8k, photorealistic, lifestyle vibe`,
            warning: `AI 连接失败: 无可用文本模型，已切换到演示模式`,
            xhsTitle: "⚠️ 模式切换",
            xhsContent: "由于无法连接到文本模型，已切换至离线演示模式。\n\n这可能由网络或配额限制导致，请稍后重试。"
          },
          { status: 502 }
        );
      }
      cachedModelChoice = { apiVersion, modelId: best, expiresAt: now + 10 * 60 * 1000 };
    }

    const { text: generatedText, groundingMetadata } = await generateContentText({
      apiKey,
      apiVersion: cachedModelChoice.apiVersion,
      modelId: cachedModelChoice.modelId,
      prompt,
      enableGrounding: true, // Enable Google Search grounding for fact verification
    });

    // Extract grounding sources for citations
    const groundingSources = (groundingMetadata?.groundingChunks || []).map(chunk => ({
      title: chunk.web?.title || "Unknown Source",
      url: chunk.web?.uri || "",
    })).filter(s => s.url);

    // Parse JSON output
    let result;
    try {
      const cleanJson = generatedText.replace(/```json/g, "").replace(/```/g, "").trim();
      result = JSON.parse(cleanJson);
    } catch (e) {
      // Fallback if JSON parsing fails
      console.error("JSON Parse Error:", e);
      result = {
        imagePrompt: generatedText,
        xhsTitle: "✨ 文案生成失败",
        xhsContent: "AI 未能返回有效的 JSON 结果，请重试。"
      };
    }

    const imagePrompts = Array.isArray(result?.imagePrompts) ? result.imagePrompts : undefined;
    const composedFromFirst =
      imagePrompts && imagePrompts.length > 0
        ? [
          `Positive Prompt: ${imagePrompts[0]?.positive || ""}`.trim(),
          `Negative Prompt: ${imagePrompts[0]?.negative || ""}`.trim(),
          `Parameters: ${imagePrompts[0]?.params || ""}`.trim(),
        ]
          .filter(Boolean)
          .join("\n")
        : "";

    return NextResponse.json({
      prompt: result.imagePrompt || composedFromFirst || generatedText,
      imagePrompts,
      xhsTitle: result.xhsTitle,
      xhsContent: result.xhsContent,
      citations: result.citations || [],
      verificationNotes: result.verificationNotes || "",
      groundingSources, // Real sources from Google Search
      modelUsed: cachedModelChoice.modelId,
    });
  } catch (error: any) {
    const msg = error?.message || "未知错误";
    return NextResponse.json(
      {
        prompt: `(Mock/Fallback) Classical oil painting, dramatic lighting, masterpiece, 8k, highly detailed, expressive style`,
        warning: `AI 连接失败: ${msg}，已切换到演示模式`,
        xhsTitle: "⚠️ 生成中断",
        xhsContent: `连接 AI 时遇到问题 (${msg})。\n\n已返回默认兜底提示词。请检查网络与 GEMINI_API_KEY 配置。`
      },
      { status: 500 }
    );
  }
}
