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
import { useEffect, useState } from "react"
import { useAuth } from "@/providers/auth-provider"
import { useWorkspace } from "@/hooks/useWorkspace"
import { UiWorkspace } from "@/types/workspace/UiWorkspace"
import { CreateWorkspaceDialog } from "@/components/workspace/CreateWorkspaceDialog"

export function WorkspaceSwitcher() {
  // Use the new unified workspace hook
  const { 
    workspaces, 
    currentWorkspace, 
    selectWorkspace, 
    isWorkspaceLoading
  } = useWorkspace()

  // Auth context - we only need supabase client
  const { supabase } = useAuth()
  
  // We no longer need to fetch the session or track auth loading state
  // The user is already authenticated at this point by the auth provider

  // Auto-select first workspace if none is selected
  useEffect(() => {
    if (!currentWorkspace && workspaces.length > 0 && !isWorkspaceLoading()) {
      console.log("[WorkspaceSwitcher] No workspace selected in store, setting initial:", workspaces[0].id);
      selectWorkspace(workspaces[0].id);
    }
  }, [workspaces, currentWorkspace, isWorkspaceLoading, selectWorkspace])

  // UI state for the create dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  
  // Handle successful workspace creation
  const handleCreateSuccess = (workspace: UiWorkspace) => {
    console.log("[WorkspaceSwitcher] Successfully created workspace:", workspace.id);
    
    // The unified hook will update the store automatically,
    // so we just need to select the new workspace
    selectWorkspace(workspace.id);
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton aria-expanded={true} className="w-full justify-between space-x-2">
                {isWorkspaceLoading() ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    <span>Loading...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <div className="flex size-6 items-center justify-center rounded-md border">
                      {currentWorkspace?.logoUrl ? (
                        <Image 
                          src={currentWorkspace.logoUrl} 
                          alt={currentWorkspace.name || 'Workspace'} 
                          width={14}
                          height={14}
                          className="rounded shrink-0"
                        />
                      ) : (
                        <Building2 className="size-3.5" />
                      )}
                    </div>
                    <span className="truncate">{currentWorkspace?.name}</span>
                  </span>
                )}
                <ChevronsUpDown className="size-3.5 opacity-50" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={0} className="w-72">
              <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isWorkspaceLoading() ? (
                <div className="flex justify-center items-center py-6">
                  <Loader2 className="size-6 animate-spin" />
                </div>
              ) : (
                workspaces.map((workspace, index) => (
                  <DropdownMenuItem
                    key={workspace.id}
                    onClick={() => {
                      selectWorkspace(workspace.id)
                      // Close any open modals by sending a custom event
                      const closeEvent = new CustomEvent('closeDropdownMenus')
                      document.dispatchEvent(closeEvent);
                    }}
                    className="gap-2 p-2"
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border">
                      {workspace.logoUrl ? (
                        <Image 
                          src={workspace.logoUrl} 
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

      {/* Use our extracted CreateWorkspaceDialog component */}
      <CreateWorkspaceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateSuccess={handleCreateSuccess}
      />
    </>
  )
}
