import React, { useState, useEffect } from 'react';
import { Settings, Server, Database, Cloud, RefreshCw, CheckCircle2, Terminal } from 'lucide-react';
import { healthApi } from '../services/api';

const SettingsPage = ({ onRefreshAll }) => {
  const [healthStatus, setHealthStatus] = useState({
    status: 'checking',
    backend: false,
    mongodb: false,
    cloudinary: false,
    uptime: 0,
    timestamp: null
  });
  const [testing, setTesting] = useState(false);
  const [apiUrl, setApiUrl] = useState(process.env.REACT_APP_API_URL || 'http://localhost:5000/api');
  const [successMessage, setSuccessMessage] = useState(null);

  const checkConnectivity = async () => {
    setTesting(true);
    try {
      const res = await healthApi.check();
      setHealthStatus({
        status: res.data?.status === 'ok' ? 'healthy' : 'degraded',
        backend: true,
        mongodb: res.data?.database?.mongodb === 'connected',
        cloudinary: res.data?.services?.cloudinary === 'configured',
        uptime: res.data?.uptime || Math.floor(performance.now() / 1000),
        timestamp: new Date().toLocaleTimeString()
      });
      setSuccessMessage('Successfully refreshed system diagnostics.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setHealthStatus({
        status: 'disconnected',
        backend: false,
        mongodb: false,
        cloudinary: false,
        uptime: 0,
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    checkConnectivity();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Banner */}
      <div className="bg-dark-800/40 p-5 rounded-2xl border border-white/5 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-sky-400" />
            System Settings & Telemetry
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Monitor infrastructure health, database pools, CDN integrations, and API routing.
          </p>
        </div>
        <button
          onClick={() => {
            checkConnectivity();
            onRefreshAll?.();
          }}
          disabled={testing}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-dark-800 hover:bg-dark-700 border border-white/10 text-white rounded-xl text-sm font-medium transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-sky-400 ${testing ? 'animate-spin' : ''}`} />
          {testing ? 'Probing Nodes...' : 'Run Diagnostics'}
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {successMessage}
        </div>
      )}

      {/* Grid of System Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Node 1: Express Engine */}
        <div className="bg-dark-850 p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Server className="w-5 h-5" />
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium flex items-center gap-1.5 ${
              healthStatus.backend ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${healthStatus.backend ? 'bg-emerald-400' : 'bg-red-400 animate-ping'}`} />
              {healthStatus.backend ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          <div>
            <h3 className="text-white font-semibold">Node.js / Express Core</h3>
            <p className="text-slate-400 text-xs mt-1">REST API Gateway & Multi-part Multer pipeline</p>
          </div>
          <div className="pt-3 border-t border-white/5 font-mono text-xs text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Port:</span>
              <span className="text-white">5000</span>
            </div>
            <div className="flex justify-between">
              <span>CORS Policy:</span>
              <span className="text-emerald-400">Active (Multi-Origin)</span>
            </div>
          </div>
        </div>

        {/* Node 2: MongoDB Atlas */}
        <div className="bg-dark-850 p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium flex items-center gap-1.5 ${
              healthStatus.mongodb ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${healthStatus.mongodb ? 'bg-emerald-400' : 'bg-red-400'}`} />
              {healthStatus.mongodb ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>
          <div>
            <h3 className="text-white font-semibold">MongoDB Database</h3>
            <p className="text-slate-400 text-xs mt-1">Collections: Gallery, Projects, Inquiries, Services, Team, FAQs</p>
          </div>
          <div className="pt-3 border-t border-white/5 font-mono text-xs text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Driver:</span>
              <span className="text-white">Mongoose ODM</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={healthStatus.mongodb ? 'text-emerald-400' : 'text-red-400'}>
                {healthStatus.mongodb ? 'Ready' : 'Check URI'}
              </span>
            </div>
          </div>
        </div>

        {/* Node 3: Cloudinary CDN */}
        <div className="bg-dark-850 p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Cloud className="w-5 h-5" />
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium flex items-center gap-1.5 ${
              healthStatus.cloudinary ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${healthStatus.cloudinary ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              {healthStatus.cloudinary ? 'LINKED' : 'UNVERIFIED'}
            </span>
          </div>
          <div>
            <h3 className="text-white font-semibold">Cloudinary CDN Media</h3>
            <p className="text-slate-400 text-xs mt-1">High-throughput asset transforms, caching & auto-webp delivery</p>
          </div>
          <div className="pt-3 border-t border-white/5 font-mono text-xs text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Storage Cloud:</span>
              <span className="text-white">Active</span>
            </div>
            <div className="flex justify-between">
              <span>Auto Optimization:</span>
              <span className="text-sky-400">f_auto, q_auto</span>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Section */}
      <div className="bg-dark-850 p-6 rounded-2xl border border-white/5 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Terminal className="w-5 h-5 text-sky-400" />
          API Gateway Endpoint
        </h2>

        <div>
          <label className="block text-xs font-mono uppercase text-slate-400 mb-2">
            Base Endpoint URL (Proxy Target)
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="flex-1 bg-dark-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-sky-500"
            />
            <button
              onClick={() => {
                localStorage.setItem('SKYWEB_API_URL', apiUrl);
                setSuccessMessage('API Configuration saved.');
                setTimeout(() => setSuccessMessage(null), 3000);
              }}
              className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              Save
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            The Admin App communicates with this endpoint. Default is <code className="text-sky-400">http://localhost:5000/api</code>.
          </p>
        </div>

        {/* System Details Box */}
        <div className="p-4 bg-dark-900/60 rounded-xl border border-white/5 space-y-2 font-mono text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Environment:</span>
            <span className="text-sky-400 font-semibold">Development / Localhost</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Admin App Port:</span>
            <span className="text-white">3001</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Client Main App Port:</span>
            <span className="text-white">3000</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Backend Server Port:</span>
            <span className="text-white">5000</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Last Telemetry Sync:</span>
            <span className="text-slate-300">{healthStatus.timestamp || 'Never'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
