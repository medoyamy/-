import React from 'react';
import { 
  User, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Store, 
  Users, 
  Flag, 
  Calendar, 
  Clock, 
  Bookmark, 
  ChevronDown,
  ArrowRight,
  Search,
  Zap,
  Utensils,
  Home,
  Rocket,
  Handshake,
  Car,
  Phone,
  RefreshCw,
  Briefcase,
  BarChart3,
  Database,
  Package,
  Plus,
  Download,
  ClipboardCheck
} from 'lucide-react';
import { useUser, UserMode } from '../context/UserContext';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

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

export default function MenuPage({ 
  onClose, 
  onNavigate,
  showInstallButton,
  isInstalled,
  isInIframe,
  onInstall
}: { 
  onClose: () => void, 
  onNavigate: (id: string, mode?: 'list' | 'create') => void,
  showInstallButton?: boolean,
  isInstalled?: boolean,
  isInIframe?: boolean,
  onInstall?: () => void
}) {
  const { userMode, setUserMode, activeProfile, mainProfile, profiles, switchProfile } = useUser();

  const toggleMode = () => {
    const modes: UserMode[] = ['user', 'merchant', 'provider', 'driver', 'deal_manager', 'admin'];
    const currentIndex = modes.indexOf(userMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setUserMode(modes[nextIndex]);
  };

  const getModeInfo = () => {
    switch (userMode) {
      case 'user': return { label: 'مستخدم', icon: User, color: 'bg-gray-100 text-gray-600', next: 'تاجر' };
      case 'merchant': return { label: 'تاجر', icon: Store, color: 'bg-blue-600 text-white shadow-lg shadow-blue-100', next: 'مقدم خدمة' };
      case 'provider': return { label: 'مقدم خدمة', icon: Briefcase, color: 'bg-emerald-600 text-white shadow-lg shadow-emerald-100', next: 'سائق' };
      case 'driver': return { label: 'سائق', icon: Car, color: 'bg-orange-600 text-white shadow-lg shadow-orange-100', next: 'مدير صفقة' };
      case 'deal_manager': return { label: 'مدير صفقات', icon: Handshake, color: 'bg-purple-600 text-white shadow-lg shadow-purple-100', next: 'الإدارة' };
      case 'admin': return { label: 'الإدارة', icon: Rocket, color: 'bg-slate-900 text-white shadow-lg shadow-slate-800', next: 'مستخدم' };
      case 'restaurant': return { label: 'وكيل فريش مارت', icon: Utensils, color: 'bg-red-600 text-white shadow-lg shadow-red-100', next: 'مستخدم' };
      default: return { label: 'مستخدم', icon: User, color: 'bg-gray-100 text-gray-600', next: 'تاجر' };
    }
  };

  const modeInfo = getModeInfo();
  const pages = profiles.filter(p => p.isPage);

  const [showToast, setShowToast] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getMenuSections = () => {
    const sections = [
      {
        title: 'الخدمات الأساسية',
        items: [
          { id: 'avalon', icon: Home, label: 'افالون', subLabel: 'الرئيسية', color: 'text-blue-600', bg: 'bg-blue-50' },
          { id: 'mercato', icon: Store, label: 'ميركاتو', subLabel: 'سوق المنتجات', color: 'text-blue-500', bg: 'bg-blue-50' },
          { id: 'assisto', icon: AssistoIcon, label: 'اسيستو', subLabel: 'بوابة الخدمات', color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { id: 'restaurants', icon: Utensils, label: 'فريش مارت', subLabel: 'أكل وتموين', color: 'text-red-500', bg: 'bg-red-50' },
        ]
      },
      {
        title: 'خدمات النقل والفرص',
        items: [
          { id: 'delivery', icon: DriverCallIcon, label: 'وصلني', subLabel: 'طلب رحلة', color: 'text-orange-500', bg: 'bg-orange-50' },
          { id: 'deals', icon: Handshake, label: 'ديلز', subLabel: 'عروض حصرية', color: 'text-purple-500', bg: 'bg-purple-50' },
          { id: 'jobs', icon: Briefcase, label: 'وظائف', subLabel: 'فرص عمل', color: 'text-indigo-500', bg: 'bg-indigo-50' },
        ]
      },
      {
        title: 'المجتمع والترفيه',
        items: [
          { id: 'groups', icon: Users, label: 'المجموعات', subLabel: 'مجتمعاتك', color: 'text-blue-600', bg: 'bg-blue-50' },
          { id: 'pages', icon: Flag, label: 'الصفحات', subLabel: 'صفحات تتابعها', color: 'text-orange-600', bg: 'bg-orange-50' },
          { id: 'events', icon: Calendar, label: 'المناسبات', subLabel: 'أحداث قريبة', color: 'text-red-600', bg: 'bg-red-50' },
        ]
      },
      {
        title: 'الشخصي والأرشيف',
        items: [
          { id: 'profile', icon: User, label: 'الملف الشخصي', subLabel: 'حسابك', color: 'text-gray-600', bg: 'bg-gray-50' },
          { id: 'saved', icon: Bookmark, label: 'المحفوظات', subLabel: 'عناصر حفظتها', color: 'text-purple-600', bg: 'bg-purple-50' },
          { id: 'memories', icon: Clock, label: 'الذكريات', subLabel: 'لحظات سابقة', color: 'text-blue-400', bg: 'bg-blue-50' },
        ]
      }
    ];

    if (userMode === 'admin') {
      sections.unshift({
        title: 'الإدارة والنظام',
        items: [
          { id: 'admin', icon: Rocket, label: 'لوحة التحكم', subLabel: 'إدارة المنصة', color: 'text-slate-900', bg: 'bg-slate-100' },
          { id: 'admin_approvals', icon: ClipboardCheck, label: 'نظام الموافقات', subLabel: 'مراجعة المنشورات والصفحات', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { id: 'admin_users', icon: Users, label: 'المستخدمين', subLabel: 'إدارة الحسابات', color: 'text-blue-600', bg: 'bg-blue-50' },
          { id: 'admin_system', icon: Database, label: 'النظام', subLabel: 'الإعدادات التقنية', color: 'text-slate-600', bg: 'bg-slate-100' },
        ]
      });
    }

    return sections;
  };

  const menuSections = getMenuSections();

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowRight size={24} className="text-gray-900" />
          </button>
          <h2 className="text-xl font-black text-gray-900">القائمة</h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onNavigate('settings')}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <Settings size={20} className="text-gray-600" />
          </button>
          <button 
            onClick={() => onNavigate('search')}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <Search size={20} className="text-gray-600" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {/* Profile Section */}
        <div 
          className="bg-white rounded-[24px] p-4 shadow-sm flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all border border-gray-100"
          onClick={() => { onNavigate('profile'); }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
              {activeProfile.avatar ? (
                <img src={activeProfile.avatar} alt={activeProfile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User size={32} className="text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 leading-tight">{activeProfile.name}</h3>
              <p className="text-xs font-bold text-gray-400">عرض ملفك الشخصي</p>
            </div>
          </div>
          <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center">
            <ChevronDown size={20} className="text-gray-400 rotate-[-90deg]" />
          </div>
        </div>

        {/* Categories */}
        {menuSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-3">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">{section.title}</h3>
            <div className="grid grid-cols-2 gap-3">
              {section.items.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="bg-white p-4 rounded-[24px] shadow-sm flex flex-col items-start gap-3 hover:shadow-md active:scale-95 transition-all border border-gray-100 group"
                >
                  <div className={`w-10 h-10 ${item.bg} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <item.icon size={22} className={item.color} />
                  </div>
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-sm font-black text-gray-900">{item.label}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">{item.subLabel}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Switch Profiles Section */}
        <div className="bg-white rounded-[32px] p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black text-gray-900">حساباتك وصفحاتك</h3>
            <button 
              onClick={() => onNavigate('pages', 'create')}
              className="text-[10px] font-black text-red-600 bg-red-50 px-3 py-1 rounded-full"
            >
              + إنشاء جديد
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => {
                  switchProfile(profile.id);
                  onClose();
                }}
                className="flex-shrink-0 flex flex-col items-center gap-2 group"
              >
                <div className={`w-16 h-16 rounded-[20px] overflow-hidden border-2 transition-all ${
                  profile.id === activeProfile.id ? 'border-red-500 scale-105 shadow-lg shadow-red-100' : 'border-white shadow-sm grayscale-[0.5]'
                }`}>
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                      <User size={28} />
                    </div>
                  )}
                </div>
                <span className={`text-[10px] font-black max-w-[64px] truncate ${
                  profile.id === activeProfile.id ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {profile.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="space-y-2 pt-4">
          <button 
            onClick={() => onNavigate('settings')}
            className="w-full flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                <Settings size={18} />
              </div>
              <span className="text-sm font-bold text-gray-900">الإعدادات والخصوصية</span>
            </div>
            <ChevronDown size={18} className="text-gray-400 rotate-[-90deg]" />
          </button>
          <button 
            onClick={() => setShowToast('قريباً: مركز المساعدة المتكامل')}
            className="w-full flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                <HelpCircle size={18} />
              </div>
              <span className="text-sm font-bold text-gray-900">المساعدة والدعم</span>
            </div>
            <ChevronDown size={18} className="text-gray-400 rotate-[-90deg]" />
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl font-black justify-center mt-6 active:scale-95 transition-all"
          >
            <LogOut size={20} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </div>
  );
}
