import React, { useState, useRef } from 'react';
import { MoreHorizontal, Trash2, Edit3, Bookmark, X, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PostMenuProps {
  onDelete: () => void;
  onEdit: () => void;
  onSave: () => void;
  onShare?: () => void;
  isOwner: boolean;
}

export default function PostMenu({ onDelete, onEdit, onSave, onShare, isOwner }: PostMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
      >
        <MoreHorizontal size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute left-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-[100] overflow-hidden"
          >
            {isOwner && (
              <>
                <button 
                  onClick={() => { onEdit(); setIsOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Edit3 size={18} className="text-blue-500" />
                  تعديل المنشور
                </button>
                <button 
                  onClick={() => { onDelete(); setIsOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={18} className="text-red-500" />
                  حذف المنشور
                </button>
                <div className="h-px bg-gray-100 mx-2 my-1" />
              </>
            )}
            <button 
              onClick={() => { onSave(); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Bookmark size={18} className="text-amber-500" />
              حفظ المنشور
            </button>
            <button 
              onClick={() => { onShare?.(); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Share2 size={18} className="text-blue-500" />
              مشاركة المنشور
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
