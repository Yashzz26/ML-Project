import React from 'react';
import {
  LayoutDashboard,
  Database,
  BarChart2,
  ScatterChart,
  User,
  SlidersHorizontal,
  Info,
  Download,
  ShoppingCart,
  Store,
  Megaphone,
  UploadCloud,
} from 'lucide-react';
import { apiService } from '../services/api';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'dataset', label: 'Dataset', icon: Database },
  { id: 'eda', label: 'EDA', icon: BarChart2 },
  { id: 'clusters', label: 'Cluster Analysis', icon: ScatterChart },
  { id: 'segmentation', label: 'Customer Analyzer', icon: User },
  { id: 'batch', label: 'Batch Scoring', icon: UploadCloud },
  { id: 'campaign', label: 'ROI Simulator', icon: Megaphone },
  { id: 'evaluation', label: 'Model Evaluation', icon: SlidersHorizontal },
  { id: 'about', label: 'About Project', icon: Info },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="w-64 bg-[#190c33] text-white flex flex-col h-screen sticky top-0 z-20 flex-shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 pb-6 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/10 shadow-inner">
          <ShoppingCart className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-white text-base tracking-tight leading-tight">
            Customer
            <br />
            Intelligence Lab
          </h1>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-left ${
                isActive
                  ? 'bg-[#e8ddfc] text-[#4c1d95] shadow-sm'
                  : 'text-purple-200/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-[#5b21b6]' : 'text-purple-300/70 group-hover:text-white'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}

        {/* Export Results action */}
        <a
          href={apiService.getExportUrl('customers')}
          download="Customer_Segmentation_Results.csv"
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-purple-200/80 hover:text-white hover:bg-white/5 transition-all text-left"
        >
          <Download className="w-4 h-4 text-purple-300/70" />
          <span>Export Results</span>
        </a>
      </nav>

      {/* Storefront / Shopping bags illustration at bottom of sidebar (matching reference) */}
      <div className="p-4 pt-2">
        <div className="w-full h-32 rounded-2xl bg-[#231244] border border-purple-900/40 relative overflow-hidden flex flex-col justify-end items-center pb-2">
          {/* Canopy awning */}
          <div className="absolute top-2 w-4/5 h-8 flex overflow-hidden rounded-t-lg shadow-md">
            <div className="flex-1 bg-[#8b5cf6]" />
            <div className="flex-1 bg-[#ede9fe]" />
            <div className="flex-1 bg-[#8b5cf6]" />
            <div className="flex-1 bg-[#ede9fe]" />
            <div className="flex-1 bg-[#8b5cf6]" />
          </div>

          {/* Shop pillars and window */}
          <div className="w-3/4 h-12 border-x-2 border-purple-400/30 flex items-center justify-center mb-1">
            <div className="w-10 h-7 bg-purple-950/60 rounded border border-purple-400/20" />
          </div>

          {/* Cute shopping bags */}
          <div className="flex items-end space-x-1.5 z-10">
            {/* Bag 1 */}
            <div className="w-5 h-7 bg-pink-400 rounded-t-sm relative shadow-sm">
              <div className="w-2.5 h-2 border-t-2 border-x-2 border-pink-200 rounded-t-full absolute -top-1.5 left-1.5" />
            </div>
            {/* Bag 2 */}
            <div className="w-6 h-8 bg-purple-400 rounded-t-sm relative shadow-sm">
              <div className="w-3 h-2.5 border-t-2 border-x-2 border-purple-200 rounded-t-full absolute -top-2 left-1.5" />
            </div>
            {/* Bag 3 */}
            <div className="w-5 h-6 bg-amber-400 rounded-t-sm relative shadow-sm">
              <div className="w-2.5 h-2 border-t-2 border-x-2 border-amber-200 rounded-t-full absolute -top-1.5 left-1.5" />
            </div>
          </div>
          {/* Ground shadow */}
          <div className="w-3/4 h-1 bg-purple-950/80 rounded-full mt-1" />
        </div>
      </div>
    </aside>
  );
}
