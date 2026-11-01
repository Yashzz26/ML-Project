import React, { useState, useEffect } from 'react';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Database,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const CLUSTER_BADGE_STYLES = {
  0: 'bg-sky-50 text-sky-700 border-sky-200',
  1: 'bg-amber-50 text-amber-700 border-amber-200',
  2: 'bg-purple-50 text-purple-700 border-purple-200',
  3: 'bg-rose-50 text-rose-700 border-rose-200',
  4: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default function DatasetPage() {
  const [data, setData] = useState([]);
  const [dataQuality, setDataQuality] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [sortBy, setSortBy] = useState('CustomerID');
  const [sortOrder, setSortOrder] = useState('asc');
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [clusterFilter, setClusterFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDataset = async () => {
    try {
      setLoading(true);
      const res = await apiService.getDataset({
        page,
        pageSize,
        sortBy,
        sortOrder,
        search,
        gender: genderFilter,
        cluster: clusterFilter,
      });
      setData(res.data);
      setDataQuality(res.data_quality);
      setTotalRecords(res.total);
      setTotalPages(res.total_pages);
    } catch (err) {
      setError(err.message || 'Failed to fetch dataset');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataset();
  }, [page, pageSize, sortBy, sortOrder, genderFilter, clusterFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDataset();
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setPage(1);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Banner / Dataset Overview */}
      <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#7c3aed] uppercase tracking-wider mb-1">
            <Database className="w-4 h-4" />
            <span>Mall Customers Dataset</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Raw & Clustered Records Explorer
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Search, sort, and inspect customer profiles with their K-Means++ assigned segments.
          </p>
        </div>

        {/* Quality Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 font-semibold border border-purple-100">
            {dataQuality ? dataQuality.rows : 200} Rows
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 font-semibold border border-slate-200">
            5 Attributes
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>0 Missing / Clean</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-purple-100 p-4 shadow-soft flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by ID, gender, age, segment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#fcfaff] border border-purple-100 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:bg-white transition-colors"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Gender Filter */}
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <span>Gender:</span>
            <select
              value={genderFilter}
              onChange={(e) => {
                setGenderFilter(e.target.value);
                setPage(1);
              }}
              className="bg-[#fcfaff] border border-purple-100 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-purple-400"
            >
              <option value="">All Genders</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </div>

          {/* Cluster Filter */}
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <span>Cluster:</span>
            <select
              value={clusterFilter}
              onChange={(e) => {
                setClusterFilter(e.target.value);
                setPage(1);
              }}
              className="bg-[#fcfaff] border border-purple-100 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-purple-400"
            >
              <option value="">All Clusters</option>
              <option value="0">Cluster 0 (Moderate/Moderate)</option>
              <option value="1">Cluster 1 (High/High)</option>
              <option value="2">Cluster 2 (Low/High)</option>
              <option value="3">Cluster 3 (High/Low)</option>
              <option value="4">Cluster 4 (Low/Low)</option>
            </select>
          </div>

          {/* Export Button */}
          <a
            href={apiService.getExportUrl('customers')}
            download="Customer_Segmentation_Results.csv"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-purple-100 shadow-soft overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Filtering customer records..." />
        ) : error ? (
          <div className="p-8 text-center text-red-500 text-sm">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#fbf9fe] border-b border-purple-100 text-slate-600 font-bold uppercase tracking-wider select-none">
                  {[
                    { key: 'CustomerID', label: 'ID' },
                    { key: 'Gender', label: 'Gender' },
                    { key: 'Age', label: 'Age' },
                    { key: 'Annual Income (k$)', label: 'Annual Income (k$)' },
                    { key: 'Spending Score (1-100)', label: 'Spending Score' },
                    { key: 'Cluster', label: 'Cluster' },
                    { key: 'Segment', label: 'Segment Identity' },
                  ].map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="py-3.5 px-4 cursor-pointer hover:text-purple-700 transition-colors"
                    >
                      <div className="flex items-center space-x-1.5">
                        <span>{col.label}</span>
                        {sortBy === col.key ? (
                          sortOrder === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-purple-600" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-purple-600" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-300" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50 text-slate-700">
                {data.map((row) => {
                  const badgeClass =
                    CLUSTER_BADGE_STYLES[row.Cluster] ||
                    'bg-slate-50 text-slate-700 border-slate-200';
                  return (
                    <tr
                      key={row.CustomerID}
                      className="hover:bg-purple-50/30 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        #{row.CustomerID}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            row.Gender === 'Female'
                              ? 'bg-pink-50 text-pink-700 border border-pink-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {row.Gender}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {row.Age} yrs
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        ${row['Annual Income (k$)']}k
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <div className="flex items-center space-x-2">
                          <span>{row['Spending Score (1-100)']}</span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className="h-full bg-purple-500 rounded-full"
                              style={{ width: `${row['Spending Score (1-100)']}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeClass}`}
                        >
                          Cluster {row.Cluster}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900">{row.Segment}</span>
                        <span className="block text-[11px] text-slate-400 font-normal">
                          {row.Persona}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="bg-[#fbf9fe] border-t border-purple-100 px-5 py-3 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing{' '}
            <strong className="text-slate-800">
              {totalRecords === 0 ? 0 : (page - 1) * pageSize + 1}
            </strong>{' '}
            to{' '}
            <strong className="text-slate-800">
              {Math.min(page * pageSize, totalRecords)}
            </strong>{' '}
            of <strong className="text-slate-800">{totalRecords}</strong> entries
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-xl bg-white border border-purple-100 hover:bg-purple-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
            >
              Previous
            </button>
            <span className="px-2 font-semibold text-slate-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages || totalPages === 0}
              className="px-3 py-1.5 rounded-xl bg-white border border-purple-100 hover:bg-purple-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
