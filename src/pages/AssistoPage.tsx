import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Marker, InfoWindow } from '@react-google-maps/api';
import { UnifiedMap } from '../components/UnifiedMap';
import { safeStringify } from '../lib/mapUtils';
import { syncStorage } from '../lib/storage';
import { 
  Hammer, 
  Wind,
  Map, 
  List, 
  Search, 
  Star, 
  Phone, 
  MessageCircle, 
  Heart, 
  MapPin, 
  ChevronLeft,
  User,
  Zap,
  Activity,
  Stethoscope,
  Sparkles,
  Scissors,
  GraduationCap,
  Palette,
  Settings,
  Plane,
  ExternalLink,
  Home,
  Music,
  Globe,
  Car,
  Briefcase,
  Utensils,
  Clock,
  Calendar,
  Navigation,
  Layers,
  Plus,
  Minus,
  Filter,
  Share2,
  Edit2,
  Trash2,
  BarChart3,
  CheckCircle2,
  XCircle,
  ClipboardList,
  TrendingUp,
  ArrowRight,
  Wrench,
  Truck,
  Shirt,
  Laptop,
  Smartphone,
  Flower2,
  BookOpen,
  Armchair,
  Gamepad2,
  LayoutGrid,
  Store,
  Tag,
  Trophy,
  Handshake,
  HardHat,
  Microscope,
  Syringe,
  HeartPulse,
  Building2,
  Factory,
  Pickaxe,
  PencilRuler,
  DraftingCompass,
  Construction,
  Users
} from 'lucide-react';
import { useUser, UserProfile } from '../context/UserContext';
import { usePosts } from '../context/PostContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useReviews } from '../context/ReviewContext';

const AssistoIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
  >
    {/* Outer Badge Circle */}
    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="5" />
    {/* Crossed Tools Background (Subtle) */}
    <rect x="46" y="25" width="8" height="50" rx="4" transform="rotate(45 50 50)" opacity="0.2" />
    <rect x="46" y="25" width="8" height="50" rx="4" transform="rotate(-45 50 50)" opacity="0.2" />
    {/* Service Provider (Person) */}
    <circle cx="50" cy="38" r="14" />
    <path d="M25,82 c0-15,12-24,25-24 s25,9,25,24 v6 h-50 v-6 z" />
    {/* Quality Star */}
    <path d="M50,58 l2.5,5 l5.5,0.8 l-4,3.9 l0.9,5.5 l-4.9-2.6 l-4.9,2.6 l0.9-5.5 l-4-3.9 l5.5-0.8 z" fill="white" />
  </svg>
);

export default function AssistoPage() {
  const { posts } = usePosts();
  const { appStructure, categories: settingsCategories, serviceTabs } = useSettings();
  const { userMode, activeProfile, profiles } = useUser();
  const { addAssistoOrder } = useCart();
  const { addReview } = useReviews();
  
  const dynamicTabs = (serviceTabs['assisto'] || []).filter(t => t.isActive && (t.userMode === 'user' || t.userMode === userMode));
  const providerTabs = [
    { id: 'my-requests', label: 'طلبات الخدمات', icon: ClipboardList },
    { id: 'my-services', label: 'خدماتي', icon: Briefcase },
    { id: 'my-bookings', label: 'الحجوزات', icon: Calendar },
    { id: 'my-reviews', label: 'التقييمات', icon: Star },
    { id: 'my-earnings', label: 'الأرباح', icon: BarChart3 },
    { id: 'my-stats', label: 'إحصائيات', icon: BarChart3 },
    { id: 'shop-settings', label: 'إعدادات المتجر', icon: Settings },
  ];
  const tabs = userMode === 'provider' ? providerTabs : dynamicTabs;

  const [activeTab, setActiveTab] = useState(() => {
    const saved = syncStorage.get('assisto_active_tab');
    if (saved) return saved;
    return userMode === 'provider' ? 'my-requests' : (dynamicTabs[0]?.id || 'categories');
  });

  useEffect(() => {
    syncStorage.set('assisto_active_tab', activeTab);
  }, [activeTab]);
  const [mapCenter, setMapCenter] = useState({ lat: 31.0409, lng: 31.3785 }); // Mansoura
  const [selectedProvider, setSelectedProvider] = useState<UserProfile | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const handleAddReview = async () => {
    if (!selectedProvider) return;
    await addReview({
      targetId: selectedProvider.id,
      targetType: 'profile',
      userId: activeProfile?.id || 'anonymous',
      userName: activeProfile?.name || 'مستخدم',
      userAvatar: activeProfile?.avatar || '',
      rating,
      content: reviewComment,
      source: 'assisto'
    });
    setShowReviewModal(false);
    setReviewComment('');
    setRating(5);
  };
  const [realPlaces, setRealPlaces] = useState<google.maps.places.PlaceResult[]>([]);

  const [viewingCategory, setViewingCategory] = useState<any | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

  const categories = settingsCategories['assisto'] || [];

  const handleSetActiveTab = (tabId: string) => {
    setActiveTab(tabId);
    window.history.pushState({ type: 'assisto_tab', id: tabId }, '');
  };

  const renderCategoryIcon = (iconName: string, size: number = 24) => {
    if (!iconName || iconName === 'None' || iconName === 'بدون ايقونة') return null;
    const iconMap: Record<string, any> = {
      Home, Shirt, Laptop, Smartphone, Flower2, BookOpen, Armchair, Sparkles, Gamepad2, Palette, Zap, LayoutGrid, Store, Tag, Star, Car, Trophy, Handshake, ClipboardList, TrendingUp, Briefcase, Map, MapPin, Phone, MessageCircle, Plus, Minus, Navigation, Layers, Users, User, BarChart3, CheckCircle2, Clock, Filter, ArrowRight, Stethoscope, Scissors, GraduationCap, Wrench, Truck, Activity, Heart, Globe, Utensils, Calendar, Plane, Music, Settings, Hammer, Wind,
      HardHat, Microscope, Syringe, HeartPulse, Building2, Factory, Pickaxe, PencilRuler, DraftingCompass, Construction
    };
    const IconComponent = iconMap[iconName] || BarChart3;
    return <IconComponent size={size} />;
  };

  // Handle back button for category navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      
      // Handle sub-tab switching
      if (state && state.type === 'assisto_tab') {
        setActiveTab(state.id);
        setViewingCategory(null);
        setSelectedSubCategory(null);
      } 
      // Handle category/subcategory navigation
      else if (state && (state.categoryId || state.subCategoryId)) {
        setActiveTab('categories');
        const cat = categories.find(c => c.id === state.categoryId);
        if (state.subCategoryId) {
          setSelectedSubCategory(state.subCategoryId);
          setViewingCategory(cat || null);
        } else {
          setViewingCategory(cat || null);
          setSelectedSubCategory(null);
        }
      }
      else if (state && state.type === 'tab' && state.id === 'assisto') {
        // Reset when going back to the main assisto tab state
        setViewingCategory(null);
        setSelectedSubCategory(null);
      } else if (!state) {
        setViewingCategory(null);
        setSelectedSubCategory(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTab, categories]);

  const handleSetViewingCategory = (cat: any | null) => {
    console.log("Setting viewing category:", cat);
    if (cat) {
      window.history.pushState({ type: 'assisto_category', categoryId: cat.id }, '');
      setViewingCategory(cat);
      setSelectedSubCategory(null);
    } else {
      setViewingCategory(null);
      setSelectedSubCategory(null);
    }
  };

  const handleSetSubCategory = (subName: string | null) => {
    if (subName && viewingCategory) {
      window.history.pushState({ type: 'assisto_subcategory', categoryId: viewingCategory.id, subCategoryId: subName }, '');
      setSelectedSubCategory(subName);
    } else if (viewingCategory) {
      window.history.back();
    }
  };

  const providerRequests = posts.filter(post => 
    post.source === 'assisto' && 
    (activeProfile.categories.length === 0 || activeProfile.categories.some(cat => post.category.includes(cat))) &&
    post.status === 'active'
  );

  const currentProviders: any[] = [];

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header Branding & Search Bar */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          {viewingCategory ? (
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => window.history.back()}
              className="p-2 bg-white text-gray-400 rounded-xl shadow-sm border border-gray-100 hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all active:scale-90"
            >
              <ArrowRight size={24} />
            </motion.button>
          ) : (
            <div className="p-2 bg-red-600 text-white rounded-xl shadow-lg shadow-red-100">
              <AssistoIcon size={24} />
            </div>
          )}
          <div>
            <h1 className="text-xl font-black text-gray-900 leading-tight">
              {userMode === 'provider' ? 'إدارة خدماتي' : 'اسيستو'}
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {userMode === 'provider' ? 'Provider Management' : 'Services Gate'}
            </p>
          </div>
        </div>

        {userMode !== 'provider' && (
          <div className="relative flex-1 max-w-[180px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              placeholder="بحث..." 
              className="w-full bg-white border border-gray-100 rounded-xl py-2 pr-9 pl-3 text-xs font-medium shadow-sm outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className={`grid gap-1 pb-2 -mx-2 px-2`} style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleSetActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center gap-1 px-1 py-2 rounded-xl text-[9px] font-black transition-all text-center truncate ${
              activeTab === tab.id
                ? userMode === 'provider' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-red-600 text-white shadow-sm'
                : 'bg-white text-gray-500 border border-gray-100'
            }`}
          >
            {typeof tab.icon === 'string' ? renderCategoryIcon(tab.icon, 16) : <tab.icon size={16} />}
            {tab.label}
          </button>
        ))}
      </div>

      {userMode === 'provider' ? (
        <div className="space-y-4">
          {activeTab === 'my-requests' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-gray-800">طلبات الخدمات في تخصصاتك</h3>
                  <div className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-1 rounded-full">
                    {providerRequests.length} طلب متاح
                  </div>
                </div>
                
                {providerRequests.length > 0 ? (
                  <div className="space-y-3">
                    {providerRequests.map(post => (
                      <div key={post.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-red-100 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-xs shadow-sm border border-gray-100">
                              👤
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-gray-800">{post.author}</h4>
                              <p className="text-[9px] font-bold text-gray-400">{new Date(post.createdAt).toLocaleDateString('ar-EG')}</p>
                            </div>
                          </div>
                          <div className="bg-indigo-50 text-indigo-600 text-[9px] font-black px-2 py-0.5 rounded-full">
                            {post.category}
                          </div>
                        </div>
                        <p className="text-xs font-bold text-gray-600 mb-3 leading-relaxed">{post.content}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600">
                              <Zap size={10} />
                              <span>{post.budget}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-black text-amber-600">
                              <Clock size={10} />
                              <span>{post.duration}</span>
                            </div>
                          </div>
                          <button className="px-4 py-1.5 bg-red-600 text-white text-[10px] font-black rounded-xl shadow-md hover:bg-red-700 transition-all active:scale-95">
                            تقديم عرض
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ClipboardList size={24} className="text-gray-300" />
                    </div>
                    <p className="text-xs font-bold text-gray-400">لا توجد طلبات حالياً في تخصصاتك المختارة</p>
                    <button className="mt-4 text-[10px] font-black text-red-600 hover:underline">
                      تعديل التخصصات من الملف الشخصي
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'my-services' && (
            <div className="space-y-3">
              <button className="w-full bg-indigo-600 text-white py-3 rounded-2xl text-sm font-black shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
                <Plus size={18} />
                إضافة خدمة جديدة
              </button>
              <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <p className="text-xs font-bold text-gray-400">لا توجد خدمات مضافة حالياً</p>
              </div>
            </div>
          )}
          {activeTab === 'my-bookings' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-black text-gray-800">حجوزات اليوم</h3>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">0 حجوزات</span>
              </div>
              <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <p className="text-xs font-bold text-gray-400">لا توجد حجوزات اليوم</p>
              </div>
            </div>
          )}
          {activeTab === 'my-reviews' && (
            <div className="space-y-3">
              <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <p className="text-xs font-bold text-gray-400">لا توجد تقييمات حالياً</p>
              </div>
            </div>
          )}
          {activeTab === 'my-earnings' && (
            <div className="space-y-4">
              <div className="bg-indigo-600 p-6 rounded-[32px] text-white shadow-lg shadow-indigo-100">
                <p className="text-xs font-bold opacity-80 mb-1">الرصيد المتاح</p>
                <h2 className="text-3xl font-black">2,450.00 ج.م</h2>
                <button className="mt-4 w-full bg-white/20 backdrop-blur-md py-2 rounded-xl text-xs font-black hover:bg-white/30 transition-all">
                  طلب سحب الأرباح
                </button>
              </div>
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                <h4 className="text-sm font-black text-gray-800 mb-3">آخر العمليات</h4>
                <div className="py-6 text-center">
                  <p className="text-xs font-bold text-gray-400">لا توجد عمليات سابقة</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {viewingCategory && activeTab !== 'map' ? (
              <motion.div
                key="category-detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 pb-20"
              >
                {/* Category Header */}
                <div className="flex items-center gap-4 bg-white p-4 rounded-[32px] shadow-sm border border-gray-100">
                  <button 
                    onClick={() => handleSetViewingCategory(null)}
                    className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <ChevronLeft className="rotate-180" size={20} />
                  </button>
                  <div className={`w-12 h-12 ${(viewingCategory.color || 'bg-red-500').replace('text-', 'bg-')} rounded-2xl flex items-center justify-center text-white shadow-sm`}>
                    {renderCategoryIcon(viewingCategory.icon, 24)}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-gray-900">{viewingCategory.name}</h2>
                    <p className="text-[10px] font-bold text-gray-400">تصفح التخصصات ومقدمي الخدمات</p>
                  </div>
                </div>

                {/* Subcategories Grid */}
                <div className="space-y-4">
                  {viewingCategory.groupedSubCategories && viewingCategory.groupedSubCategories.length > 0 ? (
                    viewingCategory.groupedSubCategories.map((group: any) => (
                      <div key={group.title} className="space-y-3">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">{group.title}</h3>
                        <div className="grid grid-cols-5 gap-2">
                          {group.items.map((sub: any) => (
                            <button
                              key={sub.name}
                              onClick={() => handleSetSubCategory(sub.name)}
                              className={`p-2 rounded-xl border transition-all flex flex-col items-center justify-center gap-1.5 ${
                                selectedSubCategory === sub.name
                                  ? 'bg-red-600 border-red-600 text-white shadow-md scale-95'
                                  : 'bg-white border-gray-100 text-gray-600 hover:border-red-200 shadow-sm'
                              }`}
                            >
                              <div className="w-5 h-5 flex items-center justify-center">
                                {sub.icon && sub.icon.length > 2 ? renderCategoryIcon(sub.icon, 14) : <span className="text-base">{sub.icon}</span>}
                              </div>
                              <span className="text-[10px] font-black text-center leading-tight">{sub.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : viewingCategory.subCategories && viewingCategory.subCategories.length > 0 ? (
                    <div className="grid grid-cols-5 gap-2">
                      {viewingCategory.subCategories.map((sub: any) => (
                        <button
                          key={sub.id || sub.name}
                          onClick={() => handleSetSubCategory(sub.name)}
                          className={`p-2 rounded-xl border transition-all flex flex-col items-center justify-center gap-1.5 ${
                            selectedSubCategory === sub.name
                              ? 'bg-red-600 border-red-600 text-white shadow-md scale-95'
                              : 'bg-white border-gray-100 text-gray-600 hover:border-red-200 shadow-sm'
                          }`}
                        >
                          <div className="w-5 h-5 flex items-center justify-center">
                            {sub.icon && sub.icon.length > 2 ? renderCategoryIcon(sub.icon, 14) : <span className="text-base">{sub.icon}</span>}
                          </div>
                          <span className="text-[10px] font-black text-center leading-tight">{sub.name}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
                      <p className="text-xs font-bold text-gray-400">لا توجد أقسام فرعية مضافة لهذا القسم حالياً</p>
                    </div>
                  )}
                </div>

                {/* Providers List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-black text-gray-900">
                      {selectedSubCategory ? `مقدمو خدمة ${selectedSubCategory}` : 'كل مقدمي الخدمات في هذا القسم'}
                    </h3>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                      {profiles.filter(p => 
                        p.mode === 'provider' && 
                        p.categories.some(c => c.includes(viewingCategory.name) || viewingCategory.name.includes(c)) &&
                        (!selectedSubCategory || p.categories.some(c => c.includes(selectedSubCategory)))
                      ).length} متاح
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {profiles
                      .filter(p => 
                        p.mode === 'provider' && 
                        p.categories.some(c => c.includes(viewingCategory.name) || viewingCategory.name.includes(c)) &&
                        (!selectedSubCategory || p.categories.some(c => c.includes(selectedSubCategory)))
                      )
                      .map((provider) => (
                        <button
                          key={provider.id}
                          onClick={() => setSelectedProvider(provider)}
                          className="bg-white p-4 rounded-[32px] shadow-sm border border-gray-100 flex items-center justify-between hover:border-red-100 transition-all group text-right"
                        >
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <img 
                                src={provider.avatar || `https://picsum.photos/seed/${provider.id}/100/100`} 
                                alt={provider.name} 
                                className="w-14 h-14 rounded-2xl object-cover shadow-sm"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" />
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-gray-900 group-hover:text-red-600 transition-colors">{provider.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                                  <Star size={10} fill="currentColor" />
                                  <span>{(provider as any).rating || '4.8'}</span>
                                </div>
                                <span className="text-[10px] font-bold text-gray-300">•</span>
                                <span className="text-[10px] font-bold text-gray-400">خبرة {(provider as any).experience || '5'} سنوات</span>
                              </div>
                            </div>
                          </div>
                          <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                            <ChevronLeft size={18} />
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="tab-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {activeTab === 'categories' && (
                  <motion.div
                    key="categories-grid"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8 pb-20"
                  >
                    {(appStructure['assisto'] || [])
                      .filter(s => s.isActive && s.tabId === activeTab)
                      .sort((a, b) => a.order - b.order)
                      .map(section => (
                      <div key={section.id} className="space-y-4">
                        {/* Section Header */}
                        <div className="flex items-center justify-between px-2">
                          <div>
                            <h3 className="text-sm font-black text-gray-800">{section.name}</h3>
                            <p className="text-[10px] font-bold text-gray-400">{section.description}</p>
                          </div>
                        </div>

                        {/* Section Content based on type */}
                        {section.type === 'categories' && (
                          <div className="grid grid-cols-5 gap-2">
                            {categories
                              .filter(cat => cat.sectionId === section.id)
                              .map((cat) => (
                              <button
                                key={cat.id}
                                onClick={() => handleSetViewingCategory(cat)}
                                className="bg-white p-2 rounded-[20px] shadow-sm border border-gray-100 hover:border-red-200 transition-all cursor-pointer group flex flex-col items-center justify-center gap-1.5"
                              >
                                <div className={`w-8 h-8 ${cat.color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                  {renderCategoryIcon(cat.icon, 14)}
                                </div>
                                <h3 className="text-[10px] font-black text-gray-800 text-center leading-tight h-6 flex items-center">{cat.name}</h3>
                              </button>
                            ))}
                          </div>
                        )}

                        {section.type === 'banners' && (
                          <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2">
                            {[1, 2].map(i => (
                              <div key={i} className="min-w-[260px] h-28 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[28px] p-5 text-white relative overflow-hidden flex-shrink-0">
                                <div className="relative z-10">
                                  <h4 className="text-base font-black">خدمة متميزة {i}</h4>
                                  <p className="text-[10px] font-bold opacity-80">احجز الآن واحصل على خصم 20%</p>
                                </div>
                                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
                              </div>
                            ))}
                          </div>
                        )}

                        {section.type === 'featured_stores' && (
                          <div className="grid grid-cols-1 gap-3">
                            {profiles.filter(p => p.isPage && p.sectionId === section.id).slice(0, 3).map(provider => (
                              <button key={provider.id} onClick={() => setSelectedProvider(provider)} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-blue-100 transition-all group text-right">
                                <div className="flex items-center gap-3">
                                  <img src={provider.avatar || `https://picsum.photos/seed/${provider.id}/100/100`} className="w-12 h-12 rounded-xl object-cover shadow-sm" referrerPolicy="no-referrer" />
                                  <div>
                                    <h4 className="text-xs font-black text-gray-900">{provider.name}</h4>
                                    <p className="text-[9px] font-bold text-gray-400">مزود خدمة موثق</p>
                                  </div>
                                </div>
                                <ChevronLeft size={16} className="text-gray-300" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'map' && (
                  <div className="relative h-[600px] rounded-[40px] overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
                    <UnifiedMap
                      center={mapCenter}
                      zoom={14}
                      placeholder="ابحث في هذه المنطقة..."
                      accentColor="red"
                      categories={[{ id: 'all', name: 'الكل' }, ...categories.map(c => ({ id: c.id, name: c.name }))]}
                      activeCategory={viewingCategory?.id || 'all'}
                      onCategoryChange={(id) => {
                        if (id === 'all') {
                          setViewingCategory(null);
                        } else {
                          const cat = categories.find(c => c.id === id);
                          if (cat) setViewingCategory(cat);
                        }
                      }}
                      onLocationUpdate={setMapCenter}
                      nearbySearchType="health"
                      onPlacesFound={setRealPlaces}
                    >
                      {/* Real Google Places Markers */}
                      {realPlaces.map((place, idx) => (
                        <Marker
                          key={`real-${place.place_id || idx}`}
                          position={place.geometry?.location?.toJSON() || { lat: 0, lng: 0 }}
                          onClick={() => setSelectedProvider({
                            id: place.place_id,
                            name: place.name,
                            categories: [place.types?.[0] || 'مقدم خدمة'],
                            lat: place.geometry?.location?.lat(),
                            lng: place.geometry?.location?.lng(),
                            rating: place.rating,
                            isReal: true
                          } as UserProfile)}
                          icon={{
                            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                          }}
                        />
                      ))}

                      {/* Real Provider Markers */}
                      {profiles.filter(p => p.mode === 'provider' && p.lat && p.lng).map(provider => (
                        <Marker 
                          key={provider.id} 
                          position={{ lat: provider.lat!, lng: provider.lng! }}
                          onClick={() => setSelectedProvider(provider)}
                        >
                          {selectedProvider?.id === provider.id && (
                            <InfoWindow onCloseClick={() => setSelectedProvider(null)}>
                              <div className="p-2 min-w-[150px] text-center">
                                <div className="w-12 h-12 mx-auto mb-2 rounded-full overflow-hidden border-2 border-red-600">
                                  <img src={selectedProvider.avatar || `https://picsum.photos/seed/${selectedProvider.id}/100/100`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                                <h4 className="text-xs font-black text-gray-800">{selectedProvider.name}</h4>
                                <p className="text-[10px] font-bold text-red-600">
                                  {selectedProvider.categories[0] || 'مقدم خدمة'} {selectedProvider.rating ? `(${selectedProvider.rating} ⭐)` : ''}
                                </p>
                              </div>
                            </InfoWindow>
                          )}
                        </Marker>
                      ))}
                    </UnifiedMap>
                  </div>
                )}

                {activeTab === 'online' && (
                  <div className="space-y-3">
                    <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                      <p className="text-xs font-bold text-gray-400">لا يوجد متصلون الآن</p>
                    </div>
                  </div>
                )}

                {/* Generic Section Renderer for other tabs */}
                {!['categories', 'map', 'online', 'my-requests', 'my-stats', 'shop-settings'].includes(activeTab) && (
                  <div className="space-y-6 pb-20">
                    {(appStructure['assisto'] || [])
                      .filter(s => s.isActive && s.tabId === activeTab)
                      .sort((a, b) => a.order - b.order)
                      .map(section => (
                        <div key={section.id} className="space-y-4">
                          {/* Section Header */}
                          <div className="flex items-center justify-between px-2">
                            <div>
                              <h3 className="text-sm font-black text-gray-800">{section.name}</h3>
                              <p className="text-[10px] font-bold text-gray-400">{section.description}</p>
                            </div>
                          </div>

                          {/* Section Content based on type */}
                          {section.type === 'categories' && (
                            <div className={`grid ${section.layout === 'grid' ? 'grid-cols-5' : section.layout === 'list' ? 'grid-cols-1' : 'flex overflow-x-auto no-scrollbar gap-2'} gap-2`}>
                              {settingsCategories['assisto']
                                ?.filter(cat => cat.sectionId === section.id)
                                ?.map((cat) => (
                                <button
                                  key={cat.id}
                                  onClick={() => handleSetViewingCategory(cat)}
                                  className="bg-white p-2 rounded-[20px] shadow-sm border border-gray-100 hover:border-red-200 transition-all cursor-pointer group flex flex-col items-center justify-center gap-1.5"
                                >
                                  <div className={`w-8 h-8 ${cat.color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                    {renderCategoryIcon(cat.icon, 14)}
                                  </div>
                                  <h3 className="text-[10px] font-black text-gray-800 text-center leading-tight h-6 flex items-center">{cat.name}</h3>
                                </button>
                              ))}
                            </div>
                          )}

                          {section.type === 'banners' && (
                            <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2">
                              {[1, 2].map(i => (
                                <div key={i} className="min-w-[260px] h-28 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[28px] p-5 text-white relative overflow-hidden flex-shrink-0">
                                  <div className="relative z-10">
                                    <h4 className="text-base font-black">خدمة مميزة {i}</h4>
                                    <p className="text-[10px] font-bold opacity-80">احجز الآن واحصل على خصم 20%</p>
                                  </div>
                                  <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
                                </div>
                              ))}
                            </div>
                          )}

                          {section.type === 'featured_stores' && (
                            <div className="grid grid-cols-1 gap-3">
                              {profiles.filter(p => p.isPage && p.sectionId === section.id).slice(0, 3).map(provider => (
                                <button key={provider.id} onClick={() => setSelectedProvider(provider)} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-red-100 transition-all group text-right">
                                  <div className="flex items-center gap-3">
                                    <img src={provider.avatar || `https://picsum.photos/seed/${provider.id}/100/100`} className="w-12 h-12 rounded-xl object-cover shadow-sm" referrerPolicy="no-referrer" />
                                    <div>
                                      <h4 className="text-xs font-black text-gray-900">{provider.name}</h4>
                                      <p className="text-[9px] font-bold text-gray-400">مقدم خدمة موثق</p>
                                    </div>
                                  </div>
                                  <ChevronLeft size={16} className="text-gray-300" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Provider View Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 bg-white z-[150] flex flex-col">
          <div className="relative h-48 bg-gray-100">
            <img 
              src={selectedProvider.cover || `https://picsum.photos/seed/${selectedProvider.id}/800/400`} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <button 
              onClick={() => setSelectedProvider(null)}
              className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-900 shadow-lg"
            >
              <ArrowRight size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 -mt-12">
            <div className="bg-white rounded-[40px] p-6 shadow-xl border border-gray-100 space-y-6">
              <div className="flex items-center gap-4">
                <img 
                  src={selectedProvider.avatar || `https://picsum.photos/seed/${selectedProvider.id}/100/100`} 
                  className="w-20 h-20 rounded-3xl object-cover border-4 border-white shadow-lg"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-black text-gray-900">{selectedProvider.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star size={12} fill="currentColor" />
                      <span>{selectedProvider.rating || '4.8'}</span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs font-bold text-gray-400">{selectedProvider.categories?.[0] || 'مقدم خدمة'}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm font-medium text-gray-600 leading-relaxed">
                {selectedProvider.description || 'أهلاً بكم! أنا مقدم خدمة محترف بخبرة تزيد عن 5 سنوات. يسعدني مساعدتكم في أي وقت.'}
              </p>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('open-support-chat', { 
                      detail: { 
                        userId: selectedProvider.id, 
                        userName: selectedProvider.name 
                      } 
                    }));
                  }}
                  className="flex-1 bg-red-600 text-white py-4 rounded-2xl text-sm font-black shadow-lg shadow-red-100 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <MessageCircle size={20} />
                  <span>تواصل معي</span>
                </button>
                <button 
                  onClick={() => setShowReviewModal(true)}
                  className="p-4 bg-amber-50 text-amber-600 rounded-2xl hover:bg-amber-100 transition-colors"
                >
                  <Star size={20} />
                </button>
                <button 
                  className="p-4 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-colors"
                >
                  <Share2 size={20} />
                </button>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-sm font-black text-gray-900 mb-4">معلومات إضافية</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">الخبرة</p>
                    <p className="text-xs font-black text-gray-800">5 سنوات</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">الموقع</p>
                    <p className="text-xs font-black text-gray-800">المنصورة، الدقهلية</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-sm rounded-[32px] p-6 space-y-6 shadow-2xl"
          >
            <div className="text-center">
              <h3 className="text-lg font-black text-gray-900">تقييم مقدم الخدمة</h3>
              <p className="text-xs font-bold text-gray-400 mt-1">شاركنا رأيك في {selectedProvider?.name}</p>
            </div>

            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button 
                  key={s} 
                  onClick={() => setRating(s)}
                  className="p-1 transition-transform active:scale-90"
                >
                  <Star 
                    size={32} 
                    className={s <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200"} 
                  />
                </button>
              ))}
            </div>

            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="اكتب تعليقك هنا..."
              className="w-full bg-gray-50 border-none rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-red-500/20 h-24 resize-none"
            />

            <div className="flex gap-3">
              <button 
                onClick={handleAddReview}
                className="flex-1 bg-red-600 text-white py-3.5 rounded-2xl text-xs font-black shadow-lg shadow-red-100 active:scale-95 transition-all"
              >
                إرسال التقييم
              </button>
              <button 
                onClick={() => setShowReviewModal(false)}
                className="flex-1 bg-gray-100 text-gray-600 py-3.5 rounded-2xl text-xs font-black active:scale-95 transition-all"
              >
                إلغاء
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
