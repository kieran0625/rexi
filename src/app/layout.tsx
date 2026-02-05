import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google"; // Distinctive typography
import "./globals.css";
import { FloatingNav } from "@/components/feature/FloatingNav";
import { Toaster } from "@/components/ui/toaster";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rexi - 小红书爆款内容生成器",
  description: "AI 驱动的创意工坊，让每一个灵感都成为爆款。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${outfit.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground selection:bg-primary/20 selection:text-primary">
        <FloatingNav />
        <main className="transition-all duration-300 md:pl-24 pb-24 md:pb-0 min-h-screen">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
