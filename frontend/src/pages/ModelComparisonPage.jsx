import React, { useState, useEffect } from 'react';
import { Layers, Award, CheckCircle2, Cpu, BarChart2, Zap } from 'lucide-react';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ModelComparisonPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await apiService.getModelComparison();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner message="Benchmarking unsupervised clustering models..." />;

  const models = data?.models || [];

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="bg-white rounded-2xl border border-purple-100 p-6 sm:p-8 shadow-soft">
        <span className="text-xs font-bold text-[#7c3aed] uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4" />
          Algorithmic Benchmarking
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Model Comparison: K-Means vs Hierarchical vs DBSCAN
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-2 max-w-3xl">
          Empirical evaluation across partition-based, hierarchical bottom-up, and density-based clustering techniques to justify optimal algorithm selection.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {models.map((m, idx) => (
          <div
            key={idx}
            className={`analytics-card p-6 flex flex-col justify-between ${
              m.is_selected ? 'border-2 border-[#7c3aed] bg-purple-50/20' : ''
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {m.type}
                </span>
                {m.is_selected && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Selected
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{m.name}</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{m.strengths}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-purple-50 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Silhouette</span>
                <span className="font-extrabold text-slate-800 text-sm font-mono">{m.silhouette_score}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Optimal K</span>
                <span className="font-extrabold text-[#7c3aed] text-sm font-mono">{m.optimal_k}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Davies-Bouldin</span>
                <span className="font-extrabold text-slate-800 text-sm font-mono">{m.davies_bouldin}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Calinski-Harabasz</span>
                <span className="font-extrabold text-slate-800 text-sm font-mono">{m.calinski_harabasz}</span>
              </div>
              {m.noise_points > 0 && (
                <div className="col-span-2 pt-1 border-t border-slate-100 flex justify-between text-[11px] text-amber-700 font-semibold">
                  <span>Noise Points: {m.noise_points}</span>
                  <span>Coverage: {m.coverage_pct}%</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="analytics-card p-6">
        <h3 className="text-base font-bold text-slate-900 mb-2">Empirical Benchmark Summary</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{data?.benchmark_conclusion}</p>
      </div>
    </div>
  );
}
