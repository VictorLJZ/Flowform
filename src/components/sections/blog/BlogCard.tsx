import { type GhostPost } from "@/services/ghostService"
import Image from "next/image"
import Link from "next/link"

interface BlogCardProps {
  post: GhostPost
  featured?: boolean
}

const BlogCard = ({ post, featured = false }: BlogCardProps) => {
  // Format date to match Typeform style (MM.YYYY)
  const formattedDate = new Date(post.published_at).toLocaleDateString('en-US', {
    month: '2-digit',
    year: 'numeric'
  }).replace('/', '.')

  return (
    <div className={`group w-full transition-all duration-200 ${featured ? 'lg:flex items-start gap-8' : ''}`}>
      {/* Image container with link */}
      <Link 
        href={`/blog/${post.slug}`} 
        className={`block relative overflow-hidden rounded-lg ${featured ? 'lg:w-2/3 aspect-[16/9]' : 'aspect-[16/10] mb-5'}`}
      >
        {post.feature_image ? (
          <Image
            src={post.feature_image}
            alt={post.title}
            fill
            className="object-cover transition-transform group-hover:scale-[1.02]"
            sizes={featured ? "(max-width: 1024px) 100vw, 66vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </Link>
      
      {/* Content container */}
      <div className={`${featured ? 'lg:w-1/3' : ''}`}>
        {/* Category tag */}
        {post.primary_tag && (
          <div className="mb-3">
            <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-800">
              {post.primary_tag.name}
            </span>
          </div>
        )}
        
        {/* Title with link */}
        <Link href={`/blog/${post.slug}`} className="block mb-3">
          <h3 className={`font-semibold text-gray-900 leading-tight group-hover:text-primary transition-colors ${featured ? 'text-3xl' : 'text-xl'}`}>
            {post.title}
          </h3>
        </Link>
        
        {/* Excerpt */}
        <p className="text-gray-600 line-clamp-2 mb-4">
          {post.excerpt}
        </p>
        
        {/* Author and metadata */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <span className="text-gray-800 font-medium">
              {post.primary_author?.name || 'FlowForm Team'}
            </span>
            <span className="mx-2 text-gray-400">|</span>
            <span className="text-gray-500">{formattedDate}</span>
          </div>
          <Link href={`/blog/${post.slug}`} className="text-primary font-medium">Read more</Link>
        </div>
      </div>
    </div>
  )
}

export default BlogCard
