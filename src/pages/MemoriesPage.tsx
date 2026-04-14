import React from 'react';
import { Clock, ArrowRight, Search, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function MemoriesPage({ onClose }: { onClose?: () => void }) {
  const [memories, setMemories] = React.useState<any[]>([]);
  const [showToast, setShowToast] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
              <ArrowRight size={24} className="text-gray-900" />
            </button>
          )}
          <h2 className="text-xl font-bold text-gray-900">الذكريات</h2>
        </div>
        <button 
          onClick={() => setShowToast('البحث في الذكريات سيتم تفعيله قريباً')}
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        >
          <Search size={20} />
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

      <div className="p-4 space-y-6 overflow-y-auto">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-2">نأمل أن تستمتع بمراجعة ذكرياتك!</h3>
          <p className="text-sm text-gray-600">نحن نجمع اللحظات التي شاركتها هنا حتى تتمكن من العودة إليها.</p>
        </div>

        <div className="space-y-4">
          {memories.length > 0 ? (
            memories.map(memory => (
              <div key={memory.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <div className="p-4">
                  <p className="font-bold text-gray-900">{memory.text}</p>
                  <p className="text-xs text-gray-500">{memory.date}</p>
                </div>
                <img src={memory.image} alt="Memory" className="w-full h-48 object-cover" referrerPolicy="no-referrer" />
                <div className="p-3 flex gap-2">
                  <button className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold">مشاركة</button>
                  <button className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold">إرسال</button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Clock size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-bold">لا توجد ذكريات لعرضها اليوم</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
