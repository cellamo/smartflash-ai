import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function GradientButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      className={cn(
        "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white",
        className
      )}
      {...props}
    />
  )
}
