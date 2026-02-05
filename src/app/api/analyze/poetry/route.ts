import { NextResponse } from "next/server";
import { chooseBestModelId, generateContentText, listModelsAnyVersion, type ApiVersion } from "@/lib/gemini";

type PoetryRequestBody = {
    text?: string;
};

type VerseAnalysis = {
    index: number;
    text: string;
    literalMeaning: string;
    imagery: string[];
    emotion: string;
    imagePrompt: string;
};

type PoetryAnalysisResult = {
    isPoetry: boolean;
    poemInfo?: {
        title: string;
        author: string;
        dynasty: string;
        verses: VerseAnalysis[];
        overallMeaning: string;
        literaryDevices: string[];
    };
    imagePrompts?: Array<{ verseIndex: number; focus: string; positive: string; negative: string }>;
    xhsTitle: string;
    xhsContent: string;
};

let cachedModelChoice:
    | {
        apiVersion: ApiVersion;
        modelId: string;
        expiresAt: number;
    }
    | undefined;

function buildPoetryPrompt(text: string) {
    return `
You are an expert Classical Chinese Poetry Scholar and AI Art Director.

User Input: "${text}"

## Phase 1: Poetry Identification
Determine if this is a classical Chinese poem (古诗词). 
**ONLY** support: 唐诗, 宋词, 元曲, 古体诗, 近体诗, 绝句, 律诗
**DO NOT** support: 现代诗, 新诗, 英文诗

If NOT a valid classical Chinese poem, return:
\`\`\`json
{ "isPoetry": false, "xhsTitle": "", "xhsContent": "请输入一首古诗词（如唐诗、宋词等）" }
\`\`\`

## Phase 2: Verse-by-Verse Analysis (MAX 4 verses)
For poems with more than 4 verses, select the 4 most visually evocative verses.

For each selected verse, analyze:
1. **字面意思**: Direct translation/meaning
2. **意象分析**: Key imagery (月/山/水/花 etc.)
3. **情感色彩**: Emotional tone (悲/喜/思/愁 etc.)
4. **视觉元素**: Scene elements for image generation

## Phase 3: Context & Theme Alignment (语境与主题契合)
Focus on:
- **意境还原**: Capture the mood and atmosphere of the poem
- **时代氛围**: Match the general feeling of the dynasty (e.g., 唐代豪迈、宋代婉约)
- **情感共鸣**: Prioritize emotional resonance over historical precision
- **诗意表达**: Artistic interpretation is more important than literal accuracy

Note: Scientific accuracy is ONLY required for science/technology topics. 
For poetry and literary content, prioritize artistic expression and emotional impact.

## Phase 4: Image Prompt Generation
For each verse (MAX 4), generate an art prompt:
- **Style**: Match to dynasty (唐诗→水墨淡彩, 宋词→工笔重彩, 元曲→写意山水)
- **Composition**: Based on verse imagery
- **Color Palette**: Match emotional tone
- **Quality Tags**: "masterpiece, best quality, highly detailed, traditional Chinese painting"

## Phase 5: Xiaohongshu Content (小红书文案)
Generate engaging, emotionally resonant content:
- **情感共鸣**: Connect ancient poetry to modern emotions
- **场景代入**: Create relatable scenarios for readers
- **美学表达**: Focus on beauty, mood, and artistic appreciation
- **主题契合**: Align content with the poem's central theme and emotions

Writing style: 温暖、治愈、有诗意，让读者产生共鸣

## Output Format (Strict JSON)
\`\`\`json
{
  "isPoetry": true,
  "poemInfo": {
    "title": "诗名",
    "author": "作者",
    "dynasty": "朝代",
    "verses": [
      {
        "index": 0,
        "text": "原文诗句",
        "literalMeaning": "字面意思",
        "imagery": ["月", "霜"],
        "emotion": "思乡之情",
        "imagePrompt": "Chinese ink wash painting, moonlight streaming through window..."
      }
    ],
    "overallMeaning": "整首诗的意境",
    "literaryDevices": ["比喻", "对仗"]
  },
  "imagePrompts": [
    {
      "verseIndex": 0,
      "focus": "Style Name",
      "positive": "Full positive prompt with dynasty-appropriate style...",
      "negative": "modern, anime, cartoon, low quality, blurry, text, watermark"
    }
  ],
  "xhsTitle": "📜 经典赏析 | 诗名",
  "xhsContent": "Detailed educational content..."
}
\`\`\`
`.trim();
}

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as PoetryRequestBody;
        const text = (body.text || "").trim();

        if (!text) {
            return NextResponse.json({ error: "请输入古诗词内容" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({
                isPoetry: false,
                xhsTitle: "⚠️ 演示模式",
                xhsContent: "未配置 API Key，请联系管理员。"
            });
        }

        const preferredModel = (process.env.GEMINI_MODEL || "gemini-2.0-flash").trim();
        const prompt = buildPoetryPrompt(text);

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
                    { isPoetry: false, error: "无可用模型" },
                    { status: 502 }
                );
            }
            cachedModelChoice = { apiVersion, modelId: best, expiresAt: now + 10 * 60 * 1000 };
        }

        const { text: generatedText } = await generateContentText({
            apiKey,
            apiVersion: cachedModelChoice.apiVersion,
            modelId: cachedModelChoice.modelId,
            prompt,
            enableGrounding: true,
        });

        let result: PoetryAnalysisResult;
        try {
            const cleanJson = generatedText.replace(/```json/g, "").replace(/```/g, "").trim();
            result = JSON.parse(cleanJson);
        } catch (e) {
            console.error("Poetry JSON Parse Error:", e);
            result = {
                isPoetry: false,
                xhsTitle: "解析失败",
                xhsContent: "AI 未能正确分析诗词，请重试。"
            };
        }

        // Enforce max 4 verses
        if (result.poemInfo?.verses && result.poemInfo.verses.length > 4) {
            result.poemInfo.verses = result.poemInfo.verses.slice(0, 4);
        }
        if (result.imagePrompts && result.imagePrompts.length > 4) {
            result.imagePrompts = result.imagePrompts.slice(0, 4);
        }

        return NextResponse.json({
            ...result,
            modelUsed: cachedModelChoice.modelId,
        });
    } catch (error: any) {
        const msg = error?.message || "未知错误";
        return NextResponse.json(
            { isPoetry: false, error: `分析失败: ${msg}` },
            { status: 500 }
        );
    }
}
