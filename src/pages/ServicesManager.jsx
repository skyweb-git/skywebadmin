import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, X } from 'lucide-react';
import api from '../services/api';

export default function ServicesManager({ services = [], onReload, onRefresh, isReloading }) {
  const triggerReload = onRefresh || onReload || (() => {});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'PRODUCT ENGINEERING',
    description: '',
    ctaText: 'EXPLORE APPS',
    highlightBadge: 'Enterprise Grade',
    iconType: 'code',
    capabilities: ''
  });

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({
      title: '',
      category: 'PRODUCT ENGINEERING',
      description: '',
      ctaText: 'EXPLORE MORE',
      highlightBadge: 'Most Requested',
      iconType: 'code',
      capabilities: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (svc) => {
    setEditingService(svc);
    setFormData({
      title: svc.title || '',
      category: svc.category || '',
      description: svc.description || '',
      ctaText: svc.ctaText || 'EXPLORE MORE',
      highlightBadge: svc.highlightBadge || '',
      iconType: svc.iconType || 'code',
      capabilities: Array.isArray(svc.capabilities) ? svc.capabilities.join('\n') : (svc.capabilities || '')
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        capabilities: typeof formData.capabilities === 'string'
          ? formData.capabilities.split('\n').map((c) => c.trim()).filter(Boolean)
          : formData.capabilities
      };

      if (editingService) {
        await api.updateService(editingService._id, payload);
      } else {
        await api.createService(payload);
      }
      setIsModalOpen(false);
      triggerReload();
    } catch (error) {
      alert('Error saving service: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteService(id);
      setDeleteConfirmId(null);
      triggerReload();
    } catch (error) {
      alert('Error deleting service: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="space-y-6 p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Services & Capabilities Matrix</h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage what services are offered on the Home and Capabilities pages</p>
        </div>
        <button onClick={handleOpenAdd} className="admin-btn-primary">
          <Plus size={16} />
          <span>Add Service</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((svc) => (
          <div key={svc._id} className="admin-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                  {svc.category}
                </span>
                {svc.highlightBadge && (
                  <span className="text-xs font-bold text-emerald-400">
                    {svc.highlightBadge}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-white">{svc.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{svc.description}</p>

              {svc.capabilities && svc.capabilities.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  {svc.capabilities.map((cap, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 size={13} className="text-blue-400 shrink-0" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(svc)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Edit service"
              >
                <Edit2 size={14} />
              </button>

              {deleteConfirmId === svc._id ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDelete(svc._id)}
                    className="px-2 py-1 rounded bg-rose-600 text-white text-xs font-bold"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="p-1 rounded bg-slate-800 text-slate-400"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirmId(svc._id)}
                  className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                  title="Delete service"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="admin-card bg-slate-900 border-slate-800 max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingService ? 'Edit Service' : 'Add Service Offering'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="admin-label">Service Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="admin-input"
                  placeholder="e.g. Custom Web Solutions"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Category Kicker</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="admin-input"
                    placeholder="ENTERPRISE ARCHITECTURE"
                  />
                </div>

                <div>
                  <label className="admin-label">Highlight Badge</label>
                  <input
                    type="text"
                    value={formData.highlightBadge}
                    onChange={(e) => setFormData({ ...formData, highlightBadge: e.target.value })}
                    className="admin-input"
                    placeholder="Enterprise Grade"
                  />
                </div>
              </div>

              <div>
                <label className="admin-label">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="admin-input"
                  placeholder="High-throughput web applications with bespoke microservice architectures..."
                />
              </div>

              <div>
                <label className="admin-label">Key Capabilities (one per line)</label>
                <textarea
                  rows={4}
                  value={formData.capabilities}
                  onChange={(e) => setFormData({ ...formData, capabilities: e.target.value })}
                  className="admin-input font-mono text-xs"
                  placeholder="Modern MERN & Next.js 15 Stacks&#10;Micro-Frontends & Serverless Compute&#10;OWASP Security Compliance"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="admin-btn-primary">
                  {isSubmitting ? 'Saving...' : editingService ? 'Update Service' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
