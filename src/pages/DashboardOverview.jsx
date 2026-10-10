import React from 'react';
import {
  Images,
  FolderKanban,
  Mail,
  Cpu,
  Users,
  HelpCircle,
  ArrowRight,
  Plus,
  Zap,
  Activity,
  Sparkles
} from 'lucide-react';

export default function DashboardOverview({
  stats = {},
  inquiries = [],
  projects = [],
  gallery = [],
  onNavigate,
  onRefresh
}) {
  const currentStats = stats || {};

  const statCards = [
    {
      title: 'Gallery Exhibits',
      count: currentStats.galleryCount ?? gallery.length,
      icon: Images,
      color: 'from-pink-500/20 to-rose-500/10 border-pink-500/30 text-pink-400',
      tab: 'gallery'
    },
    {
      title: 'Portfolio Projects',
      count: currentStats.projectsCount ?? projects.length,
      icon: FolderKanban,
      color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400',
      tab: 'projects'
    },
    {
      title: 'Client Inquiries',
      count: currentStats.inquiriesCount ?? inquiries.length,
      icon: Mail,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
      tab: 'inquiries'
    },
    {
      title: 'Services Matrix',
      count: currentStats.servicesCount ?? 0,
      icon: Cpu,
      color: 'from-purple-500/20 to-violet-500/10 border-purple-500/30 text-purple-400',
      tab: 'services'
    },
    {
      title: 'Team Profiles',
      count: currentStats.teamCount ?? 0,
      icon: Users,
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400',
      tab: 'team'
    },
    {
      title: 'FAQs Stored',
      count: currentStats.faqsCount ?? 0,
      icon: HelpCircle,
      color: 'from-sky-500/20 to-cyan-500/10 border-sky-500/30 text-sky-400',
      tab: 'faqs'
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-dark-850 via-sky-950/30 to-dark-850 border border-sky-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-3 font-mono">
            <Zap className="w-3.5 h-3.5" />
            <span>Skyweb Architecture Core</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Control Center & Content Hub
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Manage your high-performance portfolio, direct Cloudinary exhibit uploads, MongoDB case studies, and client proposal pipeline.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate?.('gallery')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Exhibit</span>
          </button>
          <button
            onClick={() => onNavigate?.('showcase')}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 rounded-xl text-sm font-medium transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Black Screen Center Image</span>
          </button>
          <button
            onClick={() => onNavigate?.('inquiries')}
            className="flex items-center gap-2 px-4 py-2.5 bg-dark-800 hover:bg-dark-750 border border-white/10 text-white rounded-xl text-sm font-medium transition-all cursor-pointer"
          >
            <span>View Inquiries</span>
            <ArrowRight className="w-4 h-4 text-sky-400" />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate?.(stat.tab)}
              className="p-6 bg-dark-850 rounded-2xl border border-white/5 cursor-pointer group hover:border-white/10 transition-all shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 font-mono">
                    {stat.title}
                  </div>
                  <div className="text-3xl font-black text-white tracking-tight">
                    {stat.count}
                  </div>
                </div>
                <div className={`p-3.5 rounded-2xl bg-gradient-to-br border ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 group-hover:text-sky-400 transition-colors">
                <span>Manage records</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity & Leads Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Inquiries List */}
        <div className="p-6 rounded-2xl bg-dark-850 border border-white/5 lg:col-span-2 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Incoming Client Inquiries</h3>
              <p className="text-xs text-slate-400">Latest proposals and RFPs received from the website</p>
            </div>
            <button
              onClick={() => onNavigate?.('inquiries')}
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {inquiries.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No inquiries received yet. Submissions from the contact form will appear here.
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.slice(0, 4).map((inq) => (
                <div
                  key={inq._id}
                  className="p-4 rounded-xl bg-dark-900/60 border border-white/5 flex items-center justify-between gap-4 hover:border-white/10 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white truncate">{inq.name}</span>
                      {inq.company && (
                        <span className="text-xs text-slate-400 bg-dark-800 px-2 py-0.5 rounded-md truncate border border-white/5">
                          {inq.company}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 line-clamp-1">{inq.message || inq.scope}</div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase font-mono ${
                      inq.status === 'new'
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        : inq.status === 'contacted'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-dark-800 text-slate-400 border border-white/5'
                    }`}>
                      {inq.status || 'new'}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1 font-mono">
                      {inq.budget || 'Custom'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Health / Telemetry */}
        <div className="p-6 rounded-2xl bg-dark-850 border border-white/5 space-y-4 shadow-lg">
          <div className="border-b border-white/5 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              <span>System Telemetry</span>
            </h3>
            <p className="text-xs text-slate-400">Backend and cloud architecture status</p>
          </div>

          <div className="space-y-3.5 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-dark-900/70 border border-white/5 flex items-center justify-between">
              <span className="text-slate-400">Database Engine</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                MongoDB Atlas
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-dark-900/70 border border-white/5 flex items-center justify-between">
              <span className="text-slate-400">Media CDN</span>
              <span className="font-bold text-sky-400">Cloudinary v2</span>
            </div>

            <div className="p-3.5 rounded-xl bg-dark-900/70 border border-white/5 flex items-center justify-between">
              <span className="text-slate-400">API Gateway</span>
              <span className="font-semibold text-slate-300">Port 5000</span>
            </div>

            <div className="p-3.5 rounded-xl bg-dark-900/70 border border-white/5 flex items-center justify-between">
              <span className="text-slate-400">Environment</span>
              <span className="font-bold text-amber-400">Development</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
