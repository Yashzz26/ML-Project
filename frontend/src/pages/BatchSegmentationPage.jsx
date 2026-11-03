import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  Users,
  Search,
  Sparkles,
  ArrowUpDown,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const SAMPLE_CSV_DATA = `CustomerID,Gender,Age,Annual Income (k$),Spending Score (1-100)
201,Female,29,78,79
202,Male,45,85,25
203,Female,22,19,82
204,Male,52,24,15
205,Female,38,55,50
206,Male,31,95,88
207,Female,60,82,18
208,Male,19,28,75
209,Male,42,32,20
210,Female,35,62,55
211,Female,27,105,92
212,Male,48,72,30
213,Female,24,21,90
214,Male,67,18,12
215,Female,33,58,48`;

export default function BatchSegmentationPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [batchResults, setBatchResults] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCluster, setFilterCluster] = useState('all');

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      if (selected.name.endsWith('.csv')) {
        setFile(selected);
        setError(null);
      } else {
        setError('Please upload a valid .csv spreadsheet file.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.name.endsWith('.csv')) {
        setFile(selected);
        setError(null);
      } else {
        setError('Please upload a valid .csv spreadsheet file.');
      }
    }
  };

  const processUpload = async (customFile = null) => {
    const targetFile = customFile || file;
    if (!targetFile) {
      setError('Please select or drop a CSV file to process.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await apiService.predictBatch(targetFile, true);
      setBatchResults(res);
    } catch (err) {
      setError(err.message || 'Batch inference failed. Please check CSV columns.');
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = async () => {
    const blob = new Blob([SAMPLE_CSV_DATA], { type: 'text/csv' });
    const sampleFile = new File([blob], 'sample_batch_customers.csv', { type: 'text/csv' });
    setFile(sampleFile);
    await processUpload(sampleFile);
  };

  const downloadSampleTemplate = () => {
    const blob = new Blob([SAMPLE_CSV_DATA], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_batch_customers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportResultsToCsv = () => {
    if (!batchResults || !batchResults.results) return;
    const headers = [
      'CustomerID',
      'Gender',
      'Age',
      'Annual Income (k$)',
      'Spending Score (1-100)',
      'Cluster',
      'Persona',
      'CLV Tier',
      'Distance To Centroid',
    ];
    const rows = batchResults.results.map((r) => [
      r.customerId,
      r.gender,
      r.age,
      r.annualIncome,
      r.spendingScore,
      r.cluster,
      `"${r.persona}"`,
      r.clvTier,
      r.distanceToCentroid,
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'batch_segmented_results.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const resultsList = batchResults?.results || [];
  const filteredResults = resultsList.filter((item) => {
    const matchesSearch =
      item.customerId.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.persona.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCluster =
      filterCluster === 'all' || item.cluster.toString() === filterCluster;
    return matchesSearch && matchesCluster;
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-purple-100 p-6 sm:p-8 shadow-soft">
        <div className="max-w-3xl space-y-2">
          <span className="text-xs font-bold text-[#7c3aed] uppercase tracking-wider flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4" />
            Batch Inference Pipeline
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Batch Customer Scoring & Segmentation
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Upload new customer cohorts in bulk via CSV to perform instantaneous vectorized standardization, K-Means++ clustering, and strategic persona assignment.
          </p>
        </div>
      </div>

      {/* Upload Dropzone & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all bg-white ${
              file
                ? 'border-[#7c3aed] bg-purple-50/20'
                : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50/10'
            }`}
          >
            <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-100 text-[#7c3aed] flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              {file ? file.name : 'Drag & drop your customer CSV file here'}
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Expected columns:{' '}
              <span className="font-mono text-purple-700">
                Annual Income (k$), Spending Score (1-100)
              </span>{' '}
              (Age and Gender optional).
            </p>

            <div className="mt-5 flex flex-wrap justify-center items-center gap-3">
              <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#7c3aed] text-white hover:bg-[#6d28d9] transition shadow-sm">
                <FileText className="w-4 h-4" />
                <span>Browse Local CSV</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {file && (
                <button
                  type="button"
                  onClick={() => processUpload()}
                  disabled={loading}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Run Batch Scoring</span>
                </button>
              )}

              <button
                type="button"
                onClick={loadSampleData}
                disabled={loading}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-purple-50 text-[#7c3aed] border border-purple-200 hover:bg-purple-100 transition"
              >
                <span>Load 15 Sample Records</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Instructions & Template Download */}
        <div className="lg:col-span-4 analytics-card p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#7c3aed]" />
              CSV Format Guide
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Standardize customer uploads using our pre-formatted template with standard headers.
            </p>
            <div className="p-3 bg-purple-50/60 rounded-xl text-[11px] font-mono text-slate-700 space-y-1">
              <div>CustomerID,Gender,Age,Annual Income (k$),Spending Score (1-100)</div>
              <div className="text-slate-400">201,Female,29,78,79</div>
              <div className="text-slate-400">202,Male,45,85,25</div>
            </div>
          </div>

          <button
            type="button"
            onClick={downloadSampleTemplate}
            className="w-full mt-4 inline-flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold border border-purple-200 text-purple-700 bg-white hover:bg-purple-50 transition"
          >
            <Download className="w-4 h-4" />
            <span>Download Sample CSV Template</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-xs font-semibold">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && <LoadingSpinner message="Executing vectorized K-Means++ inference..." />}

      {/* Results Section */}
      {batchResults && (
        <div className="space-y-5">
          {/* Summary Breakdown Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {batchResults.cluster_breakdown.map((b) => (
              <div
                key={b.cluster}
                className="analytics-card p-4 border-t-4"
                style={{ borderTopColor: b.color }}
              >
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  Cluster {b.cluster}
                </span>
                <div className="text-2xl font-extrabold text-slate-900 font-display mt-0.5">
                  {b.count}
                </div>
                <span className="text-[11px] text-slate-500 font-medium truncate block mt-0.5">
                  {b.persona}
                </span>
              </div>
            ))}
          </div>

          {/* Interactive Results Table */}
          <div className="analytics-card p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Scored Customer Cohort ({filteredResults.length} records)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Predictions derived from fitted StandardScaler and centroid spatial proximity.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search customer ID or persona..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-400 w-full sm:w-56"
                  />
                </div>

                {/* Filter Cluster */}
                <select
                  value={filterCluster}
                  onChange={(e) => setFilterCluster(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none"
                >
                  <option value="all">All Clusters</option>
                  <option value="0">Cluster 0</option>
                  <option value="1">Cluster 1</option>
                  <option value="2">Cluster 2</option>
                  <option value="3">Cluster 3</option>
                  <option value="4">Cluster 4</option>
                </select>

                {/* Export Button */}
                <button
                  type="button"
                  onClick={exportResultsToCsv}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#7c3aed] text-white hover:bg-[#6d28d9] transition shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Scored CSV</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-purple-100 bg-[#fbf9fe] text-slate-600 font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Gender</th>
                    <th className="py-2.5 px-3">Age</th>
                    <th className="py-2.5 px-3">Income (k$)</th>
                    <th className="py-2.5 px-3">Spending Score</th>
                    <th className="py-2.5 px-3">Assigned Persona</th>
                    <th className="py-2.5 px-3">CLV Tier</th>
                    <th className="py-2.5 px-3">Centroid Dist</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50 text-slate-700">
                  {filteredResults.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {r.customerId}
                      </td>
                      <td className="py-2.5 px-3">{r.gender}</td>
                      <td className="py-2.5 px-3">{r.age}</td>
                      <td className="py-2.5 px-3 font-mono">${r.annualIncome}k</td>
                      <td className="py-2.5 px-3 font-mono">{r.spendingScore}/100</td>
                      <td className="py-2.5 px-3">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"
                          style={{
                            backgroundColor: `${r.color}15`,
                            color: r.color,
                          }}
                        >
                          {r.persona}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-800 text-[11px]">
                          {r.clvTier}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">
                        {r.distanceToCentroid}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
