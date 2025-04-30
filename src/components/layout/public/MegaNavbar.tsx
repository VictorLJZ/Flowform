"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown, ChevronRight, LogOut, LayoutDashboard } from 'lucide-react'
import { motion } from 'motion/react'
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
  animatedEndings?: string[];
  items: {
    title: string;
    description?: string;
    href: string;
    icon?: string;
  }[];
}

// Application-specific navigation items
const navItems: NavItem[] = [
  {
    title: "Features",
    sections: [
      {
        title: "FEATURES THAT HELP YOU ", // The ending will be animated
        animatedEndings: ["UNDERSTAND", "COLLABORATE", "RESEARCH"],
        items: [
          {
            title: "Dynamic questions",
            description: "Questions that adapt to your users in real time using AI. Follow-up questions have never been more powerful.",
            href: "/Features/dynamic-responses",
            icon: "overview"
          },
          {
            title: "Templates",
            description: "Out of the box templates to help you get up and going at the speed of thought.",
            href: "/Features/templates",
            icon: "ai"
          },
          {
            title: "Form builder",
            description: "Create custom forms to collect data and insights from your users.",
            href: "/Features/form-builder",
            icon: "form"
          },
          {
            title: "Powerful branching",
            description: "Branching logic that allows you to control the flow of your form with utmost precision.",
            href: "/Features/survey-maker",
            icon: "survey"
          },
          {
            title: "Integrations",
            description: "Find the apps your team is already using or discover new ways to get work done with FlowForm.",
            href: "/Features/integrations",
            icon: "quiz"
          },
          {
            title: "Analytics",
            description: "Track and analyze the performance of your forms and surveys with powerful features all on one platform.",
            href: "/Features/analytics",
            icon: "test"
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
        title: "SOLUTIONS THAT HELP YOU ", // The ending will be animated
        animatedEndings: ["SUCCEED", "INNOVATE", "TRANSFORM"],
        items: [
          {
            title: "Enterprise solutions",
            description: "Secure, scalable solutions for organizations with complex needs.",
            href: "/solutions/enterprise",
            icon: "overview"
          },
          {
            title: "Collaboration features",
            description: "Work together with your team to build the perfect form experience.",
            href: "/solutions/collaboration",
            icon: "ai"
          },
          {
            title: "Advanced security",
            description: "Enterprise-grade security features to protect your data and users.",
            href: "/solutions/security",
            icon: "form"
          },
          {
            title: "API access",
            description: "Build custom integrations and workflows with our powerful API.",
            href: "/solutions/api",
            icon: "survey"
          },
          {
            title: "Scalable infrastructure",
            description: "Our platform grows with your needs, from startups to enterprise.",
            href: "/solutions/infrastructure",
            icon: "quiz"
          },
          {
            title: "Compliance & privacy",
            description: "GDPR, HIPAA, and SOC2 compliant solutions for regulated industries.",
            href: "/solutions/compliance",
            icon: "test"
          },
        ],
      },
      {
        title: "WORKFLOWS",
        items: [
          {
            title: "Integrations",
            href: "/solutions/integrations",
          },
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
        ],
      },
      {
        title: "COMPANY",
        items: [
          {
            title: "Partner with us",
            href: "/company/partners",
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
    ],
  },
  {
    title: "Pricing",
    href: "/pricing",
  },
];

// Animated typing component for section title
function TypedTitle({ baseTitle, endings }: { baseTitle: string; endings: string[] }) {
  const [displayText, setDisplayText] = useState(baseTitle);
  const [ending, setEnding] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'pause' | 'deleting' | 'pauseBeforeNext'>('typing');
  const [cursorVisible, setCursorVisible] = useState(true);
  
  // Handle cursor blinking
  useEffect(() => {
    const id = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 530);
    
    return () => clearInterval(id);
  }, []);
  
  // Handle text animation
  useEffect(() => {
    // Init state if needed
    if (ending === "" && phase === 'typing') {
      setEnding(endings[currentIndex]);
      return;
    }
    
    let timerId: number;
    
    if (phase === 'typing') {
      if (displayText.length < baseTitle.length + ending.length) {
        // Still typing
        timerId = window.setTimeout(() => {
          const nextPosition = displayText.length - baseTitle.length;
          const nextChar = ending[nextPosition];
          setDisplayText(prev => prev + nextChar);
        }, 120);
      } else {
        // Finished typing, pause
        timerId = window.setTimeout(() => {
          setPhase('pause');
        }, 2000);
      }
    } 
    else if (phase === 'pause') {
      // Start deleting
      timerId = window.setTimeout(() => {
        setPhase('deleting');
      }, 300);
    } 
    else if (phase === 'deleting') {
      if (displayText.length > baseTitle.length) {
        // Still deleting
        timerId = window.setTimeout(() => {
          setDisplayText(prev => prev.substring(0, prev.length - 1));
        }, 60);
      } else {
        // Finished deleting, prepare for next word
        timerId = window.setTimeout(() => {
          setPhase('pauseBeforeNext');
        }, 300);
      }
    } 
    else if (phase === 'pauseBeforeNext') {
      // Move to next word
      timerId = window.setTimeout(() => {
        const nextIndex = (currentIndex + 1) % endings.length;
        setCurrentIndex(nextIndex);
        setEnding(endings[nextIndex]);
        setPhase('typing');
      }, 300);
    }
    
    return () => clearTimeout(timerId);
  }, [baseTitle, displayText, ending, endings, currentIndex, phase]);

  return (
    <span className="inline-block">
      {displayText}
      <span className={`inline-block ${cursorVisible ? 'opacity-100' : 'opacity-0'} transition-opacity ml-[1px] -mr-[1px]`}>|</span>
    </span>
  );
}

export default function MegaNavbar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuTimeoutId, setMenuTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const { session } = useAuthSession();
  const { signOut } = useAuth();
  const user = session?.user;

  useEffect(() => {
    return () => {
      if (menuTimeoutId) clearTimeout(menuTimeoutId);
    };
  }, [menuTimeoutId]);

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
          <div className="grid grid-cols-3 items-center h-16">
            {/* Left - Logo */}
            <div className="flex items-center">
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

            {/* Right - Auth buttons / User Menu */}
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
          </div>
        </div>

        {/* Mega menu dropdown */}
        {navItems.map((item) => (
          item.sections && item.sections.length > 0 && (
            <div 
              key={`dropdown-${item.title}`}
              onMouseEnter={() => setActiveMenu(item.title)}
              onMouseLeave={() => {
                setMenuTimeoutId(setTimeout(() => setActiveMenu(null), 200));
              }}
              className={cn(
                "border-t border-gray-100 bg-white overflow-hidden transition-all duration-300",
                activeMenu === item.title 
                  ? "max-h-[800px] opacity-100" 
                  : "max-h-0 opacity-0 pointer-events-none"
              )}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-4 gap-8">
                  {item.sections?.map((section) => (
                    <div key={section.title} className={`flex flex-col space-y-4 ${(section.title === "FEATURES THAT HELP YOU " && item.title === "Features") || (section.title === "SOLUTIONS THAT HELP YOU " && item.title === "Solutions") ? "col-span-3" : ""}`}>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {section.animatedEndings ? (
                          <TypedTitle baseTitle={section.title} endings={section.animatedEndings} />
                        ) : (
                          section.title
                        )}
                      </h3>
                      
                      {(section.title === "FEATURES THAT HELP YOU " && item.title === "Features") || (section.title === "SOLUTIONS THAT HELP YOU " && item.title === "Solutions") ? (
                        <div className="grid grid-cols-3 gap-5 w-full h-full">
                          {section.items.map((subitem) => (
                            <Link href={subitem.href} key={subitem.title} className="group h-full">
                              <div className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors h-full flex flex-col">
                                <div className="flex items-center mb-2">
                                  <div className="mr-3 text-primary">
                                    {subitem.icon ? (
                                      <Image 
                                        src={`/icons/${subitem.icon}.svg`} 
                                        alt={subitem.title} 
                                        width={18} 
                                        height={18} 
                                        className="text-primary"
                                        priority
                                      />
                                    ) : (
                                      <span className="text-xs">•</span>
                                    )}
                                  </div>
                                  <h4 className="text-sm font-medium">{subitem.title}</h4>
                                </div>
                                {subitem.description && (
                                  <p className="text-xs text-gray-500 mt-1">{subitem.description}</p>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : section.title === "WORKFLOWS" && item.title === "Solutions" ? (
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
                      ) : section.title === "WORKFLOWS" && item.title === "Features" ? (
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
                                <motion.div
                                  className="flex flex-col"
                                  initial={{ x: 0 }}
                                  whileHover={{ x: 4 }}
                                  transition={{ type: 'tween', duration: 0.2 }}
                                >
                                  <div className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">
                                    {subitem.title}
                                  </div>
                                  {subitem.description && (
                                    <p className="text-xs text-gray-500">
                                      {subitem.description}
                                    </p>
                                  )}
                                </motion.div>
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
