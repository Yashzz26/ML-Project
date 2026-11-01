import React from 'react';
import {
  Info,
  ShieldAlert,
  Lightbulb,
  Cpu,
  GitBranch,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Database,
  ArrowRight,
} from 'lucide-react';
import { apiService } from '../services/api';

export default function AboutProjectPage() {
  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Case Study Banner */}
      <div className="bg-white rounded-2xl border border-purple-100 p-6 sm:p-8 shadow-soft">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold text-[#7c3aed] uppercase tracking-wider">
            Academic Project Case Study
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            E-Commerce Customer Segmentation Using K-Means++
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Unsupervised machine learning for discoverability of cohesive behavioral shopper cohorts based on Annual Income and Spending Score.
          </p>
        </div>

        {/* Dataset Specifications Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-purple-50 text-xs">
          <div className="p-3 rounded-xl bg-[#fcfaff] border border-purple-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dataset</span>
            <strong className="text-slate-800 text-xs block mt-0.5">Mall Customers</strong>
          </div>
          <div className="p-3 rounded-xl bg-[#fcfaff] border border-purple-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Records</span>
            <strong className="text-slate-800 text-xs block mt-0.5">200 Records</strong>
          </div>
          <div className="p-3 rounded-xl bg-[#fcfaff] border border-purple-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Original Columns</span>
            <strong className="text-slate-800 text-xs block mt-0.5">5 Columns</strong>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Missing Values</span>
            <strong className="text-emerald-800 text-xs block mt-0.5">0 (Zero Nulls)</strong>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Duplicates</span>
            <strong className="text-emerald-800 text-xs block mt-0.5">0 Duplicates</strong>
          </div>
        </div>
      </div>

      {/* Crucial Academic Dataset Limitation Warning (Section 18) */}
      <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start space-x-3.5 text-xs shadow-soft">
        <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-amber-900 uppercase tracking-wider text-[11px]">
            Academic Dataset Disclosure & Project Limitation
          </h4>
          <p className="text-amber-950 font-semibold leading-relaxed">
            "The current dataset is mall-customer information and does not represent real online transaction histories or RFM analysis."
          </p>
          <p className="text-amber-800/80 text-[11px] leading-relaxed">
            While the problem domain reflects e-commerce customer segmentation concepts, the actual underlying dataset is the benchmark Mall Customers dataset (200 records). It does not contain live time-series order histories or multi-channel transactional telemetry.
          </p>
        </div>
      </div>

      {/* Visual Case Study Cards: Problem & Solution + K-Means++ Algorithm */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Problem & Solution */}
        <div className="analytics-card p-6 space-y-4">
          <div className="flex items-center space-x-2 text-[#7c3aed]">
            <Lightbulb className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Problem & Solution
            </h3>
          </div>
          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <div className="p-3 rounded-xl bg-[#fcfaff] border border-purple-50">
              <strong className="text-slate-900 block mb-1">Business Problem:</strong>
              A single customer base is inherently heterogeneous. Treating all customers identically with generic mass marketing wastes marketing budget, alienates budget-conscious shoppers, and under-engages high-capacity spenders.
            </div>
            <div className="p-3 rounded-xl bg-[#fcfaff] border border-purple-50">
              <strong className="text-slate-900 block mb-1">Unsupervised Solution:</strong>
              K-Means++ groups customers into 5 cohesive behavioral clusters based on income and spending habits without requiring manual rule engineering.
            </div>
          </div>
        </div>

        {/* Algorithm: Why K-Means++? */}
        <div className="analytics-card p-6 space-y-4">
          <div className="flex items-center space-x-2 text-emerald-600">
            <Cpu className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Algorithm: Why K-Means++?
            </h3>
          </div>
          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <div className="p-3 rounded-xl bg-[#fcfaff] border border-purple-50">
              <strong className="text-slate-900 block mb-1">Standard K-Means Flaw:</strong>
              Standard K-Means picks initial centroids purely at random, which often places multiple initial centroids in the same cluster, resulting in poor local minima and slow convergence.
            </div>
            <div className="p-3 rounded-xl bg-[#fcfaff] border border-purple-50">
              <strong className="text-slate-900 block mb-1">K-Means++ Smart Seeding:</strong>
              K-Means++ samples initial centroids with probability proportional to their squared distance from existing seeds, guaranteeing spread-out initial centers, faster convergence, and mathematically optimal cohesion.
            </div>
          </div>
        </div>
      </div>

      {/* Visual Timeline: Pipeline Methodology */}
      <div className="analytics-card p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <GitBranch className="w-4 h-4 text-[#7c3aed]" />
          <span>End-to-End Methodology Timeline</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
          {[
            { step: '01', title: 'Data Ingestion', desc: 'Mall_Customers.csv (200 records, 5 columns)' },
            { step: '02', title: 'Quality Validation', desc: 'Verified 0 missing and 0 duplicate records' },
            { step: '03', title: 'StandardScaler', desc: 'Standardized Income & Spending to zero mean, unit variance' },
            { step: '04', title: 'Elbow & Silhouette', desc: 'Evaluated K=1..10 to identify K=5 inflection & peak score' },
            { step: '05', title: 'K-Means++ (K=5)', desc: 'Trained model with n_init=10, random_state=42' },
            { step: '06', title: 'Dynamic Profiling', desc: 'Calculated centroid averages & marketing recommendations' },
          ].map((s) => (
            <div key={s.step} className="p-3.5 rounded-xl bg-[#fcfaff] border border-purple-100/70 space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#7c3aed]">{s.step}</span>
              <p className="font-bold text-slate-900 text-xs">{s.title}</p>
              <p className="text-[11px] text-slate-500 leading-snug">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Future Scope */}
      <div className="analytics-card p-6 space-y-3">
        <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-[#7c3aed]" />
          <span>Future Scope & Roadmap</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600">
          <div className="p-3 rounded-xl bg-[#fcfaff] border border-purple-50">
            <strong className="text-slate-900 block mb-0.5">1. Add Customer Age:</strong>
            Extend the 2D feature vector to 3D by adding Age to investigate generational spending nuances.
          </div>
          <div className="p-3 rounded-xl bg-[#fcfaff] border border-purple-50">
            <strong className="text-slate-900 block mb-0.5">2. Real E-Commerce Transaction Data:</strong>
            Ingest live online order streams with Recency, Frequency, and Monetary (RFM) dynamics.
          </div>
          <div className="p-3 rounded-xl bg-[#fcfaff] border border-purple-50">
            <strong className="text-slate-900 block mb-0.5">3. Compare Clustering Algorithms:</strong>
            Benchmark K-Means++ against DBSCAN, Hierarchical Clustering, and Gaussian Mixture Models.
          </div>
          <div className="p-3 rounded-xl bg-[#fcfaff] border border-purple-50">
            <strong className="text-slate-900 block mb-0.5">4. Personalized Promotions Engine:</strong>
            Connect inferred customer segments to automated promotional coupon generation.
          </div>
        </div>
      </div>

      {/* CSV Export Center */}
      <div className="analytics-card p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4 text-[#7c3aed]" />
            <span>Dataset & Model Results Export</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Download the machine learning outputs generated dynamically from Mall_Customers.csv
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#fcfaff] border border-purple-100 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="font-bold text-slate-900 text-xs">
                Customer_Segmentation_Results.csv
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Full 200 customer records enriched with fitted cluster assignments and dynamic human-readable segment tags.
              </p>
            </div>
            <a
              href={apiService.getExportUrl('customers')}
              download="Customer_Segmentation_Results.csv"
              className="flex items-center justify-center space-x-2 py-2 px-4 rounded-xl bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-bold text-xs shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Customer Results CSV</span>
            </a>
          </div>

          <div className="p-4 rounded-xl bg-[#fcfaff] border border-purple-100 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="font-bold text-slate-900 text-xs">
                Cluster_Summary.csv
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Summary table with 5 cluster profiles, centroid coordinates, population counts, and strategic marketing actions.
              </p>
            </div>
            <a
              href={apiService.getExportUrl('summary')}
              download="Cluster_Summary.csv"
              className="flex items-center justify-center space-x-2 py-2 px-4 rounded-xl bg-purple-100 hover:bg-purple-200 text-[#5b21b6] font-bold text-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Cluster Summary CSV</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
