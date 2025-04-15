"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Check } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface CopyFieldProps {
  value: string
  className?: string
  readOnly?: boolean
  onCopy?: () => void
}

export function CopyField({ value, className, readOnly = true, onCopy }: CopyFieldProps) {
  const [copied, setCopied] = React.useState(false)
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      
      toast({
        description: "Copied to clipboard",
        duration: 2000,
      })
      
      if (onCopy) onCopy()
      
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
        duration: 2000,
      })
    }
  }
  
  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <div className="relative flex-1">
        <Input 
          value={value} 
          readOnly={readOnly}
          className={`pr-10 ${className}`}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
          onClick={copyToClipboard}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
