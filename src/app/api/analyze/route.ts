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
All deliverables MUST be in English.

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

### C) Xiaohongshu-style copywriting (English, XHS vibe)
Write a viral, high-value Xiaohongshu-style post that stays strictly on the user's topic.

Forbidden:
- No scientific/academic jargon, no invented statistics, no citations, no generic filler.

Required (XHS style, but in English):
- Friendly, like sharing with a friend.
- Short paragraphs (1–3 sentences), clean spacing.
- Practical tips (3–5 bullets).
- 1 question CTA at the end.
- 5–8 hashtags.
- Emojis: keep it light (title max 1–2, body about 0–1 per paragraph).

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
        xhsTitle: "Inspo image, demo ✨",
        xhsContent: "Demo mode: GEMINI_API_KEY is not configured.\n\nSet GEMINI_API_KEY to enable full prompt analysis and Xiaohongshu-style copywriting."
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
            xhsTitle: "Fallback mode ⚠️",
            xhsContent: "Could not connect to a text model, switched to offline fallback. This may be due to network or quota limits. Please try again later."
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
        xhsTitle: "XHS-style draft ✨",
        xhsContent: "The model did not return valid JSON. Please try again."
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
        xhsTitle: "Generation interrupted ⚠️",
        xhsContent: `We hit an error while contacting the AI (${msg}).\n\nShowing a fallback prompt. Please check your network and GEMINI_API_KEY.`
      },
      { status: 500 }
    );
  }
}
