import React from 'react';
import { FiCalendar } from 'react-icons/fi';

export const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 text-slate-400 border border-slate-200">
        <FiCalendar className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-1">لا توجد حجوزات حالياً</h3>
      <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
        لم يتم العثور على أي حجوزات مطابقة لمعايير البحث أو الفلاتر المحددة.
      </p>
    </div>
  );
};

export default React.memo(EmptyState);
