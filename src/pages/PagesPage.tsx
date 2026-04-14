import React from 'react';
import { 
  Flag, ArrowRight, Plus, Search, Trash2, Layout, 
  ChevronLeft, Check, Store, Briefcase, Wrench, 
  UtensilsCrossed, Car, Info, MapPin, Layers,
  Shirt, Cpu, Home as HomeIcon, Gift, Gamepad2, Sparkles, 
  ShoppingBag, Pencil, Armchair, Wrench as WrenchIcon, 
  Trash2 as TrashIcon, Truck, GraduationCap, Stethoscope,
  Building2, CarFront, Landmark, ShieldCheck, Utensils,
  Coffee, ShoppingCart, Beef, Fish, Croissant, Apple,
  Cookie, Leaf, IceCream, Pill, Users, Package,
  Facebook, Instagram, Mail, Phone, Calendar, Camera, Image as ImageIcon,
  MessageCircle, Globe, Share2, User, FileText, History, Award,
  Clock, XCircle
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORY_MAP } from '../constants/categories';
import MapPickerModal from '../components/MapPickerModal';

const ICON_MAP: Record<string, any> = {
  Shirt, Cpu, Home: HomeIcon, Gift, Gamepad2, Sparkles, 
  ShoppingBag, Pencil, Car, Armchair, Wrench: WrenchIcon, 
  Trash2: TrashIcon, Truck, GraduationCap, Stethoscope,
  Building2, CarFront, Landmark, ShieldCheck, Utensils,
  Coffee, ShoppingCart, Beef, Fish, Croissant, Apple,
  Cookie, Leaf, IceCream, Pill, Users, Package
};

export default function PagesPage({ onClose, initialMode = 'list' }: { onClose?: () => void, initialMode?: 'list' | 'create' }) {
  const { profiles, deleteProfile, switchProfile, activeProfileId, createProfile } = useUser();
  const myPages = profiles.filter(p => p.isPage);
  const [showCreateForm, setShowCreateForm] = React.useState(initialMode === 'create');
  const [toast, setToast] = React.useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const showToast = (message: string) => {
    setToast({ message, visible: true });
  };

  React.useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => setToast({ ...toast, visible: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  React.useEffect(() => {
    if (initialMode === 'create') {
      setShowCreateForm(true);
    }
  }, [initialMode]);

  const [step, setStep] = React.useState(1);
  const [showMapPicker, setShowMapPicker] = React.useState(false);
  const profileInputRef = React.useRef<HTMLInputElement>(null);
  const coverInputRef = React.useRef<HTMLInputElement>(null);

  const [newPage, setNewPage] = React.useState({
    name: '',
    place: 'merchant' as 'merchant' | 'provider' | 'deal_manager' | 'restaurant' | 'driver',
    categories: [] as string[],
    subCategories: [] as string[],
    description: '',
    shortBio: '',
    address: '',
    mobile: '',
    whatsapp: '',
    email: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    birthDate: '',
    workExperience: '',
    profileImage: null as string | null,
    coverImage: null as string | null
  });

  const handleCreate = async () => {
    if (!newPage.name) return;
    await createProfile({
      name: newPage.name,
      mode: newPage.place,
      description: newPage.description,
      location: newPage.address,
      categories: [...newPage.categories, ...newPage.subCategories],
      avatar: newPage.profileImage || `https://picsum.photos/seed/${Date.now()}/100/100`,
      cover: newPage.coverImage || `https://picsum.photos/seed/${Date.now() + 1}/800/400`,
      shortBio: newPage.shortBio,
      phone: newPage.mobile,
      whatsapp: newPage.whatsapp,
      facebook: newPage.facebook,
      instagram: newPage.instagram,
      tiktok: newPage.tiktok,
      birthDate: newPage.birthDate,
      workExperience: newPage.workExperience
    });
    showToast('تم إنشاء الصفحة بنجاح');
    setShowCreateForm(false);
    setStep(1);
    setNewPage({
      name: '',
      place: 'merchant',
      categories: [],
      subCategories: [],
      description: '',
      shortBio: '',
      address: '',
      mobile: '',
      whatsapp: '',
      email: '',
      facebook: '',
      instagram: '',
      tiktok: '',
      birthDate: '',
      workExperience: '',
      profileImage: null,
      coverImage: null
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPage(prev => ({
          ...prev,
          [type === 'profile' ? 'profileImage' : 'coverImage']: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (showCreateForm) {
    const places = [
      { id: 'merchant', label: 'ميركاتو', ownerLabel: 'تاجر فى الميركاتو', icon: Store, color: 'text-blue-600', bg: 'bg-blue-50' },
      { id: 'provider', label: 'اسيستو', ownerLabel: 'مقدم خدمه', icon: Wrench, color: 'text-orange-600', bg: 'bg-orange-50' },
      { id: 'deal_manager', label: 'ديلز', ownerLabel: 'مدير صفقات', icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
      { id: 'restaurant', label: 'فريش مارت', ownerLabel: 'وكيل فريش مارت', icon: UtensilsCrossed, color: 'text-red-600', bg: 'bg-red-50' },
      { id: 'driver', label: 'وصلنى', ownerLabel: 'سائق', icon: Car, color: 'text-green-600', bg: 'bg-green-50' }
    ];

    const currentPlace = places.find(p => p.id === newPage.place);

    return (
      <div className="flex flex-col h-full bg-white font-sans">
        <header className="px-4 py-4 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => step > 1 ? setStep(step - 1) : setShowCreateForm(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ArrowRight size={20} className="text-gray-900" />
            </button>
            <div>
              <h2 className="text-lg font-black text-gray-900 leading-tight">إنشاء صفحة</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">الخطوة {step} من 4</p>
            </div>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'w-6 bg-red-600' : 'w-2 bg-gray-100'}`} />
            ))}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-8 pb-32"
              >
                {/* Page Name Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-base text-gray-900 leading-tight">اسم الصفحة</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Page Name</p>
                    </div>
                  </div>
                  <input 
                    type="text" 
                    value={newPage.name}
                    onChange={e => setNewPage({...newPage, name: e.target.value})}
                    placeholder="اكتب اسم الصفحة هنا..."
                    dir="rtl"
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-gray-100 focus:border-red-600 focus:bg-white transition-all font-bold text-gray-900 placeholder:text-gray-300 shadow-sm text-right outline-none"
                  />
                </div>

                {/* Place Selection Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-base text-gray-900 leading-tight">اختار المكان اللى عايز تظهر فيه</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Choose Platform</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {places.map(place => (
                      <button
                        key={place.id}
                        onClick={() => setNewPage({...newPage, place: place.id as any, categories: [], subCategories: []})}
                        className={`group relative flex flex-col items-center justify-center p-3 rounded-3xl border-2 transition-all duration-300 ${
                          newPage.place === place.id 
                            ? 'border-red-600 bg-red-50 shadow-lg shadow-red-100/50 scale-[1.02]' 
                            : 'border-gray-100 bg-white hover:border-gray-200'
                        }`}
                      >
                        <div className={`p-3 rounded-xl mb-2 transition-colors ${newPage.place === place.id ? 'bg-red-600 text-white' : `${place.bg} ${place.color}`}`}>
                          <place.icon size={20} />
                        </div>
                        <p className={`font-black text-[11px] mb-0.5 ${newPage.place === place.id ? 'text-red-600' : 'text-gray-900'}`}>{place.label}</p>
                        <p className="text-[8px] font-bold text-gray-400 text-center leading-tight">{place.ownerLabel}</p>
                        {newPage.place === place.id && (
                          <div className="absolute top-2 left-2 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg">
                            <Check size={10} strokeWidth={4} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categories Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                      <Layers size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-base text-gray-900 leading-tight">اختار نوع نشاطتك من الاقسام</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Categories</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {CATEGORY_MAP[newPage.place]?.map((cat, idx) => {
                      const Icon = ICON_MAP[cat.icon] || Layers;
                      const isCatSelected = newPage.categories.includes(cat.label);
                      
                      return (
                        <div key={cat.label} className={`rounded-3xl border-2 transition-all overflow-hidden ${
                          isCatSelected ? 'border-red-600 bg-red-50/30' : 'border-gray-100 bg-white'
                        }`}>
                          <button
                            onClick={() => {
                              if (isCatSelected) {
                                setNewPage({
                                  ...newPage, 
                                  categories: newPage.categories.filter(c => c !== cat.label),
                                  subCategories: newPage.subCategories.filter(sc => !cat.sub?.includes(sc))
                                });
                              } else {
                                setNewPage({...newPage, categories: [...newPage.categories, cat.label]});
                              }
                            }}
                            className="w-full flex items-center gap-3 p-4 text-right"
                          >
                            <div className={`p-2.5 rounded-xl transition-colors ${isCatSelected ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                              <Icon size={18} />
                            </div>
                            <div className="flex-1">
                              <span className={`font-black text-sm block ${isCatSelected ? 'text-red-600' : 'text-gray-900'}`}>{cat.label}</span>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">قسم رئيسي</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${isCatSelected ? 'bg-red-600 text-white rotate-0' : 'bg-gray-100 text-gray-300 rotate-45'}`}>
                              {isCatSelected ? <Check size={12} strokeWidth={4} /> : <Plus size={12} strokeWidth={4} />}
                            </div>
                          </button>
                          
                          {cat.sub && (
                            <div className={`px-4 pb-4 pt-1 border-t border-dashed transition-all ${isCatSelected ? 'border-red-100' : 'border-gray-50'}`}>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">الأقسام الفرعية المتاحة</p>
                              <div className="flex flex-wrap gap-1.5">
                                {cat.sub.map(sub => {
                                  const isSubSelected = newPage.subCategories.includes(sub);
                                  return (
                                    <button
                                      key={sub}
                                      onClick={() => {
                                        // Auto-select parent category if sub-category is selected
                                        let updatedCategories = [...newPage.categories];
                                        if (!isCatSelected) {
                                          updatedCategories.push(cat.label);
                                        }

                                        setNewPage({
                                          ...newPage,
                                          categories: updatedCategories,
                                          subCategories: isSubSelected 
                                            ? newPage.subCategories.filter(s => s !== sub)
                                            : [...newPage.subCategories, sub]
                                        });
                                      }}
                                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black border-2 transition-all ${
                                        isSubSelected
                                          ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100'
                                          : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                                      }`}
                                    >
                                      {sub}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-8"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <Info size={18} />
                    <h3 className="font-black text-sm uppercase tracking-tight">نبذة عن الصفحة والسيرة الذاتية</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">اكتب نبذه عن صفحتك</label>
                    <textarea 
                      value={newPage.description}
                      onChange={e => setNewPage({...newPage, description: e.target.value})}
                      placeholder="اكتب وصفاً مختصراً لنشاطك..."
                      className="w-full p-5 bg-gray-50 rounded-[2rem] border-2 border-transparent focus:border-red-600 focus:bg-white transition-all font-bold text-gray-900 h-32 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">مربع السيره الذاتيه</label>
                    <textarea 
                      value={newPage.shortBio}
                      onChange={e => setNewPage({...newPage, shortBio: e.target.value})}
                      placeholder="اكتب سيرتك الذاتية أو قصة نجاحك..."
                      className="w-full p-5 bg-gray-50 rounded-[2rem] border-2 border-transparent focus:border-red-600 focus:bg-white transition-all font-bold text-gray-900 h-32 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">عنوان النشاط</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={newPage.address}
                        onChange={e => setNewPage({...newPage, address: e.target.value})}
                        placeholder="العنوان بالتفصيل..."
                        dir="rtl"
                        className="w-full p-5 bg-gray-50 rounded-3xl border-2 border-transparent focus:border-red-600 focus:bg-white transition-all font-bold text-gray-900 text-right outline-none"
                      />
                      <button 
                        onClick={() => setShowMapPicker(true)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-white text-red-600 rounded-2xl shadow-sm border border-gray-100 hover:bg-red-50 transition-all active:scale-90"
                        title="اختر من الخريطة"
                      >
                        <MapPin size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-8"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <Phone size={18} />
                    <h3 className="font-black text-sm uppercase tracking-tight">بيانات التواصل</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">رقم الموبايل</label>
                      <div className="relative">
                        <input 
                          type="tel" 
                          value={newPage.mobile}
                          onChange={e => setNewPage({...newPage, mobile: e.target.value})}
                          placeholder="01xxxxxxxxx"
                          className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-red-600 focus:bg-white transition-all font-bold text-gray-900"
                        />
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">رقم الواتساب</label>
                      <div className="relative">
                        <input 
                          type="tel" 
                          value={newPage.whatsapp}
                          onChange={e => setNewPage({...newPage, whatsapp: e.target.value})}
                          placeholder="01xxxxxxxxx"
                          className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-red-600 focus:bg-white transition-all font-bold text-gray-900"
                        />
                        <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">البريد الإلكتروني</label>
                      <div className="relative">
                        <input 
                          type="email" 
                          value={newPage.email}
                          onChange={e => setNewPage({...newPage, email: e.target.value})}
                          placeholder="example@mail.com"
                          className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-red-600 focus:bg-white transition-all font-bold text-gray-900"
                        />
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <Share2 size={18} />
                    <h3 className="font-black text-sm uppercase tracking-tight">روابط التواصل الاجتماعي</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">رابط فيسبوك</label>
                      <div className="relative">
                        <input 
                          type="url" 
                          value={newPage.facebook}
                          onChange={e => setNewPage({...newPage, facebook: e.target.value})}
                          placeholder="https://facebook.com/yourpage"
                          className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-red-600 focus:bg-white transition-all font-bold text-gray-900"
                        />
                        <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">رابط انستجرام</label>
                      <div className="relative">
                        <input 
                          type="url" 
                          value={newPage.instagram}
                          onChange={e => setNewPage({...newPage, instagram: e.target.value})}
                          placeholder="https://instagram.com/yourpage"
                          className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-red-600 focus:bg-white transition-all font-bold text-gray-900"
                        />
                        <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">رابط تيك توك</label>
                      <div className="relative">
                        <input 
                          type="url" 
                          value={newPage.tiktok}
                          onChange={e => setNewPage({...newPage, tiktok: e.target.value})}
                          placeholder="https://tiktok.com/@yourpage"
                          className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-red-600 focus:bg-white transition-all font-bold text-gray-900"
                        />
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-8"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <History size={18} />
                    <h3 className="font-black text-sm uppercase tracking-tight">الخبرة والتاريخ</h3>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">تاريخ تأسيس النشاط</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        value={newPage.birthDate}
                        onChange={e => setNewPage({...newPage, birthDate: e.target.value})}
                        className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-red-600 focus:bg-white transition-all font-bold text-gray-900"
                      />
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">الخبره العلميه</label>
                    <textarea 
                      value={newPage.workExperience}
                      onChange={e => setNewPage({...newPage, workExperience: e.target.value})}
                      placeholder="اكتب خبراتك العلمية والعملية..."
                      className="w-full p-5 bg-gray-50 rounded-[2rem] border-2 border-transparent focus:border-red-600 focus:bg-white transition-all font-bold text-gray-900 h-32 resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <Camera size={18} />
                    <h3 className="font-black text-sm uppercase tracking-tight">الصور والهوية البصرية</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">إضافة صوره شخصيه</label>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200 shadow-inner">
                          {newPage.profileImage ? (
                            <img src={newPage.profileImage} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <User size={32} className="text-gray-300" />
                          )}
                        </div>
                        <input 
                          type="file" 
                          ref={profileInputRef} 
                          onChange={(e) => handleFileChange(e, 'profile')} 
                          accept="image/*" 
                          className="hidden" 
                        />
                        <button 
                          onClick={() => profileInputRef.current?.click()}
                          className="px-6 py-3 bg-white border-2 border-gray-100 text-gray-900 rounded-2xl text-xs font-black hover:border-red-200 hover:bg-red-50 transition-all active:scale-95"
                        >
                          اختيار صورة
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">إضافة صوره للغلاف</label>
                      <div className="space-y-3">
                        <div className="w-full h-32 rounded-[2rem] bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200 shadow-inner">
                          {newPage.coverImage ? (
                            <img src={newPage.coverImage} alt="Cover" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={32} className="text-gray-300" />
                          )}
                        </div>
                        <input 
                          type="file" 
                          ref={coverInputRef} 
                          onChange={(e) => handleFileChange(e, 'cover')} 
                          accept="image/*" 
                          className="hidden" 
                        />
                        <button 
                          onClick={() => coverInputRef.current?.click()}
                          className="w-full py-4 bg-white border-2 border-gray-100 text-gray-900 rounded-2xl text-xs font-black hover:border-red-200 hover:bg-red-50 transition-all active:scale-95"
                        >
                          اختيار غلاف
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className="p-6 bg-white border-t border-gray-100 sticky bottom-0 z-20">
          <div className="flex gap-3">
            {step > 1 && (
              <button 
                onClick={() => setStep(step - 1)}
                className="flex-1 py-5 bg-gray-100 text-gray-900 rounded-[2rem] font-black transition-all active:scale-95"
              >
                السابق
              </button>
            )}
            <button 
              onClick={() => {
                if (step < 4) {
                  if (step === 1 && !newPage.name) return;
                  setStep(step + 1);
                } else {
                  handleCreate();
                }
              }}
              disabled={step === 1 && !newPage.name}
              className={`flex-[2] py-5 text-white rounded-[2rem] font-black shadow-xl transition-all active:scale-95 disabled:opacity-50 ${
                step === 4 ? 'bg-green-600 shadow-green-100' : 'bg-red-600 shadow-red-100'
              }`}
            >
              {step === 4 ? 'تأكيد وإنشاء الصفحة' : 'المتابعة'}
            </button>
          </div>
        </footer>

        {showMapPicker && (
          <MapPickerModal
            isOpen={showMapPicker}
            onClose={() => setShowMapPicker(false)}
            title="حدد موقع الصفحة على الخريطة"
            initialLocation={newPage.address}
            onSelect={(address) => {
              setNewPage({ ...newPage, address });
              setShowMapPicker(false);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
              <ArrowRight size={24} className="text-gray-900" />
            </button>
          )}
          <h2 className="text-xl font-bold text-gray-900">الصفحات</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 bg-gray-100 rounded-full"><Search size={20} /></button>
          <button onClick={() => setShowCreateForm(true)} className="p-2 bg-red-600 text-white rounded-full shadow-lg shadow-red-100">
            <Plus size={20} />
          </button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button className="px-4 py-2 bg-red-100 text-red-600 rounded-full text-sm font-bold whitespace-nowrap">صفحاتك</button>
          <button className="px-4 py-2 bg-gray-200 text-gray-600 rounded-full text-sm font-bold whitespace-nowrap">اكتشاف</button>
          <button className="px-4 py-2 bg-gray-200 text-gray-600 rounded-full text-sm font-bold whitespace-nowrap">دعوات</button>
        </div>

        {/* User's Pages */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-900">صفحاتك ({myPages.length})</h3>
          {myPages.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl text-center border border-dashed border-gray-200">
              <p className="text-gray-400 font-bold">لم تقم بإنشاء أي صفحات بعد</p>
            </div>
          ) : (
            myPages.map(page => (
              <div key={page.id} className="bg-white p-3 rounded-xl shadow-sm flex items-center gap-3">
                <img src={page.avatar} alt={page.name} className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{page.name}</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{page.mode}</p>
                </div>
                <div className="flex gap-2">
                  {page.status === 'pending' ? (
                    <div className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black border border-amber-100 flex items-center gap-1">
                      <Clock size={10} />
                      بانتظار الموافقة
                    </div>
                  ) : page.status === 'rejected' ? (
                    <div className="flex flex-col items-end gap-1">
                      <div className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-black border border-red-100 flex items-center gap-1">
                        <XCircle size={10} />
                        مرفوض
                      </div>
                      {page.rejectionReason && (
                        <p className="text-[8px] font-bold text-red-400 max-w-[120px] text-left">السبب: {page.rejectionReason}</p>
                      )}
                    </div>
                  ) : (
                    <button 
                      onClick={() => switchProfile(page.id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                        activeProfileId === page.id 
                          ? 'bg-green-50 text-green-600' 
                          : 'bg-red-600 text-white shadow-sm shadow-red-100'
                      }`}
                    >
                      {activeProfileId === page.id ? 'نشط حالياً' : 'تبديل الحساب'}
                    </button>
                  )}
                  <button 
                    onClick={() => deleteProfile(page.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-gray-900">اكتشاف صفحات جديدة</h3>
          {profiles.filter(p => p.isPage && p.id !== activeProfileId).map(page => (
            <div key={page.id} className="bg-white p-3 rounded-xl shadow-sm flex items-center gap-3">
              <img src={page.avatar} alt={page.name} className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
              <div className="flex-1">
                <h4 className="font-bold text-gray-900">{page.name}</h4>
                <p className="text-xs text-gray-500">{Math.floor(Math.random() * 1000)} إعجاب</p>
              </div>
              <button className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold">عرض</button>
            </div>
          ))}
        </div>
      </div>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-4 right-4 z-[300] flex justify-center"
          >
            <div className="bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
              <div className="p-1 bg-red-600 rounded-lg">
                <Layout size={14} className="text-white" />
              </div>
              <span className="text-sm font-bold">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
