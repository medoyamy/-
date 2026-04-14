import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Camera, 
  Send, 
  Clock, 
  Phone, 
  MessageSquare, 
  Zap, 
  Users, 
  Bell, 
  ChevronDown,
  MoreHorizontal,
  Share2,
  MessageCircle,
  Star,
  ThumbsUp,
  MessageCircle as CommentIcon,
  Heart,
  Plus,
  Store,
  Briefcase,
  Eye,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertCircle, 
  CheckCircle, 
  Hourglass, 
  Trash2, 
  Edit3, 
  ShieldCheck,
  Ban,
  Video,
  Minus,
  Tag,
  Truck,
  X,
  User,
  Navigation,
  Calendar,
  Search,
  Layers,
  ShoppingCart
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { usePosts, Post } from '../context/PostContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import CreatePostModal from '../components/CreatePostModal';
import PostOffersModal from '../components/PostOffersModal';
import PostLikesModal from '../components/PostLikesModal';
import PostMenu from '../components/PostMenu';
import BookingPage from './BookingPage';
import MessengerPage from './MessengerPage';
import { 
  MyProfileTab, 
  MyPointsTab, 
  MyOrdersTab, 
  MySubscriptionsTab, 
  MyFriendsTab, 
  MySettingsTab,
  CreateSubscriptionModal,
  EditProfileModal,
  CreatePageModal,
  ProfileIntro,
  ProviderSettings
} from './ProfilePage';
import { 
  AdminSubscriptionsTab, 
  AdminCouponsTab, 
  AdminPointsTab, 
  AdminAccountingTab, 
  AdminAccountingOverviewTab 
} from '../components/ManagementTabs';
import { motion, AnimatePresence } from 'motion/react';

import { Marker, InfoWindow } from '@react-google-maps/api';
import { UnifiedMap } from '../components/UnifiedMap';

const AvalonIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
  >
    {/* Globe/Community Circle */}
    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="5" />
    {/* Stylized "A" for Avalon */}
    <path d="M30,75 L50,25 L70,75" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M40,60 L60,60" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    {/* Community Dots */}
    <circle cx="25" cy="40" r="4" />
    <circle cx="75" cy="40" r="4" />
    <circle cx="50" cy="85" r="4" />
  </svg>
);

export default function AvalonPage() {
  const { userMode, userCategory, userName, userLocation, activeProfile } = useUser();
  const { appStructure, categories, serviceTabs } = useSettings();
  const { posts, stories, addStory, approvePost, rejectPost, deletePost, sharePost } = usePosts();
  const { addJoinRequest, removeFromJoinRequests } = useCart();
  const [activeAvalonTab, setActiveAvalonTab] = useState(() => {
    const tabs = serviceTabs['avalon'] || [];
    const activeTabs = tabs.filter(t => t.isActive);
    return activeTabs.length > 0 ? activeTabs[0].id : 'home';
  });
  const [activePostsSubTab, setActivePostsSubTab] = useState(() => {
    const cats = categories['avalon'] || [];
    const activeCats = cats.filter(c => c.isActive);
    return activeCats.length > 0 ? activeCats[0].id : 'my-posts';
  });
  const [activeProfileSubTab, setActiveProfileSubTab] = useState('my-profile');
  const [selectedSources, setSelectedSources] = useState<string[]>(['all']);
  const [showSourceFilter, setShowSourceFilter] = useState(false);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isCreatePageModalOpen, setIsCreatePageModalOpen] = useState(false);
  const [viewingOffersFor, setViewingOffersFor] = useState<Post | null>(null);
  const [viewingLikesFor, setViewingLikesFor] = useState<Post | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [claimedOffers, setClaimedOffers] = useState<string[]>([]);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [showJoinOptions, setShowJoinOptions] = useState<string | null>(null);
  const [showBookingOptions, setShowBookingOptions] = useState<string | null>(null);
  const [showContactOptions, setShowContactOptions] = useState<string | null>(null);
  const [showOfferOptions, setShowOfferOptions] = useState<string | null>(null);
  const [messagingData, setMessagingData] = useState<{ post: any, action: 'chat' | 'call', initialMessage?: string } | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const renderIcon = (iconName: string, size: number = 24) => {
    const iconMap: Record<string, any> = {
      MapPin, Camera, Send, Clock, Phone, MessageSquare, Zap, Users, Bell, ChevronDown, MoreHorizontal, Share2, MessageCircle, Star, ThumbsUp, Heart, Plus, Store, Briefcase, Eye, TrendingUp, CheckCircle2, ChevronRight, ChevronLeft, AlertCircle, CheckCircle, Hourglass, Trash2, Edit3, ShieldCheck, Ban, Video, Minus, Tag, Truck, X, User, Navigation, Calendar, Search, Layers, Grid: Layers
    };
    const IconComponent = iconMap[iconName] || Layers;
    return <IconComponent size={size} />;
  };

  // Handle back button for sub-navigation and modals
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state?.type === 'avalon_tab') {
        setActiveAvalonTab(state.id);
      } else if (state?.type === 'avalon_subtab') {
        setActiveAvalonTab('posts');
        setActivePostsSubTab(state.id);
      } else if (state?.type === 'avalon_create_post') {
        setIsCreateModalOpen(true);
      } else {
        setIsCreateModalOpen(false);
        setShowComments(null);
        setShowJoinOptions(null);
        setShowBookingOptions(null);
        setShowContactOptions(null);
        setShowOfferOptions(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSetAvalonTab = (tabId: string) => {
    window.history.pushState({ type: 'avalon_tab', id: tabId }, '');
    setActiveAvalonTab(tabId);
  };

  const handleSetPostsSubTab = (subTabId: string) => {
    window.history.pushState({ type: 'avalon_subtab', id: subTabId }, '');
    setActivePostsSubTab(subTabId);
  };

  const handleOpenCreateModal = () => {
    window.history.pushState({ type: 'avalon_create_post' }, '');
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setEditingPost(null);
    if (window.history.state?.type === 'avalon_create_post') {
      window.history.back();
    } else {
      setIsCreateModalOpen(false);
    }
  };
  const [mapCenter] = useState({ lat: 31.0409, lng: 31.3785 }); // Mansoura
  const [selectedPostOnMap, setSelectedPostOnMap] = useState<any | null>(null);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const showToast = (message: string) => {
    setToast({ message, visible: true });
  };

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => setToast({ ...toast, visible: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  const userCategories = activeProfile.categories;
  const isPage = activeProfile.isPage;

  const toggleLike = (id: string) => {
    setLikedPosts(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const toggleJoin = (id: string) => {
    if (joinedGroups.includes(id)) {
      setJoinedGroups(prev => prev.filter(p => p !== id));
      // In a real app we'd find the specific join request ID, 
      // for this mock we'll just assume we can find it by postId
    } else {
      setShowJoinOptions(id);
    }
  };

  const toggleComments = (id: string) => {
    setShowComments(prev => prev === id ? null : id);
  };

  const handleClaimOffer = (post: any) => {
    if (claimedOffers.includes(post.id)) {
      setClaimedOffers(prev => prev.filter(p => p !== post.id));
    } else {
      setClaimedOffers(prev => [...prev, post.id]);
      // Open messenger with pre-filled message
      setMessagingData({
        post,
        action: 'chat',
        initialMessage: `مرحباً، أود الاستفادة من العرض: ${post.content}`
      });
    }
  };

  const allPosts = posts.filter(p => p.status === 'active' || (p.author === userName && p.status === 'pending')).map(p => ({
    ...p,
    name: p.author,
    time: 'الآن',
    location: p.delivery || p.pickup || 'غير محدد',
    lat: p.lat || 31.0409 + (Math.random() - 0.5) * 0.02,
    lng: p.lng || 31.3785 + (Math.random() - 0.5) * 0.02,
    category: p.category,
    content: p.content,
    budget: p.budget || '',
    offers: 0,
    comments: 0,
    image: p.image || '',
    type: p.type || 'request',
    source: p.source,
    contactMethod: p.contactMethod || 'both',
    isNearby: true,
    isSpecial: Math.random() > 0.8,
    isFriend: Math.random() > 0.7,
    isQuick: Math.random() > 0.9,
    isGroup: p.source.includes('group') || Math.random() > 0.85,
    status: p.status || 'active' as const,
    videoUrl: (p as any).videoUrl,
    merchantName: (p as any).merchantName,
    productName: (p as any).productName,
    price: (p as any).price,
    shares: (p as any).shares || 0,
    likes: Array.isArray(p.likes) ? p.likes.length : (p.likes || 0),
    commentCount: Array.isArray(p.comments) ? p.comments.length : (p.comments || 0)
  }));

  const getFilteredPosts = (feedType: string) => {
    const matchesCategory = (post: any) => !isPage || userCategories.length === 0 || userCategories.some(cat => post.category.includes(cat));
    const matchesSource = (post: any) => {
      if (selectedSources.includes('all')) return true;
      return selectedSources.includes(post.source);
    };

    let filtered = allPosts;

    switch (feedType) {
      case 'my_posts':
        filtered = allPosts.filter(p => p.author === userName);
        break;
      case 'general_feed':
        filtered = allPosts.filter(p => p.author !== userName && (p.type as any) !== 'reel' && matchesCategory(p));
        break;
      case 'nearby_feed':
        filtered = allPosts.filter(p => p.isNearby && matchesCategory(p));
        break;
      case 'special_feed':
        filtered = allPosts.filter(p => p.isSpecial && matchesCategory(p));
        break;
      case 'friends_feed':
        filtered = allPosts.filter(p => p.isFriend && matchesCategory(p));
        break;
      case 'group_feed':
        filtered = allPosts.filter(p => p.isGroup && matchesCategory(p));
        break;
      default:
        filtered = allPosts;
    }

    return filtered.filter(matchesSource);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header Branding & Search Bar */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-600 text-white rounded-xl shadow-lg shadow-red-100">
            <AvalonIcon size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 leading-tight">افالون</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Feeds & Offers Gate</p>
          </div>
        </div>

        <div className="relative flex-1 max-w-[180px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input 
            type="text" 
            placeholder="بحث..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-xl py-2 pr-9 pl-3 text-xs font-medium shadow-sm outline-none focus:ring-2 focus:ring-red-100"
          />
        </div>
      </div>

      {/* Avalon Feed */}
      <div className="space-y-4">
        {(appStructure['avalon'] || [])
          .filter(s => s.isActive && s.tabId === activeAvalonTab && (!s.subTabId || (activeAvalonTab === 'home' ? s.subTabId === activePostsSubTab : s.subTabId === activeProfileSubTab)))
          .sort((a, b) => a.order - b.order)
          .map(section => (
          <div key={section.id} className="space-y-4">
            {/* Section Header */}
            {section.name && section.type !== 'publishing_box' && (
              <div className="flex items-center justify-between px-2">
                <div>
                  <h3 className="text-sm font-black text-gray-800">{section.name}</h3>
                  <p className="text-[10px] font-bold text-gray-400">{section.description}</p>
                </div>
              </div>
            )}

            {/* Section Content based on type */}
            {section.type === 'top_tabs' && (
              <div className="flex items-center gap-2 pb-2 -mx-4 px-4 bg-white/95 backdrop-blur-md z-[60] py-3 sticky top-0">
                <div className="flex overflow-x-auto no-scrollbar gap-2 flex-1">
                  {(serviceTabs['avalon'] || [])
                    .filter(t => t.isActive && (!t.userMode || t.userMode === userMode))
                    .map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => handleSetAvalonTab(tab.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black whitespace-nowrap transition-all ${
                        activeAvalonTab === tab.id 
                        ? 'bg-red-600 text-white shadow-lg shadow-red-100' 
                        : 'bg-white text-gray-500 border border-gray-100'
                      }`}
                    >
                      {renderIcon(tab.icon, 14)}
                      {tab.label}
                    </button>
                  ))}
                </div>
                
                {/* Source Filter Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowSourceFilter(!showSourceFilter)}
                    className={`p-2.5 rounded-2xl border transition-all flex items-center gap-2 ${
                      selectedSources.length > 0 && !selectedSources.includes('all')
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : 'bg-white border-gray-100 text-gray-500'
                    }`}
                  >
                    <Search size={18} />
                    {selectedSources.length > 0 && !selectedSources.includes('all') && (
                      <span className="bg-red-600 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                        {selectedSources.length}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showSourceFilter && (
                      <>
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setShowSourceFilter(false)}
                          className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm"
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute left-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 z-[101] overflow-hidden p-2"
                        >
                          <div className="p-3 border-b border-gray-50 mb-1">
                            <h4 className="text-xs font-black text-gray-900">تصفية حسب المصدر</h4>
                          </div>
                          <div className="space-y-1 max-h-[300px] overflow-y-auto no-scrollbar">
                            {[
                              { id: 'all', label: 'الكل', icon: '✨' },
                              { id: 'avalon', label: 'منشورات العميل', icon: '👤' },
                              { id: 'mercato', label: 'منشورات تجار الميركاتو', icon: '🛒' },
                              { id: 'fresh_mart', label: 'منشورات وكلاء فريش مارت', icon: '🥬' },
                              { id: 'driver', label: 'منشورات السائقين', icon: '🚗' },
                              { id: 'assisto', label: 'منشورات مقدمي الخدمات فى الاسيستو', icon: '🛠️' },
                              { id: 'deals', label: 'منشورات مديري الصفقات فى ديلز', icon: '🏷️' },
                            ].map(source => (
                              <button
                                key={source.id}
                                onClick={() => {
                                  if (source.id === 'all') {
                                    setSelectedSources(['all']);
                                  } else {
                                    setSelectedSources(prev => {
                                      const withoutAll = prev.filter(s => s !== 'all');
                                      if (withoutAll.includes(source.id)) {
                                        const next = withoutAll.filter(s => s !== source.id);
                                        return next.length === 0 ? ['all'] : next;
                                      } else {
                                        return [...withoutAll, source.id];
                                      }
                                    });
                                  }
                                }}
                                className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${
                                  selectedSources.includes(source.id)
                                  ? 'bg-red-50 text-red-600'
                                  : 'hover:bg-gray-50 text-gray-600'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">{source.icon}</span>
                                  <span className="text-[11px] font-bold">{source.label}</span>
                                </div>
                                {selectedSources.includes(source.id) && (
                                  <CheckCircle2 size={16} className="text-red-600" />
                                )}
                              </button>
                            ))}
                          </div>
                          <div className="p-2 mt-1 border-t border-gray-50">
                            <button 
                              onClick={() => setShowSourceFilter(false)}
                              className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-[10px] font-black"
                            >
                              تم
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {section.type === 'main_tabs' && (
              <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 -mx-2 px-2">
                {(categories['avalon'] || [])
                  .filter(c => c.sectionId === section.id && c.isActive)
                  .sort((a, b) => a.order - b.order)
                  .map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleSetPostsSubTab(cat.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black whitespace-nowrap transition-all ${
                        activePostsSubTab === cat.id 
                        ? 'bg-red-600 text-white shadow-sm' 
                        : 'bg-white text-gray-500 border border-gray-100'
                      }`}
                    >
                      {renderIcon(cat.icon, 12)}
                      {cat.name}
                    </button>
                  ))}
              </div>
            )}

            {section.type === 'sub_tabs' && (
              <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 -mx-2 px-2">
                {((categories['avalon'] || []).find(c => c.id === activePostsSubTab)?.subCategories || [])
                  .filter(sub => sub.isActive)
                  .map(sub => (
                    <button
                      key={sub.id}
                      className="px-4 py-2 rounded-xl text-[10px] font-black whitespace-nowrap bg-white text-gray-500 border border-gray-100 hover:bg-gray-50 transition-all"
                    >
                      {renderIcon(sub.icon, 14)}
                      {sub.name}
                    </button>
                  ))}
              </div>
            )}

            {section.type === 'publishing_box' && (
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                <img 
                  src="https://picsum.photos/seed/user/100/100" 
                  alt="User" 
                  className="w-10 h-10 rounded-full object-cover" 
                  referrerPolicy="no-referrer" 
                />
                <button 
                  onClick={handleOpenCreateModal}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 text-right px-5 py-3 rounded-2xl text-sm font-medium text-gray-400 transition-colors"
                >
                  {section.config?.placeholder || (
                    userMode === 'merchant' ? `أضف عرضاً جديداً لـ ${userName} يا تاجرنا...` : 
                    userMode === 'provider' ? 'ماذا تريد أن تقدم من خدمات يا اسيستو؟' : 
                    `ماذا يدور في ذهنك يا ${userMode === 'admin' ? 'مديرنا' : 'صديقي'}؟`
                  )}
                </button>
                <div className="flex gap-2">
                  {(categories['avalon'] || [])
                    .filter(c => c.sectionId === section.id && c.isActive)
                    .sort((a, b) => a.order - b.order)
                    .map(btn => (
                      <button 
                        key={btn.id}
                        onClick={() => setIsCreateModalOpen(true)} 
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title={btn.name}
                      >
                        {renderIcon(btn.icon, 20)}
                      </button>
                    ))}
                  {/* Fallback if no buttons configured and media icons enabled */}
                  {(section.config?.showMediaIcons !== false) && (categories['avalon'] || []).filter(c => c.sectionId === section.id).length === 0 && (
                    <>
                      <button onClick={() => setIsCreateModalOpen(true)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                        <Camera size={20} />
                      </button>
                      <button onClick={() => setIsCreateModalOpen(true)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                        <Plus size={20} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {section.type === 'reels' && (
              <div className="space-y-8">
                {(allPosts as any[]).filter(p => (p.type as any) === 'reel').map((reel: any) => (
                  <motion.div 
                    key={reel.id} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative aspect-[9/16] max-w-sm mx-auto w-full bg-black rounded-[40px] overflow-hidden shadow-2xl border-8 border-gray-900 group"
                  >
                      <video 
                        src={reel.videoUrl} 
                        className="w-full h-full object-cover" 
                        autoPlay 
                        muted 
                        loop 
                        playsInline
                      />
                      
                      {/* Overlay Info */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none"></div>
                      
                      {/* Top Badge */}
                      <div className="absolute top-6 right-6">
                        <div className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg animate-pulse">
                          مباشر الآن
                        </div>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-xl overflow-hidden">
                            <img src={`https://picsum.photos/seed/${reel.merchantName}/100/100`} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-black text-white">{reel.merchantName}</h3>
                              <CheckCircle2 size={14} className="text-blue-400" />
                            </div>
                            <p className="text-[10px] font-bold text-white/60">تاجر موثق • {reel.location}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <h4 className="text-lg font-black text-white leading-tight">{reel.productName}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-black text-red-500">{reel.price}</span>
                            <span className="text-xs font-bold text-white/40 line-through">{(parseFloat(reel.price) * 1.2).toFixed(0)} ج.م</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl text-sm font-black shadow-xl shadow-red-900/40 active:scale-95 transition-all flex items-center justify-center gap-2">
                            <ShoppingCart size={18} />
                            اطلب الآن
                          </button>
                          <button className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all">
                            <MessageCircle size={24} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Side Actions - Floating Glass Style */}
                      <div className="absolute right-4 bottom-40 flex flex-col gap-6">
                        <div className="flex flex-col items-center gap-1">
                          <motion.button 
                            whileTap={{ scale: 0.8 }}
                            className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-white border border-white/20 hover:bg-red-600 transition-all shadow-2xl"
                          >
                            <Heart size={28} />
                          </motion.button>
                          <span className="text-[11px] font-black text-white drop-shadow-md">{reel.likes}</span>
                        </div>
                        
                        <div className="flex flex-col items-center gap-1">
                          <motion.button 
                            whileTap={{ scale: 0.8 }}
                            className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-white border border-white/20 hover:bg-blue-600 transition-all shadow-2xl"
                          >
                            <Share2 size={28} />
                          </motion.button>
                          <span className="text-[11px] font-black text-white drop-shadow-md">{reel.shares}</span>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                          <motion.button 
                            whileTap={{ scale: 0.8 }}
                            className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-white border border-white/20 hover:bg-emerald-600 transition-all shadow-2xl"
                          >
                            <TrendingUp size={28} />
                          </motion.button>
                          <span className="text-[11px] font-black text-white drop-shadow-md">تريند</span>
                        </div>
                      </div>
                  </motion.div>
                ))}
              </div>
            )}

            {section.type === 'map_view' && (
              <div className="h-[500px] rounded-3xl overflow-hidden border border-gray-100 shadow-sm relative">
                <UnifiedMap
                  center={mapCenter}
                  zoom={13}
                >
                  {allPosts.filter(p => p.lat && p.lng).map((post) => (
                    <Marker
                      key={post.id}
                      position={{ lat: post.lat, lng: post.lng }}
                      onClick={() => setSelectedPostOnMap(post)}
                      icon={{
                        url: `https://ui-avatars.com/api/?name=${encodeURIComponent(post.name)}&background=EF4444&color=fff&rounded=true&size=32`,
                        scaledSize: new window.google.maps.Size(32, 32)
                      }}
                    />
                  ))}

                  {selectedPostOnMap && (
                    <InfoWindow
                      position={{ lat: selectedPostOnMap.lat, lng: selectedPostOnMap.lng }}
                      onCloseClick={() => setSelectedPostOnMap(null)}
                    >
                      <div className="p-2 min-w-[200px] text-right" dir="rtl">
                        <div className="flex items-center gap-2 mb-2">
                          <img 
                            src={selectedPostOnMap.image || "https://picsum.photos/seed/post/100/100"} 
                            className="w-10 h-10 rounded-lg object-cover" 
                            alt="" 
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="text-xs font-black text-gray-900">{selectedPostOnMap.name}</div>
                            <div className="text-[10px] text-gray-500">{selectedPostOnMap.category}</div>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-700 line-clamp-2 mb-2">{selectedPostOnMap.content}</p>
                        <button 
                          onClick={() => {
                            setSelectedPostOnMap(null);
                            handleSetAvalonTab('home');
                          }}
                          className="w-full py-1.5 bg-red-600 text-white rounded-lg text-[10px] font-bold"
                        >
                          عرض التفاصيل
                        </button>
                      </div>
                    </InfoWindow>
                  )}
                </UnifiedMap>
              </div>
            )}

            {['my_posts', 'general_feed', 'nearby_feed', 'special_feed', 'friends_feed', 'group_feed'].includes(section.type) && (
              <div className="space-y-4">
                {getFilteredPosts(section.type).map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100"
                  >
                    {/* Post Header */}
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img 
                            src={`https://picsum.photos/seed/${post.author}/100/100`} 
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm" 
                            alt={post.name} 
                            referrerPolicy="no-referrer"
                          />
                          {post.isFriend && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center border-2 border-white">
                              <Users size={10} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-black text-gray-900">{post.name}</h4>
                            {post.source === 'assisto' && <ShieldCheck size={14} className="text-blue-500" />}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                              <Clock size={10} /> {post.time}
                            </span>
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                              {post.category}
                            </span>
                            {post.status === 'pending' && (
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Hourglass size={10} /> قيد المراجعة
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <PostMenu 
                        isOwner={post.author === userName}
                        onEdit={() => {
                          setEditingPost(post as any);
                          setIsCreateModalOpen(true);
                        }}
                        onDelete={() => deletePost(post.id)}
                        onSave={() => showToast('تم حفظ المنشور')}
                        onShare={() => sharePost(post.id, userName)}
                      />
                    </div>

                    {/* Post Content */}
                    <div className="px-4 pb-3">
                      <p className="text-sm text-gray-700 leading-relaxed font-medium">
                        {post.content}
                      </p>
                    </div>

                    {/* Post Media */}
                    {post.image && (
                      <div className="px-4 pb-4">
                        <div className="relative rounded-[24px] overflow-hidden group">
                          <img 
                            src={post.image} 
                            className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105" 
                            alt="Post" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    )}

                    {/* Post Actions */}
                    <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => toggleLike(post.id)}
                          className={`flex items-center gap-1.5 transition-colors ${likedPosts.includes(post.id) ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`}
                        >
                          <Heart size={18} fill={likedPosts.includes(post.id) ? "currentColor" : "none"} />
                          <span className="text-xs font-bold">{post.likes || 0}</span>
                        </button>
                        <button 
                          onClick={() => toggleComments(post.id)}
                          className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          <CommentIcon size={18} />
                          <span className="text-xs font-bold">{(post as any).commentCount || 0}</span>
                        </button>
                        <button 
                          onClick={() => sharePost(post.id, userName)}
                          className="flex items-center gap-1.5 text-gray-500 hover:text-green-600 transition-colors"
                        >
                          <Share2 size={18} />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {post.type === 'group' ? (
                          <button 
                            onClick={() => toggleJoin(post.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                              joinedGroups.includes(post.id)
                              ? 'bg-gray-200 text-gray-600'
                              : 'bg-red-600 text-white shadow-lg shadow-red-100'
                            }`}
                          >
                            {joinedGroups.includes(post.id) ? 'تم طلب الانضمام' : 'انضم الآن'}
                          </button>
                        ) : post.type === 'offer' ? (
                          <button 
                            onClick={() => handleClaimOffer(post)}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                              claimedOffers.includes(post.id)
                              ? 'bg-green-600 text-white'
                              : 'bg-red-600 text-white shadow-lg shadow-red-100'
                            }`}
                          >
                            {claimedOffers.includes(post.id) ? 'تم الاستلام' : 'احصل على العرض'}
                          </button>
                        ) : (
                          <button 
                            onClick={() => setMessagingData({ post, action: 'chat' })}
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-xl text-xs font-black hover:bg-gray-50 transition-all shadow-sm"
                          >
                            تواصل الآن
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {section.type === 'banners' && (
              <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2">
                {[1, 2].map(i => (
                  <div key={i} className="min-w-[260px] h-28 bg-gradient-to-br from-red-500 to-orange-600 rounded-[28px] p-5 text-white relative overflow-hidden flex-shrink-0">
                    <div className="relative z-10">
                      <h4 className="text-base font-black">عرض خاص {i}</h4>
                      <p className="text-[10px] font-bold opacity-80">تصفح أحدث العروض في منطقتك</p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
                  </div>
                ))}
              </div>
            )}

            {section.type === 'profile_tabs' && (
              <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 -mx-2 px-2 bg-white sticky top-[52px] z-[55] py-2 border-b border-gray-50">
                {[
                  { id: 'my-profile', label: 'بروفايلي', icon: 'User' },
                  { id: 'my-subs', label: 'اشتراكاتي', icon: 'Star' },
                  { id: 'my-orders', label: 'طلباتي', icon: 'Package' },
                  { id: 'my-points', label: 'نقاطي', icon: 'Coins' },
                  { id: 'my-coupons', label: 'كوبوناتي', icon: 'Ticket' },
                  { id: 'my-friends', label: 'أصدقائي', icon: 'Users' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveProfileSubTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black whitespace-nowrap transition-all ${
                      activeProfileSubTab === tab.id
                      ? 'bg-red-600 text-white shadow-md shadow-red-100'
                      : 'bg-gray-50 text-gray-500 border border-transparent hover:bg-gray-100'
                    }`}
                  >
                    {renderIcon(tab.icon, 14)}
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {section.type === 'featured_stores' && (
              <div className="grid grid-cols-1 gap-3">
                {posts.filter(p => p.status === 'active').slice(0, 3).map(post => (
                  <div key={post.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-red-100 transition-all group text-right">
                    <div className="flex items-center gap-3">
                      <img src={`https://picsum.photos/seed/user${post.id}/100/100`} className="w-12 h-12 rounded-xl object-cover shadow-sm" referrerPolicy="no-referrer" />
                      <div>
                        <h4 className="text-xs font-black text-gray-900">{post.author}</h4>
                        <p className="text-[9px] font-bold text-gray-400">{post.category}</p>
                      </div>
                    </div>
                    <ChevronLeft size={16} className="text-gray-300" />
                  </div>
                ))}
              </div>
            )}

            {section.type === 'profile_intro' && (
              <ProfileIntro onOpenEditProfile={() => setIsEditProfileModalOpen(true)} />
            )}

            {section.type === 'points_balance' && (
              <MyPointsTab />
            )}

            {section.type === 'coupons_list' && (
              <div className="px-4 space-y-4">
                <h3 className="text-sm font-black text-gray-900 px-1">كوبوناتي المتاحة</h3>
                {[
                  { title: 'خصم 20% على أول طلب', code: 'WELCOME20', expiry: 'ينتهي في 15 أبريل', color: 'from-red-500 to-orange-500' },
                  { title: 'توصيل مجاني للمنزل', code: 'FREE_SHIP', expiry: 'ينتهي في 20 أبريل', color: 'from-blue-500 to-indigo-500' },
                ].map((coupon, idx) => (
                  <div key={idx} className="bg-white rounded-[32px] shadow-lg border border-gray-100 overflow-hidden flex">
                    <div className={`w-24 bg-gradient-to-br ${coupon.color} flex flex-col items-center justify-center text-white p-4 relative`}>
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-gray-50 rounded-full" />
                      <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-gray-50 rounded-full" />
                      <Tag size={24} className="opacity-50 mb-1" />
                      <p className="text-[10px] font-black">COUPON</p>
                    </div>
                    <div className="flex-1 p-5 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-black text-gray-900">{coupon.title}</h4>
                        <p className="text-[9px] font-bold text-gray-400 mt-1">{coupon.expiry}</p>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-[10px] font-black text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-100">
                          {coupon.code}
                        </span>
                        <button className="text-[10px] font-black text-gray-400 hover:text-red-600 transition-colors">نسخ الرمز</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {section.type === 'coupons_redeem' && (
              <div className="px-4">
                <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                      <Tag size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-gray-900">استبدال كوبون</h3>
                      <p className="text-[10px] font-bold text-gray-400">أدخل الرمز للحصول على المكافأة</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="أدخل رمز الكوبون هنا..." 
                      className="flex-1 bg-gray-50 border-none rounded-2xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-red-500/20 transition-all text-center uppercase tracking-widest"
                    />
                    <button className="bg-red-600 text-white px-6 py-3.5 rounded-2xl text-xs font-black shadow-lg shadow-red-100 active:scale-95 transition-all">
                      تفعيل
                    </button>
                  </div>
                </div>
              </div>
            )}

            {section.type === 'orders_active' && (
              <MyOrdersTab onSelectOrder={setSelectedOrder} />
            )}

            {section.type === 'friends_list' && (
              <MyFriendsTab />
            )}

            {section.type === 'subscription_system' && (
              <MySubscriptionsTab onAddSubscription={() => setShowSubscriptionModal(true)} />
            )}

            {section.type === 'my_settings' && (
              <MySettingsTab />
            )}

            {section.type === 'mgmt_subscriptions' && (
              <div className="px-4">
                <AdminSubscriptionsTab />
              </div>
            )}

            {section.type === 'mgmt_points' && (
              <div className="px-4">
                <AdminPointsTab />
              </div>
            )}

            {section.type === 'mgmt_coupons' && (
              <div className="px-4">
                <AdminCouponsTab />
              </div>
            )}

            {section.type === 'mgmt_accounting' && (
              <div className="px-4">
                <AdminAccountingOverviewTab />
                <div className="mt-6">
                  <AdminAccountingTab />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <CreatePostModal 
        isOpen={isCreateModalOpen} 
        onClose={handleCloseCreateModal} 
        initialData={editingPost}
      />

      <AnimatePresence>
        {messagingData && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[300] bg-white"
          >
            <MessengerPage 
              onClose={() => setMessagingData(null)} 
              initialUser={{
                id: messagingData.post.authorId || messagingData.post.name, 
                name: messagingData.post.author || messagingData.post.name,
                avatar: messagingData.post.avatar || `https://picsum.photos/seed/user${messagingData.post.id}/100/100`
              }}
              initialAction={messagingData.action}
              initialMessage={messagingData.initialMessage}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Integration Modals */}
      <AnimatePresence>
        {showSubscriptionModal && (
          <CreateSubscriptionModal onClose={() => setShowSubscriptionModal(false)} />
        )}
      </AnimatePresence>

      <EditProfileModal 
        isOpen={isEditProfileModalOpen} 
        onClose={() => setIsEditProfileModalOpen(false)} 
        profile={{}} 
        onOpenMap={() => {}} 
      />

      <CreatePageModal 
        isOpen={isCreatePageModalOpen} 
        onClose={() => setIsCreatePageModalOpen(false)} 
        onCreate={() => {}} 
      />
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-4 right-4 z-[300] flex justify-center"
          >
            <div className="bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
              <div className="p-1 bg-red-600 rounded-lg">
                <AvalonIcon size={14} className="text-white" />
              </div>
              <span className="text-sm font-bold">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
