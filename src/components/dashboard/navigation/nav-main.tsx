"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useWorkspaces } from "@/hooks/useWorkspaces"
import { useRecentForms } from "@/hooks/useRecentForms"
import { Button } from "@/components/ui/button"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    action?: string
    isDynamic?: boolean
    items?: {
      id: string;
      title: string;
      url: string;
    }[];
  }[]
}) {
  const router = useRouter();
  const { workspaces } = useWorkspaces();
  
  // Fetch recent forms for the dropdown
  const { recentForms, isLoading: formsLoading } = useRecentForms(5);
  
  // Handle action items like form creation
  const handleAction = async (action: string) => {
    if (action === 'create-form') {
      const workspaceId = workspaces?.[0]?.id;
      if (!workspaceId) {
        toast({ title: "No workspace selected", description: "Please select a workspace first.", variant: "destructive" });
        return;
      }
      try {
        const response = await fetch('/api/forms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workspace_id: workspaceId }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error creating form:', errorData.error || response.statusText);
          toast({ title: "Error", description: errorData.error || response.statusText, variant: "destructive" });
          return;
        }
        const { form_id } = await response.json();
        router.push(`/dashboard/forms/builder/${form_id}`);
      } catch (error) {
        console.error('Failed to create form:', error);
        toast({ title: "Error", description: "Failed to create form", variant: "destructive" });
      }
    }
  };
  
  return (
    <SidebarGroup>
      <SidebarGroupLabel>FlowForm</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // For dynamic items (like Recent Forms), populate the items array
          const processedItem = { ...item };
          
          if (item.isDynamic && item.title === "Recent Forms") {
            // Dynamic Recent Forms section
            processedItem.items = recentForms?.map(form => ({
              id: form.form_id,
              title: form.title || "Untitled Form", 
              url: `/dashboard/forms/builder/${form.form_id}`
            })) || [];
            
            // Add a message if no forms or still loading
            if (formsLoading) {
              processedItem.items = [{ id: "loading-placeholder", title: "Loading...", url: "#" }];
            } else if (processedItem.items.length === 0) {
              processedItem.items = [{ id: "no-recent-forms-placeholder", title: "No recent forms", url: "#" }];
            }
          }
          
          // Check if the item has subitems
          const hasSubItems = processedItem.items && processedItem.items.length > 0;
          
          // We always use the Collapsible component for consistency
          // but use different content inside based on whether it has subitems
          return (
            <Collapsible
              key={processedItem.title}
              asChild
              defaultOpen={processedItem.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                {!hasSubItems ? (
                  // Direct link but wrapped in CollapsibleTrigger for consistency
                  <CollapsibleTrigger asChild>
                    {processedItem.action === 'create-form' ? (
                      <div className="w-full px-3 py-2">
                        <Button 
                          className="w-full justify-start"
                          onClick={() => handleAction(processedItem.action!)}
                        >
                          {processedItem.icon && <processedItem.icon className="mr-2 h-4 w-4" />}
                          {processedItem.title}
                        </Button>
                      </div>
                    ) : processedItem.action ? (
                      <SidebarMenuButton 
                        className="cursor-pointer"
                        tooltip={processedItem.title}
                        onClick={() => handleAction(processedItem.action!)}
                      >
                        {processedItem.icon && <processedItem.icon />}
                        <span>{processedItem.title}</span>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton asChild tooltip={processedItem.title}>
                        <Link href={processedItem.url} className="flex w-full items-center gap-2">
                          {processedItem.icon && <processedItem.icon />}
                          <span>{processedItem.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </CollapsibleTrigger>
                ) : (
                  // Regular dropdown trigger
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={processedItem.title}>
                        {processedItem.icon && <processedItem.icon />}
                        <span>{processedItem.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {processedItem.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.id}>
                            <SidebarMenuSubButton asChild>
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                )}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
