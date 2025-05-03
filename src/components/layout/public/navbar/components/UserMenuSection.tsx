"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { LogOut, LayoutDashboard } from 'lucide-react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserMenuSectionProps {
  user: any | null;
  signOut: () => void;
}

export function UserMenuSection({ user, signOut }: UserMenuSectionProps) {
  const router = useRouter();

  const getInitials = (email?: string) => {
    if (!email) return "U";
    const parts = email.split('@')[0].split(/[._-]/);
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };
  
  return (
    <div className="flex items-center justify-end space-x-4">
      {user ? (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={user.user_metadata?.avatar_url || undefined} 
                  alt={user.email || "User Avatar"} 
                />
                <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Logged in as</p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/dashboard')}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <>
          <Button 
            variant="ghost" 
            className="text-gray-600 hover:text-gray-900"
            onClick={() => router.push('/login')}
          >
            Log in
          </Button>
          <Button 
            className="bg-primary text-white hover:bg-primary/90"
            onClick={() => router.push('/signup')}
          >
            Sign up
          </Button>
        </>
      )}
    </div>
  );
}