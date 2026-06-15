import React from 'react';
import { FiCalendar } from 'react-icons/fi';

export const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-[24px] border border-neutral-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
      <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4 text-[#D4A017] border border-amber-100">
        <FiCalendar className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-1">لا توجد حجوزات حالياً</h3>
      <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
        لم يتم العثور على أي حجوزات مطابقة للبحث أو الفلاتر المحددة في لوحة التحكم.
      </p>
    </div>
  );
};

export default React.memo(EmptyState);
