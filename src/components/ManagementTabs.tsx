import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Edit2,
  Trash2,
  Ticket,
  Tag,
  Gift,
  Zap,
  Star,
  Users,
  BarChart3,
  History
} from 'lucide-react';
import { motion } from 'motion/react';

export function AdminSubscriptionsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-gray-900">إدارة الاشتراكات</h3>
          <p className="text-[10px] font-bold text-gray-400">متابعة وتعديل خطط الاشتراكات النشطة</p>
        </div>
        <button className="bg-red-600 text-white px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg shadow-red-100 active:scale-95 transition-all">
          <Plus size={16} />
          إضافة خطة جديدة
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'اشتراكات نشطة', value: '1,240', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'اشتراكات منتهية', value: '156', color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'إجمالي الأرباح', value: '45,000 ج.م', color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((stat, idx) => (
          <div key={idx} className={`${stat.bg} p-4 rounded-[28px] border border-white/50 shadow-sm`}>
            <p className="text-[9px] font-bold text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-sm font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm">
        <h4 className="text-sm font-black text-gray-800 mb-4">خطط الاشتراك الحالية</h4>
        <div className="space-y-3">
          {[
            { name: 'الخطة البرونزية', price: 50, duration: 'شهر', users: 450, color: 'bg-orange-500' },
            { name: 'الخطة الفضية', price: 120, duration: '3 شهور', users: 320, color: 'bg-slate-400' },
            { name: 'الخطة الذهبية', price: 400, duration: 'سنة', users: 180, color: 'bg-amber-500' },
          ].map((plan, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group hover:bg-gray-100 transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${plan.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                  <Star size={24} />
                </div>
                <div>
                  <h5 className="text-xs font-black text-gray-900">{plan.name}</h5>
                  <p className="text-[10px] font-bold text-gray-400">{plan.price} ج.م / {plan.duration} • {plan.users} مشترك</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-white text-gray-400 rounded-xl border border-gray-100 hover:text-blue-600 transition-colors">
                  <Edit2 size={14} />
                </button>
                <button className="p-2 bg-white text-gray-400 rounded-xl border border-gray-100 hover:text-red-600 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminCouponsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-gray-900">إدارة الكوبونات</h3>
          <p className="text-[10px] font-bold text-gray-400">إنشاء وتتبع أكواد الخصم</p>
        </div>
        <button className="bg-red-600 text-white px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg shadow-red-100 active:scale-95 transition-all">
          <Plus size={16} />
          إنشاء كوبون جديد
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {[
          { code: 'SAVE20', discount: '20%', type: 'نسبة مئوية', usage: '145/200', expiry: '2024-05-15', status: 'نشط' },
          { code: 'FREE100', discount: '100 ج.م', type: 'مبلغ ثابت', usage: '89/100', expiry: '2024-04-30', status: 'نشط' },
          { code: 'RAMADAN', discount: '15%', type: 'نسبة مئوية', usage: '450/500', expiry: '2024-04-10', status: 'منتهي' },
        ].map((coupon, idx) => (
          <div key={idx} className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                <Ticket size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="text-sm font-black text-gray-900">{coupon.code}</h5>
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${coupon.status === 'نشط' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {coupon.status}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-gray-400">خصم {coupon.discount} • {coupon.type} • ينتهي في {coupon.expiry}</p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-gray-900">الاستخدام</p>
              <p className="text-[12px] font-black text-red-600">{coupon.usage}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminPointsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-gray-900">إدارة النقاط</h3>
          <p className="text-[10px] font-bold text-gray-400">التحكم في نظام الولاء والمكافآت</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2.5 rounded-2xl text-xs font-black shadow-lg shadow-amber-100 active:scale-95 transition-all">
            <Plus size={16} />
            <span>إضافة نقاط لعميل</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-3xl border border-gray-100">
          <p className="text-[9px] font-bold text-gray-400">إجمالي النقاط الموزعة</p>
          <p className="text-sm font-black text-amber-600">1,250,000 نقطة</p>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-gray-100">
          <p className="text-[9px] font-bold text-gray-400">النقاط المستبدلة</p>
          <p className="text-sm font-black text-gray-800">450,000 نقطة</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-[32px] border border-gray-100">
        <h4 className="text-sm font-black text-gray-800 mb-4">إعدادات نظام النقاط</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
            <span className="text-xs font-bold text-gray-700">قيمة النقطة (ج.م)</span>
            <input type="text" defaultValue="0.01" className="w-16 bg-white border border-gray-200 rounded-lg py-1 text-center text-[10px] font-black" />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
            <span className="text-xs font-bold text-gray-700">نقاط التسجيل الجديد</span>
            <input type="text" defaultValue="100" className="w-16 bg-white border border-gray-200 rounded-lg py-1 text-center text-[10px] font-black" />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
            <span className="text-xs font-bold text-gray-700">نقاط لكل 100 ج.م شراء</span>
            <input type="text" defaultValue="10" className="w-16 bg-white border border-gray-200 rounded-lg py-1 text-center text-[10px] font-black" />
          </div>
          <button className="w-full py-3 bg-red-600 text-white text-xs font-black rounded-2xl shadow-lg shadow-red-100">
            حفظ التغييرات
          </button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-[32px] border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-black text-gray-800">إدارة كروت النقاط</h4>
          <button className="p-2 bg-gray-50 text-red-600 rounded-xl hover:bg-red-50 transition-colors">
            <Plus size={16} />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {[
            { name: 'كارت البرونز', points: 5000, price: 50, color: 'bg-orange-500' },
            { name: 'كارت السيلفر', points: 12000, price: 100, color: 'bg-slate-500' },
            { name: 'كارت الجولد', points: 30000, price: 200, color: 'bg-amber-500' },
            { name: 'كارت البلاتينيوم', points: 80000, price: 500, color: 'bg-indigo-500' },
            { name: 'كارت الماسي', points: 200000, price: 1000, color: 'bg-cyan-500' },
          ].map((card, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-6 ${card.color} rounded-md shadow-sm`}></div>
                <div>
                  <p className="text-xs font-black text-gray-800">{card.name}</p>
                  <p className="text-[9px] font-bold text-gray-400">{card.points.toLocaleString()} نقطة • {card.price} ج.م</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-1.5 bg-white text-gray-400 rounded-lg border border-gray-100 hover:text-blue-600">
                  <Edit2 size={12} />
                </button>
                <button className="p-1.5 bg-white text-gray-400 rounded-lg border border-gray-100 hover:text-red-600">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-5 rounded-[32px] border border-gray-100">
        <h4 className="text-sm font-black text-gray-800 mb-4">هدايا استبدال النقاط</h4>
        <div className="space-y-3">
          {[
            { name: 'كوبون خصم 50 ج.م', points: 5000 },
            { name: 'شحن محفظة 100 ج.م', points: 10000 },
            { name: 'اشتراك بريميوم شهر', points: 15000 },
          ].map((gift, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-2">
                <Gift size={14} className="text-red-600" />
                <span className="text-xs font-black text-gray-700">{gift.name}</span>
              </div>
              <span className="text-[10px] font-black text-amber-600">{gift.points} نقطة</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminAccountingTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-gray-900">النظام المالي</h3>
          <p className="text-[10px] font-bold text-gray-400">إدارة المحافظ والعمليات المالية</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-slate-900 text-white px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg active:scale-95 transition-all">
            <Download size={16} />
            تصدير تقرير
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
            <TrendingUp size={20} />
          </div>
          <p className="text-[10px] font-bold text-gray-400">إجمالي الإيداعات</p>
          <p className="text-lg font-black text-gray-900">125,450 ج.م</p>
          <div className="mt-2 flex items-center gap-1 text-[9px] font-black text-emerald-600">
            <ArrowUpRight size={10} />
            <span>+12% عن الشهر الماضي</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-4">
            <TrendingDown size={20} />
          </div>
          <p className="text-[10px] font-bold text-gray-400">إجمالي السحوبات</p>
          <p className="text-lg font-black text-gray-900">42,180 ج.م</p>
          <div className="mt-2 flex items-center gap-1 text-[9px] font-black text-red-600">
            <ArrowDownRight size={10} />
            <span>-5% عن الشهر الماضي</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-black text-gray-800">آخر العمليات المالية</h4>
          <button className="text-[10px] font-black text-red-600">عرض الكل</button>
        </div>
        <div className="space-y-3">
          {[
            { user: 'أحمد محمد', type: 'إيداع محفظة', amount: '+500', date: 'منذ ساعة', status: 'مكتمل' },
            { user: 'سارة علي', type: 'شراء اشتراك', amount: '-120', date: 'منذ ساعتين', status: 'مكتمل' },
            { user: 'محمود حسن', type: 'سحب أرباح', amount: '-1500', date: 'منذ 5 ساعات', status: 'قيد المراجعة' },
          ].map((op, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${op.amount.startsWith('+') ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                  {op.amount.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                </div>
                <div>
                  <p className="text-xs font-black text-gray-900">{op.user}</p>
                  <p className="text-[9px] font-bold text-gray-400">{op.type} • {op.date}</p>
                </div>
              </div>
              <div className="text-left">
                <p className={`text-xs font-black ${op.amount.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>{op.amount} ج.م</p>
                <p className="text-[8px] font-bold text-gray-400">{op.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminAccountingOverviewTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 text-white p-6 rounded-[32px] shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-bold opacity-60 mb-1">الرصيد الإجمالي</p>
            <h3 className="text-2xl font-black">285,900 ج.م</h3>
            <div className="mt-4 flex gap-2">
              <div className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-black flex items-center gap-1">
                <ArrowUpRight size={10} className="text-emerald-400" />
                <span>+15.5%</span>
              </div>
            </div>
          </div>
          <DollarSign size={80} className="absolute -right-4 -bottom-4 text-white/5 opacity-10 rotate-12" />
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400">مشتركين نشطين</p>
              <h4 className="text-lg font-black text-gray-900">1,450</h4>
            </div>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full w-[75%]" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
              <Ticket size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400">كوبونات مستخدمة</p>
              <h4 className="text-lg font-black text-gray-900">842</h4>
            </div>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full w-[60%]" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-sm font-black text-gray-800">إحصائيات الإيرادات</h4>
          <div className="flex gap-2">
            {['أسبوع', 'شهر', 'سنة'].map(t => (
              <button key={t} className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${t === 'شهر' ? 'bg-red-600 text-white shadow-md' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="h-48 flex items-end justify-between gap-2 px-2">
          {[40, 65, 45, 90, 55, 70, 85, 60, 95, 40, 50, 75].map((h, i) => (
            <div key={i} className="flex-1 bg-gray-50 rounded-t-lg relative group">
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                className={`w-full rounded-t-lg transition-all ${i === 8 ? 'bg-red-600 shadow-lg shadow-red-100' : 'bg-slate-200 group-hover:bg-slate-300'}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
