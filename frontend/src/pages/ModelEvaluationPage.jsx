import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
} from 'recharts';
import {
  SlidersHorizontal,
  Target,
  Award,
  Layers,
  Cpu,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ModelEvaluationPage() {
  const [elbowData, setElbowData] = useState(null);
  const [silhouetteData, setSilhouetteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadEvaluation() {
      try {
        setLoading(true);
        const [elbowRes, silRes] = await Promise.all([
          apiService.getElbow(),
          apiService.getSilhouette(),
        ]);
        setElbowData(elbowRes);
        setSilhouetteData(silRes);
      } catch (err) {
        setError(err.message || 'Failed to load model evaluation metrics');
      } finally {
        setLoading(false);
      }
    }
    loadEvaluation();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading Model Lab metrics..." />;
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl my-6">
        <p className="text-red-600 font-semibold mb-1">Error loading evaluation</p>
        <p className="text-slate-500 text-sm">{error}</p>
      </div>
    );
  }

  const { evaluations: elbowEvals, explanation: elbowExp } = elbowData;
  const { evaluations: silEvals, optimal_score, explanation: silExp } = silhouetteData;

  const comparisonTable = silEvals.map((item) => {
    const elbowMatch = elbowEvals.find((e) => e.k === item.k);
    return {
      k: item.k,
      inertia: elbowMatch ? elbowMatch.inertia : '—',
      silhouette: item.silhouette_score,
      isOptimal: item.is_optimal,
    };
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Model Lab Header */}
      <div className="bg-white rounded-2xl border border-purple-100 p-6 sm:p-8 shadow-soft">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold text-[#7c3aed] uppercase tracking-wider">
            Hyperparameter Lab & Validation
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Model Evaluation & Selection
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Mathematical justification for selecting K = 5 using Within-Cluster Sum of Squares (Inertia) and the Silhouette Coefficient.
          </p>
        </div>

        {/* Model Lab Specification Badges (Required by Section 14) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-purple-50">
          <div className="p-3 rounded-xl bg-[#fcfaff] border border-purple-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              FEATURES
            </span>
            <span className="text-xs font-bold text-slate-800 block mt-0.5">
              Income + Spending
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#fcfaff] border border-purple-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              PREPROCESSING
            </span>
            <span className="text-xs font-bold text-slate-800 block mt-0.5">
              StandardScaler
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#fcfaff] border border-purple-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              ALGORITHM
            </span>
            <span className="text-xs font-bold text-slate-800 block mt-0.5">
              K-Means++
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#fcfaff] border border-purple-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              INITIALIZATION
            </span>
            <span className="text-xs font-bold text-slate-800 block mt-0.5">
              k-means++
            </span>
          </div>

          <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
            <span className="text-[10px] font-bold text-[#6d28d9] uppercase tracking-wider block">
              OPTIMAL K
            </span>
            <span className="text-sm font-extrabold text-[#5b21b6] font-display block mt-0.5">
              5
            </span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
              SILHOUETTE
            </span>
            <span className="text-sm font-extrabold text-emerald-700 font-display block mt-0.5">
              0.5547
            </span>
          </div>
        </div>
      </div>

      {/* Dual Evaluation Charts: Elbow Method & Silhouette Score */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Elbow Method Chart */}
        <div className="analytics-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                1. Elbow Method (Inertia vs K)
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                K = 1 to 10
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Within-cluster sum of squares (WCSS) evaluating cluster compactness
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={elbowEvals} margin={{ top: 15, right: 15, bottom: 10, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1ecfc" />
                <XAxis
                  dataKey="k"
                  stroke="#94a3b8"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  label={{ value: 'Clusters (K)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }}
                />
                <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white border border-purple-100 p-2.5 rounded-xl text-xs shadow-card">
                          <p className="font-bold text-slate-900">K = {d.k}</p>
                          <p className="text-[#6d28d9] font-bold">Inertia: {d.inertia}</p>
                          {d.k === 5 && (
                            <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                              ★ Elbow Inflection Point
                            </span>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="inertia"
                  stroke="#7c3aed"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#7c3aed' }}
                />
                <ReferenceDot x={5} y={65.57} r={7} fill="#10B981" stroke="#ffffff" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-100">
            {elbowExp}
          </p>
        </div>

        {/* Silhouette Analysis Chart */}
        <div className="analytics-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                2. Silhouette Analysis (Score vs K)
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                K = 2 to 10
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Cluster cohesion vs separation across different numbers of clusters
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={silEvals} margin={{ top: 15, right: 15, bottom: 10, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1ecfc" />
                <XAxis
                  dataKey="k"
                  stroke="#94a3b8"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  label={{ value: 'Clusters (K)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }}
                />
                <YAxis domain={[0.25, 0.6]} stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white border border-purple-100 p-2.5 rounded-xl text-xs shadow-card">
                          <p className="font-bold text-slate-900">K = {d.k}</p>
                          <p className="text-emerald-600 font-bold">Silhouette: {d.silhouette_score}</p>
                          {d.is_optimal && (
                            <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                              ★ Peak Tested Score
                            </span>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="silhouette_score"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10b981' }}
                />
                <ReferenceDot x={5} y={optimal_score} r={7} fill="#f59e0b" stroke="#ffffff" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-100">
            {silExp}
          </p>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="analytics-card p-6">
        <h3 className="text-base font-bold text-slate-900 tracking-tight mb-3">
          Detailed Comparison Matrix (K = 2 to 10)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-purple-100 bg-[#fbf9fe] text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Clusters (K)</th>
                <th className="py-2.5 px-3">Inertia (WCSS)</th>
                <th className="py-2.5 px-3">Silhouette Score</th>
                <th className="py-2.5 px-3">Clustering Assessment</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 text-slate-700">
              {comparisonTable.map((row) => (
                <tr
                  key={row.k}
                  className={`transition-colors ${
                    row.isOptimal
                      ? 'bg-purple-50/50 font-semibold'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    K = {row.k}
                  </td>
                  <td className="py-3 px-3 font-mono">{row.inertia}</td>
                  <td className="py-3 px-3 font-mono">
                    <span className={row.isOptimal ? 'text-emerald-700 font-bold' : 'text-slate-700'}>
                      {row.silhouette}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {row.k === 2 && 'Underfitted: Overly coarse division combining opposing groups.'}
                    {row.k === 3 && 'Underfitted: Merges high and moderate spenders together.'}
                    {row.k === 4 && 'Fair cohesion, but fails to isolate moderate income/spending core.'}
                    {row.k === 5 && 'Optimal balance: Highest cohesion, distinct centroids, best business utility.'}
                    {row.k === 6 && 'Splitting moderate group; diminishing cohesion returns.'}
                    {row.k >= 7 && 'Overfitted: Creates tiny arbitrary sub-clusters with lower silhouette.'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {row.isOptimal ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">
                        ★ Selected
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Sub-optimal</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
