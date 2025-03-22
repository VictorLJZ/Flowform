"use client"

import * as React from "react"
import {
  FileText,
  ClipboardList,
  LayoutDashboard,
  Settings,
  PlusCircle,
  Inbox,
  BarChart,
  FolderPlus,
  ListTodo,
  Database,
  Users
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// FlowForm application data
const data = {
  user: {
    name: "User",
    email: "user@example.com",
    avatar: "/avatars/user.jpg",
  },
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
      items: [
        {
          title: "Overview",
          url: "/dashboard",
        },
        {
          title: "Analytics",
          url: "/dashboard/analytics",
        },
      ],
    },
    {
      title: "Forms",
      url: "/dashboard/forms",
      icon: FileText,
      items: [
        {
          title: "My Forms",
          url: "/dashboard/forms/my",
        },
        {
          title: "Team Forms",
          url: "/dashboard/forms/team",
        },
        {
          title: "Templates",
          url: "/dashboard/forms/templates",
        },
      ],
    },
    {
      title: "Builder",
      url: "/dashboard/builder",
      icon: PlusCircle,
      items: [
        {
          title: "Create New Form",
          url: "/dashboard/builder/new",
        },
        {
          title: "AI Assistant",
          url: "/dashboard/builder/ai",
        },
        {
          title: "Advanced Editor",
          url: "/dashboard/builder/advanced",
        },
      ],
    },
    {
      title: "Responses",
      url: "/dashboard/responses",
      icon: Inbox,
      items: [
        {
          title: "All Responses",
          url: "/dashboard/responses/all",
        },
        {
          title: "Data Analysis",
          url: "/dashboard/responses/analysis",
        },
        {
          title: "Export",
          url: "/dashboard/responses/export",
        },
      ],
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
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
