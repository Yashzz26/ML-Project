import React from 'react';

export default function Header() {
  return (
    <header className="px-8 py-3.5 flex items-center justify-between border-b border-purple-100/60 bg-white/70 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center space-x-2">
        <h1 className="text-xs sm:text-sm font-semibold text-slate-700 tracking-tight">
          E-Commerce Customer Segmentation using K-Means++
        </h1>
      </div>
    </header>
  );
}
