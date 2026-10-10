import React, { useState } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  FolderKanban,
  Star,
  ExternalLink,
  X,
  Globe,
  ClipboardPaste,
  UploadCloud,
  Crop,
  Image as ImageIcon
} from 'lucide-react';
import api, { getImageUrl, handleImageError } from '../services/api';
import ImageCropperModal from '../components/ImageCropperModal';

export default function ProjectsManager({ projects = [], onReload, onRefresh, isReloading }) {
  const triggerReload = onRefresh || onReload || (() => {});
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [cropImageSrc, setCropImageSrc] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    description: '',
    category: 'Full-Stack',
    categoryTag: 'FULL-STACK',
    author: 'Skyweb Studio',
    stats: '',
    liveUrl: '',
    imageRef: '/ref-images/home_1.png',
    tags: '',
    featured: false,
    status: 'Completed',
    progress: 100,
    projectType: 'completed',
    badge: ''
  });

  const categories = [
    'Full-Stack',
    'Website Design',
    'App Design',
    'Logo Design',
    'E-Commerce',
    'Enterprise SaaS',
    'AI & Data',
    'Dev Tools',
    'Media Engine',
    'HealthTech'
  ];

  const handleOpenAdd = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      tagline: '',
      description: '',
      category: 'Full-Stack',
      categoryTag: 'FULL-STACK',
      author: 'Skyweb Studio',
      stats: '',
      liveUrl: '',
      imageRef: '/ref-images/home_1.png',
      tags: '',
      featured: false,
      status: 'Completed',
      progress: 100,
      projectType: 'completed',
      badge: ''
    });
    setImageFile(null);
    setPreviewUrl('/ref-images/home_1.png');
    setCropImageSrc(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      tagline: project.tagline || '',
      description: project.description || '',
      category: project.category || 'Full-Stack',
      categoryTag: project.categoryTag || '',
      author: project.author || 'Skyweb Studio',
      stats: project.stats || '',
      liveUrl: project.liveUrl && project.liveUrl !== '#' ? project.liveUrl : '',
      imageRef: project.imageRef || '/ref-images/home_1.png',
      tags: Array.isArray(project.tags) ? project.tags.join(', ') : (project.tags || ''),
      featured: !!project.featured,
      status: project.status || 'Completed',
      progress: project.progress !== undefined ? project.progress : 100,
      projectType: project.projectType || 'completed',
      badge: project.badge || ''
    });
    setImageFile(null);
    setPreviewUrl(project.imageRef || '/ref-images/home_1.png');
    setCropImageSrc(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setCropImageSrc(objectUrl);
    }
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const cleanUrl = formData.liveUrl ? formData.liveUrl.trim() : '';
      const formattedLiveUrl = cleanUrl
        ? (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') ? cleanUrl : `https://${cleanUrl}`)
        : '#';

      if (imageFile) {
        const data = new FormData();
        data.append('image', imageFile);
        data.append('liveUrl', formattedLiveUrl);
        Object.keys(formData).forEach((key) => {
          if (key !== 'liveUrl' && formData[key] !== undefined && formData[key] !== null) {
            if (key === 'tags') {
              const tagsStr = typeof formData.tags === 'string'
                ? formData.tags
                : (Array.isArray(formData.tags) ? formData.tags.join(', ') : '');
              data.append('tags', tagsStr);
            } else {
              data.append(key, formData[key]);
            }
          }
        });

        if (editingProject) {
          await api.updateProject(editingProject._id, data);
        } else {
          await api.createProject(data);
        }
      } else {
        const payload = {
          ...formData,
          liveUrl: formattedLiveUrl,
          tags: typeof formData.tags === 'string'
            ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
            : formData.tags
        };

        if (editingProject) {
          await api.updateProject(editingProject._id, payload);
        } else {
          await api.createProject(payload);
        }
      }

      setIsModalOpen(false);
      triggerReload();
    } catch (error) {
      alert('Error saving project: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteProject(id);
      setDeleteConfirmId(null);
      triggerReload();
    } catch (error) {
      alert('Error deleting project: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredProjects = projects.filter((proj) => {
    const matchesType = typeFilter === 'all' || proj.projectType === typeFilter;
    const matchesSearch =
      search === '' ||
      proj.title?.toLowerCase().includes(search.toLowerCase()) ||
      proj.category?.toLowerCase().includes(search.toLowerCase()) ||
      proj.tagline?.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 p-8 max-w-7xl mx-auto">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input pl-10"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="admin-input sm:w-44 bg-slate-900 cursor-pointer"
          >
            <option value="all">All Projects</option>
            <option value="completed">Completed Case Studies</option>
            <option value="ongoing">Ongoing R&D Initiatives</option>
          </select>
        </div>

        <button onClick={handleOpenAdd} className="admin-btn-primary">
          <Plus size={16} />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Table / Cards */}
      {filteredProjects.length === 0 ? (
        <div className="admin-card py-20 text-center text-slate-400 space-y-3">
          <FolderKanban size={40} className="mx-auto text-slate-600" />
          <div className="text-base font-semibold text-white">No Projects Found</div>
          <p className="text-xs text-slate-500">Add a new completed or ongoing project to display</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project._id} className="admin-card overflow-hidden flex flex-col justify-between group">
              <div>
                <div className="relative aspect-video bg-slate-950 overflow-hidden border-b border-slate-800">
                  <img
                    src={getImageUrl(project.imageRef) || '/ref-images/home_1.png'}
                    alt={project.title}
                    onError={(e) => handleImageError(e, '/ref-images/home_1.png')}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {project.featured && (
                    <span className="absolute top-3 left-3 bg-blue-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                      <Star size={10} fill="currentColor" />
                      Featured
                    </span>
                  )}
                  <span className="absolute top-3 right-3 bg-slate-900/90 text-slate-200 text-[10px] font-mono px-2 py-0.5 rounded-md border border-slate-700">
                    {project.category}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-emerald-400">{project.stats || project.status}</span>
                    <span className="uppercase text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded">
                      {project.projectType || 'completed'}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white">{project.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{project.description}</p>

                  {/* Tags */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {project.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-[10px] font-mono bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-950/50 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-xs text-slate-400 font-mono">
                  {project.liveUrl && project.liveUrl !== '#' ? (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <span>Live Site</span>
                      <ExternalLink size={11} />
                    </a>
                  ) : (
                    <span>Internal Project</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(project)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Edit project"
                  >
                    <Edit2 size={14} />
                  </button>

                  {deleteConfirmId === project._id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(project._id)}
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
                      onClick={() => setDeleteConfirmId(project._id)}
                      className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                      title="Delete project"
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
          <div className="admin-card bg-slate-900 border-slate-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="admin-input"
                    placeholder="e.g. Trevor Noah Global Portal"
                  />
                </div>

                <div>
                  <label className="admin-label">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="admin-input bg-slate-900"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="admin-label">Tagline / Subtitle</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="admin-input"
                  placeholder="e.g. Interactive Global Entertainment Portal"
                />
              </div>

              <div>
                <label className="admin-label">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="admin-input"
                  placeholder="Detailed architectural scope and outcome..."
                />
              </div>

              {/* Project Image Upload Area */}
              <div>
                <label className="admin-label flex items-center justify-between">
                  <span>Project Image (Upload File / Cloudinary / URL)</span>
                  {imageFile && (
                    <span className="text-[11px] text-emerald-400 font-medium">New image selected</span>
                  )}
                </label>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-5 cursor-pointer bg-slate-950/60 transition-colors">
                      {previewUrl ? (
                        <div className="space-y-2 text-center w-full">
                          <img
                            src={getImageUrl(previewUrl)}
                            alt="Project Preview"
                            onError={(e) => handleImageError(e, '/ref-images/home_1.png')}
                            className="max-h-40 max-w-full rounded-lg mx-auto object-cover shadow-md border border-slate-700"
                          />
                          <span className="text-xs text-blue-400 block font-semibold hover:text-blue-300">
                            Change Image File
                          </span>
                        </div>
                      ) : (
                        <div className="text-center space-y-2 py-2">
                          <UploadCloud size={32} className="mx-auto text-blue-400" />
                          <div className="text-xs font-semibold text-slate-300">
                            Click to upload & crop project image file
                          </div>
                          <div className="text-[11px] text-slate-500">PNG, JPG, WEBP up to 15MB (16:9 recommended)</div>
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
                        onClick={() => setCropImageSrc(getImageUrl(previewUrl))}
                        className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                      >
                        <Crop size={14} className="text-blue-400" />
                        <span>Crop / Adjust Project Framing (16:9)</span>
                      </button>
                    )}
                  </div>

                  <div>
                    <div className="text-center text-[10px] text-slate-500 font-mono mb-1.5">OR ENTER DIRECT URL / PATH</div>
                    <input
                      type="text"
                      placeholder="/ref-images/home_1.png or https://..."
                      value={formData.imageRef}
                      onChange={(e) => {
                        setFormData({ ...formData, imageRef: e.target.value });
                        if (!imageFile) setPreviewUrl(e.target.value);
                      }}
                      className="admin-input"
                    />
                  </div>
                </div>
              </div>

              {/* Live Site URL */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="admin-label !mb-0 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                    Live Site URL (Visit Website Link)
                  </label>
                  {formData.liveUrl && formData.liveUrl !== '#' && (
                    <a
                      href={formData.liveUrl.startsWith('http') ? formData.liveUrl : `https://${formData.liveUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:underline"
                      title="Test URL in new tab"
                    >
                      Test <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={formData.liveUrl}
                    onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                    className="admin-input pr-24"
                    placeholder="https://example.com"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        if (text) {
                          setFormData(prev => ({ ...prev, liveUrl: text.trim() }));
                        }
                      } catch (err) {
                        const text = prompt('Paste your website URL here:');
                        if (text) {
                          setFormData(prev => ({ ...prev, liveUrl: text.trim() }));
                        }
                      }
                    }}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-medium bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 rounded-md transition-all flex items-center gap-1 cursor-pointer"
                    title="Paste URL from Clipboard"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    Paste URL
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="admin-label">Project Type</label>
                  <select
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    className="admin-input bg-slate-900"
                  >
                    <option value="completed">Completed</option>
                    <option value="ongoing">Ongoing R&D</option>
                  </select>
                </div>

                <div>
                  <label className="admin-label">Metrics / Stats</label>
                  <input
                    type="text"
                    value={formData.stats}
                    onChange={(e) => setFormData({ ...formData, stats: e.target.value })}
                    className="admin-input"
                    placeholder="e.g. 1.2M Visitors"
                  />
                </div>

                <div>
                  <label className="admin-label">Status Label</label>
                  <input
                    type="text"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="admin-input"
                    placeholder="Completed / Beta"
                  />
                </div>
              </div>

              <div>
                <label className="admin-label">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="admin-input"
                  placeholder="Next.js, Framer Motion, Tailwind, Stripe"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="featured-proj"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-800 cursor-pointer"
                />
                <label htmlFor="featured-proj" className="text-sm font-semibold text-slate-300 cursor-pointer">
                  Feature on Home Page Showcase
                </label>
              </div>

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
                  {isSubmitting ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
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
          title="Crop Project Artwork (16:9)"
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
