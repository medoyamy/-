import React, { useState } from 'react';
import AppLayout from './components/AppLayout';
import { CartProvider } from './context/CartContext';
import { UserProvider } from './context/UserContext';
import { PostProvider } from './context/PostContext';
import { ChatProvider } from './context/ChatContext';
import { ReviewProvider } from './context/ReviewContext';
import { SettingsProvider } from './context/SettingsContext';
import SplashScreen from './pages/SplashScreen';
import AuthPage from './pages/AuthPage';
import { auth, testFirestoreConnection } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
// استيراد اللودر من المكتبة
import { useJsApiLoader } from '@react-google-maps/api';
import { useOrderNotifications } from './hooks/useOrderNotifications';

function NotificationHandler() {
  useOrderNotifications();
  return null;
}

// تعريف المكتبات خارج المكون لضمان استقرار التحميل
const libraries: ("places" | "geometry" | "drawing")[] = ['places', 'geometry', 'drawing'];

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // تحميل خرائط جوجل مرة واحدة للتطبيق بالكامل
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyDViHMLQTNisbBYJ93LcWEt0iOSHi0vMyo",
    libraries: libraries,
    language: 'ar',
    region: 'EG'
  });

  React.useEffect(() => {
    if (loadError) {
      console.error("Google Maps Load Error:", loadError);
    }
  }, [loadError]);

  React.useEffect(() => {
    testFirestoreConnection();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 1. شاشة الـ Splash تظهر أولاً
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // 2. حالة التحميل
  if (loading || (!isLoaded && !loadError)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-gray-500">جاري تهيئة التطبيق...</p>
        </div>
      </div>
    );
  }

  // 4. معالجة خطأ تحميل الخريطة (مثل BillingNotEnabledMapError)
  if (loadError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
        <div className="max-w-md flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center animate-pulse">
            <div className="text-4xl">⚠️</div>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-gray-900">تنبيه: تفعيل حساب الدفع مطلوب</h2>
            <p className="text-sm text-gray-500 leading-relaxed font-bold">
              خرائط جوجل تتطلب ربط "حساب دفع" (Billing Account) بمشروعك في Google Cloud لتتمكن من العمل.
            </p>
          </div>
          
          <div className="bg-amber-50 border border-amber-100 p-5 rounded-[24px] w-full text-right space-y-4">
            <p className="text-xs font-black text-amber-800">الخطوات المطلوبة لحل المشكلة:</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">1</div>
                <p className="text-[11px] text-amber-900 font-bold leading-tight">ادخل على Google Cloud Console واربط بطاقة دفع بمشروعك.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">2</div>
                <p className="text-[11px] text-amber-900 font-bold leading-tight">تأكد من تفعيل (Maps JavaScript API) و (Places API) و (Directions API).</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full gap-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-red-600 text-white rounded-2xl font-black shadow-xl shadow-red-100 active:scale-95 transition-all"
            >
              تحديث الصفحة
            </button>
            <p className="text-[9px] font-bold text-gray-400">
              Error: {loadError.name || 'BillingNotEnabledMapError'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. التحقق من تسجيل الدخول
  if (!user) {
    return <AuthPage />;
  }

  // 4. تشغيل التطبيق الرئيسي
  return (
    <SettingsProvider>
      <UserProvider>
        <NotificationHandler />
        <PostProvider>
          <CartProvider>
            <ChatProvider>
              <ReviewProvider>
                <AppLayout />
              </ReviewProvider>
            </ChatProvider>
          </CartProvider>
        </PostProvider>
      </UserProvider>
    </SettingsProvider>
  );
}