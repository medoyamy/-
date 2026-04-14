import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Clock, 
  Building2,
  User,
  Briefcase,
  DollarSign,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePosts, Post } from '../context/PostContext';
import { useUser } from '../context/UserContext';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export default function CreateJobModal({ isOpen, onClose, initialData }: CreateJobModalProps) {
  const { addPost, updatePost } = usePosts();
  const { userName } = useUser();

  const [jobType, setJobType] = useState<'offer' | 'request'>(initialData?.jobType || 'offer');
  const [category, setCategory] = useState(initialData?.category || 'هندسة');
  const [content, setContent] = useState(initialData?.content || '');
  const [jobTitle, setJobTitle] = useState(initialData?.jobTitle || '');
  const [companyName, setCompanyName] = useState(initialData?.companyName || '');
  const [companyType, setCompanyType] = useState(initialData?.companyType || '');
  const [companyAddress, setCompanyAddress] = useState(initialData?.companyAddress || '');
  const [requiredQualifications, setRequiredQualifications] = useState(initialData?.requiredQualifications || '');
  const [requiredTasks, setRequiredTasks] = useState(initialData?.requiredTasks || '');
  const [shift, setShift] = useState(initialData?.shift || '8 ساعات');
  const [ageRange, setAgeRange] = useState(initialData?.ageRange || '');
  const [experience, setExperience] = useState(initialData?.experience || '');
  const [salaryRange, setSalaryRange] = useState(initialData?.salaryRange || '');
  
  const [applicantProfession, setApplicantProfession] = useState(initialData?.applicantProfession || '');
  const [desiredLocation, setDesiredLocation] = useState(initialData?.desiredLocation || '');
  const [applicantFeatures, setApplicantFeatures] = useState(initialData?.applicantFeatures || '');
  const [applicantTasks, setApplicantTasks] = useState(initialData?.applicantTasks || '');
  const [applicantAge, setApplicantAge] = useState(initialData?.applicantAge || '');
  const [contactMethod, setContactMethod] = useState<'call' | 'message' | 'both'>(initialData?.contactMethod || 'both');

  const categories = ['هندسة', 'طب وصيدلة', 'تعليم وتدريس', 'برمجة وتقنية', 'حرف ومهن', 'سائقين وتوصيل', 'مبيعات', 'تسويق وإعلام'];

  const handleSubmit = async () => {
    if (!content || (jobType === 'offer' && !jobTitle) || (jobType === 'request' && !applicantProfession)) {
      alert('يرجى ملء البيانات الأساسية');
      return;
    }

    const postData: Omit<Post, 'id' | 'authorId' | 'status' | 'createdAt'> = {
      author: userName,
      content,
      category,
      source: 'jobs',
      type: (jobType === 'offer' ? 'offer' : 'request') as 'offer' | 'request',
      jobType,
      jobTitle: jobType === 'offer' ? jobTitle : undefined,
      companyName: jobType === 'offer' ? companyName : undefined,
      companyType: jobType === 'offer' ? companyType : undefined,
      companyAddress: jobType === 'offer' ? companyAddress : undefined,
      requiredQualifications: jobType === 'offer' ? requiredQualifications : undefined,
      requiredTasks: jobType === 'offer' ? requiredTasks : undefined,
      shift,
      ageRange: jobType === 'offer' ? ageRange : undefined,
      experience,
      salaryRange,
      applicantProfession: jobType === 'request' ? applicantProfession : undefined,
      desiredLocation: jobType === 'request' ? desiredLocation : undefined,
      applicantFeatures: jobType === 'request' ? applicantFeatures : undefined,
      applicantTasks: jobType === 'request' ? applicantTasks : undefined,
      applicantAge: jobType === 'request' ? applicantAge : undefined,
      contactMethod,
      boosts: [],
    };

    try {
      if (initialData?.id) {
        await updatePost(initialData.id, postData);
      } else {
        await addPost(postData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving job:', error);
      alert('حدث خطأ أثناء الحفظ');
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
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-600 text-white rounded-xl">
                <Briefcase size={20} />
              </div>
              <h2 className="text-xl font-black text-gray-900">
                {jobType === 'offer' ? 'إضافة فرصة عمل' : 'إضافة طلب وظيفة'}
              </h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar text-right" dir="rtl">
            {/* Job Type Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-2xl">
              <button
                onClick={() => setJobType('offer')}
                className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${
                  jobType === 'offer' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'
                }`}
              >
                عرض وظيفة
              </button>
              <button
                onClick={() => setJobType('request')}
                className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${
                  jobType === 'request' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'
                }`}
              >
                طلب وظيفة
              </button>
            </div>

            {/* Category Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">القسم / التخصص</label>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {categories.map((cat, i) => (
                  <button
                    key={`${cat}-${i}`}
                    onClick={() => setCategory(cat)}
                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      category === cat 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Fields */}
            <div className="space-y-4">
              {jobType === 'offer' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase block">المسمى الوظيفي</label>
                    <input 
                      type="text" 
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="مثلاً: مهندس مدني، محاسب..."
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-red-100 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase block">اسم الشركة</label>
                      <input 
                        type="text" 
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm font-bold outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase block">نوع النشاط</label>
                      <input 
                        type="text" 
                        value={companyType}
                        onChange={(e) => setCompanyType(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm font-bold outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase block">عنوان الشركة</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pr-12 pl-4 text-sm font-bold outline-none"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase block">مهنة المتقدم</label>
                    <input 
                      type="text" 
                      value={applicantProfession}
                      onChange={(e) => setApplicantProfession(e.target.value)}
                      placeholder="مثلاً: سائق درجة أولى، فني تكييف..."
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase block">مكان العمل المفضل</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        value={desiredLocation}
                        onChange={(e) => setDesiredLocation(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pr-12 pl-4 text-sm font-bold outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase block">تفاصيل إضافية</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="اكتب تفاصيل أكثر عن الوظيفة أو مهاراتك..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-medium min-h-[100px] outline-none focus:ring-2 focus:ring-red-100 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase block">الخبرة</label>
                  <input 
                    type="text" 
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="مثلاً: 3 سنوات"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm font-bold outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase block">المرتب المتوقع</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      value={salaryRange}
                      onChange={(e) => setSalaryRange(e.target.value)}
                      placeholder="مثلاً: 5000 - 7000"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pr-12 pl-4 text-sm font-bold outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase block">الشيفت</label>
                <div className="grid grid-cols-4 gap-2">
                  {['6 ساعات', '8 ساعات', '10 ساعات', '12 ساعة'].map(s => (
                    <button
                      key={s}
                      onClick={() => setShift(s)}
                      className={`py-2 rounded-xl text-[10px] font-black transition-all ${
                        shift === s ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Method */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase block tracking-widest">طريقة التواصل</label>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => setContactMethod('call')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${
                      contactMethod === 'call' ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-100 text-gray-400'
                    }`}
                  >
                    <Phone size={16} />
                    <span className="text-xs font-bold">اتصال</span>
                  </button>
                  <button 
                    onClick={() => setContactMethod('message')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${
                      contactMethod === 'message' ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-100 text-gray-400'
                    }`}
                  >
                    <MessageCircle size={16} />
                    <span className="text-xs font-bold">رسالة</span>
                  </button>
                  <button 
                    onClick={() => setContactMethod('both')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${
                      contactMethod === 'both' ? 'border-red-600 bg-red-50 text-red-600' : 'border-gray-100 text-gray-400'
                    }`}
                  >
                    <CheckCircle2 size={16} />
                    <span className="text-xs font-bold">الكل</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 bg-white">
            <button
              onClick={handleSubmit}
              className="w-full py-4 bg-red-600 text-white rounded-2xl font-black shadow-xl shadow-red-100 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={20} />
              <span>{initialData?.id ? 'حفظ التعديلات' : 'نشر الآن'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
