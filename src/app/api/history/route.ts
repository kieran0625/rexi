import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const takeRaw = Number(searchParams.get("take") || "6");
    const take = Number.isFinite(takeRaw) ? Math.min(Math.max(Math.trunc(takeRaw), 1), 50) : 6;
    const skip = Number(searchParams.get("skip") || "0");

    const [items, totalCount] = await Promise.all([
      prisma.history.findMany({
        orderBy: { createdAt: "desc" },
        take: take,
        skip: skip,
      }),
      prisma.history.count(),
    ]);

    return NextResponse.json({ items, totalCount });
  } catch (error) {
    console.error("History Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await prisma.history.deleteMany({});
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("History Clear Error:", error);
    return NextResponse.json({ error: "Failed to clear history" }, { status: 500 });
  }
}
