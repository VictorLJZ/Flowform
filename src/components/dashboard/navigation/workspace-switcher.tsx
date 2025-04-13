"use client"

import * as React from "react"
import { ChevronsUpDown, Plus, Building2, Loader2 } from "lucide-react"

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
  useSidebar,
} from "@/components/ui/sidebar"
import { useWorkspaceStore } from "@/stores/workspaceStore"
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

export function WorkspaceSwitcher() {
  const { isMobile } = useSidebar()
  const { currentWorkspace, workspaces, setCurrentWorkspace, fetchWorkspaces, isLoading, createWorkspace } = useWorkspaceStore()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newWorkspace, setNewWorkspace] = useState({ name: "", description: "" })

  // Log workspace information when component mounts or updates
  useEffect(() => {
    console.log("[DEBUG] WorkspaceSwitcher - Current workspace:", currentWorkspace);
    console.log("[DEBUG] WorkspaceSwitcher - Available workspaces:", workspaces);
  }, [currentWorkspace, workspaces])

  useEffect(() => {
    fetchWorkspaces()
  }, [fetchWorkspaces])

  const handleCreateWorkspace = async () => {
    if (!newWorkspace.name) return

    // Get userId from the store to confirm it's available
    const userId = useWorkspaceStore.getState().userId
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
      await createWorkspace(newWorkspace.name, newWorkspace.description)
      setCreateDialogOpen(false)
      setNewWorkspace({ name: "", description: "" })
      toast({
        title: "Success",
        description: "Workspace created successfully"
      })
    } catch (error) {
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
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : currentWorkspace?.logo_url ? (
                    <img 
                      src={currentWorkspace.logo_url} 
                      alt={currentWorkspace.name} 
                      className="size-4 rounded"
                    />
                  ) : (
                    <Building2 className="size-4" />
                  )}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {isLoading ? "Loading..." : currentWorkspace?.name || "Select Workspace"}
                  </span>
                  <span className="truncate text-xs">Free Plan</span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Workspaces
              </DropdownMenuLabel>
              {isLoading ? (
                <DropdownMenuItem disabled className="gap-2 p-2">
                  <Loader2 className="size-4 animate-spin" />
                  Loading workspaces...
                </DropdownMenuItem>
              ) : workspaces.length === 0 ? (
                <DropdownMenuItem disabled className="gap-2 p-2">
                  No workspaces found
                </DropdownMenuItem>
              ) : (
                workspaces.map((workspace, index) => (
                  <DropdownMenuItem
                    key={workspace.id}
                    onClick={() => {
                      console.log("[DEBUG] WorkspaceSwitcher - Switching to workspace:", workspace);
                      setCurrentWorkspace(workspace);
                    }}
                    className="gap-2 p-2"
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border">
                      {workspace.logo_url ? (
                        <img 
                          src={workspace.logo_url} 
                          alt={workspace.name} 
                          className="size-3.5 rounded shrink-0"
                        />
                      ) : (
                        <Building2 className="size-3.5 shrink-0" />
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
