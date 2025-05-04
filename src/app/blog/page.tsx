import { getPosts } from '@/services/ghostService';
import BlogHero from '@/components/sections/blog/BlogHero';
import BlogGrid from '@/components/sections/blog/BlogGrid';
import MegaNavbar from '@/components/layout/public/MegaNavbar';
import FooterBar from '@/components/layout/public/FooterBar';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | FlowForm',
  description: 'Latest news, updates and insights about FlowForm'
};

export default async function BlogPage() {
  const posts = await getPosts(9);
  
  return (
    <>
      <MegaNavbar />
      <main>
        <BlogHero />
        <BlogGrid posts={posts} />
      </main>
      <FooterBar />
    </>
  );
}
