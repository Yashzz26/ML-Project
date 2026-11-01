import React from 'react';
import { Database, CheckCircle2, Users } from 'lucide-react';

export default function Header() {
  return (
    <header className="px-8 py-3.5 flex items-center justify-between border-b border-purple-100/60 bg-white/70 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center space-x-2">
        <h1 className="text-xs sm:text-sm font-semibold text-slate-700 tracking-tight">
          E-Commerce Customer Segmentation using K-Means++
        </h1>
      </div>

      <div className="flex items-center space-x-4 text-xs font-medium text-slate-600">
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100/80 text-slate-700 border border-slate-200/60">
          <Database className="w-3.5 h-3.5 text-slate-500" />
          <span>Mall Customer Dataset</span>
        </div>

        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>200 Records</span>
        </div>

        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200/60">
          <Users className="w-3.5 h-3.5 text-purple-600" />
          <span>CCE-IV</span>
        </div>
      </div>
    </header>
  );
}
