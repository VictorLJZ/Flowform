"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

const BlogHero = () => {
  return (
    <section className="relative pt-16 pb-8 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-medium tracking-tight text-gray-900 mb-6">
            Flowform Blog
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl">
            Thought-provoking. Helpful. Insightful. Creative ways to improve your forms and collect more meaningful data.
          </p>

          <div className="flex flex-wrap gap-4 mb-10">
            <Link href="/blog?category=tips">
              <Button variant="outline" className="rounded-full hover:bg-gray-100 border-gray-200">
                Tips & Tutorials
              </Button>
            </Link>
            <Link href="/blog?category=guides">
              <Button variant="outline" className="rounded-full hover:bg-gray-100 border-gray-200">
                Guides
              </Button>
            </Link>
            <Link href="/blog?category=product">
              <Button variant="outline" className="rounded-full hover:bg-gray-100 border-gray-200">
                Product Updates
              </Button>
            </Link>
            <Link href="/blog?category=customers">
              <Button variant="outline" className="rounded-full hover:bg-gray-100 border-gray-200">
                Customer Stories
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BlogHero
