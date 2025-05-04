"use client"

import { motion } from 'motion/react'
import { ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from "@/lib/utils"
import { NavItem } from '@/data/navigation'
import { TypedTitle } from './TypedTitle'
import { RainbowFeatureCard } from './RainbowFeatureCard'

interface MegaDropdownProps {
  activeMenu: string | null;
  navItems: NavItem[];
  setActiveMenu: (menu: string | null) => void;
  setMenuTimeoutId: (timeoutId: NodeJS.Timeout | null) => void;
}

export function MegaDropdown({ activeMenu, navItems, setActiveMenu, setMenuTimeoutId }: MegaDropdownProps) {
  return (
    <>
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
                          <RainbowFeatureCard 
                            key={subitem.title}
                            title={subitem.title}
                            description={subitem.description}
                            href={subitem.href}
                            icon={subitem.icon}
                          />
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
    </>
  );
}