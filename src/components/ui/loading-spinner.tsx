"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type LoadingSpinnerProps = {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function LoadingSpinner({ 
  className, 
  size = "md" 
}: LoadingSpinnerProps) {
  const sizeClass = 
    size === "sm" ? "w-4 h-4" : 
    size === "lg" ? "w-10 h-10" : 
    "w-6 h-6"
  
  return (
    <Loader2 
      className={cn(
        "animate-spin text-primary",
        sizeClass,
        className
      )} 
    />
  )
}
