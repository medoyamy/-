import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UnifiedMap } from '../components/UnifiedMap';
import { Marker } from '@react-google-maps/api';
import { 
  Briefcase, 
  Search, 
  Filter, 
  Plus, 
  MapPin, 
  Clock, 
  DollarSign, 
  Building2,
  User,
  GraduationCap,
  Stethoscope,
  Code,
  Hammer,
  Car,
  ShoppingBag,
  Megaphone,
  BriefcaseIcon,
  ArrowRight,
  Map as MapIcon,
  SquarePen,
  LayoutGrid,
  Star,
  BadgePercent,
  Gift,
  Trophy,
  Home,
  Package,
  Utensils,
  BarChart3,
  Settings as SettingsIcon,
  Users,
  Layers,
  Truck
} from 'lucide-react';
import CreateJobModal from '../components/CreateJobModal';
import { usePosts } from '../context/PostContext';
import { useSettings } from '../context/SettingsContext';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

type JobTab = 'requests' | 'available';

const JobsIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
  >
    <rect x="15" y="30" width="70" height="50" rx="8" fill="none" stroke="currentColor" strokeWidth="6" />
    <path d="M35,30 v-10 c0-5,4-9,9-9 h12 c5,0,9,4,9,9 v10" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <line x1="15" y1="55" x2="85" y2="55" stroke="currentColor" strokeWidth="6" />
    <rect x="42" y="50" width="16" height="10" rx="2" />
  </svg>
);

export default function JobsPage() {
  const { activeProfile } = useUser();
  const { posts } = usePosts();
  const { appStructure, categories: allCategories, serviceTabs } = useSettings();
  const categories = allCategories['jobs'] || [];
  const navigate = useNavigate();
  
  const tabs = (serviceTabs['jobs'] || []).filter(t => t.isActive);
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || 'available');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [jobTypeFilter, setJobTypeFilter] = useState<'offer' | 'request' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState<any>(null);

  const renderCategoryIcon = (iconName: string, size: number = 24) => {
    if (!iconName || iconName === 'None' || iconName === 'بدون ايقونة') return null;
    const iconMap: Record<string, any> = {
      Building2, Stethoscope, GraduationCap, Code, Hammer, Car, ShoppingBag, Megaphone, Briefcase, User, MapPin, Clock, DollarSign, Filter, Plus, Search, ArrowRight
    };
    const IconComponent = iconMap[iconName] || Briefcase;
    return <IconComponent size={size} />;
  };

  // History management for JobsPage
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state && state.type === 'job_modal') {
        setIsModalOpen(true);
        setModalInitialData(state.data);
      } else if (state && state.type === 'job_category') {
        setSelectedCategory(state.id);
        setIsModalOpen(false);
      } else if (state && state.type === 'job_tab') {
        setActiveTab(state.id);
        setIsModalOpen(false);
        setSelectedCategory(null);
      } else {
        setIsModalOpen(false);
        setSelectedCategory(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSetActiveTab = (tabId: string) => {
    setActiveTab(tabId);
    window.history.pushState({ type: 'job_tab', id: tabId }, '');
  };

  const renderIcon = (iconName: string, size: number = 24) => {
    const iconMap: Record<string, any> = {
      Briefcase, Search, Filter, Plus, MapPin, Clock, DollarSign, Building2, User, GraduationCap, Stethoscope, Code, Hammer, Car, ShoppingBag, Megaphone, BriefcaseIcon, ArrowRight, Map: MapIcon, SquarePen, LayoutGrid, Star, BadgePercent, Gift, Trophy, Home, Package, Utensils, BarChart3, Settings: SettingsIcon, Users, Layers, Truck
    };
    const IconComponent = iconMap[iconName] || Briefcase;
    return <IconComponent size={size} />;
  };

  const handleSetSelectedCategory = (catId: string | null) => {
    const newCatId = selectedCategory === catId ? null : catId;
    if (newCatId) {
      window.history.pushState({ type: 'job_category', id: newCatId }, '');
    }
    setSelectedCategory(newCatId);
  };

  const handleOpenModal = (type: 'request' | 'offer') => {
    const initialData = {
      source: 'jobs',
      jobType: type,
      category: selectedCategory || '',
    };
    setModalInitialData(initialData);
    setIsModalOpen(true);
    setShowFabMenu(false);
    window.history.pushState({ type: 'job_modal', data: initialData }, '');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalInitialData(null);
    // If the current state is the modal, we go back in history
    if (window.history.state && window.history.state.type === 'job_modal') {
      window.history.back();
    }
  };

  const filteredJobs = useMemo(() => {
    return posts.filter(post => {
      if (post.source !== 'jobs') return false;
      
      // Handle special map categories (offer/request)
      if (activeTab === 'map') {
        if (jobTypeFilter === 'offer' && post.jobType !== 'offer') return false;
        if (jobTypeFilter === 'request' && post.jobType !== 'request') return false;
        
        // If it's a real category ID, filter by it
        if (selectedCategory) {
          if (post.category !== selectedCategory) return false;
        }
      } else if (activeTab === 'available' || activeTab === 'requests') {
        const isCorrectTab = activeTab === 'available' 
          ? post.jobType === 'offer' 
          : post.jobType === 'request';
          
        if (!isCorrectTab) return false;

        const matchesCategory = selectedCategory ? post.category === selectedCategory : true;
        if (!matchesCategory) return false;
      }

      const matchesSearch = 
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (post.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (post.applicantProfession?.toLowerCase().includes(searchQuery.toLowerCase()));
        
      return matchesSearch;
    });
  }, [posts, activeTab, selectedCategory, searchQuery]);

  const renderTabContent = () => {
    if (activeTab === 'map') {
      if (!jobTypeFilter) {
        return (
          <div className="py-12 space-y-8">
            <div className="text-center">
              <h3 className="text-xl font-black text-gray-900">ماذا تبحث عنه على الخريطة؟</h3>
              <p className="text-sm font-bold text-gray-500 mt-2">اختر النوع لعرض النتائج القريبة منك</p>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <button 
                onClick={() => setJobTypeFilter('offer')}
                className="flex flex-col items-center justify-center gap-4 p-8 bg-white rounded-[40px] border-2 border-gray-100 shadow-sm hover:border-red-600 hover:shadow-xl hover:shadow-red-50 transition-all group"
              >
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
                  <Briefcase size={32} />
                </div>
                <span className="text-sm font-black text-gray-900">فرص عمل</span>
              </button>
              <button 
                onClick={() => setJobTypeFilter('request')}
                className="flex flex-col items-center justify-center gap-4 p-8 bg-white rounded-[40px] border-2 border-gray-100 shadow-sm hover:border-emerald-600 hover:shadow-xl hover:shadow-emerald-50 transition-all group"
              >
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <User size={32} />
                </div>
                <span className="text-sm font-black text-gray-900">طلبات توظيف</span>
              </button>
            </div>
          </div>
        );
      }

      const mapCategories = [
        { id: 'all', name: 'الكل' },
        ...categories.map(c => ({ id: c.id, name: c.name }))
      ];

      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <button 
              onClick={() => {
                setJobTypeFilter(null);
                setSelectedCategory(null);
              }}
              className="flex items-center gap-2 text-xs font-black text-gray-500 hover:text-red-600 transition-colors"
            >
              <ArrowRight size={16} />
              رجوع للاختيار الرئيسي
            </button>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black ${jobTypeFilter === 'offer' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
              عرض: {jobTypeFilter === 'offer' ? 'فرص العمل' : 'طلبات التوظيف'}
            </div>
          </div>
          <div className="h-[60vh] rounded-[32px] overflow-hidden shadow-xl border border-gray-100 mb-6">
            <UnifiedMap 
              center={{ lat: 31.0409, lng: 31.3785 }}
              zoom={13}
              categories={mapCategories}
              activeCategory={selectedCategory || 'all'}
              onCategoryChange={(id) => handleSetSelectedCategory(id === 'all' ? null : id)}
            >
              {filteredJobs.filter(j => j.lat && j.lng).map(job => (
                <Marker 
                  key={job.id}
                  position={{ lat: job.lat!, lng: job.lng! }}
                  icon={{
                    url: job.jobType === 'offer' 
                      ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' 
                      : 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
                  }}
                />
              ))}
            </UnifiedMap>
          </div>
        </div>
      );
    }

    if (activeTab === 'publish') {
      return (
        <div className="py-20 text-center space-y-6">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-600">
            <SquarePen size={48} />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">انشر إعلانك الآن</h3>
            <p className="text-sm font-bold text-gray-500 mt-2">اختر نوع الإعلان الذي تريد نشره</p>
          </div>
          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <button 
              onClick={() => handleOpenModal('offer')}
              className="w-full py-4 bg-red-600 text-white font-black rounded-2xl shadow-lg shadow-red-100"
            >
              إضافة فرصة عمل
            </button>
            <button 
              onClick={() => handleOpenModal('request')}
              className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-lg shadow-emerald-100"
            >
              إضافة طلب وظيفة
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Quick Publish Box */}
        {(activeTab === 'available' || activeTab === 'requests') && (
          <div className="bg-white p-4 rounded-[32px] shadow-sm border border-gray-100 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-xl shadow-inner overflow-hidden">
                {activeProfile?.avatar ? (
                  <img src={activeProfile.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  "👤"
                )}
              </div>
              <button 
                onClick={() => handleOpenModal(activeTab === 'available' ? 'offer' : 'request')}
                className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-400 text-right px-4 py-3 rounded-2xl text-xs font-bold transition-all border border-gray-50"
              >
                {activeTab === 'available' ? 'هل لديك فرصة عمل؟ انشرها الآن...' : 'هل تبحث عن وظيفة؟ انشر طلبك هنا...'}
              </button>
              <button 
                onClick={() => handleOpenModal(activeTab === 'available' ? 'offer' : 'request')}
                className={`p-3 rounded-2xl text-white shadow-lg transition-all active:scale-95 ${activeTab === 'available' ? 'bg-red-600 shadow-red-100' : 'bg-emerald-600 shadow-emerald-100'}`}
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Sections */}
        {(appStructure['jobs'] || [])
          .filter(s => s.isActive && s.tabId === activeTab)
          .sort((a, b) => a.order - b.order)
          .map(section => (
          <div key={section.id} className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center justify-between px-2">
              <div>
                <h3 className="text-sm font-black text-gray-900">{section.name}</h3>
                <p className="text-[10px] font-bold text-gray-400">{section.description}</p>
              </div>
            </div>

            {/* Section Content based on type */}
            {section.type === 'top_tabs' && null}

            {section.type === 'categories' && (
              <div className={`grid ${section.layout === 'grid' ? 'grid-cols-5' : section.layout === 'list' ? 'grid-cols-1' : 'flex overflow-x-auto no-scrollbar gap-2'} gap-2`}>
                {categories
                  .filter(cat => cat.sectionId === section.id)
                  .map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleSetSelectedCategory(cat.id)}
                    className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-2xl border-2 transition-all ${
                      selectedCategory === cat.id
                      ? 'border-red-600 bg-red-50 text-red-600'
                      : 'border-transparent bg-white text-gray-500 shadow-sm hover:bg-gray-50'
                    }`}
                  >
                    <div className="shrink-0">
                      {renderCategoryIcon(cat.icon, 14)}
                    </div>
                    <span className="text-[10px] font-black text-center leading-tight">{cat.name}</span>
                  </button>
                ))}
              </div>
            )}

            {section.type === 'banners' && (
              <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2">
                {[1, 2].map(i => (
                  <div key={i} className="min-w-[260px] h-28 bg-gradient-to-br from-red-500 to-orange-600 rounded-[28px] p-5 text-white relative overflow-hidden flex-shrink-0">
                    <div className="relative z-10">
                      <h4 className="text-base font-black">فرصة عمل مميزة {i}</h4>
                      <p className="text-[10px] font-bold opacity-80">قدم الآن وابدأ مسيرتك المهنية</p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
                  </div>
                ))}
              </div>
            )}

            {section.type === 'featured_stores' && (
              <div className="grid grid-cols-1 gap-3">
                {filteredJobs.slice(0, 3).map(job => (
                  <div key={job.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-red-100 transition-all group text-right">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-red-600">
                        <Briefcase size={20} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-gray-900">{job.jobTitle || job.applicantProfession}</h4>
                        <p className="text-[9px] font-bold text-gray-400">{job.category}</p>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-gray-300" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Jobs List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black text-gray-900">
              {activeTab === 'available' ? 'أحدث الوظائف' : activeTab === 'requests' ? 'أحدث الطلبات' : 'النتائج'}
            </h3>
            <span className="text-[10px] font-bold text-gray-400">{filteredJobs.length} نتيجة</span>
          </div>

          <AnimatePresence mode="popLayout">
            {filteredJobs.map((post) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={post.id}
                className="bg-white p-5 rounded-[32px] shadow-xl border border-gray-100 space-y-4 relative overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                      {post.jobType === 'offer' ? <Building2 size={24} className="text-red-600" /> : <User size={24} className="text-emerald-600" />}
                    </div>
                    <div>
                      <h4 className="text-base font-black text-gray-900 leading-tight">
                        {post.jobType === 'offer' ? post.jobTitle : post.applicantProfession}
                      </h4>
                      <p className="text-xs font-bold text-gray-500 mt-1">
                        {post.jobType === 'offer' ? post.companyName : 'باحث عن عمل'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-gray-500">
                    <MapPin size={14} className="text-red-600" />
                    <span className="text-[11px] font-bold">
                      {post.jobType === 'offer' ? post.companyAddress : post.desiredLocation}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <DollarSign size={14} className="text-emerald-600" />
                    <span className="text-[11px] font-bold">{post.salaryRange}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock size={14} className="text-orange-600" />
                    <span className="text-[11px] font-bold">{post.shift}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <BriefcaseIcon size={14} className="text-purple-600" />
                    <span className="text-[11px] font-bold">{post.experience}</span>
                  </div>
                </div>

                <p className="text-xs font-bold text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-2xl">
                  {post.content}
                </p>

                <div className="flex gap-2 pt-2">
                  <button className="flex-1 py-3 bg-red-600 text-white text-xs font-black rounded-xl shadow-lg shadow-red-100 active:scale-95 transition-all">
                    {post.jobType === 'offer' ? 'تقديم الآن' : 'تواصل معه'}
                  </button>
                  <button className="px-4 py-3 bg-gray-50 text-gray-500 text-xs font-black rounded-xl hover:bg-gray-100 transition-all">
                    حفظ
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredJobs.length === 0 && (
            <div className="py-20 text-center text-gray-400 bg-white rounded-[40px] border border-dashed border-gray-200">
              <Briefcase size={64} className="mx-auto mb-6 opacity-10" />
              <p className="text-lg font-black opacity-40">لا توجد نتائج تطابق بحثك</p>
              <p className="text-xs font-bold opacity-30 mt-2">جرب البحث بكلمات أخرى أو تغيير القسم</p>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32 text-right" dir="rtl">
      {/* Header Branding & Search Bar */}
      <div className="flex items-center justify-between gap-3 mb-2 p-4 pb-0">
        <div className="flex items-center gap-3">
          {selectedCategory ? (
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSetSelectedCategory(null)}
              className="p-2 bg-white text-gray-400 rounded-xl shadow-sm border border-gray-100 hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all active:scale-90"
            >
              <ArrowRight size={24} />
            </motion.button>
          ) : (
            <div className="p-2 bg-red-600 text-white rounded-xl shadow-lg shadow-red-100">
              <JobsIcon size={24} />
            </div>
          )}
          <div>
            <h1 className="text-xl font-black text-gray-900 leading-tight">فرص عمل</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Job Opportunities</p>
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

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Top Tabs Bar - Grid Style */}
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
              {renderIcon(tab.icon, 16)}
              {tab.label}
            </button>
          ))}
        </div>

        {renderTabContent()}
      </div>

      {/* Floating Action Button & Menu */}
      <div className="fixed bottom-24 left-6 z-50">
        <AnimatePresence>
          {showFabMenu && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              className="absolute bottom-16 left-0 flex flex-col gap-3 min-w-[180px]"
            >
              <button
                onClick={() => handleOpenModal('offer')}
                className="bg-white text-red-600 px-6 py-4 rounded-2xl shadow-2xl border border-red-50 flex items-center justify-between group active:scale-95 transition-all"
              >
                <span className="text-sm font-black">إضافة فرصة عمل</span>
                <Building2 size={20} className="group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={() => handleOpenModal('request')}
                className="bg-white text-emerald-600 px-6 py-4 rounded-2xl shadow-2xl border border-emerald-50 flex items-center justify-between group active:scale-95 transition-all"
              >
                <span className="text-sm font-black">إضافة طلب وظيفة</span>
                <User size={20} className="group-hover:scale-110 transition-transform" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setShowFabMenu(!showFabMenu)}
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all z-50 ${
            showFabMenu ? 'bg-gray-900 text-white rotate-45' : 'bg-red-600 text-white shadow-red-200'
          }`}
        >
          <Plus size={28} />
        </button>
      </div>

      <CreateJobModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={modalInitialData}
      />
    </div>
  );
}
