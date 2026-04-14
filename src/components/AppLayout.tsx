import React, { useState } from 'react';
import { 
  Home, 
  Store, 
  Zap, 
  Utensils, 
  User, 
  Bell, 
  MessageCircle, 
  Search as SearchIcon,
  ShoppingCart,
  Menu,
  Rocket,
  Handshake,
  Car,
  Phone,
  MapPin,
  X,
  Download,
  ChevronRight,
  ArrowRight,
  FileText,
  Layout,
  MessageSquare,
  Users,
  AlertTriangle,
  Settings,
  RefreshCw,
  Star,
  Briefcase,
  User as UserIcon,
  Store as StoreIcon,
  DollarSign,
  Ticket,
  Gift,
  ClipboardCheck,
  LayoutDashboard
} from 'lucide-react';

const DriverCallIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
  >
    {/* Car Body */}
    <path d="M20,60 L25,40 C27,32 35,28 50,28 C65,28 73,32 75,40 L80,60 L20,60 Z" />
    <rect x="15" y="60" width="70" height="20" rx="6" />
    {/* Headlights */}
    <circle cx="28" cy="70" r="6" fill="white" fillOpacity="0.9" />
    <circle cx="72" cy="70" r="6" fill="white" fillOpacity="0.9" />
    {/* Windshield */}
    <path d="M30,35 L70,35 L73,53 L27,53 Z" fill="white" fillOpacity="0.2" />
    {/* Wheels */}
    <rect x="22" y="80" width="12" height="8" rx="2" />
    <rect x="66" y="80" width="12" height="8" rx="2" />
  </svg>
);

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
import { EGYPT_CITIES } from '../locationData';
import MapPickerModal from './MapPickerModal';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useUser, UserMode } from '../context/UserContext';
import { usePosts } from '../context/PostContext';
import { useChat } from '../context/ChatContext';
import { SUPPORT_USER_IDS, SUPPORT_NAMES } from '../constants';
import { safeStringify } from '../lib/mapUtils';
import { syncStorage } from '../lib/storage';

// Pages (to be implemented)
import AvalonPage from '../pages/AvalonPage';
import MercatoPage from '../pages/MercatoPage';
import AssistoPage from '../pages/AssistoPage';
import DealsPage from '../pages/DealsPage';
import FreshMartPage from '../pages/FreshMartPage';
import DeliveryPage from '../pages/DeliveryPage';
import ProfilePage from '../pages/ProfilePage';
import SettingsPage from '../pages/SettingsPage';
import CartPage from '../pages/CartPage';
import NotificationsPage from '../pages/NotificationsPage';
import MessengerPage from '../pages/MessengerPage';
import SearchPage from '../pages/SearchPage';
import MenuPage from '../pages/MenuPage';
import GroupsPage from '../pages/GroupsPage';
import PagesPage from '../pages/PagesPage';
import EventsPage from '../pages/EventsPage';
import MemoriesPage from '../pages/MemoriesPage';
import SavedPage from '../pages/SavedPage';
import JobsPage from '../pages/JobsPage';
import AdminPage from '../pages/AdminPage';
import CreatePostModal from '../components/CreatePostModal';

export default function AppLayout() {
  const { cartCount, pendingRestaurantItem, setPendingRestaurantItem, clearAndAddToRestaurantCart } = useCart();
  const { 
    userMode, 
    profiles, 
    activeProfileId, 
    switchProfile, 
    activeProfile, 
    updateUserLocation, 
    loading: userLoading,
    currentCity,
    currentRegion,
    setCurrentCity,
    setCurrentRegion
  } = useUser();
  const { loading: postsLoading } = usePosts();
  const { getOrCreateChat } = useChat();
  const [activeTab, setActiveTab] = useState(() => {
    const saved = syncStorage.get('app_active_tab');
    return saved || 'avalon';
  });
  const [profileTab, setProfileTab] = useState(() => {
    const saved = syncStorage.get('app_profile_tab');
    return saved || 'my-profile';
  });
  const [showCart, setShowCart] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessenger, setShowMessenger] = useState(false);
  const [messengerInitialUser, setMessengerInitialUser] = useState<any>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [tempLocation, setTempLocation] = useState(activeProfile.location);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);

  // Persistence
  React.useEffect(() => {
    syncStorage.set('app_active_tab', activeTab);
  }, [activeTab]);

  React.useEffect(() => {
    syncStorage.set('app_profile_tab', profileTab);
  }, [profileTab]);

  // Initialize history state
  React.useEffect(() => {
    if (!window.history.state) {
      window.history.replaceState({ type: 'tab', id: activeTab }, '');
    }
  }, []);

  // Back button handling
  React.useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      
      // Sync all overlays with the new state
      setShowMenu(state?.type === 'menu');
      setShowSearch(state?.type === 'search');
      setShowCart(state?.type === 'cart');
      setShowNotifications(state?.type === 'notifications');
      setShowMessenger(state?.type === 'messenger');
      setShowLocationModal(state?.type === 'location');

      if (state?.type === 'tab') {
        setActiveTab(state.id);
      } else if (state?.type === 'freshato_category' || state?.type === 'freshato_subcategory') {
        setActiveTab('restaurants');
      } else if (!state) {
        setActiveTab('avalon');
      }
    };

    window.addEventListener('popstate', handlePopState);

    const handleOpenSupportChat = async (e: any) => {
      const { type, userId, userName, chatId } = e.detail;
      let targetId = userId;
      let targetName = userName || 'الدعم الفني';
      
      if (!targetId && !chatId) {
        if (type === 'cards') targetId = SUPPORT_USER_IDS.CARDS;
        else if (type === 'mercato') targetId = SUPPORT_USER_IDS.MERCATO;
        else if (type === 'assisto') targetId = SUPPORT_USER_IDS.ASSISTO;
        else if (type === 'freshmart') targetId = SUPPORT_USER_IDS.FRESHMART;
        else if (type === 'deals') targetId = SUPPORT_USER_IDS.DEALS;
        else if (type === 'wasalny') targetId = SUPPORT_USER_IDS.WASALNY;
        else targetId = SUPPORT_USER_IDS.CUSTOMER;
      }

      if (targetId && SUPPORT_NAMES[targetId as string]) {
        targetName = SUPPORT_NAMES[targetId as string];
      }

      setMessengerInitialUser({ id: targetId, name: targetName, chatId });
      handleOpenMessenger();
    };

    window.addEventListener('open-support-chat', handleOpenSupportChat);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('open-support-chat', handleOpenSupportChat);
    };
  }, []); // Remove dependencies to avoid re-binding, state is handled via event.state

  const pushState = (type: string = 'overlay', data: any = {}) => {
    window.history.pushState({ type, ...data, timestamp: Date.now() }, '');
  };

  const handleOpenMenu = () => { pushState('menu'); setShowMenu(true); };
  const handleOpenSearch = () => { pushState('search'); setShowSearch(true); };
  const handleOpenCart = () => { pushState('cart'); setShowCart(true); };
  const handleOpenNotifications = () => { pushState('notifications'); setShowNotifications(true); };
  const handleOpenMessenger = () => { pushState('messenger'); setShowMessenger(true); };
  const handleOpenLocation = () => { pushState('location'); setShowLocationModal(true); };

  const handleTabChange = (tabId: string) => {
    if (activeTab === tabId && !showMenu && !showSearch && !showCart && !showNotifications && !showMessenger) return;
    
    // If we are in an overlay, we might want to go back first or just replace
    if (showMenu || showSearch || showCart || showNotifications || showMessenger) {
      window.history.replaceState({ type: 'tab', id: tabId }, '');
    } else {
      window.history.pushState({ type: 'tab', id: tabId }, '');
    }
    
    setActiveTab(tabId);
    setShowMenu(false);
    setShowSearch(false);
    setShowCart(false);
    setShowNotifications(false);
    setShowMessenger(false);
    setShowLocationModal(false);
  };

  React.useEffect(() => {
    // Check if in iframe
    setIsInIframe(window.self !== window.top);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    // Optionally, send analytics event with outcome of user choice
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  const [pagesInitialMode, setPagesInitialMode] = useState<{mode: 'list' | 'create', timestamp: number}>({ mode: 'list', timestamp: Date.now() });

  const handleConfirmClearCart = () => {
    if (pendingRestaurantItem) {
      clearAndAddToRestaurantCart(
        pendingRestaurantItem.item,
        pendingRestaurantItem.restaurantId,
        pendingRestaurantItem.restaurantName
      );
      setPendingRestaurantItem(null);
    }
  };

  const renderPage = () => {
    if (showMenu) return <MenuPage 
      onClose={() => window.history.back()} 
      onNavigate={(tabId, mode) => { 
        if (tabId === 'search') {
          window.history.replaceState({ type: 'search' }, '');
          setShowSearch(true);
          setShowMenu(false);
        } else if (tabId === 'settings') {
          window.history.replaceState({ type: 'tab', id: 'settings' }, '');
          setActiveTab('settings');
          setShowMenu(false);
        } else if (tabId === 'pages') {
          window.history.replaceState({ type: 'tab', id: 'pages' }, '');
          setPagesInitialMode({ mode: (mode as 'list' | 'create') || 'list', timestamp: Date.now() });
          setActiveTab('pages');
          setShowMenu(false);
        } else {
          window.history.replaceState({ type: 'tab', id: tabId }, '');
          setActiveTab(tabId); 
          setShowMenu(false); 
        }
      }} 
      showInstallButton={showInstallButton}
      isInstalled={isInstalled}
      isInIframe={isInIframe}
      onInstall={handleInstallClick}
    />;
    if (showSearch) return <SearchPage onClose={() => window.history.back()} />;
    if (showCart) return <CartPage onClose={() => window.history.back()} />;
    if (showNotifications) return <NotificationsPage onClose={() => window.history.back()} />;
    if (showMessenger) return <MessengerPage onClose={() => window.history.back()} initialUser={messengerInitialUser} />;
    if (activeTab === 'settings') return <SettingsPage onClose={() => setActiveTab('avalon')} />;

    switch (activeTab) {
      case 'avalon': return <AvalonPage />;
      case 'mercato': return <MercatoPage />;
      case 'assisto': return <AssistoPage />;
      case 'deals': return <DealsPage />;
      case 'restaurants': return <FreshMartPage />;
      case 'delivery': return <DeliveryPage />;
      case 'jobs': return <JobsPage />;
      case 'profile': return <ProfilePage initialTab={profileTab} />;
      case 'groups': return <GroupsPage onClose={() => setActiveTab('avalon')} />;
      case 'pages': return <PagesPage key={`pages-${pagesInitialMode.timestamp}`} onClose={() => setActiveTab('avalon')} initialMode={pagesInitialMode.mode} />;
      case 'events': return <EventsPage onClose={() => setActiveTab('avalon')} />;
      case 'memories': return <MemoriesPage onClose={() => setActiveTab('avalon')} />;
      case 'saved': return <SavedPage onClose={() => setActiveTab('avalon')} />;
      case 'menu': return (
        <MenuPage 
          onClose={() => setActiveTab('avalon')} 
          onNavigate={(id, mode) => {
            if (id === 'pages' && mode) {
              setPagesInitialMode({ mode, timestamp: Date.now() });
            }
            setActiveTab(id);
          }}
          showInstallButton={showInstallButton}
          isInstalled={isInstalled}
          isInIframe={isInIframe}
          onInstall={handleInstallClick}
        />
      );
      case 'admin': return <AdminPage onClose={() => handleTabChange('avalon')} />;
      case 'admin_central_dashboard': return <AdminPage initialTab="live_counters" onClose={() => handleTabChange('avalon')} />;
      case 'admin_app_structure': return <AdminPage initialTab="pages_mgmt" onClose={() => handleTabChange('avalon')} />;
      case 'admin_overview': return <AdminPage initialTab="overview" onClose={() => handleTabChange('avalon')} />;
      case 'admin_messages': return <AdminPage initialTab="messages" onClose={() => handleTabChange('avalon')} />;
      case 'admin_approvals': return <AdminPage initialTab="posts" onClose={() => handleTabChange('avalon')} />;
      case 'admin_users_mgmt': return <AdminPage initialTab="users" onClose={() => handleTabChange('avalon')} />;
      case 'admin_accounting_sys': return <AdminPage initialTab="accounting" onClose={() => handleTabChange('avalon')} />;
      case 'admin_posts': return <AdminPage initialTab="posts" onClose={() => handleTabChange('avalon')} />;
      case 'admin_pages': return <AdminPage initialTab="pages" onClose={() => handleTabChange('avalon')} />;
      case 'admin_users': return <AdminPage initialTab="users" onClose={() => handleTabChange('avalon')} />;
      case 'admin_content': return <AdminPage initialTab="content" onClose={() => handleTabChange('avalon')} />;
      case 'admin_system': return <AdminPage initialTab="system" onClose={() => handleTabChange('avalon')} />;
      case 'admin_hr': return <AdminPage initialTab="hr" onClose={() => handleTabChange('avalon')} />;
      case 'admin_accounting': return <AdminPage initialTab="accounting" onClose={() => handleTabChange('avalon')} />;
      case 'admin_subscriptions': return <AdminPage initialTab="subscriptions" onClose={() => handleTabChange('avalon')} />;
      case 'admin_coupons': return <AdminPage initialTab="coupons" onClose={() => handleTabChange('avalon')} />;
      case 'admin_points': return <AdminPage initialTab="points" onClose={() => handleTabChange('avalon')} />;
      default: return <AvalonPage />;
    }
  };

  const getNavItems = () => {
    const allItems = [
      { id: 'avalon', icon: Home, label: 'افالون' },
      { id: 'restaurants', icon: Utensils, label: 'فريش مارت' },
      { id: 'mercato', icon: Store, label: 'ميركاتو' },
      { id: 'assisto', icon: AssistoIcon, label: 'اسيستو' },
      { id: 'deals', icon: Handshake, label: 'ديلز' },
      { id: 'jobs', icon: Briefcase, label: 'فرص عمل' },
      { id: 'delivery', icon: DriverCallIcon, label: 'وصلنى' },
    ];

    if (userMode === 'merchant') {
      return [
        { id: 'avalon', icon: Home, label: 'طلبات العملاء' },
        { id: 'mercato', icon: Store, label: 'إدارة متجري' },
      ];
    }

    if (userMode === 'provider') {
      return [
        { id: 'avalon', icon: Home, label: 'طلبات الخدمات' },
        { id: 'assisto', icon: AssistoIcon, label: 'إدارة خدماتي' },
      ];
    }

    if (userMode === 'driver') {
      return [
        { id: 'avalon', icon: Home, label: 'طلبات التوصيل' },
        { id: 'delivery', icon: DriverCallIcon, label: 'إدارة رحلاتي' },
      ];
    }

    if (userMode === 'deal_manager') {
      return [
        { id: 'avalon', icon: Home, label: 'طلبات ديلز' },
        { id: 'deals', icon: Handshake, label: 'إدارة ديلز' },
      ];
    }

    if (userMode === 'restaurant') {
      return [
        { id: 'avalon', icon: Home, label: 'افالون طلبات العملاء' },
        { id: 'restaurants', icon: Utensils, label: 'إدارة الصفحة' },
      ];
    }

    if (userMode === 'admin') {
      return [
        { id: 'admin_central_dashboard', icon: LayoutDashboard, label: 'لوحة قيادة مركزية' },
        { id: 'admin_app_structure', icon: Layout, label: 'هيكل التطبيق' },
        { id: 'admin_overview', icon: Home, label: 'نظرة عامة' },
        { id: 'admin_messages', icon: MessageSquare, label: 'الرسائل' },
        { id: 'admin_approvals', icon: ClipboardCheck, label: 'نظام الموافقات' },
        { id: 'admin_users_mgmt', icon: Users, label: 'إدارة المستخدمين' },
        { id: 'admin_accounting_sys', icon: DollarSign, label: 'نظام الحسابات' },
      ];
    }

    return allItems;
  };

  const navItems = getNavItems();

  const resetOverlays = () => {
    setShowCart(false);
    setShowNotifications(false);
    setShowMessenger(false);
    setShowSearch(false);
    setShowMenu(false);
  };

  const toggleMode = () => {
    const currentIndex = profiles.findIndex(p => p.id === activeProfileId);
    const nextIndex = (currentIndex + 1) % profiles.length;
    switchProfile(profiles[nextIndex].id);
  };

  const getModeLabel = () => {
    switch (userMode) {
      case 'user': return 'مستخدم';
      case 'merchant': return 'تاجر';
      case 'provider': return 'مقدم خدمة';
      case 'driver': return 'سائق';
      case 'deal_manager': 
      case 'deal_provider':
        return 'مدير صفقات';
      case 'restaurant': return 'وكيل فريش مارت';
      case 'admin': return 'الإدارة';
      default: return 'مستخدم';
    }
  };

  const getModeIcon = () => {
    switch (userMode) {
      case 'user': return <UserIcon size={14} />;
      case 'merchant': return <StoreIcon size={14} />;
      case 'provider': return <Briefcase size={14} />;
      case 'driver': return <Car size={14} />;
      case 'deal_manager': return <Handshake size={14} />;
      case 'restaurant': return <Utensils size={14} />;
      case 'admin': return <Rocket size={14} />;
      default: return <UserIcon size={14} />;
    }
  };

  const getHeaderBg = () => {
    switch (userMode) {
      case 'user': return 'bg-white';
      case 'merchant': return 'bg-blue-50 border-blue-100';
      case 'provider': return 'bg-emerald-50 border-emerald-100';
      case 'driver': return 'bg-orange-50 border-orange-100';
      case 'deal_manager':
      case 'deal_provider':
        return 'bg-purple-50 border-purple-100';
      case 'restaurant': return 'bg-red-50 border-red-100';
      case 'admin': return 'bg-slate-900 border-slate-800 text-white';
      default: return 'bg-white';
    }
  };

  if (userLoading || postsLoading) {
    return (
      <div className="flex flex-col h-screen max-w-md mx-auto bg-white items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-gray-500 animate-pulse">جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-50 shadow-2xl overflow-hidden relative rtl">
      {/* Map Picker Modal */}
      <AnimatePresence>
        {showLocationModal && (
          <MapPickerModal 
            isOpen={showLocationModal}
            onClose={() => window.history.back()}
            title="حدد موقع التوصيل"
            initialLocation={activeProfile.location}
            onSelect={(location, coords) => {
              updateUserLocation(activeProfile.id, location, coords.lat, coords.lng);
              
              // Try to find city and region in the address to update the filters
              const foundCity = EGYPT_CITIES.find(city => location.includes(city.name));
              if (foundCity) {
                setCurrentCity(foundCity.name);
                const foundRegion = foundCity.regions.find(region => region !== 'الكل' && location.includes(region));
                if (foundRegion) {
                  setCurrentRegion(foundRegion);
                } else {
                  setCurrentRegion('الكل');
                }
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Cart Mismatch Confirmation Modal */}
      <AnimatePresence>
        {pendingRestaurantItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[40px] w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100"
            >
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-600">
                  <AlertTriangle size={40} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">تغيير المطعم؟</h3>
                <p className="text-sm font-bold text-gray-500 leading-relaxed">
                  عند بدء طلب جديد من مطعم آخر، ستتم إزالة محتويات السلة الحالية. هل تريد الاستمرار؟
                </p>
              </div>
              <div className="p-6 bg-gray-50 flex gap-3">
                <button 
                  onClick={() => setPendingRestaurantItem(null)}
                  className="flex-1 py-4 rounded-2xl text-sm font-black text-gray-500 bg-white border border-gray-200 shadow-sm active:scale-95 transition-all"
                >
                  إلغاء
                </button>
                <button 
                  onClick={handleConfirmClearCart}
                  className="flex-1 py-4 rounded-2xl text-sm font-black text-white bg-red-600 shadow-lg shadow-red-100 active:scale-95 transition-all"
                >
                  بدء طلب جديد
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <header className={`${getHeaderBg()} border-b px-3 h-[72px] flex items-start justify-between sticky top-0 z-50 transition-colors duration-300 pt-2`}>
        {/* Left: Menu + Title + Switcher */}
        <div className="flex flex-col gap-1 min-w-[100px] z-10">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { handleTabChange('menu'); }}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={20} className={userMode === 'admin' ? 'text-white' : 'text-gray-900'} />
            </button>
            <h1 className="font-black text-xl text-red-600 tracking-tighter leading-none">حاجات</h1>
          </div>
          <button 
            onClick={toggleMode}
            className={`flex items-center gap-1 self-start px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-tighter transition-all active:scale-95 ${
              userMode === 'user' ? 'bg-gray-100 text-gray-600' : 
              userMode === 'merchant' ? 'bg-blue-600 text-white shadow-sm' : 
              userMode === 'admin' ? 'bg-red-600 text-white shadow-sm' :
              'bg-emerald-600 text-white shadow-sm'
            }`}
          >
            {getModeIcon()}
            <span>تغيير المستخدم</span>
            <RefreshCw size={6} className="opacity-50" />
          </button>
        </div>

        {/* Center: Location - Positioned Lower and Independent */}
        <div className="absolute left-1/2 -translate-x-1/2 top-10 z-10">
          <button 
            onClick={handleOpenLocation}
            className={`flex items-center gap-1 px-1.5 py-1 rounded-lg border transition-all max-w-[130px] shadow-sm ${
              userMode === 'admin' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-gray-100 text-gray-600'
            }`}
          >
            <MapPin size={10} className="text-red-600 shrink-0" />
            <span className="text-[8px] font-black truncate">
              {activeProfile.location || `${currentCity} - ${currentRegion}`}
            </span>
          </button>
        </div>

        {/* Right: Actions - Positioned Higher */}
        <div className="flex items-center gap-0.5 z-10">
          <button 
            onClick={handleOpenSearch}
            className={`p-1.5 rounded-full transition-colors ${userMode === 'admin' ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}
          >
            <SearchIcon size={18} className={userMode === 'admin' ? 'text-white' : 'text-gray-900'} />
          </button>
          <button 
            onClick={handleOpenMessenger}
            className={`p-1.5 rounded-full transition-colors relative ${userMode === 'admin' ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}
          >
            <MessageCircle size={18} className={userMode === 'admin' ? 'text-white' : 'text-gray-900'} />
          </button>
          <button 
            onClick={handleOpenNotifications}
            className={`p-1.5 rounded-full transition-colors relative ${userMode === 'admin' ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}
          >
            <Bell size={18} className={userMode === 'admin' ? 'text-white' : 'text-gray-900'} />
          </button>
        </div>
      </header>

      {/* Top Navigation (Facebook Style) */}
      <nav className="bg-white border-b border-gray-200 flex justify-between items-center sticky top-[72px] z-40 shadow-sm overflow-hidden">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              handleTabChange(item.id);
              if (item.id === 'profile') setProfileTab('my-profile');
            }}
            className={`flex flex-col items-center justify-center py-2.5 transition-all flex-1 relative min-w-0 ${
              activeTab === item.id && !showCart && !showNotifications && !showMessenger && !showSearch && !showMenu
                ? 'text-red-600'
                : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            <item.icon size={18} strokeWidth={activeTab === item.id ? 2.5 : 2} />
            <span className="text-[7px] font-black mt-1 truncate w-full text-center px-0.5">{item.label}</span>
            {activeTab === item.id && !showCart && !showNotifications && !showMessenger && !showSearch && !showMenu && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-t-full"
              />
            )}
          </button>
        ))}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto scroll-smooth">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + (showCart ? 'cart' : '') + (showNotifications ? 'notif' : '') + (showMessenger ? 'msg' : '') + (showSearch ? 'search' : '') + (showMenu ? 'menu' : '')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="h-full"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
