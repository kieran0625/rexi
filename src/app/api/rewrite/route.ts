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

**Differentiation Strategy (Pick one randomly)**:
*   *Option A (Emotional)*: Focus on feelings, mood, and atmosphere.
*   *Option B (Utility)*: Focus on practical tips, steps, and "how-to".
*   *Option C (Storytelling)*: Narrate a personal experience or scenario.

**Core Requirements**:
1.  **High Information Density**: Provide actionable value.
2.  **Engaging Tone**: Use the "Xiaohongshu vibe" (emojis, friendly, relatable).
3.  **Structure**:
    *   **Catchy Title**: Max 20 chars, use strong hooks.
    *   **Body**: Clear paragraphs with bullet points.
    *   **Tags**: Relevant hashtags.

**Output Format (Strict JSON Only)**:
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
