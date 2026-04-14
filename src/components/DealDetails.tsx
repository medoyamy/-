import React from 'react';
import { 
  ArrowRight, 
  Share2, 
  Heart, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Calendar, 
  Info,
  Phone,
  MessageCircle
} from 'lucide-react';

interface DealDetailsProps {
  deal: any;
  onBack: () => void;
}

export default function DealDetails({ deal, onBack }: DealDetailsProps) {
  return (
    <div className="flex flex-col min-h-full bg-white animate-in slide-in-from-left duration-300">
      {/* Header Image Area */}
      <div className="relative h-72 w-full">
        <img 
          src={deal.image || `https://picsum.photos/seed/deal-detail/800/600`} 
          alt="Deal" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <button 
            onClick={onBack}
            className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-md text-gray-900"
          >
            <ArrowRight size={20} />
          </button>
          <div className="flex gap-2">
            <button className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-md text-gray-900">
              <Share2 size={20} />
            </button>
            <button className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-md text-red-600">
              <Heart size={20} />
            </button>
          </div>
        </div>
        <div className="absolute bottom-4 right-4 bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-lg">
          {deal.category || 'سيارات مستعملة'}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 leading-tight mb-2">
            {deal.title || 'هيونداي إلنترا 2022 - حالة ممتازة'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
              <MapPin size={14} className="text-red-500" />
              {deal.location || 'حي الجامعة، المنصورة'}
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
              <Calendar size={14} className="text-blue-500" />
              نشر منذ يومين
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between bg-red-50 p-4 rounded-3xl border border-red-100">
          <div>
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">السعر المطلوب</p>
            <h3 className="text-2xl font-black text-red-600">450,000 ج.م</h3>
          </div>
          <div className="bg-white px-3 py-1 rounded-xl border border-red-100 text-[10px] font-bold text-red-600">
            قابل للتفاوض البسيط
          </div>
        </div>

        {/* Manager Info */}
        <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img 
                src="https://picsum.photos/seed/manager/100/100" 
                alt="Manager" 
                className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="text-sm font-black text-gray-800">محمد كمال</h4>
                <div className="flex items-center gap-1">
                  <Star size={12} fill="#f59e0b" className="text-amber-500" />
                  <span className="text-[10px] font-bold text-gray-500">4.9 (مدير صفقات معتمد)</span>
                </div>
              </div>
            </div>
            <ShieldCheck size={24} className="text-blue-500" />
          </div>
          <p className="text-xs text-gray-500 font-bold leading-relaxed">
            خبير في سوق السيارات المستعملة منذ 10 سنوات. أضمن لك فحصاً شاملاً وتفاوضاً عادلاً.
          </p>
        </div>

        {/* Specs */}
        <div className="space-y-3">
          <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
            <Info size={16} className="text-red-600" />
            المواصفات والتفاصيل
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'الموديل', value: '2022' },
              { label: 'ناقل الحركة', value: 'أوتوماتيك' },
              { label: 'المسافة', value: '45,000 كم' },
              { label: 'اللون', value: 'أبيض لؤلؤي' },
              { label: 'الحالة', value: 'فابريكا بالكامل' },
              { label: 'الضمان', value: 'ساري حتى 2025' },
            ].map((spec, i) => (
              <div key={i} className="bg-white border border-gray-100 p-3 rounded-2xl">
                <span className="text-[10px] font-bold text-gray-400 block mb-1">{spec.label}</span>
                <span className="text-xs font-black text-gray-700">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <h3 className="text-sm font-black text-gray-800">وصف إضافي</h3>
          <p className="text-xs text-gray-600 font-medium leading-relaxed">
            السيارة بحالة الوكالة، صيانات منتظمة في التوكيل، لا تحتاج لأي مصاريف. المعاينة في المنصورة (حي الجامعة) بعد الساعة 5 مساءً. السعر قابل للتفاوض البسيط بعد المعاينة فقط.
          </p>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-3 z-20">
        <button className="flex-1 bg-red-600 text-white py-4 rounded-2xl text-sm font-black shadow-xl shadow-red-100 flex items-center justify-center gap-2">
          <MessageCircle size={18} />
          دردشة فورية
        </button>
        <button className="flex-1 bg-gray-900 text-white py-4 rounded-2xl text-sm font-black shadow-xl shadow-gray-200 flex items-center justify-center gap-2">
          <Phone size={18} />
          اتصال هاتفي
        </button>
      </div>
    </div>
  );
}
