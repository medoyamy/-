import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronRight, 
  CheckCircle2, 
  ArrowRight,
  User,
  Phone,
  MessageSquare,
  Zap,
  CreditCard,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';

interface BookingPageProps {
  onClose: () => void;
  postData?: any;
  initialType?: 'instant' | 'scheduled' | 'inspection' | 'execution';
}

export default function BookingPage({ onClose, postData, initialType }: BookingPageProps) {
  const { addBooking } = useCart();
  const [step, setStep] = useState(initialType ? 2 : 1);
  const [bookingType, setBookingType] = useState<'instant' | 'scheduled' | 'inspection' | 'execution' | null>(initialType || null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSelectingMap, setIsSelectingMap] = useState(false);

  const isDeal = postData?.source === 'deals' || postData?.type === 'deals';

  const handleBookingSubmit = () => {
    if (!bookingType) return;

    const newBooking = {
      postId: postData?.id || 'unknown',
      postContent: postData?.content || 'طلب خدمة',
      type: bookingType,
      date: bookingType === 'instant' ? undefined : selectedDate,
      time: bookingType === 'instant' ? undefined : selectedTime,
      authorName: postData?.name || 'مقدم خدمة',
      customerName,
      phone,
      address,
      notes
    };
    addBooking(newBooking);
    setStep(4);
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-black text-gray-900">اختر نوع الحجز</h2>
              <p className="text-xs font-bold text-gray-400">حدد نوع الخدمة التي ترغب في حجزها</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => { setBookingType('instant'); handleNext(); }}
                className="flex items-center gap-4 p-5 rounded-3xl border-2 border-red-100 bg-white hover:bg-red-50 transition-all group text-right"
              >
                <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors shrink-0">
                  <Zap size={28} />
                </div>
                <div>
                  <h4 className="text-base font-black text-gray-900">طلب فوري</h4>
                  <p className="text-[10px] font-bold text-gray-400">تنفيذ الخدمة في أسرع وقت ممكن</p>
                </div>
              </button>

              <button 
                onClick={() => { setBookingType('scheduled'); handleNext(); }}
                className="flex items-center gap-4 p-5 rounded-3xl border-2 border-orange-100 bg-white hover:bg-orange-50 transition-all group text-right"
              >
                <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors shrink-0">
                  <Clock size={28} />
                </div>
                <div>
                  <h4 className="text-base font-black text-gray-900">طلب مجدول</h4>
                  <p className="text-[10px] font-bold text-gray-400">تحديد موعد مسبق للزيارة</p>
                </div>
              </button>

              <button 
                onClick={() => { setBookingType('inspection'); handleNext(); }}
                className="flex items-center gap-4 p-5 rounded-3xl border-2 border-blue-100 bg-white hover:bg-blue-50 transition-all group text-right"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                  <Eye size={28} />
                </div>
                <div>
                  <h4 className="text-base font-black text-gray-900">طلب معاينة</h4>
                  <p className="text-[10px] font-bold text-gray-400">معاينة المكان وتحديد التكلفة</p>
                </div>
              </button>

              <button 
                onClick={() => { setBookingType('execution'); handleNext(); }}
                className="flex items-center gap-4 p-5 rounded-3xl border-2 border-purple-100 bg-white hover:bg-purple-50 transition-all group text-right"
              >
                <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors shrink-0">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h4 className="text-base font-black text-gray-900">طلب تنفيذ</h4>
                  <p className="text-[10px] font-bold text-gray-400">بدء العمل الفعلي في المشروع</p>
                </div>
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
              <h3 className="text-sm font-black text-red-900 mb-2">تفاصيل الخدمة</h3>
              <p className="text-xs font-bold text-red-700 leading-relaxed">
                {postData?.content || 'جاري تحميل تفاصيل الطلب...'}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black text-gray-900">بيانات العميل</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="relative">
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="الاسم بالكامل"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pr-12 pl-4 text-sm font-bold"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="tel" 
                    placeholder="رقم الموبايل"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pr-12 pl-4 text-sm font-bold"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {!isDeal && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-gray-900">عنوان العميل</h3>
                <div className="space-y-3">
                  <div className="relative">
                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="اكتب العنوان بالتفصيل"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pr-12 pl-4 text-sm font-bold"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                  
                  <button 
                    onClick={() => setIsSelectingMap(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 text-xs font-black hover:bg-blue-100 transition-all"
                  >
                    <MapPin size={16} />
                    تحديد الموقع من الخريطة
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <MessageSquare className="absolute right-4 top-4 text-gray-400" size={18} />
                <textarea 
                  placeholder="ملاحظات إضافية"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pr-12 pl-4 text-sm font-bold min-h-[100px] resize-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handleBack}
                className="flex-1 py-4 bg-gray-100 text-gray-900 rounded-2xl text-sm font-black"
              >
                رجوع
              </button>
              <button 
                onClick={() => bookingType === 'instant' ? handleBookingSubmit() : handleNext()}
                disabled={!customerName || !phone || (!isDeal && !address)}
                className="flex-[2] bg-red-600 text-white py-4 rounded-2xl text-sm font-black shadow-xl shadow-red-100 disabled:opacity-50 transition-all"
              >
                {bookingType === 'instant' ? 'تأكيد الطلب' : 'التالي'}
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-black text-gray-900">حدد الموعد المفضل</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="relative">
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="date" 
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pr-12 pl-4 text-sm font-bold"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select 
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pr-12 pl-4 text-sm font-bold appearance-none"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  >
                    <option value="">اختر الوقت</option>
                    <option value="09:00">09:00 صباحاً</option>
                    <option value="12:00">12:00 ظهراً</option>
                    <option value="15:00">03:00 مساءً</option>
                    <option value="18:00">06:00 مساءً</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
              <ShieldCheck className="text-blue-600 shrink-0" size={20} />
              <p className="text-[10px] font-bold text-blue-700 leading-relaxed">
                سيتم إرسال طلب الحجز لمقدم الخدمة للموافقة عليه. سيتم إخطارك فور القبول.
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handleBack}
                className="flex-1 py-4 bg-gray-100 text-gray-900 rounded-2xl text-sm font-black"
              >
                رجوع
              </button>
              <button 
                onClick={handleBookingSubmit}
                disabled={!selectedDate || !selectedTime}
                className="flex-[2] bg-red-600 text-white py-4 rounded-2xl text-sm font-black shadow-xl shadow-red-100 disabled:opacity-50 transition-all"
              >
                تأكيد الموعد
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="text-center py-10 space-y-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
              <CheckCircle2 size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-900">تم إرسال طلب الحجز!</h2>
              <p className="text-sm font-bold text-gray-500">
                نوع الحجز: <span className="text-blue-600">
                  {bookingType === 'instant' ? 'حجز فوري' : 
                   bookingType === 'scheduled' ? 'حجز موعد' :
                   bookingType === 'inspection' ? 'حجز موعد معاينة' : 'حجز موعد تنفيذ'}
                </span>
              </p>
              <p className="text-sm font-bold text-gray-500">
                رقم الحجز: <span className="text-red-600">#BK-8829</span>
              </p>
            </div>
            <p className="text-xs font-bold text-gray-400 leading-relaxed max-w-[250px] mx-auto">
              يمكنك متابعة حالة الحجز من خلال قائمة "حجوزاتي" أو التواصل مع مقدم الخدمة عبر الشات.
            </p>
            <button 
              onClick={onClose}
              className="w-full bg-gray-900 text-white py-4 rounded-2xl text-base font-black shadow-xl active:scale-95 transition-all"
            >
              العودة للرئيسية
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col h-full">
      <header className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowRight size={20} className="text-gray-900" />
          </button>
          <h1 className="text-lg font-black text-gray-900">نظام الحجز الذكي</h1>
        </div>
        <div className="flex items-center gap-1 bg-red-50 px-3 py-1 rounded-full">
          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
          <span className="text-[10px] font-black text-red-600 uppercase">Live</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-md mx-auto">
          {isSelectingMap ? (
            <div className="space-y-6">
              <div className="relative aspect-square bg-gray-100 rounded-[40px] overflow-hidden border-4 border-white shadow-2xl">
                <img 
                  src="https://picsum.photos/seed/map/800/800" 
                  alt="Map Picker" 
                  className="w-full h-full object-cover opacity-50"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative">
                    <MapPin size={48} className="text-red-600 animate-bounce" />
                    <div className="w-4 h-4 bg-red-600/20 rounded-full blur-sm mx-auto"></div>
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-white/50 shadow-xl">
                  <p className="text-xs font-black text-gray-900 text-center">انقر لتحديد موقعك بدقة على الخريطة</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setAddress("شارع التسعين، التجمع الخامس، القاهرة");
                  setIsSelectingMap(false);
                }}
                className="w-full bg-red-600 text-white py-4 rounded-2xl text-base font-black shadow-xl shadow-red-100 active:scale-95 transition-all"
              >
                تأكيد الموقع المختار
              </button>
              <button 
                onClick={() => setIsSelectingMap(false)}
                className="w-full py-2 text-sm font-bold text-gray-400"
              >
                إلغاء
              </button>
            </div>
          ) : (
            <>
              {step < 4 && (
                <div className="flex items-center justify-between mb-8">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center flex-1 last:flex-none">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                        step >= s ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {s}
                      </div>
                      {s < 3 && (
                        <div className={`h-1 flex-1 mx-2 rounded-full transition-all ${
                          step > s ? 'bg-red-600' : 'bg-gray-100'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>
      </div>

      {step < 4 && (
        <footer className="p-6 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <span>Powered by Hagat Booking</span>
            <ShieldCheck size={14} />
          </div>
        </footer>
      )}
    </div>
  );
}
