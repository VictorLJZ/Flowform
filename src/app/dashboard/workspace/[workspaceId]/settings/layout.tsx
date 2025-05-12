"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"

interface SettingsLayoutProps {
  children: React.ReactNode
}

// Generate tab links dynamically based on workspaceId
const generateTabs = (workspaceId: string) => [
  { name: "General", href: `/dashboard/workspace/${workspaceId}/settings` },
  { name: "Team", href: `/dashboard/workspace/${workspaceId}/settings/team` },
  { name: "Integrations", href: `/dashboard/workspace/${workspaceId}/settings/integrations` },
  { name: "Billing", href: `/dashboard/workspace/${workspaceId}/settings/billing` },
  { name: "Usage", href: `/dashboard/workspace/${workspaceId}/settings/usage` },
  { name: "Audit Logs", href: `/dashboard/workspace/${workspaceId}/settings/audit` },
  { name: "Legal Documents", href: `/dashboard/workspace/${workspaceId}/settings/legal` },
]

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname()
  
  // Extract workspaceId from the pathname
  const workspaceIdMatch = pathname.match(/\/dashboard\/workspace\/([^\/]+)\/settings/)
  const workspaceId = workspaceIdMatch ? workspaceIdMatch[1] : ''
  
  // Generate tabs with the current workspaceId
  const tabs = generateTabs(workspaceId)
  
  return (
    <div className="flex flex-1 flex-col">
      <header className="relative flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={`/dashboard/workspace/${workspaceId}`}>
                  Workspace
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="truncate font-medium">
                  Settings
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      
      <div className="flex flex-col">
        <div className="border-b">
          <nav className="flex px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href || 
                (tab.href !== `/dashboard/workspace/${workspaceId}/settings` && pathname.startsWith(tab.href))
                
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={cn(
                    "flex items-center px-3 py-4 text-sm font-medium border-b-2 whitespace-nowrap",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.name}
                </Link>
              )
            })}
          </nav>
        </div>
        
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
