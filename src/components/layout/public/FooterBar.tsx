"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Github, Twitter, Linkedin, Mail } from 'lucide-react'

export default function FooterBar() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* Logo and company info */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image 
                src="/logo.svg" 
                alt="FlowForm Logo" 
                width={120} 
                height={24} 
                priority
              />
            </Link>
            <p className="text-sm text-gray-500 mb-4 max-w-md">
              FlowForm helps you create beautiful forms, surveys, and quizzes with powerful AI-driven features to understand your audience better.
            </p>
            <div className="flex space-x-4 text-gray-400">
              <Link href="https://github.com/flowform" className="hover:text-gray-600 transition-colors">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link href="https://twitter.com/flowform" className="hover:text-gray-600 transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="https://linkedin.com/company/flowform" className="hover:text-gray-600 transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link href="mailto:hello@flowform.com" className="hover:text-gray-600 transition-colors">
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </Link>
            </div>
          </div>
          
          {/* Features */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Features</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/Features/dynamic-responses" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  Dynamic questions
                </Link>
              </li>
              <li>
                <Link href="/Features/templates" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  Templates
                </Link>
              </li>
              <li>
                <Link href="/Features/form-builder" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  Form builder
                </Link>
              </li>
              <li>
                <Link href="/Features/survey-maker" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  Powerful branching
                </Link>
              </li>
              <li>
                <Link href="/Features/integrations" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  Integrations
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Solutions */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Solutions</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/solutions/enterprise" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  Enterprise solutions
                </Link>
              </li>
              <li>
                <Link href="/solutions/collaboration" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  Collaboration features
                </Link>
              </li>
              <li>
                <Link href="/solutions/security" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  Advanced security
                </Link>
              </li>
              <li>
                <Link href="/solutions/api" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  API access
                </Link>
              </li>
              <li>
                <Link href="/solutions/compliance" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  Compliance & privacy
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/company/partners" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  Partner with us
                </Link>
              </li>
              <li>
                <Link href="/company/careers" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/company/contact" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  Contact us
                </Link>
              </li>
              <li>
                <Link href="/resources/blog" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/resources/help" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom section with legal links */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="flex flex-col md:flex-row md:justify-between items-center">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} FlowForm, Inc. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/legal/privacy" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/legal/terms" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                Terms of Service
              </Link>
              <Link href="/legal/cookies" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
