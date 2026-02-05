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
For poems with more than 4 verses, select the 4 most visually evocative and culturally significant verses.

For each selected verse, analyze:
1.  **字面意思**: Direct, clear modern Chinese translation.
2.  **意象与画面**: Key imagery (月, 霜, 孤舟) and the visual scene it creates.
3.  **情感色彩**: The core emotional tone (悲/喜/思/愁/旷).
4.  **炼字赏析**: Identify the most powerful word (e.g., "绿" in "春风又绿江南岸") and explain its expressive effect.

## Phase 3: High School Level Deep Appreciation (深度赏析) - **CRITICAL**
Apply standard high school poetry appreciation methodology:

1.  **知人论世 (Background)**: Brief context on the author's life stage or historical background relevant to this poem.
2.  **意境 (Atmosphere)**: Describe the overall aesthetic atmosphere (e.g., 凄清, 雄浑, 恬淡).
3.  **表现手法 (Techniques)**: Identify specific techniques used (e.g., 借景抒情, 虚实结合, 托物言志, 动静结合, 用典).
4.  **主旨 (Theme)**: The deeper philosophical or emotional core.

## Phase 4: Image Prompt Generation
For each verse (MAX 4), generate an art prompt:
-   **Style**: Match to dynasty (唐: Grand & Romantic/Ink Wash; 宋: Delicate/Realistic; 元: Expressive/Literati).
-   **Atmosphere**: Match the poem's "Yi Jing" (意境).
-   **Visuals**: Concrete imagery from the verse.
-   **Quality**: "masterpiece, best quality, traditional Chinese painting style, highly detailed, 8k, cinematic lighting".

## Phase 5: Xiaohongshu Content (小红书文案) - "High-Score Study Note" Style
Generate content that feels like a top-tier educational & aesthetic sharing note.
**Structure**:
1.  **Title**: Catchy, aesthetic title (e.g., "📜 绝美诗词 | 读懂李白的一抹乡愁").
2.  **Poem**: The full poem text.
3.  **📖 沉浸式解读 (Deep Dive)**:
    *   **知人论世**: 1-2 sentences on background.
    *   **名句赏析**: Pick the most famous lines and analyze them using **炼字** (word choices) and **意象** (imagery).
    *   **美学意境**: Describe the mood and atmosphere.
4.  **💡 知识点 (Knowledge Points)**: Bullet points on **表现手法** (techniques used).
5.  **✨ 结语 (Closing)**: A short, emotional summary that resonates with modern readers.

**Tone**:
*   **Educational but Aesthetic**: Professional literary analysis wrapped in beautiful language.
*   **Engaging**: Use emoticons (📜, ✨, 🌙, 🌸) appropriately.
*   **Warm**: Connect ancient emotions to modern life.

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
        "literalMeaning": "现代文翻译",
        "imagery": ["月", "霜"],
        "emotion": "思乡",
        "imagePrompt": "Chinese ink wash painting..."
      }
    ],
    "overallMeaning": "整首诗的主旨",
    "literaryDevices": ["比喻", "借景抒情"]
  },
  "imagePrompts": [
    {
      "verseIndex": 0,
      "focus": "Style Name",
      "positive": "Full positive prompt...",
      "negative": "modern, anime, cartoon, low quality, blurry, text, watermark"
    }
  ],
  "xhsTitle": "📜 标题",
  "xhsContent": "正文内容..."
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
