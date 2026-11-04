import React from 'react';
import { X, Printer, ExternalLink, FileText } from 'lucide-react';
import { apiService } from '../services/api';

export default function ExecutiveReportModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const reportUrl = apiService.getExecutiveReportUrl();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-purple-100">
        <div className="p-4 sm:p-5 border-b border-purple-100 flex items-center justify-between bg-purple-50/30">
          <div className="flex items-center space-x-2.5">
            <FileText className="w-5 h-5 text-[#7c3aed]" />
            <h3 className="text-base font-bold text-slate-900">Executive Briefing Report</h3>
          </div>
          <div className="flex items-center space-x-2">
            <a
              href={reportUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold text-[#7c3aed] bg-purple-100 hover:bg-purple-200 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Full Tab</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 w-full bg-slate-50">
          <iframe
            src={reportUrl}
            title="Executive Report Preview"
            className="w-full h-full border-none"
          />
        </div>
      </div>
    </div>
  );
}
