"use client"

import * as React from "react"
import { ChevronsUpDown, Plus, Building2, Loader2 } from "lucide-react"
import Image from 'next/image'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useWorkspaces } from "@/hooks/useWorkspaces"
import { useCurrentWorkspace } from "@/hooks/useCurrentWorkspace"
import { useEffect, useState } from "react"
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
import { toast } from "@/components/ui/use-toast"
import { useAuthSession } from "@/hooks/useAuthSession"
import { useWorkspaceSwitcher } from "@/hooks/useWorkspaceSwitcher"
import { createWorkspace } from "@/services/workspace/client"
import { useWorkspaceStore } from "@/stores/workspaceStore"

export function WorkspaceSwitcher() {
  const { workspaces, isLoading: isLoadingWorkspaces, mutate: mutateWorkspaces } = useWorkspaces()
  const { currentWorkspaceId, switchToWorkspace } = useWorkspaceSwitcher()
  const addWorkspace = useWorkspaceStore(state => state.addWorkspace)

  const { user, isLoading: isLoadingAuth } = useAuthSession()
  const userId = user?.id

  useEffect(() => {
    if (currentWorkspaceId === null && workspaces.length > 0 && !isLoadingWorkspaces) {
      console.log("[WorkspaceSwitcher] No workspace selected in store, setting initial:", workspaces[0].id);
      switchToWorkspace(workspaces[0].id);
    }
  }, [workspaces, currentWorkspaceId, isLoadingWorkspaces, switchToWorkspace])

  const { workspace: currentWorkspace, isLoading: isLoadingCurrentWorkspace } = useCurrentWorkspace(currentWorkspaceId)

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newWorkspace, setNewWorkspace] = useState({ name: "", description: "" })

  const handleCreateWorkspace = async () => {
    if (!newWorkspace.name) return
    if (isLoadingAuth) {
      toast({ title: "Please wait", description: "Authentication in progress..." })
      return
    }
    if (!userId) {
      toast({ variant: "destructive", title: "Error", description: "User authentication required" })
      return
    }
    try {
      setIsCreating(true)
      
      // Create the workspace in the database
      const created = await createWorkspace({ 
        name: newWorkspace.name, 
        description: newWorkspace.description, 
        created_by: userId, 
        logo_url: "", 
        settings: {} 
      })
      
      // Close dialog and reset form
      setCreateDialogOpen(false)
      setNewWorkspace({ name: "", description: "" })
      
      if (created && 'id' in created && created.id) {
        console.log("🔴🔴 [WorkspaceSwitcher] Successfully created workspace:", created.id);
        
        // Show success toast
        toast({ 
          title: "Success", 
          description: "Workspace created successfully. Redirecting..." 
        })
        
        // EXTREME SOLUTION: Use URL-based workspace selection
        // This completely bypasses all the normal workspace selection mechanisms
        // and forces the workspace selection through a URL parameter
        
        // Store the newly created workspace details in localStorage for the redirect to pick up
        localStorage.setItem('new_workspace_id', created.id);
        localStorage.setItem('new_workspace_redirect_time', Date.now().toString());
        
        // Store the complete workspace details to avoid race conditions
        // This ensures the provider can access the complete workspace data
        // even if the SWR cache hasn't been updated yet
        localStorage.setItem('new_workspace_details', JSON.stringify(created));
        
        // Update SWR cache to show the new workspace in the list
        await mutateWorkspaces(prev => {
          if (!prev) return [created];
          return [...prev, created];
        }, false);
        
        // Delay to show the toast
        setTimeout(() => {
          // Redirect to a special workspace selection URL
          // This will trigger a special handler in the workspace provider
          const currentUrl = new URL(window.location.href);
          const baseUrl = `${currentUrl.protocol}//${currentUrl.host}`;
          
          // Use a query parameter to force workspace selection
          const redirectUrl = `${baseUrl}/dashboard?force_workspace=${created.id}&t=${Date.now()}`;
          
          console.log("🔴🔴 [WorkspaceSwitcher] Redirecting to force workspace:", redirectUrl);
          
          // Redirect to the URL that will force the workspace selection
          window.location.href = redirectUrl;
        }, 1500);
      }
    } catch (error) {
      console.error("[WorkspaceSwitcher] Error creating workspace:", error);
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to create workspace" 
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  {isLoadingCurrentWorkspace ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : currentWorkspace?.logo_url ? (
                    <Image 
                      src={currentWorkspace.logo_url} 
                      alt={currentWorkspace.name} 
                      width={16}
                      height={16}
                      className="rounded"
                    />
                  ) : (
                    <Building2 className="size-4" />
                  )}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {isLoadingCurrentWorkspace ? "Loading..." : currentWorkspace?.name || "Select Workspace"}
                  </span>
                  <span className="truncate text-xs">Free Plan</span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-64 rounded-xl border p-2 shadow-xl"
              side="right" 
              align="start"
              sideOffset={8}
            >
              <DropdownMenuLabel className="px-2 py-1.5">My Workspaces</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isLoadingWorkspaces ? (
                 <DropdownMenuItem disabled className="gap-2 p-2">
                   <Loader2 className="mr-2 size-4 animate-spin" /> Loading...
                 </DropdownMenuItem>
              ) : (
                workspaces.map((workspace, index) => (
                  <DropdownMenuItem
                    key={workspace.id}
                    onClick={() => {
                      // Debug info
                      console.log(`[WorkspaceSwitcher] Workspace selected:`, { 
                        selected: workspace.id, 
                        current: currentWorkspaceId,
                        isSame: workspace.id === currentWorkspaceId
                      });
                      
                      // Use the dedicated hook for workspace switching
                      switchToWorkspace(workspace.id);
                      
                      // Close the dropdown menu after selection
                      const closeEvent = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                      });
                      document.dispatchEvent(closeEvent);
                    }}
                    className="gap-2 p-2"
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border">
                      {workspace.logo_url ? (
                        <Image 
                          src={workspace.logo_url} 
                          alt={workspace.name} 
                          width={14}
                          height={14}
                          className="rounded shrink-0"
                        />
                      ) : (
                        <Building2 className="size-3.5" />
                      )}
                    </div>
                    {workspace.name}
                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="gap-2 p-2"
                onClick={() => setCreateDialogOpen(true)}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">Add workspace</div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
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
              onClick={() => setCreateDialogOpen(false)}
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
    </>
  )
}
