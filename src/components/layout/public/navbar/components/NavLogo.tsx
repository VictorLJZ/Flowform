"use client"

import Link from 'next/link'
import Image from 'next/image'

export function NavLogo() {
  return (
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
  );
}
