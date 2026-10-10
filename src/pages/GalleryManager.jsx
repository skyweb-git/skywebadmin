import React, { useState } from 'react';
import {
  Plus,
  Search,
  UploadCloud,
  Trash2,
  Edit2,
  Heart,
  Star,
  X,
  Image as ImageIcon,
  Crop
} from 'lucide-react';
import api, { getImageUrl, handleImageError } from '../services/api';
import ImageCropperModal from '../components/ImageCropperModal';

export default function GalleryManager({ items, gallery, onReload, onRefresh, isReloading }) {
  const currentItems = items || gallery || [];
  const triggerReload = onRefresh || onReload || (() => {});
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [cropImageSrc, setCropImageSrc] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'UI/UX Architecture',
    client: 'Skyweb Studio',
    year: new Date().getFullYear().toString(),
    image: '',
    aspectRatio: 'landscape',
    featured: false,
    badge: '',
    tags: '',
    description: '',
    color: '#1800ad'
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const categories = [
    'All',
    'UI/UX Architecture',
    'Brand & Identity',
    '3D & Spatial',
    'Mobile & Apps',
    'Editorial & Art',
    'Studio & Culture'
  ];

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      category: 'UI/UX Architecture',
      client: 'Skyweb Studio',
      year: new Date().getFullYear().toString(),
      image: '',
      aspectRatio: 'landscape',
      featured: false,
      badge: '',
      tags: '',
      description: '',
      color: '#1800ad'
    });
    setImageFile(null);
    setPreviewUrl('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      category: item.category || 'UI/UX Architecture',
      client: item.client || '',
      year: item.year || '',
      image: item.image || '',
      aspectRatio: item.aspectRatio || 'landscape',
      featured: !!item.featured,
      badge: item.badge || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
      description: item.description || '',
      color: item.color || '#1800ad'
    });
    setImageFile(null);
    setPreviewUrl(item.image || '');
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setCropImageSrc(objectUrl);
    }
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingItem) {
        // Update existing item
        await api.updateGalleryItem(editingItem._id, formData);
      } else {
        // Create new item (with file upload to Cloudinary or URL)
        if (imageFile) {
          const data = new FormData();
          data.append('image', imageFile);
          Object.keys(formData).forEach((key) => {
            data.append(key, formData[key]);
          });
          await api.createGalleryItem(data);
        } else {
          await api.createGalleryItem(formData);
        }
      }
      setIsModalOpen(false);
      triggerReload();
    } catch (error) {
      alert('Error saving gallery item: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteGalleryItem(id);
      setDeleteConfirmId(null);
      triggerReload();
    } catch (error) {
      alert('Error deleting gallery item: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredItems = currentItems.filter((item) => {
    const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesSearch =
      search === '' ||
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.client?.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 p-8 max-w-7xl mx-auto">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search exhibits..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input pl-10"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="admin-input sm:w-48 bg-slate-900 cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <button onClick={handleOpenAddModal} className="admin-btn-primary">
          <Plus size={16} />
          <span>Add Exhibit</span>
        </button>
      </div>

      {/* Exhibits Grid */}
      {filteredItems.length === 0 ? (
        <div className="admin-card py-20 text-center text-slate-400 space-y-3">
          <ImageIcon size={40} className="mx-auto text-slate-600" />
          <div className="text-base font-semibold text-white">No Gallery Exhibits Found</div>
          <p className="text-xs text-slate-500">
            {search ? 'Try clearing your search query' : 'Upload your first gallery exhibit to Cloudinary'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item._id} className="admin-card overflow-hidden flex flex-col justify-between group">
              <div>
                {/* Thumbnail Frame */}
                <div className="relative aspect-video bg-slate-950 overflow-hidden border-b border-slate-800">
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.title}
                    onError={(e) => handleImageError(e, '/ref-images/home_1.png')}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.featured && (
                    <span className="absolute top-3 left-3 bg-amber-500/90 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                      <Star size={10} fill="currentColor" />
                      Featured
                    </span>
                  )}
                  <span className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-slate-200 text-[10px] font-mono px-2 py-0.5 rounded-md border border-slate-700">
                    {item.category}
                  </span>
                </div>

                {/* Exhibit Details */}
                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-blue-400">{item.client}</span>
                    <span>{item.year}</span>
                  </div>
                  <h3 className="font-bold text-base text-white line-clamp-1">{item.title}</h3>
                  {item.description && (
                    <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-950/50 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Heart size={14} className="text-pink-500" fill="currentColor" />
                  <span>{item.likes || 0}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Edit metadata"
                  >
                    <Edit2 size={14} />
                  </button>

                  {deleteConfirmId === item._id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(item._id)}
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
                      onClick={() => setDeleteConfirmId(item._id)}
                      className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                      title="Delete exhibit"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="admin-card bg-slate-900 border-slate-800 max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingItem ? 'Edit Exhibit Details' : 'Upload New Gallery Exhibit'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload Area */}
              <div>
                <label className="admin-label">Exhibit Image (Cloudinary / File / URL)</label>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-6 cursor-pointer bg-slate-950/60 transition-colors">
                      {previewUrl ? (
                        <div className="space-y-2 text-center">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-h-36 rounded-lg mx-auto object-cover shadow-md border border-slate-700"
                          />
                          <span className="text-xs text-blue-400 block font-semibold">Change Image File</span>
                        </div>
                      ) : (
                        <div className="text-center space-y-2">
                          <UploadCloud size={32} className="mx-auto text-blue-400" />
                          <div className="text-xs font-semibold text-slate-300">
                            Click to upload & crop image file
                          </div>
                          <div className="text-[11px] text-slate-500">PNG, JPG, WEBP up to 10MB</div>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>

                    {previewUrl && (
                      <button
                        type="button"
                        onClick={() => setCropImageSrc(previewUrl)}
                        className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                      >
                        <Crop size={13} className="text-blue-400" />
                        <span>Crop / Adjust Image Framing</span>
                      </button>
                    )}
                  </div>

                  <div className="text-center text-xs text-slate-500 font-mono">OR PASTE URL</div>
                  <input
                    type="text"
                    placeholder="https://... or /ref-images/..."
                    value={formData.image}
                    onChange={(e) => {
                      setFormData({ ...formData, image: e.target.value });
                      if (!imageFile) setPreviewUrl(e.target.value);
                    }}
                    className="admin-input"
                  />
                </div>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Exhibit Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="admin-input"
                    placeholder="e.g. Next-Gen Financial HUD"
                  />
                </div>

                <div>
                  <label className="admin-label">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="admin-input bg-slate-900"
                  >
                    {categories.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Client & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Client Name</label>
                  <input
                    type="text"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="admin-input"
                    placeholder="e.g. Acme Protocols"
                  />
                </div>

                <div>
                  <label className="admin-label">Year</label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="admin-input"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="admin-label">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="admin-input"
                  placeholder="React, Three.js, Luxury, WebGL"
                />
              </div>

              {/* Description */}
              <div>
                <label className="admin-label">Description / Summary</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="admin-input"
                  placeholder="Architectural summary of this asset..."
                />
              </div>

              {/* Featured Checkbox */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-800 cursor-pointer"
                />
                <label htmlFor="featured-check" className="text-sm font-semibold text-slate-300 cursor-pointer">
                  Pin as Featured Showcase Exhibit
                </label>
              </div>

              {/* Submit / Cancel */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="admin-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="admin-btn-primary"
                >
                  {isSubmitting ? 'Saving...' : editingItem ? 'Update Exhibit' : 'Save & Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Crop Modal */}
      {cropImageSrc && (
        <ImageCropperModal
          imageSrc={cropImageSrc}
          aspectRatio={16 / 9}
          title="Crop Gallery Exhibit Artwork"
          onCropComplete={(croppedFile, croppedUrl) => {
            setImageFile(croppedFile);
            setPreviewUrl(croppedUrl);
            setCropImageSrc(null);
          }}
          onCancel={() => setCropImageSrc(null)}
        />
      )}
    </div>
  );
}
