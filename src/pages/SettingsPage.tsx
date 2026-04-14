import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  User, 
  Bell, 
  Lock, 
  Eye, 
  Globe, 
  HelpCircle, 
  Info, 
  LogOut,
  Shield,
  Smartphone,
  Languages,
  Moon,
  ArrowRight,
  Trash2,
  Layout
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import AppStructurePage from './AppStructurePage';
import { hardResetStorage } from '../lib/storage';

interface SettingsPageProps {
  onClose: () => void;
}

export default function SettingsPage({ onClose }: SettingsPageProps) {
  const { userName, userMode, mainProfile } = useUser();
  const [showAppStructure, setShowAppStructure] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleClearCache = async () => {
    if (window.confirm('هل تريد مسح التخزين المؤقت؟ سيؤدي ذلك إلى إعادة تحميل التطبيق بشكل كامل.')) {
      await hardResetStorage();
    }
  };

  const sections = [
    ...(mainProfile.mode === 'admin' ? [{
      title: 'الإدارة',
      items: [
        { id: 'app-structure', icon: Layout, label: 'هيكل التطبيق', description: 'التحكم في التبويبات والأقسام', action: () => setShowAppStructure(true) },
      ]
    }] : []),
    {
      title: 'الحساب',
      items: [
        { id: 'profile', icon: User, label: 'معلومات الشخصية', description: 'تحديث اسمك ومعلومات التواصل' },
        { id: 'password', icon: Lock, label: 'كلمة السر والأمان', description: 'تغيير كلمة السر وحماية حسابك' },
        { id: 'notifications', icon: Bell, label: 'الإشعارات', description: 'التحكم في تنبيهات التطبيق' },
      ]
    },
    {
      title: 'التفضيلات',
      items: [
        { id: 'language', icon: Languages, label: 'اللغة', description: 'العربية' },
        { id: 'appearance', icon: Moon, label: 'المظهر', description: 'الوضع الفاتح' },
        { id: 'media', icon: Smartphone, label: 'الوسائط والبيانات', description: 'جودة الصور والفيديوهات' },
        { id: 'clear-cache', icon: Trash2, label: 'مسح التخزين المؤقت', description: 'حل مشاكل المساحة والتحميل', action: handleClearCache },
      ]
    },
    {
      title: 'الخصوصية',
      items: [
        { id: 'privacy', icon: Eye, label: 'خصوصية الحساب', description: 'من يمكنه رؤية منشوراتك' },
        { id: 'blocking', icon: Shield, label: 'الحظر', description: 'إدارة الأشخاص المحظورين' },
        { id: 'active-status', icon: Globe, label: 'حالة النشاط', description: 'عرض متى تكون متاحاً' },
      ]
    },
    {
      title: 'الدعم والقانون',
      items: [
        { id: 'help', icon: HelpCircle, label: 'مركز المساعدة', description: 'الحصول على الدعم الفني' },
        { id: 'about', icon: Info, label: 'عن التطبيق', description: 'الإصدار والشروط والأحكام' },
      ]
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto pb-20"
      dir="rtl"
    >
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b border-gray-100 px-4 py-4 flex items-center gap-4">
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowRight size={24} className="text-gray-900" />
        </button>
        <h1 className="text-xl font-black text-gray-900">الدعم والخصوصية</h1>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* User Profile Summary */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 font-black text-2xl">
              {userName?.[0]}
            </div>
            <div>
              <h2 className="font-black text-gray-900">{userName}</h2>
              <p className="text-xs font-bold text-gray-400">إدارة حسابك الشخصي</p>
            </div>
          </div>
          <button className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Settings Sections */}
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-3">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider px-2">
              {section.title}
            </h3>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              {section.items.map((item, itemIdx) => (
                <button 
                  key={item.id}
                  onClick={() => item.action?.()}
                  className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                    itemIdx !== section.items.length - 1 ? 'border-b border-gray-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500">
                      <item.icon size={20} />
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-sm">{item.label}</p>
                      <p className="text-[10px] font-medium text-gray-400">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-300" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 rounded-3xl font-black hover:bg-red-100 transition-colors mt-8"
        >
          <LogOut size={20} />
          <span>تسجيل الخروج</span>
        </button>

        <div className="text-center py-8">
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
            Avalon v1.0.0
          </p>
        </div>
      </div>

      <AnimatePresence>
        {showAppStructure && (
          <AppStructurePage onClose={() => setShowAppStructure(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
