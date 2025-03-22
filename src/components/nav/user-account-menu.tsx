"use client"

import { User } from "@supabase/supabase-js"
import { LogOut, User as UserIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/supabase/supabase_client"
import { useAuthStore } from "@/store/auth-store"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function UserAccountMenu({ user }: { user: User | null }) {
  const [userName, setUserName] = useState<string>("Traveller")
  // Create client outside of render to avoid dependency issues
  const supabaseClient = createClient()
  const router = useRouter()
  
  // Get user name from metadata
  useEffect(() => {
    if (user) {
      if (user.user_metadata?.full_name) {
        const fullName = user.user_metadata.full_name as string
        const firstName = fullName.split(' ')[0]
        setUserName(firstName)
      } else if (user.user_metadata?.name) {
        const fullName = user.user_metadata.name as string
        const firstName = fullName.split(' ')[0]
        setUserName(firstName)
      } else if (user.email) {
        // Use email prefix as fallback
        const emailPrefix = user.email.split('@')[0]
        setUserName(emailPrefix)
      }
    }
  }, [user])
  
  const signOut = async () => {
    try {
      await supabaseClient.auth.signOut()
      // Refresh the page to reset auth state
      window.location.reload()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }
  
  const goToDashboard = () => {
    router.push('/dashboard')
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 px-6 py-2 text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm font-sans border border-white/50"
          type="button"
        >
          <span className="leading-none">{userName}</span>
          <span className="text-white text-[10px] flex items-center">▼</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        className="mt-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 font-sans min-w-[150px]"
      >
        <DropdownMenuItem 
          className="flex items-center gap-2 cursor-pointer px-2 py-2 focus:bg-white/20 focus:text-white hover:bg-white/20 hover:text-white"
          onClick={goToDashboard}
        >
          <UserIcon className="h-4 w-4 text-white" />
          <span>My Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="flex items-center gap-2 cursor-pointer px-2 py-2 text-red-300 focus:bg-white/20 focus:text-red-300 hover:bg-white/20 hover:text-red-300"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4 text-white" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
