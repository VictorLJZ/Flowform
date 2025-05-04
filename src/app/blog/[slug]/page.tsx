import { getPostBySlug, getPosts } from '@/services/ghostService';
import MegaNavbar from '@/components/layout/public/MegaNavbar';
import FooterBar from '@/components/layout/public/FooterBar';
import BlogPost from '@/components/sections/blog/BlogPost';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

type Props = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Await params to fix the error
  const resolvedParams = await Promise.resolve(params);
  const post = await getPostBySlug(resolvedParams.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found | Flowform Blog',
      description: 'The requested blog post could not be found.'
    };
  }
  
  return {
    title: `${post.title} | Flowform Blog`,
    description: post.excerpt,
    openGraph: post.feature_image ? {
      images: [{ url: post.feature_image }]
    } : undefined
  };
}

export async function generateStaticParams() {
  const posts = await getPosts(100);
  return posts.map(post => ({
    slug: post.slug
  }));
}

export default async function BlogPostPage({ params }: Props) {
  // Await params to fix the error
  const resolvedParams = await Promise.resolve(params);
  const post = await getPostBySlug(resolvedParams.slug);
  
  if (!post) {
    notFound();
  }
  
  return (
    <>
      <MegaNavbar />
      <main className="bg-white py-12">
        <BlogPost post={post} />
      </main>
      <FooterBar />
    </>
  );
}
