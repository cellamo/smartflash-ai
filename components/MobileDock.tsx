// components/MobileDock.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, BookOpen, Bot, Plus, User, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const NAV_ITEMS = [
  { href: "/app", icon: Home, label: "Dashboard" },
  { href: "/study", icon: BookOpen, label: "Study" },
  { href: "/decks", icon: Plus, label: "Add Word", special: true },
  { href: "/chat", icon: Bot, label: "AI Chat" },
  { href: "/profile", icon: User, label: "Profile", dropdown: true },
];

export function MobileDock() {
  const pathname = usePathname();
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const handleNavigation = (href: string) => {
    if (href === '/profile' && pathname.startsWith('/study')) {
      router.push(`${href}?refresh=true`);
    } else {
      router.push(href);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-secondary lg:hidden">
      <div className="flex justify-around items-center h-16 relative">
        {NAV_ITEMS.map((item) => (
          item.dropdown ? (
            <DropdownMenu key={item.label}>
              <DropdownMenuTrigger className="flex flex-col items-center justify-center w-full h-full">
                <item.icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{item.label}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onSelect={() => handleNavigation('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              key={item.label}
              type="button"
              onClick={() => handleNavigation(item.href)}
              className={`inline-flex flex-col items-center justify-center w-full h-full ${
                item.special ? "special-add-button" : ""
              } ${
                !item.special && pathname === item.href
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              }`}
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
            </button>
          )
        ))}
      </div>
    </nav>
  );
}