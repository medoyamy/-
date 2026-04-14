import React from 'react';
import { Users, ArrowRight, Plus, Search, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function GroupsPage({ onClose }: { onClose?: () => void }) {
  const [activeTab, setActiveTab] = React.useState('my-groups');
  const [groups, setGroups] = React.useState<any[]>([]);
  const [showToast, setShowToast] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const tabs = [
    { id: 'my-groups', label: 'مجموعاتك' },
    { id: 'discover', label: 'اكتشاف' },
    { id: 'invites', label: 'دعوات' }
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
              <ArrowRight size={24} className="text-gray-900" />
            </button>
          )}
          <h2 className="text-xl font-bold text-gray-900">المجموعات</h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowToast('البحث عن مجموعات سيتم تفعيله قريباً')}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <Search size={20} />
          </button>
          <button 
            onClick={() => setShowToast('إنشاء مجموعة سيتم تفعيله قريباً')}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
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

      <div className="p-4 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white shadow-lg shadow-red-100'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-gray-900">
            {activeTab === 'my-groups' ? 'المجموعات التي انضممت إليها' : 
             activeTab === 'discover' ? 'اكتشف مجموعات جديدة' : 'دعوات المجموعات'}
          </h3>
          {groups.length > 0 ? (
            groups.map(group => (
              <div key={group.id} className="bg-white p-3 rounded-xl shadow-sm flex items-center gap-3">
                <img src={group.image} alt={group.name} className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{group.name}</h4>
                  <p className="text-xs text-gray-500">{group.members} عضو</p>
                </div>
                <button 
                  onClick={() => setShowToast('عرض المجموعة سيتم تفعيله قريباً')}
                  className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors"
                >
                  عرض
                </button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Users size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-bold">لم تنضم إلى أي مجموعات بعد</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
