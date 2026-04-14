import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Utensils, 
  ShoppingBag, 
  Wrench, 
  Truck, 
  Trash2, 
  Plus, 
  Minus, 
  ChevronLeft,
  MapPin,
  Phone,
  CreditCard,
  ArrowLeft,
  MessageSquare,
  Ticket,
  Clock,
  Bike,
  User,
  Star,
  CheckCircle2,
  Search,
  AlertCircle,
  ShieldCheck,
  X,
  TrendingUp,
  Zap,
  Droplets,
  Hammer,
  RefreshCw,
  Eye,
  Info,
  ChevronRight,
  Package,
  Layers,
  BarChart3,
  Settings as SettingsIcon,
  DollarSign,
  Heart,
  Share2,
  Users,
  Filter,
  ClipboardList,
  Scale,
  Calendar,
  Camera,
  Upload,
  Tag,
  Car
} from 'lucide-react';
import { useCart, CartItem, ServiceItem, DriverRequest, DealItem } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { motion, AnimatePresence } from 'motion/react';
import MessengerPage from './MessengerPage';
import MapPickerModal from '../components/MapPickerModal';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function CartPage({ onClose }: { onClose: () => void }) {
  const { 
    restaurantCart, removeFromRestaurantCart, updateRestaurantQuantity, clearRestaurantCart,
    mercatoCart, removeFromMercatoCart, updateMercatoQuantity, clearMercatoCart,
    assistoCart, updateAssistoStatus, removeFromAssistoCart, clearAssistoCart,
    driverCart, removeFromDriverCart, clearDriverCart,
    dealsCart, removeFromDealsCart, clearDealsCart,
    bookings, removeFromBookings, clearBookings,
    joinRequests, updateJoinRequestQuantity, removeFromJoinRequests, clearJoinRequests
  } = useCart();
  const { activeProfile, updateUserLocation } = useUser();
  const [activeTab, setActiveTab] = useState('restaurants');
  const [notes, setNotes] = useState('');
  const [coupon, setCoupon] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<string>('restaurant');
  const [selectedPrivateDriver, setSelectedPrivateDriver] = useState<string | null>(null);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [tempLocation, setTempLocation] = useState(activeProfile.location);
  const [messagingData, setMessagingData] = useState<{ id: string | number, name: string, avatar?: string } | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedType, setSubmittedType] = useState<string | null>(null);

  const handleSaveLocation = () => {
    updateUserLocation(activeProfile.id, tempLocation);
    setIsEditingLocation(false);
  };

  const tabs = [
    { id: 'restaurants', label: 'طلبات فريش مارت', icon: Utensils },
    { id: 'mercato', label: 'طلبات ميركاتو', icon: ShoppingBag },
    { id: 'assisto', label: 'طلبات اسيستو', icon: Wrench },
    { id: 'delivery', label: 'طلبات اكسبريس', icon: Truck },
    { id: 'deals', label: 'طلبات ديلز', icon: TrendingUp },
    { id: 'bookings', label: 'حجوزاتي', icon: Calendar },
    { id: 'join-requests', label: 'طلبات الانضمام', icon: Users },
  ];

  // Mock Favorite Drivers
  const favoriteDrivers = [
    { id: 'd1', name: 'أحمد محمد', avatar: 'https://picsum.photos/seed/d1/100/100', status: 'online', vehicle: 'موتوسيكل' },
    { id: 'd2', name: 'محمود علي', avatar: 'https://picsum.photos/seed/d2/100/100', status: 'busy', vehicle: 'سيارة' },
    { id: 'd3', name: 'ياسين حسن', avatar: 'https://picsum.photos/seed/d3/100/100', status: 'online', vehicle: 'عجلة' },
  ];

  const calculateRestaurantTotal = () => {
    if (!restaurantCart) return 0;
    const itemsTotal = restaurantCart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    let deliveryFee = 0;
    if (deliveryMethod === 'restaurant') deliveryFee = 30;
    if (deliveryMethod === 'scooter') deliveryFee = 30;
    if (deliveryMethod === 'bike') deliveryFee = 15;
    if (deliveryMethod === 'private') deliveryFee = 30;
    
    const serviceFee = itemsTotal * 0.05;
    return itemsTotal + deliveryFee + serviceFee;
  };

  const calculateMercatoTotal = () => {
    const itemsTotal = mercatoCart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const uniqueStores = new Set(mercatoCart.map(i => i.storeId)).size;
    
    // 30 EGP per store
    const deliveryFee = uniqueStores * 30;
    
    const serviceFee = itemsTotal * 0.05;
    return itemsTotal + deliveryFee + serviceFee;
  };

  const calculateDealsTotal = () => {
    return dealsCart.reduce((acc, deal) => acc + deal.price + deal.managerCommission, 0);
  };

  const calculateDeliveryTotal = () => {
    return driverCart.reduce((acc, req) => acc + req.expectedPrice, 0);
  };

  const handleSubmitOrder = async (type: string) => {
    try {
      // Create order in Firestore
      const orderData: any = {
        customerId: activeProfile.id,
        customerName: activeProfile.name,
        status: 'pending',
        createdAt: serverTimestamp(),
        type,
        location: {
          address: activeProfile.location,
          lat: activeProfile.lat,
          lng: activeProfile.lng
        },
        notes
      };

      if (type === 'restaurants' && restaurantCart) {
        orderData.restaurantId = restaurantCart.restaurantId;
        orderData.restaurantName = restaurantCart.restaurantName;
        orderData.items = restaurantCart.items;
        orderData.total = calculateRestaurantTotal();
        orderData.deliveryMethod = deliveryMethod;
      } else if (type === 'mercato' && mercatoCart.length > 0) {
        orderData.items = mercatoCart;
        orderData.total = calculateMercatoTotal();
      } else if (type === 'delivery' && driverCart.length > 0) {
        orderData.items = driverCart;
        orderData.total = calculateDeliveryTotal();
      }

      await addDoc(collection(db, 'orders'), orderData);

      // Simulate API call
      setSubmittedType(type);
      setIsSubmitted(true);
      
      // Clear the specific cart after a delay or immediately
      setTimeout(() => {
        if (type === 'restaurants') clearRestaurantCart();
        if (type === 'mercato') clearMercatoCart();
        if (type === 'assisto') clearAssistoCart();
        if (type === 'delivery') clearDriverCart();
        if (type === 'deals') clearDealsCart();
        if (type === 'bookings') clearBookings();
        if (type === 'join-requests') clearJoinRequests();
      }, 2000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'orders');
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col h-full bg-white rtl items-center justify-center p-8 text-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">تم إرسال طلبك بنجاح!</h2>
        <p className="text-gray-500 font-bold mb-8">
          {submittedType === 'restaurants' && 'تم إرسال طلبك للمطعم، يمكنك متابعة الحالة من قائمة طلباتي.'}
          {submittedType === 'mercato' && 'تم إرسال طلباتك للمتاجر بنجاح.'}
          {submittedType === 'assisto' && 'جاري البحث عن أفضل فني متاح لخدمتك.'}
          {submittedType === 'delivery' && 'تم تعميم طلبك على السائقين القريبين منك.'}
          {submittedType === 'deals' && 'تم إرسال اهتمامك بالصفقة لمدير ديلز.'}
          {submittedType === 'bookings' && 'تم إرسال طلب الحجز لمقدم الخدمة.'}
          {submittedType === 'join-requests' && 'تم إرسال طلب انضمامك لصاحب المنشور.'}
        </p>
        <button 
          onClick={() => {
            setIsSubmitted(false);
            onClose();
          }}
          className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-all"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 rtl">
      <header className="bg-white px-4 py-4 flex items-center gap-4 border-b border-gray-100 sticky top-0 z-20">
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={20} className="rotate-180" />
        </button>
        <h2 className="text-lg font-black text-gray-800">سلة الطلبات</h2>
      </header>

      {/* Map Picker Modal */}
      <MapPickerModal 
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        title="حدد موقع التوصيل"
        initialLocation={activeProfile.location}
        onSelect={(location) => {
          updateUserLocation(activeProfile.id, location);
        }}
      />

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Tabs */}
        <div className="bg-white px-4 py-3 sticky top-0 z-10 shadow-sm">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white shadow-lg shadow-red-100'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-4">
          {activeTab === 'restaurants' && (
            <div className="space-y-4">
              {restaurantCart ? (
                <>
                  <div className="bg-white rounded-[32px] p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                          <Utensils size={20} />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-gray-800">{restaurantCart.restaurantName}</h3>
                          <p className="text-[10px] font-bold text-gray-400">طلب نشط حالياً</p>
                        </div>
                      </div>
                      <button 
                        onClick={clearRestaurantCart}
                        className="text-red-500 p-2 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="space-y-6">
                      {restaurantCart.items.map(item => (
                        <div key={item.id} className="flex items-center gap-4">
                          <img src={item.image} alt={item.name} className="w-16 h-16 rounded-2xl object-cover shadow-sm" referrerPolicy="no-referrer" />
                          <div className="flex-1">
                            <h4 className="text-xs font-black text-gray-800">{item.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-black text-blue-600">{item.price} ج.م</span>
                              {item.selectedOptions && (
                                <span className="text-[9px] font-bold text-gray-400">
                                  ({Object.values(item.selectedOptions).join(', ')})
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                            <button 
                              onClick={() => updateRestaurantQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-white rounded-lg transition-all"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-black w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateRestaurantQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-white rounded-lg transition-all"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 space-y-4">
                      <div className="relative">
                        <MessageSquare size={16} className="absolute right-4 top-4 text-gray-400" />
                        <textarea 
                          placeholder="أضف ملاحظاتك هنا (مثلاً: بدون بصل، صوص زيادة...)" 
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pr-12 pl-4 text-xs font-bold h-20 resize-none focus:ring-2 focus:ring-blue-100 transition-all"
                          value={notes}
                          onChange={e => setNotes(e.target.value)}
                        />
                      </div>

                      <div className="relative">
                        <Ticket size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="text" 
                          placeholder="كود الخصم" 
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pr-12 pl-4 text-xs font-bold focus:ring-2 focus:ring-blue-100 transition-all"
                          value={coupon}
                          onChange={e => setCoupon(e.target.value)}
                        />
                        <button className="absolute left-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black shadow-md">
                          تطبيق
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-6">
                    <h3 className="text-sm font-black text-gray-800 border-b border-gray-50 pb-3">ملخص الدفع</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                          <MapPin size={16} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-black text-gray-400">استلام من: {restaurantCart.restaurantName}</span>
                            <span className="text-[10px] font-bold text-blue-600">01012345678</span>
                          </div>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-gray-400">توصيل إلى: {activeProfile.location || 'موقع العميل'}</span>
                                <button 
                                  onClick={() => setShowMapPicker(true)}
                                  className="text-[9px] font-bold text-blue-600 hover:underline"
                                >
                                  تغيير
                                </button>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-blue-600">{activeProfile.phone || '01234567890'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-gray-400 mr-1">طريقة التوصيل</p>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { id: 'self', label: 'الاستلام بنفسي من المطعم', time: 'خلال 35 دقيقة', price: 0, icon: User },
                            { id: 'restaurant', label: 'ديليفري المطعم (إن وجد)', time: 'بـ 30ج خلال 45 دقيقة', price: 30, icon: Truck },
                            { id: 'scooter', label: 'سكوتر أو موتوسيكل', time: 'بـ 30ج خلال 5 دقائق', price: 30, icon: Bike },
                            { id: 'bike', label: 'عجلة', time: 'بـ 15ج خلال 15 دقيقة', price: 15, icon: Bike },
                            { id: 'private', label: 'سائق خاص', time: 'بـ 30ج', price: 30, icon: Star },
                          ].map(method => (
                            <button
                              key={method.id}
                              onClick={() => setDeliveryMethod(method.id)}
                              className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                                deliveryMethod === method.id 
                                  ? 'bg-blue-50 border-blue-200 shadow-sm' 
                                  : 'bg-white border-gray-100 hover:border-blue-100'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${deliveryMethod === method.id ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400'}`}>
                                  <method.icon size={16} />
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-black text-gray-800">{method.label}</p>
                                  <p className="text-[9px] font-bold text-gray-400">{method.time}</p>
                                </div>
                              </div>
                              <span className="text-xs font-black text-blue-600">{method.price > 0 ? `${method.price} ج.م` : 'مجاناً'}</span>
                            </button>
                          ))}
                        </div>

                        {deliveryMethod === 'private' && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-amber-50 rounded-2xl border border-amber-100 space-y-3"
                          >
                            <h4 className="text-[10px] font-black text-amber-800">اختر سائقك المفضل</h4>
                            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                              {favoriteDrivers.length > 0 ? (
                                favoriteDrivers.map(driver => (
                                  <button
                                    key={driver.id}
                                    disabled={driver.status === 'busy'}
                                    onClick={() => setSelectedPrivateDriver(driver.id)}
                                    className={`flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                                      selectedPrivateDriver === driver.id 
                                        ? 'bg-white border-amber-400 shadow-md' 
                                        : 'bg-white/50 border-transparent'
                                    } ${driver.status === 'busy' ? 'opacity-50 grayscale' : ''}`}
                                  >
                                    <div className="relative">
                                      <img src={driver.avatar} alt={driver.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" referrerPolicy="no-referrer" />
                                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${driver.status === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-[10px] font-black text-gray-800">{driver.name}</p>
                                      <p className="text-[8px] font-bold text-gray-400">{driver.vehicle}</p>
                                    </div>
                                  </button>
                                ))
                              ) : (
                                <div className="w-full py-4 text-center">
                                  <p className="text-[10px] font-bold text-amber-600">لا يوجد سائقين مفضلين حالياً</p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-50 space-y-3">
                      <div className="flex justify-between text-xs font-bold text-gray-500">
                        <span>حساب المطعم</span>
                        <span>{restaurantCart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)} ج.م</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-gray-500">
                        <span>رسوم التوصيل</span>
                        <span>{deliveryMethod === 'self' ? '0.00' : deliveryMethod === 'bike' ? '15.00' : '30.00'} ج.م</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-gray-500">
                        <span>رسوم الخدمة (5%)</span>
                        <span>{(restaurantCart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0) * 0.05).toFixed(2)} ج.م</span>
                      </div>
                      <div className="flex justify-between text-lg font-black text-gray-800 pt-4">
                        <span>الإجمالي</span>
                        <span className="text-red-600">{calculateRestaurantTotal().toFixed(2)} ج.م</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleSubmitOrder('restaurants')}
                      className="w-full bg-red-600 text-white py-4 rounded-2xl text-base font-black shadow-xl shadow-red-100 mt-6 flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                      إرسال الطلب للمطعم
                      <ShoppingCart size={20} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[40px] border border-gray-100">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-4">
                    <Utensils size={40} />
                  </div>
                  <h3 className="text-lg font-black text-gray-800">سلة فريش مارت فارغة</h3>
                  <p className="text-xs font-bold text-gray-400 mt-2">اطلب وجبتك المفضلة الآن!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'mercato' && (
            <div className="space-y-4">
              {mercatoCart.length > 0 ? (
                <>
                  <div className="bg-white rounded-[32px] p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-sm font-black text-gray-800">منتجات ميركاتو</h3>
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full">
                          {new Set(mercatoCart.map(i => i.storeId)).size} متاجر
                        </div>
                        <button 
                          onClick={clearMercatoCart}
                          className="text-red-500 p-2 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {mercatoCart.map(item => (
                        <div key={item.id} className="flex items-center gap-4">
                          <img src={item.image} alt={item.name} className="w-16 h-16 rounded-2xl object-cover shadow-sm" referrerPolicy="no-referrer" />
                          <div className="flex-1">
                            <h4 className="text-xs font-black text-gray-800">{item.name}</h4>
                            <p className="text-[10px] font-bold text-gray-400 mb-1">{item.storeName}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-blue-600">{item.price} ج.م</span>
                              {item.selectedOptions && (
                                <span className="text-[9px] font-bold text-gray-400">
                                  ({Object.values(item.selectedOptions).join(', ')})
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                            <button 
                              onClick={() => updateMercatoQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-white rounded-lg transition-all"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-black w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateMercatoQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-white rounded-lg transition-all"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <button 
                            onClick={() => removeFromMercatoCart(item.id)}
                            className="text-gray-300 hover:text-red-500 p-2"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 space-y-4">
                      <div className="relative">
                        <MessageSquare size={16} className="absolute right-4 top-4 text-gray-400" />
                        <textarea 
                          placeholder="ملاحظات إضافية للمتجر..." 
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pr-12 pl-4 text-xs font-bold h-20 resize-none focus:ring-2 focus:ring-blue-100 transition-all"
                          value={notes}
                          onChange={e => setNotes(e.target.value)}
                        />
                      </div>

                      <div className="relative">
                        <Ticket size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="text" 
                          placeholder="كود الخصم" 
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pr-12 pl-4 text-xs font-bold focus:ring-2 focus:ring-blue-100 transition-all"
                          value={coupon}
                          onChange={e => setCoupon(e.target.value)}
                        />
                        <button className="absolute left-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black shadow-md">
                          تطبيق
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-6">
                    <h3 className="text-sm font-black text-gray-800 border-b border-gray-50 pb-3">ملخص الدفع</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                          <MapPin size={16} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-black text-gray-400">استلام من: مواقع المتاجر</span>
                            <span className="text-[10px] font-bold text-blue-600">تعدد المتاجر</span>
                          </div>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-gray-400">توصيل إلى: {activeProfile.location || 'موقع العميل'}</span>
                                <button 
                                  onClick={() => setShowMapPicker(true)}
                                  className="text-[9px] font-bold text-blue-600 hover:underline"
                                >
                                  تغيير
                                </button>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-blue-600">01234567890</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                        <p className="text-[10px] font-black text-gray-400">طريقة التوصيل</p>
                        <div className="flex items-center gap-3">
                          <Truck size={16} className="text-blue-600" />
                          <p className="text-xs font-black text-gray-800">
                            {new Set(mercatoCart.map(i => i.storeId)).size === 1 
                              ? 'توصيل خلال يوم واحد (منطقة واحدة)' 
                              : 'توصيل مجمع من عدة متاجر'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-50 space-y-3">
                      <div className="flex justify-between text-xs font-bold text-gray-500">
                        <span>حساب المتجر</span>
                        <span>{mercatoCart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)} ج.م</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-gray-500">
                        <span>رسوم التوصيل</span>
                        <span>
                          {(() => {
                            const uniqueStores = new Set(mercatoCart.map(i => i.storeId)).size;
                            return (uniqueStores * 30).toFixed(2);
                          })()} ج.م
                        </span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-gray-500">
                        <span>رسوم الخدمة (5%)</span>
                        <span>{(mercatoCart.reduce((acc, item) => acc + (item.price * item.quantity), 0) * 0.05).toFixed(2)} ج.م</span>
                      </div>
                      <div className="flex justify-between text-lg font-black text-gray-800 pt-4">
                        <span>الإجمالي</span>
                        <span className="text-red-600">{calculateMercatoTotal().toFixed(2)} ج.م</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleSubmitOrder('mercato')}
                      className="w-full bg-red-600 text-white py-4 rounded-2xl text-base font-black shadow-xl shadow-red-100 mt-6 flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                      إرسال الطلب للمتاجر
                      <ShoppingCart size={20} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[40px] border border-gray-100">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-4">
                    <ShoppingBag size={40} />
                  </div>
                  <h3 className="text-lg font-black text-gray-800">سلة ميركاتو فارغة</h3>
                  <p className="text-xs font-bold text-gray-400 mt-2">ابدأ بالتسوق من ميركاتو الآن!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'assisto' && (
            <div className="space-y-4">
              {assistoCart.length > 0 ? (
                <>
                  <div className="flex justify-end px-2">
                    <button 
                      onClick={clearAssistoCart}
                      className="flex items-center gap-2 text-red-500 text-[10px] font-black bg-white px-4 py-2 rounded-xl border border-red-50 shadow-sm"
                    >
                      <Trash2 size={14} />
                      مسح الكل
                    </button>
                  </div>
                  {assistoCart.map(order => (
                  <div key={order.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                          order.name.includes('كهرباء') ? 'bg-amber-50 text-amber-600' :
                          order.name.includes('سباكة') ? 'bg-blue-50 text-blue-600' :
                          order.name.includes('نجارة') ? 'bg-orange-50 text-orange-600' :
                          'bg-emerald-50 text-emerald-600'
                        }`}>
                          {order.name.includes('كهرباء') ? <Zap size={24} /> :
                           order.name.includes('سباكة') ? <Droplets size={24} /> :
                           order.name.includes('نجارة') ? <Hammer size={24} /> :
                           <Wrench size={24} />}
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-gray-800">{order.name}</h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Clock size={12} className="text-gray-400" />
                            <p className="text-[10px] font-bold text-gray-400">{order.time}</p>
                          </div>
                        </div>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black shadow-sm flex items-center gap-1.5 ${
                        order.status === 'pending' ? 'bg-gray-100 text-gray-500' :
                        order.status === 'searching' ? 'bg-blue-50 text-blue-600 animate-pulse' :
                        'bg-emerald-50 text-emerald-600'
                      }`}>
                        {order.status === 'searching' && <RefreshCw size={10} className="animate-spin" />}
                        {order.status === 'pending' ? 'بانتظار الإرسال' :
                         order.status === 'searching' ? 'جاري البحث عن فني' : 'تم قبول الطلب'}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-2xl space-y-3 border border-gray-100">
                      <div className="flex items-start gap-2">
                        <ClipboardList size={14} className="text-gray-400 mt-0.5" />
                        <p className="text-xs font-bold text-gray-600 leading-relaxed">{order.description}</p>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 bg-white px-3 py-1.5 rounded-xl w-fit shadow-sm">
                        <MapPin size={12} />
                        <span>{order.location}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {order.status === 'pending' && (
                        <button 
                          onClick={() => updateAssistoStatus(order.id, 'searching')}
                          className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl text-xs font-black shadow-lg shadow-blue-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <Search size={16} />
                          إرسال الطلب الآن
                        </button>
                      )}
                      {order.status === 'searching' && (
                        <button 
                          className="flex-1 bg-gray-100 text-gray-500 py-3.5 rounded-2xl text-xs font-black active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <RefreshCw size={16} className="animate-spin" />
                          جاري البحث...
                        </button>
                      )}
                      <button 
                        onClick={() => removeFromAssistoCart(order.id)}
                        className="p-3.5 bg-gray-50 text-gray-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[40px] border border-gray-100">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-4">
                    <Wrench size={40} />
                  </div>
                  <h3 className="text-lg font-black text-gray-800">لا توجد طلبات خدمات</h3>
                  <p className="text-xs font-bold text-gray-400 mt-2">اطلب خدمة أسيستو الآن!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="space-y-4">
              {driverCart.length > 0 ? (
                <>
                  <div className="flex justify-end px-2">
                    <button 
                      onClick={clearDriverCart}
                      className="flex items-center gap-2 text-red-500 text-[10px] font-black bg-white px-4 py-2 rounded-xl border border-red-50 shadow-sm"
                    >
                      <Trash2 size={14} />
                      مسح الكل
                    </button>
                  </div>
                  {driverCart.map(request => (
                  <div key={request.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                          request.vehicleType === 'موتوسيكل' ? 'bg-orange-50 text-orange-600' :
                          request.vehicleType === 'سيارة' ? 'bg-blue-50 text-blue-600' :
                          request.vehicleType === 'عجلة' ? 'bg-emerald-50 text-emerald-600' :
                          'bg-red-50 text-red-600'
                        }`}>
                          {request.vehicleType === 'موتوسيكل' ? <Bike size={24} /> :
                           request.vehicleType === 'سيارة' ? <Car size={24} /> :
                           request.vehicleType === 'عجلة' ? <Bike size={24} /> :
                           <Truck size={24} />}
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-gray-800">طلب توصيل: {request.vehicleType}</h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            <DollarSign size={12} className="text-emerald-600" />
                            <p className="text-[11px] font-black text-emerald-600">السعر المتوقع: {request.expectedPrice} ج.م</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-amber-50 text-amber-600 px-4 py-1.5 rounded-full text-[10px] font-black shadow-sm flex items-center gap-1.5">
                        <RefreshCw size={10} className="animate-spin" />
                        بانتظار القبول
                      </div>
                    </div>

                    <div className="relative space-y-6 pr-4 before:absolute before:right-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 before:dashed">
                      <div className="flex items-start gap-4 relative">
                        <div className="w-5 h-5 bg-blue-600 rounded-full border-4 border-white shadow-sm z-10"></div>
                        <div className="flex-1">
                          <p className="text-[10px] font-black text-gray-400">نقطة الاستلام</p>
                          <p className="text-xs font-bold text-gray-700 mt-0.5">{request.pickupLocation}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 relative">
                        <div className="w-5 h-5 bg-red-600 rounded-full border-4 border-white shadow-sm z-10"></div>
                        <div className="flex-1">
                          <p className="text-[10px] font-black text-gray-400">نقطة التوصيل</p>
                          <p className="text-xs font-bold text-gray-700 mt-0.5">{request.deliveryLocation}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleSubmitOrder('delivery')}
                        className="flex-1 bg-red-600 text-white py-3.5 rounded-2xl text-xs font-black shadow-lg shadow-red-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={16} />
                        تأكيد وإرسال الطلب
                      </button>
                      <button 
                        onClick={() => removeFromDriverCart(request.id)}
                        className="p-3.5 bg-gray-50 text-gray-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[40px] border border-gray-100">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-4">
                    <Truck size={40} />
                  </div>
                  <h3 className="text-lg font-black text-gray-800">لا توجد طلبات توصيل</h3>
                  <p className="text-xs font-bold text-gray-400 mt-2">اطلب سائقاً لتوصيل أغراضك الآن!</p>
                </div>
              )}
              {driverCart.length > 0 && (
                <div className="mt-8 bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-black text-gray-800">
                      <span>إجمالي السعر المتوقع</span>
                      <span className="text-emerald-600">{calculateDeliveryTotal().toFixed(2)} ج.م</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 leading-relaxed">
                      * هذا السعر هو تقدير أولي وقد يتغير بناءً على تفاصيل الرحلة الفعلية.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'deals' && (
            <div className="space-y-4">
              {dealsCart.length > 0 ? (
                <>
                  <div className="flex justify-end px-2">
                    <button 
                      onClick={clearDealsCart}
                      className="flex items-center gap-2 text-red-500 text-[10px] font-black bg-white px-4 py-2 rounded-xl border border-red-50 shadow-sm"
                    >
                      <Trash2 size={14} />
                      مسح الكل
                    </button>
                  </div>
                  {dealsCart.map(deal => (
                  <div key={deal.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-5">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <img src={deal.image} alt={deal.name} className="w-24 h-24 rounded-[24px] object-cover shadow-md" referrerPolicy="no-referrer" />
                        <div className="absolute -top-2 -right-2 bg-blue-600 text-white p-2 rounded-xl shadow-lg">
                          <TrendingUp size={14} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-black text-gray-800 leading-tight">{deal.name}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <DollarSign size={14} className="text-blue-600" />
                          <span className="text-sm font-black text-blue-600">{deal.price} ج.م</span>
                        </div>
                        <div className="mt-3 bg-emerald-50 px-3 py-1.5 rounded-xl w-fit flex items-center gap-2">
                          <span className="text-[10px] font-bold text-emerald-700">عمولة المدير:</span>
                          <span className="text-[10px] font-black text-emerald-700">{deal.managerCommission} ج.م</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                      <Info size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-[10px] font-bold text-amber-800 leading-relaxed">
                        هذا الطلب يخضع لنظام عمولة مدير ديلز لضمان حقوق الطرفين. سيتم التواصل معك لتأكيد التفاصيل.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleSubmitOrder('deals')}
                        className="flex-1 bg-red-600 text-white py-3.5 rounded-2xl text-xs font-black shadow-lg shadow-red-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={16} />
                        إتمام الصفقة الآن
                      </button>
                      <button 
                        onClick={() => removeFromDealsCart(deal.id)}
                        className="p-3.5 bg-gray-50 text-gray-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[40px] border border-gray-100">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-4">
                    <TrendingUp size={40} />
                  </div>
                  <h3 className="text-lg font-black text-gray-800">لا توجد صفقات حالياً</h3>
                  <p className="text-xs font-bold text-gray-400 mt-2">تصفح بوابة ديلز وابحث عن فرصتك!</p>
                </div>
              )}
              {dealsCart.length > 0 && (
                <div className="mt-8 bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-black text-gray-800">
                      <span>إجمالي قيمة ديلز</span>
                      <span>{dealsCart.reduce((acc, deal) => acc + deal.price, 0).toFixed(2)} ج.م</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-gray-500">
                      <span>إجمالي العمولات</span>
                      <span>{dealsCart.reduce((acc, deal) => acc + deal.managerCommission, 0).toFixed(2)} ج.م</span>
                    </div>
                    <div className="flex justify-between text-lg font-black text-gray-800 pt-4 border-t border-gray-100">
                      <span>الإجمالي النهائي</span>
                      <span className="text-blue-600">{calculateDealsTotal().toFixed(2)} ج.م</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-4">
              {bookings.length > 0 ? (
                <>
                  <div className="flex justify-end px-2">
                    <button 
                      onClick={clearBookings}
                      className="flex items-center gap-2 text-red-500 text-[10px] font-black bg-white px-4 py-2 rounded-xl border border-red-50 shadow-sm"
                    >
                      <Trash2 size={14} />
                      مسح الكل
                    </button>
                  </div>
                  {bookings.map(booking => (
                  <div key={booking.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                          booking.type === 'instant' ? 'bg-red-50 text-red-600' :
                          booking.type === 'scheduled' ? 'bg-orange-50 text-orange-600' :
                          booking.type === 'inspection' ? 'bg-blue-50 text-blue-600' :
                          'bg-purple-50 text-purple-600'
                        }`}>
                          {booking.type === 'instant' ? <Zap size={24} /> :
                           booking.type === 'scheduled' ? <Clock size={24} /> :
                           booking.type === 'inspection' ? <Eye size={24} /> :
                           <ShieldCheck size={24} />}
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-gray-800">
                            {booking.type === 'instant' ? 'حجز فوري' : 
                             booking.type === 'scheduled' ? 'حجز موعد' :
                             booking.type === 'inspection' ? 'حجز موعد معاينة' : 'حجز موعد تنفيذ'}
                          </h3>
                          <p className="text-[10px] font-bold text-gray-400 mt-1">رقم الحجز: {booking.id}</p>
                        </div>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black shadow-sm ${
                        booking.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                        booking.status === 'accepted' ? 'bg-emerald-50 text-emerald-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        {booking.status === 'pending' ? 'بانتظار الموافقة' :
                         booking.status === 'accepted' ? 'تم القبول' : 'مرفوض'}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-2xl space-y-3 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <User size={14} className="text-gray-400" />
                        <p className="text-xs font-bold text-gray-700">مقدم الخدمة: {booking.authorName}</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <ClipboardList size={14} className="text-gray-400 mt-0.5" />
                        <p className="text-xs font-bold text-gray-600 leading-relaxed">{booking.postContent}</p>
                      </div>
                      {(booking.date || booking.time) && (
                        <div className="flex items-center gap-4 pt-2 border-t border-gray-200/50">
                          {booking.date && (
                            <div className="flex items-center gap-1.5">
                              <Calendar size={12} className="text-blue-600" />
                              <span className="text-[10px] font-black text-gray-800">{booking.date}</span>
                            </div>
                          )}
                          {booking.time && (
                            <div className="flex items-center gap-1.5">
                              <Clock size={12} className="text-blue-600" />
                              <span className="text-[10px] font-black text-gray-800">{booking.time}</span>
                            </div>
                          )}
                        </div>
                      )}
                      {booking.customerName && (
                        <div className="flex items-center gap-3 pt-2 border-t border-gray-200/50">
                          <User size={14} className="text-blue-600" />
                          <p className="text-xs font-black text-gray-800">الاسم: {booking.customerName}</p>
                        </div>
                      )}
                      {booking.phone && (
                        <div className="flex items-center gap-3 pt-2 border-t border-gray-200/50">
                          <Phone size={14} className="text-emerald-600" />
                          <p className="text-xs font-black text-gray-800">رقم الموبايل: {booking.phone}</p>
                        </div>
                      )}
                      {booking.address && (
                        <div className="flex items-center gap-3 pt-2 border-t border-gray-200/50">
                          <MapPin size={14} className="text-red-600" />
                          <p className="text-xs font-black text-gray-800">العنوان: {booking.address}</p>
                        </div>
                      )}
                      {booking.notes && (
                        <div className="flex items-start gap-3 pt-2 border-t border-gray-200/50">
                          <MessageSquare size={14} className="text-gray-400 mt-0.5" />
                          <p className="text-xs font-bold text-gray-500 italic">ملاحظات: {booking.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => setMessagingData({ 
                          id: booking.authorName,
                          name: booking.authorName 
                        })}
                        className="flex-1 bg-gray-900 text-white py-3.5 rounded-2xl text-xs font-black shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <MessageSquare size={16} />
                        تواصل مع مقدم الخدمة
                      </button>
                      <button 
                        onClick={() => removeFromBookings(booking.id)}
                        className="p-3.5 bg-gray-50 text-gray-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[40px] border border-gray-100">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-4">
                    <Calendar size={40} />
                  </div>
                  <h3 className="text-lg font-black text-gray-800">لا توجد حجوزات حالياً</h3>
                  <p className="text-xs font-bold text-gray-400 mt-2">ابدأ بحجز خدماتك المفضلة الآن!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'join-requests' && (
            <div className="space-y-4">
              {joinRequests.length > 0 ? (
                <>
                  <div className="flex justify-end px-2">
                    <button 
                      onClick={clearJoinRequests}
                      className="flex items-center gap-2 text-red-500 text-[10px] font-black bg-white px-4 py-2 rounded-xl border border-red-50 shadow-sm"
                    >
                      <Trash2 size={14} />
                      مسح الكل
                    </button>
                  </div>
                  {joinRequests.map(request => (
                    <div key={request.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                            <Users size={24} />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-gray-800">طلب انضمام جماعي</h3>
                            <p className="text-[10px] font-bold text-gray-400 mt-1">رقم الطلب: {request.id}</p>
                          </div>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black shadow-sm ${
                          request.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                          request.status === 'accepted' ? 'bg-emerald-50 text-emerald-600' :
                          'bg-red-50 text-red-600'
                        }`}>
                          {request.status === 'pending' ? 'بانتظار الموافقة' :
                           request.status === 'accepted' ? 'تم القبول' : 'مرفوض'}
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-2xl space-y-3 border border-gray-100">
                        <div className="flex items-center gap-3">
                          <User size={14} className="text-gray-400" />
                          <p className="text-xs font-bold text-gray-700">صاحب المنشور: {request.authorName}</p>
                        </div>
                        {request.customerName && (
                          <div className="flex items-center gap-3 pt-2 border-t border-gray-200/50">
                            <User size={14} className="text-blue-600" />
                            <p className="text-xs font-black text-gray-800">الاسم: {request.customerName}</p>
                          </div>
                        )}
                        <div className="flex items-start gap-3">
                          <ClipboardList size={14} className="text-gray-400 mt-0.5" />
                          <p className="text-xs font-bold text-gray-600 leading-relaxed">{request.postContent}</p>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200/50">
                          <div className="flex items-center gap-3">
                            <Users size={14} className="text-blue-600" />
                            <p className="text-xs font-black text-gray-800">العدد المطلوب: {request.quantity}</p>
                          </div>
                          <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-gray-100">
                            <button 
                              onClick={() => updateJoinRequestQuantity(request.id, request.quantity - 1)}
                              className="p-1 hover:bg-gray-50 rounded-lg transition-all"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-black w-4 text-center">{request.quantity}</span>
                            <button 
                              onClick={() => updateJoinRequestQuantity(request.id, request.quantity + 1)}
                              className="p-1 hover:bg-gray-50 rounded-lg transition-all"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                        {request.address && (
                          <div className="flex items-center gap-3 pt-2 border-t border-gray-200/50">
                            <MapPin size={14} className="text-red-600" />
                            <p className="text-xs font-black text-gray-800">العنوان: {request.address}</p>
                          </div>
                        )}
                        {request.phone && (
                          <div className="flex items-center gap-3 pt-2 border-t border-gray-200/50">
                            <Phone size={14} className="text-emerald-600" />
                            <p className="text-xs font-black text-gray-800">رقم الموبايل: {request.phone}</p>
                          </div>
                        )}
                        {request.deliveryMethod && (
                          <div className="flex items-center gap-3 pt-2 border-t border-gray-200/50">
                            <Truck size={14} className="text-blue-600" />
                            <p className="text-xs font-black text-gray-800">طريقة التوصيل: {request.deliveryMethod}</p>
                          </div>
                        )}
                        {request.notes && (
                          <div className="flex items-start gap-3 pt-2 border-t border-gray-200/50">
                            <MessageSquare size={14} className="text-gray-400 mt-0.5" />
                            <p className="text-xs font-bold text-gray-500 italic">ملاحظات: {request.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3">
                        {request.status === 'pending' && (
                          <button 
                            onClick={() => handleSubmitOrder('join-requests')}
                            className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl text-xs font-black shadow-lg shadow-blue-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 size={16} />
                            إرسال طلب الانضمام
                          </button>
                        )}
                        <button 
                          onClick={() => setMessagingData({ 
                            id: request.authorName,
                            name: request.authorName 
                          })}
                          className="flex-1 bg-gray-900 text-white py-3.5 rounded-2xl text-xs font-black shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <MessageSquare size={16} />
                          تواصل مع صاحب المنشور
                        </button>
                        <button 
                          onClick={() => removeFromJoinRequests(request.id)}
                          className="p-3.5 bg-gray-50 text-gray-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[40px] border border-gray-100">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-4">
                    <Users size={40} />
                  </div>
                  <h3 className="text-lg font-black text-gray-800">لا توجد طلبات انضمام</h3>
                  <p className="text-xs font-bold text-gray-400 mt-2">انضم للطلبات الجماعية في الأفالون الآن!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {messagingData && (
        <div className="fixed inset-0 z-[300] bg-white">
          <MessengerPage 
            onClose={() => setMessagingData(null)} 
            initialUser={{
              id: messagingData.id,
              name: messagingData.name,
              avatar: messagingData.avatar
            }}
          />
        </div>
      )}
    </div>
  );
}
