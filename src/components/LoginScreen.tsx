import React, { useState } from 'react';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';
import { supabase } from '../lib/supabase';
import { useToast } from './useToast';
import Logo from './Logo';
import ppfInstallationImg from '../assets/ppf_installation.webp';
import SignatureFooter from './SignatureFooter';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen = React.memo<LoginScreenProps>(({ onLoginSuccess }) => {
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
      <div 
        onMouseMove={handleMouseMove}
        className={`w-full max-w-[1100px] bg-white rounded-[32px] overflow-hidden shadow-2xl border border-neutral-100 flex flex-col md:grid md:grid-cols-12 min-h-[600px] lg:min-h-[640px] relative transition-[transform,opacity] duration-[800ms] cubic-bezier-[0.16,1,0.3,1] ${
          isSuccess ? 'opacity-0 -translate-y-6 scale-[0.96]' : 'animate-login-enter'
        }`}
      >
        
        {/* Right side: Premium Visual Image of PPF detailing (Col span 7 on desktop) */}
        <div className="hidden md:flex md:flex-col md:col-span-7 relative overflow-hidden justify-end p-8 select-none">
          {/* Background image with Ken Burns slow zoom in effect & Parallax */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              transform: `translate3d(${mousePosition.x * -12}px, ${mousePosition.y * -12}px, 0)`,
              transition: "transform 1.6s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
          >
            <img 
              src={ppfInstallationImg} 
              alt="Luxury Car PPF Detailing" 
              className="w-full h-full object-cover animate-login-img"
            />
          </div>
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />

          {/* Noise background overlay */}
          <div className="noise-bg" />

          {/* Faint Golden Light Sweep */}
          <div className="light-sweep-effect" />

          {/* Floating Golden Orb - slow rotation & floating */}
          <div 
            className="absolute top-1/4 left-1/4 w-[280px] h-[280px] rounded-full bg-gradient-to-tr from-[#D4A017]/10 to-[#F4C542]/5 blur-[75px] pointer-events-none animate-orb-float"
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
              <circle 
                cx="30" cy="40" r="35" 
                fill="url(#meshGrad1)"
                className="animate-circle-move-1"
              />
              <circle 
                cx="70" cy="65" r="30" 
                fill="url(#meshGrad1)"
                className="animate-circle-move-2"
              />
            </svg>
          </div>

          {/* Glassmorphic card matching the reference layout - Centered & Floating & Parallax */}
          <div 
            style={{
              transform: `translate3d(${mousePosition.x * 10}px, ${mousePosition.y * 10}px, 0)`,
              transition: "transform 1.6s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
            className="z-10 bg-black/45 border border-white/[0.08] backdrop-blur-md rounded-2xl p-6 text-center max-w-lg mx-auto mb-4 shadow-2xl w-full flex flex-col items-center animate-fade-in-up"
          >
            <div className="w-full flex flex-col items-center animate-float">
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
            </div>
          </div>
        </div>

        {/* Left side: Login Form (Col span 5 on desktop) */}
        <div className="md:col-span-5 p-8 lg:p-12 flex flex-col justify-between bg-white text-right relative z-10">
          <div>
            {/* Logo and Header with fade down */}
            <div className="flex justify-start mb-10 animate-fade-in-down">
              <Logo size="md" variant="horizontal" />
            </div>

            {/* Title with fade slide */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <h2 className="text-2xl font-black text-gray-900 mb-2">مرحباً بك مجدداً</h2>
              <p className="text-xs font-bold text-gray-400 mb-8">تسجيل الدخول إلى لوحة المتابعة وإدارة علاقات العملاء CRM</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              
              {/* Email Input */}
              <div 
                className="flex flex-col gap-1.5 animate-fade-in-up" 
                style={{ animationDelay: '0.3s' }}
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
                  className="w-full px-4 h-11 bg-neutral-50 border border-neutral-200/85 rounded-xl text-sm font-semibold focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-[background-color,border-color,box-shadow] duration-300 text-gray-800 outline-none"
                />
              </div>

              {/* Password Input */}
              <div 
                className="flex flex-col gap-1.5 animate-fade-in-up" 
                style={{ animationDelay: '0.4s' }}
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
                  className="w-full px-4 h-11 bg-neutral-50 border border-neutral-200/85 rounded-xl text-sm font-bold focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-[background-color,border-color,box-shadow] duration-300 text-gray-800 outline-none"
                />
              </div>

              {/* Error Box */}
              {errorMsg && (
                <div 
                  className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs font-bold text-rose-600 flex items-start gap-2 mt-2 leading-relaxed animate-scale-in"
                >
                  <FiAlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button wrapper with micro-interactions & progress sweep */}
              <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <button
                  type="submit"
                  disabled={loading || isSuccess}
                  className="relative overflow-hidden w-full h-12 bg-gradient-to-r from-[#F4C542] via-[#E8B923] to-[#F4C542] bg-[length:200%_auto] hover:bg-right transition-[background-position,box-shadow,transform] duration-500 disabled:bg-[#F4C542]/50 disabled:cursor-not-allowed text-gray-900 font-extrabold rounded-xl shadow-md hover:shadow-[#F4C542]/20 flex items-center justify-center gap-2 mt-4 cursor-pointer text-sm outline-none login-submit-btn"
                >
                  {isSuccess ? (
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent z-0 animate-sweep"
                      style={{ transform: "skewX(-20deg)" }}
                    />
                  ) : null}
                  {loading || isSuccess ? (
                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin z-10" />
                  ) : (
                    <span className="z-10">تسجيل الدخول</span>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Footer Info */}
          <div 
            className="mt-10 pt-4 border-t border-neutral-100 flex flex-col gap-2.5 text-right animate-fade-in"
            style={{ animationDelay: '0.6s' }}
          >
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold leading-normal">
              <span>⚠️ هل تواجه مشكلة؟</span>
              <span className="text-gray-500 font-extrabold cursor-pointer hover:underline">مركز المساعدة والدعم</span>
            </div>
            <span className="text-[9px] text-gray-400 font-semibold">إنفينيتي برايت © 2026. جميع الحقوق محفوظة.</span>
          </div>
        </div>

      </div>
      <SignatureFooter />
    </div>
  );
});

export default LoginScreen;

