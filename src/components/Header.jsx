import React from 'react';
import { RefreshCw, Database, Cloud, Menu } from 'lucide-react';

const TAB_TITLES = {
  overview: { title: 'Telemetry & Performance Hub', subtitle: 'Live overview of Skyweb operations, inquiries, and media telemetry.' },
  gallery: { title: 'Exhibit & Gallery Studio', subtitle: 'Upload and manage Cloudinary media assets and featured exhibits.' },
  projects: { title: 'Client Projects & Showcase', subtitle: 'Manage portfolio cases, live URLs, stacks, and production metrics.' },
  inquiries: { title: 'Lead Inbox & CRM', subtitle: 'Review and triage client project inquiries and partnership leads.' },
  services: { title: 'Services & Architecture Matrix', subtitle: 'Manage solution categories, pricing tiers, and capabilities.' },
  team: { title: 'Team & Core Members', subtitle: 'Manage leadership and staff bios, quotes, and social links.' },
  faqs: { title: 'Knowledge Base & FAQs', subtitle: 'Manage customer FAQ questions, answers, and display orders.' },
  settings: { title: 'System Settings & Telemetry', subtitle: 'Diagnostics, database pools, CDN connections, and API endpoints.' },
};

export default function Header({ activeTab, onRefresh, isRefreshing, systemHealth, onToggleSidebar }) {
  const current = TAB_TITLES[activeTab] || { title: 'Skyweb Control Center', subtitle: 'Operational Admin Hub' };

  return (
    <header className="h-20 bg-dark-900/80 backdrop-blur-md border-b border-white/5 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 lg:hidden rounded-xl bg-dark-800 text-slate-400 hover:text-white border border-white/5 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">{current.title}</h1>
          <p className="hidden sm:block text-xs text-slate-400 mt-0.5">{current.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Backend Status Indicator */}
        <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-dark-850 border border-white/5 text-xs font-mono">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">Mongo:</span>
          <span className="text-emerald-400 font-semibold">{systemHealth?.database?.mongodb === 'connected' ? 'ONLINE' : 'ACTIVE'}</span>
          <span className="text-slate-700">|</span>
          <Cloud className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-slate-400">CDN:</span>
          <span className="text-sky-400 font-semibold">{systemHealth?.services?.cloudinary === 'configured' ? 'SYNCED' : 'CLOUDINARY'}</span>
        </div>

        {/* Quick Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-dark-800 hover:bg-dark-750 text-slate-200 text-xs font-semibold border border-white/10 transition-all cursor-pointer disabled:opacity-50"
            title="Reload backend data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>
        )}
      </div>
    </header>
  );
}
