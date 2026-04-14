import React, { useState, useEffect } from 'react';
import { CATEGORY_MAP, Category } from '../constants/categories';
import { 
  User, 
  Package, 
  Star, 
  CreditCard, 
  Settings, 
  MapPin, 
  Heart, 
  Clock, 
  ChevronLeft,
  Ticket,
  Camera,
  Edit2,
  Phone,
  MessageCircle,
  Share2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  XCircle,
  UserMinus,
  Ban,
  ArrowRight,
  History,
  Coins,
  Zap,
  Truck,
  Plus,
  Send,
  MoreHorizontal,
  ThumbsUp,
  MessageCircle as CommentIcon,
  Store,
  Briefcase,
  BarChart3,
  ClipboardList,
  Wallet,
  Shield,
  Users,
  UserPlus,
  Flag,
  Database,
  Rocket,
  TrendingUp,
  Search,
  Trash2,
  Handshake,
  Utensils,
  Car,
  Wrench,
  Navigation,
  Mail,
  Facebook,
  Instagram,
  Image as ImageIcon,
  Video,
  Tag,
  GraduationCap,
  Music,
  Target,
  Map,
  Globe,
  Lock,
  Eye,
  FileText,
  ChevronDown,
  Home,
  List,
  ShoppingCart,
  Pill,
  Laptop,
  Cookie,
  Beef,
  Sparkles,
  Shirt,
  LayoutGrid,
  Layers,
  Check,
  Cpu,
  Gift,
  Gamepad2,
  ShoppingBag,
  Pencil,
  Armchair,
  Stethoscope,
  Building2,
  CarFront,
  Landmark,
  ShieldCheck,
  Coffee,
  Fish,
  Croissant,
  Apple,
  Leaf,
  IceCream,
  Info,
  UtensilsCrossed
} from 'lucide-react';
import { EGYPT_CITIES } from '../locationData';
import OrderTracking from '../components/OrderTracking';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { signOut } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  limit,
  doc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { useUser, UserMode } from '../context/UserContext';
import { useOrderNotifications } from '../hooks/useOrderNotifications';
import { usePosts, Post } from '../context/PostContext';
import { useChat } from '../context/ChatContext';
import { useSettings } from '../context/SettingsContext';
import { SUPPORT_USER_IDS } from '../constants';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import PostOffersModal from '../components/PostOffersModal';
import PostLikesModal from '../components/PostLikesModal';
import PostMenu from '../components/PostMenu';
import MapPickerModal from '../components/MapPickerModal';

export default function ProfilePage({ initialTab = 'my-profile', isEmbedded = false }: { initialTab?: string, isEmbedded?: boolean }) {
  const { 
    userMode, 
    userName, 
    userLocation, 
    profiles, 
    activeProfileId, 
    switchProfile, 
    createProfile, 
    deleteProfile, 
    activeProfile, 
    updateProfileDetails,
    currentCity,
    currentRegion
  } = useUser();
  const { posts, deletePost, updatePost } = usePosts();
  const { getOrCreateChat } = useChat();
  const { appStructure, serviceTabs, resetServiceToDefaults } = useSettings();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // History management for ProfilePage
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.type === 'profile_tab') {
        setActiveTab(event.state.tab);
      } else if (!event.state) {
        // Default state
        setActiveTab(initialTab);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Initial state
    if (!window.history.state) {
      window.history.replaceState({ type: 'profile_tab', tab: initialTab }, '');
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, [initialTab]);

  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab);
    window.history.pushState({ type: 'profile_tab', tab }, '');
  };

  const renderIcon = (iconName: string, size: number = 24) => {
    const iconMap: Record<string, any> = {
      User, Package, Star, CreditCard, Settings, MapPin, Heart, Clock, 
      ChevronLeft, Ticket, Camera, Edit2, Phone, MessageCircle, Share2, 
      Calendar, CheckCircle2, AlertCircle, RefreshCw, XCircle, UserMinus, 
      Ban, ArrowRight, History, Coins, Zap, Truck, Plus, Send, MoreHorizontal, 
      ThumbsUp, Store, Briefcase, BarChart3, ClipboardList, Wallet, Shield, 
      Users, UserPlus, Flag, Database, Rocket, TrendingUp, Search, Trash2, Handshake, 
      Utensils, Car, Wrench, Navigation, Mail, Facebook, Instagram, Video, 
      Tag, GraduationCap, Music, Target, Map, Globe, Lock, Eye, FileText, 
      ChevronDown, Home, List, ShoppingCart, Pill, Laptop, Cookie, Beef, 
      Sparkles, Shirt, LayoutGrid, Layers, Check, Cpu, Gift, Gamepad2, 
      ShoppingBag, Pencil, Armchair, Stethoscope, Building2, CarFront, 
      Landmark, ShieldCheck, Coffee, Fish, Croissant, Apple, Leaf, IceCream, 
      Info, UtensilsCrossed, SettingsIcon: Settings
    };
    const IconComponent = iconMap[iconName] || User;
    return <IconComponent size={size} />;
  };

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatePageModalOpen, setIsCreatePageModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [viewingOffersFor, setViewingOffersFor] = useState<Post | null>(null);
  const [viewingLikesFor, setViewingLikesFor] = useState<Post | null>(null);
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (selectedOrder) {
    return <OrderTracking order={selectedOrder} onBack={() => setSelectedOrder(null)} />;
  }

  const tabs = (serviceTabs['profile'] || [])
    .filter(t => t.isActive && (t.userMode === 'all' || t.userMode === userMode))
    .sort((a, b) => a.order - b.order);

  const renderSection = (section: any) => {
    switch (section.type) {
      case 'profile_header':
        return userMode !== 'admin' && (
          <div key={section.id} className="relative bg-white">
            <div className="h-48 w-full bg-gray-200 relative overflow-hidden">
              <img src={activeProfile.cover || (activeProfile.mode === 'user' ? "https://picsum.photos/seed/cover/800/400" : `https://picsum.photos/seed/cover-${activeProfile.id}/800/400`)} alt="Cover" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <button 
                onClick={() => setIsEditProfileModalOpen(true)}
                className="absolute bottom-4 left-4 p-2 bg-white rounded-full text-gray-900 shadow-md hover:bg-gray-100 transition-all"
              >
                <Camera size={18} />
              </button>
            </div>
            <div className="px-4 -mt-16 relative z-10 flex flex-col items-center">
              <div className="relative">
                <img 
                  src={activeProfile.avatar || `https://picsum.photos/seed/${activeProfile.id}/200/200`} 
                  alt="Avatar" 
                  className="w-40 h-40 rounded-full border-4 border-white shadow-md object-cover"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => setIsEditProfileModalOpen(true)}
                  className="absolute bottom-2 right-2 p-2 bg-gray-200 rounded-full text-gray-900 border-2 border-white shadow-md"
                >
                  <Camera size={18} />
                </button>
              </div>
              <div className="mt-3 text-center w-full px-4">
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-2xl font-black text-gray-900">{activeProfile.name || userName}</h2>
                  <button 
                    onClick={() => setShowProfileSwitcher(!showProfileSwitcher)}
                    className="p-1.5 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-all"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>

                <AnimatePresence>
                  {showProfileSwitcher && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-4 bg-white rounded-3xl p-3 border border-gray-100 shadow-xl w-full max-w-sm mx-auto z-50"
                    >
                      <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-right px-2 mb-1">تبديل الحساب</p>
                        {(profiles || []).map(profile => (
                          <button
                            key={profile.id}
                            onClick={() => {
                              switchProfile(profile.id);
                              setShowProfileSwitcher(false);
                            }}
                            className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${
                              activeProfileId === profile.id 
                                ? 'bg-red-50 border border-red-100' 
                                : 'hover:bg-gray-50 border border-transparent'
                            }`}
                          >
                            <img src={profile.avatar || `https://picsum.photos/seed/${profile.id}/100/100`} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                            <div className="text-right flex-1">
                              <p className={`text-sm font-black ${activeProfileId === profile.id ? 'text-red-600' : 'text-gray-900'}`}>{profile.name}</p>
                              <p className="text-[10px] font-bold text-gray-500">
                                {profile.mode === 'user' ? 'حساب شخصي' : 
                                 profile.mode === 'merchant' ? 'تاجر' : 
                                 profile.mode === 'driver' ? 'سائق' : 
                                 profile.mode === 'provider' ? 'مقدم خدمة' : 
                                 (profile.mode === 'deal_manager' || profile.mode === 'deal_provider') ? 'مدير صفقات' : 'وكيل فريش مارت'}
                              </p>
                            </div>
                            {activeProfileId === profile.id && (
                              <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                                <CheckCircle2 size={12} className="text-white" />
                              </div>
                            )}
                          </button>
                        ))}
                        <div className="h-[1px] bg-gray-100 my-1" />
                        <button 
                          onClick={() => {
                            setIsCreatePageModalOpen(true);
                            setShowProfileSwitcher(false);
                          }}
                          className="flex items-center gap-3 p-3 rounded-2xl hover:bg-red-50 transition-all text-red-600 group"
                        >
                          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                            <Plus size={20} />
                          </div>
                          <p className="text-sm font-black">إنشاء صفحة جديدة</p>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <p className="text-sm font-bold text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">
                  {activeProfile.description || (userMode === 'merchant' 
                    ? 'نقدم لكم أفضل المنتجات والخدمات بجودة عالية وأسعار تنافسية. خدمة متميزة وتوصيل سريع لجميع المناطق.'
                    : 'مستخدم نشط في مجتمع Hagat. أبحث دائماً عن أفضل العروض والخدمات المتميزة.')}
                </p>

                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-gray-600 bg-white border border-gray-100 px-3 py-1.5 rounded-xl shadow-sm">
                    <MapPin size={14} className="text-red-500" />
                    {activeProfile.location || userLocation}
                  </div>
                  {userMode !== 'user' && (
                    <>
                      <div className="flex items-center gap-1.5 text-[11px] font-black text-gray-600 bg-white border border-gray-100 px-3 py-1.5 rounded-xl shadow-sm">
                        <Star size={14} className="text-amber-500 fill-amber-500" />
                        0.0 (0 تقييم)
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-black text-gray-600 bg-white border border-gray-100 px-3 py-1.5 rounded-xl shadow-sm">
                        <Clock size={14} className="text-blue-500" />
                        نشط حالياً
                      </div>
                    </>
                  )}
                </div>
              </div>

                <div className="flex gap-3 mt-6 w-full px-4">
                  {(userMode as string) === 'admin' && (
                    <button 
                      onClick={() => navigate('/admin')}
                      className="flex-1 bg-slate-900 text-white py-3.5 rounded-2xl text-sm font-black shadow-xl shadow-slate-100 flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      <ShieldCheck size={18} />
                      <span>لوحة التحكم</span>
                    </button>
                  )}
                  <button 
                    onClick={() => setShowSubscriptionModal(true)}
                    className="flex-1 bg-amber-500 text-white py-3.5 rounded-2xl text-sm font-black shadow-xl shadow-amber-100 flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <Plus size={18} />
                    <span>إضافة اشتراك</span>
                  </button>
                </div>
                <div className="flex gap-3 mt-3 w-full px-4">
                  <button 
                    onClick={() => setIsEditProfileModalOpen(true)}
                    className="flex-1 bg-red-600 text-white py-3.5 rounded-2xl text-sm font-black shadow-xl shadow-red-100 flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <Edit2 size={18} />
                    <span>تعديل البروفايل</span>
                  </button>
                  <button 
                    onClick={() => {
                    let supportType = 'customer';
                    if (userMode === 'merchant') supportType = 'mercato';
                    if (userMode === 'provider') supportType = 'assisto';
                    if (userMode === 'driver') supportType = 'wasalny';
                    if (userMode === 'deal_manager') supportType = 'deals';
                    if (userMode === 'restaurant') supportType = 'freshmart';

                    window.dispatchEvent(new CustomEvent('open-support-chat', { 
                      detail: { type: supportType } 
                    }));
                  }}
                  className="flex-1 bg-white border-2 border-red-600 text-red-600 py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-red-50"
                >
                  <MessageCircle size={18} />
                  <span>دعم الإدارة</span>
                </button>
              </div>
            </div>
          </div>
        );
      case 'profile_intro':
        return (
          <div key={section.id} className="px-4 py-4">
            <ProfileIntro onOpenEditProfile={() => setIsEditProfileModalOpen(true)} />
          </div>
        );
      case 'stats_bar':
        return (
          <div key={section.id} className="flex justify-center gap-8 mt-6">
            <div className="text-center">
              <p className="text-lg font-black text-gray-900">0</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">متابع</p>
            </div>
            <div className="h-8 w-[1px] bg-gray-100 self-center" />
            <div className="text-center">
              <p className="text-lg font-black text-gray-900">0</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">متابعة</p>
            </div>
            <div className="h-8 w-[1px] bg-gray-100 self-center" />
            <div className="text-center">
              <p className="text-lg font-black text-gray-900">
                {posts.filter(p => p.author === (activeProfile.name || userName)).length}
              </p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">منشور</p>
            </div>
          </div>
        );
      case 'reels':
        return (
          <div key={section.id} className="space-y-8 px-4">
            {posts.filter(p => p.type === 'reel' && p.author === (activeProfile.name || userName)).map((reel: any) => (
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-lg font-black text-white leading-tight">{reel.productName}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-red-500">{reel.price}</span>
                      </div>
                    </div>
                  </div>
              </motion.div>
            ))}
          </div>
        );
      case 'publishing_box':
        return (
          <div key={section.id} className="bg-white rounded-[32px] p-4 shadow-sm border border-gray-100 mx-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl shadow-inner overflow-hidden">
                {activeProfile?.avatar ? (
                  <img src={activeProfile.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  "👤"
                )}
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-400 text-right px-6 py-4 rounded-2xl text-xs font-bold transition-all border border-gray-50"
              >
                بماذا تفكر يا {activeProfile.name || userName}؟
              </button>
              <div className="flex gap-2">
                <button onClick={() => setIsCreateModalOpen(true)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                  <Camera size={20} />
                </button>
                <button onClick={() => setIsCreateModalOpen(true)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>
        );
      case 'my_posts':
        return (
          <div key={section.id} className="space-y-4 px-4">
            {posts.filter(p => p.type !== 'reel' && p.author === (activeProfile.name || userName)).map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                onLike={() => {}} 
                onComment={() => {}} 
                onShare={() => {}}
                onDelete={() => deletePost(post.id)} 
                onViewOffers={() => setViewingOffersFor(post)}
                onEdit={() => { setEditingPost(post); setIsCreateModalOpen(true); }}
                onViewLikes={() => setViewingLikesFor(post)}
                showComments={false}
                commentText=""
                setCommentText={() => {}}
                handleComment={() => {}}
              />
            ))}
          </div>
        );
      case 'top_tabs':
        return (
          <div key={section.id} className="mt-6 px-4">
            <div className="flex gap-1 overflow-x-auto pb-2 no-scrollbar -mx-2 px-2">
              {(tabs || []).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleSetActiveTab(tab.id)}
                  className={`flex-shrink-0 flex flex-col items-center justify-center gap-1 px-1 py-2 rounded-xl text-[9px] font-black transition-all text-center min-w-[64px] ${
                    activeTab === tab.id
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-white text-gray-500 border border-gray-100'
                  }`}
                >
                  {tab.icon && renderIcon(tab.icon as string, 16)}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        );
      case 'tab_content':
        return (
          <div key={section.id} className="flex-1 px-4 py-4">
            {renderTabContent()}
          </div>
        );
      case 'my_orders':
        return (
          <div key={section.id} className="px-4 py-4">
            <MyOrdersTab onSelectOrder={setSelectedOrder} />
          </div>
        );
      case 'my_points':
        return (
          <div key={section.id} className="px-4 py-4">
            <MyPointsTab />
          </div>
        );
      case 'my_friends':
        return (
          <div key={section.id} className="px-4 py-4">
            <MyFriendsTab />
          </div>
        );
      case 'my_subs':
        return (
          <div key={section.id} className="px-4 py-4">
            <MySubscriptionsTab onAddSubscription={() => setShowSubscriptionModal(true)} />
          </div>
        );
      case 'my_ratings':
        return (
          <div key={section.id} className="px-4 py-4">
            <MyRatingsTab />
          </div>
        );
      case 'my_settings':
        return (
          <div key={section.id} className="px-4 py-4">
            <MySettingsTab />
          </div>
        );
      case 'my_wallet':
        return (
          <div key={section.id} className="px-4 py-4">
            <MyWalletTab />
          </div>
        );
      case 'subscription_system':
        return (
          <div key={section.id} className="px-4 py-4">
            <MySubscriptionsTab onAddSubscription={() => setShowSubscriptionModal(true)} />
          </div>
        );
      case 'points_balance':
        return (
          <div key={section.id} className="px-4 mt-6">
            <div className="bg-gradient-to-br from-amber-400 to-orange-600 p-6 rounded-[32px] text-white shadow-xl shadow-orange-100 relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">رصيد النقاط الحالي</p>
                <div className="flex items-center gap-3 mt-1">
                  <Zap size={32} className="fill-white" />
                  <h2 className="text-4xl font-black">2,450</h2>
                </div>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold bg-white/20 w-fit px-3 py-1 rounded-full">
                  <TrendingUp size={12} />
                  <span>ربحت 150 نقطة هذا الأسبوع</span>
                </div>
              </div>
              <div className="absolute -right-8 -bottom-8 opacity-10 rotate-12">
                <Zap size={160} />
              </div>
            </div>
          </div>
        );
      case 'points_history':
        return (
          <div key={section.id} className="px-4 mt-6 space-y-3">
            <h3 className="text-sm font-black text-gray-900 px-1">سجل العمليات</h3>
            <div className="bg-white rounded-[32px] border border-gray-100 divide-y divide-gray-50 overflow-hidden shadow-sm">
              {[
                { title: 'طلب من مطعم كنتاكي', points: '+45', date: 'اليوم، 12:30 م', type: 'earn' },
                { title: 'استبدال قسيمة شراء', points: '-500', date: 'أمس، 09:15 م', type: 'spend' },
                { title: 'مكافأة تسجيل يومي', points: '+10', date: '10 أبريل، 08:00 ص', type: 'earn' },
              ].map((item, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.type === 'earn' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {item.type === 'earn' ? <Plus size={18} /> : <Zap size={18} />}
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-900">{item.title}</p>
                      <p className="text-[10px] font-bold text-gray-400">{item.date}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-black ${item.type === 'earn' ? 'text-green-600' : 'text-red-600'}`}>
                    {item.points}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'points_offers':
        return (
          <div key={section.id} className="mt-6">
            <div className="px-4 mb-3 flex items-center justify-between">
              <h3 className="text-sm font-black text-gray-900">عروض الاستبدال</h3>
              <button className="text-[10px] font-bold text-red-600">عرض الكل</button>
            </div>
            <div className="flex gap-4 overflow-x-auto px-4 pb-2 no-scrollbar">
              {[
                { title: 'قسيمة 50 ج.م', cost: '500 نقطة', color: 'from-blue-500 to-indigo-600' },
                { title: 'توصيل مجاني', cost: '200 نقطة', color: 'from-emerald-500 to-teal-600' },
                { title: 'وجبة مجانية', cost: '1200 نقطة', color: 'from-red-500 to-rose-600' },
              ].map((offer, idx) => (
                <div key={idx} className={`flex-shrink-0 w-40 p-4 rounded-3xl bg-gradient-to-br ${offer.color} text-white shadow-lg`}>
                  <Gift size={24} className="mb-3 opacity-80" />
                  <p className="text-xs font-black leading-tight">{offer.title}</p>
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <p className="text-[10px] font-bold opacity-80">التكلفة</p>
                    <p className="text-sm font-black">{offer.cost}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'orders_active':
        return (
          <div key={section.id} className="px-4 mt-6 space-y-4">
            <h3 className="text-sm font-black text-gray-900 px-1">طلبات نشطة</h3>
            {[
              { id: 'ORD-8821', status: 'preparing', total: 450, items: [{ name: 'بيتزا عائلية', quantity: 1 }] },
            ].map(order => (
              <div key={order.id} className="bg-white p-5 rounded-[32px] shadow-xl border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                      <Package size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-gray-900">طلب #{order.id.slice(-4)}</h4>
                      <p className="text-[10px] font-bold text-gray-400">قيد التجهيز</p>
                    </div>
                  </div>
                  <div className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black">
                    جاري التجهيز
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-3 mb-4">
                  <p className="text-[10px] font-bold text-gray-400 mb-1">الأصناف:</p>
                  <div className="flex flex-wrap gap-1">
                    {order.items.map((item, idx) => (
                      <span key={idx} className="bg-white border border-gray-100 px-2 py-1 rounded-lg text-[9px] font-bold text-gray-600">
                        {item.name} ({item.quantity})
                      </span>
                    ))}
                  </div>
                </div>
                <button className="w-full bg-red-600 text-white py-3.5 rounded-2xl text-xs font-black shadow-lg shadow-red-100 flex items-center justify-center gap-2">
                  <Navigation size={16} />
                  تتبع الطلب
                </button>
              </div>
            ))}
          </div>
        );
      case 'orders_history':
        return (
          <div key={section.id} className="px-4 mt-6 space-y-3">
            <h3 className="text-sm font-black text-gray-900 px-1">سجل الطلبات</h3>
            <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm divide-y divide-gray-50">
              {[
                { id: 'ORD-7712', date: 'أمس، 08:00 م', total: 120, status: 'delivered' },
                { id: 'ORD-6654', date: '8 أبريل، 02:30 م', total: 850, status: 'delivered' },
              ].map(order => (
                <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center">
                      <History size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-900">طلب #{order.id.slice(-4)}</p>
                      <p className="text-[10px] font-bold text-gray-400">{order.date}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-gray-900">{order.total} ج.م</p>
                    <p className="text-[9px] font-bold text-green-500">مكتمل</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'friends_requests':
        return (
          <div key={section.id} className="px-4 mt-6 space-y-3">
            <h3 className="text-sm font-black text-gray-900 px-1">طلبات الصداقة</h3>
            {[
              { name: 'أحمد كمال', avatar: 'https://picsum.photos/seed/friend1/100/100', mutual: 5 },
              { name: 'سارة محمود', avatar: 'https://picsum.photos/seed/friend2/100/100', mutual: 12 },
            ].map((req, idx) => (
              <div key={idx} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <img src={req.avatar} alt="" className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm" />
                  <div>
                    <p className="text-sm font-black text-gray-900">{req.name}</p>
                    <p className="text-[10px] font-bold text-gray-400">{req.mutual} صديق مشترك</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-red-100">
                    <Check size={18} />
                  </button>
                  <button className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center">
                    <XCircle size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      case 'friends_list':
        return (
          <div key={section.id} className="px-4 mt-6 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-black text-gray-900">الأصدقاء (45)</h3>
              <div className="relative">
                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="بحث..." className="bg-white border border-gray-100 rounded-xl py-2 pr-9 pl-3 text-[10px] font-bold w-32 focus:w-48 transition-all" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <img src={`https://picsum.photos/seed/f${i}/100/100`} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                  </div>
                  <p className="text-[9px] font-black text-gray-800 text-center truncate w-full">صديق {i}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'subs_active':
        return (
          <div key={section.id} className="px-4 mt-6 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-black text-gray-900">اشتراكاتي النشطة</h3>
              <button 
                onClick={() => setShowSubscriptionModal(true)}
                className="flex items-center gap-1 text-[10px] font-black text-red-600 bg-red-50 px-3 py-1.5 rounded-xl"
              >
                <Plus size={12} />
                إضافة اشتراك
              </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400">نشطة</p>
                  <p className="text-lg font-black text-gray-900">{MOCK_SUBSCRIPTIONS.filter(s => s.status === 'active').length}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400">المدفوعات</p>
                  <p className="text-lg font-black text-gray-900">
                    {MOCK_SUBSCRIPTIONS.reduce((acc, curr) => acc + parseInt(curr.price), 0).toLocaleString()} ج.م
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-[32px] shadow-xl border border-gray-100 space-y-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-br-2xl text-[10px] font-black border-b border-r border-emerald-100">
                نشط
              </div>
              <div className="flex gap-4 pt-2">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <Store size={24} />
                </div>
                <div>
                  <h4 className="text-base font-black text-gray-900">باقة الميركاتو الذهبية</h4>
                  <p className="text-xs font-bold text-gray-500 mt-1 flex items-center gap-1">
                    <Zap size={12} className="text-amber-500" />
                    متجر كارفور
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-2xl">
                  <p className="text-[9px] font-black text-gray-400 uppercase">التكلفة</p>
                  <p className="text-xs font-black text-gray-900">250 ج.م / شهر</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl">
                  <p className="text-[9px] font-black text-gray-400 uppercase">التجديد</p>
                  <p className="text-xs font-black text-gray-900">25 أبريل 2026</p>
                </div>
              </div>
              <button className="w-full py-3.5 bg-gray-900 text-white text-xs font-black rounded-2xl shadow-lg active:scale-95 transition-all">
                إدارة الاشتراك
              </button>
            </div>
          </div>
        );
      case 'subs_plans':
        return (
          <div key={section.id} className="mt-6">
            <div className="px-4 mb-3 flex items-center justify-between">
              <h3 className="text-sm font-black text-gray-900">باقات مقترحة</h3>
              <button className="text-[10px] font-bold text-red-600">اكتشف المزيد</button>
            </div>
            <div className="flex gap-4 overflow-x-auto px-4 pb-2 no-scrollbar">
              {[
                { title: 'توصيل مدارس', price: '400 ج.م', icon: GraduationCap, color: 'bg-orange-50 text-orange-600' },
                { title: 'وجبات يومية', price: '1200 ج.م', icon: Utensils, color: 'bg-red-50 text-red-600' },
                { title: 'صيانة منزلية', price: '150 ج.م', icon: Wrench, color: 'bg-emerald-50 text-emerald-600' },
              ].map((plan, idx) => (
                <div key={idx} className="flex-shrink-0 w-40 bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm text-center">
                  <div className={`w-12 h-12 ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                    <plan.icon size={24} />
                  </div>
                  <p className="text-xs font-black text-gray-900">{plan.title}</p>
                  <p className="text-sm font-black text-red-600 mt-1">{plan.price}</p>
                  <button className="mt-4 w-full py-2 bg-gray-50 text-gray-500 text-[10px] font-black rounded-xl hover:bg-red-50 hover:text-red-600 transition-all">
                    اشترك الآن
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'coupons_redeem':
        return (
          <div key={section.id} className="px-4 mt-6">
            <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                  <Ticket size={20} />
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
        );
      case 'coupons_list':
        return (
          <div key={section.id} className="px-4 mt-6 space-y-4">
            <h3 className="text-sm font-black text-gray-900 px-1">كوبوناتي المتاحة</h3>
            {[
              { title: 'خصم 20% على أول طلب', code: 'WELCOME20', expiry: 'ينتهي في 15 أبريل', color: 'from-red-500 to-orange-500' },
              { title: 'توصيل مجاني للمنزل', code: 'FREE_SHIP', expiry: 'ينتهي في 20 أبريل', color: 'from-blue-500 to-indigo-500' },
            ].map((coupon, idx) => (
              <div key={idx} className="bg-white rounded-[32px] shadow-lg border border-gray-100 overflow-hidden flex">
                <div className={`w-24 bg-gradient-to-br ${coupon.color} flex flex-col items-center justify-center text-white p-4 relative`}>
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-gray-50 rounded-full" />
                  <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-gray-50 rounded-full" />
                  <Ticket size={24} className="opacity-50 mb-1" />
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
        );
      case 'my_pages':
        return (
          <div key={section.id} className="px-4 py-4">
            <MyPagesTab onSwitch={switchProfile} onDelete={deleteProfile} onCreate={() => setIsCreatePageModalOpen(true)} />
          </div>
        );
      case 'provider_settings':
        return (
          <div key={section.id} className="px-4 py-4">
            <ProviderSettings />
          </div>
        );
      default:
        return null;
    }
  };

  const renderTabContent = () => {
    const tabSections = (appStructure['profile'] || [])
      .filter(s => s.isActive && s.tabId === activeTab)
      .sort((a, b) => a.order - b.order);

    if (tabSections.length > 0) {
      return (
        <div className="space-y-4">
          {tabSections.map(section => renderSection(section))}
        </div>
      );
    }

    switch (activeTab) {
      case 'my-profile': return <MyProfileTab onOpenEditProfile={() => setIsEditProfileModalOpen(true)} onViewOffers={setViewingOffersFor} onEditPost={(post) => { setEditingPost(post); setIsCreateModalOpen(true); }} onViewLikes={setViewingLikesFor} onCreatePost={() => setIsCreateModalOpen(true)} />;
      case 'my-points': return <MyPointsTab />;
      case 'my-orders': return <MyOrdersTab onSelectOrder={setSelectedOrder} />;
      case 'my-ratings': return <MyRatingsTab />;
      case 'my-subs': return <MySubscriptionsTab onAddSubscription={() => setShowSubscriptionModal(true)} />;
      case 'my-friends': return <MyFriendsTab />;
      case 'my-settings': return <MySettingsTab />;
      case 'my-shop': return <MyShopTab />;
      case 'my-sales': return <MySalesTab />;
      case 'my-services': return <MyServicesTab />;
      case 'my-schedule': return <MyScheduleTab />;
      case 'my-wallet':
      case 'my-earnings': return <MyWalletTab />;
      case 'my-pages': return <MyPagesTab onSwitch={switchProfile} onDelete={deleteProfile} onCreate={() => setIsCreatePageModalOpen(true)} />;
      default: return <MyProfileTab onOpenEditProfile={() => setIsEditProfileModalOpen(true)} onViewOffers={setViewingOffersFor} onEditPost={(post) => { setEditingPost(post); setIsCreateModalOpen(true); }} onViewLikes={setViewingLikesFor} onCreatePost={() => setIsCreateModalOpen(true)} />;
    }
  };

  return (
    <div className={`flex flex-col min-h-full ${isEmbedded ? '' : 'bg-gray-50'}`}>
      {/* Header Branding */}
      {!isEmbedded && (
        <div className="flex items-center gap-3 mb-2 p-4 pb-0">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => window.history.back()}
            className="p-2 bg-white text-gray-400 rounded-xl shadow-sm border border-gray-100 hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all active:scale-90"
          >
            <ArrowRight size={24} />
          </motion.button>
          <div>
            <h1 className="text-xl font-black text-gray-900 leading-tight">بروفايل</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">My account</p>
          </div>
        </div>
      )}

      {(appStructure['profile'] || [])
        .filter(s => s.isActive && (s.tabId === 'all' || !s.tabId))
        .sort((a, b) => a.order - b.order)
        .map(section => renderSection(section))}

      {userMode === 'admin' && (
        <div className="bg-slate-900 p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/20">
              <Shield size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black">لوحة تحكم الإدارة</h2>
              <p className="text-xs font-bold opacity-60 uppercase tracking-widest">Admin Control Panel</p>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button 
              onClick={() => {
                if (confirm('هل أنت متأكد من إعادة ضبط هيكل البروفايل بالكامل؟ سيتم مسح جميع التعديلات الحالية.')) {
                  resetServiceToDefaults('profile');
                }
              }}
              className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2"
            >
              <Rocket size={16} />
              إعادة ضبط الهيكل للمصنع
            </button>
            <button 
              onClick={() => navigate('/admin/structure')}
              className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-900/40"
            >
              <Settings size={16} />
              فتح إعدادات الهيكل
            </button>
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <CreatePostModal 
          isOpen={isCreateModalOpen} 
          onClose={() => { setIsCreateModalOpen(false); setEditingPost(null); }}
          initialData={editingPost || undefined}
        />
      )}

      {viewingOffersFor && (
        <PostOffersModal 
          isOpen={!!viewingOffersFor}
          onClose={() => setViewingOffersFor(null)}
          postId={viewingOffersFor.id}
          postContent={viewingOffersFor.content}
        />
      )}

      {isCreatePageModalOpen && (
        <CreatePageModal 
          isOpen={isCreatePageModalOpen}
          onClose={() => setIsCreatePageModalOpen(false)}
          onCreate={(data) => {
            createProfile(data);
            setIsCreatePageModalOpen(false);
          }}
        />
      )}

      {isEditProfileModalOpen && (
        <EditProfileModal 
          isOpen={isEditProfileModalOpen}
          onClose={() => setIsEditProfileModalOpen(false)}
          profile={activeProfile}
          onOpenMap={() => setShowMapPicker(true)}
        />
      )}

      {showMapPicker && (
        <MapPickerModal
          isOpen={showMapPicker}
          onClose={() => setShowMapPicker(false)}
          title="حدد موقعك على الخريطة"
          initialLocation={activeProfile.location}
          onSelect={(address, coords) => {
            updateProfileDetails(activeProfile.id, { location: address, lat: coords.lat, lng: coords.lng });
            setShowMapPicker(false);
          }}
        />
      )}
      {showSubscriptionModal && (
        <CreateSubscriptionModal onClose={() => setShowSubscriptionModal(false)} />
      )}
    </div>
  );
}

const ICON_MAP: Record<string, any> = {
  Shirt, Cpu, Home, Gift, Gamepad2, Sparkles, 
  ShoppingBag, Pencil, Car, Armchair, Wrench, 
  Trash2, Truck, GraduationCap, Stethoscope,
  Building2, CarFront, Landmark, ShieldCheck, Utensils,
  Coffee, ShoppingCart, Beef, Fish, Croissant, Apple,
  Cookie, Leaf, IceCream, Pill, Users, Package
};

export function CreatePageModal({ isOpen, onClose, onCreate }: { isOpen: boolean, onClose: () => void, onCreate: (data: any) => void }) {
  const { currentCity, currentRegion } = useUser();
  const [step, setStep] = useState(1);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const profileInputRef = React.useRef<HTMLInputElement>(null);
  const coverInputRef = React.useRef<HTMLInputElement>(null);

  const [newPage, setNewPage] = useState({
    name: '',
    place: 'merchant' as 'merchant' | 'provider' | 'deal_manager' | 'restaurant' | 'driver',
    categories: [] as string[],
    subCategories: [] as string[],
    description: '',
    shortBio: '',
    address: '',
    mobile: '',
    whatsapp: '',
    email: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    birthDate: '',
    workExperience: '',
    profileImage: null as string | null,
    coverImage: null as string | null,
    city: currentCity,
    region: currentRegion
  });

  const handleCreate = () => {
    if (!newPage.name) return;
    onCreate({
      name: newPage.name,
      mode: newPage.place,
      description: newPage.description,
      location: newPage.address,
      categories: [...newPage.categories, ...newPage.subCategories],
      avatar: newPage.profileImage || `https://picsum.photos/seed/${Date.now()}/200/200`,
      cover: newPage.coverImage || `https://picsum.photos/seed/${Date.now() + 1}/800/400`,
      shortBio: newPage.shortBio,
      city: newPage.city,
      region: newPage.region,
      phone: newPage.mobile,
      whatsapp: newPage.whatsapp,
      facebook: newPage.facebook,
      instagram: newPage.instagram,
      tiktok: newPage.tiktok,
      birthDate: newPage.birthDate,
      workExperience: newPage.workExperience
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPage(prev => ({
          ...prev,
          [type === 'profile' ? 'profileImage' : 'coverImage']: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const places = [
    { id: 'merchant', label: 'ميركاتو', ownerLabel: 'تاجر فى الميركاتو', icon: Store, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'provider', label: 'اسيستو', ownerLabel: 'مقدم خدمه', icon: Wrench, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'deal_manager', label: 'ديلز', ownerLabel: 'مدير صفقات', icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'restaurant', label: 'فريش مارت', ownerLabel: 'وكيل فريش مارت', icon: UtensilsCrossed, color: 'text-red-600', bg: 'bg-red-50' },
    { id: 'driver', label: 'وصلنى', ownerLabel: 'سائق', icon: Car, color: 'text-green-600', bg: 'bg-green-50' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="relative bg-white w-full max-w-md rounded-t-[40px] sm:rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <header className="px-6 py-5 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <button onClick={() => step > 1 ? setStep(step - 1) : onClose()} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <ArrowRight size={20} className="text-gray-900" />
                </button>
                <div>
                  <h2 className="text-lg font-black text-gray-900 leading-tight">إنشاء صفحة</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">الخطوة {step} من 4</p>
                </div>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(s => (
                  <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'w-6 bg-red-600' : 'w-2 bg-gray-100'}`} />
                ))}
              </div>
            </header>

            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6 space-y-8 pb-32"
                  >
                    {/* Page Name Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h3 className="font-black text-base text-gray-900 leading-tight">اسم الصفحة</h3>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Page Name</p>
                        </div>
                      </div>
                      <input 
                        type="text" 
                        value={newPage.name}
                        onChange={e => setNewPage({...newPage, name: e.target.value})}
                        placeholder="اكتب اسم الصفحة هنا..."
                        dir="rtl"
                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-gray-100 focus:border-red-600 focus:bg-white transition-all font-black text-gray-900 placeholder:text-gray-300 shadow-sm text-right outline-none"
                      />
                    </div>

                    {/* City & Region Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                          <MapPin size={20} />
                        </div>
                        <div>
                          <h3 className="font-black text-base text-gray-900 leading-tight">الموقع الجغرافي</h3>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">المدينة</label>
                          <div className="relative">
                            <select 
                              value={newPage.city}
                              onChange={(e) => {
                                setNewPage({...newPage, city: e.target.value, region: 'الكل'});
                              }}
                              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-xs font-black outline-none focus:ring-2 focus:ring-red-100 appearance-none"
                            >
                              {EGYPT_CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">المنطقة</label>
                          <div className="relative">
                            <select 
                              value={newPage.region}
                              onChange={(e) => setNewPage({...newPage, region: e.target.value})}
                              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-xs font-black outline-none focus:ring-2 focus:ring-red-100 appearance-none"
                            >
                              {EGYPT_CITIES.find(c => c.name === newPage.city)?.regions.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Place Selection Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                          <MapPin size={20} />
                        </div>
                        <div>
                          <h3 className="font-black text-base text-gray-900 leading-tight">اختار المكان اللى عايز تظهر فيه</h3>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Choose Platform</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {places.map(place => (
                          <button
                            key={place.id}
                            onClick={() => setNewPage({...newPage, place: place.id as any, categories: [], subCategories: []})}
                            className={`group relative flex flex-col items-center justify-center p-3 rounded-3xl border-2 transition-all duration-300 ${
                              newPage.place === place.id 
                                ? 'border-red-600 bg-red-50 shadow-lg shadow-red-100/50 scale-[1.02]' 
                                : 'border-gray-100 bg-white hover:border-gray-200'
                            }`}
                          >
                            <div className={`p-3 rounded-xl mb-2 transition-colors ${newPage.place === place.id ? 'bg-red-600 text-white' : `${place.bg} ${place.color}`}`}>
                              <place.icon size={20} />
                            </div>
                            <p className={`font-black text-[11px] mb-0.5 ${newPage.place === place.id ? 'text-red-600' : 'text-gray-900'}`}>{place.label}</p>
                            <p className="text-[8px] font-bold text-gray-400 text-center leading-tight">{place.ownerLabel}</p>
                            {newPage.place === place.id && (
                              <div className="absolute top-2 left-2 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg">
                                <Check size={10} strokeWidth={4} />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Categories Section */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                          <Layers size={20} />
                        </div>
                        <div>
                          <h3 className="font-black text-base text-gray-900 leading-tight">اختار نوع نشاطتك من الاقسام</h3>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Categories</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {CATEGORY_MAP[newPage.place]?.map((cat, idx) => {
                          const Icon = ICON_MAP[cat.icon] || Layers;
                          const isCatSelected = newPage.categories.includes(cat.label);
                          
                          return (
                            <div key={cat.label} className={`rounded-3xl border-2 transition-all overflow-hidden ${
                              isCatSelected ? 'border-red-600 bg-red-50/30' : 'border-gray-100 bg-white'
                            }`}>
                              <button
                                onClick={() => {
                                  if (isCatSelected) {
                                    setNewPage({
                                      ...newPage, 
                                      categories: newPage.categories.filter(c => c !== cat.label),
                                      subCategories: newPage.subCategories.filter(sc => !cat.sub?.includes(sc))
                                    });
                                  } else {
                                    setNewPage({...newPage, categories: [...newPage.categories, cat.label]});
                                  }
                                }}
                                className="w-full flex items-center gap-3 p-4 text-right"
                              >
                                <div className={`p-2.5 rounded-xl transition-colors ${isCatSelected ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                  <Icon size={18} />
                                </div>
                                <div className="flex-1">
                                  <span className={`font-black text-sm block ${isCatSelected ? 'text-red-600' : 'text-gray-900'}`}>{cat.label}</span>
                                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">قسم رئيسي</p>
                                </div>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${isCatSelected ? 'bg-red-600 text-white rotate-0' : 'bg-gray-100 text-gray-300 rotate-45'}`}>
                                  {isCatSelected ? <Check size={12} strokeWidth={4} /> : <Plus size={12} strokeWidth={4} />}
                                </div>
                              </button>
                              
                              {cat.sub && (
                                <div className={`px-4 pb-4 pt-1 border-t border-dashed transition-all ${isCatSelected ? 'border-red-100' : 'border-gray-50'}`}>
                                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">الأقسام الفرعية المتاحة</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {cat.sub.map(sub => {
                                      const isSubSelected = newPage.subCategories.includes(sub);
                                      return (
                                        <button
                                          key={sub}
                                          onClick={() => {
                                            // Auto-select parent category if sub-category is selected
                                            let updatedCategories = [...newPage.categories];
                                            if (!isCatSelected) {
                                              updatedCategories.push(cat.label);
                                            }

                                            setNewPage({
                                              ...newPage,
                                              categories: updatedCategories,
                                              subCategories: isSubSelected 
                                                ? newPage.subCategories.filter(s => s !== sub)
                                                : [...newPage.subCategories, sub]
                                            });
                                          }}
                                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black border-2 transition-all ${
                                            isSubSelected
                                              ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100'
                                              : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                                          }`}
                                        >
                                          {sub}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6 space-y-8"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-red-600">
                        <Info size={18} />
                        <h3 className="font-black text-sm uppercase tracking-tight">نبذة عن الصفحة والسيرة الذاتية</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">اكتب نبذه عن صفحتك</label>
                        <textarea 
                          value={newPage.description}
                          onChange={e => setNewPage({...newPage, description: e.target.value})}
                          placeholder="اكتب وصفاً مختصراً لنشاطك..."
                          className="w-full p-5 bg-gray-50 rounded-[2rem] border-2 border-transparent focus:border-red-600 focus:bg-white transition-all font-bold text-gray-900 h-32 resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">مربع السيره الذاتيه</label>
                        <textarea 
                          value={newPage.shortBio}
                          onChange={e => setNewPage({...newPage, shortBio: e.target.value})}
                          placeholder="اكتب سيرتك الذاتية أو قصة نجاحك..."
                          className="w-full p-5 bg-gray-50 rounded-[2rem] border-2 border-transparent focus:border-red-600 focus:bg-white transition-all font-bold text-gray-900 h-32 resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">عنوان النشاط</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            value={newPage.address}
                            onChange={e => setNewPage({...newPage, address: e.target.value})}
                            placeholder="العنوان بالتفصيل..."
                            dir="rtl"
                            className="w-full p-5 bg-gray-50 rounded-3xl border-2 border-transparent focus:border-red-600 focus:bg-white transition-all font-bold text-gray-900 text-right outline-none"
                          />
                          <button 
                            onClick={() => setShowMapPicker(true)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-white text-red-600 rounded-2xl shadow-sm border border-gray-100 hover:bg-red-50 transition-all active:scale-90"
                            title="اختر من الخريطة"
                          >
                            <MapPin size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div 
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6 space-y-8"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-red-600">
                        <Phone size={18} />
                        <h3 className="font-black text-sm uppercase tracking-tight">بيانات التواصل</h3>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">رقم الموبايل</label>
                          <div className="relative">
                            <input 
                              type="tel" 
                              value={newPage.mobile}
                              onChange={e => setNewPage({...newPage, mobile: e.target.value})}
                              placeholder="01xxxxxxxxx"
                              className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-red-600 focus:bg-white transition-all font-bold text-gray-900"
                            />
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">رقم الواتساب</label>
                          <div className="relative">
                            <input 
                              type="tel" 
                              value={newPage.whatsapp}
                              onChange={e => setNewPage({...newPage, whatsapp: e.target.value})}
                              placeholder="01xxxxxxxxx"
                              className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-red-600 focus:bg-white transition-all font-bold text-gray-900"
                            />
                            <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">البريد الإلكتروني</label>
                          <div className="relative">
                            <input 
                              type="email" 
                              value={newPage.email}
                              onChange={e => setNewPage({...newPage, email: e.target.value})}
                              placeholder="example@mail.com"
                              className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-red-600 focus:bg-white transition-all font-bold text-gray-900"
                            />
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-red-600">
                        <Share2 size={18} />
                        <h3 className="font-black text-sm uppercase tracking-tight">روابط التواصل الاجتماعي</h3>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">رابط فيسبوك</label>
                          <div className="relative">
                            <input 
                              type="url" 
                              value={newPage.facebook}
                              onChange={e => setNewPage({...newPage, facebook: e.target.value})}
                              placeholder="https://facebook.com/yourpage"
                              className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-red-600 focus:bg-white transition-all font-bold text-gray-900"
                            />
                            <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">رابط انستجرام</label>
                          <div className="relative">
                            <input 
                              type="url" 
                              value={newPage.instagram}
                              onChange={e => setNewPage({...newPage, instagram: e.target.value})}
                              placeholder="https://instagram.com/yourpage"
                              className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-red-600 focus:bg-white transition-all font-bold text-gray-900"
                            />
                            <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">رابط تيك توك</label>
                          <div className="relative">
                            <input 
                              type="url" 
                              value={newPage.tiktok}
                              onChange={e => setNewPage({...newPage, tiktok: e.target.value})}
                              placeholder="https://tiktok.com/@yourpage"
                              className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-red-600 focus:bg-white transition-all font-bold text-gray-900"
                            />
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div 
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6 space-y-8"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-red-600">
                        <History size={18} />
                        <h3 className="font-black text-sm uppercase tracking-tight">الخبرة والتاريخ</h3>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">تاريخ تأسيس النشاط</label>
                        <div className="relative">
                          <input 
                            type="date" 
                            value={newPage.birthDate}
                            onChange={e => setNewPage({...newPage, birthDate: e.target.value})}
                            className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-red-600 focus:bg-white transition-all font-bold text-gray-900"
                          />
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">الخبره العلميه</label>
                        <textarea 
                          value={newPage.workExperience}
                          onChange={e => setNewPage({...newPage, workExperience: e.target.value})}
                          placeholder="اكتب خبراتك العلمية والعملية..."
                          className="w-full p-5 bg-gray-50 rounded-[2rem] border-2 border-transparent focus:border-red-600 focus:bg-white transition-all font-bold text-gray-900 h-32 resize-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-red-600">
                        <Camera size={18} />
                        <h3 className="font-black text-sm uppercase tracking-tight">الصور والهوية البصرية</h3>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">إضافة صوره شخصيه</label>
                          <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200 shadow-inner">
                              {newPage.profileImage ? (
                                <img src={newPage.profileImage} alt="Profile" className="w-full h-full object-cover" />
                              ) : (
                                <User size={32} className="text-gray-300" />
                              )}
                            </div>
                            <input 
                              type="file" 
                              ref={profileInputRef} 
                              onChange={(e) => handleFileChange(e, 'profile')} 
                              accept="image/*" 
                              className="hidden" 
                            />
                            <button 
                              onClick={() => profileInputRef.current?.click()}
                              className="px-6 py-3 bg-white border-2 border-gray-100 text-gray-900 rounded-2xl text-xs font-black hover:border-red-200 hover:bg-red-50 transition-all active:scale-95"
                            >
                              اختيار صورة
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">إضافة صوره للغلاف</label>
                          <div className="space-y-3">
                            <div className="w-full h-32 rounded-[2rem] bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200 shadow-inner">
                              {newPage.coverImage ? (
                                <img src={newPage.coverImage} alt="Cover" className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon size={32} className="text-gray-300" />
                              )}
                            </div>
                            <input 
                              type="file" 
                              ref={coverInputRef} 
                              onChange={(e) => handleFileChange(e, 'cover')} 
                              accept="image/*" 
                              className="hidden" 
                            />
                            <button 
                              onClick={() => coverInputRef.current?.click()}
                              className="w-full py-4 bg-white border-2 border-gray-100 text-gray-900 rounded-2xl text-xs font-black hover:border-red-200 hover:bg-red-50 transition-all active:scale-95"
                            >
                              اختيار غلاف
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-6 border-t border-gray-100 bg-white">
              <div className="flex gap-3">
                {step > 1 && (
                  <button 
                    onClick={() => setStep(step - 1)}
                    className="flex-1 py-5 bg-gray-100 text-gray-900 rounded-[2rem] font-black transition-all active:scale-95"
                  >
                    السابق
                  </button>
                )}
                <button 
                  onClick={() => {
                    if (step < 4) {
                      if (step === 1 && !newPage.name) return;
                      setStep(step + 1);
                    } else {
                      handleCreate();
                    }
                  }}
                  disabled={step === 1 && !newPage.name}
                  className={`flex-[2] py-5 text-white rounded-[2rem] font-black shadow-xl transition-all active:scale-95 disabled:opacity-50 ${
                    step === 4 ? 'bg-green-600 shadow-green-100' : 'bg-red-600 shadow-red-100'
                  }`}
                >
                  {step === 4 ? 'تأكيد وإنشاء الصفحة' : 'المتابعة'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      {showMapPicker && (
        <MapPickerModal
          isOpen={showMapPicker}
          onClose={() => setShowMapPicker(false)}
          title="حدد موقع الصفحة على الخريطة"
          initialLocation={newPage.address}
          onSelect={(address) => {
            setNewPage({ ...newPage, address });
            setShowMapPicker(false);
          }}
        />
      )}
    </AnimatePresence>
  );
}

function PrivacySelector({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const options = [
    { id: 'public', label: 'العامة', icon: Globe },
    { id: 'friends', label: 'الأصدقاء', icon: Users },
    { id: 'friends_of_friends', label: 'أصدقاء الأصدقاء', icon: Users },
    { id: 'only_me', label: 'أنا فقط', icon: Lock },
  ];

  return (
    <div className="relative mt-1">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 text-[10px] font-bold text-gray-600 outline-none focus:ring-1 focus:ring-red-200 appearance-none"
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <ChevronDown size={12} />
      </div>
    </div>
  );
}

function MultiSelect({ value, onChange, options, label }: { value: string, onChange: (val: string) => void, options: string[], label: string }) {
  const selected = value ? value.split('، ') : [];
  
  const toggleOption = (opt: string) => {
    let newSelected;
    if (selected.includes(opt)) {
      newSelected = selected.filter(s => s !== opt);
    } else {
      newSelected = [...selected, opt];
    }
    onChange(newSelected.join('، '));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => toggleOption(opt)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
              selected.includes(opt)
                ? 'bg-red-600 text-white shadow-md shadow-red-100'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function SearchableSelect({ value, onChange, options, label, icon: Icon }: { value: string, onChange: (val: string) => void, options: string[], label: string, icon: any }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon size={18} />
        </div>
        <input
          type="text"
          value={isOpen ? searchTerm : value}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={`بحث في ${label}...`}
          className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 pr-12 text-sm font-bold focus:ring-2 focus:ring-red-500 transition-all"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <Search size={16} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-20 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 max-h-48 overflow-y-auto no-scrollbar">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(opt => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setSearchTerm('');
                  setIsOpen(false);
                }}
                className="w-full text-right px-5 py-3 text-sm font-bold hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none"
              >
                {opt}
              </button>
            ))
          ) : (
            <div className="px-5 py-3 text-sm font-bold text-gray-400 text-center">
              لا توجد نتائج
            </div>
          )}
        </div>
      )}
      {isOpen && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

function FileUploader({ value, onChange, label, icon: Icon }: { value: string, onChange: (val: string) => void, label: string, icon: any }) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2">
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="relative group cursor-pointer"
      >
        <div className="w-full h-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 group-hover:border-red-300 transition-all overflow-hidden">
          {value ? (
            <img src={value} alt={label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <>
              <Icon size={24} className="text-gray-400 group-hover:text-red-500 transition-colors" />
              <span className="text-[10px] font-bold text-gray-400 group-hover:text-red-500 transition-colors">اضغط لرفع {label}</span>
            </>
          )}
        </div>
        {value && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
            <Camera size={24} className="text-white" />
          </div>
        )}
      </div>
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}

export function EditProfileModal({ isOpen, onClose, profile, onOpenMap }: { isOpen: boolean, onClose: () => void, profile: any, onOpenMap: () => void }) {
  const { updateProfileDetails } = useUser();
  const [formData, setFormData] = useState({
    firstName: profile.firstName || profile.name?.split(' ')[0] || '',
    lastName: profile.lastName || profile.name?.split(' ').slice(1).join(' ') || '',
    description: profile.description || '',
    shortBio: profile.shortBio || '',
    cv: profile.cv || '',
    location: profile.location || '',
    lat: profile.lat || null,
    lng: profile.lng || null,
    avatar: profile.avatar || '',
    cover: profile.cover || '',
    phone: profile.phone || '',
    whatsapp: profile.whatsapp || '',
    email: profile.email || '',
    facebook: profile.facebook || '',
    instagram: profile.instagram || '',
    tiktok: profile.tiktok || '',
    category: profile.category || '',
    birthDate: profile.birthDate || '',
    gender: profile.gender || '',
    maritalStatus: profile.maritalStatus || '',
    type: profile.type || '',
    workExperience: profile.workExperience || '',
    education: profile.education || '',
    hobbies: profile.hobbies || '',
    interests: profile.interests || '',
    favoritePlaces: profile.favoritePlaces || '',
    privacySettings: profile.privacySettings || {}
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const phoneRe = /^[0-9]{10,14}$/;
    
    if (formData.phone && !phoneRe.test(formData.phone)) {
      newErrors.phone = 'رقم الموبايل غير صحيح (يجب أن يكون 10-14 رقم)';
    }
    if (formData.whatsapp && !phoneRe.test(formData.whatsapp)) {
      newErrors.whatsapp = 'رقم الواتساب غير صحيح (يجب أن يكون 10-14 رقم)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const name = `${formData.firstName} ${formData.lastName}`.trim();
    await updateProfileDetails(profile.id, { ...formData, name });
    onClose();
  };

  const updatePrivacy = (field: string, value: string) => {
    setFormData({
      ...formData,
      privacySettings: {
        ...formData.privacySettings,
        [field]: value
      }
    });
  };

  const renderField = (id: string, label: string, icon: any, type: string = 'text', placeholder: string = '', options?: string[]) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black text-gray-400 mr-2 uppercase tracking-wider">{label}</label>
        {errors[id] && <span className="text-[8px] font-bold text-red-500">{errors[id]}</span>}
      </div>
      <div className="relative">
        {type !== 'searchable' && type !== 'file' && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            {React.createElement(icon, { size: 18 })}
          </div>
        )}
        {type === 'textarea' ? (
          <textarea 
            value={(formData as any)[id]}
            onChange={(e) => setFormData({ ...formData, [id]: e.target.value })}
            placeholder={placeholder}
            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 pr-12 text-sm font-bold focus:ring-2 focus:ring-red-500 transition-all h-24 resize-none"
          />
        ) : type === 'select' && options ? (
          <div className="relative">
            <select
              value={(formData as any)[id]}
              onChange={(e) => setFormData({ ...formData, [id]: e.target.value })}
              className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 pr-12 text-sm font-bold focus:ring-2 focus:ring-red-500 transition-all appearance-none"
            >
              <option value="">اختر {label}</option>
              {options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronDown size={18} />
            </div>
          </div>
        ) : type === 'multi-select' && options ? (
          <MultiSelect 
            value={(formData as any)[id]} 
            onChange={(val) => setFormData({ ...formData, [id]: val })} 
            options={options}
            label={label}
          />
        ) : type === 'searchable' && options ? (
          <SearchableSelect 
            value={(formData as any)[id]} 
            onChange={(val) => setFormData({ ...formData, [id]: val })} 
            options={options}
            label={label}
            icon={icon}
          />
        ) : type === 'file' ? (
          <FileUploader 
            value={(formData as any)[id]} 
            onChange={(val) => setFormData({ ...formData, [id]: val })} 
            label={label}
            icon={icon}
          />
        ) : (
          <input 
            type={type}
            value={(formData as any)[id]}
            onChange={(e) => setFormData({ ...formData, [id]: e.target.value })}
            placeholder={placeholder}
            className={`w-full bg-gray-50 border-none rounded-2xl px-5 py-4 pr-12 text-sm font-bold focus:ring-2 transition-all ${errors[id] ? 'ring-2 ring-red-500' : 'focus:ring-red-500'}`}
          />
        )}
      </div>
      <PrivacySelector 
        value={(formData.privacySettings as any)[id] || 'public'} 
        onChange={(val) => updatePrivacy(id, val)} 
      />
    </div>
  );

  const genderOptions = ['ذكر', 'أنثى'];
  const maritalStatusOptions = ['أعزب', 'متزوج', 'مطلق', 'أرمل'];
  const typeOptions = ['شخصي', 'تجاري'];
  const categoryOptions = ['كهرباء', 'سباكة', 'نجارة', 'توصيل', 'نقاشة', 'أخرى'];
  const hobbiesOptions = ['القراءة', 'الرياضة', 'السفر', 'الطبخ', 'التصوير', 'الرسم', 'الموسيقى', 'البرمجة', 'الكتابة', 'السباحة', 'كرة القدم', 'الشطرنج', 'التخييم', 'صيد السمك', 'البستنة', 'اليوغا', 'ألعاب الفيديو', 'التطوع', 'الرقص', 'التمثيل', 'صناعة المحتوى', 'البودكاست'];
  const interestsOptions = ['التكنولوجيا', 'الفن', 'العلوم', 'التاريخ', 'السياسة', 'الاقتصاد', 'الموضة', 'السيارات', 'السياحة', 'الطب', 'الفضاء', 'البيئة', 'الذكاء الاصطناعي', 'ريادة الأعمال', 'الرياضات الإلكترونية', 'الطهي العالمي', 'التصميم المعماري', 'الأفلام الوثائقية'];
  const workOptions = ['مهندس', 'طبيب', 'مدرس', 'محاسب', 'مبرمج', 'مصمم', 'مدير مبيعات', 'فني', 'عامل', 'محامي', 'صحفي', 'حرفي'];
  const educationOptions = ['دكتوراه', 'ماجستير', 'بكالوريوس', 'دبلوم عالي', 'دبلوم', 'ثانوية عامة', 'إعدادية', 'ابتدائية'];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="relative bg-white w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] overflow-hidden shadow-2xl h-[90vh] flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <ChevronLeft size={24} className="rotate-180" />
                </button>
                <h3 className="text-xl font-black text-gray-900">تعديل الملف الشخصي</h3>
                <button 
                  onClick={handleSave}
                  className="bg-red-600 text-white px-6 py-2 rounded-xl text-sm font-black shadow-lg shadow-red-100"
                >
                  حفظ
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
              {/* Media */}
              <div className="space-y-6">
                <h4 className="text-sm font-black text-gray-900 border-r-4 border-red-600 pr-3">الصور</h4>
                <div className="grid grid-cols-2 gap-4">
                  {renderField('avatar', 'الصورة الشخصية', Camera, 'file')}
                  {renderField('cover', 'صورة الغلاف', Camera, 'file')}
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-6">
                <h4 className="text-sm font-black text-gray-900 border-r-4 border-red-600 pr-3">المعلومات الأساسية</h4>
                <div className="grid grid-cols-2 gap-4">
                  {renderField('firstName', 'الاسم الأول', User)}
                  {renderField('lastName', 'اسم العائلة', User)}
                </div>
                {renderField('description', 'الوصف', FileText, 'textarea')}
                {renderField('shortBio', 'نبذه مختصره عني', Edit2, 'textarea')}
                {renderField('cv', 'السيره الذاتيه', FileText, 'textarea')}
              </div>

              {/* Contact Info */}
              <div className="space-y-6">
                <h4 className="text-sm font-black text-gray-900 border-r-4 border-red-600 pr-3">معلومات التواصل</h4>
                {renderField('location', 'الموقع', MapPin)}
                {renderField('phone', 'رقم الموبايل', Phone)}
                {renderField('whatsapp', 'رقم الواتساب', MessageCircle)}
                {renderField('email', 'البريد الالكتروني', Mail, 'email')}
              </div>

              {/* Social Media */}
              <div className="space-y-6">
                <h4 className="text-sm font-black text-gray-900 border-r-4 border-red-600 pr-3">روابط التواصل الاجتماعي</h4>
                {renderField('facebook', 'الفيسبوك', Facebook)}
                {renderField('instagram', 'الانستجرام', Instagram)}
                {renderField('tiktok', 'التيك توك', Video)}
              </div>

              {/* Personal Details */}
              <div className="space-y-6">
                <h4 className="text-sm font-black text-gray-900 border-r-4 border-red-600 pr-3">تفاصيل شخصية</h4>
                {renderField('category', 'الفئه', Tag, 'select', '', categoryOptions)}
                {renderField('birthDate', 'تاريخ الميلاد', Calendar, 'date')}
                {renderField('gender', 'الجنس', Users, 'select', '', genderOptions)}
                {renderField('maritalStatus', 'الحاله الاجتماعيه', Heart, 'select', '', maritalStatusOptions)}
                {renderField('type', 'النوع', User, 'select', '', typeOptions)}
              </div>

              {/* Professional & Interests */}
              <div className="space-y-6">
                <h4 className="text-sm font-black text-gray-900 border-r-4 border-red-600 pr-3">الخبرات والاهتمامات</h4>
                {renderField('workExperience', 'الخبره العمليه', Briefcase, 'searchable', '', workOptions)}
                {renderField('education', 'الخبره العلميه', GraduationCap, 'searchable', '', educationOptions)}
                {renderField('hobbies', 'الهوايات', Music, 'multi-select', '', hobbiesOptions)}
                {renderField('interests', 'الاهتمامات', Target, 'multi-select', '', interestsOptions)}
                {renderField('favoritePlaces', 'الاماكن المفضله', Map)}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function MyPointsTab() {
  const { activeProfile, updatePoints, updateBalance } = useUser();
  const [activeMainTab, setActiveMainTab] = useState<'points' | 'balance'>('points');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'purchase' | 'activation'>('overview');
  const [selectedCard, setSelectedCard] = useState<any>(null);

  // History management for MyPointsTab
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.type === 'points_tab') {
        setActiveSubTab(event.state.subTab);
        setSelectedCard(event.state.card);
      } else if (event.state && event.state.type === 'profile_tab' && event.state.tab === 'my-points') {
        // Reset to overview when going back to the main points tab
        setActiveSubTab('overview');
        setSelectedCard(null);
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Check initial state if we just mounted
    if (window.history.state && window.history.state.type === 'points_tab') {
      setActiveSubTab(window.history.state.subTab);
      setSelectedCard(window.history.state.card);
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSetSubTab = (subTab: 'overview' | 'purchase' | 'activation') => {
    if (subTab !== 'overview') {
      window.history.pushState({ type: 'points_tab', subTab, card: selectedCard }, '');
    } else if (window.history.state?.type === 'points_tab') {
      window.history.back();
    }
    setActiveSubTab(subTab);
  };

  const handleSetSelectedCard = (card: any) => {
    if (card) {
      setActiveSubTab('activation');
      window.history.pushState({ type: 'points_tab', subTab: 'activation', card }, '');
    } else {
      if (window.history.state?.type === 'points_tab' && window.history.state?.subTab === 'activation') {
        window.history.back();
      }
      setActiveSubTab('purchase');
    }
    setSelectedCard(card);
  };
  const [activationCode, setActivationCode] = useState('');

  const cards = [
    { name: 'كارت البرونز', points: 5000, price: 50, color: 'from-orange-400 to-orange-600', pattern: 'bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]' },
    { name: 'كارت السيلفر', points: 12000, price: 100, color: 'from-slate-400 to-slate-600', pattern: 'bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px]' },
    { name: 'كارت الجولد', points: 30000, price: 200, color: 'from-amber-400 to-amber-600', pattern: 'bg-[radial-gradient(circle_at_0%_0%,rgba(255,255,255,0.2)_0%,transparent_50%),radial-gradient(circle_at_100%_100%,rgba(255,255,255,0.2)_0%,transparent_50%)]' },
    { name: 'كارت البلاتينيوم', points: 80000, price: 500, color: 'from-indigo-500 to-purple-600', pattern: 'bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,0.05)_0,rgba(255,255,255,0.05)_1px,transparent_0,transparent_50%)] bg-[length:10px_10px]' },
    { name: 'كارت الماسي', points: 200000, price: 1000, color: 'from-cyan-400 to-blue-600', pattern: 'bg-[conic-gradient(from_0deg_at_50%_50%,rgba(255,255,255,0.1)_0deg,transparent_90deg,rgba(255,255,255,0.1)_180deg,transparent_270deg)]' },
  ];

  const paymentHistory = [
    { id: '1', type: 'شحن كارت جولد', amount: 30000, date: '2024-03-20', status: 'مكتمل' },
    { id: '2', type: 'شحن كارت سيلفر', amount: 12000, date: '2024-03-15', status: 'مكتمل' },
  ];

  const withdrawalHistory = [
    { id: '1', type: 'تحويل نقاط لرصيد', amount: 5000, date: '2024-03-18', status: 'مكتمل' },
  ];

  const handleActivateByBalance = async () => {
    if (!selectedCard) return;
    const currentBalance = activeProfile.balance || 0;
    if (currentBalance >= selectedCard.price) {
      try {
        await updateBalance(activeProfile.id, -selectedCard.price);
        await updatePoints(activeProfile.id, selectedCard.points);
        alert(`تم تفعيل ${selectedCard.name} بنجاح! تم إضافة ${selectedCard.points} نقطة لحسابك.`);
        setActiveSubTab('overview');
        setSelectedCard(null);
      } catch (error) {
        alert('حدث خطأ أثناء التفعيل');
      }
    } else {
      alert('عذراً، رصيدك غير كافٍ لشراء هذا الكارت');
    }
  };

  const handleActivateByCoupon = async () => {
    if (!selectedCard || !activationCode.trim()) {
      alert('يرجى إدخال كود التفعيل');
      return;
    }
    // Mock coupon validation - in a real app this would call an API
    if (activationCode.length >= 8) {
      try {
        await updatePoints(activeProfile.id, selectedCard.points);
        alert(`تم تفعيل الكوبون بنجاح! تم إضافة ${selectedCard.points} نقطة لحسابك.`);
        setActiveSubTab('overview');
        setSelectedCard(null);
        setActivationCode('');
      } catch (error) {
        alert('حدث خطأ أثناء التفعيل');
      }
    } else {
      alert('كود التفعيل غير صحيح');
    }
  };

  const renderPointsContent = () => {
    if (activeSubTab === 'activation' && selectedCard) {
      return (
        <div className="space-y-6">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-600 font-bold"
          >
            <ArrowRight size={20} />
            <span>رجوع</span>
          </button>

          <div className={`relative aspect-[1.586/1] w-full overflow-hidden p-6 rounded-[24px] bg-gradient-to-br ${selectedCard.color} text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 relative overflow-hidden flex flex-col justify-between`}>
            <div className={`absolute inset-0 opacity-30 ${selectedCard.pattern}`}></div>
            <div className="flex justify-between items-start relative z-10">
              <div className="w-12 h-10 bg-gradient-to-br from-yellow-200 to-yellow-500 rounded-lg relative overflow-hidden shadow-inner">
                <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,black_2px,black_4px)]"></div>
                <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,black_2px,black_4px)]"></div>
              </div>
              <div className="text-right">
                <h3 className="text-lg font-black leading-none">{selectedCard.name}</h3>
                <p className="text-[10px] font-bold opacity-70 mt-1">كارت نقاط حاجات</p>
              </div>
            </div>
            <div className="mt-4 relative z-10">
              <div className="flex items-baseline gap-2 justify-end">
                <span className="text-4xl font-black tracking-tighter">{selectedCard.points.toLocaleString()}</span>
                <span className="text-sm font-bold opacity-80">نقطة</span>
              </div>
            </div>
            <div className="mt-auto flex items-end justify-between relative z-10">
              <div className="text-left font-mono text-[10px] opacity-60 tracking-widest">
                **** **** **** {Math.floor(Math.random() * 9000) + 1000}
              </div>
              <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black">
                {selectedCard.price} ج.م
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-6">
            <div className="space-y-4">
              <h4 className="text-lg font-black text-gray-900">طريقة التفعيل</h4>
              
              {/* Option 1: Balance */}
              <div className="p-4 rounded-2xl border-2 border-red-100 bg-red-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-black">1</div>
                    <span className="text-sm font-black text-gray-900">التفعيل من الرصيد</span>
                  </div>
                  <span className="text-xs font-bold text-red-600">رصيدك: {(activeProfile.balance || 0).toLocaleString()} ج.م</span>
                </div>
                <p className="text-[11px] font-bold text-gray-500 leading-relaxed">سيتم خصم ثمن الكارت ({selectedCard.price} ج.م) من رصيدك الحالي وتفعيل النقاط فوراً.</p>
                <button 
                  onClick={handleActivateByBalance}
                  className="w-full bg-red-600 text-white py-3 rounded-xl text-xs font-black shadow-lg shadow-red-100"
                >
                  تفعيل من الرصيد
                </button>
              </div>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                <div className="relative flex justify-center"><span className="bg-white px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">أو</span></div>
              </div>

              {/* Option 2: Coupon */}
              <div className="p-4 rounded-2xl border border-gray-100 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs font-black">2</div>
                  <span className="text-sm font-black text-gray-900">التفعيل بالكوبون</span>
                </div>
                <input 
                  type="text"
                  value={activationCode}
                  onChange={(e) => setActivationCode(e.target.value)}
                  placeholder="أدخل كود التفعيل"
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-center font-mono text-lg tracking-widest focus:ring-2 focus:ring-red-500"
                />
                <button 
                  onClick={handleActivateByCoupon}
                  className="w-full bg-gray-900 text-white py-3 rounded-xl text-xs font-black"
                >
                  تفعيل بالكوبون
                </button>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-6 rounded-[32px] border border-red-100 space-y-4">
            <h4 className="text-sm font-black text-red-900">تعليمات الشحن</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0">أ</div>
                <p className="text-[11px] font-bold text-red-800 leading-relaxed">
                  <span className="font-black">الطريقة الأولى (الرصيد):</span> تأكد من وجود رصيد كافٍ في محفظتك، ثم اضغط على "تفعيل من الرصيد".
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0">ب</div>
                <p className="text-[11px] font-bold text-red-800 leading-relaxed">
                  <span className="font-black">الطريقة الثانية (الكوبون):</span> قم بتحويل {selectedCard.price} ج.م على <span className="font-black text-red-600">01007895003</span> (فودافون كاش/انستا باي)، ثم أرسل لقطة الشاشة لدعم الكروت للحصول على كود التفعيل.
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('open-support-chat', { detail: { type: 'cards' } }))}
              className="w-full bg-white text-red-600 py-4 rounded-2xl text-sm font-black shadow-sm flex items-center justify-center gap-2 border border-red-100 hover:bg-red-50 transition-all"
            >
              <span>دعم الكروت</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl">
          <button 
            onClick={() => handleSetSubTab('overview')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${activeSubTab === 'overview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            نظرة عامة
          </button>
          <button 
            onClick={() => handleSetSubTab('purchase')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${activeSubTab === 'purchase' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            شراء نقاط
          </button>
        </div>

        {activeSubTab === 'overview' ? (
          <>
            <div className="bg-gradient-to-br from-red-600 to-red-800 p-8 rounded-[40px] text-white shadow-xl shadow-red-100 relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">النقاط المتاحة</p>
                <h3 className="text-4xl font-black">{(activeProfile.points || 0).toLocaleString()}</h3>
                <div className="mt-6 flex gap-3">
                  <button 
                    onClick={() => handleSetSubTab('purchase')}
                    className="bg-white text-red-600 px-6 py-2.5 rounded-xl text-xs font-black shadow-lg"
                  >
                    شحن نقاط
                  </button>
                  <button className="bg-white/20 backdrop-blur-md text-white px-6 py-2.5 rounded-xl text-xs font-black">
                    سحب النقاط
                  </button>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            <div className="bg-amber-50 p-6 rounded-[32px] border border-amber-100 space-y-3">
              <div className="flex items-center gap-2 text-amber-700">
                <Star size={18} className="fill-amber-500 text-amber-500" />
                <h4 className="text-sm font-black">عضوية التميز (نقاط الأفالون)</h4>
              </div>
              <p className="text-[11px] font-bold text-amber-800 leading-relaxed">
                يمكنك الآن استخدام نقاطك لتمييز منشوراتك وزيادة ظهورها للآخرين. اختر "عضوية التميز" عند إنشاء منشور جديد لتفعيل الخصائص المتقدمة.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                  <History size={18} className="text-red-600" />
                  سجل العمليات
                </h4>
              </div>
              
              <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">سجل الدفع</p>
                </div>
                {paymentHistory.map(item => (
                  <div key={item.id} className="p-4 flex items-center justify-between border-b border-gray-50 last:border-none">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                        <Plus size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{item.type}</p>
                        <p className="text-[10px] text-gray-400 font-bold">{item.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-green-600">+{item.amount}</p>
                      <p className="text-[9px] font-bold text-gray-400">{item.status}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">سجل السحب</p>
                </div>
                {withdrawalHistory.map(item => (
                  <div key={item.id} className="p-4 flex items-center justify-between border-b border-gray-50 last:border-none">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                        <ArrowRight size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{item.type}</p>
                        <p className="text-[10px] text-gray-400 font-bold">{item.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-red-600">-{item.amount}</p>
                      <p className="text-[9px] font-bold text-gray-400">{item.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {cards.map((card, idx) => (
              <button 
                key={idx}
                onClick={() => handleSetSelectedCard(card)}
                className={`relative aspect-[1.586/1] w-full overflow-hidden p-6 rounded-[24px] bg-gradient-to-br ${card.color} text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 hover:scale-[1.02] active:scale-95 transition-all text-right group flex flex-col justify-between`}
              >
                <div className={`absolute inset-0 opacity-30 ${card.pattern}`}></div>
                <div className="flex justify-between items-start relative z-10">
                  <div className="w-12 h-10 bg-gradient-to-br from-yellow-200 to-yellow-500 rounded-lg relative overflow-hidden shadow-inner">
                    <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,black_2px,black_4px)]"></div>
                    <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,black_2px,black_4px)]"></div>
                  </div>
                  <div className="text-right">
                    <h4 className="text-lg font-black leading-none">{card.name}</h4>
                    <p className="text-[10px] font-bold opacity-70 mt-1">كارت نقاط حاجات</p>
                  </div>
                </div>
                <div className="mt-4 relative z-10">
                  <div className="flex items-baseline gap-2 justify-end">
                    <span className="text-4xl font-black tracking-tighter">{card.points.toLocaleString()}</span>
                    <span className="text-sm font-bold opacity-80">نقطة</span>
                  </div>
                </div>
                <div className="mt-auto flex items-end justify-between relative z-10">
                  <div className="text-left font-mono text-[10px] opacity-60 tracking-widest">
                    **** **** **** {1000 + idx * 111}
                  </div>
                  <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black">
                    {card.price} ج.م
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderBalanceContent = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[40px] text-white shadow-xl shadow-blue-100 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">الرصيد الحالي</p>
          <h3 className="text-4xl font-black">{(activeProfile.balance || 0).toLocaleString()} ج.م</h3>
          <div className="mt-6 flex gap-3">
            <button className="bg-white text-blue-600 px-6 py-2.5 rounded-xl text-xs font-black shadow-lg">
              شحن الرصيد
            </button>
            <button className="bg-white/20 backdrop-blur-md text-white px-6 py-2.5 rounded-xl text-xs font-black">
              تحويل رصيد
            </button>
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-gray-100 space-y-4 shadow-sm">
        <h4 className="text-sm font-black text-gray-900">كوبونات نشطة</h4>
        <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-xs font-bold text-gray-400">لا توجد كوبونات نشطة حالياً</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Main Tabs */}
      <div className="flex gap-2 p-1 bg-white rounded-2xl shadow-sm border border-gray-100">
        <button 
          onClick={() => setActiveMainTab('points')}
          className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${activeMainTab === 'points' ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <Coins size={16} />
          <span>نقاط</span>
        </button>
        <button 
          onClick={() => setActiveMainTab('balance')}
          className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${activeMainTab === 'balance' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <Wallet size={16} />
          <span>رصيدي</span>
        </button>
      </div>

      {activeMainTab === 'points' && renderPointsContent()}
      {activeMainTab === 'balance' && renderBalanceContent()}
    </div>
  );
}

export function MyProfileTab({ onOpenEditProfile, onViewOffers, onEditPost, onViewLikes, onCreatePost }: { onOpenEditProfile: () => void, onViewOffers: (post: Post) => void, onEditPost: (post: Post) => void, onViewLikes: (post: Post) => void, onCreatePost: () => void }) {
  return (
    <div className="space-y-6">
      <ProfileIntro onOpenEditProfile={onOpenEditProfile} />
      {/* Fallback content if no sections are defined in App Structure */}
      <div className="px-4 py-10 text-center bg-white rounded-[32px] border border-dashed border-gray-200 mx-4">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
          <User size={32} />
        </div>
        <h3 className="text-sm font-black text-gray-900 mb-2">مرحباً بك في بروفايلك</h3>
        <p className="text-[11px] font-bold text-gray-400 max-w-[200px] mx-auto leading-relaxed">
          يمكنك تخصيص هذا القسم وإضافة "صندوق النشر" و "المنشورات" من لوحة التحكم في هيكل التطبيق.
        </p>
      </div>
    </div>
  );
}

export function ProviderSettings() {
  const { userMode, userCategory, setUserCategory } = useUser();

  if (userMode !== 'provider') return null;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <h3 className="text-sm font-black text-gray-800 mb-3">إعدادات القسم (للمزودين)</h3>
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-400 block mr-1">اختر قسمك لتظهر لك طلبات العملاء المتعلقة به</label>
        <select 
          value={userCategory}
          onChange={(e) => setUserCategory(e.target.value)}
          className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-red-100"
        >
          <option value="">كل الأقسام</option>
          <option value="كهرباء">كهرباء</option>
          <option value="سباكة">سباكة</option>
          <option value="نجارة">نجارة</option>
          <option value="توصيل">توصيل</option>
        </select>
      </div>
    </div>
  );
}

export function ProfileIntro({ onOpenEditProfile }: { onOpenEditProfile: () => void }) {
  const { activeProfile, userName } = useUser();

  const IntroItem = ({ icon: Icon, text, subtext, isBold }: { icon: any, text: string, subtext?: string, isBold?: boolean }) => {
    if (!text) return null;
    return (
      <div className="flex items-center gap-3 py-1.5 group cursor-default">
        <div className="text-gray-500 group-hover:text-gray-700 transition-colors">
          <Icon size={20} strokeWidth={2} />
        </div>
        <div className="flex-1">
          <p className={`text-[13px] text-gray-900 leading-tight ${isBold ? 'font-bold' : 'font-medium'}`}>
            {text}
            {subtext && <span className="text-gray-500 font-normal"> • {subtext}</span>}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Facebook Style Intro Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-gray-900">المقدمة</h3>
          <button 
            onClick={onOpenEditProfile}
            className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-all"
          >
            تعديل التفاصيل
          </button>
        </div>

        <div className="space-y-1">
          {activeProfile.shortBio && (
            <div className="text-center pb-4 mb-2 border-b border-gray-50">
              <p className="text-[13px] font-medium text-gray-800 leading-relaxed">{activeProfile.shortBio}</p>
            </div>
          )}

          <IntroItem 
            icon={Briefcase} 
            text={activeProfile.workExperience ? `يعمل في ${activeProfile.workExperience}` : ''} 
            isBold
          />
          <IntroItem 
            icon={GraduationCap} 
            text={activeProfile.education ? `درس في ${activeProfile.education}` : ''} 
            isBold
          />
          <IntroItem 
            icon={Home} 
            text={activeProfile.location ? `يسكن في ${activeProfile.location}` : ''} 
          />
          <IntroItem 
            icon={MapPin} 
            text={activeProfile.location ? `من ${activeProfile.location}` : ''} 
          />
          <IntroItem 
            icon={Heart} 
            text={activeProfile.maritalStatus || ''} 
          />
          <IntroItem 
            icon={Users} 
            text="يتابعه 1.2 ألف شخص" 
          />
          <IntroItem 
            icon={Calendar} 
            text={activeProfile.birthDate ? `تاريخ الميلاد ${activeProfile.birthDate}` : ''} 
          />
          <IntroItem 
            icon={Clock} 
            text={`انضم في ${new Date(activeProfile.createdAt || Date.now()).toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}`} 
          />

          {/* Social Links */}
          <div className="pt-2 space-y-1 border-t border-gray-50 mt-2">
            {activeProfile.facebook && (
              <IntroItem icon={Facebook} text={activeProfile.facebook} subtext="فيسبوك" />
            )}
            {activeProfile.instagram && (
              <IntroItem icon={Instagram} text={activeProfile.instagram} subtext="انستجرام" />
            )}
            {activeProfile.tiktok && (
              <IntroItem icon={Video} text={activeProfile.tiktok} subtext="تيك توك" />
            )}
          </div>

          <button 
            onClick={onOpenEditProfile}
            className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-900 py-2.5 rounded-xl text-[13px] font-bold transition-all"
          >
            عرض المزيد من المعلومات
          </button>
        </div>
      </div>

      {/* Hobbies Section */}
      {activeProfile.hobbies && activeProfile.hobbies.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-lg font-black text-gray-900 mb-4">الهوايات</h3>
          <div className="flex flex-wrap gap-2">
            {activeProfile.hobbies.split('، ').map((hobby: string, index: number) => (
              <div 
                key={index}
                className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100"
              >
                <Music size={14} className="text-gray-500" />
                <span className="text-xs font-bold text-gray-700">{hobby}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interests Section */}
      {activeProfile.interests && activeProfile.interests.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-lg font-black text-gray-900 mb-4">الاهتمامات</h3>
          <div className="flex flex-wrap gap-2">
            {activeProfile.interests.split('، ').map((interest: string, index: number) => (
              <div 
                key={index}
                className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-full border border-red-100"
              >
                <Target size={14} className="text-red-500" />
                <span className="text-xs font-bold text-red-700">{interest}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured Photos (Mockup) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-gray-900">الصور المميزة</h3>
          <button className="text-xs font-bold text-red-600 hover:underline">تعديل</button>
        </div>
        <div className="py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-xs font-bold text-gray-400">لا توجد صور مميزة حالياً</p>
        </div>
      </div>
    </div>
  );
}

export function MyOrdersTab({ onSelectOrder }: { onSelectOrder: (order: any) => void }) {
  const { userMode, activeProfile } = useUser();
  const [activeFilter, setActiveFilter] = useState('all');
  const [realOrders, setRealOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!activeProfile?.id) return;

    let q;
    if (userMode === 'restaurant' || userMode === 'merchant') {
      q = query(
        collection(db, 'orders'),
        where('restaurantId', '==', activeProfile.id),
        orderBy('createdAt', 'desc')
      );
    } else if (userMode === 'driver') {
      q = query(
        collection(db, 'orders'),
        where('status', 'in', ['pending', 'accepted', 'on_way', 'جاري التوصيل']),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'orders'),
        where('customerId', '==', activeProfile.id),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRealOrders(fetchedOrders);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeProfile, userMode]);

  const orderTypes = userMode === 'merchant' || userMode === 'restaurant' ? [
    { id: 'all', label: 'الكل', count: realOrders.length },
    { id: 'pending', label: 'طلبات جديدة', count: realOrders.filter(o => o.status === 'pending').length },
    { id: 'preparing', label: 'قيد التجهيز', count: realOrders.filter(o => o.status === 'preparing').length },
    { id: 'on_way', label: 'قيد التوصيل', count: realOrders.filter(o => o.status === 'on_way' || o.status === 'جاري التوصيل').length },
    { id: 'delivered', label: 'مكتملة', count: realOrders.filter(o => o.status === 'delivered').length },
  ] : [
    { id: 'all', label: 'الكل', count: realOrders.length },
    { id: 'restaurants', label: 'المطاعم', count: realOrders.filter(o => o.type === 'restaurants').length },
    { id: 'mercato', label: 'الميركاتو', count: realOrders.filter(o => o.type === 'mercato').length },
    { id: 'delivery', label: 'التوصيل', count: realOrders.filter(o => o.type === 'delivery').length },
  ];

  const filteredOrders = activeFilter === 'all' 
    ? realOrders 
    : realOrders.filter(o => o.status === activeFilter || o.type === activeFilter);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-bold text-gray-400">جاري تحميل الطلبات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {orderTypes.map(type => (
          <button 
            key={type.id} 
            onClick={() => setActiveFilter(type.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === type.id 
                ? 'bg-red-600 text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
            }`}
          >
            {type.label} ({type.count})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredOrders.length > 0 ? filteredOrders.map(order => (
          <div 
            key={order.id} 
            className="bg-white rounded-[32px] p-5 shadow-sm border border-gray-100 hover:border-red-100 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${
                  order.status === 'pending' ? 'bg-blue-50 text-blue-600' :
                  order.status === 'preparing' ? 'bg-amber-50 text-amber-500' :
                  order.status === 'on_way' || order.status === 'جاري التوصيل' ? 'bg-red-50 text-red-600' :
                  'bg-green-50 text-green-500'
                } rounded-2xl flex items-center justify-center shadow-sm`}>
                  {order.status === 'pending' ? <Zap size={24} /> :
                   order.status === 'preparing' ? <Clock size={24} /> :
                   order.status === 'on_way' || order.status === 'جاري التوصيل' ? <Truck size={24} /> :
                   <CheckCircle2 size={24} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-gray-900">
                      {userMode === 'restaurant' || userMode === 'merchant' ? `طلب من ${order.customerName}` : order.restaurantName || 'طلب جديد'}
                    </h4>
                    <span className="text-[10px] font-bold text-gray-400">#{order.id.slice(-4)}</span>
                  </div>
                  <p className="text-[10px] font-bold text-gray-400">
                    {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleTimeString('ar-EG') : 'منذ قليل'}
                  </p>
                </div>
              </div>
              <div className={`${
                order.status === 'pending' ? 'bg-blue-50 text-blue-600' :
                order.status === 'preparing' ? 'bg-amber-50 text-amber-500' :
                order.status === 'on_way' || order.status === 'جاري التوصيل' ? 'bg-red-50 text-red-600' :
                'bg-green-50 text-green-500'
              } px-3 py-1 rounded-full text-[10px] font-black`}>
                {order.status === 'pending' ? 'جديد' :
                 order.status === 'preparing' ? 'قيد التجهيز' :
                 order.status === 'on_way' || order.status === 'جاري التوصيل' ? 'جاري التوصيل' : 'مكتمل'}
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-3 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-gray-400">الأصناف:</span>
                <span className="text-[10px] font-black text-gray-900">{order.total} ج.م</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {order.items?.map((item: any, idx: number) => (
                  <span key={idx} className="bg-white border border-gray-100 px-2 py-1 rounded-lg text-[9px] font-bold text-gray-600">
                    {item.name} ({item.quantity})
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => onSelectOrder(order)}
                className="flex-1 bg-red-600 text-white py-3 rounded-2xl text-[11px] font-black shadow-lg shadow-red-100 hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Navigation size={14} />
                تتبع الطلب
              </button>
              <button className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center hover:bg-gray-100 transition-colors">
                <MessageCircle size={18} />
              </button>
            </div>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[40px] border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-4">
              <Package size={40} />
            </div>
            <h3 className="text-lg font-black text-gray-800">لا توجد طلبات</h3>
            <p className="text-xs font-bold text-gray-400 mt-2">ابدأ بطلب وجبتك أو منتجك المفضل الآن!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MyRatingsTab() {
  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
        <div className="text-4xl font-black text-gray-800 mb-2">0.0</div>
        <div className="flex justify-center gap-1 mb-4">
          {[1, 2, 3, 4, 5].map(i => <Star key={i} size={20} fill="none" className="text-gray-200" />)}
        </div>
        <p className="text-xs font-bold text-gray-400">لا توجد تقييمات بعد</p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-black text-gray-800">آخر التقييمات</h3>
        <div className="bg-white p-8 rounded-3xl border border-dashed border-gray-200 text-center">
          <p className="text-xs font-bold text-gray-400">لا توجد تقييمات حالياً</p>
        </div>
      </div>
    </div>
  );
}

type SubType = 'driver' | 'mercato' | 'freshmart' | 'assisto';

interface Subscription {
  id: string;
  title: string;
  provider: string;
  type: SubType;
  status: 'active' | 'pending' | 'expired';
  price: string;
  period: string;
  nextPayment: string;
  description: string;
}

const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-1',
    title: 'باقة الميركاتو الذهبية',
    provider: 'الميركاتو',
    type: 'mercato',
    status: 'active',
    price: '150 ج.م',
    period: 'شهرياً',
    nextPayment: '15 مايو 2026',
    description: 'خصم 10% على جميع المشتريات وتوصيل مجاني لأول 5 طلبات.'
  },
  {
    id: 'sub-2',
    title: 'باقة وصلنى بريميوم',
    provider: 'وصلنى',
    type: 'driver',
    status: 'active',
    price: '200 ج.م',
    period: 'شهرياً',
    nextPayment: '20 مايو 2026',
    description: 'أولوية في طلب السائقين وخصم 15% على الرحلات الطويلة.'
  }
];

const SUBS_TABS = [
  { id: 'all', label: 'الكل', icon: Package },
  { id: 'driver', label: 'السائقين', icon: Car },
  { id: 'mercato', label: 'الميركاتو', icon: Store },
  { id: 'freshmart', label: 'فريش مارت', icon: Utensils },
  { id: 'assisto', label: 'الاسيستو', icon: Wrench },
];

export function MySubscriptionsTab({ onAddSubscription }: { onAddSubscription: () => void }) {
  const [activeTab, setActiveTab] = useState<string>('all');

  const filteredSubs = MOCK_SUBSCRIPTIONS.filter(sub => 
    activeTab === 'all' ? true : sub.type === activeTab
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'expired': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'pending': return 'قيد الانتظار';
      case 'expired': return 'منتهي';
      default: return status;
    }
  };

  const getTypeIcon = (type: SubType) => {
    switch (type) {
      case 'driver': return <Car size={18} className="text-orange-500" />;
      case 'mercato': return <Store size={18} className="text-blue-500" />;
      case 'freshmart': return <Utensils size={18} className="text-red-500" />;
      case 'assisto': return <Wrench size={18} className="text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-black text-gray-800">إدارة الاشتراكات</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Subscription Management</p>
        </div>
        <button 
          onClick={onAddSubscription}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-2xl text-xs font-black shadow-lg shadow-red-100 active:scale-95 transition-all"
        >
          <Plus size={16} />
          <span>إضافة اشتراك</span>
        </button>
      </div>

      {/* Horizontal Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {SUBS_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black whitespace-nowrap transition-all border-2 ${
              activeTab === tab.id
              ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-100'
              : 'bg-white text-gray-500 border-transparent shadow-sm hover:bg-gray-50'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400">اشتراكات نشطة</p>
            <p className="text-lg font-black text-gray-900">{MOCK_SUBSCRIPTIONS.filter(s => s.status === 'active').length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <CreditCard size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400">إجمالي المدفوعات</p>
            <p className="text-lg font-black text-gray-900">
              {MOCK_SUBSCRIPTIONS.reduce((acc, curr) => acc + parseInt(curr.price), 0).toLocaleString()} ج.م
            </p>
          </div>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredSubs.map((sub) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={sub.id}
              className="bg-white p-5 rounded-[32px] shadow-xl border border-gray-100 space-y-4 relative overflow-hidden group"
            >
              {/* Status Badge */}
              <div className={`absolute left-0 top-0 px-4 py-1.5 rounded-br-2xl text-[10px] font-black border-b border-r ${getStatusColor(sub.status)}`}>
                {getStatusLabel(sub.status)}
              </div>

              <div className="flex justify-between items-start pt-2">
                <div className="flex gap-4">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center shadow-inner">
                    {getTypeIcon(sub.type)}
                  </div>
                  <div>
                    <h4 className="text-base font-black text-gray-900 leading-tight">{sub.title}</h4>
                    <p className="text-xs font-bold text-gray-500 mt-1 flex items-center gap-1">
                      <Zap size={12} className="text-amber-500" />
                      {sub.provider}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <CreditCard size={12} />
                    <span className="text-[9px] font-black uppercase">التكلفة</span>
                  </div>
                  <p className="text-xs font-black text-gray-900">{sub.price} / {sub.period}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Calendar size={12} />
                    <span className="text-[9px] font-black uppercase">الدفع القادم</span>
                  </div>
                  <p className="text-xs font-black text-gray-900">{sub.nextPayment}</p>
                </div>
              </div>

              <p className="text-[11px] font-bold text-gray-500 leading-relaxed px-1">
                {sub.description}
              </p>

              <div className="flex gap-2 pt-2">
                <button className="flex-1 py-3 bg-gray-900 text-white text-xs font-black rounded-xl shadow-lg active:scale-95 transition-all">
                  إدارة الاشتراك
                </button>
                <button className="px-4 py-3 bg-gray-50 text-gray-500 text-xs font-black rounded-xl hover:bg-gray-100 transition-all">
                  التفاصيل
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredSubs.length === 0 && (
          <div className="py-20 text-center text-gray-400 bg-white rounded-[40px] border border-dashed border-gray-200">
            <Package size={64} className="mx-auto mb-6 opacity-10" />
            <p className="text-lg font-black opacity-40">لا توجد اشتراكات هنا</p>
            <p className="text-xs font-bold opacity-30 mt-2">اشترك الآن في خدماتنا المميزة</p>
          </div>
        )}
      </div>

      {/* Promotional Banner */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 p-6 rounded-[32px] text-white relative overflow-hidden group">
        <div className="relative z-10 space-y-2">
          <h3 className="text-lg font-black">وفر أكثر مع الاشتراكات!</h3>
          <p className="text-xs font-bold opacity-90 leading-relaxed">
            اشترك الآن في باقات التوصيل أو الميركاتو الشهرية واحصل على خصم يصل إلى 20% وهدايا فورية.
          </p>
          <button className="mt-2 px-6 py-2.5 bg-white text-red-600 rounded-xl text-xs font-black shadow-xl active:scale-95 transition-all">
            اكتشف العروض
          </button>
        </div>
        <Star size={120} className="absolute -left-10 -bottom-10 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-700" />
      </div>
    </div>
  );
}

export function CreateSubscriptionModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<SubType | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:00');

  // Reset sub-selections when type changes to prevent mapping errors
  useEffect(() => {
    setSelectedSubCategory('');
    setSelectedStore('');
    setSelectedProvider('');
    setSelectedVehicle('');
  }, [selectedType]);

  const daysOfWeek = [
    { id: 'sat', label: 'السبت' },
    { id: 'sun', label: 'الأحد' },
    { id: 'mon', label: 'الاثنين' },
    { id: 'tue', label: 'الثلاثاء' },
    { id: 'wed', label: 'الأربعاء' },
    { id: 'thu', label: 'الخميس' },
    { id: 'fri', label: 'الجمعة' },
  ];

  const sectionData = {
    driver: {
      subCategories: [
        { id: 'school', label: 'توصيل مدارس', icon: GraduationCap },
        { id: 'work', label: 'توصيل موظفين', icon: Briefcase },
        { id: 'private', label: 'مشاوير خاصة', icon: User }
      ],
      vehicles: {
        school: ['تويوتا هايس 2024', 'هيونداي H1', 'ميكروباص سقف عالي'],
        work: ['سوزوكي فان', 'نيسان صني', 'تويوتا كورولا'],
        private: ['مرسيدس E200', 'بي ام دبليو X5', 'كيا سبورتاج']
      },
      providers: {
        school: ['كابتن أحمد محمد', 'كابتن محمود علي'],
        work: ['كابتن ياسر حسن', 'كابتن إبراهيم'],
        private: ['كابتن علي سمير', 'كابتن هاني']
      }
    },
    mercato: {
      subCategories: [
        { id: 'grocery', label: 'سوبر ماركت', icon: ShoppingCart },
        { id: 'pharmacy', label: 'صيدلية', icon: Pill },
        { id: 'electronics', label: 'إلكترونيات', icon: Laptop }
      ],
      stores: {
        grocery: ['كارفور', 'لولو هايبر ماركت', 'فتح الله'],
        pharmacy: ['صيدلية العزبي', 'صيدلية سيف', 'صيدلية مصر'],
        electronics: ['بي تك', 'تريد لاين', 'دريم 2000']
      },
      providers: {
        grocery: ['مندوب توصيل مخصص', 'متسوق شخصي'],
        pharmacy: ['مندوب صيدلية سريع'],
        electronics: ['فني تركيب وتوصيل']
      }
    },
    freshmart: {
      subCategories: [
        { id: 'restaurants', label: 'مطاعم', icon: Utensils },
        { id: 'bakery', label: 'مخبوزات', icon: Cookie },
        { id: 'butcher', label: 'لحوم ودواجن', icon: Beef }
      ],
      stores: {
        restaurants: ['ماكدونالدز', 'كنتاكي', 'قصر الكبابجي'],
        bakery: ['سيموندس', 'لابوار', 'تسيباس'],
        butcher: ['جزارة المدينة', 'الريف المصري']
      },
      providers: {
        restaurants: ['عامل توصيل سريع'],
        bakery: ['مندوب توصيل مخبوزات'],
        butcher: ['مندوب توصيل مبرد']
      }
    },
    assisto: {
      subCategories: [
        { id: 'maintenance', label: 'صيانة منزلية', icon: Wrench },
        { id: 'cleaning', label: 'نظافة', icon: Sparkles },
        { id: 'laundry', label: 'دراي كلين', icon: Shirt }
      ],
      stores: {
        maintenance: ['مركز صيانة النصر', 'الشركة الهندسية'],
        cleaning: ['شركة الماسة للنظافة', 'خدمات كير'],
        laundry: ['مغسلة وايت', 'كلين آند جو']
      },
      providers: {
        maintenance: ['فني سباكة', 'فني كهرباء', 'فني تكييف'],
        cleaning: ['عاملة نظافة بالساعة', 'فني تنظيف سجاد'],
        laundry: ['مندوب استلام وتسليم']
      }
    }
  };

  const types = [
    { id: 'driver', label: 'وصلني / سائقين', icon: Car, color: 'bg-orange-50 text-orange-600', desc: 'اشتراكات التوصيل اليومي والمدارس' },
    { id: 'mercato', label: 'ميركاتو / منتجات', icon: Store, color: 'bg-blue-50 text-blue-600', desc: 'اشتراكات المنتجات والسلع الدورية' },
    { id: 'freshmart', label: 'فريش مارت / طعام', icon: Utensils, color: 'bg-red-50 text-red-600', desc: 'اشتراكات الوجبات والخضروات الطازجة' },
    { id: 'assisto', label: 'اسيستو / خدمات', icon: Wrench, color: 'bg-emerald-50 text-emerald-600', desc: 'اشتراكات الصيانة والخدمات المنزلية' },
  ];

  const plans = [
    { id: 'weekly', label: 'أسبوعي', price: '250 ج.م', desc: 'يتم التجديد كل 7 أيام' },
    { id: 'monthly', label: 'شهري', price: '900 ج.م', desc: 'يتم التجديد كل 30 يوم' },
    { id: 'yearly', label: 'سنوي', price: '10,000 ج.م', desc: 'يتم التجديد كل 365 يوم' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl relative"
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
              <Plus size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">إنشاء اشتراك جديد</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Step {step} of 5</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
            <XCircle size={24} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center space-y-1 mb-2">
                <h4 className="text-sm font-black text-gray-800">اختر نوع الاشتراك</h4>
                <p className="text-[10px] font-bold text-gray-400">حدد القسم الذي تود الاشتراك به</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {types.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedType(type.id as SubType);
                      setStep(2);
                    }}
                    className={`flex items-center gap-4 p-4 rounded-3xl border-2 transition-all text-right ${
                      selectedType === type.id 
                      ? 'border-red-600 bg-red-50/50' 
                      : 'border-gray-50 hover:border-red-100 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${type.color}`}>
                      <type.icon size={24} />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-black text-gray-800">{type.label}</h5>
                      <p className="text-[10px] font-bold text-gray-400">{type.desc}</p>
                    </div>
                    <ChevronLeft size={16} className="text-gray-300" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center space-y-1 mb-2">
                <h4 className="text-sm font-black text-gray-800">اختر خطة الاشتراك</h4>
                <p className="text-[10px] font-bold text-gray-400">حدد المدة والتكلفة المناسبة لك</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all text-right ${
                      selectedPlan === plan.id 
                      ? 'border-red-600 bg-red-50/50' 
                      : 'border-gray-50 hover:border-red-100 hover:bg-gray-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <h5 className="text-sm font-black text-gray-800">{plan.label}</h5>
                      <p className="text-[10px] font-bold text-gray-400">{plan.desc}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black text-red-600">{plan.price}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 bg-gray-50 text-gray-500 text-xs font-black rounded-2xl"
                >
                  رجوع
                </button>
                <button 
                  disabled={!selectedPlan}
                  onClick={() => setStep(3)}
                  className="flex-[2] py-4 bg-red-600 text-white text-xs font-black rounded-2xl shadow-lg shadow-red-100 disabled:opacity-50"
                >
                  التالي
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center space-y-1 mb-2">
                <h4 className="text-sm font-black text-gray-800">تخصيص الخدمة</h4>
                <p className="text-[10px] font-bold text-gray-400">اختر القسم والمزود المفضل</p>
              </div>
              
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {/* Sub-Category Selection */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-500 mr-2 uppercase flex items-center gap-2">
                    <LayoutGrid size={14} className="text-red-500" />
                    اختر القسم الفرعي
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedType && sectionData[selectedType].subCategories.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setSelectedSubCategory(sub.id);
                          setSelectedStore('');
                          setSelectedProvider('');
                          setSelectedVehicle('');
                        }}
                        className={`flex items-center gap-2 p-3 rounded-2xl border-2 transition-all text-right ${
                          selectedSubCategory === sub.id 
                          ? 'border-red-600 bg-red-50' 
                          : 'border-gray-50 bg-gray-50/50'
                        }`}
                      >
                        <sub.icon size={14} className={selectedSubCategory === sub.id ? 'text-red-600' : 'text-gray-400'} />
                        <span className="text-[10px] font-black">{sub.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedSubCategory && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Store/Center Selection (if not driver) */}
                    {selectedType !== 'driver' && (
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-gray-500 mr-2 uppercase flex items-center gap-2">
                          <Store size={14} className="text-red-500" />
                          المتجر / المركز (حسب القسم)
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                          {selectedType && (sectionData[selectedType] as any)?.stores?.[selectedSubCategory]?.map((s: string) => (
                            <button
                              key={s}
                              onClick={() => setSelectedStore(s)}
                              className={`p-3 rounded-2xl border-2 text-right text-xs font-bold transition-all ${
                                selectedStore === s ? 'border-red-600 bg-red-50' : 'border-gray-50 bg-gray-50/50'
                              }`}
                            >
                              {s}
                            </button>
                          )) || null}
                        </div>
                      </div>
                    )}

                    {/* Vehicle Selection (if driver) */}
                    {selectedType === 'driver' && (
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-gray-500 mr-2 uppercase flex items-center gap-2">
                          <Car size={14} className="text-red-500" />
                          المركبة (حسب قسم وصلني)
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                          {(sectionData.driver.vehicles as any)?.[selectedSubCategory]?.map((v: string) => (
                            <button
                              key={v}
                              onClick={() => setSelectedVehicle(v)}
                              className={`p-3 rounded-2xl border-2 text-right text-xs font-bold transition-all ${
                                selectedVehicle === v ? 'border-red-600 bg-red-50' : 'border-gray-50 bg-gray-50/50'
                              }`}
                            >
                              {v}
                            </button>
                          )) || null}
                        </div>
                      </div>
                    )}

                    {/* Provider Selection */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-500 mr-2 uppercase flex items-center gap-2">
                        <User size={14} className="text-red-500" />
                        مقدم الخدمة (الموجود داخل القسم)
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        {selectedType && (sectionData[selectedType] as any)?.providers?.[selectedSubCategory]?.map((p: string) => (
                          <button
                            key={p}
                            onClick={() => setSelectedProvider(p)}
                            className={`p-3 rounded-2xl border-2 text-right text-xs font-bold transition-all ${
                              selectedProvider === p ? 'border-red-600 bg-red-50' : 'border-gray-50 bg-gray-50/50'
                            }`}
                          >
                            {p}
                          </button>
                        )) || null}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setStep(2)}
                  className="flex-1 py-4 bg-gray-50 text-gray-500 text-xs font-black rounded-2xl"
                >
                  رجوع
                </button>
                <button 
                  disabled={!selectedSubCategory || !selectedProvider || (selectedType !== 'driver' && !selectedStore) || (selectedType === 'driver' && !selectedVehicle)}
                  onClick={() => setStep(4)}
                  className="flex-[2] py-4 bg-red-600 text-white text-xs font-black rounded-2xl shadow-lg shadow-red-100 disabled:opacity-50"
                >
                  التالي
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="text-center space-y-1 mb-2">
                <h4 className="text-sm font-black text-gray-800">الجدول الزمني</h4>
                <p className="text-[10px] font-bold text-gray-400">حدد الأيام والأوقات المفضلة</p>
              </div>
              
              <div className="space-y-6">
                {/* Day Selection */}
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-gray-500 mr-2 uppercase flex items-center gap-2">
                    <Calendar size={14} className="text-red-500" />
                    تحديد الأيام
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map((day) => (
                      <button
                        key={day.id}
                        onClick={() => {
                          if (selectedDays.includes(day.label)) {
                            setSelectedDays(selectedDays.filter(d => d !== day.label));
                          } else {
                            setSelectedDays([...selectedDays, day.label]);
                          }
                        }}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${
                          selectedDays.includes(day.label)
                          ? 'bg-red-600 text-white shadow-md shadow-red-100'
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-gray-500 mr-2 uppercase flex items-center gap-2">
                    <Clock size={14} className="text-red-500" />
                    تحديد التوقيت
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold text-gray-400 mr-2">من</span>
                      <input 
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-3 text-xs font-black outline-none focus:border-red-100 focus:bg-white transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold text-gray-400 mr-2">إلى</span>
                      <input 
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-3 text-xs font-black outline-none focus:border-red-100 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-gray-500 mr-2 uppercase">وصف إضافي</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="أضف أي ملاحظات إضافية هنا..."
                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 text-sm font-medium outline-none focus:border-red-100 focus:bg-white transition-all min-h-[80px] resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setStep(3)}
                  className="flex-1 py-4 bg-gray-50 text-gray-500 text-xs font-black rounded-2xl"
                >
                  رجوع
                </button>
                <button 
                  disabled={selectedDays.length === 0}
                  onClick={() => setStep(5)}
                  className="flex-[2] py-4 bg-red-600 text-white text-xs font-black rounded-2xl shadow-lg shadow-red-100 disabled:opacity-50"
                >
                  التالي
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center space-y-1 mb-2">
                <h4 className="text-sm font-black text-gray-800">تأكيد الاشتراك</h4>
                <p className="text-[10px] font-bold text-gray-400">راجع بيانات اشتراكك قبل التأكيد</p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-[32px] space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200/50">
                  <span className="text-[10px] font-bold text-gray-400">القسم</span>
                  <span className="text-[10px] font-black text-gray-800">
                    {selectedType && (sectionData[selectedType] as any).subCategories.find((s: any) => s.id === selectedSubCategory)?.label}
                  </span>
                </div>
                {selectedType !== 'driver' && (
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200/50">
                    <span className="text-[10px] font-bold text-gray-400">المتجر / المركز</span>
                    <span className="text-[10px] font-black text-gray-800">{selectedStore}</span>
                  </div>
                )}
                {selectedType === 'driver' && (
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200/50">
                    <span className="text-[10px] font-bold text-gray-400">المركبة</span>
                    <span className="text-[10px] font-black text-gray-800">{selectedVehicle}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pb-3 border-b border-gray-200/50">
                  <span className="text-[10px] font-bold text-gray-400">مقدم الخدمة</span>
                  <span className="text-[10px] font-black text-gray-800">{selectedProvider}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200/50">
                  <span className="text-[10px] font-bold text-gray-400">الخطة</span>
                  <span className="text-[10px] font-black text-gray-800">{plans.find(p => p.id === selectedPlan)?.label}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200/50">
                  <span className="text-[10px] font-bold text-gray-400">الأيام</span>
                  <span className="text-[10px] font-black text-gray-800">{selectedDays.join('، ')}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200/50">
                  <span className="text-[10px] font-bold text-gray-400">التوقيت</span>
                  <span className="text-[10px] font-black text-gray-800">{startTime} - {endTime}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200/50">
                  <span className="text-[10px] font-bold text-gray-400">التكلفة</span>
                  <span className="text-xs font-black text-red-600">{plans.find(p => p.id === selectedPlan)?.price}</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 items-start">
                <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-blue-700 leading-relaxed">
                  سيتم خصم قيمة الاشتراك من رصيدك الحالي تلقائياً عند التأكيد.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setStep(4)}
                  className="flex-1 py-4 bg-gray-50 text-gray-500 text-xs font-black rounded-2xl"
                >
                  رجوع
                </button>
                <button 
                  onClick={() => onClose()}
                  className="flex-[2] py-4 bg-emerald-600 text-white text-xs font-black rounded-2xl shadow-lg shadow-emerald-100"
                >
                  تأكيد واشتراك الآن
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export function MyFriendsTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const friends: any[] = [];

  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button className="flex-1 bg-blue-600 text-white py-3 rounded-2xl text-xs font-bold shadow-lg shadow-blue-100 flex items-center justify-center gap-2">
          <User size={16} />
          إضافة صديق
        </button>
        <button className="flex-1 bg-white border border-gray-100 py-3 rounded-2xl text-xs font-bold text-gray-600 flex items-center justify-center gap-2">
          <Heart size={16} className="text-red-500" />
          متابعة
        </button>
      </div>

      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="البحث عن صديق..." 
          className="w-full bg-white border border-gray-100 rounded-2xl py-3 pr-12 pl-4 text-sm font-medium shadow-sm outline-none focus:ring-2 focus:ring-red-100 transition-all"
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-black text-gray-800">الأصدقاء ({filteredFriends.length})</h3>
        {filteredFriends.map(friend => (
          <div key={friend.id} className="bg-white p-4 rounded-[32px] shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={friend.avatar} alt="Friend" className="w-12 h-12 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                <div>
                  <h4 className="text-sm font-black text-gray-900">{friend.name}</h4>
                  <p className="text-[10px] text-gray-400 font-bold">{friend.info}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all">
                  <Star size={18} />
                </button>
                <button className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all">
                  <Ban size={18} />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <button className="flex flex-col items-center gap-1.5 p-2 bg-gray-50 rounded-2xl hover:bg-red-50 transition-all group">
                <Eye size={16} className="text-gray-400 group-hover:text-red-600" />
                <span className="text-[9px] font-black text-gray-600 group-hover:text-red-700">الملف الشخصي</span>
              </button>
              <button className="flex flex-col items-center gap-1.5 p-2 bg-gray-50 rounded-2xl hover:bg-red-50 transition-all group">
                <MessageCircle size={16} className="text-gray-400 group-hover:text-red-600" />
                <span className="text-[9px] font-black text-gray-600 group-hover:text-red-700">مراسلة</span>
              </button>
              <button className="flex flex-col items-center gap-1.5 p-2 bg-gray-50 rounded-2xl hover:bg-red-50 transition-all group">
                <UserMinus size={16} className="text-gray-400 group-hover:text-red-600" />
                <span className="text-[9px] font-black text-gray-600 group-hover:text-red-700">إلغاء الصداقة</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MySettingsTab() {
  const { activeProfile, mainProfile, setUserMode } = useUser();
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isMainProfile = activeProfile.id === mainProfile.id;

  const settingsGroups = [
    {
      title: 'الحساب',
      items: [
        { icon: User, label: 'المعلومات الشخصية', color: 'text-blue-500' },
        { icon: MapPin, label: 'عناوين الشحن', color: 'text-red-500' },
        { icon: CreditCard, label: 'طرق الدفع', color: 'text-green-500' },
      ]
    },
    {
      title: 'الدعم والمعلومات',
      items: [
        { icon: AlertCircle, label: 'الأسئلة الشائعة', color: 'text-amber-500' },
        { icon: RefreshCw, label: 'سياسة الإرجاع', color: 'text-indigo-500' },
        { icon: Clock, label: 'شروط التقسيط', color: 'text-purple-500' },
        { icon: CreditCard, label: 'شرح الاشتراكات', color: 'text-pink-500' },
      ]
    }
  ];

  const modes: { id: UserMode, label: string, icon: any }[] = [
    { id: 'user', label: 'مستخدم', icon: User },
    { id: 'merchant', label: 'تاجر', icon: Store },
    { id: 'provider', label: 'مقدم خدمة', icon: Briefcase },
    { id: 'driver', label: 'سائق', icon: Car },
    { id: 'deal_manager', label: 'مدير صفقات', icon: Handshake },
    { id: 'restaurant', label: 'وكيل فريش مارت', icon: Utensils },
  ];

  return (
    <div className="space-y-6 pb-20">
      {isMainProfile && (
        <div className="space-y-3">
          <h3 className="text-sm font-black text-gray-800 mr-1">تبديل وضع الحساب الأساسي</h3>
          <div className="grid grid-cols-3 gap-2">
            {modes.map(mode => (
              <button
                key={mode.id}
                onClick={() => setUserMode(mode.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                  activeProfile.mode === mode.id 
                    ? 'border-red-600 bg-red-50 text-red-600' 
                    : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                }`}
              >
                <mode.icon size={20} />
                <span className="text-[10px] font-black">{mode.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {settingsGroups.map((group, idx) => (
        <div key={idx} className="space-y-3">
          <h3 className="text-sm font-black text-gray-800 mr-1">{group.title}</h3>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {group.items.map((item, i) => (
              <button key={i} className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-all ${i !== group.items.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-gray-50`}>
                    <item.icon size={18} className={item.color} />
                  </div>
                  <span className="text-sm font-bold text-gray-700">{item.label}</span>
                </div>
                <ChevronLeft size={18} className="text-gray-300" />
              </button>
            ))}
          </div>
        </div>
      ))}
      
      <button 
        onClick={handleLogout}
        className="w-full py-4 rounded-3xl bg-red-50 text-red-600 text-sm font-black hover:bg-red-100 transition-all"
      >
        تسجيل الخروج
      </button>
    </div>
  );
}

function MyShopTab() {
  const { activeProfile, addProduct, deleteProduct } = useUser();
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4">
          <Store size={40} />
        </div>
        <h3 className="text-lg font-black text-gray-800">{activeProfile.name}</h3>
        <p className="text-xs font-bold text-gray-400 mt-1">{activeProfile.description || 'أفضل المنتجات الغذائية الطازجة بأفضل الأسعار'}</p>
        <div className="flex gap-2 mt-6">
          <button 
            onClick={() => setIsAddProductModalOpen(true)}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-xs font-black shadow-lg shadow-blue-100"
          >
            إضافة منتج جديد
          </button>
          <button className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl text-xs font-black">تعديل المتجر</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(activeProfile.products || []).map(product => (
          <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative group">
            <button 
              onClick={() => deleteProduct(activeProfile.id, product.id)}
              className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <Trash2 size={14} />
            </button>
            <img src={product.image} alt={product.name} className="w-full h-32 object-cover" referrerPolicy="no-referrer" />
            <div className="p-3">
              <h4 className="text-xs font-bold text-gray-800 truncate">{product.name}</h4>
              <p className="text-[10px] font-black text-blue-600 mt-1">{product.price} ج.م</p>
            </div>
          </div>
        ))}
        {(!activeProfile.products || activeProfile.products.length === 0) && (
          <div className="col-span-2 py-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-xs font-bold text-gray-400">لا يوجد منتجات في متجرك بعد</p>
          </div>
        )}
      </div>

      {isAddProductModalOpen && (
        <AddProductModal 
          isOpen={isAddProductModalOpen}
          onClose={() => setIsAddProductModalOpen(false)}
          onAdd={(product) => addProduct(activeProfile.id, product)}
        />
      )}
    </div>
  );
}

function AddProductModal({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (product: any) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    image: '',
    description: '',
    location: ''
  });

  const handleAdd = () => {
    onAdd({
      ...formData,
      price: Number(formData.price),
      image: formData.image || `https://picsum.photos/seed/${formData.name}/300/300`
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="relative bg-white w-full max-w-md rounded-t-[40px] sm:rounded-[40px] overflow-hidden shadow-2xl"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <ChevronLeft size={24} className="rotate-180" />
                </button>
                <h3 className="text-xl font-black text-gray-900">إضافة منتج جديد</h3>
                <div className="w-10" />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black text-gray-500 mr-2 mb-1 block">اسم المنتج</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 mr-2 mb-1 block">السعر (ج.م)</label>
                  <input 
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 mr-2 mb-1 block">رابط الصورة</label>
                  <input 
                    type="text" 
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 mr-2 mb-1 block">الموقع</label>
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 mr-2 mb-1 block">الوصف</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all h-24 resize-none"
                  />
                </div>
              </div>

              <button 
                onClick={handleAdd}
                disabled={!formData.name || !formData.price}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl text-sm font-black shadow-lg shadow-blue-100 mt-6 disabled:opacity-50"
              >
                إضافة المنتج
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function MySalesTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400">إجمالي المبيعات</p>
          <h3 className="text-xl font-black text-gray-800">15,400 ج.م</h3>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400">عدد الطلبات</p>
          <h3 className="text-xl font-black text-gray-800">42 طلب</h3>
        </div>
      </div>
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
        <h3 className="text-sm font-black text-gray-800 mb-4">آخر المبيعات</h3>
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden">
                <img src={`https://picsum.photos/seed/sale${i}/100/100`} alt="Sale" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800">عميل رقم {i}</h4>
                <p className="text-[10px] text-gray-400 font-bold">منذ {i} ساعة</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-emerald-600">+450 ج.م</p>
              <p className="text-[9px] font-bold text-gray-400">مكتمل</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MyServicesTab() {
  const { activeProfile, updateMainCategories } = useUser();
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);

  const handleDelete = (category: string) => {
    const newCats = (activeProfile.categories || []).filter(c => c !== category);
    updateMainCategories(activeProfile.id, newCats);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4">
          <Briefcase size={40} />
        </div>
        <h3 className="text-lg font-black text-gray-800">{activeProfile.name}</h3>
        <p className="text-xs font-bold text-gray-400 mt-1">{activeProfile.description || 'مقدم خدمة معتمد'}</p>
        <div className="flex gap-2 mt-6">
          <button 
            onClick={() => setIsAddServiceModalOpen(true)}
            className="flex-1 bg-emerald-600 text-white py-3 rounded-xl text-xs font-black shadow-lg shadow-emerald-100"
          >
            إضافة خدمة
          </button>
          <button className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl text-xs font-black">تعديل الملف المهني</button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-black text-gray-800">خدماتي الحالية</h3>
        {(activeProfile.categories || []).map((cat, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-gray-800">{cat}</h4>
              <p className="text-[10px] font-black text-emerald-600 mt-1">خدمة معتمدة</p>
            </div>
            <button 
              onClick={() => handleDelete(cat)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {(!activeProfile.categories || activeProfile.categories.length === 0) && (
          <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-xs font-bold text-gray-400">لا يوجد خدمات مضافة بعد</p>
          </div>
        )}
      </div>

      {isAddServiceModalOpen && (
        <AddServiceModal 
          isOpen={isAddServiceModalOpen}
          onClose={() => setIsAddServiceModalOpen(false)}
          currentCategories={activeProfile.categories || []}
          onUpdate={(cats) => updateMainCategories(activeProfile.id, cats)}
        />
      )}
    </div>
  );
}

function AddServiceModal({ isOpen, onClose, currentCategories, onUpdate }: { isOpen: boolean, onClose: () => void, currentCategories: string[], onUpdate: (cats: string[]) => void }) {
  const [selectedCats, setSelectedCats] = useState<string[]>(currentCategories);
  
  const allServices = [
    'دكاتره', 'تنظيف', 'الموضه والعنايه الشخصيه', 'مدرسين', 'تصميم وابداع', 
    'اعمال بناء', 'اصلاحات', 'سياحه ورحلات', 'صيانه خارجيه', 'صيانه داخليه',
    'كهرباء', 'سباكة', 'نجارة', 'نقاشة', 'تكييف', 'بناء', 'سيراميك'
  ];

  const handleSave = () => {
    onUpdate(selectedCats);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="relative bg-white w-full max-w-md rounded-t-[40px] sm:rounded-[40px] overflow-hidden shadow-2xl"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <ChevronLeft size={24} className="rotate-180" />
                </button>
                <h3 className="text-xl font-black text-gray-900">إضافة خدمات</h3>
                <div className="w-10" />
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1 no-scrollbar">
                {allServices.map((cat, i) => (
                  <button
                    key={`${cat}-${i}`}
                    onClick={() => {
                      const isSelected = selectedCats.includes(cat);
                      const newCats = isSelected
                        ? selectedCats.filter(c => c !== cat)
                        : [...selectedCats, cat];
                      setSelectedCats(newCats);
                    }}
                    className={`p-3 rounded-xl text-xs font-bold border-2 transition-all ${
                      selectedCats.includes(cat)
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-600'
                        : 'border-gray-100 text-gray-600 hover:border-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button 
                onClick={handleSave}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl text-sm font-black shadow-lg shadow-emerald-100 mt-6"
              >
                حفظ الخدمات
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function MyScheduleTab() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
        <h3 className="text-sm font-black text-gray-800 mb-4">مواعيد العمل اليوم</h3>
        <div className="space-y-3">
          {[
            { time: '10:00 AM', client: 'محمد علي', service: 'تركيب نجف', status: 'مؤكد' },
            { time: '02:00 PM', client: 'سارة أحمد', service: 'تصليح عطل', status: 'قيد الانتظار' },
            { time: '06:00 PM', client: 'ياسين محمود', service: 'تأسيس كهرباء', status: 'مؤكد' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
              <div className="text-center min-w-[60px]">
                <p className="text-[10px] font-black text-gray-900">{item.time}</p>
              </div>
              <div className="flex-1 border-r border-gray-200 pr-4">
                <h4 className="text-xs font-bold text-gray-800">{item.client}</h4>
                <p className="text-[10px] text-gray-400 font-bold">{item.service}</p>
              </div>
              <div className={`text-[9px] font-black px-2 py-1 rounded-md ${item.status === 'مؤكد' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {item.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MyWalletTab() {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 rounded-3xl text-white shadow-xl shadow-emerald-100">
        <p className="text-[10px] font-bold opacity-80 uppercase tracking-wider">الرصيد القابل للسحب</p>
        <h3 className="text-3xl font-black mt-1">4,850.00 ج.م</h3>
        <button className="w-full bg-white text-emerald-600 py-3 rounded-2xl text-sm font-black mt-6 shadow-lg">
          طلب سحب الأرباح
        </button>
      </div>

      <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
        <h3 className="text-sm font-black text-gray-800 mb-4">سجل العمليات</h3>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                <RefreshCw size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800">{i % 2 === 0 ? 'سحب رصيد' : 'أرباح عملية'}</h4>
                <p className="text-[10px] text-gray-400 font-bold">21 مارس 2026</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-xs font-black ${i % 2 === 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {i % 2 === 0 ? '-1,000' : '+350'} ج.م
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MyPagesTab({ onSwitch, onDelete, onCreate }: { onSwitch: (id: string) => void, onDelete: (id: string) => void, onCreate: () => void }) {
  const { profiles, activeProfileId } = useUser();
  const pages = profiles.filter(p => p.isPage);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-black text-gray-800">صفحاتك</h3>
        <button 
          onClick={onCreate}
          className="flex items-center gap-1 text-[10px] font-black text-red-600 bg-red-50 px-3 py-1.5 rounded-full"
        >
          <Plus size={12} />
          إنشاء صفحة
        </button>
      </div>

      {pages.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {(pages || []).map(page => (
            <div key={page.id} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                  <img src={page.avatar} alt={page.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-800">{page.name}</h4>
                  <p className="text-[10px] font-bold text-gray-400">
                    {page.mode === 'merchant' ? 'تاجر' : 
                     page.mode === 'driver' ? 'سائق' : 
                     page.mode === 'provider' ? 'مقدم خدمة' : 
                     (page.mode === 'deal_manager' || page.mode === 'deal_provider') ? 'مدير صفقات' : 'مطعم/كافيه/صيدليه'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onSwitch(page.id)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${
                    activeProfileId === page.id 
                      ? 'bg-green-50 text-green-600' 
                      : 'bg-red-600 text-white shadow-md hover:bg-red-700'
                  }`}
                >
                  {activeProfileId === page.id ? 'نشط حالياً' : 'تبديل الآن'}
                </button>
                <button 
                  onClick={() => onDelete(page.id)}
                  className="p-2 text-gray-300 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Flag size={24} className="text-gray-300" />
          </div>
          <p className="text-xs font-bold text-gray-400">ليس لديك أي صفحات بعد</p>
          <p className="text-[10px] text-gray-300 mt-1">ابدأ بإنشاء صفحة لعملك أو خدمتك</p>
          <button 
            onClick={onCreate}
            className="mt-4 bg-red-600 text-white px-6 py-2 rounded-xl text-xs font-black shadow-md"
          >
            إنشاء أول صفحة
          </button>
        </div>
      )}
    </div>
  );
}
