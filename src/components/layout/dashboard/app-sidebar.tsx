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
  Users
} from "lucide-react"

import { NavMain } from "@/components/dashboard/navigation/nav-main"
import { NavProjects } from "@/components/dashboard/navigation/nav-projects"
import { NavUser } from "@/components/dashboard/navigation/nav-user"
import { WorkspaceSwitcher } from "@/components/dashboard/navigation/workspace-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
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
      title: "My Forms",
      url: "/dashboard/forms",
      icon: FileText,
      items: [], // Empty array means no dropdown menu
    },
    {
      title: "Create a Form",
      url: "#create-form", // Special URL that will be handled via client action
      icon: PlusCircle,
      action: "create-form", // Flag to indicate this should trigger an action, not navigation
      items: [], // Empty array means no dropdown menu
    },
    {
      title: "Data Analysis",
      url: "/dashboard/data-analysis",
      icon: BarChart,
      items: [], // Empty array means no dropdown menu
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
      items: [
        {
          title: "Account",
          url: "/dashboard/settings/account",
        },
        {
          title: "Appearance",
          url: "/dashboard/settings/appearance",
        },
        {
          title: "Notifications",
          url: "/dashboard/settings/notifications",
        },
        {
          title: "Integrations",
          url: "/dashboard/settings/integrations",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Recent Forms",
      url: "/dashboard/forms/recent",
      icon: FileText,
    },
    {
      name: "Shared With Me",
      url: "/dashboard/forms/shared",
      icon: Users,
    },
    {
      name: "Form Library",
      url: "/dashboard/forms/library",
      icon: Database,
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


  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
