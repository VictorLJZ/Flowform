"use client"

import { useState, useEffect } from 'react'
import { cn } from "@/lib/utils"
import { useAuthSession } from '@/hooks/useAuthSession'
import { useAuth } from '@/providers/auth-provider'
import { transformToUserType } from '@/services/auth/verifiedAuth'

// Import our navigation data
import { navItems } from '@/data/navigation'

// Import our modularized components
import { NavLogo } from '../public/navbar/components/NavLogo'
import { MainNavLinks } from '../public/navbar/components/MainNavLinks'
import { MegaDropdown } from '../public/navbar/components/MegaDropdown'
import { UserMenuSection } from '../public/navbar/components/UserMenuSection'
import { NavbarStyles } from '../public/navbar/components/navbarStyles'

export default function MegaNavbar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuTimeoutId, setMenuTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const { session, isLoggedOut } = useAuthSession();
  const { signOut } = useAuth();
  
  // Only set user data if we have a valid session and not logged out
  const user = !isLoggedOut && session?.user ? session.user : null;

  useEffect(() => {
    return () => {
      if (menuTimeoutId) clearTimeout(menuTimeoutId);
    };
  }, [menuTimeoutId]);

  return (
    <>
      <nav className="fixed top-0 w-full bg-white z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 items-center h-16">
            {/* Left - Logo */}
            <NavLogo />

            {/* Center - Main navigation */}
            <MainNavLinks 
              navItems={navItems}
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
            />

            {/* Right - Auth buttons / User Menu */}
            <UserMenuSection user={transformToUserType(user)} signOut={signOut} />
          </div>
        </div>

        {/* Mega menu dropdown */}
        <MegaDropdown 
          activeMenu={activeMenu}
          navItems={navItems}
          setActiveMenu={setActiveMenu}
          setMenuTimeoutId={setMenuTimeoutId}
        />
      </nav>
      
      {/* Semi-transparent overlay for when menu is open */}
      <div 
        className={cn(
          "fixed inset-0 bg-black transition-all duration-300 z-40",
          activeMenu 
            ? "bg-opacity-15 backdrop-blur-[1px] pointer-events-auto" 
            : "bg-opacity-0 backdrop-blur-none pointer-events-none"
        )}
        onMouseEnter={() => setActiveMenu(null)}
      />
      
      {/* Space for fixed navbar */}
      <div className="h-16"></div>

      {/* Import global styles for animations */}
      <NavbarStyles />
    </>
  );
}
