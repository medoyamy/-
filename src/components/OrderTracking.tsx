import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Package, 
  CheckCircle2, 
  Clock, 
  Truck, 
  MapPin, 
  Phone, 
  MessageCircle,
  ChevronLeft,
  Receipt,
  CreditCard,
  Navigation,
  Maximize2
} from 'lucide-react';
import { UnifiedMap } from './UnifiedMap';
import { Marker } from '@react-google-maps/api';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';

import { useUser } from '../context/UserContext';
import { useLocationTracking } from '../hooks/useLocationTracking';

interface OrderTrackingProps {
  order: any;
  onBack: () => void;
}

export default function OrderTracking({ order, onBack }: OrderTrackingProps) {
  const { activeProfile, userMode } = useUser();
  const [driverLocation, setDriverLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [showFullMap, setShowFullMap] = useState(order.status === 'جاري التوصيل' || order.status === 'on_way');
  const [currentOrder, setCurrentOrder] = useState(order);

  // If the current user is the driver for this order, start tracking their location
  const isDriver = userMode === 'driver' || userMode === 'provider' || activeProfile.id === currentOrder.driverId;
  const isOrderActive = currentOrder.status === 'on_way' || currentOrder.status === 'accepted' || currentOrder.status === 'جاري التوصيل';
  
  useLocationTracking(
    isDriver ? (currentOrder.driverId || currentOrder.id) : null, 
    isOrderActive
  );

  // Listen to driver location in real-time
  useEffect(() => {
    const trackingId = currentOrder.driverId || currentOrder.id || 'test-order-123';
    const docRef = doc(db, 'driver_locations', trackingId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.lat && data.lng) {
          setDriverLocation({ lat: data.lat, lng: data.lng });
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `driver_locations/${trackingId}`);
    });

    return () => unsubscribe();
  }, [currentOrder.driverId, currentOrder.id]);

  const handleAcceptOrder = async () => {
    // In a real app, this would update Firestore
    const updatedOrder = { 
      ...currentOrder, 
      status: 'accepted', 
      driverId: activeProfile.id,
      driverName: activeProfile.name,
      driverAvatar: activeProfile.avatar
    };
    setCurrentOrder(updatedOrder);
    
    // Mocking Firestore update for tracking
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const trackingId = updatedOrder.driverId || updatedOrder.id;
        await setDoc(doc(db, 'driver_locations', trackingId), {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      });
    }
  };

  const steps = [
    { id: 1, label: 'تم الطلب', time: '10:30 ص', completed: true, active: false },
    { id: 2, label: 'قيد التجهيز', time: '10:45 ص', completed: !['pending', 'جديد'].includes(currentOrder.status), active: ['pending', 'جديد'].includes(currentOrder.status) },
    { id: 3, label: 'جاري التوصيل', time: '11:15 ص', completed: ['delivered', 'مكتملة'].includes(currentOrder.status), active: ['accepted', 'on_way', 'جاري التوصيل'].includes(currentOrder.status) },
    { id: 4, label: 'تم الاستلام', time: '--:--', completed: false, active: ['delivered', 'مكتملة'].includes(currentOrder.status) },
  ];

  return (
    <div className="flex flex-col min-h-full bg-gray-50 animate-in slide-in-from-left duration-300">
      {/* Header */}
      <header className="bg-white px-4 py-4 flex items-center gap-4 border-b border-gray-100 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowRight size={20} />
        </button>
        <h2 className="text-lg font-black text-gray-800">تتبع الطلب #{currentOrder.id || '12345'}</h2>
      </header>

      <div className="p-4 space-y-4">
        {/* Real-time Map Tracking */}
        <div className={`bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-500 ${showFullMap ? 'h-[500px]' : 'h-[300px]'}`}>
          <div className="relative h-full w-full">
            <UnifiedMap 
              center={driverLocation || { lat: 31.0409, lng: 31.3785 }} 
              zoom={15}
              disableAutoCenter={true}
            >
              {driverLocation && (
                <Marker 
                  position={driverLocation}
                  icon={{
                    path: "M20,8C12.3,8,6,14.3,6,22c0,7.7,6.3,14,14,14s14-6.3,14-14C34,14.3,27.7,8,20,8z M20,31c-5,0-9-4-9-9s4-9,9-9s9,4,9,9 S25,31,20,31z M20,15c-3.9,0-7,3.1-7,7s3.1,7,7,7s7-3.1,7-7S23.9,15,20,15z",
                    fillColor: "#ef4444",
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "#ffffff",
                    scale: 1,
                    anchor: new google.maps.Point(20, 20)
                  }}
                />
              )}
              {/* Customer Location (Destination) */}
              <Marker 
                position={{ lat: 31.0409, lng: 31.3785 }} // Mock destination
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor: "#10b981",
                  fillOpacity: 1,
                  strokeWeight: 3,
                  strokeColor: "#ffffff",
                  scale: 8
                }}
              />
            </UnifiedMap>
            
            {/* Map Overlay Info */}
            <div className="absolute top-4 right-4 left-4 flex justify-between items-start pointer-events-none">
              <div className="bg-white/90 backdrop-blur-md px-3 py-2 rounded-2xl shadow-lg border border-white/20 pointer-events-auto">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                  <span className="text-[10px] font-black text-gray-800">تتبع مباشر للمندوب</span>
                </div>
              </div>
              <button 
                onClick={() => setShowFullMap(!showFullMap)}
                className="p-2 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/20 pointer-events-auto active:scale-95 transition-all"
              >
                <Maximize2 size={16} className="text-gray-700" />
              </button>
            </div>

            {!driverLocation && (
              <div className="absolute inset-0 bg-black/5 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                <div className="bg-white px-4 py-2 rounded-full shadow-xl border border-gray-100 flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[10px] font-black text-gray-600">في انتظار تحديد موقع المندوب...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Info Card */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
              <Package size={32} />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-800">{currentOrder.title || 'طلب من سوبر ماركت خير زمان'}</h3>
              <p className="text-[10px] font-bold text-gray-400">تاريخ الطلب: 20 مارس 2026</p>
              <p className="text-xs font-black text-red-600 mt-1">إجمالي الفاتورة: 280.00 ج.م</p>
            </div>
          </div>
          <div className="h-px bg-gray-50 w-full mb-4"></div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-400">طريقة الدفع</span>
            <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-md">نقدي (كاش للمندوب)</span>
          </div>
        </div>

        {/* Order Details Section */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Receipt size={18} className="text-red-600" />
            <h3 className="text-sm font-black text-gray-800">تفاصيل الطلب</h3>
          </div>
          <div className="space-y-3">
            {[
              { name: 'حليب جهينة 1 لتر', qty: 2, price: 70 },
              { name: 'خبز فينو (كيس)', qty: 1, price: 15 },
              { name: 'جبنة دومتي 500 جم', qty: 1, price: 45 },
              { name: 'بيض (كرتونة 30)', qty: 1, price: 120 },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 w-4">{item.qty}x</span>
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <span className="text-gray-900">{item.price} ج.م</span>
              </div>
            ))}
            <div className="h-px bg-gray-50 w-full my-2"></div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[11px] font-bold text-gray-800">
                <span>إجمالي البضاعة (صافي التاجر)</span>
                <span>250 ج.م</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-bold text-gray-400">
                <span>رسوم التوصيل + القيمة المضافة</span>
                <span>30 ج.م</span>
              </div>
              <div className="flex justify-between items-center text-sm font-black text-red-600 pt-1 border-t border-gray-50 mt-1">
                <span>الإجمالي الكلي (يدفعه العميل)</span>
                <span>280 ج.م</span>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-2xl mt-4">
              <p className="text-[10px] font-bold text-blue-700 leading-relaxed">
                * ملاحظة: المندوب سيقوم بدفع مبلغ <span className="font-black underline">250 ج.م</span> (ثمن البضاعة) للتاجر عند الاستلام، ويقوم بتحصيل الإجمالي من العميل.
              </p>
            </div>

            {/* Action Buttons Inside Order */}
            {currentOrder.status === 'pending' && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <button 
                  onClick={handleAcceptOrder}
                  className="flex-1 bg-green-500 text-white py-3 rounded-2xl text-sm font-black hover:bg-green-600 transition-all shadow-sm shadow-green-100"
                >
                  قبول الطلب
                </button>
                <button className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-2xl text-sm font-black hover:bg-gray-200 transition-all">
                  رفض
                </button>
              </div>
            )}
            {currentOrder.status === 'accepted' && isDriver && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => setCurrentOrder({...currentOrder, status: 'delivered'})}
                  className="w-full bg-blue-600 text-white py-3 rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-sm shadow-blue-100"
                >
                  تأكيد التسليم للعميل
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tracking Stepper */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-black text-gray-800 mb-6">حالة الطلب</h3>
          <div className="relative space-y-8">
            {/* Vertical Line */}
            <div className="absolute top-0 bottom-0 right-[15px] w-0.5 bg-gray-100"></div>
            
            {steps.map((step, i) => (
              <div key={step.id} className="relative flex items-center gap-4 pr-10">
                {/* Step Circle */}
                <div className={`absolute right-0 w-8 h-8 rounded-full flex items-center justify-center z-10 border-4 border-white shadow-sm ${
                  step.completed ? 'bg-green-500 text-white' : 
                  step.active ? 'bg-red-600 text-white animate-pulse' : 
                  'bg-gray-200 text-gray-400'
                }`}>
                  {step.completed ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 bg-current rounded-full"></div>}
                </div>
                
                <div className="flex-1">
                  <h4 className={`text-sm font-black ${step.active ? 'text-red-600' : 'text-gray-800'}`}>{step.label}</h4>
                  <p className="text-[10px] font-bold text-gray-400">{step.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Driver Info */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-black text-gray-800 mb-4">بيانات المندوب</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={currentOrder.driverAvatar || "https://picsum.photos/seed/driver/100/100"} 
                alt="Driver" 
                className="w-12 h-12 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="text-sm font-black text-gray-800">{currentOrder.driverName || 'محمد علي'}</h4>
                <div className="flex items-center gap-1">
                  <Truck size={12} className="text-red-500" />
                  <span className="text-[10px] font-bold text-gray-500">سيارة • ABC 123</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all">
                <Phone size={20} />
              </button>
              <button className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all">
                <MessageCircle size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-black text-gray-800 mb-3">عنوان التوصيل</h3>
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-red-600 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-gray-700">المنصورة، حي الجامعة، شارع جيهان، عمارة 12</p>
              <p className="text-[10px] font-bold text-gray-400 mt-1">ملاحظة: بجوار بوابة الجامعة (توشكى)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
