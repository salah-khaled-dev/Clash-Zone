import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FiCalendar, 
  FiClock, 
  FiLayout, 
  FiPhone, 
  FiMessageCircle, 
  FiUsers, 
  FiLogOut, 
  FiShield, 
  FiAlertTriangle 
} from 'react-icons/fi';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
import type { Booking, BookingCategory, BookingDbStatus, UserRole } from './types/booking';
import { bookingsService } from './services/bookings.service';
import { FilterToolbar } from './components/FilterToolbar';
import { BookingCardRow } from './components/BookingCardRow';
import { BookingForm } from './components/BookingForm';
import { EmptyState } from './components/EmptyState';
import { BookingCardSkeleton, StatsSkeleton } from './components/LoadingSkeleton';
import { ToastProvider } from './components/ToastProvider';
import { useToast } from './components/useToast';
import { Logo } from './components/Logo';
import { formatArabicDate, formatArabicTime, formatPeopleCount, getTodayRiyadhStr } from './utils/bookingFormatters';
import { compareTimeSlots } from './utils/timeSlots';
import { getCategoryIcon } from './utils/translations';
import { SignatureFooter } from './components/SignatureFooter';

// Lazy load modals and views
const StatsSection = React.lazy(() => import('./components/StatsSection').then(m => ({ default: m.StatsSection })));
const SuccessScreen = React.lazy(() => import('./components/SuccessScreen').then(m => ({ default: m.SuccessScreen })));
const BookingDetailsModal = React.lazy(() => import('./components/BookingDetailsModal').then(m => ({ default: m.BookingDetailsModal })));
const EditBookingModal = React.lazy(() => import('./components/EditBookingModal').then(m => ({ default: m.EditBookingModal })));
const CalendarView = React.lazy(() => import('./components/CalendarView').then(m => ({ default: m.CalendarView })));
import { LoginScreen } from './components/LoginScreen';
const EmployeeManagement = React.lazy(() => import('./components/EmployeeManagement').then(m => ({ default: m.EmployeeManagement })));

type ModalState = 
  | { type: 'details'; booking: Booking }
  | { type: 'edit'; booking: Booking }
  | { type: 'success'; booking: Booking }
  | null;

const MainAppContent: React.FC = () => {
  const { showToast } = useToast();
  
  // Bookings Data State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Unified Overlays State
  const [activeModal, setActiveModal] = useState<ModalState>(null);

  // Navigation tab: 'bookings' | 'employees'
  const [activeTab, setActiveTab] = useState<'bookings' | 'employees'>('bookings');

  // View Mode: list vs calendar
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Supabase Auth and Role states
  const [session, setSession] = useState<Session | null>(null);
  const [authStatus, setAuthStatus] = useState<'verifying' | 'unauthenticated' | 'authenticated' | 'under_review' | 'disabled' | 'error'>('verifying');
  const [authErrorMessage, setAuthErrorMessage] = useState<string>('');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('unassigned');
  const [currentUserFullName, setCurrentUserFullName] = useState<string>('');

  const handleViewDetails = useCallback((booking: Booking) => {
    setActiveModal({ type: 'details', booking });
  }, []);

  const handleEditTime = useCallback((booking: Booking) => {
    setActiveModal({ type: 'edit', booking });
  }, []);

  // Verify session and fetch role from warzone_user_roles silently and accurately
  const verifySessionAndRole = useCallback(async (currentSession: Session | null) => {
    if (!currentSession?.user) {
      setSession(null);
      setCurrentUserRole('unassigned');
      setCurrentUserFullName('');
      setAuthStatus('unauthenticated');
      return;
    }

    setSession(currentSession);

    try {
      const { data, error } = await supabase
        .from('warzone_user_roles')
        .select('role, full_name, is_active')
        .eq('user_id', currentSession.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile from warzone_user_roles:', error);
        setAuthErrorMessage('تعذر التحقق من صلاحيات الحساب. يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً.');
        setAuthStatus('error');
        return;
      }

      if (!data) {
        setCurrentUserRole('unassigned');
        setCurrentUserFullName('');
        setAuthStatus('under_review');
        return;
      }

      if (data.is_active === false) {
        setCurrentUserRole('unassigned');
        setCurrentUserFullName(data.full_name || '');
        setAuthStatus('disabled');
        return;
      }

      const role = data.role as UserRole;
      if (role === 'admin' || role === 'manager' || role === 'employee') {
        setCurrentUserRole(role);
        setCurrentUserFullName(data.full_name || '');
        setAuthStatus('authenticated');
      } else {
        setCurrentUserRole('unassigned');
        setCurrentUserFullName(data.full_name || '');
        setAuthStatus('under_review');
      }
    } catch (err) {
      console.error('Unexpected error during session verification:', err);
      setAuthErrorMessage('حدث خطأ غير متوقع أثناء التحقق من الصلاحيات.');
      setAuthStatus('error');
    }
  }, []);

  // Check Supabase Auth Session on startup and listen to updates
  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) {
        verifySessionAndRole(session);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return;
      if (isMounted) {
        verifySessionAndRole(session);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [verifySessionAndRole]);

  // Fetch bookings from public.warzone_bookings
  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await bookingsService.getBookings();
      setBookings(data);
    } catch (err: unknown) {
      const e = err as Error;
      console.error('Error fetching War Zone bookings:', e);
      showToast(e.message || 'حدث خطأ أثناء تحميل بيانات الحجوزات من الخادم', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Load bookings and set up Supabase Realtime on public.warzone_bookings
  useEffect(() => {
    if (!session) return;

    const timer = setTimeout(() => {
      fetchBookings();
    }, 0);

    // Setup Postgres Realtime Channel for warzone_bookings table
    const channel = supabase
      .channel('realtime-warzone-bookings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'warzone_bookings' },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;
          
          if (eventType === 'INSERT') {
            const row = newRecord as Record<string, unknown>;
            if (row?.id) {
              bookingsService.getBookingById(String(row.id)).then((fresh) => {
                if (fresh) {
                  setBookings((prev) => {
                    if (prev.some(b => b.id === fresh.id)) return prev;
                    const updated = [...prev, fresh];
                    return updated.sort((a, b) => {
                      if (a.booking_date !== b.booking_date) {
                        return a.booking_date.localeCompare(b.booking_date);
                      }
                      return compareTimeSlots(a.booking_time, b.booking_time);
                    });
                  });
                } else {
                  fetchBookings();
                }
              }).catch(() => fetchBookings());
            } else {
              fetchBookings();
            }
          } else if (eventType === 'UPDATE') {
            const row = newRecord as Record<string, unknown>;
            if (row?.id) {
              bookingsService.getBookingById(String(row.id)).then((fresh) => {
                if (fresh) {
                  setBookings((prev) =>
                    prev.map((b) => (b.id === fresh.id ? fresh : b))
                  );
                  setActiveModal((current) => {
                    if (current && current.booking.id === fresh.id) {
                      return { ...current, booking: fresh };
                    }
                    return current;
                  });
                } else {
                  fetchBookings();
                }
              }).catch(() => fetchBookings());
            } else {
              fetchBookings();
            }
          } else if (eventType === 'DELETE') {
            const deletedId = oldRecord?.id;
            if (deletedId) {
              setBookings((prev) => prev.filter((b) => b.id !== deletedId));
              setActiveModal((current) => {
                if (current && current.booking.id === deletedId) {
                  return null;
                }
                return current;
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [fetchBookings, session]);

  // Actions
  const handleConfirmBooking = useCallback(async (booking: Booking) => {
    try {
      const updated = await bookingsService.confirmBooking(booking.id);
      setBookings(prev => prev.map(b => b.id === updated.id ? updated : b));
      showToast("تم تأكيد حجز الفعالية بنجاح", "success");
    } catch (err: unknown) {
      const e = err as Error;
      console.error('Error confirming booking:', e);
      showToast(e.message || "فشلت عملية تأكيد الحجز", "error");
    }
  }, [showToast]);

  const handleCompleteBooking = useCallback(async (booking: Booking) => {
    try {
      const updated = await bookingsService.completeBooking(booking.id);
      setBookings(prev => prev.map(b => b.id === updated.id ? updated : b));
      showToast("تم إتمام وتنفيذ الحجز بنجاح", "success");
    } catch (err: unknown) {
      const e = err as Error;
      console.error('Error completing booking:', e);
      showToast(e.message || "فشلت عملية إتمام الحجز", "error");
    }
  }, [showToast]);

  const handleCancelBooking = useCallback(async (booking: Booking) => {
    if (!window.confirm(`هل أنت متأكد من إلغاء حجز (${booking.customer_name})؟`)) {
      return;
    }
    try {
      const updated = await bookingsService.cancelBooking(booking.id);
      setBookings(prev => prev.map(b => b.id === updated.id ? updated : b));
      showToast("تم إلغاء حجز الفعالية", "warning");
    } catch (err: unknown) {
      const e = err as Error;
      console.error('Error canceling booking:', e);
      showToast(e.message || "فشل إلغاء الحجز", "error");
    }
  }, [showToast]);

  const handleEditBookingSave = useCallback(async (bookingId: string, updatedFields: Partial<Booking>) => {
    try {
      const updated = await bookingsService.updateBooking(bookingId, updatedFields);
      setBookings(prev => prev.map(b => b.id === updated.id ? updated : b));
      setActiveModal(null);
      showToast("تم تعديل بيانات وموعد الحجز بنجاح", "success");
    } catch (err: unknown) {
      const e = err as Error;
      console.error('Error saving edited booking:', e);
      showToast(e.message || "فشل تحديث الحجز، يرجى التحقق من توفر الساعة المحددة", "error");
    }
  }, [showToast]);

  const handleCreateBooking = useCallback(async (bookingData: {
    customer_name: string;
    phone: string;
    number_of_people: number;
    category: BookingCategory;
    booking_date: string;
    booking_time: string;
    status: BookingDbStatus;
    notes: string;
  }) => {
    try {
      const result = await bookingsService.createBooking(bookingData);
      if (result) {
        setBookings(prev => {
          if (prev.some(b => b.id === result.id)) {
            return prev.map(b => b.id === result.id ? result : b);
          }
          return [...prev, result].sort((a, b) => 
            a.booking_date.localeCompare(b.booking_date) || compareTimeSlots(a.booking_time, b.booking_time)
          );
        });
        setActiveModal({ type: 'success', booking: result });
        showToast("تم تسجيل وتأكيد الحجز بنجاح في War Zone", "success");
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : '';
      showToast(errorMsg || "فشل تسجيل الحجز في قاعدة البيانات.", "error");
    }
  }, [showToast]);

  const handleDeleteBooking = useCallback(async (id: string) => {
    try {
      const ok = await bookingsService.deleteBooking(id);
      if (ok) {
        setBookings(prev => prev.filter(b => b.id !== id));
        setActiveModal(curr => (curr && curr.booking.id === id ? null : curr));
        showToast("تم حذف الحجز نهائياً من قاعدة البيانات بنجاح", "success");
      } else {
        showToast("فشلت عملية الحذف", "error");
      }
    } catch (err: unknown) {
      const e = err as Error;
      console.error('Error deleting booking:', e);
      showToast(e.message || "فشل حذف الحجز", "error");
    }
  }, [showToast]);

  // Handle Drag & Drop Reschedule in Calendar View
  const handleReschedule = useCallback(async (booking: Booking, newDate: string, newSlot: string) => {
    const isOccupied = bookings.some(
      b => b.id !== booking.id && 
           b.booking_date === newDate && 
           b.booking_time === newSlot && 
           b.status !== 'cancelled'
    );

    if (isOccupied) {
      showToast("هذا الموعد محجوز لفعالية أخرى بالفعل! اختر موعداً متاحاً.", "error");
      return;
    }

    try {
      const updated = await bookingsService.rescheduleBooking(booking.id, newDate, newSlot);
      setBookings(prev => prev.map(b => b.id === updated.id ? updated : b));
      showToast(`تم تعديل موعد حجز (${booking.customer_name}) إلى ${newDate} بنجاح`, "success");
    } catch (err: unknown) {
      const e = err as Error;
      console.error('Error rescheduling booking:', e);
      showToast(e.message || "فشلت عملية إعادة الجدولة", "error");
    }
  }, [bookings, showToast]);

  // Smooth footer navigation handler
  const handleFooterNav = useCallback((target: 'dashboard' | 'bookings' | 'calendar') => {
    setActiveTab('bookings');
    if (target === 'dashboard') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (target === 'bookings') {
      setViewMode('list');
      setTimeout(() => {
        const el = document.getElementById('bookings-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }
      }, 50);
    } else if (target === 'calendar') {
      setViewMode('calendar');
      setTimeout(() => {
        const el = document.getElementById('bookings-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }
      }, 50);
    }
  }, []);

  // Date constants
  const todayStr = useMemo(() => getTodayRiyadhStr(), []);
  const next7DaysStr = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }
    return dates;
  }, []);

  const isCancelled = (status: string) => 
    status === 'cancelled' || status === 'ملغي';

  // 1. Today's Bookings
  const todaysAppointments = useMemo(() => {
    return bookings
      .filter(b => b.booking_date === todayStr && !isCancelled(b.status))
      .sort((a, b) => compareTimeSlots(a.booking_time, b.booking_time));
  }, [bookings, todayStr]);

  // 2. Upcoming Schedule Widget (Next 7 days)
  const upcoming7DaysBookings = useMemo(() => {
    return bookings
      .filter(b => next7DaysStr.includes(b.booking_date) && !isCancelled(b.status))
      .sort((a, b) => {
        if (a.booking_date !== b.booking_date) {
          return a.booking_date.localeCompare(b.booking_date);
        }
        return compareTimeSlots(a.booking_time, b.booking_time);
      });
  }, [bookings, next7DaysStr]);

  // 3. Filtered List for main dashboard feed
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const q = searchQuery.trim().toLowerCase();
      const matchSearch = q === '' || 
        b.customer_name.toLowerCase().includes(q) || 
        b.phone.includes(q) ||
        (b.category && b.category.toLowerCase().includes(q)) ||
        (b.notes && b.notes.toLowerCase().includes(q));
      
      const matchStatus = statusFilter === '' || b.status === statusFilter;
      const matchCategory = categoryFilter === '' || b.category === categoryFilter;
      const matchDate = dateFilter === '' || b.booking_date === dateFilter;

      return matchSearch && matchStatus && matchCategory && matchDate;
    });
  }, [bookings, searchQuery, statusFilter, categoryFilter, dateFilter]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('');
    setCategoryFilter('');
    setDateFilter('');
    showToast("تم إعادة تعيين الفلاتر", "success");
  }, [showToast]);

  // Export Bookings Database to CSV
  const handleExportCSV = useCallback(() => {
    if (filteredBookings.length === 0) {
      showToast("لا توجد حجوزات لتصديرها حالياً", "warning");
      return;
    }

    const headers = [
      "اسم العميل الكامل",
      "رقم الجوال",
      "عدد الأفراد المشاركين",
      "فئة الحجز",
      "تاريخ الحجز",
      "الموعد المحدد",
      "حالة الحجز",
      "ملاحظات إضافية"
    ];

    const escapeCSVField = (val: string | number | null | undefined) => {
      if (val === null || val === undefined) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvRows = [headers.join(",")];

    filteredBookings.forEach((b) => {
      const row = [
        escapeCSVField(b.customer_name),
        escapeCSVField(b.phone),
        escapeCSVField(b.number_of_people || 1),
        escapeCSVField(b.category),
        escapeCSVField(b.booking_date),
        escapeCSVField(b.booking_time),
        escapeCSVField(b.status),
        escapeCSVField(b.notes)
      ];
      csvRows.push(row.join(","));
    });

    const csvContent = csvRows.join("\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `war_zone_bookings_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("تم تصدير ملف الحجوزات بنجاح", "success");
  }, [filteredBookings, showToast]);

  // Sign out
  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      showToast("تم تسجيل الخروج بنجاح", "success");
    } catch (err) {
      console.error('Logout error:', err);
      showToast("فشلت عملية تسجيل الخروج", "error");
    }
  }, [showToast]);

  const handleViewMyBooking = useCallback(() => {
    if (activeModal && activeModal.type === 'success') {
      setActiveModal({ type: 'details', booking: activeModal.booking });
    }
  }, [activeModal]);

  const handleBookAnother = useCallback(() => {
    setActiveModal(null);
  }, []);

  // WhatsApp link template
  const getWhatsAppLink = (b: Booking) => {
    const displayDate = formatArabicDate(b.booking_date);
    const displayTime = formatArabicTime(b.booking_time);
    const rawMessage = `السلام عليكم،\n\nمعك War Zone.\n\nنود تأكيد حجزكم لعدد ${b.number_of_people} أفراد بتاريخ ${displayDate}\nالساعة ${displayTime}.\n\nأهلاً بكم في War Zone!`;
    const encodedMessage = encodeURIComponent(rawMessage);
    
    let cleanPhone = (b.phone || '').replace(/\D/g, '');
    if (cleanPhone.startsWith('05')) {
      cleanPhone = '966' + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith('5')) {
      cleanPhone = '966' + cleanPhone;
    }
    
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  };

  const canDelete = currentUserRole === 'admin' || currentUserRole === 'manager';
  const isAdmin = currentUserRole === 'admin';
  const isManager = currentUserRole === 'manager';
  const canAccessEmployeeManagement = isAdmin || isManager;

  // 1. Silent initial verification: Neutral stable shell without any visible spinners or loading text
  if (authStatus === 'verifying') {
    return <div className="min-h-screen bg-slate-50" />;
  }

  // 2. Unauthenticated: Render Login directly with zero artificial delay
  if (authStatus === 'unauthenticated' || !session) {
    return (
      <LoginScreen 
        onLoginSuccess={() => {
          supabase.auth.getSession().then(({ data: { session } }) => {
            verifySessionAndRole(session);
          });
        }} 
      />
    );
  }

  // 3. Deactivated account screen
  if (authStatus === 'disabled') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center" dir="rtl">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
            <FiAlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-slate-900">تم تعطيل الحساب</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            تم إيقاف حسابك من قبل مسؤول النظام. يرجى التواصل مع الإدارة لإعادة تفعيل الحساب.
          </p>
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer mt-2"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    );
  }

  // 4. Verification connection error (never falsely treat user as unassigned)
  if (authStatus === 'error') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center" dir="rtl">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <FiAlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-slate-900">تعذر التحقق من الحساب</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {authErrorMessage || 'حدث خطأ أثناء الاتصال بالخادم للتحقق من صلاحيات الحساب. يرجى التأكد من اتصال الإنترنت والمحاولة مرة أخرى.'}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => {
                setAuthStatus('verifying');
                supabase.auth.getSession().then(({ data: { session } }) => verifySessionAndRole(session));
              }}
              className="btn-primary-luxury px-5 py-2.5 text-xs font-bold cursor-pointer"
            >
              إعادة المحاولة
            </button>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. Account Under Review: ONLY when confirmed unassigned in database
  if (authStatus === 'under_review' || currentUserRole === 'unassigned') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center" dir="rtl">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <FiAlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-slate-900">حسابك قيد المراجعة</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            تم تسجيل دخولك بنجاح ولكن لم يتم تعيين صلاحية الوصول لحسابك بعد.
            يرجى التواصل مع مسؤول النظام لتفعيل صلاحيات الوصول الخاصة بك.
          </p>
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer mt-2"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between w-full">
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-5 lg:px-8 flex flex-col gap-6 pt-5 pb-8 box-border">
        
        {/* Nav Header in Clean Light Style */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 lg:px-6 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-4">
            <Logo size="md" variant="horizontal" />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Navigation Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('bookings')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'bookings' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                جدول الحجوزات
              </button>
              
              {canAccessEmployeeManagement && (
                <button
                  type="button"
                  onClick={() => setActiveTab('employees')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'employees' 
                      ? 'bg-white text-slate-900 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FiShield className="w-3.5 h-3.5 text-red-600" />
                  <span>{isAdmin ? 'إدارة الموظفين' : 'إضافة موظف'}</span>
                </button>
              )}
            </div>

            {/* Authenticated User Identity */}
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/90 px-3.5 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" title="متصل" />
              <div className="flex flex-col text-right leading-tight">
                <span className="text-xs font-black text-slate-900">
                  {currentUserFullName || (currentUserRole === 'admin' ? 'مسؤول النظام' : currentUserRole === 'manager' ? 'مدير' : 'موظف')}
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {currentUserRole === 'admin' 
                    ? 'مسؤول النظام' 
                    : currentUserRole === 'manager' 
                    ? 'مدير' 
                    : 'موظف'}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-xl transition-all cursor-pointer outline-none"
            >
              <FiLogOut className="w-3.5 h-3.5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </header>

        {/* Tab 2: Employee Management Page (Admin: Full Management, Manager: Create Employee Only) */}
        {activeTab === 'employees' && canAccessEmployeeManagement && (
          <React.Suspense fallback={
            <div className="p-8 text-center text-slate-400 text-xs font-bold">
              جاري تحميل إدارة الموظفين...
            </div>
          }>
            <EmployeeManagement 
              currentUserId={session.user.id} 
              currentUserRole={currentUserRole}
            />
          </React.Suspense>
        )}

        {/* Tab 1: Bookings Management Dashboard */}
        {activeTab === 'bookings' && (
          <>
            {/* 1. Statistics & Metrics Panel */}
            {isLoading ? (
              <StatsSkeleton />
            ) : (
              <React.Suspense fallback={<StatsSkeleton />}>
                <StatsSection bookings={bookings} />
              </React.Suspense>
            )}

            {/* 2. Today's Appointments Section */}
            <div className="w-full flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-slate-900">
                  <div className="w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
                    <FiClock className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900">حجوزات وجدول اليوم ({todaysAppointments.length})</h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  {formatArabicDate(todayStr)}
                </span>
              </div>
              
              {todaysAppointments.length === 0 ? (
                <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-xs font-medium text-slate-400">
                  لا توجد حجوزات مسجلة لتاريخ اليوم.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {todaysAppointments.map(appointment => {
                    const displayTime = formatArabicTime(appointment.booking_time);
                    const peopleText = formatPeopleCount(appointment.number_of_people);
                    const categoryIcon = getCategoryIcon(appointment.category);

                    return (
                      <div
                        key={appointment.id}
                        className="p-4 bg-white border border-slate-200/90 rounded-xl shadow-xs flex items-center justify-between gap-3 relative overflow-hidden card-hover-effect"
                      >
                        {/* Time indicator band */}
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-red-600" />
                        
                        <div className="flex flex-col gap-1 min-w-0 pr-1.5">
                          <span className="text-sm font-bold text-slate-900 truncate">{appointment.customer_name}</span>
                          <span className="text-[11px] text-slate-500 font-semibold truncate flex items-center gap-1">
                            <FiUsers className="w-3 h-3 text-slate-400" />
                            <span>{peopleText}</span>
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                              <FiClock className="w-3 h-3" />
                              <span>{displayTime}</span>
                            </span>
                            <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {categoryIcon} {appointment.category}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {/* Call */}
                          <a
                            href={`tel:${appointment.phone}`}
                            className="p-2 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center"
                            title="اتصال هاتفي"
                          >
                            <FiPhone className="w-3.5 h-3.5" />
                          </a>
                          {/* WhatsApp */}
                          <a
                            href={getWhatsAppLink(appointment)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors flex items-center justify-center"
                            title="تأكيد واتساب"
                          >
                            <FiMessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Upcoming Schedule Widget (Next 7 Days Overview) */}
            <div className="w-full flex flex-col gap-3">
              <div className="flex items-center gap-2 px-1 text-slate-900">
                <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                  <FiCalendar className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">جدول الأيام السبعة القادمة ({upcoming7DaysBookings.length})</h3>
              </div>

              {upcoming7DaysBookings.length === 0 ? (
                <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-xs font-medium text-slate-400">
                  لا توجد حجوزات قادمة خلال الـ 7 أيام القادمة.
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin max-w-full">
                  {upcoming7DaysBookings.map(b => {
                    const displayDate = formatArabicDate(b.booking_date);
                    const displayTime = formatArabicTime(b.booking_time);
                    const peopleText = formatPeopleCount(b.number_of_people);
                    const categoryIcon = getCategoryIcon(b.category);

                    return (
                      <div 
                        key={b.id}
                        className="flex-shrink-0 w-[240px] p-3.5 bg-white border border-slate-200/90 rounded-xl flex flex-col gap-1.5 shadow-xs"
                      >
                        <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                          <span className="text-[10px] font-bold text-slate-500">{displayDate}</span>
                          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{displayTime}</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-slate-900 truncate">{b.customer_name}</span>
                          <span className="text-[11px] text-slate-500 font-semibold truncate flex items-center gap-1 mt-0.5">
                            <FiUsers className="w-3 h-3 text-slate-400" />
                            <span>{peopleText}</span>
                          </span>
                          <span className="text-[10px] text-slate-700 font-bold truncate mt-1">
                            {categoryIcon} {b.category}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 4. Quick Add Booking Form */}
            <div className="w-full flex flex-col gap-4">
              <BookingForm bookings={bookings} onSubmitBooking={handleCreateBooking} />
            </div>

            {/* 5. Main Bookings List & Controls */}
            <div id="bookings-section" className="w-full flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2 text-slate-900">
                  <FiLayout className="w-4 h-4 text-red-600" />
                  <h3 className="text-sm font-extrabold text-slate-900">قاعدة بيانات الحجوزات والمتابعة</h3>
                </div>

                {/* View Mode Toggle */}
                <div className="flex bg-slate-100 p-1 rounded-xl items-center border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all outline-none cursor-pointer ${
                      viewMode === 'list' 
                        ? 'bg-white text-slate-900 shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    عرض القائمة
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('calendar')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all outline-none cursor-pointer ${
                      viewMode === 'calendar' 
                        ? 'bg-white text-slate-900 shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    الجدول الزمني
                  </button>
                </div>
              </div>

              {/* Filters */}
              <FilterToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                categoryFilter={categoryFilter}
                onCategoryChange={setCategoryFilter}
                dateFilter={dateFilter}
                onDateChange={setDateFilter}
                onClearFilters={handleClearFilters}
                onExport={handleExportCSV}
              />

              {/* Bookings Card feed or Calendar View */}
              {isLoading ? (
                <BookingCardSkeleton />
              ) : viewMode === 'calendar' ? (
                <React.Suspense fallback={<BookingCardSkeleton />}>
                  <CalendarView
                    bookings={filteredBookings}
                    onViewDetails={handleViewDetails}
                    onEditTime={handleEditTime}
                    onReschedule={handleReschedule}
                  />
                </React.Suspense>
              ) : filteredBookings.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="flex flex-col gap-3">
                  {/* Desktop headers */}
                  <div className="hidden lg:grid lg:grid-cols-[240px_150px_160px_160px_140px_auto] lg:gap-4 px-4 text-xs font-bold text-slate-400 tracking-wider">
                    <div>العميل ورقم التواصل</div>
                    <div>عدد الأفراد</div>
                    <div>فئة الحجز</div>
                    <div>التاريخ والوقت</div>
                    <div className="text-center">الحالة</div>
                    <div className="text-center">الإجراءات والتواصل</div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {filteredBookings.map(booking => (
                      <BookingCardRow
                        key={booking.id}
                        booking={booking}
                        onViewDetails={handleViewDetails}
                        onEditTime={handleEditTime}
                        onConfirm={handleConfirmBooking}
                        onComplete={handleCompleteBooking}
                        onCancel={handleCancelBooking}
                        onDelete={handleDeleteBooking}
                        canDelete={canDelete}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Modern Light SaaS Footer */}
      <SignatureFooter onNavigate={handleFooterNav} />

      {/* Modals & Screens */}
      {activeModal?.type === 'success' && (
        <React.Suspense fallback={null}>
          <SuccessScreen
            booking={activeModal.booking}
            onViewBooking={handleViewMyBooking}
            onBookAnother={handleBookAnother}
          />
        </React.Suspense>
      )}

      {activeModal?.type === 'details' && (
        <React.Suspense fallback={null}>
          <BookingDetailsModal
            booking={activeModal.booking}
            onClose={() => setActiveModal(null)}
          />
        </React.Suspense>
      )}

      {activeModal?.type === 'edit' && (
        <React.Suspense fallback={null}>
          <EditBookingModal
            booking={activeModal.booking}
            bookings={bookings}
            onClose={() => setActiveModal(null)}
            onSave={handleEditBookingSave}
          />
        </React.Suspense>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <MainAppContent />
    </ToastProvider>
  );
};

export default App;
