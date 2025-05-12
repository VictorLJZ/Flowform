"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ApiWorkspace } from "@/types/workspace"
import { Edit, Save, X } from "lucide-react"

interface RenameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspace: ApiWorkspace | null
  onRename: (workspaceId: string, name: string) => Promise<void>
}

export function RenameDialog({
  open,
  onOpenChange,
  workspace,
  onRename
}: RenameDialogProps) {
  const [name, setName] = useState(workspace?.name || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open && workspace) {
      setName(workspace.name)
      setError(null)
    }
  }, [open, workspace])

  const handleRename = async () => {
    if (!workspace) return
    if (!name.trim()) {
      setError("Workspace name cannot be empty")
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      await onRename(workspace.id, name.trim())
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rename workspace")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[450px] bg-background border shadow-lg rounded-lg p-6">
        <DialogHeader className="space-y-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Edit className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl font-semibold">Rename Workspace</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Enter a new name for your workspace. This will be visible to all workspace members.
          </DialogDescription>
        </DialogHeader>
        <div className="py-6 border-y my-4">
          <div className="space-y-5">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm font-medium">Workspace Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter workspace name"
                disabled={isLoading}
                className="focus-visible:ring-primary"
                autoFocus
              />
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive mt-2">
                  <X className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>
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
            onClick={handleRename}
            disabled={isLoading || !name.trim()}
            className="min-w-[140px] gap-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Saving...
              </span>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
