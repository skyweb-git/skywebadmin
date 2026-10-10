import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardOverview from './pages/DashboardOverview';
import GalleryManager from './pages/GalleryManager';
import ProjectsManager from './pages/ProjectsManager';
import InquiriesManager from './pages/InquiriesManager';
import ServicesManager from './pages/ServicesManager';
import TeamManager from './pages/TeamManager';
import FaqsManager from './pages/FaqsManager';
import ShowcaseManager from './pages/ShowcaseManager';
import SettingsPage from './pages/SettingsPage';

import {
  statsApi,
  galleryApi,
  projectsApi,
  inquiriesApi,
  servicesApi,
  teamApi,
  faqsApi,
  healthApi,
} from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Core collections state
  const [stats, setStats] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [projects, setProjects] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [services, setServices] = useState([]);
  const [team, setTeam] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [health, setHealth] = useState(null);

  const fetchAllData = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const [
        statsRes,
        galleryRes,
        projectsRes,
        inquiriesRes,
        servicesRes,
        teamRes,
        faqsRes,
        healthRes
      ] = await Promise.allSettled([
        statsApi.getOverview(),
        galleryApi.getAll(),
        projectsApi.getAll(),
        inquiriesApi.getAll(),
        servicesApi.getAll(),
        teamApi.getAll(),
        faqsApi.getAll(),
        healthApi.check()
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data?.data || null);
      if (galleryRes.status === 'fulfilled') setGallery(galleryRes.value.data?.data || []);
      if (projectsRes.status === 'fulfilled') setProjects(projectsRes.value.data?.data || []);
      if (inquiriesRes.status === 'fulfilled') setInquiries(inquiriesRes.value.data?.data || []);
      if (servicesRes.status === 'fulfilled') setServices(servicesRes.value.data?.data || []);
      if (teamRes.status === 'fulfilled') setTeam(teamRes.value.data?.data || []);
      if (faqsRes.status === 'fulfilled') setFaqs(faqsRes.value.data?.data || []);
      if (healthRes.status === 'fulfilled') setHealth(healthRes.value.data || null);

    } catch (err) {
      console.error('Failed to load system state:', err);
      setError('Failed to synchronize with Skyweb backend. Verify backend is running on http://localhost:5000');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Counts calculated dynamically
  const counts = {
    gallery: gallery.length,
    projects: projects.length,
    inquiries: inquiries.length,
    newInquiries: inquiries.filter(i => i.status === 'new').length,
    services: services.length,
    team: team.length,
    faqs: faqs.length
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <DashboardOverview
            stats={stats}
            inquiries={inquiries}
            projects={projects}
            gallery={gallery}
            onNavigate={(tab) => setActiveTab(tab)}
            onRefresh={() => fetchAllData(true)}
          />
        );
      case 'gallery':
        return <GalleryManager gallery={gallery} onRefresh={() => fetchAllData(true)} />;
      case 'projects':
        return <ProjectsManager projects={projects} onRefresh={() => fetchAllData(true)} />;
      case 'inquiries':
        return <InquiriesManager inquiries={inquiries} onRefresh={() => fetchAllData(true)} />;
      case 'services':
        return <ServicesManager services={services} onRefresh={() => fetchAllData(true)} />;
      case 'team':
        return <TeamManager team={team} onRefresh={() => fetchAllData(true)} />;
      case 'faqs':
        return <FaqsManager faqs={faqs} onRefresh={() => fetchAllData(true)} />;
      case 'showcase':
        return <ShowcaseManager />;
      case 'settings':
        return <SettingsPage onRefreshAll={() => fetchAllData(true)} />;
      default:
        return <DashboardOverview stats={stats} inquiries={inquiries} projects={projects} gallery={gallery} onNavigate={setActiveTab} onRefresh={() => fetchAllData(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex font-sans antialiased selection:bg-sky-500/30 selection:text-sky-300">
      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        counts={counts}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header
          activeTab={activeTab}
          systemHealth={health}
          onRefresh={() => fetchAllData(true)}
          isRefreshing={refreshing}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 scrollbar-thin">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center justify-between text-sm">
              <span>{error}</span>
              <button
                onClick={() => fetchAllData()}
                className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer"
              >
                Retry Sync
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
              <div className="w-12 h-12 border-2 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
              <div className="text-center">
                <p className="text-white font-medium">Synchronizing Skyweb Control Center</p>
                <p className="text-slate-500 text-xs font-mono mt-1">Connecting to MongoDB & Media CDN...</p>
              </div>
            </div>
          ) : (
            renderActivePage()
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
