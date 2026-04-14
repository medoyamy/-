import React, { useState, useEffect } from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';
import { UnifiedMap } from '../components/UnifiedMap';
import { Calendar, ArrowRight, Plus, Search, Map as MapIcon, MapPin, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function EventsPage({ onClose }: { onClose?: () => void }) {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [mapCenter] = useState({ lat: 31.0409, lng: 31.3785 }); // Mansoura
  const [selectedEventOnMap, setSelectedEventOnMap] = useState<any | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const [events, setEvents] = useState<any[]>([]);
  const [tabs] = useState([
    { id: 'upcoming', label: 'قادمة', icon: Calendar },
    { id: 'map', label: 'الخريطة', icon: MapIcon },
    { id: 'explore', label: 'استكشاف', icon: Search },
    { id: 'invites', label: 'دعوات', icon: Plus },
  ]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => window.history.back()}
            className="p-2 bg-white text-gray-400 rounded-xl shadow-sm border border-gray-100 hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all active:scale-90"
          >
            <ArrowRight size={24} />
          </motion.button>
          <h2 className="text-xl font-bold text-gray-900">المناسبات</h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowToast('البحث عن مناسبات سيتم تفعيله قريباً')}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <Search size={20} />
          </button>
          <button 
            onClick={() => setShowToast('إنشاء مناسبة سيتم تفعيله قريباً')}
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

      <div className="p-4 space-y-4 flex-1 flex flex-col overflow-hidden">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar flex-shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white shadow-lg shadow-red-100'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {activeTab === 'upcoming' && (
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900">المناسبات القادمة</h3>
              {events.length > 0 ? (
                events.map(event => (
                  <div key={event.id} className="bg-white p-3 rounded-xl shadow-sm flex items-center gap-3">
                    <img src={event.image} alt={event.name} className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{event.name}</h4>
                      <p className="text-xs text-gray-500">{event.date} • {event.location}</p>
                    </div>
                    <button 
                      onClick={() => setShowToast('عرض تفاصيل المناسبة سيتم تفعيله قريباً')}
                      className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors"
                    >
                      عرض
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Calendar size={48} className="mb-4 opacity-20" />
                  <p className="text-sm font-bold">لا توجد مناسبات قادمة</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'map' && (
            <div className="h-full min-h-[400px] rounded-3xl overflow-hidden shadow-inner bg-gray-200 border border-gray-100 relative">
              <UnifiedMap
                center={mapCenter}
                zoom={13}
                placeholder="ابحث في خريطة المناسبات..."
                accentColor="red"
                categories={['الكل', 'مؤتمرات', 'حفلات', 'معارض'].map(cat => ({ id: cat, name: cat }))}
                activeCategory="الكل"
              >
                {events.map(event => (
                  <Marker 
                    key={event.id} 
                    position={{ lat: event.lat, lng: event.lng }}
                    onClick={() => setSelectedEventOnMap(event)}
                  >
                    {selectedEventOnMap?.id === event.id && (
                      <InfoWindow onCloseClick={() => setSelectedEventOnMap(null)}>
                        <div className="p-2 min-w-[150px]">
                          <h4 className="text-xs font-black text-gray-800">{event.name}</h4>
                          <p className="text-[10px] font-bold text-gray-500">{event.date}</p>
                          <p className="text-[10px] font-bold text-blue-600">{event.location}</p>
                        </div>
                      </InfoWindow>
                    )}
                  </Marker>
                ))}
              </UnifiedMap>

              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/20 flex items-center gap-3 z-[1000]">
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <MapPin size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-black text-gray-800">استكشف المناسبات حولك</h4>
                  <p className="text-[9px] font-bold text-gray-500">اكتشف ما يحدث في منطقتك الآن</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
