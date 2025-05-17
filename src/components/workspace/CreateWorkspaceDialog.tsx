"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/providers/auth-provider"
import { useWorkspace } from "@/hooks/useWorkspace"
import { UiWorkspace } from "@/types/workspace/UiWorkspace"

interface CreateWorkspaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateSuccess?: (workspace: UiWorkspace) => void
}

export function CreateWorkspaceDialog({ 
  open, 
  onOpenChange,
  onCreateSuccess
}: CreateWorkspaceDialogProps) {
  // Get workspace creation function from hook
  const { createWorkspace } = useWorkspace()
  
  // Auth context for user ID
  const { supabase } = useAuth()
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const { toast } = useToast()
  
  // Form state
  const [isCreating, setIsCreating] = useState(false)
  const [newWorkspace, setNewWorkspace] = useState({ name: "", description: "" })
  
  // Reset form when dialog is opened/closed
  useEffect(() => {
    if (!open) {
      // Small delay to avoid flashing empty form before dialog closes
      setTimeout(() => {
        setNewWorkspace({ name: "", description: "" })
      }, 100)
    }
  }, [open])
  
  // Get user ID on component mount
  useEffect(() => {
    const getUserId = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()
        if (error) {
          console.error('Error getting user:', error)
        } else {
          setUserId(data.user?.id || null)
        }
        setIsLoadingAuth(false)
      } catch (error) {
        console.error('Error getting user:', error)
        setIsLoadingAuth(false)
      }
    }
    
    getUserId()
  }, [supabase])

  // Create workspace handler
  const handleCreateWorkspace = async () => {
    if (!newWorkspace.name) return
    
    if (isLoadingAuth) {
      toast({ title: "Please wait", description: "Authentication in progress..." })
      return
    }
    
    if (!userId) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "User authentication required" 
      })
      return
    }
    
    try {
      setIsCreating(true)
      
      // Create workspace using our hook
      const created = await createWorkspace(newWorkspace.name, newWorkspace.description)
      
      // Close dialog
      onOpenChange(false)
      
      // Notify parent of success
      if (created && created.id && onCreateSuccess) {
        onCreateSuccess(created)
      }
      
      // Show success toast
      toast({ 
        title: "Success", 
        description: "Workspace created successfully!" 
      })
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Error creating workspace", 
        description: error instanceof Error ? error.message : "An unknown error occurred" 
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white w-full max-w-[480px] p-7 shadow-lg rounded-xl border border-gray-200">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-2xl font-bold">Create workspace</DialogTitle>
          <DialogDescription className="text-gray-500 mt-2 text-base">
            Add a new workspace to organize your forms and collaborate with others.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-2">
          <div className="grid gap-3 mb-4">
            <Label htmlFor="name" className="text-base font-semibold">Name</Label>
            <Input
              id="name"
              placeholder="Enter workspace name"
              value={newWorkspace.name}
              onChange={(e) => setNewWorkspace(prev => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-lg px-4 py-2.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid gap-3">
            <Label htmlFor="description" className="text-base font-semibold">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter workspace description (optional)"
              value={newWorkspace.description}
              onChange={(e) => setNewWorkspace(prev => ({ ...prev, description: e.target.value }))}
              className="w-full min-h-[120px] rounded-lg px-4 py-2.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <DialogFooter className="mt-8 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
            className="rounded-lg px-6 py-3 text-sm font-medium h-10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateWorkspace}
            disabled={!newWorkspace.name || isCreating}
            className="rounded-lg px-6 py-3 text-sm font-medium h-10"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create workspace"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
