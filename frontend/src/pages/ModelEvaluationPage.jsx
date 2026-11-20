import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  Cell,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  ReferenceDot,
} from 'recharts';
import {
  SlidersHorizontal,
  Target,
  Award,
  Layers,
  Cpu,
  CheckCircle2,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Crosshair,
  TrendingUp,
} from 'lucide-react';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ModelEvaluationPage() {
  const [evaluationData, setEvaluationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Live K-Tuning Playground State
  const [tunedK, setTunedK] = useState(5);
  const [tuneInit, setTuneInit] = useState('k-means++');
  const [tuningResult, setTuningResult] = useState(null);
  const [isTuning, setIsTuning] = useState(false);

  useEffect(() => {
    async function loadEvaluation() {
      try {
        setLoading(true);
        const [res, initialTune] = await Promise.all([
          apiService.getEvaluationMetrics(),
          apiService.tuneKMeans(5, 'k-means++'),
        ]);
        setEvaluationData(res);
        setTuningResult(initialTune);
      } catch (err) {
        setError(err.message || 'Failed to load model evaluation metrics');
      } finally {
        setLoading(false);
      }
    }
    loadEvaluation();
  }, []);

  const handleTuneChange = async (kVal, initVal) => {
    setTunedK(kVal);
    setTuneInit(initVal);
    try {
      setIsTuning(true);
      const res = await apiService.tuneKMeans(kVal, initVal);
      setTuningResult(res);
    } catch (err) {
      console.error('Failed to tune K-Means:', err);
    } finally {
      setIsTuning(false);
    }
  };

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

  const elbowEvals = evaluationData?.elbow || [];
  const silEvals = evaluationData?.silhouette || [];
  const multimetricEvals = evaluationData?.multimetric || [];
  const finalMetrics = evaluationData?.final_metrics || {
    silhouette_score: 0.5547,
    davies_bouldin_index: 0.5722,
    calinski_harabasz_score: 248.65,
  };

  const comparisonTable = multimetricEvals.map((item) => {
    const elbowMatch = elbowEvals.find((e) => e.k === item.k);
    return {
      k: item.k,
      inertia: elbowMatch ? elbowMatch.inertia : '—',
      silhouette: item.silhouette_score,
      daviesBouldin: item.davies_bouldin_index,
      calinskiHarabasz: item.calinski_harabasz_score,
      isOptimal: item.is_optimal,
    };
  });

  const elbowExp =
    evaluationData?.explanations?.elbow ||
    'The Elbow Method charts Inertia (WCSS) against K. The distinct bend occurs at K=5.';
  const silExp =
    evaluationData?.explanations?.silhouette ||
    'Silhouette scores measure cluster cohesion vs separation. The global maximum is at K=5.';
  const optimal_score = finalMetrics.silhouette_score;

  // Live tuning data
  const tunedPoints = tuningResult?.points || [];
  const tunedCentroids = tuningResult?.centroids || [];

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
            Mathematical justification for selecting K = 5 using Within-Cluster Sum of Squares (Inertia), Silhouette Coefficient, Davies-Bouldin, and Calinski-Harabasz indices.
          </p>
        </div>

        {/* Model Lab Specification Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mt-6 pt-5 border-t border-purple-50">
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
              SCALER
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
              RESTARTS
            </span>
            <span className="text-xs font-bold text-slate-800 block mt-0.5">
              n_init = 10
            </span>
          </div>

          <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
            <span className="text-[10px] font-bold text-[#6d28d9] uppercase tracking-wider block">
              OPTIMAL K
            </span>
            <span className="text-sm font-extrabold text-[#5b21b6] font-display block mt-0.5">
              5 Clusters
            </span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
              SILHOUETTE (↑)
            </span>
            <span className="text-sm font-extrabold text-emerald-700 font-display block mt-0.5">
              {finalMetrics.silhouette_score}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
              DAVIES-BOULDIN (↓)
            </span>
            <span className="text-sm font-extrabold text-blue-700 font-display block mt-0.5">
              {finalMetrics.davies_bouldin_index}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
              CALINSKI-HARABASZ (↑)
            </span>
            <span className="text-sm font-extrabold text-amber-700 font-display block mt-0.5">
              {finalMetrics.calinski_harabasz_score}
            </span>
          </div>
        </div>
      </div>

      {/* NEW FEATURE: Live K-Tuning Playground */}
      <div className="analytics-card p-6 sm:p-8 border-2 border-purple-200/80 bg-gradient-to-br from-white via-purple-50/10 to-indigo-50/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-purple-100">
          <div>
            <span className="text-xs font-bold text-[#7c3aed] uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4" />
              Interactive Experimentation Lab
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              Live K-Means Tuning & Re-Clustering Playground
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Adjust cluster count K in real time to observe live centroid convergence, boundary shifts, and multi-metric validation dynamics.
            </p>
          </div>

          {tuningResult && (
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border shadow-xs ${
                  tuningResult.k === 5
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                {tuningResult.status} (K = {tuningResult.k})
              </span>
              <button
                onClick={() => handleTuneChange(5, 'k-means++')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-purple-50"
                title="Reset to Optimal K=5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
                <span>Reset (K=5)</span>
              </button>
            </div>
          )}
        </div>

        {/* Controls Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
          {/* Slider & Quick Buttons */}
          <div className="md:col-span-8 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700">
                Number of Clusters (K)
              </label>
              <span className="text-sm font-extrabold text-[#7c3aed] font-mono">
                K = {tunedK} Clusters
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="10"
              step="1"
              value={tunedK}
              onChange={(e) => handleTuneChange(Number(e.target.value), tuneInit)}
              className="w-full accent-[#7c3aed] cursor-pointer"
            />
            {/* Quick Snap Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[2, 3, 4, 5, 6, 7, 8].map((val) => (
                <button
                  key={val}
                  onClick={() => handleTuneChange(val, tuneInit)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    tunedK === val
                      ? 'bg-[#7c3aed] text-white shadow-xs'
                      : val === 5
                      ? 'bg-purple-100 text-[#7c3aed] border border-purple-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  K = {val} {val === 5 && '★'}
                </button>
              ))}
            </div>
          </div>

          {/* Init Selector */}
          <div className="md:col-span-4 space-y-3">
            <label className="text-xs font-bold text-slate-700 block">
              Centroid Seeding Strategy
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleTuneChange(tunedK, 'k-means++')}
                className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                  tuneInit === 'k-means++'
                    ? 'border-[#7c3aed] bg-white text-[#7c3aed] ring-1 ring-purple-300 shadow-xs'
                    : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white'
                }`}
              >
                <p className="font-bold">k-means++</p>
                <span className="text-[10px] text-slate-400">Probabilistic</span>
              </button>
              <button
                onClick={() => handleTuneChange(tunedK, 'random')}
                className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                  tuneInit === 'random'
                    ? 'border-[#7c3aed] bg-white text-[#7c3aed] ring-1 ring-purple-300 shadow-xs'
                    : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white'
                }`}
              >
                <p className="font-bold">Random</p>
                <span className="text-[10px] text-slate-400">Uniform</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Metrics Quad-Card */}
        {tuningResult && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="p-4 rounded-xl bg-white border border-purple-100 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                INERTIA (WCSS)
              </span>
              <p className="text-xl font-extrabold text-slate-900 font-mono mt-1">
                {tuningResult.inertia}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-purple-100 shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  SILHOUETTE SCORE
                </span>
                {tuningResult.k === 5 && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                    Global Peak
                  </span>
                )}
              </div>
              <p
                className={`text-xl font-extrabold font-mono mt-1 ${
                  tuningResult.k === 5 ? 'text-emerald-700' : 'text-slate-800'
                }`}
              >
                {tuningResult.silhouette_score}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-purple-100 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                DAVIES-BOULDIN
              </span>
              <p className="text-xl font-extrabold text-blue-700 font-mono mt-1">
                {tuningResult.davies_bouldin_index}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-purple-100 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                CALINSKI-HARABASZ
              </span>
              <p className="text-xl font-extrabold text-amber-700 font-mono mt-1">
                {tuningResult.calinski_harabasz_score}
              </p>
            </div>
          </div>
        )}

        {/* Live Tuning Scatter Visualization & Commentary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Scatter Chart for Tuned Clusters */}
          <div className="lg:col-span-8 bg-white p-4 rounded-2xl border border-purple-100 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-[#7c3aed]" />
                Dynamically Fitted Scatter Space (K = {tunedK})
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {tunedCentroids.length} Centroids
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -10 }}>
                  <XAxis
                    type="number"
                    dataKey="income"
                    name="Income"
                    domain={[10, 145]}
                    stroke="#94a3b8"
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    label={{ value: 'Income ($k)', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 10 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="spending"
                    name="Spending"
                    domain={[0, 105]}
                    stroke="#94a3b8"
                    tick={{ fill: '#64748b', fontSize: 10 }}
                  />
                  <ZAxis range={[50, 70]} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-white border border-purple-100 p-2.5 rounded-xl shadow-card text-xs">
                            <strong className="text-slate-900 block">
                              {item.isCentroid ? `Centroid C${item.cluster}` : `Customer #${item.customerId}`}
                            </strong>
                            <span className="font-mono text-purple-700 text-[11px]">
                              Income: ${item.income}k · Spend: {item.spending}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter data={tunedPoints}>
                    {tunedPoints.map((entry, idx) => (
                      <Cell key={`pt-${idx}`} fill={entry.color} fillOpacity={0.85} />
                    ))}
                  </Scatter>
                  <Scatter
                    data={tunedCentroids.map((c) => ({ ...c, isCentroid: true }))}
                    shape="diamond"
                  >
                    {tunedCentroids.map((entry, idx) => (
                      <Cell key={`c-${idx}`} fill="#1e1b4b" stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pedagogical Commentary & Cluster Proportions */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
            <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-xs space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                EXAMINER INSIGHT & ANALYSIS
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {tuningResult?.commentary}
              </p>
              <div className="pt-2 border-t border-purple-50 text-[11px] text-slate-500">
                <strong>Why K=5 wins:</strong> K=5 maximizes the variance ratio criterion while ensuring every cohort maintains statistically significant sample mass.
              </div>
            </div>

            {/* Cluster Proportions Mini-List */}
            <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                CLUSTER SIZES
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {tunedCentroids.map((c) => (
                  <div key={c.cluster} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="font-semibold text-slate-700">Cluster {c.cluster}</span>
                    </div>
                    <span className="font-mono text-slate-600 font-bold">
                      {c.count} ({c.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
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
                <th className="py-2.5 px-3">Silhouette (↑)</th>
                <th className="py-2.5 px-3">Davies-Bouldin (↓)</th>
                <th className="py-2.5 px-3">Calinski-Harabasz (↑)</th>
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
                  <td className="py-3 px-3 font-mono">
                    <span className={row.isOptimal ? 'text-blue-700 font-bold' : 'text-slate-700'}>
                      {row.daviesBouldin}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <span className={row.isOptimal ? 'text-amber-700 font-bold' : 'text-slate-700'}>
                      {row.calinskiHarabasz}
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
