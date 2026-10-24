import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => {
  return (
    <div className={`bg-slate-200/80 animate-pulse rounded-md ${className}`} />
  );
};

export const StatsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3 min-h-[110px]">
          <div className="flex justify-between items-start">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <Skeleton className="h-7 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const BookingCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-3">
      {[...Array(3)].map((_, i) => (
        <div 
          key={i} 
          className="w-full bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col lg:grid lg:grid-cols-[240px_150px_160px_160px_140px_auto] lg:items-center gap-3.5"
        >
          {/* Customer */}
          <div className="flex items-center gap-3 w-full justify-start min-w-0">
            <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
            <div className="flex flex-col gap-1.5 min-w-0 flex-grow max-w-[150px]">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
          
          {/* People Count */}
          <div className="flex items-center w-full">
            <Skeleton className="h-7 w-20 rounded-lg" />
          </div>

          {/* Category */}
          <div className="flex items-center w-full">
            <Skeleton className="h-7 w-20 rounded-lg" />
          </div>
          
          {/* Date & Time */}
          <div className="flex flex-col gap-1 w-full">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-4 w-16 rounded-md" />
          </div>

          {/* Status badge */}
          <div className="flex items-center w-full">
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end w-full">
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};
