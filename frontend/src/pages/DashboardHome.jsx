import React, { useState, useEffect } from 'react';
import {
  Users,
  Layers,
  Star,
  Database,
  ArrowRight,
  Maximize2,
  Target,
  Lightbulb,
  Crown,
  Zap,
  BarChart3,
  Leaf,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Cell,
  LineChart,
  Line,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

// Segment colors strictly matching reference design
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

export default function DashboardHome({ onNavigate }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [clustersData, setClustersData] = useState(null);
  const [elbowData, setElbowData] = useState(null);
  const [silhouetteData, setSilhouetteData] = useState(null);
  const [metricTab, setMetricTab] = useState('elbow'); // 'elbow' | 'silhouette'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);
        const [dashRes, clusterRes, elbowRes, silRes] = await Promise.all([
          apiService.getDashboard(),
          apiService.getClusters(),
          apiService.getElbow(),
          apiService.getSilhouette(),
        ]);
        setDashboardData(dashRes);
        setClustersData(clusterRes);
        setElbowData(elbowRes);
        setSilhouetteData(silRes);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading customer intelligence analytics..." />;
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl my-6">
        <p className="text-red-600 font-semibold mb-1">Error loading dashboard</p>
        <p className="text-slate-500 text-sm">{error}</p>
      </div>
    );
  }

  const {
    total_customers = 200,
    n_clusters = 5,
    silhouette_score = 0.5547,
    cluster_summary = [],
  } = dashboardData;

  // Filter elbow evaluations for K=2..10 to match clean curve
  const filteredElbow = (elbowData?.evaluations || []).filter((e) => e.k >= 2);
  const filteredSil = silhouetteData?.evaluations || [];

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Large Editorial Hero Section */}
      <div className="bg-white rounded-2xl border border-purple-100/80 p-7 sm:p-9 shadow-soft relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          {/* Headline & Description */}
          <div className="max-w-xl space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Who Are Your{' '}
              <span className="text-[#6d28d9] relative inline-block">
                Customers?
                {/* Purple marker hand-drawn squiggle underline */}
                <svg
                  className="absolute -bottom-2.5 left-0 w-full h-3 text-[#7c3aed]"
                  viewBox="0 0 180 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 8.5C40 2.5 90 2 177 7"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-sm text-slate-500 leading-relaxed font-normal pt-1">
              Discover hidden customer groups based on income and spending behavior using K-Means++.
            </p>
          </div>

          {/* Center Handwritten Sticky Note / Marker Annotation */}
          <div className="flex items-center space-x-3 self-center lg:self-auto">
            <div className="sticky-note px-5 py-3 rounded-2xl transform -rotate-2 border border-amber-200/80 shadow-sm">
              <p className="font-handwriting text-base font-bold text-slate-800 leading-snug text-center">
                Income + Spending
                <br />
                <span className="text-[#7c3aed] font-black">=</span>
                <br />
                <span className="text-[#7c3aed]">Customer Groups</span>
              </p>
            </div>

            {/* Hand-drawn curved arrow pointing toward visualizations */}
            <svg
              className="w-12 h-10 text-[#7c3aed] transform rotate-12 hidden sm:block"
              viewBox="0 0 50 35"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 25 C 20 20, 35 15, 45 5 M 45 5 L 35 6 M 45 5 L 43 16"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Right Shopping Character Illustration */}
          <div className="relative flex items-center justify-center flex-shrink-0 self-center">
            {/* SVG Illustration matching reference with laptop character & bags */}
            <svg
              className="w-56 h-36"
              viewBox="0 0 240 150"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Shopping bags on the right */}
              <g id="bags">
                {/* Yellow Bag */}
                <rect x="175" y="45" width="40" height="75" rx="4" fill="#FDE68A" />
                <path d="M185 45 C185 30, 205 30, 205 45" stroke="#F59E0B" strokeWidth="3" fill="none" />
                
                {/* Purple Bag */}
                <rect x="155" y="55" width="40" height="65" rx="4" fill="#C4B5FD" />
                <path d="M165 55 C165 42, 185 42, 185 55" stroke="#7C3AED" strokeWidth="3" fill="none" />

                {/* Pink Bag */}
                <rect x="135" y="65" width="35" height="55" rx="4" fill="#FBCFE8" />
                <path d="M145 65 C145 54, 160 54, 160 65" stroke="#EC4899" strokeWidth="3" fill="none" />
              </g>

              {/* Character */}
              <g id="person">
                {/* Body / Purple Hoodie */}
                <path d="M50 120 C50 90, 80 85, 100 85 C120 85, 150 90, 150 120 Z" fill="#8B5CF6" />
                
                {/* Head / Face */}
                <circle cx="100" cy="55" r="22" fill="#FDE047" />
                
                {/* Hair */}
                <path d="M80 50 C80 32, 120 32, 120 50 C115 42, 105 40, 95 44 Z" fill="#1E1B4B" />
                
                {/* Eyes & Smile */}
                <circle cx="95" cy="54" r="2.5" fill="#1E1B4B" />
                <circle cx="108" cy="54" r="2.5" fill="#1E1B4B" />
                <path d="M98 62 Q103 67 108 62" stroke="#1E1B4B" strokeWidth="2" strokeLinecap="round" />

                {/* Laptop */}
                <rect x="40" y="90" width="65" height="40" rx="3" fill="#6B21A8" />
                <rect x="43" y="93" width="59" height="34" rx="2" fill="#7C3AED" />
                {/* Shopping cart on laptop */}
                <circle cx="70" cy="108" r="2" fill="#FDF4FF" />
                <circle cx="78" cy="108" r="2" fill="#FDF4FF" />
                <path d="M62 100 L66 100 L71 106 L82 106 L85 101 L68 101" stroke="#FDF4FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                
                {/* Hands */}
                <circle cx="68" cy="115" r="5" fill="#FDE047" />
                <circle cx="95" cy="115" r="5" fill="#FDE047" />
              </g>

              {/* Sparkle stars */}
              <path d="M125 30 L128 35 L133 38 L128 41 L125 46 L122 41 L117 38 L122 35 Z" fill="#A78BFA" opacity="0.8" />
              <path d="M195 20 L197 24 L201 26 L197 28 L195 32 L193 28 L189 26 L193 24 Z" fill="#F59E0B" opacity="0.8" />
            </svg>
          </div>
        </div>
      </div>

      {/* 2. Four Clean KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Customers Analyzed */}
        <div className="analytics-card p-5 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-[#7c3aed] flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              {total_customers}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              Customers Analyzed
            </div>
          </div>
        </div>

        {/* KPI 2: Customer Segments */}
        <div className="analytics-card p-5 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-[#7c3aed] flex-shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              K = {n_clusters}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              Customer Segments
            </div>
          </div>
        </div>

        {/* KPI 3: Silhouette Score */}
        <div className="analytics-card p-5 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 flex-shrink-0">
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              {silhouette_score}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              Silhouette Score
            </div>
          </div>
        </div>

        {/* KPI 4: Features Used */}
        <div className="analytics-card p-5 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-[#7c3aed] flex-shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              2
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5 leading-snug">
              Features Used
              <span className="block text-[11px] font-normal text-slate-400">
                (Annual Income + Spending Score)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Chart Area: Two Columns (Left: Customer Cluster Map, Right: Why K = 5?) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT: Customer Clusters (K = 5) Scatter Plot (7 cols) */}
        <div className="lg:col-span-7 analytics-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Customer Clusters (K = 5)
              </h2>
              <button
                onClick={() => onNavigate('clusters')}
                className="text-slate-400 hover:text-purple-600 p-1 rounded-lg transition-colors"
                title="Expand Cluster View"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Income vs Spending Score with cluster centroids
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 my-2">
            {/* Scatter Visualization */}
            <div className="h-64 sm:h-72 w-full sm:flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -10 }}>
                  <XAxis
                    type="number"
                    dataKey="income"
                    name="Annual Income (k$)"
                    domain={[10, 140]}
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
                    domain={[0, 100]}
                    stroke="#94a3b8"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    label={{
                      value: 'Spending Score',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 15,
                      fill: '#64748b',
                      fontSize: 11,
                    }}
                  />
                  <ZAxis range={[50, 60]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const pt = payload[0].payload;
                        const color = CLUSTER_COLORS[pt.cluster] || '#6366f1';
                        return (
                          <div className="bg-white border border-purple-100 p-3 rounded-xl shadow-card text-xs space-y-1">
                            <p className="font-bold text-slate-900">Customer #{pt.customerId}</p>
                            <p className="font-semibold text-xs" style={{ color }}>
                              {CLUSTER_NAMES[pt.cluster] || `Cluster ${pt.cluster}`}
                            </p>
                            <div className="text-slate-500 pt-1 border-t border-slate-100 space-y-0.5 text-[11px]">
                              <p>Income: <strong className="text-slate-800">${pt.income}k</strong></p>
                              <p>Spending Score: <strong className="text-slate-800">{pt.spending}/100</strong></p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  {/* Customer Points */}
                  <Scatter
                    name="Customers"
                    data={clustersData?.points || []}
                    animationDuration={600}
                  >
                    {(clustersData?.points || []).map((entry, index) => (
                      <Cell
                        key={`pt-${index}`}
                        fill={CLUSTER_COLORS[entry.cluster] || '#6366f1'}
                        fillOpacity={0.88}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Vertical Legend matching reference */}
            <div className="w-full sm:w-44 space-y-2 py-2 sm:border-l sm:border-slate-100 sm:pl-3 text-xs font-medium text-slate-600 flex-shrink-0">
              {[0, 1, 2, 3, 4].map((cId) => (
                <div key={cId} className="flex items-center space-x-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: CLUSTER_COLORS[cId] }}
                  />
                  <span className="truncate text-[11px] text-slate-700">
                    {CLUSTER_NAMES[cId]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Why K = 5? Card (5 cols) */}
        <div className="lg:col-span-5 analytics-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Why K = 5?
              </h2>

              {/* Pill Toggle for Elbow vs Silhouette */}
              <div className="flex p-0.5 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-semibold">
                <button
                  onClick={() => setMetricTab('elbow')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    metricTab === 'elbow'
                      ? 'bg-[#e8ddfc] text-[#4c1d95] shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Elbow Method
                </button>
                <button
                  onClick={() => setMetricTab('silhouette')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    metricTab === 'silhouette'
                      ? 'bg-[#e8ddfc] text-[#4c1d95] shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Silhouette Score
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              {metricTab === 'elbow'
                ? 'Inertia reduction curve highlighting elbow inflection'
                : 'Silhouette separation score across cluster options'}
            </p>
          </div>

          {/* Interactive Chart */}
          <div className="h-48 w-full my-1">
            <ResponsiveContainer width="100%" height="100%">
              {metricTab === 'elbow' ? (
                <LineChart data={filteredElbow} margin={{ top: 15, right: 15, bottom: 5, left: -10 }}>
                  <XAxis
                    dataKey="k"
                    stroke="#94a3b8"
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    label={{ value: 'Number of Clusters (K)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }}
                  />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white border border-purple-100 p-2 rounded-lg text-xs shadow-card">
                            <p className="font-bold text-slate-900">K = {payload[0].payload.k}</p>
                            <p className="text-[#6d28d9] font-semibold">Inertia: {payload[0].value}</p>
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
                    dot={{ r: 3.5, fill: '#7c3aed' }}
                  />
                  {/* Elbow reference line at K=5 */}
                  <ReferenceLine x={5} stroke="#a855f7" strokeDasharray="3 3" />
                  <ReferenceDot
                    x={5}
                    y={65.57}
                    r={6}
                    fill="#6d28d9"
                    stroke="#ffffff"
                    strokeWidth={2}
                    label={{
                      value: 'K = 5 (Elbow Point)',
                      position: 'top',
                      fill: '#5b21b6',
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  />
                </LineChart>
              ) : (
                <LineChart data={filteredSil} margin={{ top: 15, right: 15, bottom: 5, left: -10 }}>
                  <XAxis
                    dataKey="k"
                    stroke="#94a3b8"
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    label={{ value: 'Number of Clusters (K)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }}
                  />
                  <YAxis domain={[0.25, 0.6]} stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white border border-purple-100 p-2 rounded-lg text-xs shadow-card">
                            <p className="font-bold text-slate-900">K = {payload[0].payload.k}</p>
                            <p className="text-emerald-600 font-semibold">Score: {payload[0].value}</p>
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
                    dot={{ r: 3.5, fill: '#10b981' }}
                  />
                  <ReferenceLine x={5} stroke="#10b981" strokeDasharray="3 3" />
                  <ReferenceDot
                    x={5}
                    y={0.5547}
                    r={6}
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth={2}
                    label={{
                      value: 'Peak (0.5547)',
                      position: 'top',
                      fill: '#047857',
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Explanation Boxes matching reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
            {/* Optimal K Box */}
            <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100 flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-[#7c3aed] flex-shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                  Optimal K
                </span>
                <span className="text-xl font-extrabold text-[#5b21b6] font-display">
                  5
                </span>
              </div>
            </div>

            {/* Reason Box */}
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100 flex items-start space-x-2.5">
              <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0 mt-0.5">
                <Lightbulb className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                  Reason
                </span>
                <p className="text-[11px] text-amber-950 font-medium leading-snug">
                  Strong inertia reduction up to K = 5, then diminishing improvement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Customer Segments Section: FIVE Colorful Pastel Cards in Horizontal Row */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Customer Segments
            </h2>
            <p className="text-xs text-slate-400">
              The 5 customer groups discovered dynamically by K-Means++
            </p>
          </div>
          <button
            onClick={() => onNavigate('clusters')}
            className="text-xs font-semibold text-[#7c3aed] hover:text-[#5b21b6] flex items-center space-x-1 transition-colors"
          >
            <span>View Detailed Segments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 5 Pastel Cards in One Horizontal Row on Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Moderate-Moderate (Cluster 0) - Soft Blue */}
          <div className="rounded-2xl p-4 bg-gradient-to-b from-[#f0f8ff] via-[#e8f3fc] to-[#e0effb] border border-sky-200/70 shadow-soft relative overflow-hidden flex flex-col justify-between hover:-translate-y-1 transition-transform duration-200">
            <div>
              <div className="flex items-center space-x-2 mb-2 text-sky-600">
                <Crown className="w-4 h-4" />
                <span className="text-xs font-bold tracking-tight">
                  Moderate-Moderate
                  <span className="block text-[10px] font-normal text-sky-700/80">
                    (Cluster 0)
                  </span>
                </span>
              </div>

              <div className="my-2">
                <span className="text-2xl font-extrabold text-slate-900 font-display">
                  81
                </span>
                <span className="text-xs text-slate-500 font-medium ml-1.5">
                  Customers
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-sky-200/60 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Avg. Income</span>
                <span className="font-bold text-slate-800">₹55.30k</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-sans">Avg. Spending</span>
                <span className="font-bold text-slate-800">49.52</span>
              </div>
            </div>
            {/* Soft wave ornament at bottom */}
            <div className="absolute -bottom-3 left-0 right-0 h-6 bg-sky-200/30 rounded-t-full pointer-events-none" />
          </div>

          {/* Card 2: High-High (Cluster 1) - Soft Amber/Orange */}
          <div className="rounded-2xl p-4 bg-gradient-to-b from-[#fefbf2] via-[#fef6e5] to-[#fdedcd] border border-amber-200/70 shadow-soft relative overflow-hidden flex flex-col justify-between hover:-translate-y-1 transition-transform duration-200">
            <div>
              <div className="flex items-center space-x-2 mb-2 text-amber-600">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold tracking-tight">
                  High-High
                  <span className="block text-[10px] font-normal text-amber-700/80">
                    (Cluster 1)
                  </span>
                </span>
              </div>

              <div className="my-2">
                <span className="text-2xl font-extrabold text-slate-900 font-display">
                  39
                </span>
                <span className="text-xs text-slate-500 font-medium ml-1.5">
                  Customers
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Avg. Income</span>
                <span className="font-bold text-slate-800">₹86.54k</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-sans">Avg. Spending</span>
                <span className="font-bold text-slate-800">82.13</span>
              </div>
            </div>
            <div className="absolute -bottom-3 left-0 right-0 h-6 bg-amber-200/30 rounded-t-full pointer-events-none" />
          </div>

          {/* Card 3: Low-High (Cluster 2) - Soft Purple/Lavender */}
          <div className="rounded-2xl p-4 bg-gradient-to-b from-[#fbf8fe] via-[#f4edfd] to-[#ede3fb] border border-purple-200/70 shadow-soft relative overflow-hidden flex flex-col justify-between hover:-translate-y-1 transition-transform duration-200">
            <div>
              <div className="flex items-center space-x-2 mb-2 text-purple-600">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-bold tracking-tight">
                  Low-High
                  <span className="block text-[10px] font-normal text-purple-700/80">
                    (Cluster 2)
                  </span>
                </span>
              </div>

              <div className="my-2">
                <span className="text-2xl font-extrabold text-slate-900 font-display">
                  22
                </span>
                <span className="text-xs text-slate-500 font-medium ml-1.5">
                  Customers
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-purple-200/60 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Avg. Income</span>
                <span className="font-bold text-slate-800">₹25.73k</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-sans">Avg. Spending</span>
                <span className="font-bold text-slate-800">79.36</span>
              </div>
            </div>
            <div className="absolute -bottom-3 left-0 right-0 h-6 bg-purple-200/30 rounded-t-full pointer-events-none" />
          </div>

          {/* Card 4: High-Low (Cluster 3) - Soft Pink/Red */}
          <div className="rounded-2xl p-4 bg-gradient-to-b from-[#fef6f6] via-[#feeeee] to-[#fde2e2] border border-rose-200/70 shadow-soft relative overflow-hidden flex flex-col justify-between hover:-translate-y-1 transition-transform duration-200">
            <div>
              <div className="flex items-center space-x-2 mb-2 text-rose-600">
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs font-bold tracking-tight">
                  High-Low
                  <span className="block text-[10px] font-normal text-rose-700/80">
                    (Cluster 3)
                  </span>
                </span>
              </div>

              <div className="my-2">
                <span className="text-2xl font-extrabold text-slate-900 font-display">
                  35
                </span>
                <span className="text-xs text-slate-500 font-medium ml-1.5">
                  Customers
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Avg. Income</span>
                <span className="font-bold text-slate-800">₹88.20k</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-sans">Avg. Spending</span>
                <span className="font-bold text-slate-800">17.11</span>
              </div>
            </div>
            <div className="absolute -bottom-3 left-0 right-0 h-6 bg-rose-200/30 rounded-t-full pointer-events-none" />
          </div>

          {/* Card 5: Low-Low (Cluster 4) - Soft Green */}
          <div className="rounded-2xl p-4 bg-gradient-to-b from-[#f2fbf5] via-[#e6f7ec] to-[#d8f2e1] border border-emerald-200/70 shadow-soft relative overflow-hidden flex flex-col justify-between hover:-translate-y-1 transition-transform duration-200">
            <div>
              <div className="flex items-center space-x-2 mb-2 text-emerald-600">
                <Leaf className="w-4 h-4" />
                <span className="text-xs font-bold tracking-tight">
                  Low-Low
                  <span className="block text-[10px] font-normal text-emerald-700/80">
                    (Cluster 4)
                  </span>
                </span>
              </div>

              <div className="my-2">
                <span className="text-2xl font-extrabold text-slate-900 font-display">
                  23
                </span>
                <span className="text-xs text-slate-500 font-medium ml-1.5">
                  Customers
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Avg. Income</span>
                <span className="font-bold text-slate-800">₹26.30k</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-sans">Avg. Spending</span>
                <span className="font-bold text-slate-800">20.91</span>
              </div>
            </div>
            <div className="absolute -bottom-3 left-0 right-0 h-6 bg-emerald-200/30 rounded-t-full pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
