"use client"

import * as React from "react"
import {
  FileText,
  ClipboardList,
  LayoutDashboard,
  Settings,
  PlusCircle,
  BarChart,
  FolderPlus,
  Database,
  Users,
  Image,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"

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
      items: [], // No dropdown, direct link to dashboard overview
    },
    {
      title: "Media Management",
      url: "/dashboard/media/test",
      icon: Image,
      items: [], // Empty array means no dropdown menu
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
      items: [], // No dropdown, direct link to settings page
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading, error } = useAuthSession();

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


  // Handle form creation
  const handleCreateForm = async () => {
    const workspaceId = user?.user_metadata?.current_workspace_id;
    if (!workspaceId) {
      console.error('No current workspace selected');
      return;
    }
    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: workspaceId
        })
      });

      const { form_id, error } = await response.json();
      if (error) {
        console.error('Error creating form:', error);
        return;
      }
      
      // Navigate to the newly created form
      window.location.href = `/dashboard/forms/builder/${form_id}`;
    } catch (error) {
      console.error('Failed to create form:', error);
    }
  };
  
  // Get sidebar state
  const { state: sidebarState } = useSidebar();
  const isCollapsed = sidebarState === "collapsed";
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarContent className="flex flex-col gap-0">
        {/* Create Form section */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleCreateForm}
                tooltip="Create Form"
                className="bg-primary hover:bg-primary/90 text-primary-foreground justify-center"
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
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
