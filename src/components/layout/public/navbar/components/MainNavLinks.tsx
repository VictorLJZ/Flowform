"use client"

import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { cn } from "@/lib/utils"
import { NavItem } from '@/data/navigation'

interface MainNavLinksProps {
  navItems: NavItem[];
  activeMenu: string | null;
  setActiveMenu: (menu: string | null) => void;
}

export function MainNavLinks({ navItems, activeMenu, setActiveMenu }: MainNavLinksProps) {
  return (
    <div className="hidden md:flex items-center justify-center">
      <ul className="flex space-x-1">
        {navItems.map((item) => (
          <li key={item.title} className="relative">
            {item.sections && item.sections.length > 0 ? (
              <div
                onMouseEnter={() => setActiveMenu(item.title)}
                onClick={() => setActiveMenu(activeMenu === item.title ? null : item.title)}
                className={cn(
                  "group inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
                  activeMenu === item.title 
                    ? "bg-gray-100/50 text-gray-900" 
                    : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                {item.title}
                <ChevronDown
                  className={cn(
                    "relative top-[1px] ml-1 h-3 w-3 transition duration-200",
                    activeMenu === item.title ? "rotate-180" : ""
                  )}
                  aria-hidden="true"
                />
              </div>
            ) : (
              <Link 
                href={item.href || "#"} 
                className="group inline-flex h-10 items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                {item.title}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}