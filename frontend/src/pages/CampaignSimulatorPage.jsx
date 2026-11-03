import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Percent,
  Megaphone,
  Mail,
  MessageSquare,
  Share2,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const CHANNELS = [
  { id: 'email', name: 'Email Marketing', icon: Mail, cost: '$0.05 / contact' },
  { id: 'sms', name: 'SMS Blast', icon: MessageSquare, cost: '$0.15 / contact' },
  { id: 'social_ads', name: 'Social Ads (Meta/IG)', icon: Share2, cost: '$0.75 / click' },
  { id: 'vip_concierge', name: 'VIP Concierge / Mailer', icon: Award, cost: '$8.50 / client' },
];

export default function CampaignSimulatorPage() {
  const [clusters, setClusters] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState(0);
  const [budget, setBudget] = useState(2500);
  const [discountPct, setDiscountPct] = useState(15);
  const [channel, setChannel] = useState('email');
  const [simResult, setSimResult] = useState(null);
  const [clvData, setClvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        const [summaryRes, clvRes] = await Promise.all([
          apiService.getClusterSummary(),
          apiService.getClvAnalysis(),
        ]);
        setClusters(summaryRes);
        setClvData(clvRes);
        // Run initial simulation
        const initialSim = await apiService.simulateCampaign({
          cluster_id: 0,
          budget: 2500,
          discount_pct: 15,
          channel: 'email',
        });
        setSimResult(initialSim);
      } catch (err) {
        console.error('Failed to initialize simulator:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  const runSimulation = async (cId, bgt, disc, ch) => {
    try {
      setSimulating(true);
      const res = await apiService.simulateCampaign({
        cluster_id: Number(cId),
        budget: Number(bgt),
        discount_pct: Number(disc),
        channel: ch,
      });
      setSimResult(res);
    } catch (err) {
      console.error('Simulation calculation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  const handleClusterChange = (cId) => {
    setSelectedCluster(cId);
    runSimulation(cId, budget, discountPct, channel);
  };

  const handleBudgetChange = (val) => {
    setBudget(val);
    runSimulation(selectedCluster, val, discountPct, channel);
  };

  const handleDiscountChange = (val) => {
    setDiscountPct(val);
    runSimulation(selectedCluster, budget, val, channel);
  };

  const handleChannelChange = (ch) => {
    setChannel(ch);
    runSimulation(selectedCluster, budget, discountPct, ch);
  };

  if (loading) {
    return <LoadingSpinner message="Calibrating Marketing Simulator & CLV Engine..." />;
  }

  const metrics = simResult?.metrics || {};
  const inputs = simResult?.inputs || {};
  const activeClusterInfo = clusters.find((c) => c.cluster === Number(selectedCluster)) || clusters[0];
  const clvInfo = clvData?.clusters?.find((c) => c.cluster === Number(selectedCluster));

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-purple-100 p-6 sm:p-8 shadow-soft">
        <div className="max-w-3xl space-y-2">
          <span className="text-xs font-bold text-[#7c3aed] uppercase tracking-wider flex items-center gap-1.5">
            <Megaphone className="w-4 h-4" />
            Strategic Marketing Engine
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Marketing Campaign ROI Simulator
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Model campaign performance, projected revenue, customer response elasticity, and Return On Ad Spend (ROAS) tailored to specific customer personas.
          </p>
        </div>
      </div>

      {/* Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Campaign Controls */}
        <div className="lg:col-span-5 space-y-5">
          <div className="analytics-card p-6 space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-[#7c3aed]" />
              Campaign Parameters
            </h3>

            {/* Target Cohort Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Target Customer Segment
              </label>
              <select
                value={selectedCluster}
                onChange={(e) => handleClusterChange(e.target.value)}
                className="w-full text-xs font-semibold bg-purple-50/50 border border-purple-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                {clusters.map((c) => (
                  <option key={c.cluster} value={c.cluster}>
                    Cluster {c.cluster}: {c.persona} ({c.customer_count} shoppers)
                  </option>
                ))}
                <option value="-1">All Clusters Portfolio (Blended Cross-Segment)</option>
              </select>
            </div>

            {/* Campaign Budget */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wider">
                  Campaign Budget
                </span>
                <span className="font-mono font-extrabold text-[#7c3aed] text-sm">
                  ${Number(budget).toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="200"
                max="20000"
                step="100"
                value={budget}
                onChange={(e) => handleBudgetChange(e.target.value)}
                className="w-full accent-[#7c3aed] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>$200</span>
                <span>$10,000</span>
                <span>$20,000</span>
              </div>
            </div>

            {/* Promotional Discount */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wider">
                  Promotional Discount
                </span>
                <span className="font-mono font-extrabold text-[#7c3aed] text-sm">
                  {discountPct}% OFF
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="45"
                step="5"
                value={discountPct}
                onChange={(e) => handleDiscountChange(e.target.value)}
                className="w-full accent-[#7c3aed] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0% (Full Price)</span>
                <span>20%</span>
                <span>45% (Deep Promo)</span>
              </div>
            </div>

            {/* Channel Cards */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Marketing Channel
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {CHANNELS.map((ch) => {
                  const Icon = ch.icon;
                  const isSelected = channel === ch.id;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => handleChannelChange(ch.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#7c3aed] bg-purple-50/70 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-purple-200 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-[#7c3aed]' : 'text-slate-500'}`} />
                      <div className="text-xs font-bold text-slate-800 leading-tight">
                        {ch.name}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {ch.cost}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Target Persona Card */}
          {activeClusterInfo && (
            <div
              className="analytics-card p-5 border-l-4"
              style={{ borderLeftColor: activeClusterInfo.color }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                  style={{
                    backgroundColor: `${activeClusterInfo.color}15`,
                    color: activeClusterInfo.color,
                  }}
                >
                  {activeClusterInfo.badge || 'Active Target'}
                </span>
                {clvInfo && (
                  <span className="text-[11px] font-mono font-bold text-slate-500">
                    Tier: {clvInfo.tier}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                {activeClusterInfo.persona}
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {activeClusterInfo.strategy}
              </p>
              {clvInfo && (
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-purple-50 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Avg 3-Yr CLV</span>
                    <span className="font-bold text-slate-800 font-mono">
                      ${Number(clvInfo.avg_3yr_clv).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Churn Risk</span>
                    <span className="font-bold text-slate-800">
                      {clvInfo.churn_risk}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Projected ROI & Simulation Analytics */}
        <div className="lg:col-span-7 space-y-5">
          {/* Top Performance Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* ROAS Card */}
            <div className="analytics-card p-5 bg-gradient-to-br from-white to-purple-50/40">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                PROJECTED ROAS
              </span>
              <div className="text-3xl font-extrabold text-[#7c3aed] font-display mt-1">
                {metrics.roas}x
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 block mt-1">
                Return on Ad Spend
              </span>
            </div>

            {/* Net Profit Card */}
            <div className="analytics-card p-5 bg-gradient-to-br from-white to-emerald-50/30">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                ESTIMATED NET PROFIT
              </span>
              <div
                className={`text-3xl font-extrabold font-display mt-1 ${
                  metrics.net_profit >= 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                ${Number(metrics.net_profit || 0).toLocaleString()}
              </div>
              <span className="text-[11px] font-semibold text-slate-500 block mt-1">
                ROI: {metrics.roi_percentage}%
              </span>
            </div>

            {/* Projected Conversions */}
            <div className="analytics-card p-5 bg-gradient-to-br from-white to-blue-50/30">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                EST. ORDERS
              </span>
              <div className="text-3xl font-extrabold text-blue-700 font-display mt-1">
                {Number(metrics.estimated_conversions || 0).toLocaleString()}
              </div>
              <span className="text-[11px] font-semibold text-slate-500 block mt-1">
                Conv Rate: {metrics.conversion_rate_pct}%
              </span>
            </div>
          </div>

          {/* Recommendation Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              metrics.roas >= 2.5
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : metrics.roas >= 1.0
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center space-x-3">
              {metrics.roas >= 2.5 ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              )}
              <div>
                <h4 className="text-xs font-bold tracking-tight">
                  {metrics.verdict}
                </h4>
                <p className="text-[11px] opacity-80 mt-0.5">
                  Audience size reached: {Number(metrics.contacts_reached || 0).toLocaleString()} shoppers
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/70 shadow-xs uppercase">
              {metrics.verdict_badge}
            </span>
          </div>

          {/* Financial Breakdown Table */}
          <div className="analytics-card p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Financial Breakdown & Unit Economics
            </h3>
            <div className="divide-y divide-purple-50 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Target Segment</span>
                <span className="font-bold text-slate-800">{inputs.persona}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Marketing Channel</span>
                <span className="font-bold text-slate-800">{inputs.channel}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Discount Offered</span>
                <span className="font-mono font-bold text-slate-800">{inputs.discount_pct}%</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Effective Average Order Value (AOV)</span>
                <span className="font-mono font-bold text-slate-800">
                  ${metrics.discounted_aov} (Base: ${metrics.undiscounted_aov})
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Estimated Gross Revenue</span>
                <span className="font-mono font-extrabold text-[#7c3aed]">
                  ${Number(metrics.gross_revenue || 0).toLocaleString()}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Cost of Goods & Fulfillment (COGS)</span>
                <span className="font-mono text-slate-700">
                  -${Number(metrics.total_cogs || 0).toLocaleString()}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Campaign Marketing Spend</span>
                <span className="font-mono text-slate-700">
                  -${Number(inputs.budget || 0).toLocaleString()}
                </span>
              </div>
              <div className="py-3 flex justify-between text-sm font-bold bg-purple-50/40 -mx-6 px-6 mt-2 rounded-xl">
                <span className="text-slate-900">Projected Net Contribution Profit</span>
                <span
                  className={`font-mono ${
                    metrics.net_profit >= 0 ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  ${Number(metrics.net_profit || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
