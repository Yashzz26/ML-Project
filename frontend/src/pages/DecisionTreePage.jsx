import React, { useState, useEffect } from 'react';
import {
  GitFork,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Target,
  Sliders,
  DollarSign,
  ShoppingBag,
  Cpu,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const PRESET_PERSONAS = [
  { label: 'VIP Customer', income: 85, spending: 85, desc: 'High Income, High Spend' },
  { label: 'Under-Engaged', income: 90, spending: 20, desc: 'High Income, Low Spend' },
  { label: 'Trend Spender', income: 25, spending: 75, desc: 'Low Income, High Spend' },
  { label: 'Budget Shopper', income: 25, spending: 20, desc: 'Low Income, Low Spend' },
  { label: 'Mainstream', income: 55, spending: 50, desc: 'Moderate Income & Spend' },
];

export default function DecisionTreePage() {
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tracer state
  const [inputIncome, setInputIncome] = useState(85);
  const [inputSpending, setInputSpending] = useState(85);
  const [traceResult, setTraceResult] = useState(null);
  const [tracing, setTracing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);

  useEffect(() => {
    async function loadTree() {
      try {
        setLoading(true);
        const [res, trace] = await Promise.all([
          apiService.getDecisionTree(),
          apiService.traceDecisionTree(85, 85),
        ]);
        setTreeData(res);
        setTraceResult(trace);
      } catch (err) {
        setError(err.message || 'Failed to load Decision Tree explainability data');
      } finally {
        setLoading(false);
      }
    }
    loadTree();
  }, []);

  const handleTrace = async (inc, spd) => {
    try {
      setTracing(true);
      const res = await apiService.traceDecisionTree(inc, spd);
      setTraceResult(res);
    } catch (err) {
      console.error('Failed to trace customer:', err);
    } finally {
      setTracing(false);
    }
  };

  const applyPreset = (preset) => {
    setInputIncome(preset.income);
    setInputSpending(preset.spending);
    handleTrace(preset.income, preset.spending);
  };

  if (loading) return <LoadingSpinner message="Extracting surrogate Decision Tree production rules..." />;

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl my-6">
        <p className="text-red-600 font-semibold mb-1">Error loading Decision Tree</p>
        <p className="text-slate-500 text-sm">{error}</p>
      </div>
    );
  }

  const nodes = treeData?.nodes || [];
  const rules = treeData?.rules || [];
  const importances = treeData?.feature_importances || {};
  const activePathNodeIds = new Set(
    traceResult?.path_steps?.map((s) => s.node_id) || []
  );
  if (traceResult?.leaf_node_id !== undefined) {
    activePathNodeIds.add(traceResult.leaf_node_id);
  }

  const filteredRules =
    selectedFilter !== null
      ? rules.filter((r) => r.cluster === selectedFilter)
      : rules;

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-purple-100 p-6 sm:p-8 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#7c3aed] uppercase tracking-wider flex items-center gap-1.5">
              <GitFork className="w-4 h-4" />
              Explainable AI (XAI) & Model Transparency
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Surrogate Decision Tree & Rule Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-2 max-w-2xl">
              Unsupervised K-Means algorithms do not natively output conditional logic. This surrogate Decision Tree extracts the exact <strong>IF-THEN decision boundaries</strong> that govern cohort placement with mathematical fidelity.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-purple-50/60 border border-purple-100 px-4 py-3 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-[#7c3aed] text-white flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                SURROGATE FIDELITY
              </span>
              <span className="text-lg font-extrabold text-[#5b21b6]">
                {treeData?.fidelity_accuracy_pct}% Match
              </span>
            </div>
          </div>
        </div>

        {/* Spec Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-purple-50">
          <div className="p-3 rounded-xl bg-[#fcfaff] border border-purple-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              TREE ARCHITECTURE
            </span>
            <span className="text-xs font-bold text-slate-800 block mt-0.5">
              Entropy · Max Depth {treeData?.max_depth}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#fcfaff] border border-purple-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              DECISION SPLITS
            </span>
            <span className="text-xs font-bold text-slate-800 block mt-0.5">
              {nodes.filter((n) => !n.is_leaf).length} Decision Gates
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#fcfaff] border border-purple-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              EXTRACTED RULES
            </span>
            <span className="text-xs font-bold text-slate-800 block mt-0.5">
              {rules.length} Production Rules
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#fcfaff] border border-purple-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              DOMINANT DRIVER
            </span>
            <span className="text-xs font-bold text-purple-700 block mt-0.5">
              Spending Score (53.8%)
            </span>
          </div>
        </div>
      </div>

      {/* Feature Importance & Explainability Rationale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="analytics-card p-6">
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-[#7c3aed]" />
            Feature Importance Weighting
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Proportion of information gain contributed by each target feature in delineating segments.
          </p>

          <div className="space-y-4">
            {Object.entries(importances).map(([feat, pct]) => (
              <div key={feat} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">{feat}</span>
                  <span className="font-mono text-[#7c3aed]">{pct}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#7c3aed] to-purple-400 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-[11px] text-slate-600 leading-relaxed">
            <strong>Viva Presentation Tip:</strong> While Annual Income provides macro-economic separation, customer Spending Score provides sharper discriminatory power at the cluster boundary level.
          </div>
        </div>

        {/* Interactive Customer Rule Tracer ("Explain Any Customer") */}
        <div className="analytics-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Target className="w-4 h-4 text-[#7c3aed]" />
                Customer Path Tracer (Live Decision Walk)
              </h3>
              <p className="text-xs text-slate-400">
                Input any customer metrics or choose a persona preset to trace the exact evaluation route through the decision tree.
              </p>
            </div>
            {tracing && (
              <span className="text-xs text-[#7c3aed] font-semibold animate-pulse">
                Evaluating path...
              </span>
            )}
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 my-3">
            <span className="text-xs font-bold text-slate-400 mr-1">Presets:</span>
            {PRESET_PERSONAS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-purple-100 hover:text-[#7c3aed] text-slate-700 transition-all border border-slate-200"
              >
                {preset.label} (${preset.income}k / {preset.spending})
              </button>
            ))}
          </div>

          {/* Input Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Annual Income (k$)</span>
                <span className="font-mono font-bold text-[#7c3aed]">${inputIncome}k</span>
              </div>
              <input
                type="range"
                min="10"
                max="140"
                value={inputIncome}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setInputIncome(val);
                  handleTrace(val, inputSpending);
                }}
                className="w-full accent-[#7c3aed] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Spending Score (1-100)</span>
                <span className="font-mono font-bold text-[#7c3aed]">{inputSpending}/100</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={inputSpending}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setInputSpending(val);
                  handleTrace(inputIncome, val);
                }}
                className="w-full accent-[#7c3aed] cursor-pointer"
              />
            </div>
          </div>

          {/* Decision Path Breadcrumb */}
          {traceResult && (
            <div className="mt-5 p-4 rounded-2xl bg-[#fcfaff] border border-purple-100">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-purple-100">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: traceResult.color }}
                  />
                  <span className="font-bold text-slate-900 text-sm">
                    {traceResult.persona}
                  </span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${traceResult.color}15`,
                      color: traceResult.color,
                    }}
                  >
                    Cluster {traceResult.predicted_cluster} · {traceResult.badge}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {traceResult.path_steps?.length || 0} Decision Steps
                </span>
              </div>

              {/* Step Sequence */}
              <div className="space-y-2">
                {traceResult.path_steps?.map((step) => (
                  <div
                    key={step.step}
                    className="flex items-center text-xs bg-white p-2.5 rounded-xl border border-purple-100 shadow-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#7c3aed] text-white flex items-center justify-center font-bold text-[10px] mr-2.5 flex-shrink-0">
                      {step.step}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-slate-800">
                        {step.feature}
                      </span>
                      <span className="text-slate-400 mx-1.5">threshold check:</span>
                      <span className="font-mono text-[#7c3aed] font-bold">
                        {step.customer_value} {step.operator} {step.threshold}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ml-2 flex-shrink-0 ${
                        step.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {step.branch_taken}
                    </span>
                  </div>
                ))}
              </div>

              {/* Natural Language Narrative */}
              <div className="mt-3 pt-3 border-t border-purple-100 text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-900">Explainability Summary:</strong>{' '}
                {traceResult.explanation_narrative}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Visual Interactive Decision Tree Flow Diagram */}
      <div className="analytics-card p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#7c3aed]" />
              Visual Decision Tree Graph & Rule Topography
            </h3>
            <p className="text-xs text-slate-400">
              Active test customer's path is highlighted in violet. Green badge = passes condition (&le;), Blue badge = exceeds condition (&gt;).
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
            Fidelity: {treeData?.fidelity_accuracy_pct}%
          </span>
        </div>

        {/* Visual Node Grid Map */}
        <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/60 overflow-x-auto min-w-[720px]">
          {/* Level 0: Root */}
          <div className="flex justify-center mb-6">
            {nodes.filter((n) => n.id === 0).map((root) => {
              const isActive = activePathNodeIds.has(root.id);
              return (
                <div
                  key={root.id}
                  className={`w-72 p-3.5 rounded-2xl border transition-all duration-300 text-center shadow-sm ${
                    isActive
                      ? 'border-[#7c3aed] bg-purple-50 ring-2 ring-purple-300 shadow-md'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Level 0 · Root Gate
                  </span>
                  <p className="text-xs font-extrabold text-slate-900 mt-0.5">
                    {root.feature} &le; ${root.threshold}k?
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                    Samples: {root.samples} (100%)
                  </span>
                </div>
              );
            })}
          </div>

          {/* Level 1 Splits */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            {/* Left Branch of Root */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mb-2">
                YES (&le; $69.5k)
              </span>
              {nodes.filter((n) => n.id === 1).map((node) => {
                const isActive = activePathNodeIds.has(node.id);
                return (
                  <div
                    key={node.id}
                    className={`w-64 p-3 rounded-2xl border text-center transition-all ${
                      isActive
                        ? 'border-[#7c3aed] bg-purple-50 ring-2 ring-purple-300 shadow-md'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Gate 1 (Lower Incomes)
                    </span>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">
                      {node.feature} &le; ${node.threshold}k?
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                      Samples: {node.samples}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Right Branch of Root */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full mb-2">
                NO (&gt; $69.5k)
              </span>
              {nodes.filter((n) => n.id === 8).map((node) => {
                const isActive = activePathNodeIds.has(node.id);
                return (
                  <div
                    key={node.id}
                    className={`w-64 p-3 rounded-2xl border text-center transition-all ${
                      isActive
                        ? 'border-[#7c3aed] bg-purple-50 ring-2 ring-purple-300 shadow-md'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Gate 2 (Higher Incomes)
                    </span>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">
                      {node.feature} &le; {node.threshold}?
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                      Samples: {node.samples}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Level 2 & Leaf Personas Showcase */}
          <div className="grid grid-cols-5 gap-3 pt-4 border-t border-slate-200">
            {rules.slice(0, 5).map((rule, idx) => {
              const isActive = traceResult?.predicted_cluster === rule.cluster;
              return (
                <div
                  key={rule.rule_id}
                  className={`p-3 rounded-2xl border flex flex-col justify-between transition-all ${
                    isActive
                      ? 'border-2 shadow-lg ring-2 ring-purple-200 bg-white'
                      : 'border-slate-200 bg-white/90'
                  }`}
                  style={{ borderTopColor: rule.color, borderTopWidth: 4 }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.2 rounded"
                        style={{ backgroundColor: `${rule.color}20`, color: rule.color }}
                      >
                        C{rule.cluster}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-bold text-[#7c3aed] flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                      {rule.persona}
                    </h4>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {rule.tagline}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-[10px] font-mono text-slate-500">
                    <span>{rule.samples} customers</span>
                    <strong>{rule.percentage}%</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Production Business Rules Table */}
      <div className="analytics-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Production IF-THEN Business Rules
            </h3>
            <p className="text-xs text-slate-400">
              Executable rules extracted for direct integration into CRM segmentation engines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedFilter(null)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                selectedFilter === null
                  ? 'bg-[#e8ddfc] text-[#4c1d95]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              All Rules ({rules.length})
            </button>
            {[0, 1, 2, 3, 4].map((cId) => (
              <button
                key={cId}
                onClick={() => setSelectedFilter(selectedFilter === cId ? null : cId)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                  selectedFilter === cId
                    ? 'border-purple-300 bg-purple-50 text-[#4c1d95] shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                C{cId}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-purple-100 bg-[#fbf9fe] text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Rule ID</th>
                <th className="py-2.5 px-3">Condition Logic (IF ... THEN)</th>
                <th className="py-2.5 px-3">Assigned Persona</th>
                <th className="py-2.5 px-3">Cohort Size</th>
                <th className="py-2.5 px-3">Recommended Strategic Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 text-slate-700">
              {filteredRules.map((rule) => (
                <tr key={rule.rule_id} className="hover:bg-purple-50/20 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    Rule #{rule.rule_id}
                  </td>
                  <td className="py-3 px-3">
                    <div className="space-y-1">
                      {rule.conditions?.map((c, i) => (
                        <span
                          key={i}
                          className="inline-block bg-purple-50 text-purple-800 font-mono px-2 py-0.5 rounded text-[11px] mr-1 mb-1 border border-purple-100"
                        >
                          {i > 0 && <span className="text-purple-400 mr-1">AND</span>}
                          {c.text}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: rule.color }}
                      />
                      <span className="font-bold text-slate-900">
                        {rule.persona}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono">
                    {rule.samples} ({rule.percentage}%)
                  </td>
                  <td className="py-3 px-3 text-slate-500 max-w-xs">
                    {rule.strategy}
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
