import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Check, Crop, Move } from 'lucide-react';

export default function ImageCropperModal({
  imageSrc,
  aspectRatio = 1, // 1 for square (1:1), 0.8 for 4:5, 16/9 for landscape
  title = 'Crop & Align Image',
  onCropComplete,
  onCancel
}) {
  const canvasRef = useRef(null);
  const [imgElement, setImgElement] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0); // in degrees: 0, 90, 180, 270
  const [selectedAspect, setSelectedAspect] = useState(aspectRatio);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Load image element
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      setImgElement(img);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setRotation(0);
    };
  }, [imageSrc]);

  // Viewport dimensions
  const VIEWPORT_WIDTH = 380;
  const VIEWPORT_HEIGHT = 380;

  // Calculate Crop Box Rectangle dimensions based on aspect ratio
  const getCropBox = useCallback(() => {
    let w = 320;
    let h = 320;
    if (selectedAspect) {
      if (selectedAspect >= 1) {
        w = 320;
        h = 320 / selectedAspect;
      } else {
        h = 320;
        w = 320 * selectedAspect;
      }
    }
    const x = (VIEWPORT_WIDTH - w) / 2;
    const y = (VIEWPORT_HEIGHT - h) / 2;
    return { x, y, w, h };
  }, [selectedAspect]);

  // Draw on Interactive Canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgElement) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    // Save context for transform
    ctx.save();
    ctx.translate(VIEWPORT_WIDTH / 2 + pan.x, VIEWPORT_HEIGHT / 2 + pan.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Calculate base draw size
    const isRotated90 = rotation === 90 || rotation === 270;
    const imgW = isRotated90 ? imgElement.height : imgElement.width;
    const imgH = isRotated90 ? imgElement.width : imgElement.height;

    // Scale to fit viewport initially
    const scaleToFit = Math.max(VIEWPORT_WIDTH / imgW, VIEWPORT_HEIGHT / imgH);
    const drawW = imgElement.width * scaleToFit;
    const drawH = imgElement.height * scaleToFit;

    ctx.drawImage(imgElement, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Draw Dark Overlay with Cutout for Crop Box
    const crop = getCropBox();

    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    // Top
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, crop.y);
    // Bottom
    ctx.fillRect(0, crop.y + crop.h, VIEWPORT_WIDTH, VIEWPORT_HEIGHT - (crop.y + crop.h));
    // Left
    ctx.fillRect(0, crop.y, crop.x, crop.h);
    // Right
    ctx.fillRect(crop.x + crop.w, crop.y, VIEWPORT_WIDTH - (crop.x + crop.w), crop.h);

    // Crop Border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(crop.x, crop.y, crop.w, crop.h);

    // Grid lines (rule of thirds)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // 1/3 horizontal
    ctx.beginPath();
    ctx.moveTo(crop.x, crop.y + crop.h / 3);
    ctx.lineTo(crop.x + crop.w, crop.y + crop.h / 3);
    // 2/3 horizontal
    ctx.moveTo(crop.x, crop.y + (crop.h * 2) / 3);
    ctx.lineTo(crop.x + crop.w, crop.y + (crop.h * 2) / 3);
    // 1/3 vertical
    ctx.moveTo(crop.x + crop.w / 3, crop.y);
    ctx.lineTo(crop.x + crop.w / 3, crop.y + crop.h);
    // 2/3 vertical
    ctx.moveTo(crop.x + (crop.w * 2) / 3, crop.y);
    ctx.lineTo(crop.x + (crop.w * 2) / 3, crop.y + crop.h);
    ctx.stroke();
    ctx.setLineDash([]);

    // Corners
    const cornerSize = 12;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;

    // Top-Left
    ctx.beginPath();
    ctx.moveTo(crop.x, crop.y + cornerSize);
    ctx.lineTo(crop.x, crop.y);
    ctx.lineTo(crop.x + cornerSize, crop.y);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(crop.x + crop.w - cornerSize, crop.y);
    ctx.lineTo(crop.x + crop.w, crop.y);
    ctx.lineTo(crop.x + crop.w, crop.y + cornerSize);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(crop.x, crop.y + crop.h - cornerSize);
    ctx.lineTo(crop.x, crop.y + crop.h);
    ctx.lineTo(crop.x + cornerSize, crop.y + crop.h);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(crop.x + crop.w - cornerSize, crop.y + crop.h);
    ctx.lineTo(crop.x + crop.w, crop.y + crop.h);
    ctx.lineTo(crop.x + crop.w, crop.y + crop.h - cornerSize);
    ctx.stroke();
  }, [imgElement, zoom, pan, rotation, getCropBox]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Dragging / Pan Handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Perform Final High-Resolution Crop
  const handleApplyCrop = () => {
    if (!imgElement) return;

    const crop = getCropBox();

    // Export Resolution (High DPI)
    const exportWidth = 800;
    const exportHeight = Math.round(exportWidth / (selectedAspect || 1));

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = exportWidth;
    exportCanvas.height = exportHeight;
    const expCtx = exportCanvas.getContext('2d');

    // Ratio between export canvas and on-screen crop box
    const ratio = exportWidth / crop.w;

    expCtx.save();
    // Move origin to match crop box center on export canvas
    expCtx.translate(
      exportWidth / 2 + (pan.x - (crop.x + crop.w / 2 - VIEWPORT_WIDTH / 2)) * ratio,
      exportHeight / 2 + (pan.y - (crop.y + crop.h / 2 - VIEWPORT_HEIGHT / 2)) * ratio
    );
    expCtx.rotate((rotation * Math.PI) / 180);
    expCtx.scale(zoom * ratio, zoom * ratio);

    const isRotated90 = rotation === 90 || rotation === 270;
    const imgW = isRotated90 ? imgElement.height : imgElement.width;
    const imgH = isRotated90 ? imgElement.width : imgElement.height;
    const scaleToFit = Math.max(VIEWPORT_WIDTH / imgW, VIEWPORT_HEIGHT / imgH);
    const drawW = imgElement.width * scaleToFit;
    const drawH = imgElement.height * scaleToFit;

    expCtx.drawImage(imgElement, -drawW / 2, -drawH / 2, drawW, drawH);
    expCtx.restore();

    // Convert to Blob & File
    exportCanvas.toBlob(
      (blob) => {
        if (!blob) return;
        const croppedFile = new File([blob], 'cropped_avatar.png', { type: 'image/png' });
        const croppedUrl = URL.createObjectURL(blob);
        onCropComplete(croppedFile, croppedUrl);
      },
      'image/png',
      0.95
    );
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="admin-card bg-slate-900 border-slate-800 max-w-md w-full p-6 space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Crop size={18} className="text-blue-400" />
            <h3 className="text-base font-bold text-white">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Aspect Ratio Selector */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 font-medium">Aspect Ratio:</span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedAspect(1)}
              className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-bold transition-colors ${
                selectedAspect === 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              1:1 Square
            </button>
            <button
              type="button"
              onClick={() => setSelectedAspect(0.8)}
              className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-bold transition-colors ${
                selectedAspect === 0.8
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              4:5 Portrait
            </button>
            <button
              type="button"
              onClick={() => setSelectedAspect(16 / 9)}
              className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-bold transition-colors ${
                selectedAspect === 16 / 9
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              16:9 Wide
            </button>
          </div>
        </div>

        {/* Canvas Crop Area */}
        <div className="relative mx-auto flex items-center justify-center bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
          <canvas
            ref={canvasRef}
            width={VIEWPORT_WIDTH}
            height={VIEWPORT_HEIGHT}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="cursor-move select-none"
            style={{ touchAction: 'none' }}
          />

          {/* Hint Overlay badge */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-sm border border-slate-700/80 px-2.5 py-1 rounded-full text-[10px] text-slate-300 font-mono flex items-center gap-1.5 pointer-events-none">
            <Move size={10} />
            <span>Drag image to reposition</span>
          </div>
        </div>

        {/* Controls Toolbar: Zoom Slider, Rotation */}
        <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-3">
            <ZoomOut size={16} className="text-slate-400 flex-shrink-0" />
            <input
              type="range"
              min="0.6"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
            />
            <ZoomIn size={16} className="text-slate-400 flex-shrink-0" />
            <span className="text-[11px] font-mono font-bold text-slate-300 w-10 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              <RotateCw size={13} />
              <span>Rotate 90°</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
                setRotation(0);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="admin-btn-secondary py-2 px-4 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            className="admin-btn-primary py-2 px-5 text-xs font-bold flex items-center gap-1.5"
          >
            <Check size={14} />
            <span>Apply Crop & Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
}
