import React from 'react';
import { FiSearch, FiRotateCcw, FiFilter, FiShare2 } from 'react-icons/fi';
import { translateService, translateStatus, translateBranch } from '../utils/translations';

interface FilterToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  serviceFilter: string;
  onServiceChange: (service: string) => void;
  branchFilter: string;
  onBranchChange: (branch: string) => void;
  dateFilter: string;
  onDateChange: (date: string) => void;
  onClearFilters: () => void;
  onExport: () => void;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  serviceFilter,
  onServiceChange,
  branchFilter,
  onBranchChange,
  dateFilter,
  onDateChange,
  onClearFilters,
  onExport,
}) => {
  // Calculate active filters count
  const activeFiltersCount = [
    statusFilter,
    serviceFilter,
    branchFilter,
    dateFilter,
  ].filter(Boolean).length;

  return (
    <div className="bg-white p-5 rounded-[22px] border border-neutral-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] mb-6 flex flex-col gap-4 w-full box-border">
      {/* Upper Row: Search & Action buttons */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch justify-between">
        {/* Search */}
        <div className="relative flex-grow max-w-lg">
          <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
            <FiSearch className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="بحث عن عميل أو سيارة..."
            className="w-full pl-4 pr-11 h-11 bg-neutral-50 border border-neutral-200/80 rounded-xl text-sm font-semibold focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-all placeholder-gray-400 text-gray-850 outline-none"
          />
        </div>

        {/* Filters Count & Action Buttons */}
        <div className="flex items-center gap-2.5 justify-end">
          {activeFiltersCount > 0 && (
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 h-10 rounded-xl border border-amber-200/40 flex items-center gap-1.5 animate-pulse">
              <FiFilter className="w-4 h-4 text-[#D4A017]" />
              <span>فلاتر نشطة: {new Intl.NumberFormat('ar-EG').format(activeFiltersCount)}</span>
            </span>
          )}

          {(activeFiltersCount > 0 || searchQuery) && (
            <button
              type="button"
              onClick={onClearFilters}
              className="flex items-center gap-1.5 px-4 h-11 text-xs font-bold text-gray-500 hover:text-gray-800 hover:bg-neutral-50 border border-neutral-200 rounded-xl transition-all outline-none"
            >
              <FiRotateCcw className="w-4 h-4" />
              <span>إعادة تعيين</span>
            </button>
          )}

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={onExport}
            className="flex items-center gap-1.5 px-4 h-11 text-xs font-bold bg-[#F4C542] hover:bg-[#E8B923] text-gray-900 border border-[#F4C542]/20 rounded-xl transition-all outline-none cursor-pointer shadow-sm hover:shadow-[#F4C542]/15"
          >
            <FiShare2 className="w-4 h-4" />
            <span>تصدير البيانات (CSV)</span>
          </button>
        </div>
      </div>

      {/* Lower Row: Filter Dropdowns */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Status (Lowercase to match Supabase enum) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-gray-450 pr-1">حالة الحجز</label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 h-11 bg-neutral-50 border border-neutral-200/80 rounded-xl text-xs font-bold text-gray-700 focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-all cursor-pointer outline-none"
          >
            <option value="">كل الحالات</option>
            <option value="pending">{translateStatus("pending")}</option>
            <option value="completed">{translateStatus("completed")}</option>
            <option value="cancelled">{translateStatus("cancelled")}</option>
          </select>
        </div>

        {/* Service */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-gray-450 pr-1">الخدمة المطلوبة</label>
          <select
            value={serviceFilter}
            onChange={(e) => onServiceChange(e.target.value)}
            className="w-full px-3 h-11 bg-neutral-50 border border-neutral-200/80 rounded-xl text-xs font-bold text-gray-700 focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-all cursor-pointer outline-none"
          >
            <option value="">كل الخدمات</option>
            <option value="Paint Protection Film">{translateService("Paint Protection Film")}</option>
            <option value="Nano Ceramic Coating">{translateService("Nano Ceramic Coating")}</option>
            <option value="Thermal Insulation">{translateService("Thermal Insulation")}</option>
          </select>
        </div>

        {/* Branch */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-gray-450 pr-1">الفرع</label>
          <select
            value={branchFilter}
            onChange={(e) => onBranchChange(e.target.value)}
            className="w-full px-3 h-11 bg-neutral-50 border border-neutral-200/80 rounded-xl text-xs font-bold text-gray-700 focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-all cursor-pointer outline-none"
          >
            <option value="">كل الفروع</option>
            <option value="Riyadh">{translateBranch("Riyadh")}</option>
          </select>
        </div>

        {/* Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-gray-450 pr-1">تاريخ اليوم المحدد</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full px-3 h-11 bg-neutral-50 border border-neutral-200/80 rounded-xl text-xs font-bold text-gray-700 focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-all cursor-pointer outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(FilterToolbar);
