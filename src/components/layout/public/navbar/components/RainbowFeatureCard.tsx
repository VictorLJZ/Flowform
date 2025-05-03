"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Megaphone, Microscope, Palette, Code, Rocket, Building, LayoutGrid } from 'lucide-react'
import { cn } from "@/lib/utils"

interface RainbowFeatureCardProps {
  title: string;
  description?: string;
  href: string;
  icon?: string;
}

// Map of icon names to Lucide components
const iconMap: Record<string, any> = {
  megaphone: Megaphone,
  microscope: Microscope,
  palette: Palette,
  code: Code,
  rocket: Rocket,
  building: Building,
  overview: LayoutGrid,
  // Add additional mappings for other icons as needed
}

export function RainbowFeatureCard({ title, description, href, icon }: RainbowFeatureCardProps) {
  const isRainbowCard = title === "Dynamic questions";
  const LucideIcon = icon && iconMap[icon] ? iconMap[icon] : null;
  
  return (
    <Link href={href} className="group h-full">
      <div className={`relative bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors h-full flex flex-col ${isRainbowCard ? "glow-border-container" : ""}`}>
        {isRainbowCard && (
          <>
            <div className="absolute inset-0 rounded-lg glow-border-bg"></div>
            <div className="absolute inset-0 rounded-lg glow-border"></div>
          </>
        )}
        <div className={`flex items-center mb-2 ${isRainbowCard ? "relative z-10" : ""}`}>
          <div className={cn("mr-3", isRainbowCard ? "rainbow-gradient-icon" : "text-primary")}>
            {isRainbowCard ? (
              <div className="relative w-[18px] h-[18px]">
                <div className="rainbow-gradient-mask absolute inset-0" style={{
                  WebkitMaskImage: `url('/icons/${icon}.svg')`,
                  maskImage: `url('/icons/${icon}.svg')`,
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center'
                }} />
              </div>
            ) : LucideIcon ? (
              <LucideIcon className="w-[18px] h-[18px] text-primary" />
            ) : icon ? (
              <Image 
                src={`/icons/${icon}.svg`} 
                alt={title} 
                width={18} 
                height={18} 
                className="text-primary"
                priority
              />
            ) : (
              <span className="text-xs">•</span>
            )}
          </div>
          <h4 className={`text-sm font-medium ${isRainbowCard ? "rainbow-gradient-text" : ""}`}>{title}</h4>
        </div>
        {description && (
          <p className={`text-xs text-gray-500 mt-1 ${isRainbowCard ? "relative z-10" : ""}`}>{description}</p>
        )}
      </div>
    </Link>
  );
}