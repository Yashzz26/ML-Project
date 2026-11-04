import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, Search, Filter } from 'lucide-react';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function OutlierDetectionPage() {
  const [data, setData] = useState(null);
  const [threshold, setThreshold] = useState(2.0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await apiService.getAnomalies(threshold);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [threshold]);

  if (loading && !data) return <LoadingSpinner message="Scanning customer behavioral anomalies..." />;

  const anomalies = data?.anomalies || [];

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="bg-white rounded-2xl border border-purple-100 p-6 sm:p-8 shadow-soft flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            Audit & Quality Lab
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Behavioral Outlier & Anomaly Detection
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-2 max-w-2xl">
            Detect shoppers lying at the outermost statistical fringes of their assigned cluster centroids (distance Z-Score &ge; {threshold}&sigma;).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-600">Threshold:</span>
          <select
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="text-xs font-bold bg-purple-50 border border-purple-200 rounded-xl px-3 py-2 text-slate-800"
          >
            <option value="1.5">1.5 &sigma; (Broad Sensitivity)</option>
            <option value="2.0">2.0 &sigma; (Standard Boundary)</option>
            <option value="2.5">2.5 &sigma; (Extreme Outliers Only)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="analytics-card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Anomalies Detected</span>
          <div className="text-3xl font-extrabold text-rose-600 font-display mt-1">{data?.anomalies_detected}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">{data?.anomaly_rate_pct}% of total records</span>
        </div>
        <div className="analytics-card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Mean Centroid Distance</span>
          <div className="text-3xl font-extrabold text-slate-900 font-display mt-1">{data?.mean_centroid_distance}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Baseline dispersion</span>
        </div>
        <div className="analytics-card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Audit Status</span>
          <div className="text-3xl font-extrabold text-emerald-600 font-display mt-1">Validated</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Z-Score normalization active</span>
        </div>
      </div>

      <div className="analytics-card p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4">Flagged Outlier Records</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-purple-100 bg-[#fbf9fe] text-slate-600 font-bold uppercase">
                <th className="py-2.5 px-3">Customer ID</th>
                <th className="py-2.5 px-3">Demographics</th>
                <th className="py-2.5 px-3">Income & Spend</th>
                <th className="py-2.5 px-3">Assigned Persona</th>
                <th className="py-2.5 px-3">Z-Score</th>
                <th className="py-2.5 px-3">Auditing Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 text-slate-700">
              {anomalies.map((a, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">#{a.customerId}</td>
                  <td className="py-2.5 px-3">{a.gender}, {a.age} yrs</td>
                  <td className="py-2.5 px-3 font-mono">${a.annualIncome}k / {a.spendingScore} spend</td>
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-[11px]" style={{ color: a.color }}>{a.persona}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-rose-600">{a.zScore} &sigma;</td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">{a.actionableAudit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
