import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiClock, FiLayout, FiPhone, FiMessageCircle } from 'react-icons/fi';
import { supabase } from './lib/supabase';
import type { Booking, BookingStatus, CustomerSource, CustomerType } from './types/booking';
import { bookingsService } from './services/bookings.service';
import { StatsSection } from './components/StatsSection';
import { FilterToolbar } from './components/FilterToolbar';
import { BookingCardRow } from './components/BookingCardRow';
import { BookingForm } from './components/BookingForm';
import { SuccessScreen } from './components/SuccessScreen';
import { BookingDetailsModal } from './components/BookingDetailsModal';
import { EditBookingModal } from './components/EditBookingModal';
import { EmptyState } from './components/EmptyState';
import { BookingCardSkeleton, StatsSkeleton } from './components/LoadingSkeleton';
import { ToastProvider, useToast } from './components/ToastProvider';
import { Logo } from './components/Logo';
import { formatArabicDate, formatArabicTime, formatVehicleName } from './utils/bookingFormatters';

type ModalState = 
  | { type: 'details'; booking: Booking }
  | { type: 'edit'; booking: Booking }
  | { type: 'success'; booking: Booking }
  | null;

const MainAppContent: React.FC = () => {
  const { showToast } = useToast();
  
  // Internal CRM Dashboard Workflow

  // Bookings Data State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Unified Overlays State
  const [activeModal, setActiveModal] = useState<ModalState>(null);

  // Fetch bookings from Supabase
  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await bookingsService.getBookings();
      setBookings(data);
    } catch (err) {
      console.error('Error fetching bookings from Supabase:', err);
      showToast('حدث خطأ أثناء تحميل بيانات العملاء من الخادم', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Load bookings and set up Supabase Realtime
  useEffect(() => {
    fetchBookings();

    // Setup Postgres Realtime Channel with Incremental State Updates
    const channel = supabase
      .channel('realtime-bookings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          console.log('Postgres realtime event received:', payload);
          const { eventType, new: newRecord, old: oldRecord } = payload;
          
          if (eventType === 'INSERT') {
            const newBooking = newRecord as Booking;
            setBookings((prev) => {
              if (prev.some(b => b.id === newBooking.id)) return prev;
              const updated = [...prev, newBooking];
              return updated.sort((a, b) => {
                if (a.booking_date !== b.booking_date) {
                  return a.booking_date.localeCompare(b.booking_date);
                }
                return a.time_slot.localeCompare(b.time_slot);
              });
            });
          } else if (eventType === 'UPDATE') {
            const updatedBooking = newRecord as Booking;
            setBookings((prev) =>
              prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
            );
            // Sync current modal state if it's viewing the updated booking
            setActiveModal((current) => {
              if (current && current.booking.id === updatedBooking.id) {
                return { ...current, booking: updatedBooking };
              }
              return current;
            });
          } else if (eventType === 'DELETE') {
            const deletedId = oldRecord?.id;
            if (deletedId) {
              setBookings((prev) => prev.filter((b) => b.id !== deletedId));
              // Close modal if the currently selected booking was deleted
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
      supabase.removeChannel(channel);
    };
  }, [fetchBookings]);

  // Actions
  const handleConfirmBooking = useCallback(async (booking: Booking) => {
    try {
      await bookingsService.confirmBooking(booking.id);
      showToast("تم تأكيد الحجز بنجاح وتوثيق التواصل", "success");
    } catch (err) {
      showToast("فشلت عملية تأكيد الحجز", "error");
    }
  }, [showToast]);

  const handleCancelBooking = useCallback(async (booking: Booking) => {
    try {
      await bookingsService.cancelBooking(booking.id);
      showToast("تم إلغاء موعد العميل بنجاح", "warning");
    } catch (err) {
      showToast("فشل إلغاء حجز العميل", "error");
    }
  }, [showToast]);

  const handleEditBookingSave = useCallback(async (bookingId: string, updatedFields: Partial<Booking>) => {
    try {
      await bookingsService.updateBooking(bookingId, updatedFields);
      setActiveModal(null);
      showToast("تم تعديل حجز وسجل العميل بنجاح", "success");
    } catch (err) {
      showToast("فشل تحديث الموعد، يرجى التحقق من توفر الساعة المحددة", "error");
    }
  }, [showToast]);

  const handleCreateBooking = useCallback(async (bookingData: {
    customer_name: string;
    customer_phone: string;
    customer_source: CustomerSource;
    customer_type: CustomerType;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_year: string;
    service_type: string;
    branch_name: string;
    booking_date: string;
    time_slot: string;
    status: BookingStatus;
    notes: string;
  }) => {
    try {
      const result = await bookingsService.createBooking({
        ...bookingData,
        last_contact_date: null,
        next_followup_date: null
      });
      if (result) {
        setActiveModal({ type: 'success', booking: result });
        showToast("تم تسجيل وحفظ حجز العميل الجديد", "success");
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : '';
      if (errorMsg.includes('unique_booking_date_slot')) {
        showToast("خطأ: هذا اليوم والوقت محجوز بالفعل! يرجى اختيار موعد آخر.", "error");
      } else {
        showToast("فشل تسجيل الحجز في قاعدة البيانات.", "error");
      }
    }
  }, [showToast]);

  const handleDeleteBooking = useCallback(async (id: string) => {
    try {
      const ok = await bookingsService.deleteBooking(id);
      if (ok) {
        showToast("تم حذف حجز العميل من قاعدة البيانات بنجاح", "success");
      } else {
        showToast("فشل عملية الحذف", "error");
      }
    } catch (err) {
      showToast("فشل حذف حجز العميل", "error");
    }
  }, [showToast]);

  // Date constants
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const next7DaysStr = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, []);

  // 1. Today's Appointments List (Pinned at the Top)
  const todaysAppointments = useMemo(() => {
    return bookings
      .filter(b => b.booking_date === todayStr && b.status !== 'ملغي')
      .sort((a, b) => a.time_slot.localeCompare(b.time_slot));
  }, [bookings, todayStr]);

  // 2. Upcoming Schedule Widget: Bookings in the next 7 days (including today)
  const upcoming7DaysBookings = useMemo(() => {
    return bookings
      .filter(b => next7DaysStr.includes(b.booking_date) && b.status !== 'ملغي')
      .sort((a, b) => {
        if (a.booking_date !== b.booking_date) {
          return a.booking_date.localeCompare(b.booking_date);
        }
        return a.time_slot.localeCompare(b.time_slot);
      });
  }, [bookings, next7DaysStr]);

  // 3. Memoized Filtered List for main dashboard feed
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      // Search matches
      const matchSearch = searchQuery.trim() === '' || 
        b.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        b.customer_phone.includes(searchQuery) ||
        `${b.vehicle_make} ${b.vehicle_model}`.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter matches
      const matchStatus = statusFilter === '' || b.status === statusFilter;
      const matchService = serviceFilter === '' || b.service_type === serviceFilter;
      const matchDate = dateFilter === '' || b.booking_date === dateFilter;

      return matchSearch && matchStatus && matchService && matchDate;
    });
  }, [bookings, searchQuery, statusFilter, serviceFilter, dateFilter]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('');
    setServiceFilter('');
    setDateFilter('');
    showToast("تم إعادة تعيين الفلاتر بنجاح", "success");
  }, [showToast]);

  const handleViewMyBooking = useCallback(() => {
    if (activeModal && activeModal.type === 'success') {
      setActiveModal({ type: 'details', booking: activeModal.booking });
    }
  }, [activeModal]);

  const handleBookAnother = useCallback(() => {
    setActiveModal(null);
  }, []);

  // Helper to format WhatsApp message templates
  const getWhatsAppLink = (b: Booking) => {
    const displayDate = formatArabicDate(b.booking_date);
    const displayTime = formatArabicTime(b.time_slot);
    const rawMessage = `السلام عليكم،\n\nمعك Infinity Bright.\n\nنود تأكيد موعدكم بتاريخ ${displayDate}\nالساعة ${displayTime}.\n\nشكراً لكم.`;
    const encodedMessage = encodeURIComponent(rawMessage);
    
    let cleanPhone = b.customer_phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('05')) {
      cleanPhone = '966' + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith('5')) {
      cleanPhone = '966' + cleanPhone;
    }
    
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-16 pt-6 w-full relative">
      {/* Ambient backgrounds meshes */}
      <div className="glow-mesh top-[-15%] right-[-10%] w-[500px] h-[500px] bg-[#F4C542]/5" />
      <div className="glow-mesh bottom-[-15%] left-[-10%] w-[500px] h-[500px] bg-[#D4A017]/5" />

      <div className="max-w-[1360px] mx-auto px-6 flex flex-col gap-8 w-full box-border">
        {/* Nav Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200/50 pb-5 z-10">
          <div className="flex items-center gap-4">
            <Logo size="md" variant="horizontal" />
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex items-center gap-2.5 text-xs font-bold text-gray-700 bg-white border border-neutral-100/70 px-4 py-2.5 rounded-2xl shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>نظام إدارة العملاء CRM v3.0</span>
            </div>
          </div>
        </header>

        {/* 1. Statistics & Marketing Analytics Panel */}
        {isLoading ? <StatsSkeleton /> : <StatsSection bookings={bookings} />}

        {/* 2. Pinned Widget: Today's Appointments (مواعيد اليوم) */}
        <div className="w-full flex flex-col gap-4">
          <div className="flex items-center gap-2 px-1 text-emerald-600">
            <FiClock className="w-5 h-5 text-emerald-500 animate-spin-slow" />
            <h3 className="text-sm font-extrabold text-gray-800">مواعيد وجدول اليوم ({todaysAppointments.length})</h3>
          </div>
          
          {todaysAppointments.length === 0 ? (
            <div className="bg-white p-6 rounded-[24px] border border-neutral-150 border-dashed text-center text-xs font-bold text-gray-400">
              لا يوجد مواعيد مسجلة لتاريخ اليوم.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todaysAppointments.map(appointment => {
                const displayTime = formatArabicTime(appointment.time_slot);
                const displayCar = formatVehicleName(`${appointment.vehicle_make} ${appointment.vehicle_model}`);
                return (
                  <motion.div
                    key={appointment.id}
                    whileHover={{ y: -2 }}
                    className="p-4 bg-white border border-neutral-100 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.01)] flex items-center justify-between gap-3 relative overflow-hidden"
                  >
                    {/* Time indicator band */}
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#F4C542]" />
                    
                    <div className="flex flex-col gap-1 min-w-0 pr-1">
                      <span className="text-sm font-extrabold text-gray-900 truncate">{appointment.customer_name}</span>
                      <span className="text-[10px] text-gray-400 font-bold truncate">{displayCar}</span>
                      <div className="flex items-center gap-2.5 mt-1">
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-black flex items-center gap-1">
                          <FiClock className="w-3 h-3 text-[#D4A017]" />
                          <span>{displayTime}</span>
                        </span>
                        <span className="text-[9px] font-black text-gray-500 bg-neutral-50 px-1.5 py-0.5 rounded">
                          {appointment.service_type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* Call */}
                      <a
                        href={`tel:${appointment.customer_phone}`}
                        className="p-2 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl hover:bg-blue-100 transition-all flex items-center justify-center shadow-sm"
                        title="اتصال هاتفي"
                      >
                        <FiPhone className="w-4 h-4" />
                      </a>
                      {/* WhatsApp */}
                      <a
                        href={getWhatsAppLink(appointment)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all flex items-center justify-center shadow-sm"
                        title="تأكيد واتساب"
                      >
                        <FiMessageCircle className="w-4 h-4" />
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Upcoming Schedule Widget (Next 7 Days Calendar Overview) */}
        <div className="w-full flex flex-col gap-4">
          <div className="flex items-center gap-2 px-1 text-purple-600">
            <FiCalendar className="w-5 h-5 text-purple-500" />
            <h3 className="text-sm font-extrabold text-gray-800">جدول الأيام السبعة القادمة ({upcoming7DaysBookings.length})</h3>
          </div>

          {upcoming7DaysBookings.length === 0 ? (
            <div className="bg-white p-6 rounded-[24px] border border-neutral-150 border-dashed text-center text-xs font-bold text-gray-400">
              لا توجد مواعيد قادمة خلال الـ 7 أيام القادمة.
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin max-w-full">
              {upcoming7DaysBookings.map(b => {
                const displayDate = formatArabicDate(b.booking_date);
                const displayTime = formatArabicTime(b.time_slot);
                return (
                  <div 
                    key={b.id}
                    className="flex-shrink-0 w-[240px] p-4 bg-white border border-neutral-100 rounded-2xl flex flex-col gap-2 shadow-[0_2px_10px_rgba(0,0,0,0.01)]"
                  >
                    <div className="flex justify-between items-center border-b border-neutral-50 pb-1.5">
                      <span className="text-[10px] font-black text-gray-400">{displayDate}</span>
                      <span className="text-[9px] font-black text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">{displayTime}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-xs font-extrabold text-gray-900 truncate">{b.customer_name}</span>
                      <span className="text-[10px] text-gray-500 font-bold truncate">{b.vehicle_make} {b.vehicle_model}</span>
                      <span className="text-[9px] text-[#D4A017] font-black truncate mt-1">⚡ {b.service_type}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Quick Add Booking Card (Internal Dashboard Entry) */}
        <div className="w-full flex flex-col gap-4">
          <BookingForm bookings={bookings} onSubmitBooking={handleCreateBooking} />
        </div>

        {/* 5. Main Bookings List & Controls */}
        <div className="w-full flex flex-col gap-6">
          <div className="flex items-center gap-2 px-1 text-[#D4A017]">
            <FiLayout className="w-5 h-5 text-[#D4A017]" />
            <h3 className="text-sm font-extrabold text-gray-800">قاعدة بيانات الحجوزات والمتابعة</h3>
          </div>

          {/* Filters (No branch filter) */}
          <FilterToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            serviceFilter={serviceFilter}
            onServiceChange={setServiceFilter}
            branchFilter=""
            onBranchChange={() => {}}
            dateFilter={dateFilter}
            onDateChange={setDateFilter}
            onClearFilters={handleClearFilters}
          />

          {/* Bookings Card feed */}
          {isLoading ? (
            <BookingCardSkeleton />
          ) : filteredBookings.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex flex-col gap-4">
              {/* Desktop headers */}
              <div className="hidden lg:grid lg:grid-cols-[260px_160px_160px_140px_130px_150px_auto] lg:gap-4 px-5 text-xs font-black text-gray-400 tracking-wider">
                <div>العميل والسيارة</div>
                <div>المصدر والفئة</div>
                <div>الخدمة</div>
                <div>التاريخ والوقت</div>
                <div>الفرع</div>
                <div className="text-center">الحالة</div>
                <div className="text-center">الإجراءات والاتصال</div>
              </div>

              <motion.div
                layout
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.05 }
                  }
                }}
                className="flex flex-col gap-4"
              >
                {filteredBookings.map(booking => (
                  <BookingCardRow
                    key={booking.id}
                    booking={booking}
                    onViewDetails={(b) => setActiveModal({ type: 'details', booking: b })}
                    onEditTime={(b) => setActiveModal({ type: 'edit', booking: b })}
                    onConfirm={handleConfirmBooking}
                    onCancel={handleCancelBooking}
                    onDelete={handleDeleteBooking}
                  />
                ))}
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Modals & Screens list */}
      <AnimatePresence>
        {/* Success Screen Overlay */}
        {activeModal?.type === 'success' && (
          <SuccessScreen
            booking={activeModal.booking}
            onViewBooking={handleViewMyBooking}
            onBookAnother={handleBookAnother}
          />
        )}

        {/* View Details Modal Overlay */}
        {activeModal?.type === 'details' && (
          <BookingDetailsModal
            booking={activeModal.booking}
            onClose={() => setActiveModal(null)}
          />
        )}

        {/* Edit Booking Modal Overlay */}
        {activeModal?.type === 'edit' && (
          <EditBookingModal
            booking={activeModal.booking}
            bookings={bookings}
            onClose={() => setActiveModal(null)}
            onSave={handleEditBookingSave}
          />
        )}
      </AnimatePresence>
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
