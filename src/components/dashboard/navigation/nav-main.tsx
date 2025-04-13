"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { useRouter } from "next/navigation"

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
import { useWorkspaceStore } from "@/stores/workspaceStore"
import { toast } from "@/components/ui/use-toast"

// Function to create a new form via API
async function createNewForm() {
  try {
    // Get the current workspace from the store
    const currentWorkspace = useWorkspaceStore.getState().currentWorkspace;
    console.log("[DEBUG] createNewForm - Current workspace from store:", currentWorkspace);
    
    // Get all workspaces from store for debugging
    const allWorkspaces = useWorkspaceStore.getState().workspaces;
    console.log("[DEBUG] createNewForm - All workspaces from store:", allWorkspaces);
    
    if (!currentWorkspace?.id) {
      toast({
        title: "No workspace selected",
        description: "Please select a workspace before creating a form",
        variant: "destructive"
      });
      return null;
    }
    
    // Log the workspace ID being sent to the API
    console.log("[DEBUG] createNewForm - Sending workspace_id to API:", currentWorkspace.id);
    
    // Use the current workspace ID from the store
    // The middleware will automatically add the auth token to the request
    const response = await fetch('/api/forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        workspace_id: currentWorkspace.id
      })
    });
    
    // Check for response status first
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error creating form:', errorData.error || response.statusText);
      return null;
    }
    
    const { form_id } = await response.json();
    return form_id;
  } catch (error) {
    console.error('Failed to create form:', error);
    return null;
  }
}

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    action?: string
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const router = useRouter();
  
  // Handle action items like form creation
  const handleAction = async (action: string) => {
    if (action === 'create-form') {
      // Call API to create a form, then navigate
      const formId = await createNewForm();
      if (formId) {
        router.push(`/dashboard/forms/builder/${formId}`);
      }
    }
  };
  
  return (
    <SidebarGroup>
      <SidebarGroupLabel>FlowForm</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // Check if the item has subitems
          const hasSubItems = item.items && item.items.length > 0;
          
          // We always use the Collapsible component for consistency
          // but use different content inside based on whether it has subitems
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                {!hasSubItems ? (
                  // Direct link but wrapped in CollapsibleTrigger for consistency
                  <CollapsibleTrigger asChild>
                    {item.action ? (
                      <SidebarMenuButton 
                        tooltip={item.title}
                        onClick={() => handleAction(item.action!)}
                      >
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <Link href={item.url} className="flex w-full items-center gap-2">
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </CollapsibleTrigger>
                ) : (
                  // Regular dropdown trigger
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
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
