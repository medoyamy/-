import React from 'react';
import { Bookmark, ArrowRight, Search, Filter } from 'lucide-react';

export default function SavedPage({ onClose }: { onClose?: () => void }) {
  const [savedItems, setSavedItems] = React.useState<any[]>([]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
              <ArrowRight size={24} className="text-gray-900" />
            </button>
          )}
          <h2 className="text-xl font-bold text-gray-900">العناصر المحفوظة</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 bg-gray-100 rounded-full"><Search size={20} /></button>
          <button className="p-2 bg-gray-100 rounded-full"><Filter size={20} /></button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button className="px-4 py-2 bg-red-100 text-red-600 rounded-full text-sm font-bold whitespace-nowrap">الكل</button>
          <button className="px-4 py-2 bg-gray-200 text-gray-600 rounded-full text-sm font-bold whitespace-nowrap">منشورات</button>
          <button className="px-4 py-2 bg-gray-200 text-gray-600 rounded-full text-sm font-bold whitespace-nowrap">فيديوهات</button>
          <button className="px-4 py-2 bg-gray-200 text-gray-600 rounded-full text-sm font-bold whitespace-nowrap">صفقات</button>
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-gray-900">أحدث المحفوظات</h3>
          {savedItems.length > 0 ? (
            savedItems.map(item => (
              <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm flex items-center gap-3">
                <img src={item.image} alt={item.title} className="w-16 h-16 rounded-lg object-cover" referrerPolicy="no-referrer" />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 line-clamp-2">{item.title}</h4>
                  <p className="text-xs text-gray-500">{item.type}</p>
                </div>
                <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <Bookmark size={20} fill="currentColor" className="text-red-500" />
                </button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Bookmark size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-bold">لا توجد عناصر محفوظة</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
