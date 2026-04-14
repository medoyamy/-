import React from 'react';
import { X, User, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PostLikesModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string | number;
}

const MOCK_LIKES = [
  { id: 1, name: 'أحمد محمد', avatar: 'https://picsum.photos/seed/user1/100/100', isVerified: true },
  { id: 2, name: 'سارة علي', avatar: 'https://picsum.photos/seed/user2/100/100', isVerified: false },
  { id: 3, name: 'محمود حسن', avatar: 'https://picsum.photos/seed/user3/100/100', isVerified: true },
  { id: 4, name: 'ليلى إبراهيم', avatar: 'https://picsum.photos/seed/user4/100/100', isVerified: false },
];

export default function PostLikesModal({ isOpen, onClose, postId }: PostLikesModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-black text-gray-900">الأشخاص الذين أعجبهم المنشور</h3>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              <div className="space-y-1">
                {MOCK_LIKES.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                        {user.isVerified && (
                          <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-0.5 border-2 border-white">
                            <CheckCircle2 size={10} fill="currentColor" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {user.name}
                        </h4>
                        <p className="text-[11px] text-gray-500">نشط منذ قليل</p>
                      </div>
                    </div>
                    <button className="px-4 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-full hover:bg-blue-600 hover:text-white transition-all">
                      متابعة
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-50 text-center">
              <p className="text-xs text-gray-500 font-medium">
                يظهر هنا الأشخاص الذين تفاعلوا مع هذا المنشور
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
