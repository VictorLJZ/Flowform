"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown, ChevronRight, LogOut, LayoutDashboard } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter } from 'next/navigation'
import { useAuthSession } from '@/hooks/useAuthSession'
import { useAuth } from '@/providers/auth-provider'
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

// Define the types for our navigation data
type NavItem = {
  title: string;
  href?: string;
  isOpen?: boolean;
  sections?: NavSection[];
}

type NavSection = {
  title: string;
  items: {
    title: string;
    description?: string;
    href: string;
  }[];
}

// Application-specific navigation items
const navItems: NavItem[] = [
  {
    title: "Products",
    sections: [
      {
        title: "TOOLS",
        items: [
          {
            title: "Product overview",
            description: "What is FlowForm?",
            href: "/products/overview",
          },
          {
            title: "FlowForm AI",
            description: "AI tools and features",
            href: "/products/ai",
          },
          {
            title: "Form builder",
            description: "Signups and orders",
            href: "/products/form-builder",
          },
          {
            title: "Survey maker",
            description: "Research and feedback",
            href: "/products/survey-maker",
          },
          {
            title: "Quiz maker",
            description: "Trivia and product match",
            href: "/products/quiz-maker",
          },
          {
            title: "Test maker",
            description: "Assessments and knowledge tests",
            href: "/products/test-maker",
          },
          {
            title: "Poll builder",
            description: "Opinions and preferences",
            href: "/products/poll-builder",
          },
        ],
      },
      {
        title: "NEWS",
        items: [
          {
            title: "FlowForm for Growth",
            description: "For B2B marketers",
            href: "/news/growth",
          },
          {
            title: "Product updates",
            description: "Last feature releases",
            href: "/news/updates",
          },
          {
            title: "Hubspot for FlowForm",
            description: "Our new partner",
            href: "/news/hubspot",
          },
          {
            title: "Sales and marketing misalignment",
            description: "Check out our latest ebook",
            href: "/news/sales-marketing",
          },
        ],
      },
      {
        title: "WORKFLOWS",
        items: [
          {
            title: "Free form, survey, and quiz templates",
            href: "/templates",
          },
        ],
      }
    ],
  },
  {
    title: "Solutions",
    sections: [
      {
        title: "TEAMS",
        items: [
          {
            title: "Marketing",
            href: "/solutions/teams/marketing",
          },
          {
            title: "Product",
            href: "/solutions/teams/product",
          },
          {
            title: "Human resources",
            href: "/solutions/teams/hr",
          },
          {
            title: "Customer success",
            href: "/solutions/teams/customer-success",
          },
          {
            title: "Business",
            href: "/solutions/teams/business",
          },
        ],
      },
      {
        title: "USE CASES",
        items: [
          {
            title: "Application form",
            href: "/solutions/use-cases/application",
          },
          {
            title: "Gather feedback",
            href: "/solutions/use-cases/feedback",
          },
          {
            title: "Landing page",
            href: "/solutions/use-cases/landing",
          },
          {
            title: "Lead generation",
            href: "/solutions/use-cases/leads",
          },
          {
            title: "Market research",
            href: "/solutions/use-cases/research",
          },
          {
            title: "NPS form",
            href: "/solutions/use-cases/nps",
          },
          {
            title: "Registration form",
            href: "/solutions/use-cases/registration",
          },
          {
            title: "Short form builder",
            href: "/solutions/use-cases/short-form",
          },
        ],
      },
      {
        title: "WORKFLOWS",
        items: [
          {
            title: "Apps that integrate with FlowForm",
            href: "/solutions/integrations",
          },
          {
            title: "See all integrations",
            href: "/solutions/all-integrations",
          }
        ],
      }
    ],
  },
  {
    title: "Resources",
    sections: [
      {
        title: "LEARN",
        items: [
          {
            title: "Blog",
            href: "/resources/blog",
          },
          {
            title: "Help Center",
            href: "/resources/help",
          },
          {
            title: "Guides",
            href: "/resources/guides",
          },
          {
            title: "Webinars",
            href: "/resources/webinars",
          },
        ],
      },
      {
        title: "COMPANY",
        items: [
          {
            title: "About us",
            href: "/company/about",
          },
          {
            title: "Careers",
            href: "/company/careers",
          },
          {
            title: "Contact us",
            href: "/company/contact",
          },
        ],
      },
    ],
  },
  {
    title: "Enterprise",
    href: "/enterprise",
  },
  {
    title: "Pricing",
    href: "/pricing",
  },
];

export default function MegaNavbar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuTimeout, setMenuTimeout] = useState<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const { session } = useAuthSession();
  const { signOut } = useAuth();
  const user = session?.user;

  useEffect(() => {
    return () => {
      if (menuTimeout) clearTimeout(menuTimeout);
    };
  }, [menuTimeout]);

  const getInitials = (email?: string) => {
    if (!email) return "U";
    const parts = email.split('@')[0].split(/[._-]/);
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <nav className="fixed top-0 w-full bg-white z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left - Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <Image 
                  src="/logo.svg" 
                  alt="FlowForm Logo" 
                  width={120} 
                  height={24} 
                  priority
                />
              </Link>
            </div>

            {/* Center - Main navigation */}
            <div className="hidden md:flex items-center">
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

            {/* Right - Auth buttons / User Menu */}
            <div className="flex-shrink-0 flex items-center space-x-4">
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
          </div>
        </div>

        {/* Mega menu dropdown */}
        {navItems.map((item) => (
          item.sections && item.sections.length > 0 && (
            <div 
              key={`dropdown-${item.title}`}
              onMouseEnter={() => setActiveMenu(item.title)}
              onMouseLeave={() => setActiveMenu(null)}
              className={cn(
                "border-t border-gray-100 bg-white overflow-hidden transition-all duration-300",
                activeMenu === item.title 
                  ? "max-h-[800px] opacity-100" 
                  : "max-h-0 opacity-0 pointer-events-none"
              )}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-3 gap-8">
                  {item.sections?.map((section) => (
                    <div key={section.title} className="flex flex-col space-y-4">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {section.title}
                      </h3>
                      
                      {section.title === "WORKFLOWS" && item.title === "Solutions" ? (
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-gray-50 rounded-md p-3 flex flex-col items-center justify-center">
                            <Image src="/integrations/zapier.svg" alt="Zapier" width={40} height={40} className="mb-2" />
                          </div>
                          <div className="bg-gray-50 rounded-md p-3 flex flex-col items-center justify-center">
                            <Image src="/integrations/hubspot.svg" alt="HubSpot" width={40} height={40} className="mb-2" />
                          </div>
                          <div className="bg-gray-50 rounded-md p-3 flex flex-col items-center justify-center">
                            <Image src="/integrations/sheets.svg" alt="Google Sheets" width={40} height={40} className="mb-2" />
                          </div>
                          <div className="bg-gray-50 rounded-md p-3 flex flex-col items-center justify-center">
                            <Image src="/integrations/slack.svg" alt="Slack" width={40} height={40} className="mb-2" />
                          </div>
                          <div className="bg-gray-50 rounded-md p-3 flex flex-col items-center justify-center">
                            <Image src="/integrations/teams.svg" alt="Microsoft Teams" width={40} height={40} className="mb-2" />
                          </div>
                          <div className="bg-gray-50 rounded-md p-3 flex flex-col items-center justify-center">
                            <Image src="/integrations/salesforce.svg" alt="Salesforce" width={40} height={40} className="mb-2" />
                          </div>
                        </div>
                      ) : section.title === "WORKFLOWS" && item.title === "Products" ? (
                        <div className="bg-gray-50 rounded-md p-4">
                          <div className="w-[250px] h-[150px] bg-gray-100 rounded-md mb-3 mx-auto flex items-center justify-center text-sm text-gray-500">
                            <span>Template Preview</span>
                          </div>
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {section.items[0].title}
                          </div>
                          <Link href={section.items[0].href} className="text-xs text-primary font-medium flex items-center">
                            Choose one <ChevronRight className="h-3 w-3 ml-1" />
                          </Link>
                        </div>
                      ) : (
                        <ul className="space-y-4">
                          {section.items.map((subitem) => (
                            <li key={subitem.title}>
                              <Link href={subitem.href} className="group flex flex-col">
                                <div className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">
                                  {subitem.title}
                                </div>
                                {subitem.description && (
                                  <p className="text-xs text-gray-500">
                                    {subitem.description}
                                  </p>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        ))}
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
    </>
  );
}
