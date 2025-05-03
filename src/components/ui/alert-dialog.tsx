"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface AlertDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  )
}

interface AlertDialogContentProps {
  className?: string
  children?: React.ReactNode
}

export function AlertDialogContent({ className, children, ...props }: AlertDialogContentProps & React.HTMLAttributes<HTMLDivElement>) {
  return <DialogContent className={className} {...props}>{children}</DialogContent>
}

export function AlertDialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <DialogHeader className={className} {...props} />
}

export function AlertDialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <DialogFooter className={className} {...props} />
}

export function AlertDialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <DialogTitle className={className} {...props} />
}

export function AlertDialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <DialogDescription className={className} {...props} />
}

interface AlertDialogActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function AlertDialogAction({ className, children, variant = "default", ...props }: AlertDialogActionProps) {
  return (
    <Button variant={variant} className={className} {...props}>
      {children}
    </Button>
  )
}

export function AlertDialogCancel({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button variant="outline" className={className} {...props}>
      {children || "Cancel"}
    </Button>
  )
}
