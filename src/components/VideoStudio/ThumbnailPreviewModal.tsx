import React, { useRef, useEffect, useState } from 'react';
import { VideoProject } from '../../types/video';
import { renderThumbnailCanvas, downloadThumbnailPNG } from '../../utils/thumbnailGenerator';
import { Image, Download, Sparkles, X, Check } from 'lucide-react';

interface ThumbnailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: VideoProject;
  onUpdateThumbnail: (thumb: VideoProject['thumbnail']) => void;
}

export const ThumbnailPreviewModal: React.FC<ThumbnailPreviewModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateThumbnail,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [title, setTitle] = useState(project.thumbnail.title);
  const [highlightWord, setHighlightWord] = useState(project.thumbnail.highlightWord);
  const [metricBadge, setMetricBadge] = useState(project.thumbnail.metricBadge);
  const [subjectTag, setSubjectTag] = useState(project.thumbnail.subjectTag);

  useEffect(() => {
    setTitle(project.thumbnail.title);
    setHighlightWord(project.thumbnail.highlightWord);
    setMetricBadge(project.thumbnail.metricBadge);
    setSubjectTag(project.thumbnail.subjectTag);
  }, [project.thumbnail]);

  useEffect(() => {
    if (!isOpen) return;
    const tempProj: VideoProject = {
      ...project,
      thumbnail: { title, highlightWord, metricBadge, subjectTag },
    };
    const rendered = renderThumbnailCanvas(tempProj);
    const target = canvasRef.current;
    if (target) {
      const ctx = target.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, target.width, target.height);
        ctx.drawImage(rendered, 0, 0, target.width, target.height);
      }
    }
  }, [isOpen, title, highlightWord, metricBadge, subjectTag, project]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const tempProj: VideoProject = {
      ...project,
      thumbnail: { title, highlightWord, metricBadge, subjectTag },
    };
    downloadThumbnailPNG(tempProj);
    onUpdateThumbnail({ title, highlightWord, metricBadge, subjectTag });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Image className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">1280 × 720 YouTube Thumbnail Studio</h3>
              <p className="text-xs text-slate-400">
                High-contrast, high-CTR thumbnail styled for Market Gap Daily
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 py-4 overflow-y-auto">
          {/* Live 1280x720 Canvas preview */}
          <div className="aspect-video w-full bg-[#070B14] rounded-xl overflow-hidden border border-slate-800 shadow-xl relative">
            <canvas
              ref={canvasRef}
              width={1280}
              height={720}
              className="w-full h-full object-contain"
            />
            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono bg-black/70 text-slate-300">
              1280 × 720 PNG
            </span>
          </div>

          {/* Form controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">
                Headline Text (3-5 words max)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">
                Electric Cyan Highlight Word
              </label>
              <input
                type="text"
                value={highlightWord}
                onChange={(e) => setHighlightWord(e.target.value.toUpperCase())}
                placeholder="e.g. COLLAPSE or BOTTLENECK"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-cyan-400 font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">
                High-Stakes Metric Badge
              </label>
              <input
                type="text"
                value={metricBadge}
                onChange={(e) => setMetricBadge(e.target.value.toUpperCase())}
                placeholder="e.g. +340% POWER DEFICIT"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-rose-400 font-bold font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">
                Technical Subject Tag
              </label>
              <input
                type="text"
                value={subjectTag}
                onChange={(e) => setSubjectTag(e.target.value.toUpperCase())}
                placeholder="e.g. 500GW CRUNCH"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-cyan-300 font-bold font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-mono">
            Optimized for smartphone feed readability
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download 1280×720 PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
