import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const item = await prisma.history.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error("History Get Error:", error);
    return NextResponse.json({ error: "Failed to fetch history item" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    await prisma.history.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("History Delete Error:", error);
    return NextResponse.json({ error: "Failed to delete history item" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await req.json();
    const { xhsTitle, xhsContent } = body;

    const updated = await prisma.history.update({
      where: { id },
      data: {
        xhsTitle,
        xhsContent,
      } as any,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("History Patch Error:", error);
    return NextResponse.json({ error: "Failed to update history item" }, { status: 500 });
  }
}
