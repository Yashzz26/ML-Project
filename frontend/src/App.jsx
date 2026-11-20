import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardHome from './pages/DashboardHome';
import DatasetPage from './pages/DatasetPage';
import EdaPage from './pages/EdaPage';
import ClusterAnalysisPage from './pages/ClusterAnalysisPage';
import CustomerSegmentationPage from './pages/CustomerSegmentationPage';
import BatchSegmentationPage from './pages/BatchSegmentationPage';
import ModelEvaluationPage from './pages/ModelEvaluationPage';
import CampaignSimulatorPage from './pages/CampaignSimulatorPage';
import ModelComparisonPage from './pages/ModelComparisonPage';
import DecisionTreePage from './pages/DecisionTreePage';
import OutlierDetectionPage from './pages/OutlierDetectionPage';
import SegmentComparisonPage from './pages/SegmentComparisonPage';
import AboutProjectPage from './pages/AboutProjectPage';
import { apiService } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [healthStatus, setHealthStatus] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchHealth = async () => {
    try {
      const health = await apiService.getHealth();
      setHealthStatus(health);
    } catch {
      setHealthStatus({ status: 'degraded', model_loaded: false });
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome key={refreshKey} onNavigate={setActiveTab} />;
      case 'dataset':
        return <DatasetPage key={refreshKey} />;
      case 'eda':
        return <EdaPage key={refreshKey} />;
      case 'clusters':
        return <ClusterAnalysisPage key={refreshKey} />;
      case 'segmentation':
        return <CustomerSegmentationPage key={refreshKey} />;
      case 'batch':
        return <BatchSegmentationPage key={refreshKey} />;
      case 'campaign':
        return <CampaignSimulatorPage key={refreshKey} />;
      case 'comparison':
        return <ModelComparisonPage key={refreshKey} />;
      case 'decision_tree':
        return <DecisionTreePage key={refreshKey} />;
      case 'anomalies':
        return <OutlierDetectionPage key={refreshKey} />;
      case 'compare_segments':
        return <SegmentComparisonPage key={refreshKey} />;
      case 'evaluation':
        return <ModelEvaluationPage key={refreshKey} />;
      case 'about':
        return <AboutProjectPage key={refreshKey} />;
      default:
        return <DashboardHome key={refreshKey} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5fd] text-slate-900 flex font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-5 sm:p-7 max-w-[1500px] w-full mx-auto">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}
