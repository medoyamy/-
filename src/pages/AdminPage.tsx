import React, { useState, useMemo, useEffect } from 'react';
import AppStructurePage, { iconMap } from './AppStructurePage';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  ShieldCheck,
  CheckCircle2, 
  XCircle, 
  Eye, 
  Filter, 
  Search, 
  Clock, 
  AlertTriangle,
  User,
  Star,
  Briefcase,
  Store,
  Car,
  Utensils,
  Wrench,
  Handshake,
  Home,
  Grid,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  MessageSquare,
  ArrowRight,
  FileText,
  Layout,
  LayoutGrid,
  LayoutDashboard,
  MessageCircle,
  Coins,
  Edit2,
  Plus,
  Trash2,
  X,
  EyeOff,
  Flag,
  TrendingUp,
  Calculator,
  Ticket,
  Repeat,
  Users as UsersIcon,
  DollarSign,
  Calendar,
  FileCheck,
  UserPlus,
  Settings as SettingsIcon,
  CreditCard,
  Percent,
  Gift,
  Award,
  BarChart3,
  FileBarChart,
  ClipboardCheck,
  CheckSquare,
  Download,
  Activity,
  Map,
  BellRing,
  Truck,
  Navigation,
  Gauge,
  Power,
  MapPin as MapPinIcon,
  Image as ImageIcon,
  Database,
  ThumbsUp,
  Wallet,
  Package,
  History,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { usePosts, Post } from '../context/PostContext';
import { useUser, UserProfile } from '../context/UserContext';
import { useChat } from '../context/ChatContext';
import { useReviews } from '../context/ReviewContext';
import { useSettings, iconLabels } from '../context/SettingsContext';
import { SUPPORT_USER_IDS } from '../constants';
import ProfilePage from './ProfilePage';

type MainTab = 'posts' | 'pages' | 'reviews' | 'messages' | 'users' | 'content' | 'overview' | 'system' | 'hr' | 'accounting' | 'accounting_overview' | 'subscriptions' | 'coupons' | 'points' | 'analytics' | 'reports' | 'pages_mgmt' | 'pages_mgmt_merchant' | 'pages_mgmt_restaurant' | 'pages_mgmt_provider' | 'pages_mgmt_driver' | 'pages_mgmt_deal_manager' | 'notifications_mgmt' | 'user_pages_mgmt' | 'cities_mgmt' | 'live_counters' | 'live_maps' | 'instant_alerts' | 'delivery_mgmt';
type PostTab = 'customers' | 'providers' | 'merchants' | 'drivers' | 'agents' | 'deals' | 'fresh_mart' | 'jobs';
type PageTab = 'merchants' | 'providers' | 'deals' | 'drivers' | 'agents';

import { 
  AdminSubscriptionsTab, 
  AdminCouponsTab, 
  AdminPointsTab, 
  AdminAccountingTab, 
  AdminAccountingOverviewTab 
} from '../components/ManagementTabs';

interface AdminPageProps {
  initialTab?: MainTab;
  onClose?: () => void;
}

export default function AdminPage({ initialTab = 'posts', onClose }: AdminPageProps) {
  const { posts, approvePost, rejectPost } = usePosts();
  const { profiles, approveProfile, rejectProfile } = useUser();
  const [mainTab, setMainTab] = useState<MainTab>(initialTab);
  const [pendingMgmt, setPendingMgmt] = useState<{ serviceId: string, sectionId: string } | null>(null);

  // Sync with prop if it changes
  useEffect(() => {
    setMainTab(initialTab);
  }, [initialTab]);

  // Sync mainTab with history
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.type === 'admin_tab') {
        setMainTab(event.state.id);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleTabChange = (tabId: MainTab) => {
    if (mainTab === tabId) return;
    window.history.pushState({ type: 'admin_tab', id: tabId }, '');
    setMainTab(tabId);
  };
  const [activePostTab, setActivePostTab] = useState<PostTab>('customers');
  const [activePageTab, setActivePageTab] = useState<PageTab>('merchants');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectType, setRejectType] = useState<'post' | 'profile'>('post');

  const postTabs = [
    { id: 'customers', label: 'العملاء', icon: User, source: 'avalon' },
    { id: 'providers', label: 'الخدمات', icon: Briefcase, source: 'assisto' },
    { id: 'merchants', label: 'التجار', icon: Store, source: 'mercato' },
    { id: 'drivers', label: 'السائقين', icon: Car, source: 'driver' },
    { id: 'agents', label: 'الوكلاء', icon: Utensils, source: 'restaurants' },
    { id: 'deals', label: 'الصفقات', icon: Handshake, source: 'deals' },
    { id: 'fresh_mart', label: 'فريش مارت', icon: Utensils, source: 'fresh_mart' },
    { id: 'jobs', label: 'الوظائف', icon: Briefcase, source: 'jobs' },
  ];

  const pageTabs = [
    { id: 'merchants', label: 'التجار', icon: Store, mode: 'merchant' },
    { id: 'providers', label: 'الخدمات', icon: Briefcase, mode: 'provider' },
    { id: 'deals', label: 'الصفقات', icon: Handshake, mode: 'deal_manager' },
    { id: 'drivers', label: 'السائقين', icon: Car, mode: 'driver' },
    { id: 'agents', label: 'الوكلاء', icon: Utensils, mode: 'restaurant' },
  ];

  const filteredPosts = useMemo(() => {
    const currentTab = postTabs.find(t => t.id === activePostTab);
    return posts.filter(post => {
      const matchesSource = post.source === currentTab?.source;
      const isPending = post.status === 'pending';
      const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           post.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSource && isPending && matchesSearch;
    });
  }, [posts, activePostTab, searchQuery]);

  const filteredProfiles = useMemo(() => {
    const currentTab = pageTabs.find(t => t.id === activePageTab);
    return profiles.filter(profile => {
      const isPage = profile.isPage === true;
      const matchesMode = profile.mode === currentTab?.mode;
      const isPending = profile.status === 'pending';
      const matchesSearch = profile.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           profile.email.toLowerCase().includes(searchQuery.toLowerCase());
      return isPage && matchesMode && isPending && matchesSearch;
    });
  }, [profiles, activePageTab, searchQuery]);

  const handleApprovePost = async (postId: string) => {
    await approvePost(postId);
  };

  const handleApproveProfile = async (profileId: string) => {
    await approveProfile(profileId);
  };

  const handleReject = async () => {
    if (rejectionReason.trim()) {
      if (rejectType === 'post' && selectedPost) {
        await rejectPost(selectedPost.id, rejectionReason);
      } else if (rejectType === 'profile' && selectedProfile) {
        await rejectProfile(selectedProfile.id, rejectionReason);
      }
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedPost(null);
      setSelectedProfile(null);
    }
  };

  const categories = [
    { id: 'central_dashboard', label: 'لوحة قيادة مركزية', icon: LayoutDashboard, tabs: ['live_counters', 'live_maps', 'instant_alerts', 'cities_mgmt', 'notifications_mgmt'] as MainTab[] },
    { id: 'app_structure', label: 'هيكل التطبيق', icon: Layout, tabs: ['pages_mgmt', 'pages_mgmt_merchant', 'pages_mgmt_restaurant', 'pages_mgmt_provider', 'pages_mgmt_driver', 'pages_mgmt_deal_manager', 'delivery_mgmt'] as MainTab[] },
    { id: 'overview', label: 'نظرة عامة', icon: TrendingUp, tabs: ['overview', 'system', 'analytics', 'reports', 'content'] as MainTab[] },
    { id: 'messages', label: 'الرسائل', icon: MessageSquare, tabs: ['messages'] as MainTab[] },
    { id: 'approvals', label: 'نظام الموافقات', icon: ClipboardCheck, tabs: ['posts', 'pages', 'reviews'] as MainTab[] },
    { id: 'users_mgmt', label: 'إدارة المستخدمين', icon: UsersIcon, tabs: ['users', 'hr', 'user_pages_mgmt'] as MainTab[] },
    { id: 'accounting_sys', label: 'نظام الحسابات', icon: DollarSign, tabs: ['accounting_overview', 'accounting', 'subscriptions', 'coupons', 'points'] as MainTab[] },
  ];

  const currentCategory = categories.find(c => c.tabs.includes(mainTab)) || categories[0];

  const allTabs = [
    { id: 'overview', label: 'نظرة عامة', icon: TrendingUp },
    { id: 'analytics', label: 'التحليلات', icon: BarChart3 },
    { id: 'reports', label: 'التقارير', icon: FileBarChart },
    { id: 'content', label: 'البلاغات', icon: Flag },
    { id: 'system', label: 'النظام', icon: SettingsIcon },
    { id: 'messages', label: 'الرسائل', icon: MessageSquare },
    { id: 'posts', label: 'المنشورات', icon: FileText },
    { id: 'pages', label: 'الصفحات', icon: Layout },
    { id: 'users', label: 'المستخدمين', icon: UsersIcon },
    { id: 'hr', label: 'الموظفين', icon: Briefcase },
    { id: 'pages_mgmt', label: 'هيكل التطبيق للعملاء', icon: Layout },
    { id: 'pages_mgmt_merchant', label: 'هيكل تجار الميركاتو', icon: Store },
    { id: 'pages_mgmt_restaurant', label: 'هيكل وكلاء الفريش مارت', icon: Utensils },
    { id: 'pages_mgmt_provider', label: 'هيكل مقدمي الخدمات', icon: Briefcase },
    { id: 'pages_mgmt_driver', label: 'هيكل السائقين', icon: Car },
    { id: 'pages_mgmt_deal_manager', label: 'هيكل مديري الصفقات', icon: Handshake },
    { id: 'delivery_mgmt', label: 'إعدادات التوصيل', icon: Truck },
    { id: 'notifications_mgmt', label: 'نظام الإشعارات', icon: BellRing },
    { id: 'user_pages_mgmt', label: 'إدارة صفحات المستخدمين', icon: Store },
    { id: 'live_counters', label: 'عدادات حية', icon: Activity },
    { id: 'live_maps', label: 'خرائط حرارية', icon: Map },
    { id: 'instant_alerts', label: 'تنبيهات فورية', icon: BellRing },
    { id: 'cities_mgmt', label: 'إدارة المدن والمناطق', icon: MapPinIcon },
    { id: 'accounting_overview', label: 'نظرة عامة مالية', icon: BarChart3 },
    { id: 'accounting', label: 'المحاسبة', icon: Calculator },
    { id: 'subscriptions', label: 'اشتراكات العملاء', icon: Repeat },
    { id: 'coupons', label: 'الكوبونات', icon: Ticket },
    { id: 'points', label: 'النقاط', icon: Award },
    { id: 'reviews', label: 'التقييمات', icon: Star },
  ];

  const activeCategoryTabs = allTabs.filter(t => currentCategory.tabs.includes(t.id as MainTab));

  return (
    <div className="min-h-screen bg-gray-50 pb-32 text-right" dir="rtl">
      {/* Compact Header */}
      <div className="bg-slate-900 text-white p-3 sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white"
            >
              <ArrowRight size={20} />
            </button>
          )}
          <h1 className="text-sm font-black whitespace-nowrap">
            {currentCategory.label} - {allTabs.find(t => t.id === mainTab)?.label}
          </h1>
          
          <div className="flex-1 relative">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="بحث سريع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 pr-9 pl-3 text-[10px] font-bold outline-none focus:ring-1 focus:ring-red-500/50 transition-all text-white"
            />
          </div>
        </div>
      </div>

      <div className="p-2 space-y-2">
        {/* Sub Tabs - Category Specific */}
        <div className="sticky top-[56px] z-40 bg-gray-50/95 backdrop-blur-md flex gap-2 overflow-x-auto no-scrollbar py-2 px-1 border-b border-gray-100 -mx-2">
          {activeCategoryTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as MainTab)}
              className={`flex flex-col items-center gap-1 min-w-[60px] p-2 rounded-2xl transition-all ${
                mainTab === tab.id
                ? 'bg-red-600 text-white shadow-lg shadow-red-100'
                : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={16} />
              <div className="text-[8px] font-black text-center leading-tight">
                {tab.label.startsWith('هيكل ') ? (
                  <>
                    <div className="text-[10px]">هيكل</div>
                    <div className="opacity-80 text-[8px]">{tab.label.replace('هيكل ', '')}</div>
                  </>
                ) : (
                  <span className="whitespace-nowrap">{tab.label}</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Sub Tabs - Compact Pill Design */}
        {(mainTab === 'posts' || mainTab === 'pages') && (
          <div className="flex gap-1 overflow-x-auto no-scrollbar py-1">
            {(mainTab === 'posts' ? postTabs : pageTabs).map((tab) => (
              <button
                key={tab.id}
                onClick={() => mainTab === 'posts' ? setActivePostTab(tab.id as PostTab) : setActivePageTab(tab.id as PageTab)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[8px] font-black transition-all whitespace-nowrap border ${
                  (mainTab === 'posts' ? activePostTab : activePageTab) === tab.id
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={10} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Content List */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {mainTab === 'posts' ? (
              filteredPosts.map((post) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  key={post.id}
                  className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-100 space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 bg-gray-50 rounded-md flex items-center justify-center text-gray-400">
                        <User size={12} />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-gray-900 leading-none">{post.author}</h4>
                        <p className="text-[7px] font-bold text-gray-400 leading-none mt-0.5">{new Date(post.createdAt).toLocaleDateString('ar-EG')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <p className="text-[9px] font-bold text-gray-600 line-clamp-2 leading-tight">
                        {post.content}
                      </p>
                    </div>
                    {post.image && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <img src={post.image} alt="Post content" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1.5 pt-1 border-t border-gray-50">
                    <button 
                      onClick={() => setSelectedPost(post)}
                      className="p-1.5 bg-gray-50 text-gray-400 rounded-md hover:bg-gray-100 transition-all"
                    >
                      <Eye size={12} />
                    </button>
                    <button 
                      onClick={() => handleApprovePost(post.id)}
                      className="flex-1 py-1.5 bg-emerald-500 text-white text-[9px] font-black rounded-md active:scale-95 transition-all flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 size={10} />
                      موافقة
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedPost(post);
                        setRejectType('post');
                        setShowRejectModal(true);
                      }}
                      className="flex-1 py-1.5 bg-red-500 text-white text-[9px] font-black rounded-md active:scale-95 transition-all flex items-center justify-center gap-1"
                    >
                      <XCircle size={10} />
                      رفض
                    </button>
                  </div>
                </motion.div>
              ))
            ) : mainTab === 'pages' ? (
              filteredProfiles.map((profile) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  key={profile.id}
                  className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-100 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      <img src={profile.avatar || `https://picsum.photos/seed/${profile.id}/100/100`} alt={profile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[10px] font-black text-gray-900 truncate leading-none">{profile.name}</h4>
                      <p className="text-[7px] font-bold text-gray-400 truncate leading-none mt-0.5">{profile.email}</p>
                    </div>
                  </div>

                  <p className="text-[9px] font-bold text-gray-600 line-clamp-2 leading-tight">
                    {profile.description || 'لا يوجد وصف'}
                  </p>

                  <div className="flex gap-1.5 pt-1 border-t border-gray-50">
                    <button 
                      onClick={() => setSelectedProfile(profile)}
                      className="p-1.5 bg-gray-50 text-gray-400 rounded-md hover:bg-gray-100 transition-all"
                    >
                      <Eye size={12} />
                    </button>
                    <button 
                      onClick={() => handleApproveProfile(profile.id)}
                      className="flex-1 py-1.5 bg-emerald-500 text-white text-[9px] font-black rounded-md active:scale-95 transition-all flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 size={10} />
                      موافقة
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedProfile(profile);
                        setRejectType('profile');
                        setShowRejectModal(true);
                      }}
                      className="flex-1 py-1.5 bg-red-500 text-white text-[9px] font-black rounded-md active:scale-95 transition-all flex items-center justify-center gap-1"
                    >
                      <XCircle size={10} />
                      رفض
                    </button>
                  </div>
                </motion.div>
              ))
            ) : mainTab === 'messages' ? (
              <AdminMessagesTab />
            ) : mainTab === 'live_counters' ? (
              <AdminLiveCountersTab />
            ) : mainTab === 'live_maps' ? (
              <AdminLiveMapsTab />
            ) : mainTab === 'instant_alerts' ? (
              <AdminInstantAlertsTab />
            ) : mainTab === 'cities_mgmt' ? (
              <AdminCitiesMgmtTab />
            ) : mainTab === 'analytics' ? (
              <AdminAnalyticsTab />
            ) : mainTab === 'reports' ? (
              <AdminReportsTab />
            ) : mainTab === 'users' ? (
              <AdminUsersTab />
            ) : mainTab === 'pages_mgmt' ? (
              <AdminPagesMgmtTab 
                userMode="user" 
                title="هيكل التطبيق للعملاء" 
                onManagePages={(serviceId, sectionId) => {
                  setPendingMgmt({ serviceId, sectionId });
                  handleTabChange('user_pages_mgmt');
                }}
              />
            ) : mainTab === 'pages_mgmt_merchant' ? (
              <AdminPagesMgmtTab 
                userMode="merchant" 
                title="هيكل تجار الميركاتو" 
                onManagePages={(serviceId, sectionId) => {
                  setPendingMgmt({ serviceId, sectionId });
                  handleTabChange('user_pages_mgmt');
                }}
              />
            ) : mainTab === 'pages_mgmt_restaurant' ? (
              <AdminPagesMgmtTab 
                userMode="restaurant" 
                title="هيكل وكلاء الفريش مارت" 
                onManagePages={(serviceId, sectionId) => {
                  setPendingMgmt({ serviceId, sectionId });
                  handleTabChange('user_pages_mgmt');
                }}
              />
            ) : mainTab === 'pages_mgmt_provider' ? (
              <AdminPagesMgmtTab 
                userMode="provider" 
                title="هيكل مقدمي الخدمات" 
                onManagePages={(serviceId, sectionId) => {
                  setPendingMgmt({ serviceId, sectionId });
                  handleTabChange('user_pages_mgmt');
                }}
              />
            ) : mainTab === 'pages_mgmt_driver' ? (
              <AdminPagesMgmtTab 
                userMode="driver" 
                title="هيكل السائقين" 
                onManagePages={(serviceId, sectionId) => {
                  setPendingMgmt({ serviceId, sectionId });
                  handleTabChange('user_pages_mgmt');
                }}
              />
            ) : mainTab === 'pages_mgmt_deal_manager' ? (
              <AdminPagesMgmtTab 
                userMode="deal_manager" 
                title="هيكل مديري الصفقات" 
                onManagePages={(serviceId, sectionId) => {
                  setPendingMgmt({ serviceId, sectionId });
                  handleTabChange('user_pages_mgmt');
                }}
              />
            ) : mainTab === 'delivery_mgmt' ? (
              <AdminDeliveryMgmtTab />
            ) : mainTab === 'notifications_mgmt' ? (
              <AdminNotificationsMgmtTab />
            ) : mainTab === 'reviews' ? (
              <AdminReviewsTab />
            ) : mainTab === 'user_pages_mgmt' ? (
              <AdminUserPagesMgmtTab 
                pendingMgmt={pendingMgmt} 
                onClearPending={() => setPendingMgmt(null)} 
                onGoToStructure={(userMode) => {
                  const tabMap: Record<string, MainTab> = {
                    'user': 'pages_mgmt',
                    'merchant': 'pages_mgmt_merchant',
                    'restaurant': 'pages_mgmt_restaurant',
                    'provider': 'pages_mgmt_provider',
                    'driver': 'pages_mgmt_driver',
                    'deal_manager': 'pages_mgmt_deal_manager'
                  };
                  handleTabChange(tabMap[userMode] || 'pages_mgmt');
                }}
              />
            ) : mainTab === 'content' ? (
              <AdminContentTab />
            ) : mainTab === 'overview' ? (
              <AdminOverviewTab />
            ) : mainTab === 'system' ? (
              <AdminSystemTab />
            ) : mainTab === 'hr' ? (
              <AdminHRTab />
            ) : mainTab === 'accounting_overview' ? (
              <AdminAccountingOverviewTab />
            ) : mainTab === 'accounting' ? (
              <AdminAccountingTab />
            ) : mainTab === 'subscriptions' ? (
              <AdminSubscriptionsTab />
            ) : mainTab === 'coupons' ? (
              <AdminCouponsTab />
            ) : mainTab === 'points' ? (
              <AdminPointsTab />
            ) : mainTab === 'profile' ? (
              <ProfilePage isEmbedded={true} />
            ) : (
              <div className="py-20 text-center text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
                <Shield size={48} className="mx-auto mb-4 opacity-10" />
                <p className="text-sm font-black opacity-40">هذا القسم قيد التطوير</p>
                <p className="text-[10px] font-bold opacity-30 mt-1">سيتم توفير أدوات الإدارة لهذا القسم قريباً</p>
              </div>
            )}
          </AnimatePresence>

          {((mainTab === 'posts' && filteredPosts.length === 0) || (mainTab === 'pages' && filteredProfiles.length === 0)) && (
            <div className="py-20 text-center text-gray-400 bg-white rounded-[40px] border border-dashed border-gray-200">
              <CheckCircle2 size={64} className="mx-auto mb-6 opacity-10" />
              <p className="text-lg font-black opacity-40">لا توجد {mainTab === 'posts' ? 'منشورات' : 'صفحات'} معلقة</p>
              <p className="text-xs font-bold opacity-30 mt-2">تمت مراجعة كافة الطلبات في هذا القسم</p>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[40px] w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100"
            >
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                  <AlertTriangle size={40} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">رفض {rejectType === 'post' ? 'المنشور' : 'الصفحة'}</h3>
                <p className="text-sm font-bold text-gray-500 mb-6">يرجى كتابة سبب الرفض لمساعدة العميل على تعديل البيانات.</p>
                
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="اكتب سبب الرفض هنا..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-red-100 transition-all h-32 resize-none text-right"
                  dir="rtl"
                />
              </div>
              <div className="p-6 bg-gray-50 flex gap-3">
                <button 
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="flex-1 py-4 rounded-2xl text-sm font-black text-gray-500 bg-white border border-gray-200 shadow-sm active:scale-95 transition-all"
                >
                  إلغاء
                </button>
                <button 
                  onClick={handleReject}
                  disabled={!rejectionReason.trim()}
                  className="flex-1 py-4 rounded-2xl text-sm font-black text-white bg-red-600 shadow-lg shadow-red-100 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  تأكيد الرفض
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Post Detail Modal */}
      <AnimatePresence>
        {selectedPost && !showRejectModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-black text-gray-900">تفاصيل المنشور</h3>
                <button onClick={() => setSelectedPost(null)} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                  <XCircle size={24} className="text-gray-400" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                    <User size={28} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-gray-900">{selectedPost.author}</h4>
                    <p className="text-xs font-bold text-gray-400">القسم: {selectedPost.source}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                  <p className="text-sm font-bold text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedPost.content}
                  </p>
                </div>

                {selectedPost.image && (
                  <div className="rounded-3xl overflow-hidden shadow-lg border border-gray-100">
                    <img src={selectedPost.image} alt="Post content" className="w-full h-auto" referrerPolicy="no-referrer" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">طريقة التواصل</p>
                    <p className="text-xs font-black text-gray-900">{selectedPost.contactMethod}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">تاريخ النشر</p>
                    <p className="text-xs font-black text-gray-900">{new Date(selectedPost.createdAt).toLocaleDateString('ar-EG')}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 flex gap-3">
                <button 
                  onClick={() => handleApprovePost(selectedPost.id)}
                  className="flex-1 py-4 rounded-2xl text-sm font-black text-white bg-emerald-500 shadow-lg shadow-emerald-100 active:scale-95 transition-all"
                >
                  موافقة فورية
                </button>
                <button 
                  onClick={() => {
                    setRejectType('post');
                    setShowRejectModal(true);
                  }}
                  className="flex-1 py-4 rounded-2xl text-sm font-black text-white bg-red-500 shadow-lg shadow-red-100 active:scale-95 transition-all"
                >
                  رفض مع السبب
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Detail Modal */}
      <AnimatePresence>
        {selectedProfile && !showRejectModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-black text-gray-900">تفاصيل الصفحة</h3>
                <button onClick={() => setSelectedProfile(null)} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                  <XCircle size={24} className="text-gray-400" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-3xl overflow-hidden shadow-lg">
                    <img src={selectedProfile.avatar || `https://picsum.photos/seed/${selectedProfile.id}/200/200`} alt={selectedProfile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-xl font-black text-gray-900">{selectedProfile.name}</h4>
                    <p className="text-sm font-bold text-red-600">{selectedProfile.mode}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">البريد الإلكتروني</p>
                    <p className="text-xs font-black text-gray-900">{selectedProfile.email}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">الموقع</p>
                    <p className="text-xs font-black text-gray-900">{selectedProfile.location || 'غير محدد'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">الوصف</p>
                    <p className="text-xs font-bold text-gray-700 leading-relaxed">{selectedProfile.description || 'لا يوجد وصف'}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 flex gap-3">
                <button 
                  onClick={() => handleApproveProfile(selectedProfile.id)}
                  className="flex-1 py-4 rounded-2xl text-sm font-black text-white bg-emerald-500 shadow-lg shadow-emerald-100 active:scale-95 transition-all"
                >
                  موافقة فورية
                </button>
                <button 
                  onClick={() => {
                    setRejectType('profile');
                    setShowRejectModal(true);
                  }}
                  className="flex-1 py-4 rounded-2xl text-sm font-black text-white bg-red-500 shadow-lg shadow-red-100 active:scale-95 transition-all"
                >
                  رفض مع السبب
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AdminOverviewTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400">إجمالي المستخدمين</p>
          <h3 className="text-xl font-black text-gray-800">12,450</h3>
          <div className="flex items-center gap-1 text-[9px] text-green-600 font-bold mt-1">
            <TrendingUp size={10} />
            +12% هذا الشهر
          </div>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400">الطلبات النشطة</p>
          <h3 className="text-xl font-black text-gray-800">842</h3>
          <div className="flex items-center gap-1 text-[9px] text-blue-600 font-bold mt-1">
            <Clock size={10} />
            45 طلب جديد
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
        <h4 className="text-sm font-black text-gray-800 mb-4">توزيع المستخدمين</h4>
        <div className="space-y-3">
          {[
            { label: 'مستخدمين عاديين', value: '8,200', color: 'bg-red-500' },
            { label: 'تجار', value: '1,500', color: 'bg-blue-500' },
            { label: 'مقدمي خدمات', value: '2,100', color: 'bg-emerald-500' },
            { label: 'سائقين', value: '650', color: 'bg-orange-500' },
          ].map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-gray-500">{item.label}</span>
                <span className="text-gray-800">{item.value}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${item.color}`} style={{ width: `${(parseInt(item.value.replace(',', '')) / 12450) * 100}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminSystemTab() {
  return (
    <div className="space-y-4">
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
        <h4 className="text-sm font-black text-gray-800 mb-4">حالة الخوادم</h4>
        <div className="space-y-4">
          {[
            { label: 'خادم قاعدة البيانات', status: 'يعمل', color: 'text-green-600' },
            { label: 'خادم الصور والملفات', status: 'يعمل', color: 'text-green-600' },
            { label: 'خدمة الإشعارات', status: 'بطء بسيط', color: 'text-amber-600' },
          ].map((item, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500">{item.label}</span>
              <span className={`text-xs font-black ${item.color}`}>{item.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
        <h4 className="text-sm font-black text-gray-800 mb-4">إعدادات النظام</h4>
        <div className="space-y-2">
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-all">
            <span className="text-xs font-bold text-gray-700">تحديث التطبيق</span>
            <ChevronLeft size={16} className="text-gray-300" />
          </button>
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-all">
            <span className="text-xs font-bold text-gray-700">نسخة احتياطية</span>
            <ChevronLeft size={16} className="text-gray-300" />
          </button>
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-all">
            <span className="text-xs font-bold text-gray-700">سجل الأحداث (Logs)</span>
            <ChevronLeft size={16} className="text-gray-300" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminUserPagesMgmtTab({ pendingMgmt, onClearPending, onGoToStructure }: { pendingMgmt?: { serviceId: string, sectionId: string } | null, onClearPending?: () => void, onGoToStructure?: (userMode: string) => void }) {
  const { profiles, updateProfileDetails } = useUser();
  const { services, appStructure, addSection, categories } = useSettings();
  const [activeService, setActiveService] = useState(services[0]?.id || 'mercato');
  const [activeSectionId, setActiveSectionId] = useState('');
  const [viewMode, setViewMode] = useState<'pages' | 'settings'>('pages');
  const [selectedPage, setSelectedPage] = useState<UserProfile | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  
  // Handle pending management from AppStructurePage
  useEffect(() => {
    if (pendingMgmt) {
      setActiveService(pendingMgmt.serviceId);
      setActiveSectionId(pendingMgmt.sectionId);
      onClearPending?.();
    }
  }, [pendingMgmt, onClearPending]);
  
  const renderIcon = (iconName: string, size = 14) => {
    const Icon = iconMap[iconName] || Grid;
    return <Icon size={size} />;
  };

  const currentSections = appStructure[activeService] || [];

  // Reset section when service changes
  useEffect(() => {
    if (currentSections.length > 0 && !activeSectionId) {
      setActiveSectionId(currentSections[0].id);
    }
  }, [activeService, currentSections]);

  const handleAddSectionSubmit = async () => {
    if (newSectionName.trim()) {
      await addSection(activeService, {
        name: newSectionName.trim(),
        icon: 'Grid',
        isActive: true,
        type: 'categories',
        layout: 'grid',
        description: ''
      });
      setNewSectionName('');
      setShowAddModal(false);
    }
  };

  const currentService = services.find(s => s.id === activeService);
  const activeSection = currentSections.find(s => s.id === activeSectionId);

  const filteredUserPages = profiles.filter(p => 
    p.isPage && 
    p.mode === currentService?.userMode &&
    p.status === 'active' &&
    ((p as any).sectionId === activeSectionId || (!(p as any).sectionId && activeSectionId === currentSections[0]?.id))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-black text-gray-800">إدارة صفحات المستخدمين والخدمات</h3>
          {onGoToStructure && currentService && (
            <button 
              onClick={() => onGoToStructure(currentService.userMode || 'user')}
              className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[8px] font-black hover:bg-slate-200 transition-all"
            >
              <LayoutGrid size={10} />
              عرض الهيكل
            </button>
          )}
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setViewMode('pages')}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${
              viewMode === 'pages' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'
            }`}
          >
            الصفحات
          </button>
          <button 
            onClick={() => setViewMode('settings')}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${
              viewMode === 'settings' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'
            }`}
          >
            إعدادات الخدمة
          </button>
        </div>
      </div>
      
      {/* 1. Service Selector */}
      <div className="sticky top-[112px] z-20 bg-gray-50/95 backdrop-blur-md py-4 border-b border-gray-200 -mx-4 px-4 mb-4 shadow-sm flex gap-2 overflow-x-auto no-scrollbar">
        {services.sort((a, b) => a.order - b.order).map(service => (
          <button 
            key={service.id} 
            onClick={() => setActiveService(service.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-2xl text-[10px] font-black transition-all flex items-center gap-2 border ${
              activeService === service.id 
                ? 'bg-red-600 text-white border-red-600 shadow-md' 
                : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'
            } ${!service.isActive ? 'opacity-50 grayscale' : ''}`}
          >
            {renderIcon(service.icon || 'Grid', 14)}
            {service.name}
          </button>
        ))}
      </div>

      {viewMode === 'pages' ? (
        <>
          {/* 2. Section Selector (Main Sections) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-red-600 text-white rounded-full shadow-md active:scale-95 transition-all"
            >
              <Plus size={14} />
            </button>
            {(currentSections).map(section => (
              <button 
                key={section.id} 
                onClick={() => setActiveSectionId(section.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[9px] font-black transition-all border ${
                  activeSectionId === section.id 
                    ? 'bg-slate-800 text-white border-slate-800' 
                    : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100'
                }`}
              >
                {section.name}
              </button>
            ))}
          </div>

          {/* Add Section Modal */}
          <AnimatePresence>
            {showAddModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowAddModal(false)}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="relative w-full max-w-sm bg-white rounded-[40px] p-8 shadow-2xl overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-gray-900">إضافة تصنيف جديد</h3>
                    <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <X size={20} className="text-gray-400" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">اسم التصنيف</label>
                      <input 
                        type="text"
                        value={newSectionName}
                        onChange={(e) => setNewSectionName(e.target.value)}
                        placeholder="مثال: ملابس رجالي"
                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-red-500 transition-all"
                        autoFocus
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={() => setShowAddModal(false)}
                        className="flex-1 py-4 bg-gray-100 text-gray-900 rounded-2xl text-xs font-black hover:bg-gray-200 transition-all"
                      >
                        إلغاء
                      </button>
                      <button 
                        onClick={handleAddSectionSubmit}
                        disabled={!newSectionName.trim()}
                        className="flex-[2] py-4 bg-red-600 text-white rounded-2xl text-xs font-black shadow-xl shadow-red-100 hover:bg-red-700 transition-all disabled:opacity-50"
                      >
                        إضافة التصنيف
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* 3. Pages List for selected section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-[10px] font-black text-gray-400">الصفحات المسجلة في {activeSection?.name}</h4>
              <span className="text-[9px] font-bold text-gray-400">{filteredUserPages.length} صفحة</span>
            </div>
            
            {filteredUserPages.length > 0 ? (
              filteredUserPages.map((page) => (
                <div key={page.id} className="bg-white p-3 rounded-3xl border border-gray-100 flex items-center justify-between hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl overflow-hidden bg-gray-50 border border-gray-50">
                      <img 
                        src={page.avatar || `https://picsum.photos/seed/${page.id}/100/100`} 
                        alt={page.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-gray-800">{page.name}</h4>
                      <p className="text-[9px] font-bold text-gray-400">{page.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => setSelectedPage(page)}
                      className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <SettingsIcon size={14} />
                    </button>
                    <button className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      <Eye size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center bg-white rounded-[32px] border border-dashed border-gray-100">
                <Layout size={32} className="mx-auto text-gray-100 mb-2" />
                <p className="text-[10px] font-black text-gray-300">لا توجد صفحات حالياً في هذا القسم</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          {activeService === 'delivery' ? (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-[32px] border border-gray-100">
                <h4 className="text-xs font-black text-gray-800 mb-4 flex items-center gap-2">
                  <DollarSign size={16} className="text-orange-600" />
                  إعدادات تسعيرة وصلنى
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Gauge size={14} className="text-gray-400" />
                      <span className="text-[10px] font-bold text-gray-700">البنديرة (بداية الرحلة)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="text" defaultValue="15" className="w-12 bg-white border border-gray-200 rounded-lg py-1 text-center text-[10px] font-black" />
                      <span className="text-[8px] font-bold text-gray-400">ج.م</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Navigation size={14} className="text-gray-400" />
                      <span className="text-[10px] font-bold text-gray-700">سعر الكيلومتر</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="text" defaultValue="4.5" className="w-12 bg-white border border-gray-200 rounded-lg py-1 text-center text-[10px] font-black" />
                      <span className="text-[8px] font-bold text-gray-400">ج.م</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-[10px] font-bold text-gray-700">سعر دقيقة الانتظار</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="text" defaultValue="0.75" className="w-12 bg-white border border-gray-200 rounded-lg py-1 text-center text-[10px] font-black" />
                      <span className="text-[8px] font-bold text-gray-400">ج.م</span>
                    </div>
                  </div>
                  <button className="w-full py-2.5 bg-slate-900 text-white text-[10px] font-black rounded-xl mt-2">
                    حفظ إعدادات التسعيرة
                  </button>
                </div>
              </div>

              <div className="bg-white p-5 rounded-[32px] border border-gray-100">
                <h4 className="text-xs font-black text-gray-800 mb-4 flex items-center gap-2">
                  <Truck size={16} className="text-orange-600" />
                  إدارة أنواع المركبات
                </h4>
                <div className="space-y-2">
                  {[
                    { name: 'سيارة ملاكي (Economy)', icon: Car, multiplier: '1.0x' },
                    { name: 'سيارة عائلية (XL)', icon: Truck, multiplier: '1.5x' },
                    { name: 'دراجة نارية (Moto)', icon: Navigation, multiplier: '0.7x' },
                  ].map((vehicle, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-gray-400">
                          <vehicle.icon size={16} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-700">{vehicle.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black text-emerald-600">{vehicle.multiplier}</span>
                        <button className="text-[9px] font-black text-red-600">تعديل</button>
                      </div>
                    </div>
                  ))}
                  <button className="w-full py-2.5 bg-gray-100 text-gray-600 text-[10px] font-black rounded-xl mt-2 flex items-center justify-center gap-2">
                    <UserPlus size={14} />
                    إضافة نوع مركبة جديد
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-[40px] border border-dashed border-gray-100">
              <SettingsIcon size={48} className="mx-auto text-gray-100 mb-4" />
              <h4 className="text-sm font-black text-gray-800 mb-2">إعدادات خدمة {services.find(s => s.id === activeService)?.name}</h4>
              <p className="text-[10px] font-bold text-gray-400">سيتم توفير إعدادات مخصصة لهذه الخدمة قريباً</p>
            </div>
          )}
        </div>
      )}

      {/* Page Management Modal */}
      <AnimatePresence>
        {selectedPage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className="p-6 bg-slate-900 text-white relative">
                  <button 
                    onClick={() => setSelectedPage(null)}
                    className="absolute left-6 top-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all"
                  >
                    <XCircle size={20} />
                  </button>
                <div className="flex items-center gap-4 mt-4">
                  <img src={selectedPage.avatar} alt="" className="w-16 h-16 rounded-3xl border-2 border-white/20" />
                  <div>
                    <h3 className="text-lg font-black">{selectedPage.name}</h3>
                    <p className="text-xs text-slate-400">{selectedPage.email}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-4 rounded-3xl text-center">
                    <p className="text-[9px] font-bold text-gray-400 mb-1">إجمالي المبيعات</p>
                    <p className="text-sm font-black text-gray-800">2,450 ج.م</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-3xl text-center">
                    <p className="text-[9px] font-bold text-gray-400 mb-1">الطلبات المكتملة</p>
                    <p className="text-sm font-black text-gray-800">124 طلب</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black text-gray-800">إعدادات العرض</h4>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">القسم الرئيسي</label>
                    <select 
                      value={selectedPage.sectionId || ''}
                      onChange={async (e) => {
                        const newSectionId = e.target.value;
                        await updateProfileDetails(selectedPage.id, { sectionId: newSectionId });
                        setSelectedPage(prev => prev ? { ...prev, sectionId: newSectionId } : null);
                      }}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-red-500 transition-all appearance-none"
                    >
                      <option value="">اختر القسم</option>
                      {currentSections.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Category Selection */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-gray-800">التصنيفات الفرعية</h4>
                  <div className="flex flex-wrap gap-2">
                    {categories[activeService]?.filter(cat => {
                      const section = (appStructure[activeService] || []).find(s => s.id === cat.sectionId);
                      return section?.type === 'categories';
                    }).map(cat => {
                      const isSelected = selectedPage.categories?.includes(cat.name);
                      return (
                        <button
                          key={cat.id}
                          onClick={async () => {
                            const currentCats = selectedPage.categories || [];
                            const newCats = isSelected 
                              ? currentCats.filter(c => c !== cat.name)
                              : [...currentCats, cat.name];
                            
                            await updateProfileDetails(selectedPage.id, { categories: newCats });
                            setSelectedPage(prev => prev ? { ...prev, categories: newCats } : null);
                          }}
                          className={`px-3 py-1.5 rounded-full text-[9px] font-black transition-all border ${
                            isSelected
                              ? 'bg-red-600 text-white border-red-600 shadow-md'
                              : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100'
                          }`}
                        >
                          {cat.name}
                        </button>
                      );
                    })}
                    {(!categories[activeService]?.filter(cat => {
                      const section = (appStructure[activeService] || []).find(s => s.id === cat.sectionId);
                      return section?.type === 'categories';
                    }).length) && (
                      <p className="text-[9px] font-bold text-gray-400 italic">لا توجد تصنيفات فرعية لهذا القسم</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black text-gray-800">إجراءات الإدارة</h4>
                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Edit2 size={16} />
                      </div>
                      <span className="text-xs font-bold text-gray-700">تعديل بيانات الصفحة</span>
                    </div>
                    <ChevronLeft size={16} className="text-gray-300 group-hover:text-gray-600 transition-all" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <TrendingUp size={16} />
                      </div>
                      <span className="text-xs font-bold text-gray-700">ترقية إلى صفحة موثقة</span>
                    </div>
                    <ChevronLeft size={16} className="text-gray-300 group-hover:text-gray-600 transition-all" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-red-50 rounded-2xl hover:bg-red-100 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white text-red-600 rounded-xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all">
                        <AlertTriangle size={16} />
                      </div>
                      <span className="text-xs font-bold text-red-600">إيقاف الصفحة مؤقتاً</span>
                    </div>
                    <ChevronLeft size={16} className="text-red-300 group-hover:text-red-600 transition-all" />
                  </button>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <button 
                  onClick={() => setSelectedPage(null)}
                  className="w-full py-4 bg-slate-900 text-white text-sm font-black rounded-2xl shadow-lg"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AdminPagesMgmtTab({ userMode, title, onManagePages }: { userMode?: string; title?: string; onManagePages?: (serviceId: string, sectionId: string) => void }) {
  return <AppStructurePage isOverlay={false} userMode={userMode as any} title={title} onManagePages={onManagePages} />;
}

function AdminLiveCountersTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-gray-800">الطلبات النشطة الآن</h3>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[8px] font-black uppercase">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {[
          { label: 'ميركاتو (Mercato)', count: 124, icon: Store, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'فريش مارت (FreshMart)', count: 86, icon: Utensils, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'وصلني (Delivery)', count: 42, icon: Car, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-5 rounded-[32px] border border-gray-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center`}>
                <item.icon size={24} />
              </div>
              <div>
                <h4 className="text-xs font-black text-gray-800">{item.label}</h4>
                <p className="text-[9px] font-bold text-gray-400">طلبات قيد التنفيذ حالياً</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-2xl font-black ${item.color}`}>{item.count}</span>
              <p className="text-[8px] font-black text-emerald-500 mt-1">+12% من الساعة الماضية</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 p-6 rounded-[40px] text-white overflow-hidden relative">
        <div className="relative z-10">
          <h4 className="text-xs font-black mb-1">إجمالي النشاط اللحظي</h4>
          <p className="text-[10px] text-slate-400 mb-4">مجموع العمليات عبر كافة المنصات</p>
          <div className="text-4xl font-black tracking-tighter">252</div>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-10">
          <Activity size={120} />
        </div>
      </div>
    </div>
  );
}

function AdminLiveMapsTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-gray-800">خريطة المتابعة اللحظية</h3>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 text-[9px] font-bold text-gray-500">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" /> سائق متاح
          </div>
          <div className="flex items-center gap-1 text-[9px] font-bold text-gray-500">
            <span className="w-2 h-2 bg-orange-500 rounded-full" /> طلب جاري
          </div>
        </div>
      </div>

      <div className="bg-gray-100 rounded-[40px] h-[400px] relative overflow-hidden border border-gray-200 shadow-inner">
        {/* Mock Map Background */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        
        {/* Mock Markers */}
        {[
          { top: '20%', left: '30%', type: 'driver' },
          { top: '45%', left: '60%', type: 'order' },
          { top: '70%', left: '25%', type: 'driver' },
          { top: '35%', left: '80%', type: 'order' },
          { top: '60%', left: '50%', type: 'driver' },
        ].map((m, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-lg ${
              m.type === 'driver' ? 'bg-emerald-500' : 'bg-orange-500'
            }`}
            style={{ top: m.top, left: m.left }}
          />
        ))}

        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-white/20 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">السائقين النشطين</p>
              <p className="text-sm font-black text-gray-900">18 سائق في منطقتك</p>
            </div>
            <button className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black rounded-xl">
              توسيع الخريطة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminInstantAlertsTab() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-black text-gray-800">التنبيهات والبلاغات العاجلة</h3>
      
      <div className="space-y-3">
        {[
          { type: 'join', title: 'طلب انضمام متجر جديد', source: 'ميركاتو', time: 'منذ دقيقتين', priority: 'high' },
          { type: 'complaint', title: 'شكوى تأخير توصيل', source: 'وصلني', time: 'منذ 5 دقائق', priority: 'urgent' },
          { type: 'complaint', title: 'بلاغ عن محتوى غير لائق', source: 'اسيستو', time: 'منذ 12 دقيقة', priority: 'medium' },
          { type: 'join', title: 'طلب انضمام مطعم', source: 'فريش مارت', time: 'منذ 20 دقيقة', priority: 'high' },
        ].map((alert, i) => (
          <div key={i} className={`p-4 rounded-3xl border ${
            alert.priority === 'urgent' ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'
          } flex items-start gap-4 hover:shadow-md transition-all`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              alert.type === 'join' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
            }`}>
              {alert.type === 'join' ? <UserPlus size={20} /> : <AlertTriangle size={20} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${
                  alert.priority === 'urgent' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {alert.priority}
                </span>
                <span className="text-[8px] font-bold text-gray-400">{alert.time}</span>
              </div>
              <h4 className="text-xs font-black text-gray-800 truncate">{alert.title}</h4>
              <p className="text-[9px] font-bold text-gray-400 mt-0.5">المصدر: {alert.source}</p>
            </div>
            <button className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
              <ChevronLeft size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminCitiesMgmtTab() {
  const [activeCity, setActiveCity] = useState('القاهرة');
  const [newCityName, setNewCityName] = useState('');
  const [newRegionName, setNewRegionName] = useState('');

  const [egyptData, setEgyptData] = useState([
    { 
      id: '1', 
      name: 'القاهرة', 
      regions: ['المعادي', 'مدينة نصر', 'التجمع الخامس', 'وسط البلد', 'مصر الجديدة'],
      status: 'active'
    },
    { 
      id: '2', 
      name: 'الجيزة', 
      regions: ['الدقي', 'المهندسين', 'الهرم', '6 أكتوبر', 'الشيخ زايد'],
      status: 'active'
    },
    { 
      id: '3', 
      name: 'المنصورة', 
      regions: ['المشاية', 'حي الجامعة', 'توريل', 'جديلة', 'سندوب'],
      status: 'active'
    },
    { 
      id: '4', 
      name: 'الإسكندرية', 
      regions: ['سموحة', 'ستانلي', 'المنتزة', 'ميامي', 'محرم بك'],
      status: 'active'
    }
  ]);

  const handleAddCity = () => {
    if (!newCityName.trim()) return;
    const newCity = {
      id: Date.now().toString(),
      name: newCityName,
      regions: [],
      status: 'active' as const
    };
    setEgyptData([...egyptData, newCity]);
    setNewCityName('');
  };

  const handleAddRegion = () => {
    if (!newRegionName.trim()) return;
    setEgyptData(egyptData.map(city => {
      if (city.name === activeCity) {
        return { ...city, regions: [...city.regions, newRegionName] };
      }
      return city;
    }));
    setNewRegionName('');
  };

  const toggleCityStatus = (id: string) => {
    setEgyptData(egyptData.map(city => {
      if (city.id === id) {
        return { ...city, status: city.status === 'active' ? 'inactive' : 'active' };
      }
      return city;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-gray-800">إدارة المدن والمناطق (جمهورية مصر العربية)</h3>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={newCityName}
            onChange={(e) => setNewCityName(e.target.value)}
            placeholder="اسم المدينة الجديدة..."
            className="bg-white border border-gray-100 rounded-xl px-3 py-1.5 text-[10px] font-bold outline-none focus:ring-2 focus:ring-red-100"
          />
          <button 
            onClick={handleAddCity}
            className="bg-red-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1"
          >
            <Plus size={14} />
            إضافة مدينة
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cities List */}
        <div className="md:col-span-1 space-y-3">
          <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">المدن المتاحة</h4>
          <div className="space-y-2">
            {egyptData.map(city => (
              <div 
                key={city.id}
                onClick={() => setActiveCity(city.name)}
                className={`p-4 rounded-3xl border transition-all cursor-pointer flex items-center justify-between ${
                  activeCity === city.name 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                    : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPinIcon size={18} className={activeCity === city.name ? 'text-red-500' : 'text-gray-400'} />
                  <span className="text-xs font-black">{city.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${
                    city.status === 'active' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
                  }`}>
                    {city.status === 'active' ? 'نشط' : 'معطل'}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCityStatus(city.id);
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${
                      activeCity === city.name ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <Power size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regions Management */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-[40px] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-sm font-black text-gray-800">المناطق والأحياء في {activeCity}</h4>
                <p className="text-[10px] font-bold text-gray-400 mt-1">إدارة النطاق الجغرافي لظهور المتاجر والخدمات</p>
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newRegionName}
                  onChange={(e) => setNewRegionName(e.target.value)}
                  placeholder="اسم المنطقة..."
                  className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-[10px] font-bold outline-none focus:ring-2 focus:ring-red-100"
                />
                <button 
                  onClick={handleAddRegion}
                  className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2"
                >
                  <Plus size={14} />
                  إضافة منطقة
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {egyptData.find(c => c.name === activeCity)?.regions.map((region, idx) => (
                <div key={idx} className="group relative p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-red-200 transition-all">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-xs font-black text-gray-700">{region}</span>
                  </div>
                  <button className="absolute top-2 left-2 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                    <XCircle size={12} />
                  </button>
                </div>
              ))}
              {egyptData.find(c => c.name === activeCity)?.regions.length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <Navigation size={32} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-[10px] font-bold text-gray-400">لا توجد مناطق مضافة لهذه المدينة بعد</p>
                </div>
              )}
            </div>
          </div>

          {/* Visibility Rules */}
          <div className="bg-slate-900 p-6 rounded-[40px] text-white">
            <h4 className="text-sm font-black mb-4 flex items-center gap-2">
              <Shield size={18} className="text-red-500" />
              قواعد الظهور الجغرافي (Geofencing)
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <div>
                  <p className="text-xs font-black">نظام "طلبات" (الفريش مارت)</p>
                  <p className="text-[9px] font-bold text-slate-400">إظهار المتاجر في نفس المنطقة فقط</p>
                </div>
                <div className="w-10 h-5 bg-red-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <div>
                  <p className="text-xs font-black">نظام "الميركاتو" (القومي)</p>
                  <p className="text-[9px] font-bold text-slate-400">إظهار المنتجات على مستوى مصر كلها</p>
                </div>
                <div className="w-10 h-5 bg-slate-700 rounded-full relative">
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <div>
                  <p className="text-xs font-black">نظام "وصلني" (الذكي)</p>
                  <p className="text-[9px] font-bold text-slate-400">البحث عن أقرب سائق متاح جغرافياً</p>
                </div>
                <div className="w-10 h-5 bg-red-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminAnalyticsTab() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-black text-gray-800 mb-2">التحليلات والإحصائيات</h3>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'زيارات اليوم', value: '1,250', change: '+12%', color: 'text-blue-600' },
          { label: 'مستخدمين جدد', value: '45', change: '+5%', color: 'text-emerald-600' },
          { label: 'إجمالي المبيعات', value: '15,400 ج.م', change: '+8%', color: 'text-orange-600' },
          { label: 'معدل الارتداد', value: '24%', change: '-2%', color: 'text-red-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-[9px] font-bold text-gray-400">{stat.label}</p>
            <div className="flex items-end justify-between mt-1">
              <p className={`text-sm font-black ${stat.color}`}>{stat.value}</p>
              <span className="text-[8px] font-black text-emerald-500">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white p-5 rounded-[32px] border border-gray-100 h-48 flex items-center justify-center">
        <div className="text-center">
          <TrendingUp size={32} className="mx-auto text-gray-200 mb-2" />
          <p className="text-[10px] font-bold text-gray-400">رسم بياني تفاعلي (قريباً)</p>
        </div>
      </div>
    </div>
  );
}

function AdminReportsTab() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-black text-gray-800">التقارير الدورية</h3>
        <button className="text-[10px] font-black text-red-600">توليد تقرير جديد</button>
      </div>
      <div className="space-y-2">
        {[
          { title: 'تقرير المبيعات الشهري', date: 'مارس 2026', size: '2.4 MB' },
          { title: 'تقرير أداء الموظفين', date: 'فبراير 2026', size: '1.8 MB' },
          { title: 'تقرير نمو المستخدمين', date: 'الربع الأول 2026', size: '4.2 MB' },
          { title: 'تقرير البلاغات والمحتوى', date: 'مارس 2026', size: '1.1 MB' },
        ].map((report, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                <FileBarChart size={20} />
              </div>
              <div>
                <h4 className="text-xs font-black text-gray-800">{report.title}</h4>
                <p className="text-[9px] font-bold text-gray-400">{report.date} • {report.size}</p>
              </div>
            </div>
            <button className="p-2 bg-gray-50 text-gray-400 rounded-lg">
              <Download size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminMessagesTab() {
  const [activeSupportTab, setActiveSupportTab] = useState('customer');
  const { chats, loading: chatsLoading } = useChat();
  const { profiles } = useUser();

  const supportTabs = [
    { id: 'customer', label: 'خدمة العملاء (العملاء)', icon: MessageCircle, supportId: SUPPORT_USER_IDS.CUSTOMER },
    { id: 'cards', label: 'دعم الكروت (النقاط)', icon: Coins, supportId: SUPPORT_USER_IDS.CARDS },
    { id: 'mercato', label: 'دعم التجار (ميركاتو)', icon: Store, supportId: SUPPORT_USER_IDS.MERCATO },
    { id: 'assisto', label: 'دعم مقدمي الخدمات (اسيستو)', icon: Briefcase, supportId: SUPPORT_USER_IDS.ASSISTO },
    { id: 'freshmart', label: 'دعم التجار (فريش مارت)', icon: Utensils, supportId: SUPPORT_USER_IDS.FRESHMART },
    { id: 'deals', label: 'دعم مقدمي ديلز', icon: Handshake, supportId: SUPPORT_USER_IDS.DEALS },
    { id: 'wasalny', label: 'دعم السائقين (وصلنى)', icon: Car, supportId: SUPPORT_USER_IDS.WASALNY },
  ];

  const currentSupportId = supportTabs.find(t => t.id === activeSupportTab)?.supportId;
  
  const filteredChats = chats.filter(chat => 
    chat.participants.includes(currentSupportId || '')
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {supportTabs.map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveSupportTab(tab.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 ${
              activeSupportTab === tab.id 
                ? 'bg-red-600 text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">الرسائل الواردة - {supportTabs.find(t => t.id === activeSupportTab)?.label}</p>
          <span className="bg-red-100 text-red-600 text-[9px] font-black px-2 py-0.5 rounded-full">{filteredChats.length} محادثة</span>
        </div>
        
        {chatsLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xs font-bold text-gray-400">جاري تحميل الرسائل...</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="p-12 text-center">
            <MessageCircle size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-xs font-bold text-gray-400">لا توجد رسائل في هذا القسم حالياً</p>
          </div>
        ) : (
          filteredChats.map(chat => {
            const otherParticipantId = chat.participants.find(p => !Object.values(SUPPORT_USER_IDS).includes(p as any));
            const otherParticipant = profiles.find(p => p.uid === otherParticipantId);
            
            return (
              <div key={chat.id} className="p-4 flex items-center justify-between border-b border-gray-50 last:border-none hover:bg-gray-50 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src={otherParticipant?.avatar || `https://picsum.photos/seed/${otherParticipantId}/100/100`} 
                      alt="User" 
                      className="w-12 h-12 rounded-2xl object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-900">{otherParticipant?.name || 'مستخدم غير معروف'}</h4>
                    <p className="text-[11px] text-gray-500 font-bold truncate max-w-[150px]">{chat.lastMessage || 'بدء محادثة جديدة'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-bold">
                    {chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                  <button 
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('open-support-chat', { 
                        detail: { userId: otherParticipantId, userName: otherParticipant?.name, chatId: chat.id } 
                      }));
                    }}
                    className="mt-1 text-[10px] font-black text-red-600 hover:underline"
                  >
                    رد الآن
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function AdminUsersTab() {
  const { profiles } = useUser();
  const [activeSubTab, setActiveSubTab] = useState('customers');
  const [searchQuery, setSearchQuery] = useState('');

  const userSubTabs = [
    { id: 'customers', label: 'العملاء', icon: User, mode: 'user' },
    { id: 'merchants', label: 'تجار ميركاتو', icon: Store, mode: 'merchant' },
    { id: 'providers', label: 'مقدمي خدمات اسيستو', icon: Briefcase, mode: 'provider' },
    { id: 'deals', label: 'مديري صفقات ديلز', icon: Handshake, mode: 'deal_manager' },
    { id: 'drivers', label: 'سائقين وصلنى', icon: Car, mode: 'driver' },
    { id: 'agents', label: 'وكلاء فريش مارت', icon: Utensils, mode: 'restaurant' },
  ];

  const filteredUsers = profiles.filter(p => {
    const matchesMode = p.mode === userSubTabs.find(t => t.id === activeSubTab)?.mode;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMode && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {userSubTabs.map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveSubTab(tab.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 border ${
              activeSubTab === tab.id 
                ? 'bg-red-600 text-white border-red-600 shadow-md' 
                : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`البحث في ${userSubTabs.find(t => t.id === activeSubTab)?.label}...`} 
          className="w-full bg-white border border-gray-100 rounded-2xl py-3 pr-12 pl-4 text-sm font-medium shadow-sm outline-none"
        />
      </div>

      {/* User List */}
      <div className="space-y-3">
        {filteredUsers.map(user => (
          <UserManagementCard key={user.id} user={user} type={activeSubTab} />
        ))}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-[32px] border border-dashed border-gray-100">
            <UsersIcon size={48} className="mx-auto text-gray-100 mb-2" />
            <p className="text-xs font-bold text-gray-400">لا يوجد مستخدمين في هذا القسم حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
}

function UserManagementCard({ user, type }: { user: UserProfile, type: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { updateProfileDetails } = useUser();

  return (
    <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={user.avatar || `https://picsum.photos/seed/${user.id}/100/100`} alt="" className="w-12 h-12 rounded-2xl object-cover" referrerPolicy="no-referrer" />
          <div>
            <h4 className="text-sm font-black text-gray-800">{user.name}</h4>
            <p className="text-[10px] font-bold text-gray-400">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <button className="p-2 bg-gray-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all">
            <Edit2 size={18} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4 border-t border-gray-50 pt-4"
          >
            {/* Specific details based on type */}
            {type === 'customers' && (
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-blue-50 p-3 rounded-2xl text-center">
                  <p className="text-[9px] font-bold text-blue-400 mb-1">النقاط</p>
                  <p className="text-xs font-black text-blue-600">{user.points || 0}</p>
                </div>
                <div className="bg-emerald-50 p-3 rounded-2xl text-center">
                  <p className="text-[9px] font-bold text-emerald-400 mb-1">الاشتراكات</p>
                  <p className="text-xs font-black text-emerald-600">3 نشطة</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-2xl text-center">
                  <p className="text-[9px] font-bold text-purple-400 mb-1">الطلبات</p>
                  <p className="text-xs font-black text-purple-600">12 طلب</p>
                </div>
              </div>
            )}

            {(type === 'merchants' || type === 'agents') && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <p className="text-[9px] font-bold text-gray-400">الملف الضريبي</p>
                    <div className="flex items-center gap-2 mt-1">
                      <FileText size={14} className="text-gray-400" />
                      <span className="text-[10px] font-black text-gray-700">tax_file_2024.pdf</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <p className="text-[9px] font-bold text-gray-400">مواعيد العمل</p>
                    <p className="text-[10px] font-black text-gray-700 mt-1">09:00 ص - 11:00 م</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <p className="text-[9px] font-bold text-gray-400">العمولة / الاشتراك</p>
                    <p className="text-[10px] font-black text-emerald-600 mt-1">10% عمولة مبيعات</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <p className="text-[9px] font-bold text-gray-400">نظام التعاقد</p>
                    <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full mt-1 inline-block">عقد ساري</span>
                  </div>
                </div>
                <div className="bg-amber-50 p-3 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-black text-amber-700">تقييم المتجر</span>
                  </div>
                  <span className="text-xs font-black text-amber-700">4.8 / 5.0</span>
                </div>
              </div>
            )}

            {type === 'providers' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <p className="text-[9px] font-bold text-gray-400">التخصصات</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="text-[8px] font-black bg-white px-1.5 py-0.5 rounded-md border border-gray-100">سباكة</span>
                      <span className="text-[8px] font-black bg-white px-1.5 py-0.5 rounded-md border border-gray-100">كهرباء</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <p className="text-[9px] font-bold text-gray-400">صورة البطاقة</p>
                    <div className="flex items-center gap-2 mt-1">
                      <ImageIcon size={14} className="text-blue-500" />
                      <span className="text-[10px] font-black text-blue-600 cursor-pointer">عرض المستند</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <p className="text-[9px] font-bold text-gray-400">الاشتراك الشهري</p>
                    <p className="text-[10px] font-black text-blue-600 mt-1">250 ج.م / شهر</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <p className="text-[9px] font-bold text-gray-400">التعاقد</p>
                    <span className="text-[9px] font-black px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full mt-1 inline-block">قيد المراجعة</span>
                  </div>
                </div>
                <div className="bg-emerald-50 p-3 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-700">تقييم الأداء</span>
                  </div>
                  <span className="text-xs font-black text-emerald-700">95% ممتاز</span>
                </div>
              </div>
            )}

            {type === 'deals' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <p className="text-[9px] font-bold text-gray-400">إدارة الملفات</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Database size={14} className="text-purple-500" />
                      <span className="text-[10px] font-black text-purple-600">8 ملفات نشطة</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <p className="text-[9px] font-bold text-gray-400">تتبع الأداء</p>
                    <div className="flex items-center gap-2 mt-1">
                      <TrendingUp size={14} className="text-emerald-500" />
                      <span className="text-[10px] font-black text-emerald-600">+15% نمو</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <p className="text-[9px] font-bold text-gray-400">نظام العمولة</p>
                    <p className="text-[10px] font-black text-gray-700 mt-1">5% من كل صفقة</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <p className="text-[9px] font-bold text-gray-400">العقد</p>
                    <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full mt-1 inline-block">موثق</span>
                  </div>
                </div>
              </div>
            )}

            {type === 'drivers' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <p className="text-[9px] font-bold text-gray-400">فئة المركبة</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Car size={14} className="text-orange-500" />
                      <span className="text-[10px] font-black text-gray-700">سيارة ملاكي</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <p className="text-[9px] font-bold text-gray-400">مراجعة الرخص</p>
                    <div className="flex items-center gap-2 mt-1">
                      <ShieldCheck size={14} className="text-emerald-500" />
                      <span className="text-[10px] font-black text-emerald-600">صالحة حتى 2027</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <p className="text-[9px] font-bold text-gray-400">نظام العمل</p>
                    <p className="text-[10px] font-black text-gray-700 mt-1">دوام كامل (Full-time)</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <p className="text-[9px] font-bold text-gray-400">الاشتراك</p>
                    <p className="text-[10px] font-black text-orange-600 mt-1">150 ج.م / أسبوع</p>
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ThumbsUp size={14} className="text-blue-500" />
                    <span className="text-[10px] font-black text-blue-700">تقييم الركاب</span>
                  </div>
                  <span className="text-xs font-black text-blue-700">4.9 / 5.0</span>
                </div>
              </div>
            )}

            {/* Page Settings Toggle */}
            <div className="mt-4 pt-4 border-t border-gray-50 space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Layout size={14} className="text-slate-600" />
                  <span className="text-[10px] font-black text-slate-700">تفعيل كصفحة (Page)</span>
                </div>
                <button 
                  onClick={async () => {
                    await updateProfileDetails(user.id, { isPage: !user.isPage });
                  }}
                  className={`w-10 h-5 rounded-full transition-all relative ${user.isPage ? 'bg-emerald-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${user.isPage ? 'right-1' : 'right-6'}`} />
                </button>
              </div>

              {user.isPage && (
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-400 px-1">نوع الصفحة (Mode)</label>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'merchant', label: 'تاجر' },
                      { id: 'restaurant', label: 'وكيل' },
                      { id: 'provider', label: 'خدمات' },
                      { id: 'driver', label: 'سائق' },
                      { id: 'deal_manager', label: 'صفقات' },
                      { id: 'user', label: 'عميل' }
                    ].map(m => (
                      <button
                        key={m.id}
                        onClick={async () => {
                          await updateProfileDetails(user.id, { mode: m.id as any });
                        }}
                        className={`py-1.5 rounded-lg text-[8px] font-black border transition-all ${
                          user.mode === m.id 
                            ? 'bg-red-600 text-white border-red-600' 
                            : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AdminContentTab() {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-black text-gray-800 mb-2">بلاغات المحتوى</h3>
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flag size={14} className="text-red-500" />
              <span className="text-[10px] font-black text-red-600">محتوى غير لائق</span>
            </div>
            <span className="text-[10px] font-bold text-gray-400">منذ 15 دقيقة</span>
          </div>
          <p className="text-xs text-gray-600 font-medium">تم الإبلاغ عن منشور يحتوي على معلومات مضللة في قسم الميركاتو.</p>
          <div className="flex gap-2 pt-2">
            <button className="flex-1 py-2 bg-red-600 text-white text-[10px] font-black rounded-lg">حذف المحتوى</button>
            <button className="flex-1 py-2 bg-gray-100 text-gray-600 text-[10px] font-black rounded-lg">تجاهل البلاغ</button>
          </div>
        </div>
      ))}
    </div>
  );
}


function LocalAdminAccountingTab() {
  const [activeMainTab, setActiveMainTab] = useState('commissions');
  const [activeUserType, setActiveUserType] = useState('merchants');
  
  const mainTabs = [
    { id: 'commissions', label: 'عمولات التطبيق', icon: Percent },
    { id: 'subscriptions', label: 'اشتراكات التطبيق', icon: Package },
    { id: 'wallets', label: 'المحافظ المالية', icon: Wallet },
  ];

  const userTypes = [
    { id: 'merchants', label: 'الميركاتو', icon: Store },
    { id: 'providers', label: 'الاسيستو', icon: Briefcase },
    { id: 'deals', label: 'الديلز', icon: Handshake },
    { id: 'agents', label: 'فريش مارت', icon: Utensils },
    { id: 'drivers', label: 'وصلنى', icon: Car },
  ];

  return (
    <div className="space-y-6">
      {/* Main Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-2xl">
        {mainTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveMainTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black transition-all ${
              activeMainTab === tab.id
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {(activeMainTab === 'commissions' || activeMainTab === 'subscriptions' || activeMainTab === 'wallets') && (
        <div className="space-y-4">
          {/* User Type Sub-tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {userTypes.map(type => (
              <button 
                key={type.id} 
                onClick={() => setActiveUserType(type.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 border ${
                  activeUserType === type.id 
                    ? 'bg-red-600 text-white border-red-600 shadow-md' 
                    : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'
                }`}
              >
                <type.icon size={14} />
                {type.label}
              </button>
            ))}
          </div>

          {activeMainTab === 'subscriptions' && (
            <div className="space-y-4">
              {/* Packages System */}
              <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-sm font-black text-gray-800">باقات الاشتراك - {userTypes.find(t => t.id === activeUserType)?.label}</h4>
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-[9px] font-black">
                    <Plus size={12} />
                    إضافة باقة
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: 'الباقة الأساسية', price: '200', features: ['عمولة 10%', 'دعم فني 24/7', 'تقارير أساسية'] },
                    { name: 'الباقة المتقدمة', price: '500', features: ['عمولة 7%', 'أولوية في الظهور', 'تقارير متقدمة'] },
                    { name: 'الباقة الاحترافية', price: '1000', features: ['عمولة 5%', 'مدير حساب خاص', 'تحليلات ذكية'] },
                  ].map((pkg, idx) => (
                    <div key={idx} className="p-4 rounded-3xl border border-gray-100 bg-gray-50/50 space-y-3 relative overflow-hidden">
                      {idx === 1 && <div className="absolute top-0 left-0 right-0 h-1 bg-red-600"></div>}
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="text-xs font-black text-gray-800">{pkg.name}</h5>
                          <p className="text-lg font-black text-red-600 mt-1">{pkg.price} <span className="text-[10px] text-gray-400">ج.م/شهر</span></p>
                        </div>
                        <Package size={20} className="text-gray-300" />
                      </div>
                      <ul className="space-y-2">
                        {pkg.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-[9px] font-bold text-gray-500">
                            <CheckCircle2 size={12} className="text-emerald-500" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <button className="w-full py-2 bg-white border border-gray-200 text-[10px] font-black text-gray-600 rounded-xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-all">
                        تعديل الباقة
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeMainTab === 'commissions' && (
            <div className="space-y-4">
              {/* Commission Settings */}
              <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                <h4 className="text-sm font-black text-gray-800 mb-4">إعدادات العمولات المخصصة</h4>
                <div className="space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 border border-gray-100">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-800">مستخدم {i}</p>
                          <p className="text-[9px] font-bold text-gray-400">عمولة مخصصة لهذا المستخدم</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <input type="text" defaultValue="8" className="w-16 bg-white border border-gray-200 rounded-xl py-2 pr-3 pl-6 text-xs font-black text-center" />
                          <Percent size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                        <button className="p-2 bg-red-600 text-white rounded-xl shadow-sm"><CheckSquare size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeMainTab === 'wallets' && (
            <div className="space-y-4">
              {/* Wallets Overview */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm text-center">
                  <p className="text-[9px] font-bold text-gray-400 mb-1">إجمالي الأرصدة</p>
                  <p className="text-sm font-black text-gray-800">150,000 ج.م</p>
                </div>
                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm text-center">
                  <p className="text-[9px] font-bold text-gray-400 mb-1">طلبات السحب</p>
                  <p className="text-sm font-black text-orange-600">12 طلب</p>
                </div>
                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm text-center">
                  <p className="text-[9px] font-bold text-gray-400 mb-1">عمليات اليوم</p>
                  <p className="text-sm font-black text-emerald-600">45 عملية</p>
                </div>
              </div>

              {/* User Wallets List */}
              <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <h4 className="text-xs font-black text-gray-800">أرصدة {userTypes.find(t => t.id === activeUserType)?.label}</h4>
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input type="text" placeholder="بحث..." className="bg-white border border-gray-200 rounded-lg py-1 pr-8 pl-3 text-[10px] font-medium outline-none w-32" />
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <img src={`https://picsum.photos/seed/wallet${i}/100/100`} alt="" className="w-10 h-10 rounded-xl object-cover" referrerPolicy="no-referrer" />
                        <div>
                          <p className="text-xs font-black text-gray-800">مستخدم {i}</p>
                          <p className="text-[9px] font-bold text-gray-400">آخر حركة: منذ {i} ساعة</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-gray-900">2,450.00 ج.م</p>
                        <div className="flex items-center gap-1 justify-end mt-0.5">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                          <span className="text-[8px] font-bold text-gray-400">نشط</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-gray-50 text-center">
                  <button className="text-[10px] font-black text-red-600">عرض الكل</button>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-black text-gray-800">آخر الحركات المالية</h4>
                  <History size={18} className="text-gray-300" />
                </div>
                <div className="space-y-3">
                  {[
                    { type: 'deposit', label: 'إيداع رصيد', amount: '+500', user: 'أحمد محمد', time: '10:30 ص' },
                    { type: 'withdraw', label: 'طلب سحب', amount: '-1200', user: 'سارة علي', time: '09:15 ص' },
                    { type: 'commission', label: 'عمولة مبيعات', amount: '+45', user: 'متجر ميركاتو', time: 'أمس' },
                  ].map((tx, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          tx.type === 'withdraw' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {tx.type === 'withdraw' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-800">{tx.label}</p>
                          <p className="text-[8px] font-bold text-gray-400">{tx.user} • {tx.time}</p>
                        </div>
                      </div>
                      <p className={`text-xs font-black ${
                        tx.type === 'withdraw' ? 'text-red-600' : 'text-emerald-600'
                      }`}>{tx.amount} ج.م</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AdminHRTab() {
  const [activeSubTab, setActiveSubTab] = useState('employees');
  
  const hrSubTabs = [
    { id: 'employees', label: 'الموظفين', icon: UsersIcon },
    { id: 'structure', label: 'الهيكل التنظيمي', icon: Layout },
    { id: 'shifts', label: 'الشيفتات', icon: Clock },
    { id: 'attendance', label: 'الحضور', icon: FileCheck },
    { id: 'payroll', label: 'الرواتب', icon: DollarSign },
    { id: 'requests', label: 'الطلبات', icon: MessageSquare },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {hrSubTabs.map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveSubTab(tab.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 ${
              activeSubTab === tab.id 
                ? 'bg-red-600 text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {activeSubTab === 'employees' && (
          <>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-black text-gray-800">قائمة الموظفين</h3>
              <button className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-[9px] font-black">
                <UserPlus size={12} />
                إضافة موظف
              </button>
            </div>
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                    <User size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-900">موظف {i}</h4>
                    <p className="text-[10px] text-gray-400 font-bold">مدير مبيعات - قسم الميركاتو</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-gray-50 text-gray-400 rounded-xl"><Edit2 size={14} /></button>
                  <button className="p-2 bg-gray-50 text-gray-400 rounded-xl"><Eye size={14} /></button>
                </div>
              </div>
            ))}
          </>
        )}

        {activeSubTab === 'structure' && (
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 text-center">
            <Layout size={48} className="mx-auto text-gray-100 mb-4" />
            <h4 className="text-sm font-black text-gray-800 mb-2">الهيكل التنظيمي</h4>
            <p className="text-[10px] font-bold text-gray-400 mb-6">إدارة الأقسام والصفحات والمستويات الوظيفية</p>
            <div className="space-y-3 text-right">
              {['الإدارة العليا', 'قسم الميركاتو', 'قسم الاسيستو', 'قسم الديلز', 'قسم الفريش مارت', 'قسم التوصيل'].map((dept, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-2xl flex items-center justify-between">
                  <span className="text-xs font-black text-gray-700">{dept}</span>
                  <button className="text-[10px] font-black text-red-600">تعديل</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'shifts' && (
          <div className="space-y-3">
             <div className="bg-white p-5 rounded-[32px] border border-gray-100">
              <h4 className="text-sm font-black text-gray-800 mb-4">ضبط الشفتات</h4>
              <div className="space-y-4">
                {[
                  { name: 'شفت صباحي', time: '08:00 AM - 04:00 PM', employees: 12 },
                  { name: 'شفت مسائي', time: '04:00 PM - 12:00 AM', employees: 8 },
                  { name: 'شفت ليلي', time: '12:00 AM - 08:00 AM', employees: 5 },
                ].map((shift, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                    <div>
                      <p className="text-xs font-black text-gray-800">{shift.name}</p>
                      <p className="text-[9px] font-bold text-gray-400">{shift.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-red-600">{shift.employees} موظف</p>
                      <button className="text-[8px] font-black text-gray-400 underline">تعديل</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'attendance' && (
          <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h4 className="text-xs font-black text-gray-800">سجل الحضور اليوم</h4>
              <span className="text-[10px] font-bold text-gray-400">2 أبريل 2026</span>
            </div>
            <div className="divide-y divide-gray-50">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
                    <div>
                      <p className="text-xs font-black text-gray-800">موظف {i}</p>
                      <p className="text-[9px] font-bold text-gray-400">حضور: 08:05 AM</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-600 text-[8px] font-black rounded-lg">منتظم</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'payroll' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-3xl border border-gray-100">
                <p className="text-[9px] font-bold text-gray-400">إجمالي الرواتب</p>
                <p className="text-sm font-black text-gray-800">45,000 ج.م</p>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-gray-100">
                <p className="text-[9px] font-bold text-gray-400">السلف المعلقة</p>
                <p className="text-sm font-black text-red-600">2,500 ج.م</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-[32px] border border-gray-100">
              <h4 className="text-sm font-black text-gray-800 mb-4">إدارة الرواتب والعقود</h4>
              <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <DollarSign size={14} />
                      </div>
                      <span className="text-xs font-black text-gray-700">كشف رواتب شهر أبريل</span>
                    </div>
                    <ChevronLeft size={16} className="text-gray-300 group-hover:text-gray-600 transition-all" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <FileCheck size={14} />
                      </div>
                      <span className="text-xs font-black text-gray-700">إدارة عقود الموظفين</span>
                    </div>
                    <ChevronLeft size={16} className="text-gray-300 group-hover:text-gray-600 transition-all" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all">
                        <TrendingUp size={14} />
                      </div>
                      <span className="text-xs font-black text-gray-700">إدارة السلف والمكافآت</span>
                    </div>
                    <ChevronLeft size={16} className="text-gray-300 group-hover:text-gray-600 transition-all" />
                  </button>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'requests' && (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
                    <div>
                      <p className="text-xs font-black text-gray-800">موظف {i}</p>
                      <p className="text-[9px] font-bold text-gray-400">طلب إجازة سنوية</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-gray-400">منذ ساعتين</span>
                </div>
                <p className="text-[10px] text-gray-600 font-bold bg-gray-50 p-3 rounded-xl">أرغب في الحصول على إجازة لمدة 3 أيام ابتداءً من الأسبوع القادم لظروف عائلية.</p>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-emerald-500 text-white text-[10px] font-black rounded-lg">موافقة</button>
                  <button className="flex-1 py-2 bg-red-500 text-white text-[10px] font-black rounded-lg">رفض</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LocalAdminSubscriptionsTab() {
  const subTabs = [
    { id: 'mercato', label: 'الميركاتو', icon: Store },
    { id: 'assisto', label: 'الاسيستو', icon: Wrench },
    { id: 'freshmart', label: 'فريش مارت', icon: Utensils },
    { id: 'wasalny', label: 'وصلنى', icon: Car },
  ];
  const [activeTab, setActiveTab] = useState('mercato');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h3 className="text-sm font-black text-gray-800">إدارة الاشتراكات</h3>
          <p className="text-[10px] font-bold text-gray-400">تحكم في باقات وخطط المشتركين</p>
        </div>
        <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-2xl text-xs font-black shadow-lg shadow-red-100 active:scale-95 transition-all">
          <Plus size={16} />
          <span>إضافة باقة جديدة</span>
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {subTabs.map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 ${
              activeTab === tab.id 
                ? 'bg-red-600 text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <div className="bg-white p-5 rounded-[32px] border border-gray-100">
          <h4 className="text-sm font-black text-gray-800 mb-4">إدارة اشتراكات {subTabs.find(t => t.id === activeTab)?.label}</h4>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400">
                    <UsersIcon size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-800">عميل {i}</p>
                    <p className="text-[9px] font-bold text-gray-400">ينتهي في: 15 مايو 2026</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-600 text-[8px] font-black rounded-lg">نشط</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LocalAdminCouponsTab() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h3 className="text-sm font-black text-gray-800">إدارة الكوبونات</h3>
          <p className="text-[10px] font-bold text-gray-400">إنشاء وتعديل أكواد الخصم</p>
        </div>
        <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-2xl text-xs font-black shadow-lg shadow-red-100 active:scale-95 transition-all">
          <Ticket size={16} />
          <span>إنشاء كوبون جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {[
          { code: 'SAVE20', discount: '20%', status: 'نشط', uses: 145 },
          { code: 'WELCOME', discount: '50 ج.م', status: 'نشط', uses: 890 },
          { code: 'RAMADAN', discount: '15%', status: 'منتهي', uses: 2300 },
        ].map((coupon, idx) => (
          <div key={idx} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                <Percent size={24} />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900">{coupon.code}</h4>
                <p className="text-[10px] text-gray-400 font-bold">خصم {coupon.discount} • {coupon.uses} استخدام</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`px-2 py-1 rounded-lg text-[8px] font-black ${coupon.status === 'نشط' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                {coupon.status}
              </span>
              <div className="mt-2 flex gap-1">
                <button className="p-1.5 bg-gray-50 text-gray-400 rounded-lg"><Edit2 size={12} /></button>
                <button className="p-1.5 bg-gray-50 text-gray-400 rounded-lg"><XCircle size={12} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LocalAdminPointsTab() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h3 className="text-sm font-black text-gray-800">إدارة النقاط</h3>
          <p className="text-[10px] font-bold text-gray-400">التحكم في نظام الولاء والمكافآت</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2.5 rounded-2xl text-xs font-black shadow-lg shadow-amber-100 active:scale-95 transition-all">
            <Plus size={16} />
            <span>إضافة نقاط لعميل</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-3xl border border-gray-100">
          <p className="text-[9px] font-bold text-gray-400">إجمالي النقاط الموزعة</p>
          <p className="text-sm font-black text-amber-600">1,250,000 نقطة</p>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-gray-100">
          <p className="text-[9px] font-bold text-gray-400">النقاط المستبدلة</p>
          <p className="text-sm font-black text-gray-800">450,000 نقطة</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-[32px] border border-gray-100">
        <h4 className="text-sm font-black text-gray-800 mb-4">إعدادات نظام النقاط</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
            <span className="text-xs font-bold text-gray-700">قيمة النقطة (ج.م)</span>
            <input type="text" defaultValue="0.01" className="w-16 bg-white border border-gray-200 rounded-lg py-1 text-center text-[10px] font-black" />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
            <span className="text-xs font-bold text-gray-700">نقاط التسجيل الجديد</span>
            <input type="text" defaultValue="100" className="w-16 bg-white border border-gray-200 rounded-lg py-1 text-center text-[10px] font-black" />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
            <span className="text-xs font-bold text-gray-700">نقاط لكل 100 ج.م شراء</span>
            <input type="text" defaultValue="10" className="w-16 bg-white border border-gray-200 rounded-lg py-1 text-center text-[10px] font-black" />
          </div>
          <button className="w-full py-3 bg-red-600 text-white text-xs font-black rounded-2xl shadow-lg shadow-red-100">
            حفظ التغييرات
          </button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-[32px] border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-black text-gray-800">إدارة كروت النقاط</h4>
          <button className="p-2 bg-gray-50 text-red-600 rounded-xl hover:bg-red-50 transition-colors">
            <Plus size={16} />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {[
            { name: 'كارت البرونز', points: 5000, price: 50, color: 'bg-orange-500' },
            { name: 'كارت السيلفر', points: 12000, price: 100, color: 'bg-slate-500' },
            { name: 'كارت الجولد', points: 30000, price: 200, color: 'bg-amber-500' },
            { name: 'كارت البلاتينيوم', points: 80000, price: 500, color: 'bg-indigo-500' },
            { name: 'كارت الماسي', points: 200000, price: 1000, color: 'bg-cyan-500' },
          ].map((card, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-6 ${card.color} rounded-md shadow-sm`}></div>
                <div>
                  <p className="text-xs font-black text-gray-800">{card.name}</p>
                  <p className="text-[9px] font-bold text-gray-400">{card.points.toLocaleString()} نقطة • {card.price} ج.م</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-1.5 bg-white text-gray-400 rounded-lg border border-gray-100 hover:text-blue-600">
                  <Edit2 size={12} />
                </button>
                <button className="p-1.5 bg-white text-gray-400 rounded-lg border border-gray-100 hover:text-red-600">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-5 rounded-[32px] border border-gray-100">
        <h4 className="text-sm font-black text-gray-800 mb-4">هدايا استبدال النقاط</h4>
        <div className="space-y-3">
          {[
            { name: 'كوبون خصم 50 ج.م', points: 5000 },
            { name: 'شحن محفظة 100 ج.م', points: 10000 },
            { name: 'اشتراك بريميوم شهر', points: 15000 },
          ].map((gift, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-2">
                <Gift size={14} className="text-red-600" />
                <span className="text-xs font-black text-gray-700">{gift.name}</span>
              </div>
              <span className="text-[10px] font-black text-amber-600">{gift.points} نقطة</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminReviewsTab() {
  const { reviews, approveReview, rejectReview, loading } = useReviews();
  const [activeType, setActiveType] = useState('mercato');
  
  const reviewTypes = [
    { id: 'mercato', label: 'الميركاتو', icon: Store },
    { id: 'assisto', label: 'الاسيستو', icon: Briefcase },
    { id: 'deals', label: 'الديلز', icon: Handshake },
    { id: 'restaurants', label: 'فريش مارت', icon: Utensils },
    { id: 'driver', label: 'وصلنى', icon: Car },
  ];

  const filteredReviews = reviews.filter(r => r.source === activeType && r.status === 'pending');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-gray-400">جاري تحميل التقييمات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {reviewTypes.map(type => (
          <button 
            key={type.id} 
            onClick={() => setActiveType(type.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 border ${
              activeType === type.id 
                ? 'bg-red-600 text-white border-red-600 shadow-md' 
                : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'
            }`}
          >
            <type.icon size={14} />
            {type.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredReviews.length === 0 ? (
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <Star size={32} />
            </div>
            <p className="text-sm font-black text-gray-900 mb-1">لا توجد تقييمات معلقة</p>
            <p className="text-xs font-bold text-gray-400">كل التقييمات في هذا القسم تمت مراجعتها</p>
          </div>
        ) : (
          filteredReviews.map(review => (
            <div key={review.id} className="bg-white p-4 rounded-[32px] border border-gray-100 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <img src={review.userAvatar || `https://picsum.photos/seed/${review.userId}/100/100`} alt="" className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="text-xs font-black text-gray-900">{review.userName}</h4>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={10} className={s <= review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-[8px] font-bold text-gray-400">{new Date(review.createdAt).toLocaleDateString('ar-EG')}</span>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-600 leading-relaxed">
                  {review.content}
                </p>
              </div>

              <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 px-1">
                <div className="flex items-center gap-1">
                  <Store size={10} />
                  <span>{review.targetName || 'هدف المراجعة'}</span>
                </div>
                <span>•</span>
                <span>{review.targetType === 'profile' ? 'صفحة' : review.targetType === 'product' ? 'منتج' : 'منشور'}</span>
              </div>

              <div className="flex gap-2 pt-1">
                <button 
                  onClick={() => approveReview(review.id)}
                  className="flex-1 py-2 bg-emerald-500 text-white text-[10px] font-black rounded-xl shadow-lg shadow-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-1"
                >
                  <CheckCircle2 size={12} />
                  موافقة ونشر
                </button>
                <button 
                  onClick={() => rejectReview(review.id)}
                  className="flex-1 py-2 bg-red-500 text-white text-[10px] font-black rounded-xl shadow-lg shadow-red-100 active:scale-95 transition-all flex items-center justify-center gap-1"
                >
                  <XCircle size={12} />
                  رفض التقييم
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AdminDeliveryMgmtTab() {
  const { 
    deliveryCategories, 
    deliveryVehicles, 
    addDeliveryCategory, 
    updateDeliveryCategory, 
    deleteDeliveryCategory, 
    reorderDeliveryCategories,
    addDeliveryVehicle,
    updateDeliveryVehicle,
    deleteDeliveryVehicle,
    reorderDeliveryVehicles
  } = useSettings();

  const [activeSubTab, setActiveSubTab] = useState<'categories' | 'vehicles'>('categories');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', icon: 'Car' });

  const handleAdd = () => {
    if (activeSubTab === 'categories') {
      addDeliveryCategory({ ...formData, isActive: true });
    } else {
      addDeliveryVehicle({ ...formData, isActive: true });
    }
    setShowAddModal(false);
    setFormData({ name: '', icon: 'Car' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveSubTab('categories')}
            className={`px-6 py-2 rounded-2xl text-xs font-black transition-all ${activeSubTab === 'categories' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-gray-500 border border-gray-100'}`}
          >
            تصنيفات التوصيل
          </button>
          <button 
            onClick={() => setActiveSubTab('vehicles')}
            className={`px-6 py-2 rounded-2xl text-xs font-black transition-all ${activeSubTab === 'vehicles' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-gray-500 border border-gray-100'}`}
          >
            أنواع المركبات
          </button>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg shadow-red-100"
        >
          <Plus size={16} />
          إضافة جديد
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(activeSubTab === 'categories' ? deliveryCategories : deliveryVehicles)
          .sort((a, b) => a.order - b.order)
          .map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-600">
                {iconMap[item.icon] ? React.createElement(iconMap[item.icon], { size: 24 }) : <Grid size={24} />}
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900">{item.name}</h4>
                <p className="text-[10px] font-bold text-gray-400">الترتيب: {item.order + 1}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <button 
                onClick={() => activeSubTab === 'categories' ? reorderDeliveryCategories(item.id, 'up') : reorderDeliveryVehicles(item.id, 'up')}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                <ChevronUp size={14} />
              </button>
              <button 
                onClick={() => activeSubTab === 'categories' ? reorderDeliveryCategories(item.id, 'down') : reorderDeliveryVehicles(item.id, 'down')}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                <ChevronDown size={14} />
              </button>
              <button 
                onClick={() => activeSubTab === 'categories' ? deleteDeliveryCategory(item.id) : deleteDeliveryVehicle(item.id)}
                className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden"
          >
            <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
              <h3 className="text-lg font-black">إضافة {activeSubTab === 'categories' ? 'تصنيف' : 'مركبة'} جديد</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 mr-1">الاسم</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-red-500/20 transition-all text-right"
                  placeholder="أدخل الاسم هنا..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 mr-1">الأيقونة</label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-red-500/20 transition-all"
                >
                  {Object.keys(iconMap).map(icon => (
                    <option key={icon} value={icon}>{iconLabels[icon] || icon}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAdd}
                className="w-full bg-red-600 text-white py-4 rounded-2xl text-sm font-black shadow-lg shadow-red-100 hover:bg-red-700 transition-all active:scale-[0.98] mt-4"
              >
                حفظ البيانات
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function AdminNotificationsMgmtTab() {
  const [activeType, setActiveType] = useState('all');
  
  const userTypes = [
    { id: 'all', label: 'الكل', icon: UsersIcon },
    { id: 'customers', label: 'العملاء', icon: User },
    { id: 'merchants', label: 'التجار', icon: Store },
    { id: 'providers', label: 'الخدمات', icon: Briefcase },
    { id: 'deals', label: 'مديري الصفقات', icon: Handshake },
    { id: 'agents', label: 'وكلاء فريش مارت', icon: Utensils },
    { id: 'drivers', label: 'السائقين', icon: Car },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
            <BellRing size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900">إرسال تنبيه جديد</h3>
            <p className="text-[10px] font-bold text-gray-400">إرسال إشعارات فورية للمستخدمين</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-700 mr-2">الفئة المستهدفة</label>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {userTypes.map(type => (
                <button 
                  key={type.id} 
                  onClick={() => setActiveType(type.id)}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-[9px] font-black transition-all flex items-center gap-2 border ${
                    activeType === type.id 
                      ? 'bg-red-600 text-white border-red-600 shadow-md' 
                      : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'
                  }`}
                >
                  <type.icon size={12} />
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-700 mr-2">عنوان التنبيه</label>
            <input 
              type="text" 
              placeholder="مثال: عرض خاص لفترة محدودة!" 
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-red-100 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-700 mr-2">محتوى التنبيه</label>
            <textarea 
              placeholder="اكتب نص الإشعار هنا..." 
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-red-100 transition-all h-24 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-700 mr-2">رابط التوجيه (اختياري)</label>
              <input 
                type="text" 
                placeholder="/offers" 
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-red-100 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-700 mr-2">أيقونة التنبيه</label>
              <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-red-100 transition-all appearance-none">
                <option>تنبيه عام 🔔</option>
                <option>عرض خصم 🎁</option>
                <option>تحديث نظام ⚙️</option>
                <option>رسالة إدارية ✉️</option>
              </select>
            </div>
          </div>

          <button className="w-full py-4 bg-red-600 text-white text-xs font-black rounded-2xl shadow-lg shadow-red-100 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2 group">
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            إرسال الإشعار الآن
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-sm font-black text-gray-800">سجل الإشعارات المرسلة</h4>
          <History size={18} className="text-gray-300" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-600 border border-gray-100">
                  <BellRing size={18} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-800">تحديث شروط الخدمة</p>
                  <p className="text-[9px] font-bold text-gray-400">تم الإرسال لـ: {i === 1 ? 'الكل' : 'التجار'} • منذ {i * 2} ساعة</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">تم التسليم</span>
                <p className="text-[8px] font-bold text-gray-400 mt-1">1.2k مستلم</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
