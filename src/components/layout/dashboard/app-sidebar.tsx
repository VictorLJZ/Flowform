"use client"

import * as React from "react"
import {
  FileText,
  ClipboardList,
  LayoutDashboard,
  FolderPlus,
  Plus
} from "lucide-react"
import { useWorkspaceStore } from "@/stores/workspaceStore"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils";

import { NavMain } from "@/components/dashboard/navigation/nav-main"
import { NavUser } from "@/components/dashboard/navigation/nav-user"
import { WorkspaceSwitcher } from "@/components/dashboard/navigation/workspace-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar"
import { useAuthSession } from "@/hooks/useAuthSession"
import { useRecentForms } from "@/hooks/useRecentForms"

// FlowForm application data
const data = {
  teams: [
    {
      name: "My Forms",
      logo: FileText,
      plan: "Free",
    },
    {
      name: "Team Forms",
      logo: FolderPlus,
      plan: "Pro",
    },
    {
      name: "Templates",
      logo: ClipboardList,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [],
      isDynamicDropdown: true,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading, error } = useAuthSession();
  const { state: sidebarState } = useSidebar();
  const isCollapsed = sidebarState === "collapsed";
  const { recentForms } = useRecentForms();

  if (isLoading) {
     return null;
  }
  if (error) {
     console.error("Error fetching auth session in AppSidebar:", error);
     return null;
  }

  const userData = user ? {
    name: user.user_metadata?.name || 
          user.user_metadata?.full_name || 
          user.email?.split('@')[0] || 
          'User',
    email: user.email || '',
    avatar: user.user_metadata?.picture || 
           user.user_metadata?.avatar_url || 
           undefined
  } : {
    name: "Guest",
    email: "",
    avatar: undefined
  };

  // Prepare dynamic items for NavMain
  const processedNavMain = data.navMain.map(item => {
    if (item.isDynamicDropdown && item.title === "Dashboard") {
      return {
        ...item,
        items: recentForms.map(form => ({
          title: form.title || 'Untitled Form',
          url: `/dashboard/builder/${form.form_id}`,
        })),
      };
    }
    return item;
  });

  // Handle form creation
  const handleCreateForm = async () => {
    // Get current workspace ID from the workspace store
    const currentWorkspaceId = useWorkspaceStore.getState().currentWorkspaceId;
    
    if (!currentWorkspaceId) {
      console.error('No current workspace selected');
      toast({
        variant: "destructive",
        title: "No workspace selected",
        description: "Please select a workspace to create a form."
      });
      return;
    }
    
    try {
      // Show loading state (if needed)
      
      // Authorization will be handled by the API using the session
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: currentWorkspaceId
        })
      });

      const { form_id, error } = await response.json();
      
      if (error) {
        console.error('Error creating form:', error);
        toast({
          variant: "destructive",
          title: "Error creating form",
          description: error || "An unexpected error occurred"
        });
        return;
      }
      
      // Navigate to the newly created form using router for better client-side navigation
      // Note: We're preserving the existing method of navigation to ensure consistency
      window.location.href = `/dashboard/builder/${form_id}`;
    } catch (error) {
      console.error('Failed to create form:', error);
      toast({
        variant: "destructive",
        title: "Error creating form",
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    }
  };
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarContent className="flex flex-col gap-0">
        {/* Create Form section */}
        <SidebarGroup
          className={cn(
            !isCollapsed && "px-4"
          )}
        >
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleCreateForm}
                tooltip="Create Form"
                className="bg-primary hover:bg-primary/90 text-primary-foreground hover:text-primary-foreground justify-center"
              >
                {isCollapsed ? (
                  <Plus className="h-4 w-4 mx-auto" />
                ) : (
                  <span>Create Form</span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        
        {/* Main Navigation */}
        <NavMain items={processedNavMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
