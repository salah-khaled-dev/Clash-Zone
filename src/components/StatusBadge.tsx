import React from 'react';
import { FiClock, FiCalendar, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { translateStatus } from '../utils/translations';
import type { BookingDbStatus } from '../types/booking';

interface StatusBadgeProps {
  status: BookingDbStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const arabicStatus = translateStatus(status);

  const config: Record<string, { bg: string; dot: string; icon: React.ReactNode }> = {
    pending: {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-500',
      icon: <FiClock className="w-3.5 h-3.5 text-blue-600" />,
    },
    'جديد': {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-500',
      icon: <FiClock className="w-3.5 h-3.5 text-blue-600" />,
    },
    confirmed: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
      icon: <FiCalendar className="w-3.5 h-3.5 text-amber-600" />,
    },
    'تم التأكيد': {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
      icon: <FiCalendar className="w-3.5 h-3.5 text-amber-600" />,
    },
    completed: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      icon: <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600" />,
    },
    'مكتمل': {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      icon: <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600" />,
    },
    cancelled: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
      icon: <FiAlertCircle className="w-3.5 h-3.5 text-rose-600" />,
    },
    'ملغي': {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
      icon: <FiAlertCircle className="w-3.5 h-3.5 text-rose-600" />,
    },
    // Fallback for legacy records
    group_cancelled: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
      icon: <FiAlertCircle className="w-3.5 h-3.5 text-rose-600" />,
    },
    'إلغاء جماعي': {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
      icon: <FiAlertCircle className="w-3.5 h-3.5 text-rose-600" />,
    },
  };

  const currentConfig = config[status] || config['pending'];

  return (
    <div
      className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${currentConfig.bg} shadow-none`}
    >
      <span className={`status-pulse-dot ${currentConfig.dot}`} />
      <span className="flex-shrink-0">{currentConfig.icon}</span>
      <span className="leading-none mt-0.5">{arabicStatus}</span>
    </div>
  );
};

export default React.memo(StatusBadge);
