import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const { password } = await req.json();
        const correctPassword = process.env.ACCESS_PASSWORD;

        if (!correctPassword) {
            console.error("ACCESS_PASSWORD is not set in environment variables");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        if (password === correctPassword) {
            // 设置 Cookie，有效期 30 天
            (await cookies()).set("auth_token", "authenticated", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: "/",
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
    }
}
