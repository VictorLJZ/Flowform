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
      url: "/dashboard/builder/new",
      icon: PlusCircle,
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
