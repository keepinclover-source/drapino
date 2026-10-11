import React, { useState } from 'react';
import { BlogPost } from '../types';
import { BookOpen, Clock, Calendar, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { BlogPostModal } from './BlogPostModal';

interface BlogSectionProps {
  posts: BlogPost[];
}

export const BlogSection: React.FC<BlogSectionProps> = ({ posts }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const featuredPost = posts.find((p) => p.featured) || posts[0];
  const regularPosts = posts.filter((p) => p.id !== featuredPost?.id);

  return (
    <section className="py-16 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-800">
            <BookOpen className="w-4 h-4 text-amber-700" />
            <span>مجله تخصصی دراپینو</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            دانشنامه پرده، دکوراسیون و اصول متراژ
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            راهنمای جامع کارشناسان دکوراسیون داخلی برای انتخاب جنس پارچه، سبک دوخت و هارمونی نور
          </p>
        </div>

        {/* Featured Post Card */}
        {featuredPost && (
          <div 
            onClick={() => setSelectedPost(featuredPost)}
            className="mb-10 bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:border-amber-300 transition-all cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-0 group"
          >
            <div className="lg:col-span-7 aspect-[16/10] lg:aspect-auto overflow-hidden bg-stone-100">
              <img
                src={featuredPost.imageUrl}
                alt={featuredPost.title}
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
              />
            </div>

            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between text-right">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md">
                    مقاله برگزیده هفته
                  </span>
                  <span className="text-[11px] text-stone-500">·</span>
                  <span className="text-[11px] text-stone-500 font-mono">{featuredPost.readTime}</span>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-stone-900 leading-snug group-hover:text-amber-800 transition-colors">
                  {featuredPost.title}
                </h3>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed line-clamp-3">
                  {featuredPost.summary}
                </p>
              </div>

              <div className="pt-6 border-t border-stone-200/80 flex items-center justify-between mt-4">
                <span className="text-xs text-stone-500">{featuredPost.author}</span>
                <span className="flex items-center gap-1 text-xs font-bold text-amber-800 group-hover:translate-x-[-2px] transition-transform">
                  <span>مطالعه مقاله کامل</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Regular Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-right">
          {regularPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:border-amber-300 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="aspect-[16/9] overflow-hidden bg-stone-100">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                <div className="p-5 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span className="text-amber-800 font-semibold">{post.category}</span>
                    <span className="font-mono">{post.readTime}</span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-stone-900 leading-snug group-hover:text-amber-800 transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {post.summary}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="pt-3 border-t border-stone-200/70 flex items-center justify-between text-xs text-stone-500">
                  <span>{post.date}</span>
                  <span className="font-semibold text-amber-800 flex items-center gap-1 text-[11px]">
                    <span>ادامه مطلب</span>
                    <ArrowLeft className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Full Article Reader Modal */}
      <BlogPostModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </section>
  );
};
