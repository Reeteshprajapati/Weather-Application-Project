import React from 'react';

export default function LoadingSkeleton() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      
      {/* Current Weather Card Skeleton */}
      <div className="w-full bg-card rounded-2xl border border-line shadow-card p-6 sm:p-8">
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <div className="h-4 w-28 bg-[#EAE6DC] rounded"></div>
            <div className="h-9 w-48 bg-[#D8D3C8] rounded"></div>
            <div className="h-3.5 w-36 bg-[#EAE6DC] rounded"></div>
          </div>
          <div className="h-7 w-24 bg-[#EAE6DC] rounded-full"></div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="h-16 w-36 bg-[#D8D3C8] rounded-xl"></div>
          <div className="h-14 w-52 bg-[#FAF8F5] border border-line rounded-xl hidden sm:block"></div>
        </div>

        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-24 bg-[#FAF8F5] border border-line rounded-xl"></div>
          <div className="h-24 bg-[#FAF8F5] border border-line rounded-xl"></div>
          <div className="h-24 bg-[#FAF8F5] border border-line rounded-xl"></div>
          <div className="h-24 bg-[#FAF8F5] border border-line rounded-xl"></div>
        </div>
      </div>

      {/* Recommendations Skeleton */}
      <div className="w-full bg-card rounded-2xl border border-line shadow-card p-6 sm:p-7">
        <div className="h-5 w-48 bg-[#EAE6DC] rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="h-24 bg-[#FAF8F5] border border-line rounded-xl"></div>
          <div className="h-24 bg-[#FAF8F5] border border-line rounded-xl"></div>
        </div>
      </div>

      {/* Hourly Forecast Skeleton */}
      <div className="w-full bg-card rounded-2xl border border-line shadow-card p-6">
        <div className="h-5 w-36 bg-[#EAE6DC] rounded mb-4"></div>
        <div className="flex gap-2.5 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 w-24 bg-[#FAF8F5] border border-line rounded-xl flex-shrink-0"></div>
          ))}
        </div>
      </div>

      {/* Daily Forecast Skeleton */}
      <div className="w-full bg-card rounded-2xl border border-line shadow-card p-6">
        <div className="h-5 w-40 bg-[#EAE6DC] rounded mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-[#FAF8F5] border border-line rounded-lg"></div>
          ))}
        </div>
      </div>

    </div>
  );
}
