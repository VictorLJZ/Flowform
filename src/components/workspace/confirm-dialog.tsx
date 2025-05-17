"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle, LogOut, Trash2 } from "lucide-react"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => Promise<void> | void
  isLoading?: boolean
  variant?: "default" | "destructive"
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  isLoading = false,
  variant = "default"
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error("Error in confirmation action:", error)
      // Error handling could be enhanced with toast notifications
    }
  }

  // Determine which icon to use based on the title/variant
  const getIcon = (inButton = false) => {
    if (title.toLowerCase().includes('delete')) {
      return <Trash2 className={`h-5 w-5 ${inButton && variant === "destructive" ? "text-white" : "text-destructive"}`} />
    } else if (title.toLowerCase().includes('leave')) {
      return <LogOut className={`h-5 w-5 ${inButton ? "text-white" : "text-primary"}`} />
    } else {
      return <AlertTriangle className={`h-5 w-5 ${inButton ? "text-white" : "text-warning"}`} />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[450px] bg-background border shadow-lg rounded-lg p-6">
        <DialogHeader className="space-y-4 pb-4">
          <div className="flex items-center gap-3">
            <div className={`${
              title.toLowerCase().includes('delete') ? "bg-destructive/10" : 
              title.toLowerCase().includes('leave') ? "bg-primary/10" : 
              "bg-warning/10"
            } p-2 rounded-full`}>
              {getIcon()}
            </div>
            <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="py-6 my-4 border-y">
          <p className="text-sm text-muted-foreground">
            {variant === "destructive" ? 
              "This action cannot be undone. Please confirm you want to proceed." : 
              "Please confirm to continue with this action."}
          </p>
        </div>
        <DialogFooter className="flex gap-3 pt-4 sm:justify-end">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
          <Button 
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isLoading}
            className="min-w-[140px] gap-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {getIcon(true)}
                {confirmLabel}
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
