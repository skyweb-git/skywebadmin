import React, { useState } from 'react';
import {
  Mail,
  Search,
  Trash2,
  Phone,
  Building,
  DollarSign,
  Calendar,
  X,
  Send
} from 'lucide-react';
import api from '../services/api';

export default function InquiriesManager({ inquiries = [], onReload, onRefresh, isReloading }) {
  const triggerReload = onRefresh || onReload || (() => {});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const statuses = [
    { id: 'all', label: 'All Inquiries' },
    { id: 'new', label: 'New Leads' },
    { id: 'in_review', label: 'In Review' },
    { id: 'contacted', label: 'Contacted' },
    { id: 'archived', label: 'Archived' }
  ];

  const handleStatusChange = async (inquiryId, newStatus) => {
    setIsUpdatingStatus(true);
    try {
      await api.updateInquiry(inquiryId, { status: newStatus });
      if (selectedInquiry && selectedInquiry._id === inquiryId) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus });
      }
      triggerReload();
    } catch (error) {
      alert('Error updating status: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteInquiry(id);
      if (selectedInquiry?._id === id) setSelectedInquiry(null);
      setDeleteConfirmId(null);
      triggerReload();
    } catch (error) {
      alert('Error deleting inquiry: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesStatus = statusFilter === 'all' || inq.status === statusFilter;
    const matchesSearch =
      search === '' ||
      inq.name?.toLowerCase().includes(search.toLowerCase()) ||
      inq.email?.toLowerCase().includes(search.toLowerCase()) ||
      inq.company?.toLowerCase().includes(search.toLowerCase()) ||
      inq.message?.toLowerCase().includes(search.toLowerCase()) ||
      inq.scope?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 p-8 max-w-7xl mx-auto">
      {/* Controls & Filter Pills */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search proposals by client, email, scope..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input pl-10"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          {statuses.map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === st.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Leads List & Detail Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredInquiries.length === 0 ? (
            <div className="admin-card py-20 text-center text-slate-400 space-y-3">
              <Mail size={40} className="mx-auto text-slate-600" />
              <div className="text-base font-semibold text-white">No Inquiries Found</div>
              <p className="text-xs text-slate-500">
                {search ? 'Try clearing your search query' : 'New client proposals will arrive here.'}
              </p>
            </div>
          ) : (
            filteredInquiries.map((inq) => {
              const isSelected = selectedInquiry?._id === inq._id;
              return (
                <div
                  key={inq._id}
                  onClick={() => setSelectedInquiry(inq)}
                  className={`admin-card p-5 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-950/20'
                      : 'hover:bg-slate-900/90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base text-white">{inq.name}</span>
                        {inq.company && (
                          <span className="text-xs text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Building size={11} className="text-slate-400" />
                            <span>{inq.company}</span>
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-blue-400 font-mono mt-1">{inq.email}</div>
                      <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                        {inq.message || inq.scope}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase ${
                        inq.status === 'new'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : inq.status === 'in_review'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : inq.status === 'contacted'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {inq.status || 'new'}
                      </span>

                      <div className="text-[11px] text-slate-500 font-mono">
                        {inq.budget || inq.serviceType || 'Proposal'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Selected Detail Drawer */}
        <div className="lg:col-span-1">
          {selectedInquiry ? (
            <div className="admin-card p-6 space-y-6 sticky top-28">
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-bold text-lg text-white">{selectedInquiry.name}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Received {new Date(selectedInquiry.createdAt || Date.now()).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Contact Information */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail size={14} className="text-blue-400" />
                  <a href={`mailto:${selectedInquiry.email}`} className="text-blue-400 hover:underline">
                    {selectedInquiry.email}
                  </a>
                </div>

                {selectedInquiry.phone && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone size={14} className="text-emerald-400" />
                    <span>{selectedInquiry.phone}</span>
                  </div>
                )}

                {selectedInquiry.company && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Building size={14} className="text-purple-400" />
                    <span>{selectedInquiry.company}</span>
                  </div>
                )}

                {selectedInquiry.budget && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <DollarSign size={14} className="text-amber-400" />
                    <span>Budget: <strong>{selectedInquiry.budget}</strong></span>
                  </div>
                )}

                {selectedInquiry.timeline && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar size={14} className="text-sky-400" />
                    <span>Timeline: <strong>{selectedInquiry.timeline}</strong></span>
                  </div>
                )}
              </div>

              {/* Message Body */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Project Scope & Message
                </div>
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {selectedInquiry.message || selectedInquiry.scope}
                </p>
              </div>

              {/* Status Updater */}
              <div className="space-y-2">
                <label className="admin-label">Update Proposal Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {['new', 'in_review', 'contacted', 'archived'].map((st) => (
                    <button
                      key={st}
                      disabled={isUpdatingStatus}
                      onClick={() => handleStatusChange(selectedInquiry._id, st)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer ${
                        selectedInquiry.status === st
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delete / Reply Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-slate-800">
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Regarding Your Project Scope with Skyweb`}
                  className="admin-btn-primary flex-1 text-center"
                >
                  <Send size={14} />
                  <span>Reply via Email</span>
                </a>

                {deleteConfirmId === selectedInquiry._id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(selectedInquiry._id)}
                      className="px-3 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="p-2 rounded-xl bg-slate-800 text-slate-400"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirmId(selectedInquiry._id)}
                    className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
                    title="Delete inquiry"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="admin-card p-12 text-center text-slate-500 text-xs">
              Select an inquiry on the left to view full proposal details and manage its status.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
