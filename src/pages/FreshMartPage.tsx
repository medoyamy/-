import React, { useState, useEffect } from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';
import { UnifiedMap } from '../components/UnifiedMap';
import { safeStringify } from '../lib/mapUtils';
import { syncStorage } from '../lib/storage';
import { 
  Map, 
  Search, 
  Star, 
  MapPin, 
  ChevronLeft, 
  Heart, 
  Clock, 
  Plus, 
  Minus,
  Users, 
  Share2,
  Filter,
  X,
  Eye,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  ClipboardList,
  Utensils,
  Package,
  Layers,
  BarChart3,
  Settings as SettingsIcon,
  Zap,
  ShoppingBag,
  Leaf,
  Cake,
  Pill,
  Beef,
  Waves,
  Croissant,
  Cookie,
  Coffee,
  Pizza,
  LayoutGrid,
  Navigation,
  Trash2,
  Edit2,
  FileText,
  CreditCard,
  Wallet,
  MessageCircle,
  Mail,
  Phone,
  Camera,
  Tag,
  Briefcase,
  GraduationCap,
  Music,
  Target,
  Facebook,
  Instagram,
  Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUser, UserMode } from '../context/UserContext';
import { usePosts } from '../context/PostContext';
import { useSettings } from '../context/SettingsContext';

const FreshMartIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
  >
    {/* Dynamic Bolt/Flash Shape */}
    <path d="M60,10 L25,55 L45,55 L40,90 L75,45 L55,45 L60,10 Z" />
    {/* Circular Badge */}
    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="10 5" />
  </svg>
);

interface SubCategory {
  id: string;
  name: string;
  icon: string;
  isActive: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isActive: boolean;
  order: number;
  subCategories: SubCategory[];
}

export default function FreshMartPage() {
  const { posts } = usePosts();
  const { appStructure, categories: allCategories, serviceTabs } = useSettings();
  const categories = allCategories['freshmart'] || [];
  const { 
    userMode, 
    activeProfile, 
    profiles,
    currentCity,
    currentRegion
  } = useUser();
  const dynamicTabs = (serviceTabs['freshmart'] || []).filter(t => t.isActive);

  const renderCategoryIcon = (iconName: string, size: number = 24) => {
    if (!iconName || iconName === 'None' || iconName === 'بدون ايقونة') return null;
    const iconMap: Record<string, any> = {
      Utensils, ShoppingBag, Leaf, Cake, Pill, LayoutGrid, Map, Navigation, Users, Package, BarChart3, Settings: SettingsIcon, SettingsIcon, Zap, Search, Star, MapPin, ChevronLeft, Heart, Clock, Plus, Minus, Share2, Filter, X, Eye, TrendingUp, CheckCircle2, ChevronRight, ArrowRight, ClipboardList, Layers, FileText, CreditCard, Wallet, MessageCircle, Mail, Phone, Camera, Tag, Briefcase, GraduationCap, Music, Target, Facebook, Instagram, Video,
      Beef, Waves, Croissant, Cookie, Coffee, Pizza
    };
    const IconComponent = iconMap[iconName] || ShoppingBag;
    return <IconComponent size={size} />;
  };

  const [activeTab, setActiveTab] = useState(() => {
    const saved = syncStorage.get('freshmart_active_tab');
    if (saved) return saved;
    return userMode === 'restaurant' ? 'my-orders' : (dynamicTabs[0]?.id || 'categories');
  });

  useEffect(() => {
    syncStorage.set('freshmart_active_tab', activeTab);
  }, [activeTab]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [viewingCategory, setViewingCategory] = useState<string | null>(() => {
    return syncStorage.get('freshmart_viewing_category');
  });

  // Persistence

  useEffect(() => {
    if (viewingCategory) {
      syncStorage.set('freshmart_viewing_category', viewingCategory);
    } else {
      syncStorage.remove('freshmart_viewing_category');
    }
  }, [viewingCategory]);

  // Back button handling
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state && state.type === 'freshmart_category') {
        setViewingCategory(state.id);
        setSelectedSubCategory(null);
      } else if (state && state.type === 'freshmart_subcategory') {
        setViewingCategory(state.catId);
        setSelectedSubCategory(state.id);
      } else {
        // Any other state (null, tab, overlay) should reset FreshMart internal view
        setViewingCategory(null);
        setSelectedSubCategory(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [activeSubTab, setActiveSubTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllFiltersModal, setShowAllFiltersModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [quickFilters, setQuickFilters] = useState({
    nearby: false,
    rating: false,
    fastDelivery: false,
    premium: false
  });

  const handleSetViewingCategory = (catId: string | null) => {
    if (catId) {
      window.history.pushState({ type: 'freshmart_category', id: catId }, '');
    }
    setViewingCategory(catId);
    setSelectedSubCategory(null);
    setActiveSubTab('all');
  };

  const handleSetSubCategory = (subId: string | null) => {
    const newSubId = selectedSubCategory === subId ? null : subId;
    
    if (newSubId && viewingCategory) {
      window.history.pushState({ type: 'freshmart_subcategory', id: newSubId, catId: viewingCategory }, '');
      // Scroll to results
      const resultsElement = document.getElementById('store-results');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (!newSubId && viewingCategory) {
      window.history.pushState({ type: 'freshmart_category', id: viewingCategory }, '');
    }
    setSelectedSubCategory(newSubId);
    if (newSubId) {
      setSelectedFilters([]); // Clear multi-filters if a single subcategory is picked
    }
  };

  const handleToggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter) 
        : [...prev, filter]
    );
  };

  const handleApplyFilters = () => {
    setShowAllFiltersModal(false);
    setSelectedSubCategory(null); // Clear single subcategory if multi-filters are applied
    // Scroll to results
    const resultsElement = document.getElementById('store-results');
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleClearFilters = () => {
    setSelectedFilters([]);
    setSelectedSubCategory(null);
    setSearchQuery('');
    setQuickFilters({
      nearby: false,
      rating: false,
      fastDelivery: false,
      premium: false
    });
  };

  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);
  const [showJoinOptions, setShowJoinOptions] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 31.0409, lng: 31.3785 }); // Mansoura
  const [selectedRestaurant, setSelectedRestaurant] = useState<any | null>(null);
  const [realPlaces, setRealPlaces] = useState<google.maps.places.PlaceResult[]>([]);

  const [liveViewers, setLiveViewers] = useState<Record<string, number>>({});

  const restaurantRequests = posts.filter(post => 
    post.source === 'restaurants' && 
    (activeProfile.categories.length === 0 || activeProfile.categories.some(cat => post.category.includes(cat))) &&
    post.status === 'active'
  );

  const toggleJoin = (id: string) => {
    if (joinedGroups.includes(id)) {
      setJoinedGroups(prev => prev.filter(p => p !== id));
    } else {
      setShowJoinOptions(id);
    }
  };

  const confirmJoin = (id: string) => {
    setJoinedGroups(prev => [...prev, id]);
    setShowJoinOptions(null);
  };

  const restaurantTabs = dynamicTabs.filter(t => t.userMode === 'restaurant' && t.isActive).sort((a, b) => a.order - b.order);
  const userTabs = dynamicTabs.filter(t => t.userMode === 'user' && t.isActive).sort((a, b) => a.order - b.order);

  const tabs = userMode === 'restaurant' ? restaurantTabs : userTabs;

  const restaurantMarkers = posts.filter(p => p.source === 'restaurants' && p.lat && p.lng);

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header Branding & Search Bar */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          {viewingCategory ? (
            <motion.button 
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => window.history.back()}
              className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-800 rounded-full hover:bg-gray-100 transition-all active:bg-gray-200"
            >
              <ArrowRight size={24} />
            </motion.button>
          ) : (
            <div className="p-2 bg-red-600 text-white rounded-xl shadow-lg shadow-red-100">
              <FreshMartIcon size={24} />
            </div>
          )}
          <div>
            <h1 className="text-xl font-black text-gray-900 leading-tight">فريش مارت</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fresh Mart Gate</p>
          </div>
        </div>

        <div className="relative flex-1 max-w-[180px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input 
            type="text" 
            placeholder="بحث..." 
            className="w-full bg-white border border-gray-100 rounded-xl py-2 pr-9 pl-3 text-xs font-medium shadow-sm outline-none focus:ring-2 focus:ring-red-100"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className={`grid gap-1 pb-2 -mx-2 px-2`} style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center gap-1 px-1 py-2 rounded-xl text-[9px] font-black transition-all text-center truncate ${
              activeTab === tab.id
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white text-gray-500 border border-gray-100'
            }`}
          >
            {renderCategoryIcon(tab.icon, 16)}
            {tab.label}
          </button>
        ))}
      </div>

      {userMode === 'restaurant' && (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
          {activeTab === 'my-orders' && <RestaurantOrdersTab />}
          {activeTab === 'my-menu' && <RestaurantMenuTab />}
          {activeTab === 'my-stats' && <RestaurantStatsTab />}
          {activeTab === 'my-subs' && <RestaurantSubsTab />}
          {activeTab === 'settings' && <RestaurantSettingsTab />}
        </div>
      )}

      {userMode !== 'restaurant' && activeTab === 'categories' && (
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {!viewingCategory ? (
              <motion.div 
                key="main-categories"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                {(appStructure['freshmart'] || [])
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
                        {categories
                          .filter(cat => cat.sectionId === section.id)
                          .map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => handleSetViewingCategory(cat.id)}
                            className="bg-white p-2 rounded-[16px] shadow-sm border border-gray-100 hover:border-red-200 transition-all flex flex-col items-center justify-center gap-1 group relative"
                          >
                            <div className={`w-8 h-8 ${cat.color || 'bg-red-500'} text-white rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform text-lg`}>
                              {renderCategoryIcon(cat.icon, 14)}
                            </div>
                            <h3 className="text-[10px] font-black text-gray-800 text-center leading-tight h-5 flex items-center">{cat.name}</h3>
                          </button>
                        ))}
                      </div>
                    )}

                    {section.type === 'banners' && (
                      <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2">
                        {[1, 2].map(i => (
                          <div key={i} className="min-w-[260px] h-28 bg-gradient-to-br from-red-500 to-orange-600 rounded-[28px] p-5 text-white relative overflow-hidden flex-shrink-0">
                            <div className="relative z-10">
                              <h4 className="text-base font-black">وجبة العائلة {i}</h4>
                              <p className="text-[10px] font-bold opacity-80">توصيل مجاني لأول طلب</p>
                            </div>
                            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
                          </div>
                        ))}
                      </div>
                    )}

                    {section.type === 'featured_stores' && (
                      <div className="grid grid-cols-1 gap-3">
                        {profiles.filter(p => p.isPage && p.sectionId === section.id).slice(0, 3).map(store => (
                          <button key={store.id} onClick={() => setSelectedRestaurant(store)} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-red-100 transition-all group text-right">
                            <div className="flex items-center gap-3">
                              <img src={store.avatar || `https://picsum.photos/seed/${store.id}/100/100`} className="w-12 h-12 rounded-xl object-cover shadow-sm" referrerPolicy="no-referrer" />
                              <div>
                                <h4 className="text-xs font-black text-gray-900">{store.name}</h4>
                                <p className="text-[9px] font-bold text-gray-400">مطعم موثق</p>
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
            ) : (
              <motion.div 
                key="sub-categories"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${categories.find(c => c.id === viewingCategory)?.color || 'bg-red-500'} text-white rounded-xl flex items-center justify-center shadow-md`}>
                      {renderCategoryIcon(categories.find(c => c.id === viewingCategory)?.icon || 'ShoppingBag', 24)}
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-gray-800">{categories.find(c => c.id === viewingCategory)?.name}</h2>
                      <p className="text-[9px] font-bold text-gray-400">اختر التصنيف المفضل لديك</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleSetViewingCategory(null)}
                    className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-800 rounded-full hover:bg-gray-100 transition-all active:scale-90"
                    title="رجوع للأقسام"
                  >
                    <ArrowRight size={22} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Search and Quick Filters */}
                  {viewingCategory === 'fm-rest' && (
                    <div className="space-y-3">
                      <div className="relative">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="text"
                          placeholder="ابحث عن مطعم أو وجبة..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pr-12 pl-4 text-xs font-bold shadow-sm focus:outline-none focus:border-red-200 transition-all"
                        />
                      </div>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {[
                          { id: 'nearby', name: 'المطاعم القريبة', icon: <MapPin size={14} /> },
                          { id: 'rating', name: 'الأعلى تقييماً', icon: <Star size={14} /> },
                          { id: 'fastDelivery', name: 'توصيل سريع', icon: <Zap size={14} /> },
                          { id: 'premium', name: 'المطاعم المميزة', icon: <CheckCircle2 size={14} /> }
                        ].map((filter) => (
                          <button
                            key={filter.id}
                            onClick={() => setQuickFilters(prev => ({ ...prev, [filter.id]: !prev[filter.id as keyof typeof prev] }))}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap text-[10px] font-black transition-all border ${
                              quickFilters[filter.id as keyof typeof quickFilters]
                                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                                : 'bg-white text-gray-500 border-gray-100 hover:border-amber-100'
                            }`}
                          >
                            {filter.icon}
                            {filter.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Horizontal Tabs for Restaurants */}
                  {viewingCategory === 'fm-rest' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
                        {[
                          { id: 'all', name: 'الكل', icon: '🍽️' },
                          { id: 'most_requested', name: 'الأكثر طلباً', icon: '🔥' },
                          { id: 'offers', name: 'عروض وخصومات', icon: '🏷️' }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => {
                              setActiveSubTab(tab.id);
                              setSelectedSubCategory(null);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap text-[10px] font-black transition-all border ${
                              activeSubTab === tab.id
                                ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-100 scale-105'
                                : 'bg-white text-gray-600 border-gray-100 hover:border-red-100'
                            }`}
                          >
                            <span className="text-xs">{tab.icon}</span>
                            {tab.name}
                          </button>
                        ))}
                      </div>

                      {/* Horizontal bar for "All" tab */}
                      {activeSubTab === 'all' && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                          {[
                            ...(categories.find(c => c.id === 'fm-rest')?.subCategories?.slice(0, 4).map(s => ({ name: s.name, icon: s.icon, isAction: false })) || []),
                            { name: 'عرض الكل', icon: '➕', isAction: true }
                          ].map((item, i) => (
                            <button
                              key={`${item.name}-${i}`}
                              onClick={() => {
                                if (item.isAction) {
                                  setShowAllFiltersModal(true);
                                } else {
                                  handleSetSubCategory(item.name);
                                }
                              }}
                              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl whitespace-nowrap text-[10px] font-black transition-all border ${
                                selectedSubCategory === item.name
                                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                                  : item.isAction 
                                    ? 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
                                    : 'bg-white text-gray-600 border-gray-100 hover:border-emerald-100'
                              }`}
                            >
                              <span className="text-xs">{item.icon}</span>
                              {item.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Subcategories Section */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-5 gap-2">
                      {categories.find(c => c.id === viewingCategory)?.subCategories?.map((sub, subIdx) => (
                        <motion.button 
                          key={sub.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: subIdx * 0.03 }}
                          onClick={() => handleSetSubCategory(sub.name)}
                          className={`bg-white p-2 rounded-xl shadow-sm border transition-all flex flex-col items-center justify-center gap-1 group relative ${
                            selectedSubCategory === sub.name 
                              ? 'border-red-500 ring-4 ring-red-500/10' 
                              : 'border-gray-100 hover:border-red-200'
                          }`}
                        >
                          <div className="w-5 h-5 flex items-center justify-center group-hover:scale-110 transition-transform">
                            {sub.icon && sub.icon.length > 2 ? renderCategoryIcon(sub.icon, 14) : <span className="text-base">{sub.icon}</span>}
                          </div>
                          <h3 className={`text-[10px] font-black text-center leading-tight ${
                            selectedSubCategory === sub.name ? 'text-red-600' : 'text-gray-800'
                          }`}>
                            {sub.name}
                          </h3>
                          {selectedSubCategory === sub.name && (
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Store Pages Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
                        <Star size={16} className="text-amber-500 fill-amber-500" />
                        {selectedSubCategory ? `أفضل ${selectedSubCategory}` : `أفضل ${categories.find(c => c.id === viewingCategory)?.name}`}
                      </h3>
                      {selectedSubCategory ? (
                        <button 
                          onClick={() => handleSetSubCategory(null)}
                          className="flex items-center gap-1 text-[10px] font-black text-red-600 bg-red-50 px-2 py-1 rounded-lg hover:bg-red-100 transition-colors active:scale-95"
                        >
                          <X size={12} />
                          إلغاء التصفية
                        </button>
                      ) : (
                        <button 
                          onClick={() => setShowAllFiltersModal(true)}
                          className="text-[10px] font-black text-red-600"
                        >
                          عرض الكل
                        </button>
                      )}
                    </div>

                    <div id="store-results" className="grid grid-cols-1 gap-3">
                      {profiles.filter(p => {
                        const isInCategory = p.isPage && (viewingCategory === 'fm-rest' ? p.mode === 'restaurant' : true);
                        if (!isInCategory) return false;

                        // Location Filter (Geo-fencing)
                        if (p.city && p.city !== currentCity) return false;
                        if (currentRegion !== 'الكل' && p.region && p.region !== currentRegion) return false;

                        // Search Filter
                        if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
                          return false;
                        }

                        // Quick Filters
                        if (quickFilters.rating && (!p.points || p.points < 800)) return false;
                        if (quickFilters.premium && !p.isPremium) return false;
                        if (quickFilters.fastDelivery && p.points && p.points < 300) return false;

                        // Sub-tab Filters
                        if (viewingCategory === 'fm-rest') {
                          if (activeSubTab === 'offers') {
                            return p.products?.some(prod => prod.originalPrice && prod.originalPrice > prod.price);
                          }
                          if (activeSubTab === 'most_requested') {
                            return p.points && p.points > 500;
                          }
                        }

                        // Multi-select filters from Modal
                        if (selectedFilters.length > 0) {
                          return selectedFilters.every(filter => p.categories.some(cat => cat.includes(filter)));
                        }

                        // Filter by selected subcategory
                        if (selectedSubCategory) {
                          return p.categories.some(cat => cat.includes(selectedSubCategory));
                        }

                        return true;
                      }).length > 0 ? (
                        profiles.filter(p => {
                          const isInCategory = p.isPage && (viewingCategory === 'fm-rest' ? p.mode === 'restaurant' : true);
                          if (!isInCategory) return false;

                          // Location Filter (Geo-fencing)
                          if (p.city && p.city !== currentCity) return false;
                          if (currentRegion !== 'الكل' && p.region && p.region !== currentRegion) return false;

                          // Search Filter
                          if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
                            return false;
                          }

                          // Quick Filters
                          if (quickFilters.rating && (!p.points || p.points < 800)) return false;
                          if (quickFilters.premium && !p.isPremium) return false;
                          if (quickFilters.fastDelivery && p.points && p.points < 300) return false;

                          if (viewingCategory === 'fm-rest') {
                            if (activeSubTab === 'offers') {
                              return p.products?.some(prod => prod.originalPrice && prod.originalPrice > prod.price);
                            }
                            if (activeSubTab === 'most_requested') {
                              return p.points && p.points > 500;
                            }
                          }

                          if (selectedFilters.length > 0) {
                            return selectedFilters.every(filter => p.categories.some(cat => cat.includes(filter)));
                          }

                          if (selectedSubCategory) {
                            return p.categories.some(cat => cat.includes(selectedSubCategory));
                          }

                          return true;
                        }).map((profile, idx) => (
                          <motion.div 
                            key={profile.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 group hover:border-red-100 transition-all cursor-pointer"
                          >
                            <div className="relative">
                              <img 
                                src={profile.avatar || `https://picsum.photos/seed/${profile.id}/100/100`} 
                                alt={profile.name}
                                className="w-14 h-14 rounded-xl object-cover shadow-sm"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                                <CheckCircle2 size={8} className="text-white" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-0.5">
                                <h4 className="text-xs font-black text-gray-800 group-hover:text-red-600 transition-colors">{profile.name}</h4>
                                <div className="flex items-center gap-0.5 text-amber-500">
                                  <Star size={10} className="fill-amber-500" />
                                  <span className="text-[9px] font-black">4.8</span>
                                </div>
                              </div>
                              <p className="text-[10px] font-bold text-gray-400 line-clamp-1 mb-1">{profile.description || 'أفضل الخدمات والمنتجات بجودة عالية'}</p>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-[9px] font-bold text-gray-500">
                                  <MapPin size={10} className="text-red-500" />
                                  <span>{profile.location.split('،')[0]}</span>
                                </div>
                                <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600">
                                  <Clock size={10} />
                                  <span>25-35 دقيقة</span>
                                </div>
                              </div>
                            </div>
                            <ChevronLeft size={16} className="text-gray-300 group-hover:text-red-500 transition-colors" />
                          </motion.div>
                        ))
                      ) : (
                        <div className="py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                            <Search size={20} className="text-gray-300" />
                          </div>
                          <p className="text-[10px] font-bold text-gray-400">لا توجد صفحات متاحة حالياً في هذا التصنيف</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!viewingCategory && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-gray-800 mr-1 flex items-center gap-2">
                <Zap size={16} className="text-amber-500" />
                أسرع توصيل بالقرب منك
              </h3>
              <div className="py-12 text-center bg-white rounded-[40px] border border-dashed border-gray-200">
                <p className="text-xs font-bold text-gray-400">جاري البحث عن أقرب المتاجر لموقعك: {activeProfile.location}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'group-orders' && (
        <div className="space-y-4">
          <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-xs font-bold text-gray-400">لا توجد طلبات جماعية حالياً</p>
          </div>
        </div>
      )}

      {activeTab === 'map' && (
        <div className="space-y-4">
          <div className="relative h-[500px] rounded-[32px] overflow-hidden shadow-2xl border-4 border-white ring-1 ring-gray-100">
            <UnifiedMap
              center={mapCenter}
              zoom={13}
              placeholder="ابحث عن مطعم أو أكلة..."
              accentColor="red"
              categories={[{ id: 'all', name: 'الكل' }, ...categories.map(cat => ({ id: cat.id, name: cat.name }))]}
              activeCategory={viewingCategory || 'all'}
              onCategoryChange={(id) => setViewingCategory(id === 'all' ? null : id)}
              onLocationUpdate={setMapCenter}
              nearbySearchType="restaurant"
              onPlacesFound={setRealPlaces}
            >
              {/* Real Google Places Markers */}
              {realPlaces.map((place, idx) => (
                <Marker
                  key={`real-${place.place_id || idx}`}
                  position={place.geometry?.location?.toJSON() || { lat: 0, lng: 0 }}
                  onClick={() => setSelectedRestaurant({
                    id: place.place_id,
                    title: place.name,
                    content: place.vicinity || place.formatted_address,
                    lat: place.geometry?.location?.lat(),
                    lng: place.geometry?.location?.lng(),
                    rating: place.rating,
                    user_ratings_total: place.user_ratings_total,
                    isReal: true
                  })}
                  icon={{
                    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                  }}
                />
              ))}

              {/* App Posts Markers */}
              {posts.filter(p => p.source === 'restaurants' && p.lat && p.lng).map(restaurant => (
                <Marker 
                  key={restaurant.id} 
                  position={{ lat: restaurant.lat!, lng: restaurant.lng! }}
                  onClick={() => setSelectedRestaurant(restaurant)}
                >
                  {selectedRestaurant?.id === restaurant.id && (
                    <InfoWindow onCloseClick={() => setSelectedRestaurant(null)}>
                      <div className="p-3 min-w-[200px] text-right">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                            <Utensils size={20} />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-gray-900">{selectedRestaurant.title}</h4>
                            <div className="flex items-center gap-1">
                              <Star size={10} fill="#f59e0b" className="text-amber-500" />
                              <span className="text-[10px] font-bold text-gray-500">
                                {selectedRestaurant.rating || '4.8'} ({selectedRestaurant.user_ratings_total || '120'}+)
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] font-bold text-gray-500 mb-3 line-clamp-2">{restaurant.content}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                          <span className="text-[10px] font-black text-red-600">مفتوح الآن</span>
                          <button 
                            className="px-3 py-1 bg-red-600 text-white text-[10px] font-black rounded-lg shadow-md"
                          >
                            عرض المنيو
                          </button>
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </Marker>
              ))}
            </UnifiedMap>
          </div>
          
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-gray-800">أقرب المطاعم إليك</h3>
              <button className="text-[10px] font-black text-red-600">عرض الكل</button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {posts.filter(p => p.source === 'restaurants').slice(0, 3).map(restaurant => (
                <div key={restaurant.id} className="min-w-[200px] bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-600 shadow-sm">
                      <Utensils size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-gray-800">{restaurant.title}</h4>
                      <p className="text-[9px] font-bold text-gray-400">على بعد 1.2 كم</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star size={10} fill="#f59e0b" className="text-amber-500" />
                      <span className="text-[10px] font-bold text-gray-600">4.8</span>
                    </div>
                    <span className="text-[9px] font-black text-emerald-600">توصيل مجاني</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Filter Modal */}
      <AnimatePresence>
        {showAllFiltersModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full max-w-lg h-[85vh] sm:h-auto sm:max-h-[80vh] rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                    <Filter size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-800">تصفية المطاعم</h3>
                    <p className="text-[10px] font-bold text-gray-400">اختر التصنيفات التي تفضلها</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAllFiltersModal(false)}
                  className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 no-scrollbar space-y-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categories.find(c => c.id === 'fm-rest')?.subCategories?.map((item, iIdx) => (
                    <button
                      key={iIdx}
                      onClick={() => handleToggleFilter(item.name)}
                      className={`p-3 rounded-2xl border transition-all flex items-center gap-2 group ${
                        selectedFilters.includes(item.name)
                          ? 'bg-red-50 border-red-200 ring-2 ring-red-500/10'
                          : 'bg-white border-gray-100 hover:border-red-100'
                      }`}
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform">{item.icon}</span>
                      <span className={`text-[10px] font-black truncate ${
                        selectedFilters.includes(item.name) ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {item.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex items-center gap-4">
                <button
                  onClick={handleClearFilters}
                  className="flex-1 py-4 px-6 rounded-2xl bg-white border border-gray-200 text-gray-600 text-xs font-black hover:bg-gray-50 transition-colors"
                >
                  مسح الكل
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="flex-[2] py-4 px-6 rounded-2xl bg-red-600 text-white text-xs font-black shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  عرض النتائج ({selectedFilters.length})
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Restaurant Management Components ---

function RestaurantOrdersTab() {
  const { posts } = usePosts();
  const { activeProfile } = useUser();
  
  const restaurantRequests = posts.filter(post => 
    post.source === 'restaurants' && 
    (activeProfile.categories.length === 0 || activeProfile.categories.some(cat => post.category.includes(cat))) &&
    post.status === 'active'
  );

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-gray-800">طلبات العملاء (أفالون)</h3>
          <div className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-1 rounded-full">
            {restaurantRequests.length} طلب متاح
          </div>
        </div>
        
        {restaurantRequests.length > 0 ? (
          <div className="space-y-3">
            {restaurantRequests.map(post => (
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
                  <div className="bg-red-50 text-red-600 text-[9px] font-black px-2 py-0.5 rounded-full">
                    {post.category}
                  </div>
                </div>
                <p className="text-xs font-bold text-gray-600 mb-3 leading-relaxed">{post.content}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600">
                      <Utensils size={10} />
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
            <p className="text-xs font-bold text-gray-400">لا توجد طلبات عملاء حالياً في تخصصاتك</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RestaurantMenuTab() {
  const { activeProfile, addProduct, deleteProduct, addInternalCategory, deleteInternalCategory } = useUser();
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = activeProfile.internalCategories || [];
  const products = activeProfile.products || [];

  const filteredProducts = selectedCategory 
    ? products.filter(p => p.category === selectedCategory)
    : products;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-gray-800">إدارة المنيو</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsAddCategoryModalOpen(true)}
            className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-all"
            title="إضافة قسم"
          >
            <Plus size={20} />
          </button>
          <button 
            onClick={() => setIsAddProductModalOpen(true)}
            className="p-2 bg-red-600 text-white rounded-xl shadow-md hover:bg-red-700 transition-all"
            title="إضافة منتج"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-xl text-[10px] font-black whitespace-nowrap transition-all border ${
            selectedCategory === null
              ? 'bg-red-600 text-white border-red-600 shadow-sm'
              : 'bg-white text-gray-500 border-gray-100 hover:border-red-100'
          }`}
        >
          الكل
        </button>
        {categories.map((cat, i) => (
          <div key={`${cat}-${i}`} className="relative group">
            <button
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-red-600 text-white border-red-600 shadow-sm'
                  : 'bg-white text-gray-500 border-gray-100 hover:border-red-100'
              }`}
            >
              {cat}
            </button>
            <button 
              onClick={() => deleteInternalCategory(activeProfile.id, cat)}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={8} />
            </button>
          </div>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredProducts.map(product => (
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
              <div className="flex items-center justify-between mt-1">
                <p className="text-[10px] font-black text-red-600">{product.price} ج.م</p>
                <p className="text-[8px] font-bold text-gray-400">{product.category}</p>
              </div>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-2 py-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-xs font-bold text-gray-400">لا يوجد منتجات في هذا القسم بعد</p>
          </div>
        )}
      </div>

      {isAddProductModalOpen && (
        <AddProductModal 
          isOpen={isAddProductModalOpen}
          onClose={() => setIsAddProductModalOpen(false)}
          onAdd={(product) => addProduct(activeProfile.id, product)}
          categories={categories}
        />
      )}

      {isAddCategoryModalOpen && (
        <AddCategoryModal 
          isOpen={isAddCategoryModalOpen}
          onClose={() => setIsAddCategoryModalOpen(false)}
          onAdd={(cat) => addInternalCategory(activeProfile.id, cat)}
        />
      )}
    </div>
  );
}

function RestaurantStatsTab() {
  const { activeProfile } = useUser();
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-3">
            <Wallet size={20} />
          </div>
          <p className="text-[10px] font-bold text-gray-400">إجمالي الأرباح</p>
          <h3 className="text-xl font-black text-gray-800 mt-1">{activeProfile.balance || 0} ج.م</h3>
        </div>
        <div className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-3">
            <Package size={20} />
          </div>
          <p className="text-[10px] font-bold text-gray-400">الطلبات المكتملة</p>
          <h3 className="text-xl font-black text-gray-800 mt-1">0 طلب</h3>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-black text-gray-800">إحصائيات المبيعات</h3>
          <select className="text-[10px] font-black text-gray-500 bg-gray-50 border-none rounded-lg px-2 py-1">
            <option>آخر 7 أيام</option>
            <option>آخر 30 يوم</option>
          </select>
        </div>
        <div className="h-40 flex items-end justify-between gap-2">
          {[0, 0, 0, 0, 0, 0, 0].map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${val}%` }}
                className="w-full bg-red-500 rounded-t-lg"
              />
              <span className="text-[8px] font-bold text-gray-400">يوم {i+1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RestaurantSubsTab() {
  const subscribers: any[] = [];

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-black text-gray-800">اشتراكات العملاء</h3>
          <div className="bg-amber-50 text-amber-600 text-[10px] font-black px-2 py-1 rounded-full">
            {subscribers.length} مشترك
          </div>
        </div>

        <div className="space-y-3">
          {subscribers.map(sub => (
            <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <img src={sub.avatar} alt={sub.name} className="w-10 h-10 rounded-full border border-white shadow-sm" referrerPolicy="no-referrer" />
                <div>
                  <h4 className="text-xs font-black text-gray-800">{sub.name}</h4>
                  <p className="text-[9px] font-bold text-gray-400">منذ {sub.date}</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-[9px] font-black ${
                sub.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
              }`}>
                {sub.status === 'active' ? 'نشط' : 'منتهي'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RestaurantSettingsTab() {
  const { activeProfile, updateProfileDetails } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: activeProfile.name,
    description: activeProfile.description || '',
    location: activeProfile.location,
    phone: activeProfile.phone || '',
    whatsapp: activeProfile.whatsapp || '',
  });

  const handleSave = async () => {
    await updateProfileDetails(activeProfile.id, formData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-black text-gray-800">إعدادات المطعم</h3>
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${
              isEditing ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {isEditing ? 'حفظ' : 'تعديل'}
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 mr-2">اسم المطعم</label>
            <input 
              type="text"
              value={formData.name}
              disabled={!isEditing}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-red-500 disabled:opacity-70"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 mr-2">وصف المطعم</label>
            <textarea 
              value={formData.description}
              disabled={!isEditing}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-red-500 disabled:opacity-70 h-24 resize-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 mr-2">الموقع</label>
            <input 
              type="text"
              value={formData.location}
              disabled={!isEditing}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-red-500 disabled:opacity-70"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 mr-2">رقم الهاتف</label>
              <input 
                type="text"
                value={formData.phone}
                disabled={!isEditing}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-red-500 disabled:opacity-70"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 mr-2">واتساب</label>
              <input 
                type="text"
                value={formData.whatsapp}
                disabled={!isEditing}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-red-500 disabled:opacity-70"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddProductModal({ isOpen, onClose, onAdd, categories }: { isOpen: boolean, onClose: () => void, onAdd: (product: any) => void, categories: string[] }) {
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    image: '',
    description: '',
    category: categories[0] || ''
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
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-red-500 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-gray-500 mr-2 mb-1 block">السعر (ج.م)</label>
                    <input 
                      type="number" 
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-red-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-500 mr-2 mb-1 block">القسم</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-red-500 transition-all appearance-none"
                    >
                      {categories.map((cat, i) => (
                        <option key={`${cat}-${i}`} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 mr-2 mb-1 block">رابط الصورة</label>
                  <input 
                    type="text" 
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-red-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 mr-2 mb-1 block">الوصف</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-red-500 transition-all h-24 resize-none"
                  />
                </div>
              </div>

              <button 
                onClick={handleAdd}
                disabled={!formData.name || !formData.price}
                className="w-full bg-red-600 text-white py-4 rounded-2xl text-sm font-black shadow-lg shadow-red-100 mt-6 disabled:opacity-50"
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

function AddCategoryModal({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (cat: string) => void }) {
  const [name, setName] = useState('');

  const handleAdd = () => {
    onAdd(name);
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
                <h3 className="text-xl font-black text-gray-900">إضافة قسم جديد</h3>
                <div className="w-10" />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black text-gray-500 mr-2 mb-1 block">اسم القسم</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: وجبات سريعة، مشروبات..."
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-amber-500 transition-all"
                  />
                </div>
              </div>

              <button 
                onClick={handleAdd}
                disabled={!name}
                className="w-full bg-amber-500 text-white py-4 rounded-2xl text-sm font-black shadow-lg shadow-amber-100 mt-6 disabled:opacity-50"
              >
                إضافة القسم
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
