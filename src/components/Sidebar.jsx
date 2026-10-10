import React from 'react';
import {
  LayoutDashboard,
  Images,
  FolderKanban,
  Mail,
  Cpu,
  Users,
  HelpCircle,
  Settings,
  Sparkles,
  ExternalLink,
  X
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, counts = {}, isOpen, onClose }) {
  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'gallery', label: 'Gallery Exhibits', icon: Images, count: counts.gallery },
    { id: 'projects', label: 'Portfolio Projects', icon: FolderKanban, count: counts.projects },
    { id: 'inquiries', label: 'Client Inquiries', icon: Mail, badge: counts.newInquiries },
    { id: 'services', label: 'Services Matrix', icon: Cpu, count: counts.services },
    { id: 'team', label: 'Team Profiles', icon: Users, count: counts.team },
    { id: 'faqs', label: 'FAQ Database', icon: HelpCircle, count: counts.faqs },
    { id: 'showcase', label: 'Black Screen Showcase', icon: Sparkles },
    { id: 'settings', label: 'System & API', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-dark-850 border-r border-white/5 flex flex-col justify-between shrink-0 min-h-screen transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-sky-500/25">
                S
              </div>
              <div>
                <div className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                  SKYWEB <span className="text-[10px] bg-sky-500/20 text-sky-400 font-mono px-1.5 py-0.5 rounded-md">ADMIN</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">Control Center</div>
              </div>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (onClose) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge > 0 ? (
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold font-mono ${
                      isActive ? 'bg-white text-sky-600' : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    }`}>
                      {item.badge} new
                    </span>
                  ) : item.count !== undefined ? (
                    <span className={`text-[11px] font-mono opacity-60 ${isActive ? 'text-white' : 'text-slate-500'}`}>
                      {item.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Info & Quick Link to Live Site */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-dark-900/60 border border-white/5 text-xs font-medium text-slate-300 hover:text-white hover:border-white/10 transition-all group"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Open Live Client Site</span>
            </span>
            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
          </a>

          <div className="px-3 py-2 text-[11px] text-slate-500 flex items-center justify-between font-mono">
            <span>API Gateway</span>
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
