import type { GhostPost, GhostTag } from "@/types"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Facebook, Twitter, Linkedin } from "lucide-react"

interface BlogPostProps {
  post: GhostPost
}

const BlogPost = ({ post }: BlogPostProps) => {
  // Format date to match Typeform style (MM.YYYY)
  const formattedDate = new Date(post.published_at).toLocaleDateString('en-US', {
    month: '2-digit',
    year: 'numeric'
  }).replace('/', '.')

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      {/* Back button and category */}
      <div className="flex flex-wrap items-center justify-between mb-8">
        <Link href="/blog" className="inline-flex items-center text-gray-600 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to blog
        </Link>

        {post.primary_tag && (
          <Link 
            href={`/blog?category=${post.primary_tag.slug}`} 
            className="inline-block px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-800"
          >
            {post.primary_tag.name}
          </Link>
        )}
      </div>

      {/* Post title */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-gray-900 mb-6 leading-tight">
        {post.title}
      </h1>

      {/* Author and metadata */}
      <div className="flex flex-wrap items-center justify-between mb-10 py-4 border-y border-gray-100">
        <div className="flex items-center space-x-4">
          {post.primary_author && post.primary_author.profile_image ? (
            <div className="relative w-10 h-10 overflow-hidden rounded-full">
              <Image 
                src={post.primary_author.profile_image} 
                alt={post.primary_author.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-500 text-sm font-medium">
                {(post.primary_author?.name || 'F').charAt(0)}
              </span>
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{post.primary_author?.name || 'FlowForm Team'}</p>
            <div className="flex items-center text-sm text-gray-500">
              <span>{formattedDate}</span>
              <span className="mx-2">·</span>
              <span>{post.reading_time} min read</span>
            </div>
          </div>
        </div>

        <div className="flex items-center mt-4 sm:mt-0 space-x-2">
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" aria-label="Share on Facebook">
            <Facebook className="w-4 h-4 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" aria-label="Share on Twitter">
            <Twitter className="w-4 h-4 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" aria-label="Share on LinkedIn">
            <Linkedin className="w-4 h-4 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Featured image */}
      {post.feature_image && (
        <div className="relative w-full aspect-[16/9] mb-12 overflow-hidden rounded-lg">
          <Image
            src={post.feature_image}
            alt={post.title}
            fill
            priority
            className="object-cover"
          />
        </div>
      )}

      {/* Post content */}
      <div 
        className="prose prose-lg max-w-none prose-headings:font-medium prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-16 pt-8 border-t border-gray-100">
          <h3 className="text-lg font-medium mb-4">Related topics</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag: GhostTag) => (
              <Link 
                key={tag.id}
                href={`/blog?tag=${tag.slug}`}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}

export default BlogPost
