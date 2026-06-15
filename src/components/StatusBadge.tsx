import React from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiMessageSquare, FiCalendar, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { formatStatus } from '../utils/bookingFormatters';

interface StatusBadgeProps {
  status: 'جديد' | 'تم التواصل' | 'تم التأكيد' | 'مكتمل' | 'ملغي';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const arabicStatus = formatStatus(status);

  // Status configurations
  const config = {
    'جديد': {
      bg: 'bg-blue-50 text-blue-700 border-blue-150',
      dot: 'bg-blue-500',
      icon: <FiClock className="w-3.5 h-3.5 text-blue-600" />,
    },
    'تم التواصل': {
      bg: 'bg-purple-50 text-purple-700 border-purple-150',
      dot: 'bg-purple-500',
      icon: <FiMessageSquare className="w-3.5 h-3.5 text-purple-600" />,
    },
    'تم التأكيد': {
      bg: 'bg-amber-50 text-amber-700 border-amber-200/50',
      dot: 'bg-amber-500',
      icon: <FiCalendar className="w-3.5 h-3.5 text-amber-600" />,
    },
    'مكتمل': {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
      dot: 'bg-emerald-500',
      icon: <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600" />,
    },
    'ملغي': {
      bg: 'bg-rose-50 text-rose-700 border-rose-200/50',
      dot: 'bg-rose-500',
      icon: <FiAlertCircle className="w-3.5 h-3.5 text-rose-600" />,
    },
  };

  const currentConfig = config[status] || config['جديد'];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${currentConfig.bg} transition-all duration-300 shadow-sm`}
    >
      <span className={`status-pulse-dot ${currentConfig.dot}`} />
      <span className="flex-shrink-0">{currentConfig.icon}</span>
      <span className="leading-none mt-0.5">{arabicStatus}</span>
    </motion.div>
  );
};

export default React.memo(StatusBadge);
