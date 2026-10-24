import React from 'react';
import { Logo } from './Logo';

export interface FooterProps {
  onNavigate?: (target: 'dashboard' | 'bookings' | 'calendar') => void;
  showNav?: boolean;
}

export const SignatureFooter: React.FC<FooterProps> = React.memo(({
  onNavigate,
  showNav = true,
}) => {
  const handleNavClick = (target: 'dashboard' | 'bookings' | 'calendar') => {
    if (onNavigate) {
      onNavigate(target);
    } else if (target === 'dashboard') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById('bookings-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="w-full bg-white border-t border-slate-200/90 box-border mt-auto" dir="rtl">
      <div className="max-w-[1360px] mx-auto px-5 lg:px-8 py-5 flex flex-col gap-4">
        {/* Main Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Right: War Zone Official Brand Emblem & Subtitle */}
          <div className="flex items-center gap-3">
            <Logo size="sm" variant="icon-only" />
            <div className="flex flex-col">
              <span className="text-sm font-black text-slate-900 tracking-wider leading-tight">
                WAR ZONE
              </span>
              <span className="text-[11px] text-slate-500 font-medium mt-0.5">
                نظام إدارة الحجوزات والفعاليات
              </span>
            </div>
          </div>

          {/* Left: Compact Navigation Links */}
          {showNav && (
            <nav aria-label="روابط لوحة التحكم" className="flex items-center gap-5 sm:gap-6 text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => handleNavClick('dashboard')}
                className="hover:text-red-600 transition-colors cursor-pointer outline-none"
              >
                لوحة التحكم
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('bookings')}
                className="hover:text-red-600 transition-colors cursor-pointer outline-none"
              >
                الحجوزات
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('calendar')}
                className="hover:text-red-600 transition-colors cursor-pointer outline-none"
              >
                التقويم
              </button>
            </nav>
          )}
        </div>

        {/* Thin Elegant Divider */}
        <div className="w-full border-t border-slate-100" />

        {/* Bottom Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-500 font-medium">
          {/* Right side in RTL: Refined Developer Credit */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium">تطوير:</span>
            <a
              href="https://salahkhaled.com/en"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-slate-700 hover:text-red-600 transition-colors cursor-pointer"
            >
             WarZone
            </a>
          </div>

          {/* Left side in RTL: Copyright & System Subtitle */}
          <div className="flex items-center gap-3 text-slate-400 text-xs">
            <span>© 2026 War Zone — جميع الحقوق محفوظة</span>
            <span className="hidden sm:inline text-slate-200">•</span>
            <span className="hidden sm:inline text-[11px] font-semibold text-slate-400 tracking-wide" dir="ltr">
              Booking Management System
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
});

export const Footer = SignatureFooter;
export default SignatureFooter;
