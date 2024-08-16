// components/MobileDock.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, BarChart2, Bot, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/app", icon: Home, label: "Dashboard" },
  { href: "/study", icon: BookOpen, label: "Study" },
  { href: "/decks", icon: Plus, label: "Add Word", special: true },
  { href: "/progress", icon: BarChart2, label: "Progress" },
  { href: "/chat", icon: Bot, label: "AI Chat" },
];

export function MobileDock() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-secondary lg:hidden">
      <div className="flex justify-around items-center h-16 relative">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full",
              item.special ? "special-add-button" : "",
              !item.special && pathname === item.href
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-primary hover:bg-primary/5"
            )}
          >
            {item.special ? (
              <div className="relative">
                <div className="absolute inset-0 bg-primary rounded-full animate-pulse"></div>
                <div className="relative z-10 bg-white rounded-full p-3 shadow-lg">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
              </div>
            ) : (
              <item.icon className="h-5 w-5 mb-1" />
            )}
            <span className={cn("text-xs", item.special ? "sr-only" : "")}>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}