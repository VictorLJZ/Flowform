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
import { toast } from "sonner"

export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const { currentWorkspace, workspaces, setCurrentWorkspace, fetchWorkspaces, isLoading, createWorkspace } = useWorkspaceStore()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newWorkspace, setNewWorkspace] = useState({ name: "", description: "" })

  useEffect(() => {
    fetchWorkspaces()
  }, [fetchWorkspaces])

  const handleCreateWorkspace = async () => {
    if (!newWorkspace.name) return

    try {
      setIsCreating(true)
      await createWorkspace(newWorkspace.name, newWorkspace.description)
      setCreateDialogOpen(false)
      setNewWorkspace({ name: "", description: "" })
      toast.success("Workspace created successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create workspace")
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
                    onClick={() => setCurrentWorkspace(workspace)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create workspace</DialogTitle>
            <DialogDescription>
              Add a new workspace to organize your forms and collaborate with others.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter workspace name"
                value={newWorkspace.name}
                onChange={(e) => setNewWorkspace(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter workspace description (optional)"
                value={newWorkspace.description}
                onChange={(e) => setNewWorkspace(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateWorkspace}
              disabled={!newWorkspace.name || isCreating}
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
