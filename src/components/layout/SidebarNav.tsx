"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Sparkles, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "首页", icon: Home },
  { href: "/generate", label: "生成页面", icon: Sparkles },
  { href: "/works", label: "我的作品", icon: LayoutGrid },
];

export function SidebarNav({ onNavigate, collapsed }: { onNavigate?: () => void; collapsed?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className={cn("space-y-2", collapsed ? "px-3" : "px-4")}>
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            title={collapsed ? item.label : undefined}
            className={cn(
              "group relative flex items-center gap-4 rounded-xl py-3 text-[14px] leading-relaxed font-medium transition-all duration-300 ease-out",
              collapsed ? "justify-center px-0 h-12 w-12 mx-auto" : "px-5",
              active
                ? "bg-[#D87093] text-white shadow-md shadow-[#D87093]/20"
                : "text-[#6E6E6E] hover:bg-white/50 hover:text-[#4A4A4A]"
            )}
          >
            {/* Active Indicator (Optional - Removed for Card style) */}
            {/* {active && !collapsed && (
               <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-xhs-red" />
            )} */}
            <Icon
              className={cn(
                "h-[18px] w-[18px] shrink-0 transition-transform duration-300",
                active ? "text-white" : "text-[#6E6E6E] group-hover:scale-110 group-hover:text-[#D87093]"
              )}
            />
            {!collapsed && <span className="truncate animate-in fade-in duration-300">{item.label}</span>}
            
            {/* Focus Outline for Accessibility */}
            <span className="absolute inset-0 rounded-xl ring-2 ring-[#D87093] ring-offset-2 ring-offset-transparent opacity-0 group-focus-visible:opacity-100 pointer-events-none transition-opacity" />
          </Link>
        );
      })}
    </nav>
  );
}
