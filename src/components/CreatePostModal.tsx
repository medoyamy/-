import React, { useState } from 'react';
import { 
  X, 
  Camera, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Zap, 
  Users, 
  Clock, 
  Star, 
  TrendingUp, 
  Bell, 
  Repeat,
  ChevronDown,
  CheckCircle2,
  Gem,
  Video,
  UserPlus,
  AtSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { usePosts, Post } from '../context/PostContext';
import { useUser } from '../context/UserContext';
import { EGYPT_CITIES } from '../locationData';
import MapPickerModal from './MapPickerModal';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any; // For editing
}

export default function CreatePostModal({ isOpen, onClose, initialData }: CreatePostModalProps) {
  const { addPost, updatePost } = usePosts();
  const { userMode, userName, activeProfile, updatePoints, currentCity, currentRegion } = useUser();
  const getDefaultSource = () => {
    switch (userMode) {
      case 'merchant': return 'mercato';
      case 'provider': return 'assisto';
      case 'driver': return 'driver';
      case 'deal_manager': return 'deals';
      case 'restaurant': return 'restaurants';
      default: return 'avalon';
    }
  };
  const [source, setSource] = useState(getDefaultSource());
  const [category, setCategory] = useState(userMode === 'merchant' ? 'سوبر ماركت' : '');
  const [offerType, setOfferType] = useState<'individual' | 'group'>('individual');
  const [price, setPrice] = useState('');
  const [storeAddress, setStoreAddress] = useState('حي الجامعة، المنصورة');
  const [content, setContent] = useState('');
  const [budget, setBudget] = useState('');
  const [duration, setDuration] = useState('24 ساعة');
  const [pickup, setPickup] = useState('');
  const [pickupCoords, setPickupCoords] = useState<any>(null);
  const [delivery, setDelivery] = useState('');
  const [deliveryCoords, setDeliveryCoords] = useState<any>(null);
  const [contactMethod, setContactMethod] = useState<'call' | 'message' | 'both'>('both');
  const [image, setImage] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [taggedFriends, setTaggedFriends] = useState<string[]>([]);
  const [showPremium, setShowPremium] = useState(false);
  const [selectedBoosts, setSelectedBoosts] = useState<string[]>([]);
  const [goToStore, setGoToStore] = useState(false);
  const [type, setType] = useState<Post['type']>(userMode === 'user' ? 'request' : 'offer');
  const [city, setCity] = useState(currentCity);
  const [region, setRegion] = useState(currentRegion);

  // Sync state with initialData when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSource(initialData?.source || getDefaultSource());
      setCategory(initialData?.category || (userMode === 'merchant' ? 'سوبر ماركت' : ''));
      setType(initialData?.type || (userMode === 'user' ? 'request' : 'offer'));
      setOfferType(initialData?.offerType || 'individual');
      setPrice(initialData?.price || '');
      setStoreAddress(initialData?.storeAddress || 'حي الجامعة، المنصورة');
      setContent(initialData?.content || '');
      setBudget(initialData?.budget || '');
      setDuration(initialData?.duration || '24 ساعة');
      setPickup(initialData?.pickup || '');
      setPickupCoords(initialData?.pickupCoords || null);
      setDelivery(initialData?.delivery || '');
      setDeliveryCoords(initialData?.deliveryCoords || null);
      setContactMethod(initialData?.contactMethod || 'both');
      setImage(initialData?.image || null);
      setVideo(initialData?.video || null);
      setTaggedFriends(initialData?.taggedFriends || []);
      setSelectedBoosts(initialData?.boosts || []);
      setGoToStore(initialData?.goToStore || false);
      setCity(initialData?.city || currentCity);
      setRegion(initialData?.region || currentRegion);
    }
  }, [isOpen, initialData, userMode, currentCity, currentRegion]);
  
  const [mapPickerType, setMapPickerType] = useState<'pickup' | 'delivery' | null>(null);
  const [showTagFriends, setShowTagFriends] = useState(false);
  const [friendSearch, setFriendSearch] = useState('');

  const durations = ['12 ساعة', '24 ساعة', '48 ساعة', 'أسبوع', 'شهر'];
  const mockFriends = ['أحمد', 'سارة', 'ياسين', 'ليلى', 'محمد', 'منى', 'كريم', 'هاني'];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'image') setImage(reader.result as string);
        else setVideo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleFriend = (friend: string) => {
    setTaggedFriends(prev => 
      prev.includes(friend) ? prev.filter(f => f !== friend) : [...prev, friend]
    );
  };

  const handleSubmit = async () => {
    const totalCost = selectedBoosts.reduce((acc, bid) => {
      const opt = premiumOptions.find(o => o.id === bid);
      return acc + (opt?.cost || 0);
    }, 0);

    if (totalCost > (activeProfile.points || 0)) {
      alert('عذراً، نقاطك غير كافية');
      return;
    }

    const isJobOffer = source === 'job_offer';
    const isJobRequest = source === 'job_request';

    const postData: Omit<Post, 'id' | 'authorId' | 'status' | 'createdAt'> = {
      author: userName,
      content,
      category,
      source: (isJobOffer || isJobRequest) ? 'jobs' : source,
      type: isJobOffer ? 'offer' : (isJobRequest ? 'request' : type),
      jobType: isJobOffer ? 'offer' : (isJobRequest ? 'request' : undefined),
      budget,
      duration,
      pickup,
      pickupCoords,
      delivery,
      deliveryCoords,
      contactMethod,
      image: image || undefined,
      video: video || undefined,
      taggedFriends,
      boosts: selectedBoosts,
      city,
      region,
      offerType: userMode === 'merchant' ? offerType : undefined,
      price: userMode === 'merchant' ? Number(price) : undefined,
      storeAddress: userMode === 'merchant' ? storeAddress : undefined,
      goToStore: userMode === 'merchant' ? goToStore : undefined,
      lat: pickupCoords?.lat || undefined,
      lng: pickupCoords?.lng || undefined,
    };

    try {
      if (initialData) {
        await updatePost(initialData.id, postData);
      } else {
        await addPost(postData);
        if (totalCost > 0) {
          await updatePoints(activeProfile.id, -totalCost);
        }
      }
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('حدث خطأ أثناء النشر');
    }
  };

  const sources = [
    { id: 'avalon', label: 'افالون', icon: '✨' },
    { id: 'mercato', label: 'الميركاتو', icon: '🛒' },
    { id: 'assisto', label: 'الاسيستو', icon: '🛠️' },
    { id: 'deals', label: 'ديلز', icon: '🏷️' },
    { id: 'fresh_mart', label: 'فريش مارت', icon: '🥬' },
    { id: 'job_offer', label: 'عرض وظيفة', icon: '💼' },
    { id: 'job_request', label: 'طلب وظيفة', icon: '📝' },
    { id: 'driver', label: 'سائق', icon: '🚗' },
    { id: 'restaurants', label: 'مطاعم', icon: '🍕' },
    { id: 'group_mercato', label: userMode === 'merchant' ? 'عرض جماعي ميركاتو' : 'طلب جماعي ميركاتو', icon: '👥🛒' },
    { id: 'group_restaurants', label: userMode === 'merchant' ? 'عرض جماعي مطاعم' : 'طلب جماعي مطاعم', icon: '👥🍕' },
  ];

  const categoriesMap: Record<string, string[]> = {
    avalon: ['عام', 'يوميات', 'سؤال', 'اقتراح', 'أخرى'],
    mercato: ['سوبر ماركت', 'صيدليات', 'خضروات وفواكه', 'لحوم ودواجن', 'مخبوزات', 'أدوات منزلية'],
    assisto: ['سباكة', 'كهرباء', 'تنظيف', 'نجارة', 'تكييفات', 'دهانات'],
    deals: ['إلكترونيات', 'ملابس', 'أثاث', 'تجميل', 'ساعات'],
    fresh_mart: ['خضروات', 'فواكه', 'ألبان', 'بقوليات', 'مجمدات', 'منظفات'],
    job_offer: ['هندسة', 'طب وصيدلة', 'تعليم وتدريس', 'برمجة وتقنية', 'حرف ومهن', 'سائقين وتوصيل', 'مبيعات', 'تسويق وإعلام'],
    job_request: ['هندسة', 'طب وصيدلة', 'تعليم وتدريس', 'برمجة وتقنية', 'حرف ومهن', 'سائقين وتوصيل', 'مبيعات', 'تسويق وإعلام'],
    driver: ['سيارة ملاكي', 'دراجة نارية', 'ميكروباص', 'ونش', 'نقل ثقيل'],
    restaurants: ['بيتزا', 'برجر', 'وجبات سريعة', 'مشويات', 'حلويات', 'مشروبات'],
    group_mercato: ['مواد غذائية', 'منظفات', 'عروض كرتونة', 'جملة'],
    group_restaurants: ['وجبات عائلية', 'عروض أصدقاء', 'ولائم'],
  };

  const premiumOptions = userMode === 'merchant' ? [
    { id: 'highlight', label: 'تمييز المنشور', icon: TrendingUp, cost: 10, desc: 'يظهر بخلفية ذهبية مميزة' },
    { id: 'quick', label: 'منشور سريع', icon: Zap, cost: 15, desc: 'يظهر في تبويب الطلبات السريعة' },
    { id: 'top', label: 'يظهر أولاً', icon: Star, cost: 20, desc: 'يثبت في أعلى الصفحة لمدة 24 ساعة' },
    { id: 'repeat', label: 'تكرار المنشور', icon: Repeat, cost: 25, desc: 'يعاد نشره تلقائياً كل 6 ساعات' },
    { id: 'notify_nearby', label: 'إشعار للعملاء القريبين', icon: Bell, cost: 30, desc: 'تنبيه فوري لكل من في محيط 5 كم' },
  ] : [
    { id: 'urgent', label: 'منشور طارئ / مستعجل', icon: Zap, cost: 10, desc: 'يظهر بعلامة حمراء مميزة' },
    { id: 'top', label: 'الظهور الأول', icon: Star, cost: 15, desc: 'يثبت في أعلى الصفحة لمدة ساعة' },
    { id: 'repeat', label: 'تكرار المنشور', icon: Repeat, cost: 20, desc: 'يعاد نشره تلقائياً كل 4 ساعات' },
    { id: 'notify', label: 'إشعار للقريبين', icon: Bell, cost: 25, desc: 'يرسل تنبيه فوري للمستخدمين في محيطك' },
    { id: 'highlight', label: 'تمييز لوني', icon: TrendingUp, cost: 5, desc: 'خلفية ملونة تجذب الانتباه' },
  ];

  const toggleBoost = (id: string, cost: number) => {
    if (selectedBoosts.includes(id)) {
      setSelectedBoosts(prev => prev.filter(b => b !== id));
    } else {
      const currentPoints = activeProfile.points || 0;
      const totalCost = selectedBoosts.reduce((acc, bid) => {
        const opt = premiumOptions.find(o => o.id === bid);
        return acc + (opt?.cost || 0);
      }, 0);

      if (currentPoints >= totalCost + cost) {
        setSelectedBoosts(prev => [...prev, id]);
      } else {
        alert('عذراً، نقاطك غير كافية لتفعيل هذا التميز');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          className="bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
            <h2 className="text-xl font-black text-gray-900">
              {userMode === 'merchant' ? 'إنشاء عرض أو منشور تجاري' : 
               userMode === 'provider' ? 'إنشاء منشور خدمة' : 'إنشاء منشور جديد'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            {/* Source Selection */}
            {userMode !== 'merchant' && (
              <div className="space-y-3">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">اختر المصدر</label>
                <div className="grid grid-cols-4 gap-2">
                  {sources.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSource(s.id);
                        setCategory('');
                      }}
                      className={`flex flex-col items-center gap-1 p-2 rounded-2xl border-2 transition-all ${
                        source === s.id 
                          ? 'border-red-600 bg-red-50 text-red-600' 
                          : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                      }`}
                    >
                      <span className="text-xl">{s.icon}</span>
                      <span className="text-[10px] font-bold text-center leading-tight">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category Selection */}
            {userMode !== 'merchant' && (
              <div className="space-y-3">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">القسم / الفئة</label>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {categoriesMap[source]?.map((cat, i) => (
                    <button
                      key={`${cat}-${i}`}
                      onClick={() => setCategory(cat)}
                      className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        category === cat 
                          ? 'bg-gray-900 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* City & Region Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">المدينة</label>
                <div className="relative">
                  <select 
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setRegion('الكل');
                    }}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-xs font-bold outline-none focus:ring-2 focus:ring-red-100 appearance-none"
                  >
                    {EGYPT_CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">المنطقة</label>
                <div className="relative">
                  <select 
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-xs font-bold outline-none focus:ring-2 focus:ring-red-100 appearance-none"
                  >
                    {EGYPT_CITIES.find(c => c.name === city)?.regions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Content Input */}
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                {userMode === 'merchant' ? 'تفاصيل العرض أو المنشور' : 'ماذا تريد أن تنشر؟'}
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={userMode === 'merchant' ? "اكتب تفاصيل عرضك، مواصفات المنتج، أو أي إعلان تجاري..." : "اكتب تفاصيل طلبك أو عرضك هنا..."}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-medium min-h-[120px] outline-none focus:ring-2 focus:ring-red-100 transition-all"
              />
            </div>

            {/* Image & Video Upload */}
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">إضافة وسائط</label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <Camera size={24} className="text-gray-400 mb-1" />
                  <span className="text-[10px] font-bold text-gray-400">رفع صورة</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} />
                </label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <Video size={24} className="text-gray-400 mb-1" />
                  <span className="text-[10px] font-bold text-gray-400">رفع فيديو</span>
                  <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, 'video')} />
                </label>
              </div>
              
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {image && (
                  <div className="relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border border-gray-100">
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    <button onClick={() => setImage(null)} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full">
                      <X size={12} />
                    </button>
                  </div>
                )}
                {video && (
                  <div className="relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border border-gray-100 bg-black">
                    <video src={video} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <Video size={20} className="text-white/50" />
                    </div>
                    <button onClick={() => setVideo(null)} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full">
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tag Friends */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">إشارة للأصدقاء</label>
                <button 
                  onClick={() => setShowTagFriends(!showTagFriends)}
                  className="flex items-center gap-1 text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg"
                >
                  <UserPlus size={12} />
                  {showTagFriends ? 'إغلاق' : 'إضافة منشن'}
                </button>
              </div>

              {showTagFriends && (
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                  <div className="relative">
                    <AtSign size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      value={friendSearch}
                      onChange={(e) => setFriendSearch(e.target.value)}
                      placeholder="ابحث عن صديق..."
                      className="w-full bg-white border border-gray-200 rounded-xl py-2 pr-9 pl-3 text-[10px] font-bold outline-none"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mockFriends.filter(f => f.includes(friendSearch)).map(friend => (
                      <button
                        key={friend}
                        onClick={() => toggleFriend(friend)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                          taggedFriends.includes(friend) 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white text-gray-600 border border-gray-200'
                        }`}
                      >
                        {friend}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {taggedFriends.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {taggedFriends.map(f => (
                    <span key={f} className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md">@{f}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Budget & Duration & Price */}
            <div className="grid grid-cols-2 gap-3">
              {userMode === 'merchant' ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase">سعر العرض</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">ج.م</span>
                    <input 
                      type="text" 
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="مثلاً: 450"
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 pr-3 pl-10 text-xs font-bold outline-none focus:ring-2 focus:ring-red-100"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase">الميزانية</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">ج.م</span>
                    <input 
                      type="text" 
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="مثلاً: 500"
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 pr-3 pl-10 text-xs font-bold outline-none focus:ring-2 focus:ring-red-100"
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase">مدة العرض</label>
                <div className="relative">
                  <select 
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-xs font-bold outline-none focus:ring-2 focus:ring-red-100 appearance-none"
                  >
                    {durations.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Store Address for Merchant */}
            {userMode === 'merchant' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase">عنوان المتجر</label>
                <div className="relative">
                  <MapPin size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    placeholder="عنوان المتجر بالتفصيل..."
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 pr-9 pl-3 text-xs font-bold outline-none focus:ring-2 focus:ring-red-100"
                  />
                </div>
              </div>
            )}

            {/* Go to Store Button Toggle for Merchant */}
            {userMode === 'merchant' && (
              <div className="space-y-3">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">خيارات إضافية</label>
                <button 
                  onClick={() => setGoToStore(!goToStore)}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 transition-all ${
                    goToStore ? 'border-gray-900 bg-gray-900 text-white shadow-lg' : 'border-gray-100 text-gray-400 hover:border-gray-200'
                  }`}
                >
                  <TrendingUp size={16} />
                  <span className="text-xs font-black">تفعيل زر الانتقال لصفحة المتجر</span>
                </button>
              </div>
            )}

            {/* Delivery/Pickup */}
            {userMode !== 'merchant' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase">مكان الاستلام</label>
                  <button 
                    onClick={() => setMapPickerType('pickup')}
                    className="w-full flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-right group hover:border-red-200 transition-all"
                  >
                    <MapPin size={14} className="text-gray-400 group-hover:text-red-500" />
                    <span className={`text-xs font-bold truncate ${pickup ? 'text-gray-900' : 'text-gray-400'}`}>
                      {pickup || 'حدد من الخريطة'}
                    </span>
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase">مكان التسليم</label>
                  <button 
                    onClick={() => setMapPickerType('delivery')}
                    className="w-full flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-right group hover:border-red-200 transition-all"
                  >
                    <MapPin size={14} className="text-gray-400 group-hover:text-red-500" />
                    <span className={`text-xs font-bold truncate ${delivery ? 'text-gray-900' : 'text-gray-400'}`}>
                      {delivery || 'حدد من الخريطة'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Contact Method */}
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">طريقة التواصل المفضلة</label>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => setContactMethod('call')}
                  className={`flex items-center justify-center gap-2 py-2 rounded-xl border-2 transition-all ${
                    contactMethod === 'call' ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-100 text-gray-400'
                  }`}
                >
                  <Phone size={16} />
                  <span className="text-xs font-bold">اتصال</span>
                </button>
                <button 
                  onClick={() => setContactMethod('message')}
                  className={`flex items-center justify-center gap-2 py-2 rounded-xl border-2 transition-all ${
                    contactMethod === 'message' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400'
                  }`}
                >
                  <MessageCircle size={16} />
                  <span className="text-xs font-bold">رسالة</span>
                </button>
                <button 
                  onClick={() => setContactMethod('both')}
                  className={`flex items-center justify-center gap-2 py-2 rounded-xl border-2 transition-all ${
                    contactMethod === 'both' ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-100 text-gray-400'
                  }`}
                >
                  <Users size={16} />
                  <span className="text-xs font-bold">الاثنين</span>
                </button>
              </div>
            </div>

            {/* Premium Subscription Button */}
            <div className="pt-2">
              <button 
                onClick={() => setShowPremium(!showPremium)}
                className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white p-4 rounded-3xl shadow-lg shadow-orange-100 flex items-center justify-between group overflow-hidden relative"
              >
                <div className="flex items-center gap-3 z-10">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                    <Gem size={24} className="animate-bounce" />
                  </div>
                  <div className="text-right">
                    <h3 className="font-black text-sm">عضوية التميز (نقاط الأفالون)</h3>
                    <p className="text-[10px] font-bold opacity-90">اشترك الآن واحصل على مميزات حصرية</p>
                  </div>
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-black z-10">
                  {activeProfile.points || 0} نقطة
                </div>
                <div className="absolute inset-0 bg-white/10 translate-x-full group-hover:translate-x-0 transition-transform duration-500 skew-x-12" />
              </button>

              <AnimatePresence>
                {showPremium && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 p-4 bg-amber-50 rounded-3xl border border-amber-100 space-y-3">
                      <h4 className="text-xs font-black text-amber-800">استخدم نقاطك لتمييز منشورك:</h4>
                      <div className="space-y-2">
                        {premiumOptions.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => toggleBoost(opt.id, opt.cost)}
                            className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${
                              selectedBoosts.includes(opt.id) 
                                ? 'bg-amber-500 text-white shadow-md' 
                                : 'bg-white text-gray-700 hover:bg-amber-100'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <opt.icon size={18} />
                              <div className="text-right">
                                <p className="text-xs font-bold">{opt.label}</p>
                                <p className={`text-[9px] ${selectedBoosts.includes(opt.id) ? 'text-white/80' : 'text-gray-400'}`}>
                                  {opt.desc}
                                </p>
                              </div>
                            </div>
                            <div className={`px-2 py-1 rounded-lg text-[10px] font-black ${
                              selectedBoosts.includes(opt.id) ? 'bg-white/20' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {opt.cost} نقطة
                            </div>
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-amber-600 text-center font-bold pt-2">
                        الاشتراك الشهري يمنحك 500 نقطة متجددة
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <MapPickerModal 
            isOpen={!!mapPickerType}
            onClose={() => setMapPickerType(null)}
            title={mapPickerType === 'pickup' ? 'تحديد مكان الاستلام' : 'تحديد مكان التسليم'}
            onSelect={(loc, coords) => {
              if (mapPickerType === 'pickup') {
                setPickup(loc);
                setPickupCoords(coords);
              } else {
                setDelivery(loc);
                setDeliveryCoords(coords);
              }
            }}
          />

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl text-sm font-black text-gray-500 hover:bg-gray-100 transition-colors"
            >
              إلغاء
            </button>
            <button 
              disabled={!content || (userMode !== 'merchant' && !category)}
              onClick={handleSubmit}
              className="flex-[2] py-4 bg-red-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-red-100 hover:bg-red-700 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
            >
              {initialData ? 'تحديث المنشور' : 'نشر الآن'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
