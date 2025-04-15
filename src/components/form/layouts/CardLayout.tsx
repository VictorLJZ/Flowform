"use client"

import React, { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useFormBuilderStore } from "@/stores/formBuilderStore"

interface CardLayoutProps {
  id: string
  title?: string
  description?: string
  children: ReactNode
  className?: string
  cardClassName?: string
  settings?: {
    shadow?: 'none' | 'sm' | 'md' | 'lg'
    border?: boolean
    padding?: 'none' | 'sm' | 'md' | 'lg'
    rounded?: 'none' | 'sm' | 'md' | 'lg'
  }
  onUpdate?: (updates: Partial<{ 
    title: string, 
    description: string, 
    settings: any 
  }>) => void
}

export function CardLayout({
  id,
  title,
  description,
  children,
  className,
  cardClassName,
  settings = {
    shadow: 'sm',
    border: true,
    padding: 'md',
    rounded: 'md'
  },
  onUpdate,
}: CardLayoutProps) {
  const { mode } = useFormBuilderStore()
  
  // Determine if we're in builder mode
  const isBuilder = mode === 'builder'
  
  // Define shadow classes
  const shadowClasses = {
    'none': '',
    'sm': 'shadow-sm',
    'md': 'shadow',
    'lg': 'shadow-lg',
  }
  
  // Define border classes
  const borderClass = settings.border !== false ? 'border' : 'border-0'
  
  // Define padding classes
  const paddingClasses = {
    'none': 'p-0',
    'sm': 'p-2',
    'md': 'p-4',
    'lg': 'p-6',
  }
  
  // Define rounded classes
  const roundedClasses = {
    'none': 'rounded-none',
    'sm': 'rounded-sm',
    'md': 'rounded-md',
    'lg': 'rounded-lg',
  }
  
  // Get the appropriate classes
  const effectiveShadow = settings.shadow || 'sm'
  const effectivePadding = settings.padding || 'md'
  const effectiveRounded = settings.rounded || 'md'
  
  return (
    <Card 
      className={cn(
        shadowClasses[effectiveShadow],
        borderClass,
        roundedClasses[effectiveRounded],
        isBuilder && 'border-dashed border-gray-300',
        "w-full",
        cardClassName
      )}
    >
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={cn(paddingClasses[effectivePadding], className)}>
        {children}
      </CardContent>
    </Card>
  )
}
