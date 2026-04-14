import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Phone, 
  User, 
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Smartphone,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signInWithPopup,
  updateProfile,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'phone-login' | 'otp-verify';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  React.useEffect(() => {
    resetMessages();
    // Reset form fields when mode changes to ensure a clean state
    if (mode !== 'otp-verify') {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setName('');
      setPhoneNumber('');
      setOtp('');
      setConfirmationResult(null);
    }
    setShowPassword(false);
  }, [mode]);

  const resetMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': () => {
            console.log("reCAPTCHA solved");
          },
          'expired-callback': () => {
            console.log("reCAPTCHA expired");
            if ((window as any).recaptchaVerifier) {
              (window as any).recaptchaVerifier.clear();
              (window as any).recaptchaVerifier = null;
            }
          }
        });
      } catch (err) {
        console.error("reCAPTCHA setup failed:", err);
      }
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    
    if (!phoneNumber.startsWith('+')) {
      setError('يرجى إدخال رقم الهاتف بصيغة دولية (مثال: +201234567890)');
      return;
    }

    if (phoneNumber.length < 10) {
      setError('رقم الهاتف غير صحيح');
      return;
    }

    setLoading(true);
    try {
      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
      setMode('otp-verify');
      setSuccess('تم إرسال رمز التحقق إلى هاتفك');
    } catch (err: any) {
      console.error("Phone Auth Error:", err);
      if (err.code === 'auth/invalid-phone-number') {
        setError('رقم الهاتف غير صالح. يرجى التأكد من الرقم وكود الدولة.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('تم إرسال الكثير من الطلبات لهذا الرقم. يرجى المحاولة لاحقاً.');
      } else {
        setError('فشل إرسال رمز التحقق. يرجى المحاولة مرة أخرى.');
      }
      // Reset reCAPTCHA on error
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    
    if (!otp || otp.length < 6) {
      setError('يرجى إدخال رمز التحقق المكون من 6 أرقام');
      return;
    }

    setLoading(true);
    try {
      if (confirmationResult) {
        await confirmationResult.confirm(otp);
        setSuccess('تم تسجيل الدخول بنجاح!');
      }
    } catch (err: any) {
      console.error("OTP Error:", err);
      setError('رمز التحقق غير صحيح. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    
    // Basic Validation
    if (!validateEmail(email)) {
      setError('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }

    if (mode === 'signup') {
      if (name.trim().length < 3) {
        setError('الاسم يجب أن يكون 3 أحرف على الأقل');
        return;
      }
      if (password.length < 6) {
        setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        return;
      }
      if (password !== confirmPassword) {
        setError('كلمات المرور غير متطابقة');
        return;
      }
    } else if (mode === 'login' || mode === 'forgot-password') {
      if (mode === 'login' && !password) {
        setError('يرجى إدخال كلمة المرور');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (name) {
          try {
            await updateProfile(userCredential.user, { displayName: name });
          } catch (updateErr) {
            console.error("Profile update failed:", updateErr);
          }
        }
        setSuccess('تم إنشاء الحساب بنجاح! جاري توجيهك...');
      } else if (mode === 'forgot-password') {
        await sendPasswordResetEmail(auth, email);
        setSuccess('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد (والبريد العشوائي).');
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      const code = err.code;
      
      switch (code) {
        case 'auth/invalid-credential':
          setError('خطأ في البريد الإلكتروني أو كلمة المرور. يرجى التأكد من البيانات والمحاولة مرة أخرى.');
          break;
        case 'auth/user-not-found':
          setError('هذا الحساب غير موجود. يرجى إنشاء حساب جديد.');
          break;
        case 'auth/wrong-password':
          setError('كلمة المرور غير صحيحة.');
          break;
        case 'auth/email-already-in-use':
          setError('هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول.');
          break;
        case 'auth/weak-password':
          setError('كلمة المرور ضعيفة جداً. يجب أن تكون 6 أحرف على الأقل.');
          break;
        case 'auth/invalid-email':
          setError('البريد الإلكتروني غير صالح.');
          break;
        case 'auth/network-request-failed':
          setError('فشل الاتصال بالإنترنت. يرجى التحقق من اتصالك.');
          break;
        case 'auth/too-many-requests':
          setError('تم حظر المحاولات مؤقتاً بسبب كثرة الطلبات. يرجى المحاولة لاحقاً.');
          break;
        case 'auth/operation-not-allowed':
          setError('طريقة تسجيل الدخول هذه غير مفعلة في إعدادات Firebase.');
          break;
        case 'auth/unauthorized-domain':
          setError('هذا النطاق غير مصرح له. يرجى إضافة النطاق في Firebase Console.');
          break;
        case 'auth/api-key-not-valid':
          setError('مفتاح الـ API غير صالح أو مقيد. يرجى مراجعة إعدادات المشروع.');
          break;
        default:
          setError(err.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google') => {
    resetMessages();
    setLoading(true);
    try {
      const authProvider = googleProvider;
      await signInWithPopup(auth, authProvider);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('تم إغلاق نافذة تسجيل الدخول قبل اكتمال العملية. يرجى المحاولة مرة أخرى.');
      } else {
        setError(err.message || 'فشل تسجيل الدخول الاجتماعي');
      }
    } finally {
      setLoading(false);
    }
  };

  const isGmail = email.toLowerCase().endsWith('@gmail.com');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div id="recaptcha-container"></div>
      
      {/* Background Accents */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-50 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-50 rounded-full blur-3xl opacity-50" />

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md z-10"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-100 mx-auto mb-6">
            <span className="text-white text-3xl font-black tracking-tighter">H</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">
            {mode === 'login' ? 'مرحباً بك مجدداً' : 
             mode === 'signup' ? 'إنشاء حساب جديد' : 
             mode === 'forgot-password' ? 'نسيت كلمة المرور؟' : 
             mode === 'phone-login' ? 'الدخول بالهاتف' :
             'تأكيد الرمز'}
          </h1>
          <p className="text-gray-500 font-bold text-sm">
            {mode === 'login' ? 'سجل دخولك للوصول إلى عالم Hagat' : 
             mode === 'signup' ? 'انضم إلينا اليوم وابدأ تجربة فريدة' : 
             mode === 'forgot-password' ? 'أدخل بريدك الإلكتروني لاستعادة حسابك' : 
             mode === 'phone-login' ? 'أدخل رقم هاتفك لتلقي رمز التحقق' :
             'أدخل الرمز المرسل إلى هاتفك'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 p-8">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold"
              >
                <AlertCircle size={18} />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 text-sm font-bold"
              >
                <CheckCircle2 size={18} />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Auth Form */}
          <AnimatePresence mode="wait">
            {mode === 'otp-verify' ? (
              <motion.form 
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleOtpVerify} 
                className="space-y-5"
              >
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 mr-1 uppercase tracking-widest">رمز التحقق</label>
                  <div className="relative">
                    <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pr-12 pl-4 text-sm font-bold focus:ring-2 focus:ring-red-100 transition-all text-center tracking-[1em]"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl text-base font-black shadow-xl shadow-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>تأكيد الرمز</span>
                      <CheckCircle2 size={20} />
                    </>
                  )}
                </button>
                
                <button 
                  type="button"
                  onClick={() => setMode('phone-login')}
                  className="w-full text-xs font-black text-gray-400 hover:text-red-600 transition-all"
                >
                  تغيير رقم الهاتف؟
                </button>
              </motion.form>
            ) : mode === 'forgot-password' ? (
              <motion.form 
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleEmailAuth} 
                className="space-y-5"
              >
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 mr-1 uppercase tracking-widest">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="example@mail.com"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pr-12 pl-4 text-sm font-bold focus:ring-2 focus:ring-red-100 transition-all"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-4 rounded-2xl text-base font-black shadow-xl shadow-red-100 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>إرسال رابط الاستعادة</span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>

                <button 
                  type="button"
                  onClick={() => setMode('login')}
                  className="w-full text-xs font-black text-gray-400 hover:text-red-600 transition-all"
                >
                  العودة لتسجيل الدخول
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="main"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <form 
                  onSubmit={mode === 'phone-login' ? handlePhoneSubmit : handleEmailAuth} 
                  className="space-y-5"
                >
                  {mode === 'signup' && (
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 mr-1 uppercase tracking-widest">الاسم الكامل</label>
                      <div className="relative">
                        <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="text" 
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="أدخل اسمك..."
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pr-12 pl-4 text-sm font-bold focus:ring-2 focus:ring-red-100 transition-all"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {mode === 'phone-login' ? (
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 mr-1 uppercase tracking-widest">رقم الهاتف</label>
                      <div className="relative">
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400 border-l border-gray-100 pl-3 ml-3">
                          <Globe size={18} />
                        </div>
                        <input 
                          type="tel" 
                          value={phoneNumber}
                          onChange={e => setPhoneNumber(e.target.value)}
                          placeholder="+20 123 456 7890"
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pr-16 pl-4 text-sm font-bold focus:ring-2 focus:ring-red-100 transition-all"
                          required
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 mr-1 uppercase tracking-widest">البريد الإلكتروني</label>
                        <div className="relative">
                          <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input 
                            type="email" 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="example@mail.com"
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pr-12 pl-4 text-sm font-bold focus:ring-2 focus:ring-red-100 transition-all"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center mr-1">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">كلمة المرور</label>
                          {mode === 'login' && (
                            <button 
                              type="button"
                              onClick={() => setMode('forgot-password')}
                              className="text-[10px] font-black text-red-600 hover:underline"
                            >
                              نسيت كلمة المرور؟
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input 
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pr-12 pl-12 text-sm font-bold focus:ring-2 focus:ring-red-100 transition-all"
                            required
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      {mode === 'signup' && (
                        <div className="space-y-2">
                          <label className="text-xs font-black text-gray-400 mr-1 uppercase tracking-widest">تأكيد كلمة المرور</label>
                          <div className="relative">
                            <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                              type={showPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={e => setConfirmPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pr-12 pl-4 text-sm font-bold focus:ring-2 focus:ring-red-100 transition-all"
                              required
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-600 text-white py-4 rounded-2xl text-base font-black shadow-xl shadow-red-100 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>
                          {mode === 'login' ? 'تسجيل الدخول' : 
                           mode === 'signup' ? 'إنشاء حساب' : 
                           'إرسال رمز التحقق'}
                        </span>
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="my-8 flex items-center gap-4">
                  <div className="flex-1 h-[1px] bg-gray-100" />
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">أو عبر</span>
                  <div className="flex-1 h-[1px] bg-gray-100" />
                </div>

                {/* Social & Alternative Auth */}
                <div className="space-y-3">
                  <button 
                    onClick={() => handleSocialAuth('google')}
                    className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all group"
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.94 0 3.51.68 4.75 1.81l3.51-3.51C18.1 1.26 15.3 0 12 0 7.46 0 3.69 2.57 1.81 6.33l3.98 3.09C6.71 6.84 9.14 5.04 12 5.04z" />
                      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.76 2.91c2.2-2.03 3.66-5.02 3.66-8.73z" />
                      <path fill="#34A853" d="M5.79 15.58c-.23-.69-.36-1.42-.36-2.18s.13-1.49.36-2.18l-3.98-3.09C1.04 9.69 0 11.74 0 13.4c0 1.66 1.04 3.71 1.81 5.27l3.98-3.09z" />
                      <path fill="#FBBC05" d="M12 24c3.24 0 5.97-1.07 7.96-2.91l-3.76-2.91c-1.1.74-2.5 1.18-4.2 1.18-2.86 0-5.29-1.8-6.21-4.31l-3.98 3.09C3.69 21.43 7.46 24 12 24z" />
                    </svg>
                    <span className="text-sm font-black text-gray-700">Google</span>
                  </button>

                  {mode === 'phone-login' ? (
                    <button 
                      onClick={() => setMode('login')}
                      className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all group"
                    >
                      <Mail size={20} className="text-gray-400 group-hover:text-red-600 transition-colors" />
                      <span className="text-sm font-black text-gray-700">البريد الإلكتروني</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => setMode('phone-login')}
                      className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all group"
                    >
                      <Smartphone size={20} className="text-gray-400 group-hover:text-red-600 transition-colors" />
                      <span className="text-sm font-black text-gray-700">رقم الهاتف</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <button 
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-sm font-bold text-gray-500"
          >
            {mode === 'login' ? 'ليس لديك حساب؟ ' : 'لديك حساب بالفعل؟ '}
            <span className="text-red-600 font-black hover:underline">
              {mode === 'login' ? 'سجل الآن' : 'سجل دخولك'}
            </span>
          </button>
        </div>
      </motion.div>

      {/* Back Button for sub-modes */}
      {(mode === 'forgot-password' || mode === 'phone-login' || mode === 'otp-verify') && (
        <button 
          onClick={() => setMode('login')}
          className="absolute top-10 right-10 p-3 bg-white rounded-2xl shadow-lg shadow-gray-100 text-gray-400 hover:text-red-600 transition-all"
        >
          <ChevronLeft size={24} />
        </button>
      )}
    </div>
  );
}
