import React from 'react';
import ClashZoneOfficialBadge from '../assets/ClashZone_official_badge.webp';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'icon-only' | 'horizontal';
  className?: string;
}

export const Logo = React.memo<LogoProps>(({
  size = 'md',
  variant = 'default',
  className = ''
}) => {
  const sizeClasses = {
    sm: {
      badge: 'w-8 h-8 rounded-lg p-0.5',
      textAr: 'text-sm font-black',
      textEn: 'text-[10px]',
      gap: 'gap-2.5'
    },
    md: {
      badge: 'w-10 h-10 rounded-xl p-1',
      textAr: 'text-base font-black',
      textEn: 'text-[11px]',
      gap: 'gap-3'
    },
    lg: {
      badge: 'w-14 h-14 rounded-2xl p-1.5',
      textAr: 'text-xl font-black',
      textEn: 'text-xs',
      gap: 'gap-3.5'
    },
    xl: {
      badge: 'w-18 h-18 rounded-2xl p-2',
      textAr: 'text-2xl font-black',
      textEn: 'text-sm',
      gap: 'gap-4'
    }
  };

  const currentSize = sizeClasses[size];

  // Official CLASH ZONE Logo Symbol Emblem
  const logoSymbol = (
    <div className={`relative flex items-center justify-center flex-shrink-0 bg-[#0c0e14] border border-slate-800/90 rounded-xl shadow-xs overflow-hidden ${currentSize.badge}`}>
      <img
        src={ClashZoneOfficialBadge}
        alt="CLASH ZONE Official Logo"
        className="w-full h-full object-contain select-none"
        loading="eager"
      />
    </div>
  );

  if (variant === 'icon-only') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{logoSymbol}</div>;
  }

  const logoText = (
    <div className="flex flex-col text-right select-none">
      <div className="flex items-center gap-2">
        <span className={`${currentSize.textAr} text-slate-900 tracking-wider leading-tight`}>
          CLASH ZONE
        </span>
        <span className="text-[10px] font-black text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-md leading-none">
          Laser Tag
        </span>
      </div>
      <span className={`${currentSize.textEn} font-bold text-slate-500 tracking-wide mt-0.5 leading-none`}>
        نظام إدارة الحجوزات
      </span>
    </div>
  );

  if (variant === 'horizontal') {
    return (
      <div className={`inline-flex items-center ${currentSize.gap} ${className}`}>
        {logoSymbol}
        {logoText}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center text-center ${currentSize.gap} ${className}`}>
      {logoSymbol}
      {logoText}
    </div>
  );
});

export default Logo;
