import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';
import { supabase } from '../lib/supabase';
import { useToast } from './ToastProvider';
import Logo from './Logo';
import ppfInstallationImg from '../assets/ppf_installation.png';
import SignatureFooter from './SignatureFooter';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { showToast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (window.innerWidth < 768) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth) - 0.5;
    const y = (clientY / innerHeight) - 0.5;
    setMousePosition({ x, y });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    
    if (!email.trim() || !password) {
      showToast("يرجى ملء كافة الحقول المطلوبة.", "warning");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        let msg = error.message;
        if (msg === "Invalid login credentials") {
          msg = "بيانات الدخول غير صحيحة! يرجى التحقق من البريد الإلكتروني وكلمة المرور.";
        }
        setErrorMsg(msg);
        showToast(msg, "error");
      } else if (data.session) {
        showToast("أهلاً بك! تم تسجيل الدخول بنجاح", "success");
        setIsSuccess(true);
        setTimeout(() => {
          onLoginSuccess();
        }, 850);
      }
    } catch (err) {
      console.error("Authentication exception:", err);
      const errMsg = "حدث خطأ غير متوقع أثناء الاتصال بالخادم.";
      setErrorMsg(errMsg);
      showToast(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center p-4 lg:p-8 gap-4 overflow-hidden" dir="rtl">
      {/* Container card with entrance & success exit fade */}
      <motion.div 
        initial={{ opacity: 0, y: 35, scale: 0.98 }}
        animate={isSuccess ? { opacity: 0, y: -25, scale: 0.96 } : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        onMouseMove={handleMouseMove}
        className="w-full max-w-[1100px] bg-white rounded-[32px] overflow-hidden shadow-2xl border border-neutral-100 flex flex-col md:grid md:grid-cols-12 min-h-[600px] lg:min-h-[640px] relative"
      >
        
        {/* Right side: Premium Visual Image of PPF detailing (Col span 7 on desktop) */}
        <div className="hidden md:flex md:flex-col md:col-span-7 relative overflow-hidden justify-end p-8 select-none">
          {/* Background image with Ken Burns slow zoom in effect & Parallax */}
          <motion.img 
            src={ppfInstallationImg} 
            alt="Luxury Car PPF Detailing" 
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ scale: 1.12, filter: "brightness(0.9)" }}
            animate={{ scale: 1, filter: "brightness(1)" }}
            style={{
              x: mousePosition.x * -12,
              y: mousePosition.y * -12,
            }}
            transition={{ 
              type: "spring",
              stiffness: 80,
              damping: 25,
              scale: { duration: 1.6, ease: [0.16, 1, 0.3, 1] }
            }}
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />

          {/* Noise background overlay */}
          <div className="noise-bg" />

          {/* Faint Golden Light Sweep */}
          <div className="light-sweep-effect" />

          {/* Floating Golden Orb - slow rotation & floating */}
          <motion.div 
            className="absolute top-1/4 left-1/4 w-[280px] h-[280px] rounded-full bg-gradient-to-tr from-[#D4A017]/10 to-[#F4C542]/5 blur-[75px] pointer-events-none"
            animate={{
              x: [0, 15, -10, 0],
              y: [0, -25, 12, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.05, 0.95, 1]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Animated Gold Mesh */}
          <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden mix-blend-screen">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <radialGradient id="meshGrad1" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#F4C542" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#F4C542" stopOpacity="0" />
                </radialGradient>
              </defs>
              <motion.circle 
                cx="30" cy="40" r="35" 
                fill="url(#meshGrad1)"
                animate={{
                  cx: [30, 75, 45, 30],
                  cy: [40, 35, 75, 40],
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.circle 
                cx="70" cy="65" r="30" 
                fill="url(#meshGrad1)"
                animate={{
                  cx: [70, 25, 60, 70],
                  cy: [65, 75, 35, 65],
                }}
                transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
              />
            </svg>
          </div>

          {/* Glassmorphic card matching the reference layout - Centered & Floating & Parallax */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              x: mousePosition.x * 10,
              y: mousePosition.y * 10,
            }}
            transition={{ 
              delay: 0.4, 
              duration: 0.7, 
              ease: "easeOut",
              x: { type: "spring", stiffness: 80, damping: 25 },
              y: { type: "spring", stiffness: 80, damping: 25 }
            }}
            className="z-10 bg-black/45 border border-white/[0.08] backdrop-blur-md rounded-2xl p-6 text-center max-w-lg mx-auto mb-4 shadow-2xl w-full flex flex-col items-center"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="w-full flex flex-col items-center"
            >
              <h4 className="text-lg font-black text-white mb-2">متابعة حالة الحجوزات والمبيعات</h4>
              <p className="text-[11px] text-gray-300 font-bold leading-relaxed mb-4 text-center">
                شاشة التحكم المتقدمة لمتابعة طلبات حماية طلاء السيارات PPF والعوازل الحرارية بكل سهولة ودقة لمركز إنفينيتي برايت.
              </p>
              
              {/* Visual Pagination indicators */}
              <div className="flex items-center gap-1.5 justify-center">
                <span className="w-4.5 h-1.5 rounded-full bg-[#F4C542] transition-all" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Left side: Login Form (Col span 5 on desktop) */}
        <div className="md:col-span-5 p-8 lg:p-12 flex flex-col justify-between bg-white text-right relative z-10">
          <div>
            {/* Logo and Header with fade down */}
            <motion.div 
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
              className="flex justify-start mb-10"
            >
              <Logo size="md" variant="horizontal" />
            </motion.div>

            {/* Title with fade slide */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
            >
              <h2 className="text-2xl font-black text-gray-900 mb-2">مرحباً بك مجدداً</h2>
              <p className="text-xs font-bold text-gray-400 mb-8">تسجيل الدخول إلى لوحة المتابعة وإدارة علاقات العملاء CRM</p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              
              {/* Email Input */}
              <motion.div 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
                className="flex flex-col gap-1.5"
              >
                <label htmlFor="login-email" className="text-[11px] font-bold text-gray-500 pr-1 flex items-center gap-1.5">
                  <FiMail className="w-3.5 h-3.5 text-gray-400" />
                  <span>البريد الإلكتروني *</span>
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="admin@bright.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 h-11 bg-neutral-50 border border-neutral-200/85 rounded-xl text-sm font-semibold focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-all duration-300 text-gray-800 outline-none"
                />
              </motion.div>

              {/* Password Input */}
              <motion.div 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
                className="flex flex-col gap-1.5"
              >
                <label htmlFor="login-password" className="text-[11px] font-bold text-gray-500 pr-1 flex items-center gap-1.5">
                  <FiLock className="w-3.5 h-3.5 text-gray-400" />
                  <span>كلمة المرور *</span>
                </label>
                <input
                  id="login-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 h-11 bg-neutral-50 border border-neutral-200/85 rounded-xl text-sm font-bold focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-all duration-300 text-gray-800 outline-none"
                />
              </motion.div>

              {/* Error Box */}
              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs font-bold text-rose-600 flex items-start gap-2 mt-2 leading-relaxed"
                >
                  <FiAlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}

              {/* Submit Button wrapper with micro-interactions & progress sweep */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
              >
                <motion.button
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={{ scale: 0.985 }}
                  type="submit"
                  disabled={loading || isSuccess}
                  className="relative overflow-hidden w-full h-12 bg-gradient-to-r from-[#F4C542] via-[#E8B923] to-[#F4C542] bg-[length:200%_auto] hover:bg-right transition-all duration-500 disabled:bg-[#F4C542]/50 disabled:cursor-not-allowed text-gray-900 font-extrabold rounded-xl shadow-md hover:shadow-[#F4C542]/20 flex items-center justify-center gap-2 mt-4 cursor-pointer text-sm outline-none"
                >
                  {isSuccess ? (
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent z-0"
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
                    />
                  ) : null}
                  {loading || isSuccess ? (
                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin z-10" />
                  ) : (
                    <span className="z-10">تسجيل الدخول</span>
                  )}
                </motion.button>
              </motion.div>

            </form>
          </div>

          {/* Footer Info */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-10 pt-4 border-t border-neutral-100 flex flex-col gap-2.5 text-right"
          >
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold leading-normal">
              <span>⚠️ هل تواجه مشكلة؟</span>
              <span className="text-gray-500 font-extrabold cursor-pointer hover:underline">مركز المساعدة والدعم</span>
            </div>
            <span className="text-[9px] text-gray-400 font-semibold">إنفينيتي برايت © 2026. جميع الحقوق محفوظة.</span>
          </motion.div>
        </div>

      </motion.div>
      <SignatureFooter />
    </div>
  );
};

export default LoginScreen;
