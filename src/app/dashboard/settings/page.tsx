"use client"

import { useWorkspaceStore } from "@/stores/workspaceStore"
import { useCurrentWorkspace } from "@/hooks/useCurrentWorkspace"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

export default function GeneralSettings() {
  const { currentWorkspaceId } = useWorkspaceStore()
  const { workspace, isLoading, rename } = useCurrentWorkspace(currentWorkspaceId)
  const [name, setName] = useState<string>(workspace?.name || "")
  const [description, setDescription] = useState<string>(workspace?.description || "")
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
      toast({
        title: "Failed to update settings",
        description: "There was an error updating your settings. Please try again.",
        variant: "destructive",
      })
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
            <Button variant="destructive" size="sm">Delete organization</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
