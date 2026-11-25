import React, { useState } from 'react';
import {
  UserCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Crown,
  Zap,
  Leaf,
  BarChart3,
  Sliders,
} from 'lucide-react';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const PRESET_PERSONAS = [
  {
    name: 'Tech Executive (VIP)',
    income: 88,
    spending_score: 82,
    age: 32,
    gender: 'Female',
  },
  {
    name: 'Affluent Saver',
    income: 86,
    spending_score: 18,
    age: 44,
    gender: 'Male',
  },
  {
    name: 'Trend Follower',
    income: 25,
    spending_score: 79,
    age: 23,
    gender: 'Female',
  },
  {
    name: 'Budget Shopper',
    income: 26,
    spending_score: 20,
    age: 49,
    gender: 'Male',
  },
  {
    name: 'Mainstream Customer',
    income: 55,
    spending_score: 50,
    age: 36,
    gender: 'Female',
  },
];

const CLUSTER_COLORS = {
  0: '#0ea5e9', // C0 - Moderate/Moderate
  1: '#f59e0b', // C1 - High/High
  2: '#a855f7', // C2 - Low/High
  3: '#ef4444', // C3 - High/Low
  4: '#22c55e', // C4 - Low/Low
};

export default function CustomerSegmentationPage() {
  const [formData, setFormData] = useState({
    age: 32,
    gender: 'Female',
    income: 86,
    spending_score: 82,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.predictSegment(formData);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Segmentation failed');
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (preset) => {
    const updated = {
      age: preset.age,
      gender: preset.gender,
      income: preset.income,
      spending_score: preset.spending_score,
    };
    setFormData(updated);
    setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiService.predictSegment(updated);
        setResult(res);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 50);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-purple-100 p-6 sm:p-8 shadow-soft">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold text-[#7c3aed] uppercase tracking-wider">
            Customer Intelligence Lab
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Analyze a Customer
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Discover which customer segment best matches this profile using fitted StandardScaler normalization and trained K-Means++.
          </p>
        </div>

        {/* Quick Test Persona Pills */}
        <div className="mt-5 pt-4 border-t border-purple-50 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
            Test Profiles:
          </span>
          {PRESET_PERSONAS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => loadPreset(preset)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#fcfaff] hover:bg-purple-100/60 text-slate-700 hover:text-purple-900 border border-purple-100 transition-colors flex items-center space-x-1.5"
            >
              <span>{preset.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">
                (${preset.income}k, {preset.spending_score})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form & Prediction Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Card (5 cols) */}
        <div className="lg:col-span-5 analytics-card p-6">
          <h3 className="text-base font-bold text-slate-900 tracking-tight mb-4 flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-[#7c3aed]" />
            <span>Customer Attributes</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Annual Income */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Annual Income (k$)</span>
                <span className="text-[#6d28d9] font-bold font-mono">₹{formData.income}k</span>
              </div>
              <input
                type="range"
                min="10"
                max="140"
                step="1"
                value={formData.income}
                onChange={(e) => setFormData({ ...formData, income: parseFloat(e.target.value) })}
                className="w-full accent-purple-600 h-2 bg-purple-100 rounded-lg cursor-pointer"
              />
              <input
                type="number"
                min="1"
                max="200"
                value={formData.income}
                onChange={(e) => setFormData({ ...formData, income: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#fcfaff] border border-purple-100 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-purple-400"
                required
              />
            </div>

            {/* Spending Score */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Spending Score (1-100)</span>
                <span className="text-[#6d28d9] font-bold font-mono">{formData.spending_score}/100</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={formData.spending_score}
                onChange={(e) => setFormData({ ...formData, spending_score: parseFloat(e.target.value) })}
                className="w-full accent-purple-600 h-2 bg-purple-100 rounded-lg cursor-pointer"
              />
              <input
                type="number"
                min="1"
                max="100"
                value={formData.spending_score}
                onChange={(e) => setFormData({ ...formData, spending_score: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#fcfaff] border border-purple-100 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-purple-400"
                required
              />
            </div>

            {/* Age & Gender */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="15"
                  max="100"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 30 })}
                  className="w-full bg-[#fcfaff] border border-purple-100 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full bg-[#fcfaff] border border-purple-100 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-purple-400"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              Features used in K-Means++: Annual Income and Spending Score. Age/Gender are contextual profile attributes.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs tracking-wide bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] hover:from-[#5b21b6] hover:to-[#6d28d9] text-white shadow-md shadow-purple-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Analyzing Profile...' : 'Analyze Customer →'}</span>
            </button>
          </form>
        </div>

        {/* Prediction Result Display (7 cols) */}
        <div className="lg:col-span-7">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs mb-4">
              {error}
            </div>
          )}

          {result ? (
            <div
              className="analytics-card p-7 space-y-5 relative overflow-hidden"
              style={{
                borderTop: `5px solid ${CLUSTER_COLORS[result.assigned_cluster] || '#7c3aed'}`,
              }}
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7c3aed] block mb-1">
                  YOUR CUSTOMER SEGMENT
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display uppercase">
                  {result.segment_name}
                </h3>
                <p className="text-xs font-bold text-slate-500 mt-0.5 uppercase tracking-wide">
                  {result.persona}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[#fcfaff] border border-purple-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Assigned Cluster</span>
                  <span
                    className="text-base font-extrabold font-mono"
                    style={{ color: CLUSTER_COLORS[result.assigned_cluster] }}
                  >
                    Cluster {result.assigned_cluster}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Distance to Centroid</span>
                  <span className="text-base font-extrabold text-slate-900 font-mono">
                    {result.distance_to_centroid}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Annual Income</span>
                  <span className="text-base font-extrabold text-slate-900 font-mono">
                    ₹{result.customer_input.income}k
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Spending Score</span>
                  <span className="text-base font-extrabold text-slate-900 font-mono">
                    {result.customer_input.spending_score}/100
                  </span>
                </div>
              </div>

              {/* Recommended Strategy Box */}
              <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-100 space-y-2">
                <span className="text-xs font-bold text-[#5b21b6] uppercase tracking-wider flex items-center space-x-1.5">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span>Recommended Marketing Strategy</span>
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {result.marketing_strategy}
                </p>
              </div>

              {/* Segment Characteristics */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-100 text-xs text-slate-500 leading-relaxed">
                <span className="font-bold text-slate-800">Cluster Benchmark: </span>
                This customer matches a cluster representing {result.cluster_statistics.customer_count} mall shoppers ({result.cluster_statistics.percentage_of_mall}%) with an average income of ₹{result.cluster_statistics.centroid_income}k and spending score of {result.cluster_statistics.centroid_spending}/100.
              </div>

              {/* Surrogate Decision Tree Explanation */}
              {result.surrogate_explanation && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Surrogate Decision Tree Explanation
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        result.surrogate_explanation.agrees_with_kmeans
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {result.surrogate_explanation.agrees_with_kmeans
                        ? 'Agrees with K-Means++'
                        : `Boundary Case (Tree: C${result.surrogate_explanation.surrogate_predicted_cluster})`}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.surrogate_explanation.path_steps?.map((step) => (
                      <span
                        key={step.step}
                        className="text-[11px] font-mono bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded"
                      >
                        {step.explanation}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {result.surrogate_explanation.explanation_narrative}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="analytics-card p-12 text-center flex flex-col items-center justify-center space-y-3 h-full">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-[#7c3aed]">
                <UserCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Ready to Segment</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Adjust the income and spending score sliders on the left or select a test profile to discover the customer's behavioral segment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
