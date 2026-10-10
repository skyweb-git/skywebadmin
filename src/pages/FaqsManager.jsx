import React, { useState } from 'react';
import { HelpCircle, Plus, Search, Trash2, Edit3, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import { faqsApi } from '../services/api';

const FaqsManager = ({ faqs = [], onRefresh, onReload }) => {
  const triggerRefresh = onRefresh || onReload || (() => {});
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    order: 0
  });

  const categories = ['ALL', ...new Set(faqs.map(f => f.category || 'General'))];

  const filteredFaqs = faqs.filter(f => {
    const matchesSearch = (f.question || '').toLowerCase().includes(search.toLowerCase()) ||
                          (f.answer || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      category: 'General',
      order: faqs.length + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (faq, e) => {
    e.stopPropagation();
    setEditingFaq(faq);
    setFormData({
      question: faq.question || '',
      answer: faq.answer || '',
      category: faq.category || 'General',
      order: faq.order || 0
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      setLoading(true);
      await faqsApi.delete(id);
      await triggerRefresh();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete FAQ');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editingFaq) {
        await faqsApi.update(editingFaq._id, formData);
      } else {
        await faqsApi.create(formData);
      }
      setIsModalOpen(false);
      await triggerRefresh();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save FAQ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-800/40 p-5 rounded-2xl border border-white/5 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-sky-400" />
            Knowledge Base & FAQs
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage interactive accordion questions, categorized answers, and help desk topics.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl font-medium shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search FAQs & answers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-800 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'bg-dark-800 text-slate-400 hover:text-white border border-white/5 hover:border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQs Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.map((faq) => {
          const isExpanded = expandedId === faq._id;
          return (
            <div
              key={faq._id}
              className="bg-dark-850 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all"
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : faq._id)}
                className="flex items-center justify-between p-4 sm:p-5 cursor-pointer select-none bg-dark-800/40 hover:bg-dark-800/70 transition-colors"
              >
                <div className="flex items-center gap-3 pr-4">
                  <span className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                    {faq.order || '•'}
                  </span>
                  <div>
                    <span className="inline-block px-2 py-0.5 mb-1 text-[10px] uppercase font-mono font-semibold text-sky-400 bg-sky-500/10 rounded border border-sky-500/20">
                      {faq.category || 'General'}
                    </span>
                    <h3 className="text-white font-medium text-sm sm:text-base leading-snug">
                      {faq.question}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => handleOpenEdit(faq, e)}
                    className="p-2 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Edit FAQ"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(faq._id, e)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Delete FAQ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="w-px h-5 bg-white/10 mx-1" />
                  <div className="p-1.5 text-slate-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-sky-400" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="p-5 text-slate-300 text-sm leading-relaxed border-t border-white/5 bg-dark-900/60 whitespace-pre-line">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}

        {filteredFaqs.length === 0 && (
          <div className="text-center py-16 bg-dark-850 border border-white/5 rounded-2xl">
            <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-white font-medium">No FAQs found</h3>
            <p className="text-slate-500 text-xs mt-1">Try resetting search filters or add a new question.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-dark-850 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/5 bg-dark-800/60">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-sky-400" />
                {editingFaq ? 'Edit FAQ Item' : 'New Question & Answer'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">Question *</label>
                <input
                  type="text"
                  required
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="e.g., What is Skyweb's typical development timeline?"
                  className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">Answer *</label>
                <textarea
                  rows="4"
                  required
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Detailed breakdown of the answer..."
                  className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="General, Technical, Pricing, etc."
                    className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">Display Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaqsManager;
