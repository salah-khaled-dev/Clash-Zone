import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'icon-only' | 'horizontal';
  monochrome?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'default',
  monochrome = false,
  className = ''
}) => {
  // Size mappings
  const sizeClasses = {
    sm: {
      svg: 'w-8 h-8',
      textAr: 'text-base',
      textEn: 'text-[9px]',
      gap: 'gap-2'
    },
    md: {
      svg: 'w-12 h-12',
      textAr: 'text-xl',
      textEn: 'text-[11px]',
      gap: 'gap-2.5'
    },
    lg: {
      svg: 'w-20 h-20',
      textAr: 'text-3xl',
      textEn: 'text-[14px]',
      gap: 'gap-4'
    },
    xl: {
      svg: 'w-32 h-32',
      textAr: 'text-5xl',
      textEn: 'text-[18px]',
      gap: 'gap-6'
    }
  };

  const currentSize = sizeClasses[size];

  // Colors
  const primaryGold = '#F4C542';
  const premiumGold = '#D4A017';
  const fillColor = monochrome ? 'currentColor' : 'url(#infinityGoldGrad)';

  // SVG Symbol
  const logoSymbol = (
    <motion.svg
      viewBox="0 0 100 100"
      className={`${currentSize.svg} drop-shadow-[0_2px_10px_rgba(244,197,66,0.15)]`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      whileHover={{ scale: 1.05, filter: 'brightness(1.1)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
    >
      <defs>
        <linearGradient id="infinityGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primaryGold} />
          <stop offset="100%" stopColor={premiumGold} />
        </linearGradient>
      </defs>

      {/* Top Wedge Shape */}
      <motion.path
        d="M 18 36 L 82 22 L 82 39 L 28 39 Z"
        fill={fillColor}
        fillRule="evenodd"
        clipRule="evenodd"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      {/* Top Inner Cutout (using background overlay mask or subtractive path) */}
      <path
        d="M 32 35.5 L 76 26 L 76 34.5 L 38 34.5 Z"
        fill="#FFFFFF"
        className="dark:fill-neutral-900"
        opacity={monochrome ? 0 : 0.85}
      />

      {/* Bottom Shield/Wing Shape */}
      <motion.path
        d="M 22 47 L 86 47 C 86 68 65 85 48 85 C 36 85 22 74 22 56 Z"
        fill={fillColor}
        fillRule="evenodd"
        clipRule="evenodd"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
      />
      {/* Bottom Inner Cutout */}
      <path
        d="M 32 52 L 76 52 C 76 65 62 77 48 77 C 39 77 32 70 32 58 Z"
        fill="#FFFFFF"
        className="dark:fill-neutral-900"
        opacity={monochrome ? 0 : 0.85}
      />
    </motion.svg>
  );

  if (variant === 'icon-only') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{logoSymbol}</div>;
  }

  const logoText = (
    <div className="flex flex-col text-right select-none">
      <span
        className={`${currentSize.textAr} font-extrabold tracking-tight text-gray-900 leading-none`}
        style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}
      >
        انفينيتي برايت
      </span>
      <span
        className={`${currentSize.textEn} font-black tracking-widest text-[#D4A017] uppercase mt-1 leading-none`}
        style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}
      >
        Infinity Bright
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

  // Default block stack
  return (
    <div className={`flex flex-col items-center text-center ${currentSize.gap} ${className}`}>
      {logoSymbol}
      {logoText}
    </div>
  );
};

export default Logo;
