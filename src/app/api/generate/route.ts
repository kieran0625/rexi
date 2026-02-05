import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { chooseBestModelId, generateContentImage, listModelsAnyVersion, predictImagen } from "@/lib/gemini";

type GenerateRequestBody = {
  prompt?: string;
  originalText?: string;
  xhsTitle?: string;
  xhsContent?: string;
  taskId?: string; // Optional task ID for async processing
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateRequestBody;
    const prompt = (body.prompt || "").trim();
    const originalText = (body.originalText || "").trim();
    const xhsTitle = (body.xhsTitle || "").trim();
    const xhsContent = (body.xhsContent || "").trim();
    const taskId = body.taskId;

    if (!prompt) {
      return NextResponse.json({ error: "缺少 prompt" }, { status: 400 });
    }

    // If taskId is provided, update status to PROCESSING
    if (taskId) {
      await prisma.history.update({
        where: { id: taskId },
        data: { status: "PROCESSING" } as any,
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const placeholderUrl =
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";

    if (!apiKey) {
      const imageUrl = placeholderUrl;
      const data = {
        originalText: originalText || "(empty)",
        generatedPrompt: prompt,
        xhsTitle: xhsTitle || null,
        xhsContent: xhsContent || null,
        imageUrl,
        style: "No GEMINI_API_KEY",
        status: "COMPLETED",
      } as any;

      if (taskId) {
        await prisma.history.update({ where: { id: taskId }, data });
      } else {
        await prisma.history.create({ data });
      }
      return NextResponse.json({ imageUrl, warning: "未配置 GEMINI_API_KEY，已展示示例图片" });
    }

    const preferredImageModel = (process.env.GEMINI_IMAGE_MODEL || "gemini-3-pro-image-preview").trim();

    const { apiVersion, models } = await listModelsAnyVersion(apiKey);
    const imageModelId = chooseBestModelId({
      models,
      preferredModelId: preferredImageModel,
      requiredMethod: "generateContent",
      includeText: ["image"],
    });

    const imagenModelId = chooseBestModelId({
      models,
      preferredModelId: preferredImageModel,
      requiredMethod: "predict",
      includeText: ["imagen"],
    });

    let imageUrl = "";
    let modelUsed = "";
    let warning: string | undefined;

    try {
      if (imageModelId) {
        const { mimeType, dataBase64 } = await generateContentImage({
          apiKey,
          apiVersion,
          modelId: imageModelId,
          prompt,
        });
        imageUrl = `data:${mimeType};base64,${dataBase64}`;
        modelUsed = imageModelId;
      } else if (imagenModelId) {
        const { mimeType, bytesBase64Encoded } = await predictImagen({
          apiKey,
          apiVersion,
          modelId: imagenModelId,
          prompt,
          sampleCount: 1,
        });
        imageUrl = `data:${mimeType};base64,${bytesBase64Encoded}`;
        modelUsed = imagenModelId;
      } else {
        imageUrl = placeholderUrl;
        modelUsed = "placeholder";
        warning = "未找到可用的 Gemini 生图模型，已展示示例图片";
      }

      const updateData = {
        imageUrl,
        style: modelUsed,
        status: "COMPLETED",
        // Update prompt and content as well, since they might be empty during init
        generatedPrompt: prompt,
        xhsTitle: xhsTitle || undefined,
        xhsContent: xhsContent || undefined,
        originalText: originalText || undefined,
      } as any;

      if (taskId) {
        // Only update fields that are result-related, keep original inputs if not provided or just update all
        await prisma.history.update({
          where: { id: taskId },
          data: updateData,
        });
      } else {
        await prisma.history.create({
          data: {
            originalText: originalText || "(empty)",
            generatedPrompt: prompt,
            xhsTitle: xhsTitle || null,
            xhsContent: xhsContent || null,
            ...updateData,
          },
        });
      }
    } catch (innerError: any) {
        if (taskId) {
            await prisma.history.update({
                where: { id: taskId },
                data: { status: "FAILED" } as any
            });
        }
        throw innerError;
    }

    return NextResponse.json({ imageUrl, modelUsed, warning });
  } catch (error: any) {
    const placeholderUrl =
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";
    const msg = error?.message || "服务生成失败";
    
    // Note: If taskId was provided, we tried to update status to FAILED in inner catch block.
    
    return NextResponse.json({ imageUrl: placeholderUrl, warning: msg }, { status: 500 });
  }
}
