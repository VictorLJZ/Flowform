"use client"

import { useWorkspaceStore } from "@/stores/workspaceStore"
import { useCurrentWorkspace } from "@/hooks/useCurrentWorkspace"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"

export default function GeneralSettings() {
  const { currentWorkspaceId } = useWorkspaceStore()
  const { workspace, isLoading, rename } = useCurrentWorkspace(currentWorkspaceId)
  const [name, setName] = useState<string>(workspace?.name || "")
  const [description, setDescription] = useState<string>(workspace?.description || "")
  const [slug, setSlug] = useState<string>(workspace?.id || "") // Using ID instead of slug
  const [copied, setCopied] = useState(false)
  const [optInAnalytics, setOptInAnalytics] = useState(false)
  const { toast } = useToast()

  // Update form values when workspace loads
  useEffect(() => {
    if (workspace) {
      setName(workspace.name || "")
      setDescription(workspace.description || "")
      setSlug(workspace.id || "") // Using ID instead of slug
      setOptInAnalytics(!!workspace.settings?.analytics_opt_in)
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(slug)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
          <h2 className="text-lg font-medium">Organization slug</h2>
          <div className="space-y-2">
            <Label htmlFor="org-slug">Slug</Label>
            <div className="flex max-w-md">
              <Input 
                id="org-slug" 
                value={slug}
                readOnly
                className="rounded-r-none"
              />
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-l-none border-l-0"
                onClick={copyToClipboard}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              By opting into sending anonymous data, Supabase AI can improve the answers it shows you. This is an organization-wide setting.
            </p>
          </div>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-lg font-medium">Data collection</h2>
          <div className="flex items-center space-x-2">
            <Switch 
              id="analytics-opt-in" 
              checked={optInAnalytics}
              onCheckedChange={(checked) => setOptInAnalytics(checked)}
            />
            <Label htmlFor="analytics-opt-in">Opt-in to sending anonymous data to OpenAI</Label>
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
