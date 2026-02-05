import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type InitRequestBody = {
  originalText?: string;
  prompt?: string;
  xhsTitle?: string;
  xhsContent?: string;
  style?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as InitRequestBody;
    const { originalText, prompt, xhsTitle, xhsContent, style } = body;

    const history = await prisma.history.create({
      data: {
        originalText: originalText || "(empty)",
        generatedPrompt: prompt || "",
        xhsTitle: xhsTitle || null,
        xhsContent: xhsContent || null,
        imageUrl: null, // No image yet
        style: style || null,
        status: "PENDING",
      } as any,
    });

    return NextResponse.json({ id: history.id, status: history.status });
  } catch (error: any) {
    console.error("Generate Init Error:", error);
    return NextResponse.json({ error: error.message || "初始化失败" }, { status: 500 });
  }
}
