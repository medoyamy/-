import React from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  ThumbsUp, 
  Clock, 
  MapPin, 
  Tag, 
  CheckCircle2,
  AlertCircle,
  Zap,
  Handshake,
  Send,
  Briefcase,
  Building2,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Post } from '../context/PostContext';
import PostMenu from './PostMenu';
import { auth } from '../firebase';

interface PostCardProps {
  post: Post;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onViewOffers: () => void;
  onViewLikes: () => void;
  showComments: boolean;
  commentText: string;
  setCommentText: (text: string) => void;
  handleComment: () => void;
}

export default function PostCard({
  post,
  onLike,
  onComment,
  onShare,
  onDelete,
  onEdit,
  onViewOffers,
  onViewLikes,
  showComments,
  commentText,
  setCommentText,
  handleComment
}: PostCardProps) {
  const isOwner = auth.currentUser?.uid === post.authorId;
  const hasLiked = post.likes?.includes(auth.currentUser?.uid || '');

  const getTypeLabel = (type: Post['type'], source?: string) => {
    if (source === 'jobs') {
      return { label: type === 'offer' ? 'عرض وظيفة' : 'طلب وظيفة', color: 'bg-red-100 text-red-700', icon: <Briefcase size={12} /> };
    }
    switch (type) {
      case 'offer': return { label: 'عرض', color: 'bg-green-100 text-green-700', icon: <Tag size={12} /> };
      case 'request': return { label: 'طلب', color: 'bg-blue-100 text-blue-700', icon: <Zap size={12} /> };
      case 'deals': return { label: 'صفقة', color: 'bg-red-100 text-red-700', icon: <Zap size={12} /> };
      case 'driver_passengers': return { label: 'توصيل', color: 'bg-yellow-100 text-yellow-700', icon: <Zap size={12} /> };
      default: return { label: 'منشور', color: 'bg-gray-100 text-gray-700', icon: <Zap size={12} /> };
    }
  };

  const typeInfo = getTypeLabel(post.type, post.source);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={`https://picsum.photos/seed/${post.authorId}/100/100`} 
              alt={post.author}
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h4 className="text-sm font-black text-gray-900">{post.author}</h4>
              <CheckCircle2 size={12} className="text-blue-500" fill="currentColor" />
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {new Date(post.createdAt).toLocaleDateString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span>•</span>
              <span className={`px-2 py-0.5 rounded-full flex items-center gap-1 ${typeInfo.color}`}>
                {typeInfo.icon}
                {typeInfo.label}
              </span>
            </div>
          </div>
        </div>
        <PostMenu 
          onDelete={onDelete}
          onEdit={onEdit}
          onSave={() => {}}
          onShare={onShare}
          isOwner={isOwner}
        />
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">
          {post.content}
        </p>
        
        {post.price && (
          <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-red-500" />
              <span className="text-xs font-black text-red-900">السعر المتوقع</span>
            </div>
            <span className="text-sm font-black text-red-600">{post.price} ج.م</span>
          </div>
        )}

        {post.source === 'jobs' && post.jobType && (
          <div className="mt-3 p-4 bg-red-50 rounded-2xl border border-red-100 space-y-3">
            <div className="flex items-center justify-between border-b border-red-100 pb-2">
              <div className="flex items-center gap-2">
                <Briefcase size={16} className="text-red-600" />
                <span className="text-xs font-black text-red-900">
                  {post.jobType === 'offer' ? 'عرض وظيفة' : 'طلب وظيفة'}
                </span>
              </div>
              <span className="text-[10px] font-black bg-red-600 text-white px-2 py-1 rounded-lg">
                {post.category}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {post.jobType === 'offer' ? (
                <>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-red-400 uppercase">الشركة</p>
                    <p className="text-xs font-black text-red-900">{post.companyName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-red-400 uppercase">الوظيفة</p>
                    <p className="text-xs font-black text-red-900">{post.jobTitle}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-red-400 uppercase">المهنة</p>
                    <p className="text-xs font-black text-red-900">{post.applicantProfession}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-red-400 uppercase">المكان المفضل</p>
                    <p className="text-xs font-black text-red-900">{post.desiredLocation}</p>
                  </div>
                </>
              )}
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-red-400 uppercase">الخبرة</p>
                <p className="text-xs font-black text-red-900">{post.experience}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-red-400 uppercase">المرتب</p>
                <p className="text-xs font-black text-red-900">{post.salaryRange}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 pt-2 border-t border-red-100">
              <Clock size={12} className="text-red-400" />
              <span className="text-[10px] font-bold text-red-700">الشيفت: {post.shift}</span>
            </div>
          </div>
        )}
      </div>

      {/* Media */}
      {post.image && (
        <div className="relative aspect-video bg-gray-100">
          <img 
            src={post.image} 
            alt="Post content"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* Stats */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-gray-50">
        <button 
          onClick={onViewLikes}
          className="flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-blue-600 transition-colors"
        >
          <div className="flex -space-x-1 rtl:space-x-reverse">
            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white border border-white">
              <ThumbsUp size={8} fill="currentColor" />
            </div>
            <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white border border-white">
              <Heart size={8} fill="currentColor" />
            </div>
          </div>
          <span>{post.likes?.length || 0} إعجاب</span>
        </button>
        <div className="flex gap-3 text-[10px] font-bold text-gray-400">
          <span>{post.comments?.length || 0} تعليق</span>
          <span>{post.sharedBy?.length || 0} مشاركة</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-2 py-1 flex items-center justify-around">
        <button 
          onClick={onLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all ${
            hasLiked ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <ThumbsUp size={18} fill={hasLiked ? "currentColor" : "none"} />
          <span className="text-xs font-black">أعجبني</span>
        </button>
        <button 
          onClick={onComment}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all ${
            showComments ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <MessageCircle size={18} />
          <span className="text-xs font-black">تعليق</span>
        </button>
        {!isOwner && (
          <button 
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-support-chat', { 
                detail: { 
                  userId: post.authorId, 
                  userName: post.author 
                } 
              }));
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
          >
            <Send size={18} />
            <span className="text-xs font-black">مراسلة</span>
          </button>
        )}
        <button 
          onClick={onShare}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
        >
          <Share2 size={18} />
          <span className="text-xs font-black">مشاركة</span>
        </button>
      </div>

      {/* Offers Button (If applicable) */}
      {(post.type === 'request' || post.type === 'offer') && isOwner && (
        <div className="px-4 pb-4">
          <button 
            onClick={onViewOffers}
            className="w-full py-3 bg-gray-900 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-gray-200 active:scale-95 transition-all"
          >
            <Handshake size={18} />
            عرض العروض المقدمة ({post.type === 'request' ? '3 عروض' : '0 عرض'})
          </button>
        </div>
      )}

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-gray-50/50"
          >
            <div className="p-4 space-y-4">
              {/* Comment Input */}
              <div className="flex items-center gap-2">
                <img 
                  src={`https://picsum.photos/seed/${auth.currentUser?.uid}/100/100`} 
                  alt="User"
                  className="w-8 h-8 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 relative">
                  <input 
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="اكتب تعليقاً..."
                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-blue-500 transition-all"
                    onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                  />
                  <button 
                    onClick={handleComment}
                    disabled={!commentText.trim()}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-600 disabled:text-gray-300 transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-3">
                {post.comments?.map((comment) => (
                  <div key={comment.id} className="flex gap-2">
                    <img 
                      src={`https://picsum.photos/seed/${comment.userId}/100/100`} 
                      alt={comment.userName}
                      className="w-8 h-8 rounded-full object-cover mt-1"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="text-[11px] font-black text-gray-900">{comment.userName}</h5>
                        <span className="text-[9px] font-bold text-gray-400">
                          {new Date(comment.createdAt).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-700 font-medium leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
