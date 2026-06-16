import React from 'react';
import { motion } from 'framer-motion';

// Premium Custom Sparkle Icon SVG
const SparkleIcon = () => (
  <svg 
    className="w-3.5 h-3.5 text-[#F4C542] animate-pulse drop-shadow-[0_0_4px_rgba(244,197,66,0.5)]" 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" />
  </svg>
);

export const SignatureFooter = React.memo(() => {
  return (
    <div className="w-full py-10 px-4 mt-16 mb-4 flex justify-center items-center select-none" dir="ltr">
      <motion.a
        href="https://salahkhaled.com/en"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        animate={{
          y: [0, -4, 0],
          borderColor: [
            "rgba(244, 197, 66, 0.15)", 
            "rgba(244, 197, 66, 0.4)", 
            "rgba(244, 197, 66, 0.15)"
          ],
          boxShadow: [
            "0 10px 30px rgba(0, 0, 0, 0.25), 0 0 10px rgba(244, 197, 66, 0.02), inset 0 1px 1px rgba(255, 255, 255, 0.05)",
            "0 10px 30px rgba(0, 0, 0, 0.25), 0 0 16px rgba(244, 197, 66, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.05)",
            "0 10px 30px rgba(0, 0, 0, 0.25), 0 0 10px rgba(244, 197, 66, 0.02), inset 0 1px 1px rgba(255, 255, 255, 0.05)"
          ]
        }}
        whileHover={{ 
          scale: 1.03, 
          borderColor: "rgba(244, 197, 66, 0.65)",
          boxShadow: "0 15px 35px rgba(0, 0, 0, 0.35), 0 0 24px rgba(244, 197, 66, 0.22), inset 0 1px 1px rgba(255, 255, 255, 0.1)"
        }}
        transition={{
          y: {
            repeat: Infinity,
            duration: 6,
            ease: "easeInOut"
          },
          borderColor: {
            repeat: Infinity,
            duration: 5,
            ease: "easeInOut"
          },
          boxShadow: {
            repeat: Infinity,
            duration: 5,
            ease: "easeInOut"
          },
          scale: {
            type: "spring",
            stiffness: 300,
            damping: 18
          }
        }}
        className="relative overflow-hidden flex flex-col items-center gap-2 p-5 px-10 bg-neutral-950/85 hover:bg-neutral-950 border rounded-[22px] backdrop-blur-md max-w-xs sm:max-w-sm mx-auto group cursor-pointer text-center"
      >
        {/* Soft background ambient radial gold glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F4C542]/2 to-transparent opacity-60 rounded-[22px] pointer-events-none group-hover:from-[#F4C542]/5 transition-all duration-500" />
        
        {/* Shimmer line passing through container border */}
        <div className="absolute top-0 left-0 w-[40%] h-[1px] bg-gradient-to-r from-transparent via-[#F4C542]/30 to-transparent group-hover:w-full transition-all duration-700" />

        {/* Small premium icon header */}
        <div className="flex items-center gap-2 mb-0.5">
          <SparkleIcon />
          <span className="text-[9px] uppercase tracking-[0.25em] text-neutral-400 font-extrabold select-none">
            Designed & Developed by
          </span>
          <SparkleIcon />
        </div>

        {/* Larger Designer Name with luxury gold gradient */}
        <span className="text-sm sm:text-base font-black tracking-[0.18em] signature-shimmer-text group-hover:brightness-110 transition-all duration-300">
          SALAH KHALED
        </span>
      </motion.a>
    </div>
  );
});

export default SignatureFooter;
