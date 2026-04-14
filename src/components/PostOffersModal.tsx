import React from 'react';
import { X, CheckCircle2, MessageCircle, Phone, Star, ShieldCheck, Clock, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Offer {
  id: string;
  providerName: string;
  providerAvatar: string;
  providerRating: number;
  providerReviews: number;
  price: string;
  deliveryTime: string;
  description: string;
  status: 'pending' | 'accepted' | 'rejected';
  isVerified: boolean;
}

interface PostOffersModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postContent: string;
}

export default function PostOffersModal({ isOpen, onClose, postId, postContent }: PostOffersModalProps) {
  // Mock offers data
  const offers: Offer[] = [
    {
      id: '1',
      providerName: 'أحمد محمود',
      providerAvatar: 'https://picsum.photos/seed/p1/100/100',
      providerRating: 4.8,
      providerReviews: 124,
      price: '250 ج.م',
      deliveryTime: 'خلال ساعتين',
      description: 'يمكنني تنفيذ طلبك بأفضل جودة وبأسرع وقت ممكن. لدي خبرة واسعة في هذا المجال.',
      status: 'pending',
      isVerified: true,
    },
    {
      id: '2',
      providerName: 'سارة علي',
      providerAvatar: 'https://picsum.photos/seed/p2/100/100',
      providerRating: 4.5,
      providerReviews: 89,
      price: '200 ج.م',
      deliveryTime: 'خلال 4 ساعات',
      description: 'عرضي هو الأفضل من حيث السعر والجودة. تواصل معي للمزيد من التفاصيل.',
      status: 'pending',
      isVerified: false,
    },
    {
      id: '3',
      providerName: 'شركة النور للتوريدات',
      providerAvatar: 'https://picsum.photos/seed/p3/100/100',
      providerRating: 4.9,
      providerReviews: 542,
      price: '300 ج.م',
      deliveryTime: 'غداً صباحاً',
      description: 'نحن شركة متخصصة ونضمن لك الرضا التام عن الخدمة المقدمة.',
      status: 'pending',
      isVerified: true,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="relative bg-gray-50 w-full max-w-2xl h-[90vh] sm:h-[80vh] rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
              <div>
                <h2 className="text-lg font-black text-gray-900">العروض المقدمة</h2>
                <p className="text-[10px] font-bold text-gray-400 mt-0.5 truncate max-w-[200px] sm:max-w-md">
                  {postContent}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 bg-gray-50 rounded-full text-gray-400 hover:bg-gray-100 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Offers List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {offers.length > 0 ? (
                offers.map((offer) => (
                  <div key={offer.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img 
                            src={offer.providerAvatar} 
                            alt={offer.providerName} 
                            className="w-12 h-12 rounded-2xl object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {offer.isVerified && (
                            <div className="absolute -top-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full border-2 border-white">
                              <ShieldCheck size={10} />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-gray-900 flex items-center gap-1">
                            {offer.providerName}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex items-center gap-0.5 text-amber-500">
                              <Star size={10} fill="currentColor" />
                              <span className="text-[10px] font-black">{offer.providerRating}</span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400">({offer.providerReviews} تقييم)</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-red-600 font-black text-sm">{offer.price}</div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 mt-0.5">
                          <Clock size={10} />
                          <span>{offer.deliveryTime}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 font-medium leading-relaxed bg-gray-50 p-3 rounded-2xl">
                      {offer.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
                        <CheckCircle2 size={16} />
                        قبول العرض
                      </button>
                      <div className="flex gap-2">
                        <button className="flex-1 flex items-center justify-center p-3 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-all">
                          <MessageCircle size={18} />
                        </button>
                        <button className="flex-1 flex items-center justify-center p-3 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-all">
                          <Phone size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-4">
                    <Clock size={40} />
                  </div>
                  <h3 className="text-lg font-black text-gray-800">لا توجد عروض بعد</h3>
                  <p className="text-sm font-bold text-gray-400 mt-2">
                    بمجرد أن يقدم التجار أو مقدمو الخدمات عروضهم، ستظهر هنا.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
