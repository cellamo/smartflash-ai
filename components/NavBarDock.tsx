// components/NavBar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, BarChart2, Bot, Settings, User, LogOut, Package2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dock, DockIcon } from "@/components/magicui/dock";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/app", icon: Home, label: "Dashboard" },
  { href: "/study", icon: BookOpen, label: "Study" },
  { href: "/decks", icon: Package2, label: "Decks" },
  { href: "/progress", icon: BarChart2, label: "Progress" },
  { href: "/ai-assistant", icon: Bot, label: "AI Assistant" },
];

export function NavBarDock() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-auto hidden lg:flex h-16 items-center gap-4 border-b bg-background px-6">
      <TooltipProvider>
        <Dock
          direction="middle"
          className="bg-slate-200/50 dark:bg-slate-600/50 ml-auto"
          >
          {NAV_ITEMS.map((item) => (
            <DockIcon key={item.label}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon" }),
                      "size-12 rounded-full",
                      pathname === item.href &&
                        "relative after:absolute after:bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-primary"
                    )}
                  >
                    <item.icon className="size-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          ))}

          <Separator orientation="vertical" className="h-full py-2" />
          <DockIcon>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="size-10 cursor-pointer">
                      <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt="@shadcn"
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex justify-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <ModeToggle />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Theme</p>
                        </TooltipContent>
                      </Tooltip>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>
                <p>User Settings</p>
              </TooltipContent>
            </Tooltip>
          </DockIcon>
        </Dock>
      </TooltipProvider>
    </header>
  );
}
