"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MegaNavbar from "@/components/layout/public/MegaNavbar";
import FooterBar from "@/components/layout/public/FooterBar";
import BlogPost from "@/components/sections/blog/BlogPost";
import { getPostBySlug } from "@/services/ghostService";
import type { GhostPost } from "@/types";

/**
 * Client component for blog post page
 */
export default function Page() {
  const params = useParams();
  const [post, setPost] = useState<GhostPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const slug = typeof params.slug === 'string' ? params.slug : '';

  useEffect(() => {
    async function loadBlogPost() {
      if (!slug) return;
      try {
        const postData = await getPostBySlug(slug);
        setPost(postData);
      } catch (error) {
        console.error("Error loading blog post:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadBlogPost();
  }, [slug]);

  if (isLoading) {
    return (
      <>
        <MegaNavbar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-pulse">Loading...</div>
        </div>
        <FooterBar />
      </>
    );
  }

  if (!post) {
    return (
      <>
        <MegaNavbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
          <p className="mb-8">The blog post you&apos;re looking for doesn&apos;t exist.</p>
        </div>
        <FooterBar />
      </>
    );
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
