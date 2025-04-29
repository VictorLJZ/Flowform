"use client"

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'
import MegaNavbar from '@/components/layout/public/MegaNavbar'
import FooterBar from '@/components/layout/public/FooterBar'

export default function HelpCenterPlaceholder() {
  return (
    <>
      <MegaNavbar />
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center bg-white p-8 md:p-12 rounded-lg shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="h-10 w-10 text-blue-500" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Help Center Coming Soon
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            We are currently working on scaling up our customer support due to unexpected demand. 
            If you have urgent questions, please visit our contact us page.
          </p>
          
          <Button asChild size="lg">
            <Link href="/company/contact">
              Contact Us
            </Link>
          </Button>
          
          <div className="mt-12 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Thank you for your patience as we improve our support resources.
              We're committed to providing you with the best possible assistance.
            </p>
          </div>
        </div>
      </main>
      <FooterBar />
    </>
  )
}
