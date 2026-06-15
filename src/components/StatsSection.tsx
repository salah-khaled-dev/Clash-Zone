import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, 
  FiUserPlus, 
  FiUserCheck, 
  FiAward, 
  FiCalendar, 
  FiTrendingUp 
} from 'react-icons/fi';
import { 
  HiOutlineCalendarDays, 
  HiOutlineSquares2X2 
} from 'react-icons/hi2';
import type { Booking } from '../types/booking';


interface StatsSectionProps {
  bookings: Booking[];
}

const CountUp: React.FC<{ value: number; duration?: number }> = ({ value, duration = 0.8 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }
    const totalMiliseconds = duration * 1000;
    const incrementTime = Math.max(Math.floor(totalMiliseconds / (end || 1)), 25);
    
    const timer = setInterval(() => {
      start += Math.ceil(end / (totalMiliseconds / incrementTime));
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <>{new Intl.NumberFormat('ar-EG').format(count)}</>;
};

export const StatsSection: React.FC<StatsSectionProps> = ({ bookings }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Appointment Counts
  const total = bookings.length;
  const newBookings = bookings.filter(b => b.status === 'جديد').length;
  const confirmed = bookings.filter(b => b.status === 'تم التأكيد').length;
  const completed = bookings.filter(b => b.status === 'مكتمل').length;
  const cancelled = bookings.filter(b => b.status === 'ملغي').length;
  const todayCount = bookings.filter(b => b.booking_date === todayStr).length;
  const upcomingCount = bookings.filter(b => b.booking_date > todayStr && b.status !== 'ملغي').length;

  // 2. Customer Type counts
  const clientNew = bookings.filter(b => b.customer_type === 'new').length;
  const clientReturning = bookings.filter(b => b.customer_type === 'returning').length;
  const clientVip = bookings.filter(b => b.customer_type === 'vip').length;

  // 3. Marketing Source calculation
  const sourcesMap = bookings.reduce((acc, b) => {
    const s = b.customer_source || 'أخرى';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Find top marketing source
  let topSource = 'لا يوجد';
  let maxSourceCount = 0;
  Object.entries(sourcesMap).forEach(([source, count]) => {
    if (count > maxSourceCount) {
      maxSourceCount = count;
      topSource = source;
    }
  });

  // Top source counts
  const topSourcePct = total > 0 ? Math.round((maxSourceCount / total) * 100) : 0;

  // Total conversion rate
  const successBookings = completed + confirmed;
  const conversionRate = total > 0 ? Math.round((successBookings / total) * 100) : 0;

  const keyStats = [
    { title: "إجمالي العملاء", value: total, icon: <FiUsers className="w-5 h-5 text-gray-800" />, color: '#F4C542' },
    { title: "عملاء جدد", value: clientNew, icon: <FiUserPlus className="w-5 h-5 text-blue-600" />, color: '#3B82F6' },
    { title: "عملاء سابقون", value: clientReturning, icon: <FiUserCheck className="w-5 h-5 text-purple-600" />, color: '#A855F7' },
    { title: "عملاء VIP", value: clientVip, icon: <FiAward className="w-5 h-5 text-rose-600" />, color: '#F43F5E' },
  ];

  const scheduleStats = [
    { title: "حجوزات اليوم", value: todayCount, icon: <HiOutlineCalendarDays className="w-4.5 h-4.5" />, color: '#D4A017' },
    { title: "الحجوزات القادمة", value: upcomingCount, icon: <FiCalendar className="w-4.5 h-4.5" />, color: '#D4A017' },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Upper Grid: Customer Types & Appointments */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Customer Types */}
        {keyStats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="premium-card p-4 flex flex-col justify-between min-h-[120px] relative overflow-hidden"
          >
            <div className="flex justify-between items-start z-10">
              <span className="text-[11px] font-bold text-gray-500">{stat.title}</span>
              <div 
                className="p-2 rounded-xl"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                {stat.icon}
              </div>
            </div>
            <div className="mt-2 z-10 flex items-baseline justify-between">
              <span className="text-2xl font-black text-gray-900">
                <CountUp value={stat.value} />
              </span>
            </div>
            <div 
              className="absolute -bottom-4 -right-4 w-12 h-12 rounded-full blur-xl opacity-10"
              style={{ backgroundColor: stat.color }}
            />
          </motion.div>
        ))}

        {/* Schedule statistics */}
        {scheduleStats.map((stat, idx) => (
          <motion.div
            key={idx + 4}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: (idx + 4) * 0.05 }}
            className="premium-card p-4 flex flex-col justify-between min-h-[120px] border-[#F4C542]/30 bg-[#F4C542]/3 relative overflow-hidden"
          >
            <div className="flex justify-between items-start z-10">
              <span className="text-[11px] font-bold text-gray-700">{stat.title}</span>
              <div className="p-2 rounded-xl bg-[#F4C542]/15 text-[#D4A017]">
                {stat.icon}
              </div>
            </div>
            <div className="mt-2 z-10">
              <span className="text-2xl font-black text-amber-950">
                <CountUp value={stat.value} />
              </span>
            </div>
            <div className="absolute -bottom-4 -right-4 w-12 h-12 rounded-full blur-xl opacity-15 bg-[#F4C542]" />
          </motion.div>
        ))}
      </div>

      {/* Lower Grid: Marketing Source & Appointment Conversion Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Booking Status Progress */}
        <div className="premium-card p-5 md:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
            <h4 className="text-xs font-black text-gray-900 flex items-center gap-1.5">
              <HiOutlineSquares2X2 className="w-4 h-4 text-[#D4A017]" />
              <span>توزيع المواعيد حسب حالة المتابعة</span>
            </h4>
            <span className="text-[10px] font-bold text-gray-400">إجمالي الحالات: {total}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            {/* جديد */}
            <div className="p-3 bg-blue-50/50 border border-blue-100/50 rounded-2xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-blue-500">جديد</span>
              <span className="text-lg font-black text-blue-900">{newBookings}</span>
            </div>
            {/* تم التواصل */}
            <div className="p-3 bg-purple-50/50 border border-purple-100/50 rounded-2xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-purple-500">تم التواصل</span>
              <span className="text-lg font-black text-purple-900">{bookings.filter(b => b.status === 'تم التواصل').length}</span>
            </div>
            {/* تم التأكيد */}
            <div className="p-3 bg-amber-50/50 border border-amber-100/50 rounded-2xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-amber-600">تم التأكيد</span>
              <span className="text-lg font-black text-amber-950">{confirmed}</span>
            </div>
            {/* مكتمل */}
            <div className="p-3 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-emerald-600">مكتمل</span>
              <span className="text-lg font-black text-emerald-900">{completed}</span>
            </div>
            {/* ملغي */}
            <div className="p-3 bg-rose-50/50 border border-rose-100/50 rounded-2xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-rose-500">ملغي</span>
              <span className="text-lg font-black text-rose-900">{cancelled}</span>
            </div>
          </div>
        </div>

        {/* Marketing Channel Conversions */}
        <div className="premium-card p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
            <h4 className="text-xs font-black text-gray-900 flex items-center gap-1.5">
              <FiTrendingUp className="w-4 h-4 text-[#D4A017]" />
              <span>تحليل القنوات التسويقية</span>
            </h4>
          </div>

          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold leading-none">القناة الأعلى استقطاباً</span>
                <span className="text-xs font-black text-gray-800 mt-1">{topSource}</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-[#D4A017]">{topSourcePct}%</span>
                <span className="text-[9px] text-gray-400 font-bold block">من الحجوزات</span>
              </div>
            </div>

            {/* Custom conversion bar */}
            <div className="flex flex-col gap-1.5 mt-1">
              <div className="flex justify-between text-[10px] font-bold text-gray-500">
                <span>معدل تحويل الحجوزات المؤكدة</span>
                <span className="text-emerald-600">{conversionRate}%</span>
              </div>
              <div className="w-full h-2 bg-neutral-150 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-[#F4C542] to-emerald-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${conversionRate}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
