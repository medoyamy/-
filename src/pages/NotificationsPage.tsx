import React from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  Zap, 
  MessageCircle, 
  ArrowRight,
  Tag,
  AlertCircle,
  MoreHorizontal,
  ThumbsUp,
  Heart,
  UserPlus,
  ShoppingBag,
  Rocket
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function NotificationsPage({ onClose }: { onClose: () => void }) {
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [showToast, setShowToast] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Facebook Header */}
      <header className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowRight size={24} className="text-gray-700" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">الإشعارات</h2>
        </div>
        <button 
          onClick={() => setShowToast('إعدادات الإشعارات سيتم تفعيلها قريباً')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <MoreHorizontal size={24} className="text-gray-700" />
        </button>
      </header>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-4 right-4 z-[100] bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10"
          >
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center shrink-0">
              <Rocket size={16} />
            </div>
            <p className="text-xs font-black">{showToast}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2">
          <h3 className="text-base font-bold text-gray-900 mb-2">الجديدة</h3>
        </div>
        
        <div className="space-y-0">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`px-4 py-3 flex gap-3 hover:bg-gray-50 transition-colors cursor-pointer relative ${notif.unread ? 'bg-blue-50/50' : ''}`}
              >
                {/* Avatar with Icon Overlay */}
                <div className="relative shrink-0">
                  <img 
                    src={notif.avatar} 
                    alt="Avatar" 
                    className="w-16 h-16 rounded-full object-cover" 
                    referrerPolicy="no-referrer" 
                  />
                  <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full ${notif.iconBg} flex items-center justify-center border-2 border-white shadow-sm`}>
                    <notif.icon size={14} className="text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[15px] leading-snug text-gray-900">
                      <span className="font-bold">{notif.title}</span>: {notif.desc}
                    </p>
                    <span className={`text-[12px] ${notif.unread ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                      {notif.time}
                    </span>
                  </div>
                </div>

                {/* Unread Dot & More */}
                <div className="flex flex-col items-center justify-center gap-2">
                  {notif.unread && (
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  )}
                  <button className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Bell size={48} strokeWidth={1} className="mb-2 opacity-20" />
              <p className="text-sm font-medium">لا توجد إشعارات جديدة</p>
            </div>
          )}
        </div>

        {/* Earlier Section */}
        <div className="px-4 py-4 border-t border-gray-100 mt-2">
          <h3 className="text-base font-bold text-gray-900 mb-2">الأقدم</h3>
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <Bell size={48} strokeWidth={1} className="mb-2 opacity-20" />
            <p className="text-sm font-medium">لا توجد إشعارات أقدم</p>
          </div>
        </div>
      </div>
    </div>
  );
}
