import type { GhostPost } from '@/types'
import BlogCard from "./BlogCard"

interface BlogGridProps {
  posts: GhostPost[]
}

const BlogGrid = ({ posts }: BlogGridProps) => {
  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-500">No posts found.</p>
      </div>
    )
  }

  // Use the first post as featured
  const featuredPost = posts[0]
  // Next 4 posts for the latest section
  const latestPosts = posts.slice(1, 5)
  // Remaining posts for the regular grid
  const morePosts = posts.slice(5)

  return (
    <div className="bg-white pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Featured post */}
        <section className="mb-16 pt-8 border-t border-gray-100">
          <h2 className="text-2xl font-medium mb-8">Featured Post</h2>
          <BlogCard post={featuredPost} featured />
        </section>
        
        {/* Latest posts */}
        <section className="mb-16 pt-8 border-t border-gray-100">
          <h2 className="text-2xl font-medium mb-8">Latest posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
            {latestPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </section>
        
        {/* More posts */}
        {morePosts.length > 0 && (
          <section className="pt-8 border-t border-gray-100">
            <h2 className="text-2xl font-medium mb-8">More to explore</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {morePosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default BlogGrid
