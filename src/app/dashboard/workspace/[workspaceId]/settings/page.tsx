"use client"

import { useCurrentWorkspace } from "@/hooks/useCurrentWorkspace"
import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useWorkspaceDeletion } from "@/hooks/useWorkspaceDeletion"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

interface WorkspaceParams {
  workspaceId: string
}

interface WorkspaceSettingsPageProps {
  params: Promise<WorkspaceParams>
}

export default function WorkspaceSettingsPage({ params: paramsPromise }: WorkspaceSettingsPageProps) {
  // Use React.use() to unwrap the params Promise
  const params = use(paramsPromise) as WorkspaceParams
  const { workspaceId } = params
  const router = useRouter()
  const { workspace, isLoading, rename } = useCurrentWorkspace(workspaceId)
  const { deleteWorkspace } = useWorkspaceDeletion()
  const [name, setName] = useState<string>(workspace?.name || "")
  const [description, setDescription] = useState<string>(workspace?.description || "")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  // Update form values when workspace loads
  useEffect(() => {
    if (workspace) {
      setName(workspace.name || "")
      setDescription(workspace.description || "")
    }
  }, [workspace])

  const handleSave = async () => {
    try {
      if (workspace) {
        await rename(name)
        // Additional fields would be saved in a similar way
        toast({
          title: "Settings updated",
          description: "Your organization settings have been saved.",
        })
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Failed to update settings",
        description: "There was an error updating your settings. Please try again.",
        variant: "destructive",
      })
    }
  }
  
  const handleDeleteWorkspace = async () => {
    if (!workspaceId || !workspace) return;
    
    try {
      setIsDeleting(true);
      
      // Use our enhanced deleteWorkspace function
      const result = await deleteWorkspace(workspaceId);
      
      if (result.success) {
        // Navigate to the workspace index after deletion
        router.push('/dashboard/workspace');
        
        toast({
          title: "Organization deleted",
          description: "Your organization has been permanently deleted."
        });
      } else {
        throw new Error("Failed to delete workspace");
      }
    } catch (error) {
      console.error('Error deleting workspace:', error);
      toast({
        title: "Failed to delete organization",
        description: "There was an error deleting your organization. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  // Removed copyToClipboard function as slug section is no longer needed

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">General settings</h1>
      
      <div className="space-y-8">
        {/* Organization Name */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium">Organization name</h2>
          <div className="space-y-2">
            <Label htmlFor="org-name">Name</Label>
            <Input 
              id="org-name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="FlowForm"
              className="max-w-md"
            />
          </div>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-lg font-medium">Organization description</h2>
          <div className="space-y-2">
            <Label htmlFor="org-description">Description</Label>
            <Textarea
              id="org-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your organization"
              className="max-w-md"
            />
          </div>
        </div>
        
        <div className="pt-6 flex justify-end">
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
      
      <div className="mt-20 border rounded-md p-6 bg-destructive/5 border-destructive/20">
        <h2 className="text-lg font-semibold text-destructive mb-4">DANGER ZONE</h2>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="font-medium">Deleting this organization will also remove its projects</h3>
              <p className="text-sm text-muted-foreground">Make sure you have made a backup of your projects if you want to keep your data</p>
            </div>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete organization"
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the organization 
              <strong> {workspace?.name}</strong> and all associated projects, forms, and data.
              <br /><br />
              If this is your last workspace, a new default workspace will be created for you automatically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteWorkspace} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete organization"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
