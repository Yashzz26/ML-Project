import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Cell,
} from 'recharts';
import {
  ScatterChart as ScatterIcon,
  Crosshair,
  Filter,
  Users,
  DollarSign,
  ShoppingBag,
  Sparkles,
  Crown,
  Zap,
  BarChart3,
  Leaf,
} from 'lucide-react';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const CLUSTER_COLORS = {
  0: '#0ea5e9', // C0 - Moderate/Moderate: Sky Blue
  1: '#f59e0b', // C1 - High/High: Warm Amber/Orange
  2: '#a855f7', // C2 - Low/High: Soft Purple
  3: '#ef4444', // C3 - High/Low: Coral Red
  4: '#22c55e', // C4 - Low/Low: Fresh Green
};

const CLUSTER_NAMES = {
  0: 'C0 — Moderate / Moderate',
  1: 'C1 — High / High',
  2: 'C2 — Low / High',
  3: 'C3 — High / Low',
  4: 'C4 — Low / Low',
};

const CLUSTER_ICONS = {
  0: Crown,
  1: Sparkles,
  2: Zap,
  3: BarChart3,
  4: Leaf,
};

export default function ClusterAnalysisPage() {
  const [clustersData, setClustersData] = useState(null);
  const [clusterSummary, setClusterSummary] = useState(null);
  const [selectedCluster, setSelectedCluster] = useState(null); // null = all
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [clusterRes, summaryRes] = await Promise.all([
          apiService.getClusters(),
          apiService.getClusterSummary(),
        ]);
        setClustersData(clusterRes);
        setClusterSummary(summaryRes);
      } catch (err) {
        setError(err.message || 'Failed to load cluster analysis');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating cluster spatial coordinates..." />;
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl my-6">
        <p className="text-red-600 font-semibold mb-1">Error loading cluster analysis</p>
        <p className="text-slate-500 text-sm">{error}</p>
      </div>
    );
  }

  const { points = [], centroids = [], silhouette_score } = clustersData;

  // Selected cluster profile if a single cluster is active
  const activeProfile =
    selectedCluster !== null
      ? clusterSummary?.find((c) => c.cluster === selectedCluster)
      : null;

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Controls & Filter Bar */}
      <div className="bg-white rounded-2xl border border-purple-100 p-4 sm:p-5 shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Cluster Analysis & Segmentation Map
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a cluster to isolate its boundary, centroid coordinates, and demographic profile.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCluster(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedCluster === null
                ? 'bg-[#e8ddfc] text-[#4c1d95] shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            All Clusters ({points.length})
          </button>

          {[0, 1, 2, 3, 4].map((cId) => {
            const isSelected = selectedCluster === cId;
            const color = CLUSTER_COLORS[cId];
            return (
              <button
                key={cId}
                onClick={() => setSelectedCluster(isSelected ? null : cId)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'border-purple-300 shadow-sm text-slate-900'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                style={{
                  backgroundColor: isSelected ? `${color}15` : undefined,
                  borderColor: isSelected ? color : undefined,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span>Cluster {cId}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Cluster Info Bar (if filtered) */}
      {activeProfile && (
        <div
          className="p-4 rounded-2xl border shadow-soft flex flex-wrap items-center justify-between gap-4 transition-all duration-300"
          style={{
            backgroundColor: `${CLUSTER_COLORS[activeProfile.cluster]}08`,
            borderColor: `${CLUSTER_COLORS[activeProfile.cluster]}30`,
          }}
        >
          <div className="flex items-center space-x-3">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs"
              style={{ backgroundColor: CLUSTER_COLORS[activeProfile.cluster] }}
            >
              Cluster {activeProfile.cluster}
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {activeProfile.segment_name}
              </h3>
              <p className="text-xs text-slate-500">
                {activeProfile.persona} — {activeProfile.strategy}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 font-sans block">Count:</span>
              <strong className="text-slate-900 font-bold">{activeProfile.customer_count} ({activeProfile.percentage}%)</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-sans block">Avg Income:</span>
              <strong className="text-slate-900 font-bold">₹{activeProfile.average_income}k</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-sans block">Avg Spending:</span>
              <strong className="text-slate-900 font-bold">{activeProfile.average_spending_score}/100</strong>
            </div>
          </div>
        </div>
      )}

      {/* Main Large Cluster Map Centerpiece */}
      <div className="analytics-card p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              2D Standardized Feature Space Visualization
            </h3>
            <p className="text-xs text-slate-400">
              X: Annual Income ($k) · Y: Spending Score (1-100) · Diamond markers indicate Centroids
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
            Silhouette: {silhouette_score}
          </span>
        </div>

        <div className="h-96 w-full my-2">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 25, left: 10 }}>
              <XAxis
                type="number"
                dataKey="income"
                name="Annual Income (k$)"
                domain={[10, 145]}
                stroke="#94a3b8"
                tick={{ fill: '#64748b', fontSize: 11 }}
                label={{
                  value: 'Annual Income (k$)',
                  position: 'insideBottom',
                  offset: -12,
                  fill: '#64748b',
                  fontSize: 11,
                }}
              />
              <YAxis
                type="number"
                dataKey="spending"
                name="Spending Score"
                domain={[0, 105]}
                stroke="#94a3b8"
                tick={{ fill: '#64748b', fontSize: 11 }}
                label={{
                  value: 'Spending Score (1-100)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 15,
                  fill: '#64748b',
                  fontSize: 11,
                }}
              />
              <ZAxis range={[55, 75]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    if (item.isCentroid) {
                      return (
                        <div className="bg-white border border-purple-200 p-3 rounded-xl shadow-card text-xs space-y-1">
                          <p className="font-bold text-slate-900 flex items-center space-x-1 text-[#7c3aed]">
                            <Crosshair className="w-3.5 h-3.5" />
                            <span>Cluster {item.cluster} Centroid</span>
                          </p>
                          <p className="text-slate-700 font-medium">{item.name}</p>
                          <p className="text-slate-500 font-mono text-[11px]">
                            Centroid: ${item.income}k, {item.spending}
                          </p>
                        </div>
                      );
                    }
                    return (
                      <div className="bg-white border border-purple-100 p-3 rounded-xl shadow-card text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-900">Customer #{item.customerId}</strong>
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                            style={{
                              backgroundColor: `${CLUSTER_COLORS[item.cluster]}20`,
                              color: CLUSTER_COLORS[item.cluster],
                            }}
                          >
                            Cluster {item.cluster}
                          </span>
                        </div>
                        <p className="text-slate-600 font-medium">{item.segmentName}</p>
                        <div className="text-slate-500 pt-1 border-t border-slate-100 text-[11px] space-y-0.5">
                          <p>Income: <strong className="text-slate-800">${item.income}k</strong></p>
                          <p>Spending Score: <strong className="text-slate-800">{item.spending}/100</strong></p>
                          <p>Profile: {item.gender}, {item.age} years old</p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Customer Points with Dimming */}
              <Scatter name="Customers" data={points} animationDuration={500}>
                {points.map((entry, index) => {
                  const isDimmed =
                    selectedCluster !== null && entry.cluster !== selectedCluster;
                  const color = CLUSTER_COLORS[entry.cluster] || '#6366f1';
                  return (
                    <Cell
                      key={`pt-${index}`}
                      fill={color}
                      fillOpacity={isDimmed ? 0.12 : 0.88}
                    />
                  );
                })}
              </Scatter>

              {/* Centroids */}
              <Scatter
                name="Centroids"
                data={centroids.map((c) => ({ ...c, isCentroid: true }))}
                shape="diamond"
              >
                {centroids.map((entry, index) => {
                  const isDimmed =
                    selectedCluster !== null && entry.cluster !== selectedCluster;
                  return (
                    <Cell
                      key={`cent-${index}`}
                      fill="#7c3aed"
                      stroke="#ffffff"
                      strokeWidth={2.5}
                      fillOpacity={isDimmed ? 0.2 : 1}
                    />
                  );
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
          <div className="flex flex-wrap items-center gap-4">
            {[0, 1, 2, 3, 4].map((cId) => (
              <div key={cId} className="flex items-center space-x-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: CLUSTER_COLORS[cId] }}
                />
                <span className="text-slate-700">{CLUSTER_NAMES[cId]}</span>
              </div>
            ))}
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rotate-45 bg-[#7c3aed] border border-white" />
              <span className="text-[#7c3aed] font-bold">Fitted Centroid</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cluster Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {clusterSummary?.map((c) => {
          const color = CLUSTER_COLORS[c.cluster];
          const Icon = CLUSTER_ICONS[c.cluster] || Sparkles;
          return (
            <div
              key={c.cluster}
              className="analytics-card p-5 flex flex-col justify-between"
              style={{ borderTop: `4px solid ${color}` }}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                      style={{
                        backgroundColor: `${color}18`,
                        color: color,
                      }}
                    >
                      Cluster {c.cluster}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {c.badge}
                    </span>
                  </div>
                  <Icon className="w-4 h-4 text-slate-400" />
                </div>

                <h4 className="text-base font-bold text-slate-900 mb-0.5">
                  {c.segment_name}
                </h4>
                <p className="text-xs text-slate-400 mb-3">{c.persona}</p>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#fcfaff] border border-purple-50 text-xs mb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Customers</span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {c.customer_count} ({c.percentage}%)
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Avg Age</span>
                    <p className="font-bold text-slate-900 mt-0.5">{c.average_age} yrs</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Avg Income</span>
                    <p className="font-bold text-slate-900 mt-0.5">₹{c.average_income}k</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Avg Spend</span>
                    <p className="font-bold text-slate-900 mt-0.5">{c.average_spending_score}/100</p>
                  </div>
                </div>

                <div className="text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Marketing Strategy
                  </span>
                  <p className="text-slate-600 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-100">
                    {c.strategy}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Centroid Coordinates:</span>
                <span className="font-bold text-slate-800">
                  (${c.centroid_income}k, {c.centroid_spending})
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
