import React, { useState, useEffect } from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';
import { UnifiedMap } from '../components/UnifiedMap';
import { safeStringify } from '../lib/mapUtils';
import { syncStorage } from '../lib/storage';
import { 
  Store, 
  Tag, 
  Star, 
  Search, 
  ChevronLeft, 
  Filter, 
  ShoppingCart, 
  Plus, 
  Minus,
  Heart,
  ArrowLeft,
  ArrowRight,
  Car,
  Edit2,
  Trash2,
  Package,
  Layers,
  Settings as SettingsIcon,
  BarChart3,
  Clock,
  Users,
  Eye,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  DollarSign,
  Upload,
  Camera,
  Info,
  Calendar,
  Scale,
  MapPin,
  Navigation,
  Share2,
  TrendingDown,
  LayoutGrid,
  Map,
  Home,
  Shirt,
  Laptop,
  Smartphone,
  Flower2,
  BookOpen,
  Armchair,
  Sparkles,
  Gamepad2,
  Palette,
  Zap,
  HardHat,
  Microscope,
  Syringe,
  HeartPulse,
  Building2,
  Factory,
  Pickaxe,
  PencilRuler,
  DraftingCompass,
  Construction,
  GraduationCap,
  Wrench,
  Truck,
  Activity,
  Globe,
  Utensils,
  Plane,
  Music,
  Settings,
  Hammer,
  Wind,
  Scissors,
  Trophy,
  Handshake
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { useCart } from '../context/CartContext';
import { useUser, UserProfile } from '../context/UserContext';
import { usePosts } from '../context/PostContext';
import { useSettings } from '../context/SettingsContext';
import { useReviews } from '../context/ReviewContext';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle } from 'lucide-react';

const MercatoIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
  >
    {/* Shopping Bag Body */}
    <path d="M25,35 L75,35 L80,85 C80,88 78,90 75,90 L25,90 C22,90 20,88 20,85 Z" />
    {/* Handles */}
    <path d="M35,35 C35,20 45,15 50,15 C55,15 65,20 65,35" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    {/* "M" for Mercato on the bag */}
    <path d="M40,65 L45,50 L50,60 L55,50 L60,65" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function MercatoPage() {
  const { addToMercatoCart } = useCart();
  const { posts } = usePosts();
  const { appStructure, categories: allCategories, serviceTabs } = useSettings();
  const { addReview } = useReviews();
  const categories = allCategories['mercato'] || [];
  const { 
    userMode, 
    activeProfile, 
    profiles, 
    addProduct, 
    deleteProduct, 
    addInternalCategory, 
    deleteInternalCategory, 
    updateMainCategories,
    currentCity,
    currentRegion
  } = useUser();
  const dynamicTabs = (serviceTabs['mercato'] || []).filter(t => t.isActive && (t.userMode === 'user' || t.userMode === userMode));
  const merchantTabs = [
    { id: 'my-requests', label: 'طلبات الأقسام', icon: ClipboardList },
    { id: 'my-products', label: 'منتجاتي', icon: Package },
    { id: 'my-categories', label: 'أصنافي', icon: Layers },
    { id: 'my-stats', label: 'إحصائيات', icon: BarChart3 },
    { id: 'shop-settings', label: 'إعدادات المتجر', icon: SettingsIcon },
  ];
  const tabs = userMode === 'merchant' ? merchantTabs : dynamicTabs;

  const [activeTab, setActiveTab] = useState(() => {
    const saved = syncStorage.get('mercato_active_tab');
    if (saved) return saved;
    return userMode === 'merchant' ? 'my-requests' : (dynamicTabs[0]?.id || 'categories');
  });

  useEffect(() => {
    syncStorage.set('mercato_active_tab', activeTab);
  }, [activeTab]);
  const [viewingCategory, setViewingCategory] = useState<any | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [joinedGroups, setJoinedGroups] = useState<number[]>([]);
  const [showJoinOptions, setShowJoinOptions] = useState<number | null>(null);
  const [liveViewers, setLiveViewers] = useState<Record<number, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [selectedStore, setSelectedStore] = useState<UserProfile | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const handleAddReview = async () => {
    if (!selectedStore) return;
    await addReview({
      targetId: selectedStore.id,
      targetType: 'profile',
      userId: activeProfile?.id || 'anonymous',
      userName: activeProfile?.name || 'مستخدم',
      userAvatar: activeProfile?.avatar || '',
      rating,
      content: reviewComment,
      source: 'mercato'
    });
    setShowReviewModal(false);
    setReviewComment('');
    setRating(5);
  };
  const [selectedProductForCart, setSelectedProductForCart] = useState<any | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<{
    name: string;
    price: string;
    originalPrice: string;
    image: string;
    category: string;
    stock: string;
    unit: string;
    brand: string;
    expiryDate: string;
    weight: string;
    description: string;
    status: 'available' | 'out_of_stock' | 'preorder';
    options: { name: string; values: string }[];
  }>({ 
    name: '', 
    price: '', 
    originalPrice: '',
    image: '', 
    category: '', 
    stock: '', 
    unit: 'قطعة',
    brand: '',
    expiryDate: '',
    weight: '',
    description: '',
    status: 'available',
    options: [] 
  });
  const [isAddingInternalCategory, setIsAddingInternalCategory] = useState(false);
  const [newInternalCategory, setNewInternalCategory] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: 31.0409, lng: 31.3785 }); // Mansoura
  const [selectedMerchant, setSelectedMerchant] = useState<any | null>(null);
  const [realPlaces, setRealPlaces] = useState<google.maps.places.PlaceResult[]>([]);
  const [showUserLocationInfo, setShowUserLocationInfo] = useState(false);
  const [mapFilter, setMapFilter] = useState('all');

  // Back button handling
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state && state.type === 'mercato_category') {
        setActiveTab('categories');
        setViewingCategory(state.id);
        setSelectedSubCategory(null);
      } else if (state && state.type === 'mercato_subcategory') {
        setActiveTab('categories');
        setViewingCategory(state.catId);
        setSelectedSubCategory(state.id);
      } else if (state && state.type === 'tab' && state.id === 'mercato') {
        setViewingCategory(null);
        setSelectedSubCategory(null);
      } else {
        setViewingCategory(null);
        setSelectedSubCategory(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSetViewingCategory = (catId: string | null) => {
    if (catId) {
      window.history.pushState({ type: 'mercato_category', id: catId }, '');
      setViewingCategory(catId);
      setSelectedSubCategory(null);
    } else {
      if (window.history.state?.type === 'mercato_category' || window.history.state?.type === 'mercato_subcategory') {
        window.history.back();
      }
      setViewingCategory(null);
      setSelectedSubCategory(null);
    }
  };

  const handleSetSubCategory = (subId: string | null) => {
    if (subId && viewingCategory) {
      window.history.pushState({ type: 'mercato_subcategory', id: subId, catId: viewingCategory }, '');
      setSelectedSubCategory(subId);
    } else if (!subId && viewingCategory) {
      if (window.history.state?.type === 'mercato_subcategory') {
        window.history.back();
      }
      setSelectedSubCategory(null);
    }
  };

  const handleGetDirections = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) return;
    addProduct(activeProfile.id, {
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      originalPrice: newProduct.originalPrice ? parseFloat(newProduct.originalPrice) : undefined,
      image: newProduct.image || `https://picsum.photos/seed/${Math.random()}/300/300`,
      description: newProduct.description || 'وصف المنتج الجديد',
      category: newProduct.category,
      stock: parseInt(newProduct.stock) || 0,
      unit: newProduct.unit,
      brand: newProduct.brand,
      expiryDate: newProduct.expiryDate,
      weight: newProduct.weight,
      status: newProduct.status,
      options: newProduct.options.map(opt => ({
        name: opt.name,
        values: opt.values.split(',').map(v => v.trim()).filter(v => v)
      }))
    });
    setNewProduct({ 
      name: '', 
      price: '', 
      originalPrice: '',
      image: '', 
      category: '', 
      stock: '', 
      unit: 'قطعة',
      brand: '',
      expiryDate: '',
      weight: '',
      description: '',
      status: 'available',
      options: [] 
    });
    setIsAddingProduct(false);
  };

  const handleAddInternalCategory = () => {
    if (!newInternalCategory) return;
    addInternalCategory(activeProfile.id, newInternalCategory);
    setNewInternalCategory('');
    setIsAddingInternalCategory(false);
  };

  const merchantRequests = posts.filter(post => 
    post.source === 'mercato' && 
    (activeProfile.categories.length === 0 || activeProfile.categories.some(cat => post.category.includes(cat))) &&
    post.status === 'active'
  );

  // Find pages that match the selected category
  const categoryStores = profiles.filter(p => 
    p.isPage && 
    p.mode === 'merchant' && 
    // Location Filter (Geo-fencing)
    (!p.city || p.city === currentCity) &&
    selectedCategory && 
    p.categories.some(cat => cat.includes(selectedCategory.name) || selectedCategory.name.includes(cat))
  );

  React.useEffect(() => {
    const interval = setInterval(() => {
      const newViewers: Record<number, number> = {};
      [1, 2].forEach(id => {
        newViewers[id] = Math.floor(Math.random() * 20) + 5;
      });
      setLiveViewers(newViewers);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const toggleJoin = (id: number) => {
    if (joinedGroups.includes(id)) {
      setJoinedGroups(prev => prev.filter(p => p !== id));
    } else {
      setShowJoinOptions(id);
    }
  };

  const confirmJoin = (id: number) => {
    setJoinedGroups(prev => [...prev, id]);
    setShowJoinOptions(null);
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCategoryIcon = (iconName: string, size: number = 24) => {
    if (!iconName || iconName === 'None' || iconName === 'بدون ايقونة') return null;
    const iconMap: Record<string, any> = {
      Home, Shirt, Laptop, Smartphone, Flower2, BookOpen, Armchair, Sparkles, Gamepad2, Palette, Zap, LayoutGrid, Store, Tag, Star, Map, Users, ClipboardList, Package, Layers, BarChart3, SettingsIcon,
      HardHat, Microscope, Syringe, HeartPulse, Building2, Factory, Pickaxe, PencilRuler, DraftingCompass, Construction, GraduationCap, Wrench, Truck, Activity, Globe, Utensils, Plane, Music, Hammer, Wind, Scissors, Trophy, Handshake
    };
    const IconComponent = iconMap[iconName] || LayoutGrid;
    return <IconComponent size={size} />;
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header Branding & Search Bar */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          {viewingCategory ? (
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => window.history.back()}
              className="p-2 bg-white text-gray-400 rounded-xl shadow-sm border border-gray-100 hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all active:scale-90"
            >
              <ArrowRight size={24} />
            </motion.button>
          ) : (
            <div className="p-2 bg-red-600 text-white rounded-xl shadow-lg shadow-red-100">
              <MercatoIcon size={24} />
            </div>
          )}
          <div>
            <h1 className="text-xl font-black text-gray-900 leading-tight">
              {userMode === 'merchant' ? 'إدارة متجري' : 'ميركاتو'}
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {userMode === 'merchant' ? 'Merchant Management' : 'Marketplace'}
            </p>
          </div>
        </div>

        {userMode !== 'merchant' && (
          <div className="relative flex-1 max-w-[180px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              placeholder="بحث..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-xl py-2 pr-9 pl-3 text-xs font-medium shadow-sm outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-5 gap-1 pb-2 -mx-2 px-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id !== 'categories') {
                setViewingCategory(null);
                setSelectedSubCategory(null);
              }
            }}
            className={`flex flex-col items-center justify-center gap-1 px-1 py-2 rounded-xl text-[9px] font-black transition-all text-center truncate ${
              activeTab === tab.id
                ? userMode === 'merchant' ? 'bg-blue-600 text-white shadow-sm' : 'bg-red-600 text-white shadow-sm'
                : 'bg-white text-gray-500 border border-gray-100'
            }`}
          >
            {typeof tab.icon === 'string' ? renderCategoryIcon(tab.icon, 16) : <tab.icon size={16} />}
            {tab.label}
          </button>
        ))}
      </div>

      {userMode === 'merchant' ? (
        <div className="space-y-4">
          {activeTab === 'my-products' && (
            <div className="space-y-3">
              {isAddingProduct ? (
                <div className="bg-white p-6 rounded-[40px] shadow-2xl border border-blue-100 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md py-2 z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                        <Plus size={18} />
                      </div>
                      <h3 className="text-lg font-black text-gray-900">إضافة منتج احترافي</h3>
                    </div>
                    <button onClick={() => setIsAddingProduct(false)} className="p-2 bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors">
                      <ArrowLeft size={18} className="rotate-180" />
                    </button>
                  </div>
                  
                  <div className="space-y-8">
                    {/* Section 1: Media & Basic Info */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-blue-600">
                        <Camera size={16} />
                        <h4 className="text-xs font-black uppercase tracking-wider">الصور والمعلومات الأساسية</h4>
                      </div>
                      
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative w-full h-48 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden group transition-all hover:border-blue-300">
                          {newProduct.image ? (
                            <>
                              <img src={newProduct.image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => setNewProduct(prev => ({ ...prev, image: '' }))}
                                  className="bg-red-500 p-3 rounded-2xl text-white shadow-lg transform hover:scale-110 transition-transform"
                                >
                                  <Trash2 size={20} />
                                </button>
                              </div>
                            </>
                          ) : (
                            <label className="cursor-pointer flex flex-col items-center gap-3 w-full h-full justify-center">
                              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                                <Upload size={28} />
                              </div>
                              <div className="text-center">
                                <span className="text-sm font-black text-gray-700 block">ارفع صورة المنتج</span>
                                <span className="text-[10px] font-bold text-gray-400">JPG, PNG (بحد أقصى 5MB)</span>
                              </div>
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleImageUpload}
                              />
                            </label>
                          )}
                        </div>
                        
                        <div className="w-full">
                          <label className="text-[10px] font-black text-gray-400 mb-1.5 block px-1">أو أضف رابط الصورة مباشرة</label>
                          <div className="relative">
                            <input 
                              type="text" 
                              placeholder="https://example.com/product-image.jpg" 
                              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 pl-12 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all"
                              value={newProduct.image.startsWith('data:') ? '' : newProduct.image}
                              onChange={e => setNewProduct(prev => ({ ...prev, image: e.target.value }))}
                            />
                            <Camera size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-black text-gray-400 mb-1.5 block px-1">اسم المنتج</label>
                          <input 
                            type="text" 
                            placeholder="مثلاً: تيشيرت قطن فاخر، كيلو طماطم بلدي، إلخ..." 
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all"
                            value={newProduct.name}
                            onChange={e => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-400 mb-1.5 block px-1">وصف المنتج</label>
                          <textarea 
                            placeholder="اكتب تفاصيل المنتج، المميزات، طريقة الاستخدام..." 
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm font-bold h-24 resize-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            value={newProduct.description}
                            onChange={e => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-400 mb-1.5 block px-1">القسم الداخلي</label>
                          <select 
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                            value={newProduct.category}
                            onChange={e => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                          >
                            <option value="">اختر القسم</option>
                            {(activeProfile.internalCategories || []).map((cat, i) => (
                              <option key={`${cat}-${i}`} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Pricing & Inventory */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-emerald-600">
                        <DollarSign size={16} />
                        <h4 className="text-xs font-black uppercase tracking-wider">التسعير والمخزون</h4>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-gray-400 mb-1.5 block px-1">سعر البيع الحالي</label>
                          <div className="relative">
                            <input 
                              type="number" 
                              placeholder="0.00" 
                              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 pr-12 text-sm font-black text-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                              value={newProduct.price}
                              onChange={e => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">ج.م</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-400 mb-1.5 block px-1">السعر قبل الخصم (اختياري)</label>
                          <div className="relative">
                            <input 
                              type="number" 
                              placeholder="0.00" 
                              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 pr-12 text-sm font-bold text-gray-400 line-through focus:ring-2 focus:ring-gray-500/20 transition-all"
                              value={newProduct.originalPrice}
                              onChange={e => setNewProduct(prev => ({ ...prev, originalPrice: e.target.value }))}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">ج.م</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-gray-400 mb-1.5 block px-1">الكمية المتوفرة</label>
                          <div className="relative">
                            <input 
                              type="number" 
                              placeholder="مثلاً: 100" 
                              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all"
                              value={newProduct.stock}
                              onChange={e => setNewProduct(prev => ({ ...prev, stock: e.target.value }))}
                            />
                            <Package size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-400 mb-1.5 block px-1">وحدة القياس</label>
                          <select 
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                            value={newProduct.unit}
                            onChange={e => setNewProduct(prev => ({ ...prev, unit: e.target.value }))}
                          >
                            <option value="قطعة">قطعة</option>
                            <option value="كيلو">كيلو</option>
                            <option value="جرام">جرام</option>
                            <option value="لتر">لتر</option>
                            <option value="علبة">علبة</option>
                            <option value="كرتونة">كرتونة</option>
                            <option value="متر">متر</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-gray-400 mb-1.5 block px-1">حالة التوفر</label>
                        <div className="flex gap-2">
                          {[
                            { id: 'available', label: 'متوفر', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                            { id: 'out_of_stock', label: 'نفذ', color: 'bg-red-50 text-red-600 border-red-100' },
                            { id: 'preorder', label: 'طلب مسبق', color: 'bg-amber-50 text-amber-600 border-amber-100' }
                          ].map(status => (
                            <button
                              key={status.id}
                              onClick={() => setNewProduct(prev => ({ ...prev, status: status.id as any }))}
                              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black border transition-all ${
                                newProduct.status === status.id ? status.color + ' shadow-sm' : 'bg-white text-gray-400 border-gray-100'
                              }`}
                            >
                              {status.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Specifications */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-purple-600">
                        <Info size={16} />
                        <h4 className="text-xs font-black uppercase tracking-wider">المواصفات الفنية</h4>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-gray-400 mb-1.5 block px-1">العلامة التجارية / الماركة</label>
                          <input 
                            type="text" 
                            placeholder="مثلاً: سامسونج، جهينة..." 
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all"
                            value={newProduct.brand}
                            onChange={e => setNewProduct(prev => ({ ...prev, brand: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-400 mb-1.5 block px-1">الوزن / الحجم</label>
                          <div className="relative">
                            <input 
                              type="text" 
                              placeholder="مثلاً: 500 جرام، 2 لتر" 
                              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all"
                              value={newProduct.weight}
                              onChange={e => setNewProduct(prev => ({ ...prev, weight: e.target.value }))}
                            />
                            <Scale size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-[10px] font-black text-gray-400 mb-1.5 block px-1">تاريخ الصلاحية (اختياري)</label>
                        <div className="relative">
                          <input 
                            type="date" 
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all"
                            value={newProduct.expiryDate}
                            onChange={e => setNewProduct(prev => ({ ...prev, expiryDate: e.target.value }))}
                          />
                          <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Options */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-amber-600">
                          <SettingsIcon size={16} />
                          <h4 className="text-xs font-black uppercase tracking-wider">الخيارات والإضافات</h4>
                        </div>
                        <button 
                          onClick={() => setNewProduct(prev => ({ ...prev, options: [...prev.options, { name: '', values: '' }] }))}
                          className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-blue-100 transition-colors"
                        >
                          <Plus size={12} />
                          إضافة خيار
                        </button>
                      </div>
                      
                      {newProduct.options.length === 0 ? (
                        <div className="p-6 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                          <p className="text-[10px] font-bold text-gray-400">لا توجد خيارات حالياً (مثل المقاس، اللون، النوع)</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {newProduct.options.map((opt, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-3 relative group">
                              <button 
                                onClick={() => {
                                  const next = newProduct.options.filter((_, i) => i !== idx);
                                  setNewProduct(prev => ({ ...prev, options: next }));
                                }}
                                className="absolute -top-2 -left-2 w-7 h-7 bg-red-50 text-red-500 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 size={14} />
                              </button>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[9px] font-black text-gray-400 mb-1 block">اسم الخيار</label>
                                  <input 
                                    type="text" 
                                    placeholder="مثلاً: المقاس" 
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-xs font-bold"
                                    value={opt.name}
                                    onChange={e => {
                                      const next = [...newProduct.options];
                                      next[idx].name = e.target.value;
                                      setNewProduct(prev => ({ ...prev, options: next }));
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] font-black text-gray-400 mb-1 block">القيم (افصل بفاصلة)</label>
                                  <input 
                                    type="text" 
                                    placeholder="S, M, L, XL" 
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-xs font-bold"
                                    value={opt.values}
                                    onChange={e => {
                                      const next = [...newProduct.options];
                                      next[idx].values = e.target.value;
                                      setNewProduct(prev => ({ ...prev, options: next }));
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6 sticky bottom-0 bg-white/90 backdrop-blur-md py-4 border-t border-gray-50">
                    <button 
                      onClick={handleAddProduct}
                      className="flex-1 bg-blue-600 text-white py-4 rounded-2xl text-sm font-black shadow-xl shadow-blue-200 active:scale-95 transition-all"
                    >
                      حفظ ونشر المنتج
                    </button>
                    <button 
                      onClick={() => setIsAddingProduct(false)}
                      className="px-8 bg-gray-100 text-gray-600 py-4 rounded-2xl text-sm font-black active:scale-95 transition-all"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAddingProduct(true)}
                  className="w-full bg-blue-600 text-white py-4 rounded-[32px] text-sm font-black shadow-xl shadow-blue-100 flex items-center justify-center gap-3 hover:translate-y-[-2px] transition-all"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                    <Plus size={20} />
                  </div>
                  إضافة منتج جديد للمتجر
                </button>
              )}
              
              <div className="grid grid-cols-1 gap-3">
                {(activeProfile.products || []).length === 0 ? (
                  <div className="py-16 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package size={40} className="text-gray-200" />
                    </div>
                    <h3 className="text-sm font-black text-gray-800">لا توجد منتجات حالياً</h3>
                    <p className="text-[10px] font-bold text-gray-400 mt-1">ابدأ بإضافة منتجاتك لتبدأ في استقبال الطلبات</p>
                  </div>
                ) : (
                  (activeProfile.products || []).map(product => (
                    <div key={product.id} className="bg-white p-4 rounded-[32px] shadow-sm border border-gray-100 flex items-center justify-between group hover:border-blue-100 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-sm">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          {product.originalPrice && (
                            <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-bl-lg">
                              خصم
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-gray-800">{product.name}</h4>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-black text-blue-600">{product.price} ج.م</span>
                              {product.originalPrice && (
                                <span className="text-[10px] font-bold text-gray-300 line-through">{product.originalPrice}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                              <Package size={10} />
                              <span>{product.stock || 0} {product.unit}</span>
                            </div>
                            {product.brand && (
                              <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                <Tag size={10} />
                                <span>{product.brand}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            {product.category && (
                              <span className="text-[8px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-black">{product.category}</span>
                            )}
                            <span className={`text-[8px] px-2 py-0.5 rounded-full font-black ${
                              product.status === 'available' ? 'bg-emerald-50 text-emerald-600' :
                              product.status === 'out_of_stock' ? 'bg-red-50 text-red-600' :
                              'bg-amber-50 text-amber-600'
                            }`}>
                              {product.status === 'available' ? 'متوفر' :
                               product.status === 'out_of_stock' ? 'نفذ' : 'طلب مسبق'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => deleteProduct(activeProfile.id, product.id)}
                          className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          {activeTab === 'my-categories' && (
            <div className="space-y-3">
              {isAddingInternalCategory ? (
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-blue-100 space-y-3">
                  <h3 className="text-sm font-black text-gray-900">إضافة قسم داخلي</h3>
                  <input 
                    type="text" 
                    placeholder="اسم القسم (مثلاً: ألبان، منظفات)" 
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm"
                    value={newInternalCategory}
                    onChange={e => setNewInternalCategory(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={handleAddInternalCategory}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-xs font-black"
                    >
                      حفظ القسم
                    </button>
                    <button 
                      onClick={() => setIsAddingInternalCategory(false)}
                      className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl text-xs font-black"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAddingInternalCategory(true)}
                  className="w-full bg-blue-600 text-white py-3 rounded-2xl text-sm font-black shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  إضافة قسم داخلي جديد
                </button>
              )}
              
              {(activeProfile.internalCategories || []).length === 0 ? (
                <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                  <Layers size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-xs font-bold text-gray-400">لا توجد أقسام داخلية حالياً</p>
                </div>
              ) : (
                (activeProfile.internalCategories || []).map((cat, i) => (
                  <div key={`${cat}-${i}`} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <Layers size={20} />
                      </div>
                      <h4 className="text-sm font-bold text-gray-800">{cat}</h4>
                    </div>
                    <button 
                      onClick={() => deleteInternalCategory(activeProfile.id, cat)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
          {activeTab === 'shop-settings' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-black text-gray-900 mb-4">أقسام الميركاتو الرئيسية</h3>
                <p className="text-[10px] font-bold text-gray-400 mb-3">اختر الأقسام التي يظهر فيها متجرك للعملاء</p>
                <div className="grid grid-cols-5 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        const current = activeProfile.categories || [];
                        const next = current.includes(cat.name) 
                          ? current.filter(c => c !== cat.name)
                          : [...current, cat.name];
                        updateMainCategories(activeProfile.id, next);
                      }}
                      className={`p-2 rounded-xl text-[9px] font-black border transition-all flex flex-col items-center justify-center gap-1.5 ${
                        (activeProfile.categories || []).includes(cat.name)
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-white text-gray-600 border-gray-100 hover:border-blue-200'
                      }`}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-center leading-tight">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'my-stats' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-bold text-gray-400">مبيعات اليوم</p>
                    <TrendingUp size={12} className="text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-black text-gray-800">1,250 ج.م</h3>
                  <p className="text-[9px] font-bold text-emerald-500">+12% عن أمس</p>
                </div>
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-bold text-gray-400">زيارات المتجر</p>
                    <Eye size={12} className="text-blue-500" />
                  </div>
                  <h3 className="text-xl font-black text-gray-800">145 زيارة</h3>
                  <p className="text-[9px] font-bold text-blue-500">+5% عن أمس</p>
                </div>
              </div>

              {/* Sales Chart */}
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                <h4 className="text-sm font-black text-gray-800 mb-4">أداء المبيعات (أسبوعي)</h4>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={[
                        { name: 'السبت', sales: 400 },
                        { name: 'الأحد', sales: 300 },
                        { name: 'الاثنين', sales: 600 },
                        { name: 'الثلاثاء', sales: 800 },
                        { name: 'الأربعاء', sales: 500 },
                        { name: 'الخميس', sales: 900 },
                        { name: 'الجمعة', sales: 1200 },
                      ]}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '10px', fontWeight: 900 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#2563eb" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorSales)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                <h4 className="text-sm font-black text-gray-800 mb-3">المنتجات الأكثر مبيعاً</h4>
                {[1, 2].map(i => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-xs font-bold text-gray-700">منتج رقم {i}</span>
                    <span className="text-xs font-black text-blue-600">15 قطعة</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {activeTab === 'my-requests' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-gray-800">طلبات الأقسام الخاصة بك</h3>
                  <div className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-1 rounded-full">
                    {merchantRequests.length} طلب متاح
                  </div>
                </div>
                
                {merchantRequests.length > 0 ? (
                  <div className="space-y-3">
                    {merchantRequests.map(post => (
                      <div key={post.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-red-100 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-xs shadow-sm border border-gray-100">
                              👤
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-gray-800">{post.author}</h4>
                              <p className="text-[9px] font-bold text-gray-400">{new Date(post.createdAt).toLocaleDateString('ar-EG')}</p>
                            </div>
                          </div>
                          <div className="bg-blue-50 text-blue-600 text-[9px] font-black px-2 py-0.5 rounded-full">
                            {post.category}
                          </div>
                        </div>
                        <p className="text-xs font-bold text-gray-600 mb-3 leading-relaxed">{post.content}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600">
                              <DollarSign size={10} />
                              <span>{post.budget}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-black text-amber-600">
                              <Clock size={10} />
                              <span>{post.duration}</span>
                            </div>
                          </div>
                          <button className="px-4 py-1.5 bg-red-600 text-white text-[10px] font-black rounded-xl shadow-md hover:bg-red-700 transition-all active:scale-95">
                            تقديم عرض
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ClipboardList size={24} className="text-gray-300" />
                    </div>
                    <p className="text-xs font-bold text-gray-400">لا توجد طلبات حالياً في أقسامك المختارة</p>
                    <button className="mt-4 text-[10px] font-black text-red-600 hover:underline">
                      تعديل الأقسام من الملف الشخصي
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {!viewingCategory ? (
                  <motion.div
                    key="categories-grid"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    {(appStructure['mercato'] || [])
                      .filter(s => s.isActive && s.tabId === activeTab)
                      .sort((a, b) => a.order - b.order)
                      .map(section => (
                      <div key={section.id} className="space-y-4">
                        {/* Section Header */}
                        <div className="flex items-center justify-between px-2">
                          <div>
                            <h3 className="text-sm font-black text-gray-800">{section.name}</h3>
                            <p className="text-[10px] font-bold text-gray-400">{section.description}</p>
                          </div>
                        </div>

                        {/* Section Content based on type */}
                        {section.type === 'categories' && (
                          <div className={`grid ${section.layout === 'grid' ? 'grid-cols-5' : section.layout === 'list' ? 'grid-cols-1' : 'flex overflow-x-auto no-scrollbar gap-2'} gap-2`}>
                            {categories
                              .filter(cat => cat.sectionId === section.id && cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
                              .map((cat) => (
                              <button
                                key={cat.id}
                                onClick={() => {
                                  setViewingCategory(cat);
                                  setSelectedSubCategory(null);
                                  window.history.pushState({ categoryId: cat.id }, '');
                                }}
                                className="bg-white p-2 rounded-[20px] shadow-sm border border-gray-100 hover:border-red-200 transition-all cursor-pointer group flex flex-col items-center justify-center gap-1.5"
                              >
                                <div className={`w-8 h-8 ${cat.color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                  {renderCategoryIcon(cat.icon, 14)}
                                </div>
                                <h3 className="text-[10px] font-black text-gray-800 text-center leading-tight h-6 flex items-center">{cat.name}</h3>
                              </button>
                            ))}
                          </div>
                        )}

                        {section.type === 'banners' && (
                          <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="min-w-[280px] h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[32px] p-6 text-white relative overflow-hidden flex-shrink-0">
                                <div className="relative z-10">
                                  <h4 className="text-lg font-black">عرض خاص {i}</h4>
                                  <p className="text-xs font-bold opacity-80">خصم يصل إلى 50% على جميع المنتجات</p>
                                </div>
                                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                              </div>
                            ))}
                          </div>
                        )}

                        {section.type === 'featured_stores' && (
                          <div className="grid grid-cols-1 gap-3">
                            {profiles.filter(p => p.isPage && p.sectionId === section.id).slice(0, 3).map(store => (
                              <button key={store.id} onClick={() => setSelectedStore(store)} className="bg-white p-4 rounded-[32px] shadow-sm border border-gray-100 flex items-center justify-between hover:border-red-100 transition-all group text-right">
                                <div className="flex items-center gap-4">
                                  <img src={store.avatar || `https://picsum.photos/seed/${store.id}/100/100`} className="w-12 h-12 rounded-2xl object-cover shadow-sm" referrerPolicy="no-referrer" />
                                  <div>
                                    <h4 className="text-sm font-black text-gray-900 group-hover:text-red-600 transition-colors">{store.name}</h4>
                                    <p className="text-[10px] font-bold text-gray-400">متجر موثق</p>
                                  </div>
                                </div>
                                <ChevronLeft size={18} className="text-gray-300" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="category-detail"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6 pb-20"
                  >
                    {/* Category Header */}
                    <div className="flex items-center gap-4 bg-white p-4 rounded-[32px] shadow-sm border border-gray-100">
                      <button 
                        onClick={() => window.history.back()}
                        className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <ArrowRight size={20} />
                      </button>
                      <div className={`w-12 h-12 ${viewingCategory.color} rounded-2xl flex items-center justify-center text-white shadow-sm`}>
                        {renderCategoryIcon(viewingCategory.icon, 24)}
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-gray-900">{viewingCategory.name}</h2>
                        <p className="text-[10px] font-bold text-gray-400">تصفح الأقسام والمتاجر</p>
                      </div>
                    </div>

                    {/* Subcategories Grid */}
                    <div className="space-y-4">
                      {viewingCategory.subCategories && viewingCategory.subCategories.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">الأقسام الفرعية</h3>
                          <div className="grid grid-cols-3 gap-2">
                            {viewingCategory.subCategories.map((sub: any) => (
                              <button
                                key={sub.id}
                                onClick={() => setSelectedSubCategory(selectedSubCategory === sub.name ? null : sub.name)}
                                className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 ${
                                  selectedSubCategory === sub.name
                                    ? 'bg-red-600 border-red-600 text-white shadow-md scale-95'
                                    : 'bg-white border-gray-100 text-gray-600 hover:border-red-200 shadow-sm'
                                }`}
                              >
                                <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                                  {renderCategoryIcon(sub.icon, 14)}
                                </div>
                                <span className="text-[10px] font-black text-center leading-tight">{sub.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Stores List */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black text-gray-900">
                          {selectedSubCategory ? `متاجر ${selectedSubCategory}` : 'كل المتاجر في هذا القسم'}
                        </h3>
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                          {profiles.filter(p => 
                            p.isPage && 
                            p.mode === 'merchant' && 
                            p.categories.some(c => c.includes(viewingCategory.name) || viewingCategory.name.includes(c)) &&
                            (!selectedSubCategory || p.categories.some(c => c.includes(selectedSubCategory)))
                          ).length} متجر
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {profiles
                          .filter(p => 
                            p.isPage && 
                            p.mode === 'merchant' && 
                            p.categories.some(c => c.includes(viewingCategory.name) || viewingCategory.name.includes(c)) &&
                            (!selectedSubCategory || p.categories.some(c => c.includes(selectedSubCategory)))
                          )
                          .map((store) => (
                            <button
                              key={store.id}
                              onClick={() => setSelectedStore(store)}
                              className="bg-white p-4 rounded-[32px] shadow-sm border border-gray-100 flex items-center justify-between hover:border-red-100 transition-all group text-right"
                            >
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                  <img 
                                    src={store.avatar || `https://picsum.photos/seed/${store.id}/100/100`} 
                                    alt={store.name} 
                                    className="w-14 h-14 rounded-2xl object-cover shadow-sm"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-black text-gray-900 group-hover:text-red-600 transition-colors">{store.name}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                                      <Star size={10} fill="currentColor" />
                                      <span>4.8</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-300">•</span>
                                    <span className="text-[10px] font-bold text-gray-400">{(store.products || []).length} منتج</span>
                                  </div>
                                </div>
                              </div>
                              <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                                <ChevronLeft size={18} />
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          {activeTab === 'map' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Real Google Map View */}
                <div className="relative h-[500px] rounded-[32px] overflow-hidden shadow-2xl border-4 border-white ring-1 ring-gray-100">
                    <UnifiedMap
                      center={mapCenter}
                      zoom={14}
                      placeholder="ابحث عن متاجر في الميركاتو..."
                      accentColor="blue"
                      categories={[{ id: 'all', name: 'الكل' }, ...categories.map(c => ({ id: c.id, name: c.name }))]}
                      activeCategory={categories.find(c => c.name === mapFilter)?.id || 'all'}
                      onCategoryChange={(id) => {
                        if (id === 'all') {
                          setMapFilter('all');
                        } else {
                          const cat = categories.find(c => c.id === id);
                          if (cat) setMapFilter(cat.name);
                        }
                      }}
                      onLocationUpdate={setMapCenter}
                      nearbySearchType="store"
                      onPlacesFound={setRealPlaces}
                    >
                  {/* Real Google Places Markers */}
                  {realPlaces.map((place, idx) => (
                    <Marker
                      key={`real-${place.place_id || idx}`}
                      position={place.geometry?.location?.toJSON() || { lat: 0, lng: 0 }}
                      onClick={() => setSelectedMerchant({
                        id: place.place_id,
                        name: place.name,
                        categories: [place.types?.[0] || 'متجر'],
                        lat: place.geometry?.location?.lat(),
                        lng: place.geometry?.location?.lng(),
                        rating: place.rating,
                        isReal: true
                      })}
                      icon={{
                        url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                      }}
                    />
                  ))}

                  {/* Merchant Markers */}
                  {profiles.filter(p => p.mode === 'merchant' && p.lat && p.lng && (mapFilter === 'all' || p.categories.some(c => c.includes(mapFilter)))).map(merchant => (
                    <Marker 
                      key={merchant.id} 
                      position={{ lat: merchant.lat!, lng: merchant.lng! }}
                      onClick={() => setSelectedMerchant(merchant)}
                    >
                      {selectedMerchant?.id === merchant.id && (
                        <InfoWindow onCloseClick={() => setSelectedMerchant(null)}>
                          <div className="p-2 min-w-[180px]">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="relative">
                                <img src={selectedMerchant.avatar || `https://picsum.photos/seed/${selectedMerchant.id}/50/50`} className="w-10 h-10 rounded-xl object-cover shadow-sm" referrerPolicy="no-referrer" />
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-xs font-black text-gray-800 line-clamp-1">{selectedMerchant.name}</h4>
                                <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400">
                                  <Star size={8} fill="#f59e0b" className="text-amber-500" />
                                  <span>{selectedMerchant.rating || '4.8'}</span>
                                  <span className="mx-1">•</span>
                                  <span>{selectedMerchant.categories[0] || 'متجر'}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setSelectedStore(selectedMerchant)}
                                className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-[10px] font-black shadow-md shadow-blue-100 active:scale-95 transition-all"
                              >
                                زيارة المتجر
                              </button>
                              <button 
                                onClick={() => handleGetDirections(selectedMerchant.lat!, selectedMerchant.lng!)}
                                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                <Share2 size={14} />
                              </button>
                            </div>
                          </div>
                        </InfoWindow>
                      )}
                    </Marker>
                  ))}
                  </UnifiedMap>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2">
                  <p className="text-[10px] font-bold text-gray-400 text-center">انقر على أي متجر لعرض التفاصيل والبدء في التسوق</p>
                </div>
              </div>

              {/* Nearby Stores List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-black text-gray-800">قائمة المتاجر القريبة</h4>
                  <button className="text-[10px] font-black text-blue-600">عرض الكل</button>
                </div>
                {profiles.filter(p => p.mode === 'merchant' && p.lat && p.lng && (mapFilter === 'all' || p.categories.some(c => c.includes(mapFilter)))).length > 0 ? (
                  profiles.filter(p => p.mode === 'merchant' && p.lat && p.lng && (mapFilter === 'all' || p.categories.some(c => c.includes(mapFilter)))).map(merchant => (
                    <div 
                      key={merchant.id} 
                      onClick={() => setSelectedStore(merchant)}
                      className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-blue-100 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img src={merchant.avatar || `https://picsum.photos/seed/${merchant.id}/50/50`} className="w-12 h-12 rounded-xl object-cover" />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                        </div>
                        <div>
                          <h5 className="text-sm font-black text-gray-800 group-hover:text-blue-600 transition-colors">{merchant.name}</h5>
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] font-bold text-gray-400">{merchant.categories[0] || 'متجر'}</p>
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            <p className="text-[10px] font-bold text-emerald-600">متاح الآن</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1 text-[10px] font-black text-amber-500">
                          <Star size={10} fill="currentColor" />
                          <span>4.8</span>
                        </div>
                        <p className="text-[9px] font-bold text-gray-400">يبعد 1.2 كم</p>
                      </div>
                    </div>
                  ))
                ) : (
                  [1, 2, 3].map(i => (
                    <div key={i} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-red-100 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-xl">
                          {['🛒', '💊', '🍎'][i-1]}
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-gray-800">
                            {['سوبر ماركت الأمل', 'صيدلية الشفاء', 'خضروات النيل'][i-1]}
                          </h5>
                          <p className="text-[10px] font-bold text-gray-400">يبعد {i * 250} متر عنك • متاح الآن</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-black text-amber-500">
                        <Star size={10} fill="currentColor" />
                        <span>4.{i+5}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'offers' && (
            <div className="space-y-4">
              <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <p className="text-xs font-bold text-gray-400">لا توجد عروض حالياً</p>
              </div>
            </div>
          )}

          {activeTab === 'group-offers' && (
            <div className="space-y-4">
              <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <p className="text-xs font-bold text-gray-400">لا توجد طلبات جماعية حالياً</p>
              </div>
            </div>
          )}

          {/* Generic Section Renderer for other tabs */}
          {!['categories', 'map', 'offers', 'group-requests', 'group-offers', 'picked', 'my-requests', 'my-products', 'my-categories', 'my-stats', 'shop-settings'].includes(activeTab) && (
            <div className="space-y-6">
              {(appStructure['mercato'] || [])
                .filter(s => s.isActive && s.tabId === activeTab)
                .sort((a, b) => a.order - b.order)
                .map(section => (
                  <div key={section.id} className="space-y-4">
                    {/* Section Header */}
                    <div className="flex items-center justify-between px-2">
                      <div>
                        <h3 className="text-sm font-black text-gray-800">{section.name}</h3>
                        <p className="text-[10px] font-bold text-gray-400">{section.description}</p>
                      </div>
                    </div>

                    {/* Section Content based on type */}
                    {section.type === 'categories' && (
                      <div className={`grid ${section.layout === 'grid' ? 'grid-cols-5' : section.layout === 'list' ? 'grid-cols-1' : 'flex overflow-x-auto no-scrollbar gap-2'} gap-2`}>
                        {categories
                          .filter(cat => cat.sectionId === section.id && cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => handleSetViewingCategory(cat.id)}
                            className="bg-white p-2 rounded-[20px] shadow-sm border border-gray-100 hover:border-red-200 transition-all cursor-pointer group flex flex-col items-center justify-center gap-1.5"
                          >
                            <div className={`w-8 h-8 ${cat.color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                              {renderCategoryIcon(cat.icon, 14)}
                            </div>
                            <h3 className="text-[10px] font-black text-gray-800 text-center leading-tight h-6 flex items-center">{cat.name}</h3>
                          </button>
                        ))}
                      </div>
                    )}

                    {section.type === 'banners' && (
                      <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="min-w-[280px] h-32 bg-gradient-to-br from-red-500 to-orange-600 rounded-[32px] p-6 text-white relative overflow-hidden flex-shrink-0">
                            <div className="relative z-10">
                              <h4 className="text-lg font-black">عرض خاص {i}</h4>
                              <p className="text-xs font-bold opacity-80">خصم يصل إلى 50% على جميع المنتجات</p>
                            </div>
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                          </div>
                        ))}
                      </div>
                    )}

                    {section.type === 'featured_stores' && (
                      <div className="grid grid-cols-1 gap-3">
                        {profiles.filter(p => p.isPage && p.mode === 'merchant').slice(0, 3).map(store => (
                          <button key={store.id} onClick={() => setSelectedStore(store)} className="bg-white p-4 rounded-[32px] shadow-sm border border-gray-100 flex items-center justify-between hover:border-red-100 transition-all group text-right">
                            <div className="flex items-center gap-4">
                              <img src={store.avatar || `https://picsum.photos/seed/${store.id}/100/100`} className="w-12 h-12 rounded-2xl object-cover shadow-sm" referrerPolicy="no-referrer" />
                              <div>
                                <h4 className="text-sm font-black text-gray-900 group-hover:text-red-600 transition-colors">{store.name}</h4>
                                <p className="text-[10px] font-bold text-gray-400">متجر موثق</p>
                              </div>
                            </div>
                            <ChevronLeft size={18} className="text-gray-300" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}

          {activeTab === 'picked' && (
            <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
              <p className="text-xs font-bold text-gray-400">لا توجد منتجات مقترحة حالياً</p>
            </div>
          )}
        </>
      )}
      {/* Option Selection Modal */}
      {selectedProductForCart && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            className="bg-white w-full max-w-md rounded-t-[40px] sm:rounded-[40px] p-6 space-y-6 shadow-2xl"
          >
            <div className="flex items-center gap-4">
              <img src={selectedProductForCart.image} alt="" className="w-20 h-20 rounded-2xl object-cover shadow-md" />
              <div>
                <h3 className="text-lg font-black text-gray-900">{selectedProductForCart.name}</h3>
                <p className="text-red-600 font-black">{selectedProductForCart.price} ج.م</p>
              </div>
            </div>

            <div className="space-y-4">
              {selectedProductForCart.options.map((opt: any) => (
                <div key={opt.name} className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider">{opt.name}</label>
                  <div className="flex flex-wrap gap-2">
                    {opt.values.map((val: string) => (
                      <button
                        key={val}
                        onClick={() => setSelectedOptions(prev => ({ ...prev, [opt.name]: val }))}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          selectedOptions[opt.name] === val
                            ? 'bg-red-600 text-white border-red-600 shadow-md'
                            : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-red-200'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                onClick={() => {
                  addToMercatoCart({
                    id: selectedProductForCart.id,
                    name: selectedProductForCart.name,
                    price: selectedProductForCart.price,
                    quantity: 1,
                    image: selectedProductForCart.image,
                    unit: selectedProductForCart.unit,
                    selectedOptions: selectedOptions
                  });
                  setSelectedProductForCart(null);
                }}
                className="flex-1 bg-red-600 text-white py-4 rounded-2xl text-sm font-black shadow-lg shadow-red-100 active:scale-95 transition-all"
              >
                إضافة للسلة
              </button>
              <button 
                onClick={() => setSelectedProductForCart(null)}
                className="px-6 bg-gray-100 text-gray-600 py-4 rounded-2xl text-sm font-black active:scale-95 transition-all"
              >
                إلغاء
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Store View Modal */}
      {selectedStore && (
        <div className="fixed inset-0 bg-white z-[150] flex flex-col">
          <div className="relative h-48 bg-gray-100">
            <img 
              src={selectedStore.cover || `https://picsum.photos/seed/${selectedStore.id}/800/400`} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <button 
              onClick={() => setSelectedStore(null)}
              className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-900 shadow-lg"
            >
              <ArrowRight size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 -mt-12">
            <div className="bg-white rounded-[40px] p-6 shadow-xl border border-gray-100 space-y-6">
              <div className="flex items-center gap-4">
                <img 
                  src={selectedStore.avatar || `https://picsum.photos/seed/${selectedStore.id}/100/100`} 
                  className="w-20 h-20 rounded-3xl object-cover border-4 border-white shadow-lg"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-black text-gray-900">{selectedStore.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star size={12} fill="currentColor" />
                      <span>{selectedStore.rating || '4.8'}</span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs font-bold text-gray-400">{selectedStore.categories?.[0] || 'متجر'}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm font-medium text-gray-600 leading-relaxed">
                {selectedStore.description || 'أهلاً بكم في متجرنا! نحن نقدم أفضل المنتجات بأفضل الأسعار.'}
              </p>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('open-support-chat', { 
                      detail: { 
                        userId: selectedStore.id, 
                        userName: selectedStore.name 
                      } 
                    }));
                  }}
                  className="flex-1 bg-red-600 text-white py-4 rounded-2xl text-sm font-black shadow-lg shadow-red-100 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <MessageCircle size={20} />
                  <span>تواصل مع المتجر</span>
                </button>
                <button 
                  onClick={() => setShowReviewModal(true)}
                  className="p-4 bg-amber-50 text-amber-600 rounded-2xl hover:bg-amber-100 transition-colors"
                >
                  <Star size={20} />
                </button>
                <button 
                  className="p-4 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-colors"
                >
                  <Share2 size={20} />
                </button>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-sm font-black text-gray-900 mb-4">منتجات المتجر</h3>
                <div className="grid grid-cols-2 gap-3">
                  {/* Mock products for the store */}
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                      <img src={`https://picsum.photos/seed/prod${i}/200/200`} className="w-full aspect-square rounded-xl object-cover mb-2" referrerPolicy="no-referrer" />
                      <h4 className="text-xs font-black text-gray-800">منتج مميز {i}</h4>
                      <p className="text-red-600 text-[10px] font-black mt-1">99.00 ج.م</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-sm rounded-[32px] p-6 space-y-6 shadow-2xl"
          >
            <div className="text-center">
              <h3 className="text-lg font-black text-gray-900">تقييم المتجر</h3>
              <p className="text-xs font-bold text-gray-400 mt-1">شاركنا رأيك في {selectedStore?.name}</p>
            </div>

            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button 
                  key={s} 
                  onClick={() => setRating(s)}
                  className="p-1 transition-transform active:scale-90"
                >
                  <Star 
                    size={32} 
                    className={s <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200"} 
                  />
                </button>
              ))}
            </div>

            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="اكتب تعليقك هنا..."
              className="w-full bg-gray-50 border-none rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-red-500/20 h-24 resize-none"
            />

            <div className="flex gap-3">
              <button 
                onClick={handleAddReview}
                className="flex-1 bg-red-600 text-white py-3.5 rounded-2xl text-xs font-black shadow-lg shadow-red-100 active:scale-95 transition-all"
              >
                إرسال التقييم
              </button>
              <button 
                onClick={() => setShowReviewModal(false)}
                className="flex-1 bg-gray-100 text-gray-600 py-3.5 rounded-2xl text-xs font-black active:scale-95 transition-all"
              >
                إلغاء
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
