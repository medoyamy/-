import React, { useState } from 'react';
import { 
  Search, 
  ArrowRight, 
  Utensils, 
  Store, 
  Zap, 
  Star, 
  MapPin, 
  Clock, 
  ChevronLeft,
  Filter,
  MoreHorizontal,
  X,
  Check,
  ArrowUpDown,
  Navigation,
  Rocket,
  Handshake,
  Car,
  Phone,
  User
} from 'lucide-react';

const DriverCallIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
  >
    {/* Car Body */}
    <path d="M20,60 L25,40 C27,32 35,28 50,28 C65,28 73,32 75,40 L80,60 L20,60 Z" />
    <rect x="15" y="60" width="70" height="20" rx="6" />
    {/* Headlights */}
    <circle cx="28" cy="70" r="6" fill="white" fillOpacity="0.9" />
    <circle cx="72" cy="70" r="6" fill="white" fillOpacity="0.9" />
    {/* Windshield */}
    <path d="M30,35 L70,35 L73,53 L27,53 Z" fill="white" fillOpacity="0.2" />
    {/* Wheels */}
    <rect x="22" y="80" width="12" height="8" rx="2" />
    <rect x="66" y="80" width="12" height="8" rx="2" />
  </svg>
);

const AssistoIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
  >
    {/* Outer Badge Circle */}
    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="5" />
    {/* Crossed Tools Background (Subtle) */}
    <rect x="46" y="25" width="8" height="50" rx="4" transform="rotate(45 50 50)" opacity="0.2" />
    <rect x="46" y="25" width="8" height="50" rx="4" transform="rotate(-45 50 50)" opacity="0.2" />
    {/* Service Provider (Person) */}
    <circle cx="50" cy="38" r="14" />
    <path d="M25,82 c0-15,12-24,25-24 s25,9,25,24 v6 h-50 v-6 z" />
    {/* Quality Star */}
    <path d="M50,58 l2.5,5 l5.5,0.8 l-4,3.9 l0.9,5.5 l-4.9-2.6 l-4.9,2.6 l0.9-5.5 l-4-3.9 l5.5-0.8 z" fill="white" />
  </svg>
);
import { motion, AnimatePresence } from 'motion/react';

interface SearchResult {
  id: number;
  type: string;
  name: string;
  rating: number;
  distance: number;
  image: string;
  category: string;
  subCategory?: string;
  price?: number | string;
  isOpen: boolean;
}

export default function SearchPage({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Advanced Filters State
  const [filters, setFilters] = useState({
    minRating: 0,
    maxDistance: 10,
    sortBy: 'relevance', // relevance, rating, price_low, price_high, distance
    onlyOpen: false,
    subCategory: 'all',
  });

  const categorySpecificFilters: Record<string, string[]> = {
    'فريش مارت': ['الكل', 'بيتزا', 'برجر', 'مشويات', 'إيطالي', 'شرقي'],
    'ميركاتو': ['الكل', 'بقالة', 'إلكترونيات', 'ملابس', 'منزل'],
    'اسيستو': [
      'الكل', 
      'دكاتره', 
      'تنظيف', 
      'الموضه والعنايه الشخصيه', 
      'مدرسين', 
      'تصميم وابداع', 
      'اعمال بناء', 
      'اصلاحات', 
      'سياحه ورحلات', 
      'صيانه خارجيه', 
      'صيانه داخليه', 
      'تسليه', 
      'خدمات عامه', 
      'خدمات سيارات', 
      'مهن وأعمال', 
      'عمال اكل وشرب'
    ],
    'ديلز': ['الكل', 'شقق', 'فيلات', 'أراضي', 'سيارات'],
    'اكسبريس': ['الكل', 'سريع', 'اقتصادي', 'نقل ثقيل'],
  };

  const recentSearches: any[] = [];

  const searchCategories = [
    { id: 'all', label: 'الكل' },
    { id: 'فريش مارت', label: 'فريش مارت' },
    { id: 'ميركاتو', label: 'ميركاتو' },
    { id: 'اسيستو', label: 'اسيستو' },
    { id: 'ديلز', label: 'ديلز' },
    { id: 'اكسبريس', label: 'اكسبريس' },
  ];

  const allResults: SearchResult[] = [];

  const filteredResults = allResults
    .filter(item => {
      const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesRating = item.rating >= filters.minRating;
      const matchesDistance = item.distance <= filters.maxDistance;
      const matchesOpen = !filters.onlyOpen || item.isOpen;
      const matchesSubCategory = filters.subCategory === 'all' || item.subCategory === filters.subCategory;
      
      return matchesQuery && matchesCategory && matchesRating && matchesDistance && matchesOpen && matchesSubCategory;
    })
    .sort((a, b) => {
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      if (filters.sortBy === 'distance') return a.distance - b.distance;
      if (filters.sortBy === 'price_low') return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (filters.sortBy === 'price_high') return (Number(b.price) || 0) - (Number(a.price) || 0);
      return 0;
    });

  const activeFilterCount = (filters.minRating > 0 ? 1 : 0) + 
                            (filters.sortBy !== 'relevance' ? 1 : 0) + 
                            (filters.onlyOpen ? 1 : 0) +
                            (filters.subCategory !== 'all' ? 1 : 0);

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Facebook Style Search Header */}
      <header className="bg-white px-4 py-2 flex items-center gap-2 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowRight size={24} className="text-gray-600" />
        </button>
        <div className="flex-1 relative">
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            <Search size={18} />
          </div>
          <input 
            autoFocus
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="البحث في أفالون" 
            className="w-full bg-gray-100 border-none rounded-full py-2 pr-10 pl-4 text-[15px] outline-none focus:bg-gray-200 transition-colors"
          />
        </div>
        <button 
          onClick={() => setShowFilters(true)}
          className={`p-2 rounded-full transition-all relative ${activeFilterCount > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <Filter size={20} />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        {!query && activeCategory === 'all' && activeFilterCount === 0 ? (
          <div className="p-4 space-y-6">
            {/* Recent Searches Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">عمليات البحث الأخيرة</h3>
                <button className="text-sm font-medium text-blue-600 hover:bg-blue-50 px-2 py-1 rounded">تعديل</button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((s) => (
                  <button 
                    key={s.id} 
                    onClick={() => setQuery(s.text)} 
                    className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                  >
                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 group-hover:bg-white">
                      <Clock size={18} />
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-sm font-bold text-gray-800">{s.text}</p>
                      <p className="text-[10px] text-gray-400">{s.time}</p>
                    </div>
                    <MoreHorizontal size={18} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>

            {/* Suggested Categories */}
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-4">اكتشف المزيد</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'فريش مارت', label: 'فريش مارت', icon: Utensils, color: 'text-red-600', bg: 'bg-red-50' },
                  { id: 'ميركاتو', label: 'ميركاتو', icon: Store, color: 'text-red-600', bg: 'bg-red-50' },
                  { id: 'اسيستو', label: 'اسيستو', icon: AssistoIcon, color: 'text-red-600', bg: 'bg-red-50' },
                  { id: 'اكسبريس', label: 'اكسبريس', icon: DriverCallIcon, color: 'text-red-600', bg: 'bg-red-50' },
                ].map((item, i) => (
                  <div 
                    key={i} 
                    onClick={() => {
                      setActiveCategory(item.id);
                      setQuery(' '); // Trigger search view
                    }}
                    className="bg-gray-50 p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100"
                  >
                    <div className={`p-3 rounded-full ${item.bg}`}>
                      <item.icon size={24} className={item.color} />
                    </div>
                    <span className="text-sm font-bold text-gray-700">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Compact Category & Smart Filters */}
            <div className="flex flex-col border-b border-gray-100 bg-white sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-2 p-2 overflow-x-auto no-scrollbar">
                {searchCategories.map((cat) => (
                  <button 
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setFilters(prev => ({ ...prev, subCategory: 'all' }));
                    }}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap transition-all border ${
                      cat.id === activeCategory 
                        ? 'bg-red-600 text-white border-red-600 shadow-sm' 
                        : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              
              {/* Category-Specific Smart Sub-filters */}
              <AnimatePresence mode="wait">
                {activeCategory !== 'all' && categorySpecificFilters[activeCategory] && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="flex gap-2 px-2 pb-2 overflow-x-auto no-scrollbar overflow-hidden"
                  >
                    {categorySpecificFilters[activeCategory].map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setFilters(prev => ({ ...prev, subCategory: sub }))}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-all shrink-0 ${
                          filters.subCategory === sub
                            ? 'bg-red-50 text-red-600 border-red-200'
                            : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick Action Chips (More Compact) */}
              <div className="flex gap-2 px-2 pb-2 overflow-x-auto no-scrollbar">
                <button 
                  onClick={() => setFilters({ ...filters, onlyOpen: !filters.onlyOpen })}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all flex items-center gap-1 shrink-0 ${
                    filters.onlyOpen ? 'bg-green-50 text-green-600 border-green-200' : 'bg-white text-gray-400 border-gray-100'
                  }`}
                >
                  <Clock size={10} />
                  مفتوح
                </button>
                <button 
                  onClick={() => setFilters({ ...filters, minRating: filters.minRating === 4.5 ? 0 : 4.5 })}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all flex items-center gap-1 shrink-0 ${
                    filters.minRating === 4.5 ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-white text-gray-400 border-gray-100'
                  }`}
                >
                  <Star size={10} fill={filters.minRating === 4.5 ? '#d97706' : 'transparent'} />
                  4.5+
                </button>
                <button 
                  onClick={() => setFilters({ ...filters, maxDistance: filters.maxDistance === 2 ? 10 : 2 })}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all flex items-center gap-1 shrink-0 ${
                    filters.maxDistance === 2 ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-400 border-gray-100'
                  }`}
                >
                  <Navigation size={10} />
                  قريب
                </button>
                <div className="w-[1px] h-4 bg-gray-200 self-center mx-1" />
                <button 
                  onClick={() => setShowFilters(true)}
                  className="px-2.5 py-1 rounded-md text-[10px] font-bold border bg-white text-gray-600 border-gray-200 flex items-center gap-1 shrink-0"
                >
                  <Filter size={10} />
                  كل الفلاتر
                </button>
              </div>
            </div>

            {/* Search Results */}
            <div className="p-4 space-y-4">
              {filteredResults.length > 0 ? (
                filteredResults.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group">
                    <div className="relative">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover shadow-sm" referrerPolicy="no-referrer" />
                      {!item.isOpen && (
                        <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                          <span className="text-[8px] font-bold text-white bg-red-600 px-1 rounded">مغلق</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-[15px] font-bold text-gray-900 group-hover:text-red-600 transition-colors">{item.name}</h4>
                        <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase">{item.category}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        {item.rating && (
                          <div className="flex items-center gap-1">
                            <Star size={12} fill="#f59e0b" className="text-amber-500" />
                            <span className="text-[12px] font-bold text-gray-600">{item.rating}</span>
                          </div>
                        )}
                        {item.price !== undefined && item.price !== null && (
                          <span className="text-[12px] font-bold text-red-600">
                            {typeof item.price === 'number' ? `${item.price.toLocaleString()} ج.م` : item.price}
                          </span>
                        )}
                        {item.distance && (
                          <div className="flex items-center gap-1 text-gray-400">
                            <MapPin size={10} />
                            <span className="text-[12px]">{item.distance} كم</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronLeft size={20} className="text-gray-300 group-hover:text-red-600 transition-colors" />
                  </div>
                ))
              ) : (
                <div className="text-center py-20">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mx-auto mb-4">
                    <Search size={48} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">لم نجد أي نتائج تطابق بحثك</h3>
                  <p className="text-sm text-gray-500 mt-2">جرب تغيير الفلاتر أو البحث في "الكل"</p>
                  {activeFilterCount > 0 && (
                    <button 
                      onClick={() => setFilters({ minRating: 0, maxDistance: 10, sortBy: 'relevance', onlyOpen: false, subCategory: 'all' })}
                      className="mt-4 text-red-600 font-bold text-sm hover:underline"
                    >
                      إعادة تعيين الفلاتر
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filter Bottom Sheet */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/40 z-[60]"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-3xl z-[70] shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-gray-900">الفلاتر والترتيب</h3>
                <button onClick={() => setShowFilters(false)} className="p-2 bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {/* Category Selection (Inside Modal) */}
                <div>
                  <h4 className="font-bold text-gray-800 mb-3">القسم</h4>
                  <div className="flex flex-wrap gap-2">
                    {searchCategories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setActiveCategory(cat.id);
                          setFilters(prev => ({ ...prev, subCategory: 'all' }));
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          activeCategory === cat.id
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-white text-gray-500 border-gray-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Smart Sub-filters (Inside Modal) */}
                {activeCategory !== 'all' && categorySpecificFilters[activeCategory] && (
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3">التصنيف الفرعي</h4>
                    <div className="flex flex-wrap gap-2">
                      {categorySpecificFilters[activeCategory].map(sub => (
                        <button
                          key={sub}
                          onClick={() => setFilters(prev => ({ ...prev, subCategory: sub }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                            filters.subCategory === sub
                              ? 'bg-red-50 text-red-600 border-red-200'
                              : 'bg-white text-gray-500 border-gray-200'
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sort By */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <ArrowUpDown size={18} className="text-red-600" />
                    <h4 className="font-bold text-gray-800">ترتيب حسب</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'relevance', label: 'الأكثر صلة' },
                      { id: 'rating', label: 'الأعلى تقييماً' },
                      { id: 'distance', label: 'الأقرب مسافة' },
                      { id: 'price_low', label: 'السعر: من الأقل' },
                      { id: 'price_high', label: 'السعر: من الأعلى' },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setFilters({ ...filters, sortBy: opt.id })}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                          filters.sortBy === opt.id 
                            ? 'bg-red-600 text-white border-red-600 shadow-md' 
                            : 'bg-white text-gray-600 border-gray-200 hover:border-red-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Star size={18} className="text-red-600" />
                    <h4 className="font-bold text-gray-800">التقييم</h4>
                  </div>
                  <div className="flex gap-2">
                    {[0, 3, 4, 4.5].map(r => (
                      <button
                        key={r}
                        onClick={() => setFilters({ ...filters, minRating: r })}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all border flex items-center justify-center gap-1 ${
                          filters.minRating === r 
                            ? 'bg-red-600 text-white border-red-600 shadow-md' 
                            : 'bg-white text-gray-600 border-gray-200 hover:border-red-200'
                        }`}
                      >
                        {r === 0 ? 'الكل' : (
                          <>
                            <span>{r}+</span>
                            <Star size={14} fill={filters.minRating === r ? 'white' : '#f59e0b'} className={filters.minRating === r ? 'text-white' : 'text-amber-500'} />
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Distance */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Navigation size={18} className="text-red-600" />
                    <h4 className="font-bold text-gray-800">المسافة (حتى {filters.maxDistance} كم)</h4>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="20" 
                    step="1"
                    value={filters.maxDistance}
                    onChange={(e) => setFilters({ ...filters, maxDistance: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                  <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400">
                    <span>1 كم</span>
                    <span>20 كم</span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${filters.onlyOpen ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                      <Clock size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">مفتوح الآن فقط</h4>
                      <p className="text-[10px] text-gray-500">إظهار النتائج المتاحة حالياً</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setFilters({ ...filters, onlyOpen: !filters.onlyOpen })}
                    className={`w-12 h-6 rounded-full transition-all relative ${filters.onlyOpen ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${filters.onlyOpen ? 'right-7' : 'right-1'}`} />
                  </button>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => {
                    setFilters({ minRating: 0, maxDistance: 10, sortBy: 'relevance', onlyOpen: false, subCategory: 'all' });
                    setShowFilters(false);
                  }}
                  className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-colors"
                >
                  إعادة تعيين
                </button>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="flex-[2] py-4 bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95"
                >
                  تطبيق الفلاتر
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
