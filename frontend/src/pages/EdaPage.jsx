import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import {
  Users,
  DollarSign,
  ShoppingBag,
  Sparkles,
  BarChart2,
  TrendingUp,
} from 'lucide-react';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const GENDER_COLORS = {
  Female: '#f472b6', // Soft pink
  Male: '#60a5fa',   // Soft blue
};

export default function EdaPage() {
  const [edaData, setEdaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadEDA() {
      try {
        setLoading(true);
        const res = await apiService.getEda();
        setEdaData(res);
      } catch (err) {
        setError(err.message || 'Failed to load EDA data');
      } finally {
        setLoading(false);
      }
    }
    loadEDA();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Generating exploratory data analysis..." />;
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl my-6">
        <p className="text-red-600 font-semibold mb-1">Error loading EDA</p>
        <p className="text-slate-500 text-sm">{error}</p>
      </div>
    );
  }

  const {
    age_distribution = [],
    income_distribution = [],
    spending_distribution = [],
    gender_distribution = [],
    scatter_data = [],
    insights = [],
  } = edaData;

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Editorial Header */}
      <div className="bg-white rounded-2xl border border-purple-100 p-6 sm:p-8 shadow-soft">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold text-[#7c3aed] uppercase tracking-wider">
            Exploratory Data Story
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Understanding Mall Shopper Behavior
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Before applying K-Means++, we examine customer demographic distributions, earning tiers, and natural spending dispersion.
          </p>
        </div>

        {/* Narrative Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-5 border-t border-purple-50">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[#fcfaff] border border-purple-100/70 text-xs text-slate-700 leading-relaxed flex items-start space-x-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] mt-1.5 flex-shrink-0" />
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Row 1: Who are the customers? (Age) + Who shops here? (Gender) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Story 1: Who are the customers? (Age Distribution) */}
        <div className="lg:col-span-7 analytics-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                STORY 01
              </span>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                "Who are the customers?"
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Customer age distribution across 10-year demographic cohorts
            </p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={age_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="range" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  cursor={{ fill: 'rgba(124, 58, 237, 0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-purple-100 p-2.5 rounded-xl text-xs shadow-card">
                          <p className="font-bold text-slate-900">Age Bracket: {payload[0].payload.range} yrs</p>
                          <p className="text-[#6d28d9] font-bold mt-0.5">{payload[0].value} Customers</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Story 2: Who shops here? (Gender Distribution) */}
        <div className="lg:col-span-5 analytics-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-100">
                STORY 02
              </span>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                "Who shops here?"
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Gender split across the 200 surveyed mall visitors
            </p>
          </div>

          <div className="h-44 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gender_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={68}
                  paddingAngle={6}
                  dataKey="count"
                  nameKey="gender"
                >
                  {gender_distribution.map((entry) => (
                    <Cell
                      key={entry.gender}
                      fill={GENDER_COLORS[entry.gender] || '#a855f7'}
                      stroke="#ffffff"
                      strokeWidth={3}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const g = payload[0].payload;
                      return (
                        <div className="bg-white border border-purple-100 p-2.5 rounded-xl text-xs shadow-card">
                          <p className="font-bold text-slate-900">{g.gender}</p>
                          <p className="text-slate-600 font-medium">
                            {g.count} shoppers ({g.percentage}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
            {gender_distribution.map((g) => (
              <div
                key={g.gender}
                className="p-2.5 rounded-xl bg-[#fcfaff] border border-purple-100 flex flex-col items-center"
              >
                <span
                  className="text-xs font-bold"
                  style={{ color: GENDER_COLORS[g.gender] }}
                >
                  {g.gender}
                </span>
                <span className="text-lg font-extrabold text-slate-900 font-display mt-0.5">
                  {g.count}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">{g.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: How much do they earn? (Income) + How do they spend? (Spending) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Story 3: How much do they earn? */}
        <div className="analytics-card p-6">
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
              STORY 03
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              "How much do they earn?"
            </h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Annual Income distribution across $15k to $140k ranges
          </p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={income_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="range" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  cursor={{ fill: 'rgba(245, 158, 11, 0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-amber-100 p-2.5 rounded-xl text-xs shadow-card">
                          <p className="font-bold text-slate-900">Income: ${payload[0].payload.range}</p>
                          <p className="text-amber-600 font-bold mt-0.5">{payload[0].value} Customers</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Story 4: How do they spend? */}
        <div className="analytics-card p-6">
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
              STORY 04
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              "How do they spend?"
            </h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Spending Score density across 20-point tiers (1 to 100)
          </p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spending_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="range" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  cursor={{ fill: 'rgba(34, 197, 94, 0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-emerald-100 p-2.5 rounded-xl text-xs shadow-card">
                          <p className="font-bold text-slate-900">Score Range: {payload[0].payload.range}</p>
                          <p className="text-emerald-600 font-bold mt-0.5">{payload[0].value} Customers</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Where do customers fall? (Income vs Spending Scatter) */}
      <div className="analytics-card p-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-100">
                STORY 05
              </span>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                "Where do customers fall?"
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Raw 2D spatial dispersion of Annual Income against Spending Score showing natural cohorts
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-medium">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-400" />
              <span className="text-slate-600">Female (112)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <span className="text-slate-600">Male (88)</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 15, right: 15, bottom: 20, left: -10 }}>
              <XAxis
                type="number"
                dataKey="annualIncome"
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
                dataKey="spendingScore"
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
              <ZAxis range={[55, 65]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white border border-purple-100 p-3 rounded-xl shadow-card text-xs space-y-1">
                        <p className="font-bold text-slate-900">Customer #{d.customerId}</p>
                        <p className="text-slate-600">
                          {d.gender}, {d.age} yrs
                        </p>
                        <div className="text-slate-500 pt-1 border-t border-slate-100 text-[11px]">
                          <p>Income: <strong className="text-slate-800">${d.annualIncome}k</strong></p>
                          <p>Spending Score: <strong className="text-slate-800">{d.spendingScore}/100</strong></p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="Shoppers" data={scatter_data}>
                {scatter_data.map((entry, index) => (
                  <Cell
                    key={`eda-pt-${index}`}
                    fill={GENDER_COLORS[entry.gender] || '#8b5cf6'}
                    fillOpacity={0.82}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
