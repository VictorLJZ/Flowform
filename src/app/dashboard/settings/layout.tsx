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

const tabs = [
  { name: "General", href: "/dashboard/settings" },
  { name: "Team", href: "/dashboard/settings/team" },
  { name: "Integrations", href: "/dashboard/settings/integrations" },
  { name: "Billing", href: "/dashboard/settings/billing" },
  { name: "Usage", href: "/dashboard/settings/usage" },
  { name: "Audit Logs", href: "/dashboard/settings/audit" },
  { name: "Legal Documents", href: "/dashboard/settings/legal" },
]

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname()
  
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
                <BreadcrumbLink href="/dashboard">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="truncate font-medium">
                  Organization Settings
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
                (tab.href !== "/dashboard/settings" && pathname.startsWith(tab.href))
                
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
