import React from 'react';
import { motion } from 'framer-motion';
import logoImg from '../assets/logo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'icon-only' | 'horizontal';
  monochrome?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'default',
  className = ''
}) => {
  // Size mappings for image height and text sizes
  const sizeClasses = {
    sm: {
      img: 'h-8 w-auto',
      textAr: 'text-base',
      textEn: 'text-[9px]',
      gap: 'gap-2'
    },
    md: {
      img: 'h-12 w-auto',
      textAr: 'text-xl',
      textEn: 'text-[11px]',
      gap: 'gap-2.5'
    },
    lg: {
      img: 'h-20 w-auto',
      textAr: 'text-3xl',
      textEn: 'text-[14px]',
      gap: 'gap-4'
    },
    xl: {
      img: 'h-32 w-auto',
      textAr: 'text-5xl',
      textEn: 'text-[18px]',
      gap: 'gap-6'
    }
  };

  const currentSize = sizeClasses[size];

  // Image Element
  const logoSymbol = (
    <motion.img
      src={logoImg}
      alt="Infinity Bright Logo"
      className={`${currentSize.img} object-contain drop-shadow-[0_2px_8px_rgba(244,197,66,0.12)]`}
      whileHover={{ scale: 1.05, filter: 'brightness(1.05)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
    />
  );

  if (variant === 'icon-only') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{logoSymbol}</div>;
  }

  const logoText = (
    <div className="flex flex-col text-right select-none gap-1 md:gap-1.5">
      <span
        className={`${currentSize.textAr} font-extrabold tracking-tight text-gray-900 leading-tight`}
        style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}
      >
        انفينيتي برايت
      </span>
      <span
        className={`${currentSize.textEn} font-black tracking-widest bg-gradient-to-r from-[#F4C542] via-[#FFD95A] to-[#D4A017] bg-clip-text text-transparent uppercase leading-none`}
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
