import React, { useState } from 'react';
import { FiMail, FiLock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { supabase } from '../lib/supabase';
import { useToast } from './useToast';
import ClashZoneArenaImg from '../assets/ClashZone_arena.webp';
import ClashZoneOfficialBadge from '../assets/ClashZone_official_badge.webp';
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
        onLoginSuccess();
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between w-full" dir="rtl">
      {/* Container card in clean light style */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div 
          className="w-full max-w-[1000px] bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200/90 flex flex-col md:grid md:grid-cols-12 min-h-[580px] relative animate-fade-in"
        >
        
        {/* Right side: Modern Visual Info Panel */}
       <div className="hidden md:flex md:flex-col md:col-span-6 relative overflow-hidden justify-between p-8 bg-slate-100 border-l border-slate-200 select-none">
  <div className="absolute inset-0 w-full h-full opacity-80">
            <img 
              src={ClashZoneArenaImg} 
              alt="CLASH ZONE Arena" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0c0e14] border border-slate-700/80 p-1 flex items-center justify-center shadow-xs">
                <img 
                  src={ClashZoneOfficialBadge} 
                  alt="CLASH ZONE Mark" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xs font-black text-slate-800 tracking-wider">CLASH ZONE</span>
            </div>
            <span className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
ادارة الحجوزات             </span>
          </div>

          <div className="relative z-10 bg-white/95 backdrop-blur-xs rounded-xl p-6 border border-slate-200/90 shadow-xs">
            <h4 className="text-base font-black text-slate-900 mb-2">منظومة إدارة حجوزات CLASH ZONE</h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              منصة شاملة لتنسيق جداول الفعاليات، أعياد الميلاد، والزيارات المدرسية والجامعية، مع تتبع فوري لمواعيد وعدد المشاركين.
            </p>

            <div className="flex flex-col gap-2 pt-2 border-t border-slate-150 text-xs text-slate-700 font-medium">
              <div className="flex items-center gap-2">
                <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>متابعة فورية للحجوزات وتحديثات Realtime</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>إعادة جدولة تفاعلية للمواعيد والأوقات</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>تصدير سريع للبيانات وتقارير الحضور</span>
              </div>
            </div>
          </div>
        </div>

        {/* Left side: Login Form */}
        <div className="md:col-span-6 p-8 lg:p-12 flex flex-col justify-between bg-white text-right relative z-10">
          <div>
            {/* Official CLASH ZONE Brand Header */}
            <div className="flex items-center gap-4 mb-7 pb-5 border-b border-slate-150">
              <div className="w-14 h-14 rounded-2xl bg-[#0c0e14] border border-slate-800/90 shadow-sm flex items-center justify-center p-1.5 flex-shrink-0">
                <img 
                  src={ClashZoneOfficialBadge} 
                  alt="CLASH ZONE Official Logo" 
                  className="w-full h-full object-contain select-none"
                  loading="eager"
                />
              </div>
              <div className="flex flex-col text-right">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-slate-900 tracking-wider font-sans">
                    CLASH ZONE
                  </span>
                  <span className="text-[10px] font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                    وار زون
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-500 mt-0.5">
                  نظام إدارة الحجوزات والفعاليات
                </span>
              </div>
            </div>

            {/* Title */}
            <div className="mb-6">
              <h2 className="text-xl font-black text-slate-900 mb-1">تسجيل الدخول للنظام</h2>
              <p className="text-xs text-slate-500">أدخل بيانات الحساب للوصول إلى لوحة إدارة الحجوزات</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
              
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="login-email" className="text-[11px] font-bold text-slate-700 pr-1 flex items-center gap-1.5">
                  <FiMail className="w-3.5 h-3.5 text-slate-400" />
                  <span>البريد الإلكتروني *</span>
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="admin@ClashZone.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 h-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all outline-none"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="login-password" className="text-[11px] font-bold text-slate-700 pr-1 flex items-center gap-1.5">
                  <FiLock className="w-3.5 h-3.5 text-slate-400" />
                  <span>كلمة المرور *</span>
                </label>
                <input
                  id="login-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 h-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder-slate-400 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all outline-none"
                />
              </div>

              {/* Error Box */}
              {errorMsg && (
                <div 
                  className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-start gap-2 mt-1 leading-relaxed"
                >
                  <FiAlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="mt-3">
                <button
                  type="submit"
                  disabled={loading || isSuccess}
                  className="btn-primary-luxury w-full h-11 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading || isSuccess ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>تسجيل الدخول إلى النظام</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>

        </div>
      </div>
      <SignatureFooter showNav={false} />
    </div>
  );
});

export default LoginScreen;
