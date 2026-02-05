import { NextResponse } from "next/server";
import { chooseBestModelId, generateContentText, listModelsAnyVersion, type ApiVersion } from "@/lib/gemini";

type RewriteRequestBody = {
  originalText?: string;
  currentContent?: string;
};

let cachedModelChoice:
  | {
    apiVersion: ApiVersion;
    modelId: string;
    expiresAt: number;
  }
  | undefined;

function buildRewritePrompt(originalText: string, currentContent: string) {
  return `
You are an expert Social Media Copywriter specializing in **Xiaohongshu (Little Red Book)**.

### **Context**
1.  **Original User Intent**: "${originalText}"
2.  **Current Draft**: "${currentContent.slice(0, 1000)}" (truncated if too long)

### **Task**
Your goal is to **REWRITE** the current draft to make it significantly **BETTER** and **DIFFERENT**.
Do **NOT** just output the same content again. You must change the structure, tone, or angle.

### **🚫 CRITICAL PROHIBITIONS**:
*   ❌ **NO Scientific Jargon**: Avoid "研究表明", "科学证明", "效应", "机制" etc.
*   ❌ **NO Off-Topic Content**: The rewrite MUST stay 100% focused on the original topic.
*   ❌ **NO Academic Tone**: Write naturally, not like a textbook.

### **Differentiation Strategy (Pick one randomly)**:
*   *Option A (Emotional 情感向)*: Focus on feelings, mood, and atmosphere.
*   *Option B (Utility 实用向)*: Focus on practical tips, steps, and "how-to".
*   *Option C (Storytelling 故事向)*: Narrate a personal experience or scenario.

### **Core Requirements**:
1.  **Topic Relevance (主题贴合)**: Content must directly relate to the original input.
2.  **Lifestyle Tone (生活化)**: Write as if sharing with a friend.
3.  **Emotional Warmth (有温度)**: Focus on aesthetic appreciation and feelings.
4.  **Practical Value (干货)**: Provide actionable tips or insights.
5.  **Engaging Format**: Use the "Xiaohongshu vibe" (emojis, friendly, relatable).

### **Structure**:
*   **Catchy Title**: Max 20 chars, use strong emotional hooks.
*   **Body**: Clear paragraphs with bullet points and emojis.
*   **Tags**: Relevant hashtags.

### **Output Format (Strict JSON Only)**:
{
  "xhsTitle": "New Title",
  "xhsContent": "New Content..."
}
`.trim();
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RewriteRequestBody;
    const originalText = (body.originalText || "").trim();
    const currentContent = (body.currentContent || "").trim();

    // Use whatever text we have available
    const mainContext = originalText || currentContent;

    if (!mainContext) {
      return NextResponse.json({ error: "Missing text context" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        xhsTitle: "✨ 演示模式 (无 API Key)",
        xhsContent: "由于未配置 GEMINI_API_KEY，无法使用 AI 重写功能。\n\n请在后台配置 API Key 以体验完整功能。"
      });
    }

    const preferredModel = (process.env.GEMINI_MODEL || "gemini-3-pro-preview").trim();
    const prompt = buildRewritePrompt(originalText, currentContent);

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
        return NextResponse.json({ error: "No available Gemini model found" }, { status: 502 });
      }
      cachedModelChoice = { apiVersion, modelId: best, expiresAt: now + 10 * 60 * 1000 };
    }

    const { text: generatedText } = await generateContentText({
      apiKey,
      apiVersion: cachedModelChoice.apiVersion,
      modelId: cachedModelChoice.modelId,
      prompt,
    });

    // Parse JSON with robust fallback
    let result;
    try {
      // 1. Try to find JSON object pattern first
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      const candidate = jsonMatch ? jsonMatch[0] : generatedText;

      // 2. Clean common Markdown artifacts
      const cleanJson = candidate
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      result = JSON.parse(cleanJson);
    } catch (e) {
      console.warn("Rewrite JSON Parse Error, attempting fallback:", e);

      // 3. Fallback: Treat raw text as content if JSON fails
      // Try to guess a title from the first line if it looks like one
      const lines = generatedText.split('\n').map(l => l.trim()).filter(Boolean);
      let fallbackTitle = "AI 重写文案";
      let fallbackContent = generatedText;

      if (lines.length > 0) {
        // If first line is short and looks like a title (no punctuation at end, short length)
        const firstLine = lines[0];
        if (firstLine.length < 30 && !firstLine.endsWith('。')) {
          fallbackTitle = firstLine.replace(/^["'#*]+|["'#*]+$/g, ''); // Remove quotes/markdown chars
          fallbackContent = lines.slice(1).join('\n');
        }
      }

      result = {
        xhsTitle: fallbackTitle,
        xhsContent: fallbackContent
      };
    }

    return NextResponse.json({
      xhsTitle: result.xhsTitle || "Untitled",
      xhsContent: result.xhsContent || generatedText,
      modelUsed: cachedModelChoice.modelId,
    });

  } catch (error: any) {
    console.error("Rewrite Error:", error);
    return NextResponse.json({ error: error.message || "Rewrite failed" }, { status: 500 });
  }
}
