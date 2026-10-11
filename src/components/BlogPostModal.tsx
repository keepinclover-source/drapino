import React, { useState } from 'react';
import { BlogPost } from '../types';
import { X, Clock, Calendar, User, Bookmark, Heart, MessageSquare, Send } from 'lucide-react';

interface BlogPostModalProps {
  post: BlogPost | null;
  onClose: () => void;
}

export const BlogPostModal: React.FC<BlogPostModalProps> = ({ post, onClose }) => {
  const [likes, setLikes] = useState(24);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState<Array<{ name: string; text: string; date: string }>>([
    {
      name: 'فاطمه رادمنش',
      text: 'واقعاً تست کردن کالیته زیر نور خود خانه با مغازه زمین تا آسمان فرق داشت. ممنون از مقاله خوبتون.',
      date: '۲ روز پیش',
    },
    {
      name: 'سعید محمدی',
      text: 'برای پنجره پذیرایی روبه جنوب، مخمل طوسی با حریر الگانت سفارش دادم و بسیار راضی هستم.',
      date: 'دیروز',
    },
  ]);
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentText, setNewCommentText] = useState('');

  if (!post) return null;

  const handleLike = () => {
    if (!hasLiked) {
      setLikes(likes + 1);
      setHasLiked(true);
    } else {
      setLikes(likes - 1);
      setHasLiked(false);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentName || !newCommentText) return;

    setComments([
      ...comments,
      {
        name: newCommentName,
        text: newCommentText,
        date: 'همین الان',
      },
    ]);
    setNewCommentName('');
    setNewCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-md">
            {post.category}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-right max-h-[75vh] overflow-y-auto">
          
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 leading-tight">
            {post.title}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 pb-4 border-b border-stone-100">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              <span>{post.author}</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{post.date}</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>زمان مطالعه: {post.readTime}</span>
            </span>
          </div>

          <div className="rounded-xl overflow-hidden aspect-[16/9] bg-stone-100">
            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
          </div>

          <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
            {post.summary}
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-loose font-normal">
            {post.contentHtml ? (
              <div className="prose prose-sm max-w-none text-stone-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
            ) : (
              post.content.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))
            )}
          </div>

          {/* Engagement */}
          <div className="pt-6 border-t border-stone-200 flex items-center justify-between">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                hasLiked ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-red-600' : ''}`} />
              <span className="tabular-nums">{likes} پسندیدم</span>
            </button>

            <span className="text-xs text-stone-500">
              منتشر شده در مجله تخصصی دراپینو
            </span>
          </div>

          {/* Comments Section */}
          <div className="pt-6 border-t border-stone-200 space-y-4">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
              <MessageSquare className="w-4 h-4 text-amber-700" />
              <span>نظرات و تجربیات همراهان ({comments.length})</span>
            </div>

            <div className="space-y-3">
              {comments.map((c, idx) => (
                <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                  <div className="flex items-center justify-between text-stone-500 text-[11px]">
                    <span className="font-bold text-stone-800">{c.name}</span>
                    <span>{c.date}</span>
                  </div>
                  <p className="text-stone-700">{c.text}</p>
                </div>
              ))}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="p-4 bg-stone-100/70 rounded-xl space-y-3">
              <span className="text-xs font-bold text-stone-800 block">ثبت نظر یا پرسش درباره این مقاله:</span>
              <input
                type="text"
                placeholder="نام شما"
                value={newCommentName}
                onChange={(e) => setNewCommentName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-white"
              />
              <textarea
                rows={2}
                placeholder="دیدگاه شما..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-white"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-700 text-white font-bold text-xs rounded-lg hover:bg-amber-800 transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>ارسال دیدگاه</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
