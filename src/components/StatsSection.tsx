import React, { useEffect, useState, useMemo } from 'react';
import { 
  FiUsers, 
  FiCalendar, 
  FiTrendingUp,
  FiCheckCircle,
  FiXCircle,
  FiClock
} from 'react-icons/fi';
import { 
  HiOutlineCalendarDays, 
  HiOutlineSquares2X2 
} from 'react-icons/hi2';
import type { Booking } from '../types/booking';
import { ClashZone_CATEGORIES } from '../types/booking';
import { getCategoryIcon } from '../utils/translations';
import { getTodayRiyadhStr } from '../utils/bookingFormatters';

const arabicNumberFormatter = new Intl.NumberFormat('ar-EG');

interface StatsSectionProps {
  bookings: Booking[];
}

const CountUp: React.FC<{ value: number; duration?: number }> = ({ value, duration = 0.6 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      const timer = setTimeout(() => {
        setCount(end);
      }, 0);
      return () => clearTimeout(timer);
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

  return <>{arabicNumberFormatter.format(count)}</>;
};

export const StatsSection = React.memo<StatsSectionProps>(({ bookings }) => {
  const todayStr = useMemo(() => getTodayRiyadhStr(), []);

  const stats = useMemo(() => {
    const total = bookings.length;

    const isCancelled = (status: string) => 
      status === 'cancelled' || status === 'ملغي';

    const pending = bookings.filter(b => b.status === 'pending' || b.status === ('جديد' as unknown)).length;
    const confirmed = bookings.filter(b => b.status === 'confirmed' || b.status === ('تم التأكيد' as unknown)).length;
    const completed = bookings.filter(b => b.status === 'completed' || b.status === ('مكتمل' as unknown)).length;
    const cancelled = bookings.filter(b => isCancelled(b.status)).length;

    const todayCount = bookings.filter(b => b.booking_date === todayStr && !isCancelled(b.status)).length;
    const upcomingCount = bookings.filter(b => b.booking_date > todayStr && !isCancelled(b.status)).length;

    // Total participants (strictly excluding cancelled)
    const totalParticipants = bookings.reduce((acc, b) => {
      if (isCancelled(b.status)) return acc;
      return acc + (Number(b.number_of_people) || 1);
    }, 0);

    // Categories breakdown for the 7 CLASH ZONE categories
    const categoryCounts: Record<string, number> = {};
    ClashZone_CATEGORIES.forEach(cat => {
      categoryCounts[cat] = 0;
    });

    bookings.forEach(b => {
      const cat = b.category || 'عميل جديد';
      if (categoryCounts[cat] !== undefined) {
        categoryCounts[cat] += 1;
      } else {
        categoryCounts['عميل جديد'] = (categoryCounts['عميل جديد'] || 0) + 1;
      }
    });

    let topCategory = 'لا يوجد بعد';
    let maxCatCount = 0;
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      if (count > maxCatCount) {
        maxCatCount = count;
        topCategory = cat;
      }
    });

    const topCategoryPct = total > 0 ? Math.round((maxCatCount / total) * 100) : 0;
    const activeConfirmed = confirmed + completed;
    const confirmationRate = total > 0 ? Math.round((activeConfirmed / total) * 100) : 0;

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      todayCount,
      upcomingCount,
      totalParticipants,
      categoryCounts,
      topCategory: total > 0 ? topCategory : 'لا يوجد بعد',
      topCategoryPct,
      confirmationRate
    };
  }, [bookings, todayStr]);

  const keyStats = useMemo(() => [
    { title: "إجمالي الحجوزات", value: stats.total, icon: <FiCalendar className="w-4 h-4 text-red-600" />, bg: 'bg-red-50 border-red-100' },
    { title: "إجمالي المشاركين", value: stats.totalParticipants, icon: <FiUsers className="w-4 h-4 text-blue-600" />, bg: 'bg-blue-50 border-blue-100' },
    { title: "حجوزات اليوم", value: stats.todayCount, icon: <HiOutlineCalendarDays className="w-4 h-4 text-amber-600" />, bg: 'bg-amber-50 border-amber-100' },
    { title: "الحجوزات القادمة", value: stats.upcomingCount, icon: <FiClock className="w-4 h-4 text-purple-600" />, bg: 'bg-purple-50 border-purple-100' },
    { title: "الحجوزات المكتملة", value: stats.completed, icon: <FiCheckCircle className="w-4 h-4 text-emerald-600" />, bg: 'bg-emerald-50 border-emerald-100' },
    { title: "الحجوزات الملغية", value: stats.cancelled, icon: <FiXCircle className="w-4 h-4 text-rose-600" />, bg: 'bg-rose-50 border-rose-100' },
  ], [stats]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Upper Grid: 6 Core Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {keyStats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex flex-col justify-between min-h-[110px] transition-all hover:border-slate-300 hover:shadow"
          >
            <div className="flex justify-between items-center">
              <span className="text-[12px] font-bold text-slate-500">{stat.title}</span>
              <div className={`p-2 rounded-lg border ${stat.bg}`}>
                {stat.icon}
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900">
                <CountUp value={stat.value} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lower Grid: Status Distribution & Category Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Status Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm lg:col-span-6 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <HiOutlineSquares2X2 className="w-4 h-4 text-slate-500" />
              <span>توزيع الحجوزات حسب حالة المعالجة</span>
            </h4>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-lg">
              إجمالي الحالات: {stats.total}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            {/* جديد */}
            <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex flex-col gap-0.5">
              <span className="text-[11px] font-bold text-blue-700">جديد</span>
              <span className="text-lg font-black text-blue-900">{stats.pending}</span>
            </div>
            {/* تم التأكيد */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex flex-col gap-0.5">
              <span className="text-[11px] font-bold text-amber-800">تم التأكيد</span>
              <span className="text-lg font-black text-amber-950">{stats.confirmed}</span>
            </div>
            {/* مكتمل */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex flex-col gap-0.5">
              <span className="text-[11px] font-bold text-emerald-700">مكتمل</span>
              <span className="text-lg font-black text-emerald-950">{stats.completed}</span>
            </div>
            {/* ملغي */}
            <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl flex flex-col gap-0.5">
              <span className="text-[11px] font-bold text-rose-700">ملغي</span>
              <span className="text-lg font-black text-rose-950">{stats.cancelled}</span>
            </div>
          </div>

          {/* Confirmation rate progress */}
          <div className="flex flex-col gap-1.5 mt-1 border-t border-slate-100 pt-3">
            <div className="flex justify-between text-[11px] font-bold text-slate-600">
              <span>نسبة تأكيد وتنفيذ الحجوزات</span>
              <span className="text-emerald-600 font-extrabold">{stats.confirmationRate}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${stats.confirmationRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* CLASH ZONE Categories Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm lg:col-span-6 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FiTrendingUp className="w-4 h-4 text-slate-500" />
              <span>إحصائيات فئات الحجوزات (CLASH ZONE)</span>
            </h4>
            <span className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-lg">
              الأعلى: {stats.topCategory} {stats.total > 0 ? `(${stats.topCategoryPct}%)` : ''}
            </span>
          </div>

          {/* 7 CLASH ZONE Categories List */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ClashZone_CATEGORIES.map(cat => {
              const count = stats.categoryCounts[cat] || 0;
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div 
                  key={cat}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 rounded-xl flex flex-col gap-0.5 transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-600 font-bold">
                    <span className="truncate">{getCategoryIcon(cat)} {cat}</span>
                    <span className="text-slate-400 font-semibold">{pct}%</span>
                  </div>
                  <span className="text-base font-black text-slate-800 mt-0.5">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
});

export default StatsSection;
