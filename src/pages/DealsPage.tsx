import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { Marker, InfoWindow } from '@react-google-maps/api';
import { UnifiedMap } from '../components/UnifiedMap';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  Map, 
  Search, 
  MapPin, 
  ChevronLeft, 
  Star, 
  Phone, 
  MessageCircle, 
  Car, 
  Home, 
  Smartphone, 
  Armchair,
  Trophy,
  Plus,
  Minus,
  Navigation,
  Tag,
  Layers,
  Users,
  User,
  BarChart3,
  CheckCircle2,
  Clock,
  Handshake,
  ClipboardList,
  Filter,
  TrendingUp,
  ArrowRight,
  Shirt,
  Laptop,
  Flower2,
  BookOpen,
  Sparkles,
  Gamepad2,
  Palette,
  Zap,
  LayoutGrid,
  Store
} from 'lucide-react';
import { usePosts } from '../context/PostContext';
import { useSettings } from '../context/SettingsContext';
import DealDetails from '../components/DealDetails';

const DealsIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
  >
    {/* Handshake/Briefcase stylized */}
    <rect x="20" y="35" width="60" height="45" rx="8" fill="none" stroke="currentColor" strokeWidth="5" />
    <path d="M40,35 L40,25 C40,22 42,20 45,20 L55,20 C58,20 60,22 60,25 L60,35" fill="none" stroke="currentColor" strokeWidth="5" />
    {/* Deal Sparkle/Star */}
    <path d="M50,45 L53,53 L61,53 L55,58 L57,66 L50,61 L43,66 L45,58 L39,53 L47,53 Z" />
  </svg>
);

export default function DealsPage() {
  const { posts } = usePosts();
  const { appStructure, categories: allCategories, serviceTabs } = useSettings();
  const categories = allCategories['deals'] || [];
  const { userMode, activeProfile, profiles } = useUser();
  const [activeTab, setActiveTab] = useState(userMode === 'deal_manager' ? 'my-requests' : 'individual');
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [mapCenter] = useState({ lat: 31.0409, lng: 31.3785 }); // Mansoura
  const [selectedDealOnMap, setSelectedDealOnMap] = useState<any | null>(null);

  const [viewingCategory, setViewingCategory] = useState<any | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

  const dynamicTabs = (serviceTabs['deals'] || []).filter(t => t.isActive && (t.userMode === 'user' || t.userMode === userMode));

  const handleSetActiveTab = (tabId: string) => {
    setActiveTab(tabId);
    window.history.pushState({ type: 'deals_tab', id: tabId }, '');
  };

  const handleSetViewingCategory = (cat: any) => {
    if (cat) {
      window.history.pushState({ type: 'deals_category', categoryId: cat.id }, '');
      setViewingCategory(cat);
      setSelectedSubCategory(null);
    } else {
      setViewingCategory(null);
      setSelectedSubCategory(null);
    }
  };

  const renderCategoryIcon = (iconName: string, size: number = 24) => {
    if (!iconName || iconName === 'None' || iconName === 'بدون ايقونة') return null;
    const iconMap: Record<string, any> = {
      Home, Shirt, Laptop, Smartphone, Flower2, BookOpen, Armchair, Sparkles, Gamepad2, Palette, Zap, LayoutGrid, Store, Tag, Star, Car, Trophy, Handshake, ClipboardList, TrendingUp, Briefcase, Map, MapPin, Phone, MessageCircle, Plus, Minus, Navigation, Layers, Users, User, BarChart3, CheckCircle2, Clock, Filter, ArrowRight
    };
    const IconComponent = iconMap[iconName] || BarChart3;
    return <IconComponent size={size} />;
  };

  const tabs = userMode === 'deal_manager' ? [
    { id: 'my-requests', label: 'طلباتي', icon: ClipboardList },
    { id: 'individual', label: 'صفقات فردية', icon: Handshake },
    { id: 'map', label: 'الخريطة', icon: Map },
    { id: 'search', label: 'بحث', icon: Search },
  ] : dynamicTabs;

  const dealRequests = posts.filter(post => 
    post.source === 'deals' && 
    (!activeProfile.categories || activeProfile.categories.length === 0 || activeProfile.categories.some(cat => post.category.includes(cat)))
  );

  const handleSetSubCategory = (subCategoryName: string | null) => {
    if (subCategoryName) {
      window.history.pushState({ subCategoryId: subCategoryName, categoryId: viewingCategory.id, type: 'deals_subcategory' }, '');
      setSelectedSubCategory(subCategoryName);
    } else {
      window.history.back();
    }
  };

  // Handle back button for category navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state && state.type === 'deals_tab') {
        setActiveTab(state.id);
        setViewingCategory(null);
        setSelectedSubCategory(null);
      } else if (state && (state.categoryId || state.subCategoryId)) {
        setActiveTab('individual');
        if (state.subCategoryId) {
          const cat = categories.find(c => c.id === state.categoryId);
          setViewingCategory(cat || null);
          setSelectedSubCategory(state.subCategoryId);
        } else {
          const cat = categories.find(c => c.id === state.categoryId);
          setViewingCategory(cat || null);
          setSelectedSubCategory(null);
        }
      } else if (state && state.type === 'tab' && state.id === 'deals') {
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

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header Branding & Search Bar */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => window.history.back()}
            className="p-2 bg-white text-gray-400 rounded-xl shadow-sm border border-gray-100 hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all active:scale-90"
          >
            <ArrowRight size={24} />
          </motion.button>
          <div>
            <h1 className="text-xl font-black text-gray-900 leading-tight">
              {userMode === 'deal_manager' ? 'لوحة مدير ديلز' : 'ديلز'}
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {userMode === 'deal_manager' ? 'Deal Manager Dashboard' : 'Deals Gate'}
            </p>
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
            onClick={() => handleSetActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center gap-1 px-1 py-2 rounded-xl text-[9px] font-black transition-all text-center truncate ${
              activeTab === tab.id
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white text-gray-500 border border-gray-100'
            }`}
          >
            {typeof tab.icon === 'string' ? renderCategoryIcon(tab.icon, 16) : <tab.icon size={16} />}
            {tab.label}
          </button>
        ))}
      </div>

      {userMode === 'deal_manager' ? (
        <div className="space-y-4">
          {activeTab === 'my-requests' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-gray-800">طلبات ديلز في تخصصاتك</h3>
                  <div className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-1 rounded-full">
                    {dealRequests.length} طلب متاح
                  </div>
                </div>
                
                {dealRequests.length > 0 ? (
                  <div className="space-y-3">
                    {dealRequests.map(post => (
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
                          <div className="bg-purple-50 text-purple-600 text-[9px] font-black px-2 py-0.5 rounded-full">
                            {post.category}
                          </div>
                        </div>
                        <p className="text-xs font-bold text-gray-600 mb-3 leading-relaxed">{post.content}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600">
                              <Handshake size={10} />
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
                    <p className="text-xs font-bold text-gray-400">لا توجد طلبات صفقات حالياً في تخصصاتك المختارة</p>
                    <button className="mt-4 text-[10px] font-black text-red-600 hover:underline">
                      تعديل التخصصات من الملف الشخصي
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'my-deals' && (
            <div className="space-y-4">
              <div className="bg-purple-600 p-6 rounded-[32px] text-white shadow-lg shadow-purple-100">
                <p className="text-xs font-bold opacity-80 mb-1">إجمالي قيمة ديلز المدارة</p>
                <h2 className="text-3xl font-black">4,250,000 ج.م</h2>
                <div className="mt-4 flex gap-2">
                  <div className="flex-1 bg-white/20 p-3 rounded-2xl">
                    <p className="text-[10px] opacity-80">صفقات نشطة</p>
                    <p className="text-sm font-black">8 صفقات</p>
                  </div>
                  <div className="flex-1 bg-white/20 p-3 rounded-2xl">
                    <p className="text-[10px] opacity-80">عملاء جدد</p>
                    <p className="text-sm font-black">15 عميل</p>
                  </div>
                </div>
              </div>

              <h3 className="text-sm font-black text-gray-800 mb-2">إدارة صفقاتي</h3>
              <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <p className="text-xs font-bold text-gray-400">لا توجد صفقات مدارة حالياً</p>
              </div>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="space-y-3">
              <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <p className="text-xs font-bold text-gray-400">لا يوجد عملاء مهتمون حالياً</p>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-4">
              <div className="bg-slate-900 p-6 rounded-[32px] text-white shadow-xl">
                <p className="text-xs font-bold opacity-60 mb-1">إجمالي العمولات المستحقة</p>
                <h2 className="text-3xl font-black">12,450.00 ج.م</h2>
                <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 w-3/4"></div>
                </div>
                <p className="text-[10px] font-bold mt-2 opacity-60 text-center">وصلت لـ 75% من هدفك الشهري</p>
              </div>

              <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                <h4 className="text-sm font-black text-gray-800 mb-4">إحصائيات الأداء</h4>
                {[
                  { label: 'صفقات مكتملة', value: '12', color: 'text-green-600' },
                  { label: 'نسبة التحويل', value: '18%', color: 'text-blue-600' },
                  { label: 'متوسط وقت الإغلاق', value: '5 أيام', color: 'text-purple-600' },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                    <span className="text-xs font-bold text-gray-500">{item.label}</span>
                    <span className={`text-xs font-black ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'individual' && (
            <AnimatePresence mode="wait">
              {!viewingCategory ? (
                <motion.div
                  key="categories-grid"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8 pb-20"
                >
                  {(appStructure['deals'] || [])
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
                        <div className={`grid ${section.layout === 'grid' ? 'grid-cols-4' : section.layout === 'list' ? 'grid-cols-1' : 'flex overflow-x-auto no-scrollbar gap-2'} gap-2`}>
                          {categories
                            .filter(cat => cat.sectionId === section.id)
                            .map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => handleSetViewingCategory(cat)}
                              className="bg-white p-2 rounded-[20px] shadow-sm border border-gray-100 hover:border-red-200 transition-all cursor-pointer group flex flex-col items-center justify-center gap-1.5"
                            >
                              <div className={`w-10 h-10 ${cat.color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                {renderCategoryIcon(cat.icon, 20)}
                              </div>
                              <h3 className="text-[9px] font-black text-gray-800 text-center leading-tight h-6 flex items-center">{cat.name}</h3>
                            </button>
                          ))}
                        </div>
                      )}

                      {section.type === 'banners' && (
                        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2">
                          {[1, 2].map(i => (
                            <div key={i} className="min-w-[260px] h-28 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-[28px] p-5 text-white relative overflow-hidden flex-shrink-0">
                              <div className="relative z-10">
                                <h4 className="text-base font-black">صفقة مميزة {i}</h4>
                                <p className="text-[10px] font-bold opacity-80">أفضل الأسعار والعروض الحصرية</p>
                              </div>
                              <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
                            </div>
                          ))}
                        </div>
                      )}

                      {section.type === 'featured_stores' && (
                        <div className="grid grid-cols-1 gap-3">
                          {profiles.filter(p => p.isPage && p.mode === 'deal_manager').slice(0, 3).map(manager => (
                            <button key={manager.id} onClick={() => setSelectedDeal(manager)} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-purple-100 transition-all group text-right">
                              <div className="flex items-center gap-3">
                                <img src={manager.avatar || `https://picsum.photos/seed/${manager.id}/100/100`} className="w-12 h-12 rounded-xl object-cover shadow-sm" referrerPolicy="no-referrer" />
                                <div>
                                  <h4 className="text-xs font-black text-gray-900">{manager.name}</h4>
                                  <p className="text-[9px] font-bold text-gray-400">مدير صفقات موثق</p>
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
                  key="category-detail"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 pb-20"
                >
                  {/* Category Header */}
                  <div className="flex items-center gap-4 bg-white p-4 rounded-[32px] shadow-sm border border-gray-100">
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={() => window.history.back()}
                      className="p-2 bg-white text-gray-400 rounded-xl shadow-sm border border-gray-100 hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all active:scale-90"
                    >
                      <ArrowRight size={20} />
                    </motion.button>
                    <div className={`w-12 h-12 ${viewingCategory.color} rounded-2xl flex items-center justify-center text-white shadow-sm`}>
                      {renderCategoryIcon(viewingCategory.icon, 24)}
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-gray-900">{viewingCategory.name}</h2>
                      <p className="text-[10px] font-bold text-gray-400">تصفح الأقسام وديلز</p>
                    </div>
                  </div>

                  {/* Subcategories Grid */}
                  <div className="space-y-4">
                    {viewingCategory.groupedSubCategories && viewingCategory.groupedSubCategories.length > 0 ? (
                      viewingCategory.groupedSubCategories.map((group: any) => (
                        <div key={group.title} className="space-y-3">
                          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">{group.title}</h3>
                          <div className="grid grid-cols-3 gap-2">
                            {group.items.map((sub: any) => (
                              <button
                                key={sub.id}
                                onClick={() => handleSetSubCategory(selectedSubCategory === sub.name ? null : sub.name)}
                                className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 ${
                                  selectedSubCategory === sub.name
                                    ? 'bg-red-600 border-red-600 text-white shadow-md scale-95'
                                    : 'bg-white border-gray-100 text-gray-600 hover:border-red-200 shadow-sm'
                                }`}
                              >
                                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                                  {renderCategoryIcon(sub.icon, 16)}
                                </div>
                                <span className="text-[10px] font-black text-center leading-tight">{sub.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : viewingCategory.subCategories && viewingCategory.subCategories.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">الأقسام الفرعية</h3>
                        <div className="grid grid-cols-3 gap-2">
                          {viewingCategory.subCategories.map((sub: any) => (
                            <button
                              key={sub.id}
                              onClick={() => handleSetSubCategory(selectedSubCategory === sub.name ? null : sub.name)}
                              className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 ${
                                selectedSubCategory === sub.name
                                  ? 'bg-red-600 border-red-600 text-white shadow-md scale-95'
                                  : 'bg-white border-gray-100 text-gray-600 hover:border-red-200 shadow-sm'
                              }`}
                            >
                              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                                {renderCategoryIcon(sub.icon, 16)}
                              </div>
                              <span className="text-[10px] font-black text-center leading-tight">{sub.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Deals List */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="text-xs font-black text-gray-900">
                        {selectedSubCategory ? `ديلز ${selectedSubCategory}` : 'كل ديلز في هذا القسم'}
                      </h3>
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                        {posts.filter(p => 
                          p.source === 'deals' && 
                          p.category.includes(viewingCategory.name) &&
                          (!selectedSubCategory || p.category.includes(selectedSubCategory))
                        ).length} صفقة
                      </span>
                    </div>

                    {posts
                      .filter(p => 
                        p.source === 'deals' && 
                        p.category.includes(viewingCategory.name) &&
                        (!selectedSubCategory || p.category.includes(selectedSubCategory))
                      ).length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {posts
                          .filter(p => 
                            p.source === 'deals' && 
                            p.category.includes(viewingCategory.name) &&
                            (!selectedSubCategory || p.category.includes(selectedSubCategory))
                          )
                          .map((deal) => (
                            <button
                              key={deal.id}
                              onClick={() => setSelectedDeal(deal)}
                              className="bg-white p-4 rounded-[32px] shadow-sm border border-gray-100 flex items-center justify-between hover:border-red-100 transition-all group text-right"
                            >
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                  <img 
                                    src={deal.image || `https://picsum.photos/seed/${deal.id}/100/100`} 
                                    alt={deal.title} 
                                    className="w-14 h-14 rounded-2xl object-cover shadow-sm"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <div>
                                  <h4 className="text-sm font-black text-gray-900 group-hover:text-red-600 transition-colors">{deal.title}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600">
                                      <Tag size={10} />
                                      <span>{deal.budget}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-300">•</span>
                                    <span className="text-[10px] font-bold text-gray-400">{deal.storeAddress || deal.category}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                                <ChevronLeft size={18} />
                              </div>
                            </button>
                          ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                        <p className="text-xs font-bold text-gray-400">لا توجد صفقات متاحة حالياً في هذا القسم</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {activeTab === 'map' && (
            <div className="space-y-4">
              <h2 className="text-sm font-black text-gray-900 px-1">خريطة ديلز</h2>
              <div className="relative h-[600px] rounded-[40px] overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
                <UnifiedMap
                  center={mapCenter}
                  zoom={13}
                  placeholder="ابحث في خريطة ديلز..."
                  accentColor="blue"
                  categories={[{ id: 'all', name: 'الكل' }, ...categories.map(cat => ({ id: cat.id, name: cat.name }))]}
                  activeCategory={viewingCategory?.id || 'all'}
                  onCategoryChange={(id) => {
                    if (id === 'all') {
                      setViewingCategory(null);
                    } else {
                      const cat = categories.find(c => c.id === id);
                      if (cat) setViewingCategory(cat);
                    }
                  }}
                >
                  {/* Real Deal Markers */}
                  {posts.filter(p => p.source === 'deals' && p.lat && p.lng).map(deal => (
                    <Marker 
                      key={deal.id} 
                      position={{ lat: deal.lat!, lng: deal.lng! }}
                      onClick={() => setSelectedDealOnMap(deal)}
                    >
                      {selectedDealOnMap?.id === deal.id && (
                        <InfoWindow onCloseClick={() => setSelectedDealOnMap(null)}>
                          <div className="p-2 min-w-[150px]">
                            <h4 className="text-xs font-black text-gray-800">{deal.title}</h4>
                            <p className="text-[10px] font-bold text-blue-600">{deal.budget}</p>
                          </div>
                        </InfoWindow>
                      )}
                    </Marker>
                  ))}
                </UnifiedMap>
              </div>
              <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                <p className="text-[10px] font-bold text-purple-700 leading-relaxed">
                  تظهر هنا جميع ديلز المتاحة في منطقتك. يمكنك الضغط على أي علامة لمشاهدة التفاصيل وتقديم عرضك.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'rewards' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-amber-400 to-orange-600 p-6 rounded-3xl text-white shadow-xl shadow-amber-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
                    <Trophy size={32} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black">مكافآت مديري ديلز</h3>
                    <p className="text-xs font-bold opacity-90">أفضل المديرين أداءً هذا الشهر</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="py-12 text-center">
                  <p className="text-xs font-bold text-gray-400">لا توجد مكافآت حالياً</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
