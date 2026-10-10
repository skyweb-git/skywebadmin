import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Linkedin, Mail, X, UploadCloud, Crop, UserCheck } from 'lucide-react';
import api, { getImageUrl, handleImageError } from '../services/api';
import ImageCropperModal from '../components/ImageCropperModal';

export default function TeamManager({ team = [], onReload, onRefresh, isReloading }) {
  const triggerReload = onRefresh || onReload || (() => {});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [cropImageSrc, setCropImageSrc] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    role: 'Systems Architect',
    formalRole: '',
    badge: 'FOUNDER',
    profileQuote: '',
    bio: '',
    interests: '',
    hobbies: '',
    favouriteFood: '',
    expertise: '',
    linkedin: '',
    nanoProfiles: '',
    github: '',
    email: '',
    avatar: '/ref-images/team_rabbani.png'
  });

  const handleOpenAdd = () => {
    setEditingMember(null);
    setImageFile(null);
    setPreviewUrl('/ref-images/team_rabbani.png');
    setFormData({
      name: '',
      role: 'Systems Architect',
      formalRole: '',
      badge: 'FOUNDER',
      profileQuote: '',
      bio: '',
      interests: '',
      hobbies: '',
      favouriteFood: '',
      expertise: 'MERN Stack, System Architecture, Cloud DevOps',
      linkedin: '',
      nanoProfiles: '',
      github: '',
      email: '',
      avatar: '/ref-images/team_rabbani.png'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mem) => {
    setEditingMember(mem);
    setImageFile(null);
    setPreviewUrl(mem.avatar || '/ref-images/team_rabbani.png');
    const existingRole = mem.role || `${mem.creativeTitlePrefix || ''}${mem.creativeTitleAccent || ''}`.trim() || '';
    setFormData({
      name: mem.name || '',
      role: existingRole,
      formalRole: mem.formalRole || '',
      badge: mem.badge || '',
      profileQuote: mem.profileQuote || '',
      bio: mem.bio || '',
      interests: mem.interests || '',
      hobbies: mem.hobbies || '',
      favouriteFood: mem.favouriteFood || '',
      expertise: Array.isArray(mem.expertise) ? mem.expertise.join(', ') : (mem.expertise || ''),
      linkedin: mem.linkedin || '',
      nanoProfiles: mem.nanoProfiles || mem.github || '',
      github: mem.nanoProfiles || mem.github || '',
      email: mem.email || '',
      avatar: mem.avatar || '/ref-images/team_rabbani.png'
    });
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
      const roleParts = (formData.role || '').trim().split(' ');
      let creativeTitlePrefix = '';
      let creativeTitleAccent = '';
      if (roleParts.length > 1) {
        creativeTitlePrefix = roleParts.slice(0, -1).join(' ') + ' ';
        creativeTitleAccent = roleParts[roleParts.length - 1];
      } else {
        creativeTitleAccent = roleParts[0] || '';
      }

      if (imageFile) {
        const data = new FormData();
        data.append('avatar', imageFile);
        data.append('creativeTitlePrefix', creativeTitlePrefix);
        data.append('creativeTitleAccent', creativeTitleAccent);
        Object.keys(formData).forEach((key) => {
          if (formData[key] !== undefined && formData[key] !== null) {
            data.append(key, formData[key]);
          }
        });
        if (editingMember) {
          await api.updateTeamMember(editingMember._id, data);
        } else {
          await api.createTeamMember(data);
        }
      } else {
        const payload = {
          ...formData,
          creativeTitlePrefix,
          creativeTitleAccent,
          expertise: typeof formData.expertise === 'string'
            ? formData.expertise.split(',').map((e) => e.trim()).filter(Boolean)
            : formData.expertise
        };

        if (editingMember) {
          await api.updateTeamMember(editingMember._id, payload);
        } else {
          await api.createTeamMember(payload);
        }
      }
      setIsModalOpen(false);
      triggerReload();
    } catch (error) {
      alert('Error saving team member: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteTeamMember(id);
      setDeleteConfirmId(null);
      triggerReload();
    } catch (error) {
      alert('Error deleting team member: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="space-y-6 p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Founders & Leadership Team</h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage team cards, roles, quotes, and social connections</p>
        </div>
        <button onClick={handleOpenAdd} className="admin-btn-primary">
          <Plus size={16} />
          <span>Add Member</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map((mem) => (
          <div key={mem._id} className="admin-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={getImageUrl(mem.avatar) || '/ref-images/team_rabbani.png'}
                  alt={mem.name}
                  onError={(e) => handleImageError(e, '/ref-images/team_rabbani.png')}
                  className="w-14 h-14 rounded-2xl object-cover bg-slate-800 border border-slate-700 flex-shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white">{mem.name}</h3>
                    {mem.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {mem.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{mem.role}</p>
                </div>
              </div>

              {mem.profileQuote && (
                <p className="text-xs text-slate-300 italic border-l-2 border-blue-500 pl-3 leading-relaxed">
                  "{mem.profileQuote}"
                </p>
              )}

              {mem.expertise && mem.expertise.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {mem.expertise.map((exp, i) => (
                    <span key={i} className="text-[10px] font-mono bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-400">
                      {exp}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                {mem.email && (
                  <a href={`mailto:${mem.email}`} className="hover:text-white" title={mem.email}>
                    <Mail size={14} />
                  </a>
                )}
                {mem.linkedin && (
                  <a href={mem.linkedin} target="_blank" rel="noreferrer" className="hover:text-blue-400" title="LinkedIn">
                    <Linkedin size={14} />
                  </a>
                )}
                {(mem.nanoProfiles || mem.github) && (
                  <a href={mem.nanoProfiles || mem.github} target="_blank" rel="noreferrer" className="hover:text-sky-400" title="Nano Profiles">
                    <UserCheck size={14} />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(mem)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                >
                  <Edit2 size={14} />
                </button>

                {deleteConfirmId === mem._id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(mem._id)}
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
                    onClick={() => setDeleteConfirmId(mem._id)}
                    className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
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
                {editingMember ? 'Edit Profile' : 'Add Team Member'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="admin-input"
                    placeholder="e.g. MD Rabbani"
                  />
                </div>

                <div>
                  <label className="admin-label">Badge</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="admin-input"
                    placeholder="FOUNDER / OPERATIONS"
                  />
                </div>
              </div>

              <div>
                <label className="admin-label">Profile Quote / Philosophy</label>
                <textarea
                  rows={2}
                  value={formData.profileQuote}
                  onChange={(e) => setFormData({ ...formData, profileQuote: e.target.value })}
                  className="admin-input"
                  placeholder="Architected high-throughput cloud backends from ground zero..."
                />
              </div>

              {/* Avatar Upload Area */}
              <div>
                <label className="admin-label">Avatar Image (Cloudinary / File / URL)</label>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-4 cursor-pointer bg-slate-950/60 transition-colors">
                      {previewUrl ? (
                        <div className="space-y-2 text-center">
                          <img
                            src={previewUrl}
                            alt="Avatar Preview"
                            onError={(e) => handleImageError(e, '/ref-images/team_rabbani.png')}
                            className="w-20 h-20 rounded-2xl mx-auto object-cover border border-slate-700 shadow-md"
                          />
                          <span className="text-xs text-blue-400 block font-semibold">Change Photo</span>
                        </div>
                      ) : (
                        <div className="text-center space-y-2">
                          <UploadCloud size={28} className="mx-auto text-blue-400" />
                          <div className="text-xs font-semibold text-slate-300">
                            Click to upload & crop photo
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

                  <div className="text-center text-[10px] text-slate-500 font-mono">OR PASTE DIRECT PATH / URL</div>
                  <input
                    type="text"
                    placeholder="/ref-images/team_rabbani.png or https://..."
                    value={formData.avatar}
                    onChange={(e) => {
                      setFormData({ ...formData, avatar: e.target.value });
                      if (!imageFile) setPreviewUrl(e.target.value);
                    }}
                    className="admin-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="admin-label">Role Title (e.g. Systems Architect)</label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="admin-input"
                  placeholder="e.g. Systems Architect, Founder & CEO, Lead AI Engineer"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="admin-label">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="admin-input text-xs"
                    placeholder="name@skyweb.com"
                  />
                </div>
                <div>
                  <label className="admin-label">LinkedIn URL</label>
                  <input
                    type="text"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="admin-input text-xs"
                    placeholder="https://linkedin.com/..."
                  />
                </div>
                <div>
                  <label className="admin-label">Nano Profiles URL</label>
                  <input
                    type="text"
                    value={formData.nanoProfiles !== undefined ? formData.nanoProfiles : (formData.github || '')}
                    onChange={(e) => setFormData({ ...formData, nanoProfiles: e.target.value, github: e.target.value })}
                    className="admin-input text-xs"
                    placeholder="https://nanoprofiles.com/..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="admin-btn-primary">
                  {isSubmitting ? 'Saving...' : editingMember ? 'Update Profile' : 'Save Profile'}
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
          aspectRatio={1}
          title="Crop Profile Photo"
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
