// components/MobileDock.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, BarChart2, Bot, Package2 } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/app", icon: Home, label: "Dashboard" },
  { href: "/study", icon: BookOpen, label: "Study" },
  { href: "/decks", icon: Package2, label: "Decks" },
  { href: "/progress", icon: BarChart2, label: "Progress" },
  { href: "/ai-assistant", icon: Bot, label: "AI Assistant" },
];

export function MobileDock() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-secondary lg:hidden">
      <div className="flex justify-around items-center h-16">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full",
              pathname === item.href
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-primary hover:bg-primary/5"
            )}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
