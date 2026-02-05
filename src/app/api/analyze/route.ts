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
### **USER OVERRIDE: FORCED STYLE**
The user has explicitly selected the art style: **"${style}"**.
You **MUST** ignore the "Phase 2" classification and "Phase 3" selection logic.
Instead, generate **3 distinct variants** using ONLY the style **"${style}"**, but exploring different interpretations within that style (e.g., Close-up vs Wide, Minimal vs Complex, Vibrant vs Muted).

**CRITICAL INSTRUCTION**: 
For this Redraw task, you must **NOT** generate any "Xiaohongshu Copy" (xhsTitle / xhsContent).
The user wants to strictly preserve their original text. 
**RETURN EMPTY STRINGS** for "xhsTitle" and "xhsContent".
`
    : `
### **Phase 2: Artistic Classification & Filtering**
**STRICT PROHIBITION (The "Red Line")**:
*   ❌ **NO Extreme Abstraction**: Avoid styles where the subject is unrecognizable.
*   ❌ **NO Low-Quality Aesthetics**: Avoid blurry or poorly defined "lifestyle" shots.

**ALLOWED Art Style Categories**:
1.  **Photography & Realism (HIGH PRIORITY)**: 
    *   **Cinematic Shot (电影感)**: Golden hour lighting, wide-screen composition, anamorphic flares, cinematic clarity, soft highlights, high dynamic range.
    *   **Street Photography (街头摄影)**: Candid, natural daylight, urban textures, decisive moment, vibrant street life, balanced exposure.
    *   **Product Photography (产品静物)**: Soft studio lighting, macro details, clean backgrounds, high-end commercial feel, bright and clean.
    *   **Portrait Photography (人像写真)**: Shallow depth of field (bokeh), warm natural light, focus on eyes/expressions, luminous skin tones.
    *   **Film Grain (胶片感)**: Analog texture, warm/muted tones, nostalgic vibe (Kodak/Fujifilm styles), vibrant film stock, warm color grading.
2.  **Classical & Traditional**: Chinese Ink Wash (水墨), Oil Painting (Baroque/Renaissance/Impasto), Ukiyo-e (浮世绘), Fresco (壁画), Gongbi (工笔).
3.  **Modern Art (Pre-Digital)**: Impressionism (印象派), Expressionism (表现主义), Surrealism (超现实主义), Art Nouveau (新艺术运动), Fauvism (野兽派).
4.  **Digital & Fantasy**: Cyberpunk (赛博朋克), Steampunk (蒸汽朋克), Vaporwave, Dreamcore (梦核), Pixel Art (像素), Ghibli/Anime Style (吉卜力), 3D Surreal Render.
5.  **Texture & Medium**: Watercolor (水彩), Charcoal Sketch (炭笔), Paper Cutout (剪纸), Embroidery (刺绣), Ceramic Glaze (釉色).
6.  **XHS Trending (Viral)**: 
    *   **3D Clay (3D粘土风)**: Cute, soft, rounded shapes, stop-motion texture, bright pastel colors, "Pop Mart" toy vibe.
    *   **Collage Poster (海报拼贴)**: High saturation, bold typography, sticker elements, mixed media, magazine layout.
    *   **Glassmorphism (毛玻璃)**: Translucent frosted glass effects, soft gradients, modern UI feel, ethereal and clean.
    *   **Paper Cut Lightbox (纸雕灯)**: Layered paper depth, warm backlight, silhouette storytelling, intricate details.
    *   **Isometric Room (等轴微缩)**: Cute miniature room/scene, orthographic view, SimCity vibe, detailed props.

### **Phase 3: Generate 3 Distinct Artistic Variants**
Based on the analysis, select 3 different *Allowed* styles that best interpret the text.
**Priority Strategy**: If the text describes a real-life scene (e.g., food, travel, person), **Variant A MUST be a Photography style**.
`;

  return `
You are an expert AI Art Director and Semantic Analyst.

User Input: "${text}"

Your goal is to transform this input into **High-Quality, Artistic Image Prompts**.
You must strictly adhere to the following **Anti-Modern, Anti-Lifestyle** policy.

### **Phase 1: Deep Semantic Analysis**
Analyze the input to extract:
1.  **Core Subjects**: Key objects, figures, or scenery.
2.  **Emotional Tone**: The mood (e.g., Melancholic, Ethereal, Heroic, Zen).
3.  **Abstract Concepts**: Underlying themes (e.g., Time, Eternity, Solitude).

${styleDirective}

### **Universal Prompt Structure**
For each variant, construct a prompt using:
\`[Art Style] + [Subject/Scene] + [Color Palette/Lighting] + [Composition] + [Artistic Details] + [Quality Boosters]\`

**CRITICAL FOR REALISM**: For photography styles, ensure the scene is well-lit, vibrant, and clear. Avoid excessive shadows or "muddy" tones.

*   **Positive Prompt**: Must include specific art terms (e.g., "brushstrokes", "palette knife", "ink splash", "ray tracing", "volumetric lighting", "natural sunlight", "high dynamic range").
*   **Negative Prompt**: "dark, gloomy, underexposed, over-saturated shadows, modern city, skyscrapers, minimalism, plain background, text, watermark, blurry, low quality, ugly, deformed, simple photo".

### **Phase 4: Xiaohongshu Copywriting (小红书文案生成)**
You must generate a viral, high-value Xiaohongshu post based on the **user's original topic**.

**🚫 FORBIDDEN (Critical)**:
*   ❌ **NO Scientific Jargon**: Do NOT mention "Proust效应", "视觉触发", "Psychological Science", "研究表明", "科学研究", "腺苷受体", etc.
*   ❌ **NO Fabricated Data**: Do NOT invent percentages, statistics, or cite non-existent studies.
*   ❌ **NO Generic Filler**: The content MUST be 100% about the user's original input topic.
*   ❌ **NO Academic Tone**: Avoid formal, textbook-like language.

**✅ REQUIRED**:
*   ✅ **Topic Relevance**: Every sentence must relate to the user's input (e.g., if user says "咖啡", talk about coffee culture, brewing, aesthetics - NOT its chemical effects on the brain).
*   ✅ **Lifestyle Tone (生活化)**: Write as if sharing a personal experience with a friend.
*   ✅ **Emotional Warmth (有温度)**: Focus on feelings, atmosphere, and aesthetic appreciation.
*   ✅ **Practical Value (干货)**: Provide tips, recommendations, or insights the reader can actually use.

**Copywriting Structure**:
*   **Title (xhsTitle)**:
    *   Catchy, emotional, max 20 chars.
    *   Use trending formats: "为什么XX比XX更让人心动", "XX的N种打开方式", "一个XX就能让你XX".
*   **Content (xhsContent)**:
    *   **Hook (引子)**: Start with a relatable scenario or question about the topic.
    *   **Core Points (干货)**: 3-4 short paragraphs, each about a specific aspect of the topic. Use emojis (🌸, ✨, 💕) to enhance readability.
    *   **Emotional Resonance (共鸣)**: Connect the topic to feelings (治愈, 幸福, 放松, 期待).
    *   **CTA (互动)**: End with a question to invite comments (e.g., "你最喜欢哪种XX？").
    *   **Tags**: 5-8 relevant hashtags.

**Tone**: 温暖、真实、有质感。像跟好朋友分享一样自然。

### **Output Format (Strict JSON Only)**
Return a valid JSON object. No markdown.

**Requirements for 'tips' field (Chinese)**:
Provide a structured analysis:
1.  **定义**: Definition of the style.
2.  **匹配理由**: Why this style fits the input text.
3.  **艺术特征**: Visual characteristics (color, stroke).
4.  **鉴赏指南**: What to look for in the generated image.

JSON Structure:
{
  "imagePrompts": [
    {
      "id": "variant_a",
      "focus": "Style Name (e.g. Surrealist Oil)",
      "positive": "Full positive prompt...",
      "negative": "Full negative prompt...",
      "params": "--ar 3:4 --stylize 250",
      "tips": "定义: ...\\n匹配理由: ...\\n艺术特征: ...\\n鉴赏指南: ..."
    },
    { "id": "variant_b", ... },
    { "id": "variant_c", ... }
  ],
  "xhsTitle": "Generated Title",
  "xhsContent": "Generated Content..."
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
        xhsTitle: "✨ 灵感绘图 (演示模式)",
        xhsContent: "由于未配置 API Key，当前为演示模式。\n\nAI 已为你生成了一张基于关键词的艺术画作。\n\n💡 **提示**: 配置 GEMINI_API_KEY 后可体验完整的 AI 文案生成与深度分析功能。"
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
            xhsContent: "由于无法连接到 AI 模型，已自动切换至离线演示模式。\n\n这可能由网络问题或配额限制引起。请稍后重试。"
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
        xhsTitle: "✨ 小红书美图生成",
        xhsContent: "AI 未能生成有效文案，请重试。"
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
        xhsContent: `我们在连接 AI 时遇到了问题 (${msg})。\n\n已为您展示默认风格的生成效果。请检查网络设置或 API Key 配置。`
      },
      { status: 500 }
    );
  }
}
