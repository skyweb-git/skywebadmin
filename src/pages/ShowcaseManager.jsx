import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Sparkles,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { showcaseApi, getImageUrl, handleImageError } from '../services/api';

export default function ShowcaseManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [topBadge, setTopBadge] = useState('Stillness speaks.');
  const [title, setTitle] = useState('Find your center,');
  const [subtitle, setSubtitle] = useState('where peace resides and clarity awakens within the soul.');
  const [bottomBadge, setBottomBadge] = useState('Observe, accept, let go.');
  const [showQuote, setShowQuote] = useState(true);
  const [imageFit, setImageFit] = useState('cover');
  const [imageMaxHeight, setImageMaxHeight] = useState(380);
  const [isActive, setIsActive] = useState(true);

  // Fetch current showcase data
  useEffect(() => {
    fetchShowcase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchShowcase = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Check localStorage first for instant hydration
      const cached = localStorage.getItem('skyweb_showcase_data');
      if (cached) {
        try {
          applyData(JSON.parse(cached));
        } catch (e) {}
      }

      const res = await showcaseApi.get();
      if (res?.data?.data) {
        applyData(res.data.data);
        localStorage.setItem('skyweb_showcase_data', JSON.stringify(res.data.data));
      }
    } catch (err) {
      console.warn('Failed to load showcase from API, relying on cached data:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyData = (data) => {
    setImageUrl(data.imageUrl || '');
    setPreviewUrl(data.imageUrl || '');
    setTopBadge(data.topBadge || 'Stillness speaks.');
    setTitle(data.title || 'Find your center,');
    setSubtitle(data.subtitle || 'where peace resides and clarity awakens within the soul.');
    setBottomBadge(data.bottomBadge || 'Observe, accept, let go.');
    setShowQuote(data.showQuote !== undefined ? data.showQuote : true);
    setImageFit(data.imageFit || 'cover');
    setImageMaxHeight(data.imageMaxHeight || 380);
    setIsActive(data.isActive !== undefined ? data.isActive : true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WEBP, GIF, SVG).');
      return;
    }

    setImageFile(file);
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setErrorMsg('');
  };

  const handleRemoveImage = async () => {
    setImageFile(null);
    setImageUrl('');
    setPreviewUrl('');

    try {
      await showcaseApi.deleteImage();
      const updated = {
        imageUrl: '',
        topBadge,
        title,
        subtitle,
        bottomBadge,
        showQuote,
        imageFit,
        imageMaxHeight,
        isActive
      };
      localStorage.setItem('skyweb_showcase_data', JSON.stringify(updated));
      setSuccessMsg('Image removed. Center view restored to pure minimalist typography.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to remove image on backend:', err);
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      let payload;
      if (imageFile) {
        payload = new FormData();
        payload.append('image', imageFile);
        payload.append('topBadge', topBadge);
        payload.append('title', title);
        payload.append('subtitle', subtitle);
        payload.append('bottomBadge', bottomBadge);
        payload.append('showQuote', showQuote);
        payload.append('imageFit', imageFit);
        payload.append('imageMaxHeight', imageMaxHeight);
        payload.append('isActive', isActive);
      } else {
        payload = {
          imageUrl: previewUrl,
          topBadge,
          title,
          subtitle,
          bottomBadge,
          showQuote,
          imageFit,
          imageMaxHeight,
          isActive
        };
      }

      const res = await showcaseApi.update(payload);
      const savedData = res?.data?.data || payload;

      // Update local state with saved image URL
      if (savedData.imageUrl) {
        setImageUrl(savedData.imageUrl);
        setPreviewUrl(savedData.imageUrl);
      }
      setImageFile(null);

      // Save to localStorage for instant cross-tab synchronization
      localStorage.setItem('skyweb_showcase_data', JSON.stringify(savedData));

      setSuccessMsg('Successfully updated black screen center image! Changes are live on the website.');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error('Error saving showcase:', err);
      // Fallback: save to localStorage so frontend still gets the update
      const fallback = {
        imageUrl: previewUrl,
        topBadge,
        title,
        subtitle,
        bottomBadge,
        showQuote,
        imageFit,
        imageMaxHeight,
        isActive
      };
      localStorage.setItem('skyweb_showcase_data', JSON.stringify(fallback));
      setSuccessMsg('Saved locally! Note: Backend synchronization encountered an issue, but local display is updated.');
      setTimeout(() => setSuccessMsg(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const samplePresets = [
    { label: 'Cyber Tech 1', url: '/ref-images/home_1.png' },
    { label: 'Digital Architecture 2', url: '/ref-images/home_2.png' },
    { label: 'Studio Showcase 3', url: '/ref-images/home_3.png' }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-2 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-mono">Loading Black Screen Showcase configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-dark-800/40 p-5 rounded-2xl border border-white/5 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-sky-400" />
            Black Screen Showcase Manager
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Upload and position the centerpiece image displayed in the center of the dark Zen screen on the Home Page.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-dark-800 hover:bg-dark-700 border border-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
            <span>View Live Site</span>
          </a>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-sky-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Publishing Changes...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save & Deploy Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Upload & Controls on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Upload Controls & Customization (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Image Upload */}
          <div className="bg-dark-850 p-6 rounded-2xl border border-white/5 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-sky-400" />
                Upload Center Image
              </h2>
              {previewUrl && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove Image
                </button>
              )}
            </div>

            {/* Drag & Drop Upload Zone */}
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-2xl p-6 cursor-pointer bg-slate-950/50 hover:bg-slate-950/80 transition-all group">
              <div className="text-center space-y-3 w-full">
                <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto text-sky-400 group-hover:scale-105 transition-transform">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200 group-hover:text-white">
                    {previewUrl ? 'Click to replace center image' : 'Click to select or drop an image file'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    PNG, JPG, WEBP, GIF, SVG up to 15MB
                  </p>
                </div>
                <span className="inline-block px-3 py-1 bg-dark-800 border border-white/10 text-sky-400 rounded-lg text-xs font-mono">
                  Browse Files
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* Direct Image URL input */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Or Enter Image URL / Path</span>
              </label>
              <input
                type="text"
                value={previewUrl}
                onChange={(e) => {
                  setPreviewUrl(e.target.value);
                  setImageFile(null);
                }}
                placeholder="https://... or /ref-images/home_1.png or /uploads/..."
                className="w-full px-3.5 py-2.5 bg-dark-900 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-sky-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Quick Sample Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 font-mono">Quick Sample Presets:</span>
              <div className="flex flex-wrap gap-2">
                {samplePresets.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => {
                      setPreviewUrl(preset.url);
                      setImageFile(null);
                    }}
                    className="px-2.5 py-1 bg-dark-800 hover:bg-dark-700 border border-white/10 text-slate-300 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Display & Framing Settings */}
          <div className="bg-dark-850 p-6 rounded-2xl border border-white/5 space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-sky-400" />
              Center Framing & Options
            </h2>

            {/* Toggle Quote alongside Image */}
            <div className="flex items-center justify-between p-3.5 bg-dark-900/60 rounded-xl border border-white/5">
              <div>
                <p className="text-sm font-semibold text-white">Show Quote with Image</p>
                <p className="text-xs text-slate-400">Display "Find your center..." quote around the image</p>
              </div>
              <button
                type="button"
                onClick={() => setShowQuote(!showQuote)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  showQuote ? 'bg-sky-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    showQuote ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Image Fit Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Image Fit Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {['cover', 'contain', 'natural'].map((fit) => (
                  <button
                    key={fit}
                    type="button"
                    onClick={() => setImageFit(fit)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium capitalize border transition-all cursor-pointer ${
                      imageFit === fit
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm'
                        : 'bg-dark-900 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {fit}
                  </button>
                ))}
              </div>
            </div>

            {/* Center Image Height Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">Centerpiece Max Height</span>
                <span className="font-mono text-sky-400">{imageMaxHeight}px</span>
              </div>
              <input
                type="range"
                min="200"
                max="650"
                step="20"
                value={imageMaxHeight}
                onChange={(e) => setImageMaxHeight(Number(e.target.value))}
                className="w-full accent-sky-500 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Compact (200px)</span>
                <span>Balanced (380px)</span>
                <span>Expansive (650px)</span>
              </div>
            </div>

            {/* Typography Customization Accordion/Fields */}
            <div className="space-y-3 pt-3 border-t border-white/5">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Typography Overrides
              </span>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400">Top Header Badge</label>
                <input
                  type="text"
                  value={topBadge}
                  onChange={(e) => setTopBadge(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-900 border border-white/10 rounded-xl text-white text-xs focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400">Center Headline</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-900 border border-white/10 rounded-xl text-white text-xs focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400">Center Subtitle</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-900 border border-white/10 rounded-xl text-white text-xs focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400">Bottom Footer Badge</label>
                <input
                  type="text"
                  value={bottomBadge}
                  onChange={(e) => setBottomBadge(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-900 border border-white/10 rounded-xl text-white text-xs focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Exact Live Simulation of the Black Screen Card (7 Cols) */}
        <div className="lg:col-span-7 space-y-3 sticky top-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              LIVE REAL-TIME SCREEN PREVIEW
            </span>
            <span className="text-emerald-400">Synced to Client View</span>
          </div>

          {/* Black Card Simulated Container */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-black to-slate-950 border border-slate-700/60 shadow-2xl p-6 sm:p-10 min-h-[580px] flex flex-col justify-between items-center text-slate-100">
            {/* Background SVG Grid pattern */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="simGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#simGrid)" />
            </svg>

            {/* Corner Decorative Brackets */}
            <div className="absolute top-4 left-4 w-7 h-7 border-t border-l border-slate-500/40" />
            <div className="absolute top-4 right-4 w-7 h-7 border-t border-r border-slate-500/40" />
            <div className="absolute bottom-4 left-4 w-7 h-7 border-b border-l border-slate-500/40" />
            <div className="absolute bottom-4 right-4 w-7 h-7 border-b border-r border-slate-500/40" />

            {/* Top Badge */}
            <div className="relative z-10 text-center pt-2">
              <h3 className="text-xs font-mono font-light text-slate-300 uppercase tracking-[0.25em] opacity-80">
                {topBadge || 'STILLNESS SPEAKS.'}
              </h3>
              <div className="mt-3 w-12 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent opacity-30 mx-auto" />
            </div>

            {/* CENTER CONTENT: The Image and/or Quotes */}
            <div className="relative z-10 my-auto py-6 w-full flex flex-col items-center justify-center text-center">
              {/* If preview image is selected, show image in center */}
              {previewUrl ? (
                <div className="w-full flex flex-col items-center justify-center space-y-5">
                  {/* The Centerpiece Image Frame */}
                  <div
                    className="relative group rounded-2xl overflow-hidden border border-slate-700/80 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xs max-w-xl w-full mx-auto bg-slate-950/70"
                    style={{
                      maxHeight: `${imageMaxHeight}px`
                    }}
                  >
                    {/* Glowing corner marks on image */}
                    <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-sky-400/80 z-20" />
                    <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-sky-400/80 z-20" />
                    <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-sky-400/80 z-20" />
                    <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-sky-400/80 z-20" />

                    <img
                      src={getImageUrl(previewUrl)}
                      alt="Black Screen Centerpiece"
                      onError={(e) => handleImageError(e, '/ref-images/home_1.png')}
                      className="w-full h-full transition-transform duration-700 ease-out group-hover:scale-102"
                      style={{
                        maxHeight: `${imageMaxHeight}px`,
                        objectFit: imageFit === 'natural' ? 'contain' : imageFit
                      }}
                    />

                    {/* Subtle Gradient Vignette Over Image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />
                  </div>

                  {/* Accompanying Quote if enabled */}
                  {showQuote && (
                    <div className="max-w-xl mx-auto px-4 space-y-1.5 pt-2">
                      <h4 className="text-xl sm:text-2xl font-extralight text-slate-100 tracking-tight">
                        {title}
                      </h4>
                      <p className="text-xs sm:text-sm font-thin text-slate-300 leading-relaxed tracking-wide">
                        {subtitle}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* No image uploaded: Pure Zen Typography View */
                <div className="max-w-xl mx-auto space-y-4">
                  <h2 className="text-2xl sm:text-4xl font-extralight text-slate-100 tracking-tight leading-tight">
                    {title}
                  </h2>
                  <p className="text-sm sm:text-lg font-thin text-slate-300 leading-relaxed tracking-wide">
                    {subtitle}
                  </p>
                  <div className="pt-2 text-xs font-mono text-slate-500">
                    [ No centerpiece image selected. Select or upload an image above to place in center ]
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Badge */}
            <div className="relative z-10 text-center pb-2">
              <div className="mb-3 w-12 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent opacity-30 mx-auto" />
              <h3 className="text-xs font-mono font-light text-slate-300 uppercase tracking-[0.25em] opacity-80">
                {bottomBadge || 'OBSERVE, ACCEPT, LET GO.'}
              </h3>
              <div className="mt-3 flex justify-center space-x-2 opacity-50">
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                <div className="w-1 h-1 bg-slate-300 rounded-full opacity-80" />
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
              </div>
            </div>
          </div>

          <div className="p-3 bg-dark-850 rounded-xl border border-white/5 text-xs text-slate-400 flex items-center justify-between">
            <span>Center image renders responsive on mobile, tablet & desktop viewports.</span>
            <button
              type="button"
              onClick={handleSave}
              className="text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
            >
              Publish Now &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
