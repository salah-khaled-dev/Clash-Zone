import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiEllipsisVertical } from 'react-icons/hi2';
import { FiEye, FiCalendar, FiCheck, FiXCircle } from 'react-icons/fi';

interface ActionMenuProps {
  onViewDetails: () => void;
  onEditTime: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  status: 'جديد' | 'تم التواصل' | 'تم التأكيد' | 'مكتمل' | 'ملغي';
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  onViewDetails,
  onEditTime,
  onConfirm,
  onCancel,
  status
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  };

  const handleOptionClick = (callback: () => void) => {
    callback();
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-right" ref={menuRef} onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="خيارات الإجراءات"
        className="p-2.5 text-gray-500 rounded-full hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#F4C542] transition-colors"
      >
        <HiEllipsisVertical className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15 }}
            role="menu"
            aria-orientation="vertical"
            className="absolute left-0 mt-2 w-48 rounded-2xl bg-white border border-neutral-100 shadow-xl z-50 overflow-hidden divide-y divide-neutral-50"
          >
            <div className="py-1.5">
              <button
                type="button"
                onClick={() => handleOptionClick(onViewDetails)}
                className="w-full text-right px-4 py-3 text-sm text-gray-700 hover:bg-neutral-50 flex items-center gap-2.5 transition-colors font-medium outline-none"
                role="menuitem"
              >
                <FiEye className="w-4 h-4 text-gray-400" />
                <span>عرض التفاصيل</span>
              </button>
              
              {status !== 'ملغي' && (
                <button
                  type="button"
                  onClick={() => handleOptionClick(onEditTime)}
                  className="w-full text-right px-4 py-3 text-sm text-gray-700 hover:bg-neutral-50 flex items-center gap-2.5 transition-colors font-medium outline-none"
                  role="menuitem"
                >
                  <FiCalendar className="w-4 h-4 text-gray-400" />
                  <span>تعديل الموعد</span>
                </button>
              )}
            </div>

            <div className="py-1.5">
              {status === 'جديد' && (
                <button
                  type="button"
                  onClick={() => handleOptionClick(onConfirm)}
                  className="w-full text-right px-4 py-3 text-sm text-emerald-600 hover:bg-emerald-50/50 flex items-center gap-2.5 transition-colors font-semibold outline-none"
                  role="menuitem"
                >
                  <FiCheck className="w-4 h-4 text-emerald-500" />
                  <span>تأكيد الحجز</span>
                </button>
              )}

              {status !== 'ملغي' && (
                <button
                  type="button"
                  onClick={() => handleOptionClick(onCancel)}
                  className="w-full text-right px-4 py-3 text-sm text-rose-600 hover:bg-rose-50/50 flex items-center gap-2.5 transition-colors font-semibold outline-none"
                  role="menuitem"
                >
                  <FiXCircle className="w-4 h-4 text-rose-500" />
                  <span>إلغاء الحجز</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(ActionMenu);
