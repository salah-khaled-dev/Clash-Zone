import React from 'react';
import { FiSearch, FiRotateCcw, FiFilter, FiShare2, FiTag, FiClock, FiCalendar } from 'react-icons/fi';
import { translateStatus } from '../utils/translations';
import { ClashZone_CATEGORIES } from '../types/booking';
import type { BookingDbStatus } from '../types/booking';

interface FilterToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  categoryFilter: string;
  onCategoryChange: (category: string) => void;
  dateFilter: string;
  onDateChange: (date: string) => void;
  onClearFilters: () => void;
  onExport: () => void;
}

const ClashZone_STATUS_FILTERS: { value: BookingDbStatus | ''; label: string }[] = [
  { value: '', label: 'كل الحالات' },
  { value: 'pending', label: translateStatus('pending') },
  { value: 'confirmed', label: translateStatus('confirmed') },
  { value: 'completed', label: translateStatus('completed') },
  { value: 'cancelled', label: translateStatus('cancelled') },
];

export const FilterToolbar = React.memo<FilterToolbarProps>(({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  dateFilter,
  onDateChange,
  onClearFilters,
  onExport,
}) => {
  const activeFiltersCount = [
    statusFilter,
    categoryFilter,
    dateFilter,
  ].filter(Boolean).length;

  return (
    <div className="bg-white p-4 lg:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col gap-4 w-full box-border">
      {/* Upper Row: Search & Action buttons */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch justify-between">
        {/* Search */}
        <div className="relative flex-grow max-w-lg">
          <span className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
            <FiSearch className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="بحث بالاسم، رقم الجوال، أو الفئة..."
            className="w-full pl-4 pr-10 h-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all outline-none"
          />
        </div>

        {/* Filters Count & Action Buttons */}
        <div className="flex items-center gap-2 justify-end flex-wrap">
          {activeFiltersCount > 0 && (
            <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 h-10 rounded-xl flex items-center gap-1.5">
              <FiFilter className="w-3.5 h-3.5 text-red-600" />
              <span>فلاتر نشطة: {new Intl.NumberFormat('ar-EG').format(activeFiltersCount)}</span>
            </span>
          )}

          {(activeFiltersCount > 0 || searchQuery) && (
            <button
              type="button"
              onClick={onClearFilters}
              className="flex items-center gap-1.5 px-3.5 h-10 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-200 rounded-xl transition-all cursor-pointer outline-none"
            >
              <FiRotateCcw className="w-3.5 h-3.5" />
              <span>إعادة تعيين</span>
            </button>
          )}

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={onExport}
            className="flex items-center gap-1.5 px-3.5 h-10 text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl transition-all outline-none cursor-pointer shadow-sm"
          >
            <FiShare2 className="w-3.5 h-3.5 text-slate-500" />
            <span>تصدير البيانات (CSV)</span>
          </button>
        </div>
      </div>

      {/* Lower Row: Filter Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Status */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-slate-600 pr-1 flex items-center gap-1">
            <FiClock className="w-3.5 h-3.5 text-slate-400" />
            <span>حالة الحجز</span>
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 h-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all cursor-pointer outline-none"
          >
            {ClashZone_STATUS_FILTERS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-slate-600 pr-1 flex items-center gap-1">
            <FiTag className="w-3.5 h-3.5 text-slate-400" />
            <span>فئة الحجز</span>
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 h-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all cursor-pointer outline-none"
          >
            <option value="">كل الفئات</option>
            {ClashZone_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-slate-600 pr-1 flex items-center gap-1">
            <FiCalendar className="w-3.5 h-3.5 text-slate-400" />
            <span>تاريخ الحجز المحدد</span>
          </label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full px-3 h-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all cursor-pointer outline-none"
          />
        </div>
      </div>
    </div>
  );
});

export default FilterToolbar;
