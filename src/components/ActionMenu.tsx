import React, { useState } from 'react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useDismiss,
  useRole,
  useClick,
  useInteractions,
  FloatingPortal,
  FloatingFocusManager
} from '@floating-ui/react';
import { HiEllipsisVertical } from 'react-icons/hi2';
import { 
  FiEye, 
  FiCalendar, 
  FiCheck, 
  FiXCircle, 
  FiCheckCircle, 
  FiMessageCircle, 
  FiCopy, 
  FiTrash2 
} from 'react-icons/fi';
import type { BookingDbStatus } from '../types/booking';

export interface ActionMenuProps {
  onViewDetails: () => void;
  onEditTime: () => void;
  onConfirm: () => void;
  onComplete?: () => void;
  onCancel: () => void;
  onWhatsApp?: () => void;
  onCopyPhone?: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
  status: BookingDbStatus | string;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  onViewDetails,
  onEditTime,
  onConfirm,
  onComplete,
  onCancel,
  onWhatsApp,
  onCopyPhone,
  onDelete,
  canDelete = false,
  status
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Floating UI handles precise viewport positioning, flip, shift, and auto-update
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-end',
    middleware: [
      offset(6),
      flip({
        fallbackPlacements: ['top-end', 'bottom-start', 'top-start'],
        padding: 10,
      }),
      shift({ padding: 10 }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context, {
    escapeKey: true,
    outsidePress: true,
  });
  const role = useRole(context, { role: 'menu' });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const handleOptionClick = (callback?: () => void) => {
    if (callback) {
      callback();
    }
    setIsOpen(false);
  };

  const isCancelled = status === 'cancelled' || status === 'ملغي';
  const isCompleted = status === 'completed' || status === 'مكتمل';
  const isPending = status === 'pending' || status === 'جديد';
  const isConfirmed = status === 'confirmed' || status === 'تم التأكيد';

  return (
    <div className="relative inline-block text-right">
      <button
        ref={refs.setReference}
        type="button"
        {...getReferenceProps()}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="خيارات الحجز"
        className={`p-1.5 rounded-lg transition-colors cursor-pointer outline-none flex items-center justify-center ${
          isOpen
            ? 'bg-slate-100 text-slate-800 ring-2 ring-slate-200'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
        }`}
      >
        <HiEllipsisVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              style={{ ...floatingStyles, zIndex: 9999 }}
              {...getFloatingProps()}
              className="outline-none"
            >
              <div
                dir="rtl"
                className="w-52 rounded-xl bg-white border border-slate-200/90 shadow-xl overflow-hidden divide-y divide-slate-100 text-right animate-dropdown-enter select-none"
              >
                {/* Section 1: Navigation & Communication Actions */}
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => handleOptionClick(onViewDetails)}
                    className="w-full text-right px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors font-medium outline-none cursor-pointer"
                    role="menuitem"
                  >
                    <FiEye className="w-3.5 h-3.5 text-slate-400" />
                    <span>عرض التفاصيل</span>
                  </button>
                  
                  {!isCancelled && !isCompleted && (
                    <button
                      type="button"
                      onClick={() => handleOptionClick(onEditTime)}
                      className="w-full text-right px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors font-medium outline-none cursor-pointer"
                      role="menuitem"
                    >
                      <FiCalendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>تعديل الموعد</span>
                    </button>
                  )}

                  {onCopyPhone && (
                    <button
                      type="button"
                      onClick={() => handleOptionClick(onCopyPhone)}
                      className="w-full text-right px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors font-medium outline-none cursor-pointer"
                      role="menuitem"
                    >
                      <FiCopy className="w-3.5 h-3.5 text-slate-400" />
                      <span>نسخ رقم الجوال</span>
                    </button>
                  )}

                  {onWhatsApp && (
                    <button
                      type="button"
                      onClick={() => handleOptionClick(onWhatsApp)}
                      className="w-full text-right px-3.5 py-2 text-xs text-emerald-700 hover:bg-emerald-50 flex items-center gap-2.5 transition-colors font-bold outline-none cursor-pointer"
                      role="menuitem"
                    >
                      <FiMessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>مراسلة عبر واتساب</span>
                    </button>
                  )}
                </div>

                {/* Section 2: Booking Status Actions */}
                <div className="py-1">
                  {isPending && (
                    <button
                      type="button"
                      onClick={() => handleOptionClick(onConfirm)}
                      className="w-full text-right px-3.5 py-2 text-xs text-emerald-700 hover:bg-emerald-50 flex items-center gap-2.5 transition-colors font-bold outline-none cursor-pointer"
                      role="menuitem"
                    >
                      <FiCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>تأكيد الحجز</span>
                    </button>
                  )}

                  {isConfirmed && onComplete && (
                    <button
                      type="button"
                      onClick={() => handleOptionClick(onComplete)}
                      className="w-full text-right px-3.5 py-2 text-xs text-blue-700 hover:bg-blue-50 flex items-center gap-2.5 transition-colors font-bold outline-none cursor-pointer"
                      role="menuitem"
                    >
                      <FiCheckCircle className="w-3.5 h-3.5 text-blue-600" />
                      <span>إتمام الحجز (مكتمل)</span>
                    </button>
                  )}

                  {!isCancelled && !isCompleted && (
                    <button
                      type="button"
                      onClick={() => handleOptionClick(onCancel)}
                      className="w-full text-right px-3.5 py-2 text-xs text-rose-700 hover:bg-rose-50 flex items-center gap-2.5 transition-colors font-bold outline-none cursor-pointer"
                      role="menuitem"
                    >
                      <FiXCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>إلغاء الحجز</span>
                    </button>
                  )}
                </div>

                {/* Section 3: Permanent Deletion (Admin and Manager ONLY) */}
                {canDelete && onDelete && (
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => handleOptionClick(onDelete)}
                      className="w-full text-right px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors font-bold outline-none cursor-pointer"
                      role="menuitem"
                    >
                      <FiTrash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>حذف الحجز نهائياً</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </div>
  );
};

export default React.memo(ActionMenu);
