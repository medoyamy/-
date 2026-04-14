import React, { useState, useEffect, useMemo } from 'react';
import { safeStringify } from '../lib/mapUtils';
import { syncStorage } from '../lib/storage';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { UnifiedMap } from '../components/UnifiedMap';
import MapPickerModal from '../components/MapPickerModal';
import { 
  MapPin, 
  ChevronLeft,
  Navigation,
  Clock,
  Car,
  Bike,
  CheckCircle2,
  Plus,
  Trash2,
  Users,
  Package,
  Truck,
  Plane,
  Wrench,
  Info,
  MessageSquare,
  UserPlus,
  Search,
  ArrowRight,
  Rocket,
  Wallet,
  FileText,
  PenTool,
  Send,
  DollarSign,
  Zap,
  Star,
  BadgePercent,
  LayoutGrid,
  Camera
} from 'lucide-react';
import { usePosts } from '../context/PostContext';
import CreatePostModal from '../components/CreatePostModal';

// --- Types ---
interface LocationPoint {
  id: string;
  address: string;
  coords: { lat: number; lng: number } | null;
  name?: string;
  phone?: string;
}

// --- Constants ---
const MAP_CENTER = { lat: 31.0409, lng: 31.3785 };

// Mock Friends Data
const MOCK_FRIENDS = [
  { id: 'f1', name: 'أحمد السائق', specialties: ['people', 'orders'], rating: 4.8 },
  { id: 'f2', name: 'محمد النقل', specialties: ['items', 'tow'], rating: 4.9 },
  { id: 'f3', name: 'ياسر سفر', specialties: ['travel'], rating: 4.7 },
  { id: 'f4', name: 'سعيد دليفري', specialties: ['orders'], rating: 4.5 },
];

const renderIcon = (iconName: string, size: number = 24) => {
  const iconMap: Record<string, any> = {
    Users, Package, Truck, Plane, Wrench, Bike, Car, Navigation, Clock, Search, ArrowRight, Rocket, Info, MessageSquare, UserPlus, Trash2, Plus, CheckCircle2, MapPin, ChevronLeft,
    Wallet, FileText, PenTool, Send, DollarSign, Zap, Star, BadgePercent, LayoutGrid, Grid: LayoutGrid
  };
  const IconComponent = iconMap[iconName] || Truck;
  return <IconComponent size={size} />;
};

export default function DeliveryPage() {
  const { posts } = usePosts();
  const { 
    appStructure, 
    categories: allCategories, 
    serviceTabs,
    deliveryCategories,
    deliveryVehicles
  } = useSettings();
  const categories = allCategories['delivery'] || [];
  const tabs = serviceTabs['delivery'] || [];
  const { userMode } = useUser();
  const { addDriverRequest } = useCart();
  
  // --- State ---
  const [activeTab, setActiveTab] = useState(() => {
    const saved = syncStorage.get('delivery_active_tab');
    if (saved) return saved;
    return tabs[0]?.id || 'delivery-services';
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    syncStorage.set('delivery_active_tab', activeTab);
  }, [activeTab]);
  const [activeCategory, setActiveCategory] = useState<string>(deliveryCategories[0]?.id || 'people');
  
  // Filter vehicles based on active category
  const filteredVehicles = useMemo(() => {
    return deliveryVehicles.filter(v => v.categoryId === activeCategory);
  }, [activeCategory, deliveryVehicles]);

  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  // Reset selected vehicle when category changes
  useEffect(() => {
    if (filteredVehicles.length > 0) {
      setSelectedVehicle(filteredVehicles[0].id);
    } else {
      setSelectedVehicle('');
    }
  }, [filteredVehicles]);
  
  // Locations
  const [pickups, setPickups] = useState<LocationPoint[]>([{ id: 'p1', address: '', coords: null }]);
  const [delivery, setDelivery] = useState<LocationPoint>({ id: 'd1', address: '', coords: null });
  
  // Modal State
  const [pickerConfig, setPickerConfig] = useState<{ isOpen: boolean; type: 'pickup' | 'delivery'; index?: number } | null>(null);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  
  // Form Fields
  const [budget, setBudget] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [shipmentDetails, setShipmentDetails] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [isMultiPickup, setIsMultiPickup] = useState(false);
  const [distance, setDistance] = useState(0);

  // Memoize waypoints to prevent infinite loops in UnifiedMap
  const waypoints = useMemo(() => {
    return pickups.slice(1)
      .filter(p => p.coords)
      .map(p => ({
        location: p.coords!,
        stopover: true
      }));
  }, [pickups]);

  // --- Calculations ---
  const suggestedFare = useMemo(() => {
    const vehicle = deliveryVehicles.find(v => v.id === selectedVehicle);
    if (!vehicle || distance === 0) return 0;
    
    const baseFare = vehicle.baseFare || 20;
    const kmRate = vehicle.perKmRate || 5;
    return Math.ceil(baseFare + (distance * kmRate));
  }, [selectedVehicle, distance, deliveryVehicles]);

  const suggestedTime = useMemo(() => {
    if (distance === 0) return 0;
    // 2 mins per km + 5 mins buffer per stop
    const stopBuffer = (pickups.length + 1) * 5;
    return Math.ceil((distance * 2) + stopBuffer);
  }, [distance, pickups]);

  // Update budget when suggested fare changes
  useEffect(() => {
    if (suggestedFare > 0) setBudget(suggestedFare);
  }, [suggestedFare]);

  // Reset state on category change
  useEffect(() => {
    setPickups([{ id: 'p1', address: '', coords: null }]);
    setDelivery({ id: 'd1', address: '', coords: null });
    setIsMultiPickup(false);
    setSelectedFriends([]);
  }, [activeCategory]);

  // Toast State
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const showToast = (message: string) => {
    setToast({ message, visible: true });
  };

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => setToast({ ...toast, visible: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  // --- Handlers ---
  const handleAddPickup = () => {
    if (pickups.length < 5) {
      setPickups([...pickups, { id: `p${Date.now()}`, address: '', coords: null }]);
    }
  };

  const handleRemovePickup = (id: string) => {
    if (pickups.length > 1) {
      setPickups(pickups.filter(p => p.id !== id));
    }
  };

  const handleLocationSelect = (address: string, coords: { lat: number; lng: number }) => {
    if (!pickerConfig) return;

    if (pickerConfig.type === 'pickup') {
      const newPickups = [...pickups];
      newPickups[pickerConfig.index!] = { ...newPickups[pickerConfig.index!], address, coords };
      setPickups(newPickups);
    } else {
      setDelivery({ ...delivery, address, coords });
    }
    setPickerConfig(null);
  };

  const handleSubmit = () => {
    if (!pickups[0].address || !delivery.address) {
      showToast('يرجى تحديد مواقع الاستلام والتوصيل');
      return;
    }
    if (budget < suggestedFare) {
      showToast(`الميزانية يجب أن لا تقل عن السعر المقترح (${suggestedFare} ج.م)`);
      return;
    }

    addDriverRequest({
      category: deliveryCategories.find(c => c.id === activeCategory)?.name || '',
      vehicleType: deliveryVehicles.find(v => v.id === selectedVehicle)?.name || '',
      pickupLocation: pickups.map(p => p.address).join(' -> '),
      deliveryLocation: delivery.address,
      expectedPrice: budget,
      notes,
      shipmentDetails,
      friendsNotified: selectedFriends.length
    });

    // Reset form
    setPickups([{ id: 'p1', address: '', coords: null }]);
    setDelivery({ id: 'd1', address: '', coords: null });
    setNotes('');
    setShipmentDetails('');
    setSelectedFriends([]);
    showToast('تم إرسال طلبك بنجاح! السائقون سيقدمون عروضهم الآن.');
  };

  const filteredFriends = MOCK_FRIENDS;

  const driverRequests = posts.filter(post => post.source === 'delivery' && post.status === 'active');

  return (
    <div className="min-h-screen bg-gray-50 pb-32 text-right" dir="rtl">
      {/* Header Branding & Search Bar */}
      <div className="flex items-center justify-between gap-3 mb-2 p-4 pb-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-600 text-white rounded-xl shadow-lg shadow-red-100">
            <Truck size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 leading-tight">
              {userMode === 'driver' ? 'طلبات التوصيل المتاحة' : 'وصلني'}
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {userMode === 'driver' ? 'Driver Dashboard' : 'Delivery Gate'}
            </p>
          </div>
        </div>

        <div className="relative flex-1 max-w-[180px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input 
            type="text" 
            placeholder="بحث..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-xl py-2 pr-9 pl-3 text-xs font-medium shadow-sm outline-none focus:ring-2 focus:ring-red-100"
          />
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {userMode !== 'driver' ? (
          <>
            {/* Tabs Bar - Always Visible */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 -mx-4 px-4 bg-gray-50/95 backdrop-blur-md sticky top-0 z-[60] py-4">
              {tabs.filter(t => t.isActive).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
                    activeTab === tab.id 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-100' 
                    : 'bg-white text-gray-500 border border-gray-100'
                  }`}
                >
                  {renderIcon(tab.icon, 16)}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Dynamic Sections based on Active Tab */}
            {(appStructure['delivery'] || [])
              .filter(s => s.isActive && s.tabId === activeTab)
              .sort((a, b) => a.order - b.order)
              .map(section => (
                <div key={section.id} className="space-y-4">
                  {/* Section Content based on type */}
                  {section.type === 'top_tabs' && null}

                  {section.type === 'main_tabs' && (
                    <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 -mx-2 px-2">
                      {(categories || [])
                        .filter(c => c.sectionId === section.id && c.isActive)
                        .sort((a, b) => a.order - b.order)
                        .map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black whitespace-nowrap transition-all ${
                              activeCategory === cat.id 
                              ? 'bg-red-600 text-white shadow-sm' 
                              : 'bg-white text-gray-500 border border-gray-100'
                            }`}
                          >
                            {renderIcon(cat.icon, 14)}
                            {cat.name}
                          </button>
                        ))}
                    </div>
                  )}

                  {section.type === 'sub_tabs' && (
                    <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 -mx-2 px-2">
                      {((categories || []).find(c => c.id === activeCategory)?.subCategories || [])
                        .filter(sub => sub.isActive)
                        .map(sub => (
                          <button
                            key={sub.id}
                            className="px-4 py-2 rounded-xl text-[10px] font-black whitespace-nowrap bg-white text-gray-500 border border-gray-100 hover:bg-gray-50 transition-all"
                          >
                            {renderIcon(sub.icon, 14)}
                            {sub.name}
                          </button>
                        ))}
                    </div>
                  )}

                  {section.type === 'publishing_box' && (
                    <div className="bg-white p-6 rounded-[40px] shadow-xl border border-gray-100 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">👤</div>
                        <button 
                          onClick={() => setIsCreatePostOpen(true)}
                          className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-400 text-right px-6 py-4 rounded-2xl text-sm font-bold transition-all border border-gray-100"
                        >
                          بماذا تفكر؟ انشر طلبك أو عرضك هنا...
                        </button>
                      </div>
                      <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                        {(categories || [])
                          .filter(c => c.sectionId === section.id && c.isActive)
                          .sort((a, b) => a.order - b.order)
                          .map(btn => (
                            <button 
                              key={btn.id}
                              onClick={() => setIsCreatePostOpen(true)}
                              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-50 text-red-600 rounded-xl text-xs font-black hover:bg-red-100 transition-all"
                            >
                              {renderIcon(btn.icon, 16)} {btn.name}
                            </button>
                          ))}
                        {/* Fallback if no buttons configured */}
                        {(categories || []).filter(c => c.sectionId === section.id).length === 0 && (
                          <>
                            <button 
                              onClick={() => setIsCreatePostOpen(true)}
                              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-50 text-red-600 rounded-xl text-xs font-black hover:bg-red-100 transition-all"
                            >
                              <Camera size={16} /> صور / فيديو
                            </button>
                            <button 
                              onClick={() => setIsCreatePostOpen(true)}
                              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-50 text-blue-600 rounded-xl text-xs font-black hover:bg-blue-100 transition-all"
                            >
                              <MapPin size={16} /> الموقع
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {section.type === 'categories' && (
                    <div className="space-y-4">
                      {section.name && (
                        <div className="px-2">
                          <h3 className="text-sm font-black text-gray-800">{section.name}</h3>
                          <p className="text-[10px] font-bold text-gray-400">{section.description}</p>
                        </div>
                      )}
                      <div className={`grid ${section.layout === 'grid' ? 'grid-cols-5' : section.layout === 'list' ? 'grid-cols-1' : 'flex overflow-x-auto no-scrollbar gap-2'} gap-1 pb-2 -mx-2 px-2`}>
                        {categories.map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex flex-col items-center justify-center gap-1 px-1 py-2 rounded-xl text-[9px] font-black transition-all text-center truncate ${
                              activeCategory === cat.id 
                              ? 'bg-red-600 text-white shadow-sm' 
                              : 'bg-white text-gray-500 border border-gray-100'
                            }`}
                          >
                            {renderIcon(cat.icon, 16)}
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {section.type === 'delivery_categories' && (
                    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
                          {renderIcon(section.icon, 16)} {section.name}
                        </h3>
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        {deliveryCategories.sort((a, b) => a.order - b.order).map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl transition-all ${
                              activeCategory === cat.id
                              ? 'bg-red-600 text-white shadow-md'
                              : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                            }`}
                          >
                            <div className="text-[10px] font-black text-center">{cat.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {section.type === 'vehicle_selector' && (
                    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
                          {renderIcon(section.icon, 16)} {section.name}
                        </h3>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {filteredVehicles.sort((a, b) => a.order - b.order).map((v) => (
                          <button
                            key={v.id}
                            onClick={() => setSelectedVehicle(v.id)}
                            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl transition-all ${
                              selectedVehicle === v.id
                              ? 'bg-red-600 text-white shadow-md'
                              : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                            }`}
                          >
                            {renderIcon(v.icon, 20)}
                            <div className="text-[9px] font-black text-center">{v.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {section.type === 'delivery_locations' && (
                    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
                          {renderIcon(section.icon, 16)} {section.name}
                        </h3>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setIsMultiPickup(false)}
                          className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all ${!isMultiPickup ? 'bg-red-600 text-white' : 'bg-gray-50 text-gray-500'}`}
                        >توصيل مكان واحد</button>
                        <button 
                          onClick={() => setIsMultiPickup(true)}
                          className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all ${isMultiPickup ? 'bg-red-600 text-white' : 'bg-gray-50 text-gray-500'}`}
                        >توصيل من أكثر من مكان</button>
                      </div>

                      <div className="space-y-4">
                        {pickups.map((p, idx) => (
                          <div key={p.id} className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-blue-600">التوصيل من {pickups.length > 1 ? idx + 1 : ''}</span>
                              {pickups.length > 1 && (
                                <button onClick={() => handleRemovePickup(p.id)} className="text-red-500"><Trash2 size={14} /></button>
                              )}
                            </div>
                            <div className="relative">
                              <MapPin size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600" />
                              <button
                                onClick={() => setPickerConfig({ isOpen: true, type: 'pickup', index: idx })}
                                className="w-full bg-white border border-gray-100 rounded-xl py-3 pr-10 pl-4 text-xs font-bold text-right truncate"
                              >
                                {p.address || 'اكتب العنوان أو حدد من الخريطة'}
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <input type="text" placeholder="الاسم" className="bg-white border border-gray-100 rounded-xl py-2 px-3 text-[10px] font-bold" />
                              <input type="tel" placeholder="رقم الموبايل" className="bg-white border border-gray-100 rounded-xl py-2 px-3 text-[10px] font-bold" />
                            </div>
                          </div>
                        ))}
                        {isMultiPickup && (
                          <button onClick={handleAddPickup} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                            <Plus size={16} /> <span className="text-[10px] font-black">إضافة موقع استلام</span>
                          </button>
                        )}

                        <div className="space-y-3 p-4 bg-red-50/30 rounded-2xl border border-red-100">
                          <span className="text-[10px] font-black text-red-600">التوصيل الى</span>
                          <div className="relative">
                            <MapPin size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600" />
                            <button
                              onClick={() => setPickerConfig({ isOpen: true, type: 'delivery' })}
                              className="w-full bg-white border border-gray-100 rounded-xl py-3 pr-10 pl-4 text-xs font-bold text-right truncate"
                            >
                              {delivery.address || 'اكتب العنوان أو حدد من الخريطة'}
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input type="text" placeholder="الاسم" className="bg-white border border-gray-100 rounded-xl py-2 px-3 text-[10px] font-bold" />
                            <input type="tel" placeholder="رقم الموبايل" className="bg-white border border-gray-100 rounded-xl py-2 px-3 text-[10px] font-bold" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {section.type === 'map_view' && (
                    <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 h-64 relative">
                      <UnifiedMap
                        center={MAP_CENTER}
                        zoom={13}
                        origin={pickups[0]?.coords || undefined}
                        destination={delivery?.coords || undefined}
                        waypoints={waypoints}
                        onDistanceUpdate={setDistance}
                      />
                    </div>
                  )}

                  {section.type === 'kilometers_display' && (
                    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                          <Navigation size={20} />
                        </div>
                        <h3 className="text-sm font-black text-gray-800">{section.name}</h3>
                      </div>
                      <div className="text-lg font-black text-blue-600">{distance} كم</div>
                    </div>
                  )}

                  {section.type === 'fare_meter' && (
                    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-4">
                      <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
                        {renderIcon(section.icon, 16)} {section.name}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="text-[10px] font-black text-gray-400 mb-1">بداية البنديرة</p>
                          <p className="text-base font-black text-gray-900">
                            {deliveryVehicles.find(v => v.id === selectedVehicle)?.baseFare || 20} ج.م
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="text-[10px] font-black text-gray-400 mb-1">سعر الكيلومتر</p>
                          <p className="text-base font-black text-gray-900">
                            {deliveryVehicles.find(v => v.id === selectedVehicle)?.perKmRate || 5} ج.م
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {section.type === 'suggested_fare' && (
                    <div className="bg-red-600 rounded-[32px] p-6 shadow-lg shadow-red-100 flex items-center justify-between text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                          <Zap size={20} />
                        </div>
                        <h3 className="text-sm font-black">{section.name}</h3>
                      </div>
                      <div className="text-xl font-black">{suggestedFare} ج.م</div>
                    </div>
                  )}

                  {section.type === 'budget_selector' && (
                    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-4">
                      <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
                        {renderIcon(section.icon, 16)} {section.name}
                      </h3>
                      <div className="relative">
                        <input 
                          type="number"
                          value={budget}
                          onChange={(e) => setBudget(Number(e.target.value))}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-lg font-black text-red-600 outline-none focus:ring-2 focus:ring-red-100"
                        />
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">ج.م</span>
                      </div>
                    </div>
                  )}

                  {section.type === 'shipment_description' && (
                    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-4">
                      <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
                        {renderIcon(section.icon, 16)} {section.name}
                      </h3>
                      <textarea 
                        value={shipmentDetails}
                        onChange={(e) => setShipmentDetails(e.target.value)}
                        placeholder="اكتب وصف الشحنة هنا..."
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold outline-none h-24 resize-none"
                      />
                    </div>
                  )}

                  {section.type === 'notes_input' && (
                    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-4">
                      <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
                        {renderIcon(section.icon, 16)} {section.name}
                      </h3>
                      <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="اكتب ملاحظاتك هنا..."
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold outline-none h-24 resize-none"
                      />
                    </div>
                  )}

                  {section.type === 'driver_selector' && (
                    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-4">
                      <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
                        {renderIcon(section.icon, 16)} {section.name}
                      </h3>
                      <button 
                        onClick={() => setShowFriendsModal(true)}
                        className="w-full flex items-center justify-between p-4 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100 hover:bg-blue-100 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <UserPlus size={20} />
                          <span className="text-xs font-black">اختيار سائق من الأصدقاء</span>
                        </div>
                        {selectedFriends.length > 0 && (
                          <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-full">
                            {selectedFriends.length} مختار
                          </span>
                        )}
                        <Plus size={18} />
                      </button>
                    </div>
                  )}

                  {section.type === 'shipment_details' && (
                    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-4">
                      <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
                        {renderIcon(section.icon, 16)} {section.name}
                      </h3>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs font-bold text-gray-600">
                        سيتم عرض تفاصيل الشحنة هنا بعد تأكيد الطلب.
                      </div>
                    </div>
                  )}

                  {section.type === 'submit_button' && (
                    <button 
                      onClick={handleSubmit}
                      className="w-full py-5 bg-red-600 text-white rounded-[32px] text-lg font-black shadow-2xl shadow-red-100 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                      <Rocket size={24} /> {section.name}
                    </button>
                  )}

                  {section.type === 'banners' && (
                    <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2">
                      {[1, 2].map(i => (
                        <div key={i} className="min-w-[260px] h-28 bg-gradient-to-br from-red-500 to-orange-600 rounded-[28px] p-5 text-white relative overflow-hidden flex-shrink-0">
                          <div className="relative z-10">
                            <h4 className="text-base font-black">عرض التوصيل {i}</h4>
                            <p className="text-[10px] font-bold opacity-80">أسرع خدمة توصيل في منطقتك</p>
                          </div>
                          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
                        </div>
                      ))}
                    </div>
                  )}

                  {section.type === 'featured_stores' && (
                    <div className="grid grid-cols-1 gap-3">
                      {MOCK_FRIENDS.slice(0, 3).map(friend => (
                        <div key={friend.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-red-100 transition-all group text-right">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-red-600">
                              <Car size={20} />
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-gray-900">{friend.name}</h4>
                              <p className="text-[9px] font-bold text-gray-400">سائق موثوق • {friend.rating} ⭐</p>
                            </div>
                          </div>
                          <ChevronLeft size={16} className="text-gray-300" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

            {/* Fallback for empty tabs */}
            {activeTab === 'subscription-offers' && (
              <div className="py-24 text-center text-gray-400 bg-white rounded-[40px] border border-dashed border-gray-200">
                <BadgePercent size={64} className="mx-auto mb-6 opacity-10" />
                <p className="text-lg font-black opacity-40">لا توجد عروض اشتراكات حالياً</p>
              </div>
            )}

            {activeTab === 'best-drivers' && (
              <div className="space-y-4">
                {MOCK_FRIENDS.map(friend => (
                  <div key={friend.id} className="bg-white p-6 rounded-[40px] shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center text-3xl">👤</div>
                      <div>
                        <h4 className="text-base font-black text-gray-900">{friend.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-yellow-500 flex items-center gap-1">⭐ {friend.rating}</span>
                          <span className="text-[10px] font-bold text-gray-400">• {friend.specialties.length} تخصصات</span>
                        </div>
                      </div>
                    </div>
                    <button className="p-3 bg-red-50 text-red-600 rounded-2xl"><ChevronLeft size={20} /></button>
                  </div>
                ))}
              </div>
            )}

            {/* Generic Section Renderer for other tabs */}
            {!['delivery-services', 'subscription-offers', 'best-drivers'].includes(activeTab) && (
              <div className="space-y-6 pb-20">
                {(appStructure['delivery'] || [])
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
                        <div className={`grid ${section.layout === 'grid' ? 'grid-cols-4' : section.layout === 'list' ? 'grid-cols-1' : 'flex overflow-x-auto no-scrollbar gap-2'} gap-2`}>
                          {allCategories['delivery']
                            ?.filter(cat => cat.sectionId === section.id)
                            .map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => setActiveCategory(cat.id)}
                              className="bg-white p-2 rounded-[20px] shadow-sm border border-gray-100 hover:border-red-200 transition-all cursor-pointer group flex flex-col items-center justify-center gap-1.5"
                            >
                              <div className={`w-10 h-10 ${cat.color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                {renderIcon(cat.icon, 20)}
                              </div>
                              <h3 className="text-[9px] font-black text-gray-800 text-center leading-tight h-6 flex items-center">{cat.name}</h3>
                            </button>
                          ))}
                        </div>
                      )}

                      {section.type === 'publishing_box' && (
                        <div className="bg-white p-6 rounded-[40px] shadow-xl border border-gray-100 space-y-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">👤</div>
                            <button 
                              onClick={() => setIsCreatePostOpen(true)}
                              className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-400 text-right px-6 py-4 rounded-2xl text-sm font-bold transition-all border border-gray-100"
                            >
                              بماذا تفكر؟ انشر طلبك أو عرضك هنا...
                            </button>
                          </div>
                          <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                            <button 
                              onClick={() => setIsCreatePostOpen(true)}
                              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-50 text-red-600 rounded-xl text-xs font-black hover:bg-red-100 transition-all"
                            >
                              <Camera size={16} /> صور / فيديو
                            </button>
                            <button 
                              onClick={() => setIsCreatePostOpen(true)}
                              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-50 text-blue-600 rounded-xl text-xs font-black hover:bg-blue-100 transition-all"
                            >
                              <MapPin size={16} /> الموقع
                            </button>
                          </div>
                        </div>
                      )}

                      {section.type === 'banners' && (
                        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2">
                          {[1, 2].map(i => (
                            <div key={i} className="min-w-[260px] h-28 bg-gradient-to-br from-red-500 to-orange-600 rounded-[28px] p-5 text-white relative overflow-hidden flex-shrink-0">
                              <div className="relative z-10">
                                <h4 className="text-base font-black">عرض توصيل {i}</h4>
                                <p className="text-[10px] font-bold opacity-80">اطلب الآن واحصل على خصم 10%</p>
                              </div>
                              <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </>
        ) : (
          /* Driver View */
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-900">أنت متصل الآن</h4>
                    <p className="text-[10px] font-bold text-gray-400">ستصلك الطلبات القريبة منك فوراً</p>
                  </div>
               </div>
               <div className="w-12 h-6 bg-green-500 rounded-full relative">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
               </div>
            </div>

            {driverRequests.map(post => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={post.id} 
                className="bg-white p-6 rounded-[40px] shadow-xl border border-gray-100 space-y-6"
              >
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">👤</div>
                      <div>
                        <h4 className="text-base font-black text-gray-900">{post.author}</h4>
                        <div className="flex items-center gap-2">
                          <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full">{post.category}</span>
                          <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><Clock size={10} /> منذ ٥ دقائق</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-black text-red-600">{post.budget}</p>
                      <p className="text-[10px] font-bold text-gray-400">ميزانية العميل</p>
                    </div>
                 </div>
                 
                 <div className="space-y-4 relative pr-6">
                    <div className="absolute right-2 top-2 bottom-2 w-0.5 bg-gray-100 border-r border-dashed border-gray-300"></div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-sm"></div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400">نقطة الاستلام</p>
                        <p className="text-xs font-black text-gray-700">{post.pickup}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-600 border-2 border-white shadow-sm"></div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400">وجهة التوصيل</p>
                        <p className="text-xs font-black text-gray-700">{post.delivery}</p>
                      </div>
                    </div>
                 </div>

                 <div className="flex gap-3">
                   <button className="flex-1 py-4 bg-red-600 text-white text-sm font-black rounded-2xl shadow-xl shadow-red-100 active:scale-95 transition-all flex items-center justify-center gap-2">
                     <CheckCircle2 size={18} /> تقديم عرض سعر
                   </button>
                   <button className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-all">
                     <Trash2 size={20} />
                   </button>
                 </div>
              </motion.div>
            ))}
            
            {driverRequests.length === 0 && (
              <div className="py-24 text-center text-gray-400 bg-white rounded-[40px] border border-dashed border-gray-200">
                <Navigation size={64} className="mx-auto mb-6 opacity-10" />
                <p className="text-lg font-black opacity-40">لا توجد طلبات متاحة حالياً</p>
                <p className="text-xs font-bold opacity-30 mt-2">سيتم إشعارك فور توفر طلب جديد في منطقتك</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {pickerConfig?.isOpen && (
        <MapPickerModal
          isOpen={pickerConfig.isOpen}
          onClose={() => setPickerConfig(null)}
          onSelect={handleLocationSelect}
          title={pickerConfig.type === 'pickup' ? 'حدد موقع الاستلام' : 'حدد وجهة التوصيل'}
          initialLocation={pickerConfig.type === 'pickup' ? pickups[pickerConfig.index!].address : delivery.address}
        />
      )}

      {/* Friends Selection Modal */}
      <AnimatePresence>
        {showFriendsModal && (
          <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-w-md rounded-t-[40px] sm:rounded-[40px] overflow-hidden flex flex-col h-[70vh] shadow-2xl"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-black text-gray-900">إرسال لسائق صديق</h3>
                <button onClick={() => setShowFriendsModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft className="rotate-180" /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="relative mb-6">
                  <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="ابحث في قائمة الأصدقاء..." 
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pr-12 pl-4 text-sm font-bold outline-none"
                  />
                </div>

                {filteredFriends.length > 0 ? (
                  filteredFriends.map(friend => (
                    <button
                      key={friend.id}
                      onClick={() => {
                        if (selectedFriends.includes(friend.id)) {
                          setSelectedFriends(selectedFriends.filter(id => id !== friend.id));
                        } else {
                          setSelectedFriends([...selectedFriends, friend.id]);
                        }
                      }}
                      className={`w-full flex items-center justify-between p-5 rounded-3xl border-2 transition-all ${
                        selectedFriends.includes(friend.id)
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-transparent bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm">👤</div>
                        <div className="text-right">
                          <p className="text-sm font-black text-gray-900">{friend.name}</p>
                          <p className="text-[10px] font-bold text-gray-400">التقييم: {friend.rating} ⭐</p>
                        </div>
                      </div>
                      {selectedFriends.includes(friend.id) && <CheckCircle2 size={20} className="text-blue-600" />}
                    </button>
                  ))
                ) : (
                  <div className="py-12 text-center text-gray-400">
                    <Users size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-bold">لا يوجد أصدقاء متاحون في هذا القسم حالياً</p>
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-gray-100">
                <button 
                  onClick={() => setShowFriendsModal(false)}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl text-base font-black shadow-xl shadow-blue-100"
                >
                  تأكيد الاختيار ({selectedFriends.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <CreatePostModal 
        isOpen={isCreatePostOpen} 
        onClose={() => setIsCreatePostOpen(false)} 
      />
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
              <Rocket size={18} className="text-red-500" />
              <span className="text-sm font-bold">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
