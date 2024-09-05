"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

export function MobileThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenuItem onSelect={() => setTheme(theme === "light" ? "dark" : "light")}>
      {theme === "light" ? (
        <>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark mode</span>
        </>
      ) : (
        <>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light mode</span>
        </>
      )}
    </DropdownMenuItem>
  )
}
