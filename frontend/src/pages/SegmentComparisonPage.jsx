import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, Users, TrendingUp, DollarSign } from 'lucide-react';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SegmentComparisonPage() {
  const [clusters, setClusters] = useState([]);
  const [c1, setC1] = useState(0);
  const [c2, setC2] = useState(1);
  const [compData, setCompData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const summary = await apiService.getClusterSummary();
        setClusters(summary);
        const res = await apiService.compareSegments(c1, c2);
        setCompData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [c1, c2]);

  if (loading && !compData) return <LoadingSpinner message="Calculating segment contrast..." />;

  const sa = compData?.segment_a || {};
  const sb = compData?.segment_b || {};
  const comp = compData?.comparison || {};

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="bg-white rounded-2xl border border-purple-100 p-6 sm:p-8 shadow-soft">
        <span className="text-xs font-bold text-[#7c3aed] uppercase tracking-wider flex items-center gap-1.5">
          <ArrowLeftRight className="w-4 h-4" />
          Comparative Intelligence
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Head-to-Head Segment Comparator
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-2 max-w-2xl">
          Directly benchmark two distinct customer personas against each other to identify demographic divergence, spending gaps, and cross-sell synergies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="analytics-card p-6 border-t-4" style={{ borderTopColor: sa.color }}>
          <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Segment Alpha</label>
          <select
            value={c1}
            onChange={(e) => setC1(Number(e.target.value))}
            className="w-full text-xs font-bold bg-purple-50/50 border border-purple-200 rounded-xl px-3 py-2 text-slate-800"
          >
            {clusters.map((c) => (
              <option key={c.cluster} value={c.cluster}>Cluster {c.cluster}: {c.persona}</option>
            ))}
          </select>
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-purple-50">
              <span className="text-slate-400">Average Income</span>
              <span className="font-bold text-slate-800">${sa.average_income}k</span>
            </div>
            <div className="flex justify-between py-1 border-b border-purple-50">
              <span className="text-slate-400">Spending Score</span>
              <span className="font-bold text-slate-800">{sa.average_spending_score}/100</span>
            </div>
            <div className="flex justify-between py-1 border-b border-purple-50">
              <span className="text-slate-400">Dominant Gender</span>
              <span className="font-bold text-slate-800">{sa.dominant_gender}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-purple-50">
              <span className="text-slate-400">Cohort Size</span>
              <span className="font-bold text-slate-800">{sa.customer_count} shoppers ({sa.percentage}%)</span>
            </div>
          </div>
        </div>

        <div className="analytics-card p-6 border-t-4" style={{ borderTopColor: sb.color }}>
          <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Segment Beta</label>
          <select
            value={c2}
            onChange={(e) => setC2(Number(e.target.value))}
            className="w-full text-xs font-bold bg-purple-50/50 border border-purple-200 rounded-xl px-3 py-2 text-slate-800"
          >
            {clusters.map((c) => (
              <option key={c.cluster} value={c.cluster}>Cluster {c.cluster}: {c.persona}</option>
            ))}
          </select>
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-purple-50">
              <span className="text-slate-400">Average Income</span>
              <span className="font-bold text-slate-800">${sb.average_income}k</span>
            </div>
            <div className="flex justify-between py-1 border-b border-purple-50">
              <span className="text-slate-400">Spending Score</span>
              <span className="font-bold text-slate-800">{sb.average_spending_score}/100</span>
            </div>
            <div className="flex justify-between py-1 border-b border-purple-50">
              <span className="text-slate-400">Dominant Gender</span>
              <span className="font-bold text-slate-800">{sb.dominant_gender}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-purple-50">
              <span className="text-slate-400">Cohort Size</span>
              <span className="font-bold text-slate-800">{sb.customer_count} shoppers ({sb.percentage}%)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="analytics-card p-6 bg-gradient-to-r from-purple-50/40 to-white">
        <h3 className="text-base font-bold text-slate-900 mb-2">Comparative Takeaway</h3>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">{comp.strategic_contrast}</p>
      </div>
    </div>
  );
}
