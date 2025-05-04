"use client"

import { useState } from "react"
import { Filter, SortAsc, SortDesc, Users, Search } from "lucide-react"
import { WorkspaceRole } from "@/types/workspace-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface MembersHeaderProps {
  memberCount: number
  onFilterChange: (role: string | null) => void
  onSortChange: (sortBy: string) => void
  onSortDirectionChange: (direction: "asc" | "desc") => void
  onSearchChange: (query: string) => void
  onInviteClick: () => void
  isAdmin: boolean
  currentFilter: WorkspaceRole | null
  currentSort: string
  currentSortDirection: "asc" | "desc"
  searchQuery: string
}

export function MembersHeader({
  memberCount,
  onFilterChange,
  onSortChange,
  onSortDirectionChange,
  onSearchChange,
  onInviteClick,
  isAdmin,
  currentFilter,
  currentSort,
  currentSortDirection,
  searchQuery,
}: MembersHeaderProps) {
  const [showSearch, setShowSearch] = useState(false)
  
  // Map role values to display names
  const roleLabels: Record<WorkspaceRole, string> = {
    owner: "Owners",
    admin: "Admins",
    editor: "Editors",
    viewer: "Viewers",
  }
  
  // Toggle sort direction
  const handleSortDirectionToggle = () => {
    onSortDirectionChange(currentSortDirection === "asc" ? "desc" : "asc")
  }
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-5">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-muted-foreground" />
        <span className="font-medium">{memberCount} Members</span>
        
        {currentFilter && (
          <Badge variant="outline" className="ml-2 gap-1">
            {roleLabels[currentFilter] || currentFilter}
            <button 
              onClick={() => onFilterChange(null)} 
              className="ml-1 rounded-full hover:bg-muted p-0.5"
            >
              ×
            </button>
          </Badge>
        )}
      </div>
      
      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        {showSearch ? (
          <div className="relative w-full md:w-56">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search members..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              autoFocus
              onBlur={() => {
                if (!searchQuery) {
                  setShowSearch(false)
                }
              }}
            />
          </div>
        ) : (
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowSearch(true)}
          >
            <Search className="h-4 w-4" />
          </Button>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => onFilterChange(null)}>
                <span className={!currentFilter ? "font-medium" : ""}>All Members</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilterChange("owner" as WorkspaceRole)}>
                <span className={currentFilter === "owner" ? "font-medium" : ""}>Owners</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilterChange("admin" as WorkspaceRole)}>
                <span className={currentFilter === "admin" ? "font-medium" : ""}>Admins</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilterChange("editor" as WorkspaceRole)}>
                <span className={currentFilter === "editor" ? "font-medium" : ""}>Editors</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilterChange("viewer" as WorkspaceRole)}>
                <span className={currentFilter === "viewer" ? "font-medium" : ""}>Viewers</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              {currentSortDirection === "asc" ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => onSortChange("name")}>
                <span className={currentSort === "name" ? "font-medium" : ""}>Sort by Name</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange("role")}>
                <span className={currentSort === "role" ? "font-medium" : ""}>Sort by Role</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange("joined")}>
                <span className={currentSort === "joined" ? "font-medium" : ""}>Sort by Join Date</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSortDirectionToggle}>
              {currentSortDirection === "asc" ? "Ascending Order" : "Descending Order"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        

      </div>
    </div>
  )
}
