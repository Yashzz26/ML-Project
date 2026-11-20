import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Box,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Compass,
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
  const [clusters3DData, setClusters3DData] = useState(null);
  const [clusterSummary, setClusterSummary] = useState(null);
  const [selectedCluster, setSelectedCluster] = useState(null); // null = all
  const [viewMode, setViewMode] = useState('2d'); // '2d' or '3d'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3D Canvas camera controls
  const canvasRef = useRef(null);
  const [yaw, setYaw] = useState(0.85); // horizontal rotation (radians)
  const [pitch, setPitch] = useState(0.35); // vertical tilt (radians)
  const [zoom, setZoom] = useState(2.8); // camera distance
  const [autoRotate, setAutoRotate] = useState(true);
  const [hovered3DPoint, setHovered3DPoint] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [clusterRes, summaryRes, cluster3DRes] = await Promise.all([
          apiService.getClusters(),
          apiService.getClusterSummary(),
          apiService.getClusters3D(),
        ]);
        setClustersData(clusterRes);
        setClusterSummary(summaryRes);
        setClusters3DData(cluster3DRes);
      } catch (err) {
        setError(err.message || 'Failed to load cluster analysis');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // 3D Canvas rendering loop
  useEffect(() => {
    if (viewMode !== '3d' || !canvasRef.current || !clusters3DData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let currentYaw = yaw;

    const render = () => {
      if (autoRotate && !isDraggingRef.current) {
        currentYaw += 0.006;
        setYaw(currentYaw);
      }

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width;
      const height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#13092b');
      bgGrad.addColorStop(1, '#1e0f3d');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Perspective transformation helper
      const cx = width / 2;
      const cy = height / 2;
      const fov = Math.min(width, height) * 0.95;

      const project = (xNorm, yNorm, zNorm) => {
        // Rotate around Y (yaw)
        const cosY = Math.cos(currentYaw);
        const sinY = Math.sin(currentYaw);
        const x1 = xNorm * cosY - zNorm * sinY;
        const z1 = xNorm * sinY + zNorm * cosY;

        // Rotate around X (pitch)
        const cosP = Math.cos(pitch);
        const sinP = Math.sin(pitch);
        const y2 = yNorm * cosP - z1 * sinP;
        const z2 = yNorm * sinP + z1 * cosP;

        const depth = zoom + z2;
        if (depth <= 0.1) return null;

        const scale = fov / depth;
        return {
          sx: cx + x1 * scale,
          sy: cy - y2 * scale,
          depth: z2,
          scale: scale,
        };
      };

      // Draw 3D wireframe bounding box
      const corners = [
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
        [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
      ];
      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0], // back
        [4, 5], [5, 6], [6, 7], [7, 4], // front
        [0, 4], [1, 5], [2, 6], [3, 7], // connecting
      ];

      ctx.strokeStyle = 'rgba(168, 85, 247, 0.2)';
      ctx.lineWidth = 1;
      edges.forEach(([i, j]) => {
        const p1 = project(...corners[i]);
        const p2 = project(...corners[j]);
        if (p1 && p2) {
          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);
          ctx.stroke();
        }
      });

      // Subtle floor grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      for (let g = -1; g <= 1; g += 0.5) {
        const p1 = project(g, -1, -1);
        const p2 = project(g, -1, 1);
        const p3 = project(-1, -1, g);
        const p4 = project(1, -1, g);
        if (p1 && p2) {
          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);
          ctx.stroke();
        }
        if (p3 && p4) {
          ctx.beginPath();
          ctx.moveTo(p3.sx, p3.sy);
          ctx.lineTo(p4.sx, p4.sy);
          ctx.stroke();
        }
      }

      // Draw labeled Axes lines
      const origin = project(-1, -1, -1);
      const axisX = project(1.2, -1, -1); // Age
      const axisY = project(-1, 1.2, -1); // Income
      const axisZ = project(-1, -1, 1.2); // Spending

      if (origin) {
        // X Axis: Age
        if (axisX) {
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(origin.sx, origin.sy);
          ctx.lineTo(axisX.sx, axisX.sy);
          ctx.stroke();
          ctx.fillStyle = '#f43f5e';
          ctx.font = 'bold 10px Inter, sans-serif';
          ctx.fillText('Age (18-70)', axisX.sx + 4, axisX.sy);
        }
        // Y Axis: Income
        if (axisY) {
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(origin.sx, origin.sy);
          ctx.lineTo(axisY.sx, axisY.sy);
          ctx.stroke();
          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 10px Inter, sans-serif';
          ctx.fillText('Income ($15k-$137k)', axisY.sx - 20, axisY.sy - 8);
        }
        // Z Axis: Spending Score
        if (axisZ) {
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(origin.sx, origin.sy);
          ctx.lineTo(axisZ.sx, axisZ.sy);
          ctx.stroke();
          ctx.fillStyle = '#a855f7';
          ctx.font = 'bold 10px Inter, sans-serif';
          ctx.fillText('Spend (1-100)', axisZ.sx + 4, axisZ.sy + 4);
        }
      }

      // Prepare Render Queue (depth-sorted)
      const renderQueue = [];

      // 1. Customer points
      const points = clusters3DData.points || [];
      points.forEach((pt) => {
        // Normalize Age: [18, 70] -> [-1, 1]
        const nx = ((pt.age - 18) / (70 - 18)) * 2 - 1;
        // Normalize Income: [15, 137] -> [-1, 1]
        const ny = ((pt.income - 15) / (137 - 15)) * 2 - 1;
        // Normalize Spending: [1, 99] -> [-1, 1]
        const nz = ((pt.spending - 1) / (99 - 1)) * 2 - 1;

        const proj = project(nx, ny, nz);
        if (proj) {
          renderQueue.push({
            type: 'point',
            item: pt,
            sx: proj.sx,
            sy: proj.sy,
            depth: proj.depth,
            scale: proj.scale,
          });
        }
      });

      // 2. Centroids
      const centroids3D = clusters3DData.centroids || [];
      centroids3D.forEach((c) => {
        const nx = ((c.age - 18) / (70 - 18)) * 2 - 1;
        const ny = ((c.income - 15) / (137 - 15)) * 2 - 1;
        const nz = ((c.spending - 1) / (99 - 1)) * 2 - 1;

        const proj = project(nx, ny, nz);
        if (proj) {
          renderQueue.push({
            type: 'centroid',
            item: c,
            sx: proj.sx,
            sy: proj.sy,
            depth: proj.depth,
            scale: proj.scale,
          });
        }
      });

      // Sort from back to front
      renderQueue.sort((a, b) => b.depth - a.depth);

      // Draw items
      renderQueue.forEach((entry) => {
        if (entry.type === 'point') {
          const pt = entry.item;
          const isDimmed = selectedCluster !== null && pt.cluster !== selectedCluster;
          const radius = Math.max(3, Math.min(8, 4.5 * (1.8 / (zoom + entry.depth))));
          const baseColor = CLUSTER_COLORS[pt.cluster] || '#8b5cf6';

          ctx.beginPath();
          ctx.arc(entry.sx, entry.sy, radius, 0, Math.PI * 2);
          ctx.fillStyle = isDimmed ? 'rgba(255, 255, 255, 0.08)' : baseColor;
          ctx.shadowColor = isDimmed ? 'transparent' : baseColor;
          ctx.shadowBlur = isDimmed ? 0 : 8;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Border for clarity
          if (!isDimmed) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        } else if (entry.type === 'centroid') {
          const c = entry.item;
          const isDimmed = selectedCluster !== null && c.cluster !== selectedCluster;
          const size = Math.max(7, Math.min(14, 9 * (1.8 / (zoom + entry.depth))));

          // Diamond centroid shape
          ctx.save();
          ctx.translate(entry.sx, entry.sy);
          ctx.rotate(Math.PI / 4);
          ctx.fillStyle = isDimmed ? 'rgba(255,255,255,0.2)' : '#ffffff';
          ctx.strokeStyle = CLUSTER_COLORS[c.cluster] || '#7c3aed';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = CLUSTER_COLORS[c.cluster] || '#7c3aed';
          ctx.shadowBlur = 12;
          ctx.fillRect(-size / 2, -size / 2, size, size);
          ctx.strokeRect(-size / 2, -size / 2, size, size);
          ctx.restore();

          // Centroid Label tag
          if (!isDimmed) {
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.font = 'bold 9px Inter, sans-serif';
            ctx.fillText(`C${c.cluster}`, entry.sx + size + 2, entry.sy - 2);
          }
        }
      });

      // Nearest point detection for tooltip
      if (mousePos) {
        let nearest = null;
        let minDist = 18;
        renderQueue.forEach((entry) => {
          if (entry.type === 'point') {
            const dist = Math.hypot(entry.sx - mousePos.x, entry.sy - mousePos.y);
            if (dist < minDist) {
              minDist = dist;
              nearest = entry;
            }
          }
        });

        if (nearest) {
          setHovered3DPoint(nearest);
          // Highlight circle
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(nearest.sx, nearest.sy, 11, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else if (!isDraggingRef.current) {
          setHovered3DPoint(null);
        }
      }

      if (autoRotate) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [viewMode, clusters3DData, yaw, pitch, zoom, autoRotate, selectedCluster, mousePos]);

  // Mouse handlers for 3D canvas interaction
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }

    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    setYaw((prev) => prev + dx * 0.008);
    setPitch((prev) => Math.max(-1.4, Math.min(1.4, prev - dy * 0.008)));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    setZoom((prev) => Math.max(1.5, Math.min(5.0, prev + e.deltaY * 0.003)));
  };

  const resetCamera = () => {
    setYaw(0.85);
    setPitch(0.35);
    setZoom(2.8);
    setAutoRotate(true);
  };

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

  const { points = [], centroids = [], silhouette_score } = clustersData || {};

  const activeProfile =
    selectedCluster !== null
      ? clusterSummary?.find((c) => c.cluster === selectedCluster)
      : null;

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Controls & Filter Bar */}
      <div className="bg-white rounded-2xl border border-purple-100 p-4 sm:p-5 shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Cluster Analysis & Spatial Topography
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Switch between 2D Standardized Space and interactive 3D Demographic Space (Age × Income × Spending).
          </p>
        </div>

        {/* View Switcher & Filter Pills */}
        <div className="flex flex-wrap items-center gap-3">
          {/* 2D vs 3D Mode Toggle */}
          <div className="flex items-center p-1 bg-purple-50/70 border border-purple-200 rounded-xl">
            <button
              onClick={() => setViewMode('2d')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === '2d'
                  ? 'bg-white text-[#7c3aed] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ScatterIcon className="w-3.5 h-3.5" />
              <span>2D Planar</span>
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === '3d'
                  ? 'bg-[#7c3aed] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Spatial</span>
            </button>
          </div>

          {/* Cluster Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedCluster(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCluster === null
                  ? 'bg-[#e8ddfc] text-[#4c1d95] shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              All ({points.length})
            </button>

            {[0, 1, 2, 3, 4].map((cId) => {
              const isSelected = selectedCluster === cId;
              const color = CLUSTER_COLORS[cId];
              return (
                <button
                  key={cId}
                  onClick={() => setSelectedCluster(isSelected ? null : cId)}
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
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
                  <span>C{cId}</span>
                </button>
              );
            })}
          </div>
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
              <strong className="text-slate-900 font-bold">${activeProfile.average_income}k</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-sans block">Avg Spending:</span>
              <strong className="text-slate-900 font-bold">{activeProfile.average_spending_score}/100</strong>
            </div>
          </div>
        </div>
      )}

      {/* Visualizer Display Box: 2D or 3D */}
      <div className="analytics-card p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              {viewMode === '2d' ? (
                <>
                  <ScatterIcon className="w-4 h-4 text-[#7c3aed]" />
                  2D Standardized Feature Space Visualization
                </>
              ) : (
                <>
                  <Box className="w-4 h-4 text-[#7c3aed]" />
                  Interactive 3D Demographic Coordinate Space
                </>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              {viewMode === '2d'
                ? 'X: Annual Income ($k) · Y: Spending Score (1-100) · Diamond markers indicate Centroids'
                : 'Axes: Age (X: Red) · Annual Income (Y: Green) · Spending Score (Z: Purple) · Click & drag to rotate, scroll to zoom'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {viewMode === '3d' && (
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                    autoRotate ? 'bg-[#7c3aed] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                  title="Toggle Auto Rotation"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span className="text-[10px] hidden sm:inline">Auto-Spin</span>
                </button>
                <button
                  onClick={() => setZoom((z) => Math.max(1.5, z - 0.3))}
                  className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoom((z) => Math.min(5.0, z + 0.3))}
                  className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={resetCamera}
                  className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200"
                  title="Reset Camera Orientation"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
              {viewMode === '2d'
                ? `2D Silhouette: ${silhouette_score}`
                : `3D Silhouette: ${clusters3DData?.silhouette_score || '0.4528'}`}
            </span>
          </div>
        </div>

        {/* 2D View Container */}
        {viewMode === '2d' && (
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
        )}

        {/* 3D View Canvas Viewport */}
        {viewMode === '3d' && (
          <div className="relative h-[440px] w-full my-2 rounded-2xl overflow-hidden border border-purple-900/30 select-none shadow-inner bg-[#13092b]">
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            />

            {/* 3D View Overlay Controls Instructions */}
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[11px] text-white flex items-center gap-2 pointer-events-none">
              <Compass className="w-3.5 h-3.5 text-[#a855f7]" />
              <span>Drag to rotate · Scroll to zoom</span>
            </div>

            {/* 3D Tooltip HUD */}
            {hovered3DPoint && (
              <div
                className="absolute pointer-events-none bg-slate-900/90 text-white backdrop-blur-md border border-purple-500/40 p-3 rounded-xl shadow-2xl text-xs space-y-1 transition-all duration-75"
                style={{
                  left: Math.min(window.innerWidth - 300, hovered3DPoint.sx + 15),
                  top: Math.max(10, hovered3DPoint.sy - 50),
                }}
              >
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1">
                  <strong className="text-purple-300 font-bold">
                    Customer #{hovered3DPoint.item.customerId}
                  </strong>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.2 rounded"
                    style={{
                      backgroundColor: `${CLUSTER_COLORS[hovered3DPoint.item.cluster]}30`,
                      color: CLUSTER_COLORS[hovered3DPoint.item.cluster],
                    }}
                  >
                    Cluster {hovered3DPoint.item.cluster}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 space-y-0.5 pt-0.5">
                  <p>Age: <strong className="text-white">{hovered3DPoint.item.age} years</strong> ({hovered3DPoint.item.gender})</p>
                  <p>Income: <strong className="text-white">${hovered3DPoint.item.income}k</strong></p>
                  <p>Spending Score: <strong className="text-white">{hovered3DPoint.item.spending}/100</strong></p>
                </div>
              </div>
            )}

            {/* 3D Axis Legend Pill */}
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 text-[10px] text-white flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#f43f5e]" />
                <span className="text-slate-300">X: Age</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                <span className="text-slate-300">Y: Income</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#a855f7]" />
                <span className="text-slate-300">Z: Spending</span>
              </div>
            </div>
          </div>
        )}

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
                    <p className="font-bold text-slate-900 mt-0.5">${c.average_income}k</p>
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
