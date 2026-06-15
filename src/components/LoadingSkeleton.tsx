import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => {
  return (
    <div className={`bg-neutral-250/70 animate-pulse rounded-lg ${className}`} />
  );
};

export const StatsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white p-5 rounded-[24px] border border-neutral-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-3 min-h-[150px]">
          <div className="flex justify-between items-start">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-9 rounded-xl" />
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <Skeleton className="h-8 w-14" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-3 w-16 mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const BookingCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      {[...Array(3)].map((_, i) => (
        <div 
          key={i} 
          className="w-full bg-white border border-neutral-100 rounded-[22px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col md:grid md:grid-cols-[1fr_auto_auto] lg:grid-cols-[300px_220px_200px_150px_60px] lg:items-center gap-4"
        >
          {/* Customer */}
          <div className="flex items-center gap-3.5 w-full justify-start min-w-0">
            <Skeleton className="w-11 h-11 rounded-2xl flex-shrink-0" />
            <div className="flex flex-col gap-1.5 min-w-0 flex-grow max-w-[150px]">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
          
          {/* Service & Branch */}
          <div className="flex flex-row md:flex-col lg:flex-col gap-2 w-full">
            <Skeleton className="h-5 w-24 rounded-xl" />
            <Skeleton className="h-3.5 w-20 rounded-md" />
          </div>
          
          {/* Date & Time */}
          <div className="flex flex-row md:flex-col lg:flex-col gap-2 w-full">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4.5 w-20 rounded-lg" />
          </div>

          {/* Status badge */}
          <div className="flex items-center w-full">
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end w-full">
            <Skeleton className="w-9 h-9 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};
