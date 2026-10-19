import React, { useState } from 'react';
import { VideoProject } from '../../types/video';
import { renderVideoFrame } from '../../utils/canvasSceneRenderer';
import { downloadSrtFile } from '../../utils/srtGenerator';
import { downloadThumbnailPNG } from '../../utils/thumbnailGenerator';
import { base64ToUint8Array } from '../../utils/wavStitcher';
import { Film, Download, Check, Loader2, Sparkles, X, FileText, Image, AlertCircle } from 'lucide-react';

interface ExportVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: VideoProject;
}

export const ExportVideoModal: React.FC<ExportVideoModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setIsExporting(true);
    setProgress(0);
    setDownloadUrl(null);
    setExportError(null);

    try {
      // 1. Setup offscreen 1920x1080 canvas
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not initialize 2D render context.');

      // 2. Setup Audio mixing
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 44100,
      });
      const dest = audioCtx.createMediaStreamDestination();

      if (project.voiceoverAudioBase64) {
        try {
          const wavBytes = base64ToUint8Array(project.voiceoverAudioBase64);
          const rawBuffer = wavBytes.buffer.slice(0) as ArrayBuffer;
          const audioBuffer = await audioCtx.decodeAudioData(rawBuffer);
          const source = audioCtx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(dest);
          source.start(0);
        } catch (audioErr) {
          console.warn('Voiceover decode warning (exporting silent video track):', audioErr);
        }
      }

      // 3. Setup MediaStream & Recorder
      const canvasStream = canvas.captureStream(30);
      const combinedTracks = [
        ...canvasStream.getVideoTracks(),
        ...dest.stream.getAudioTracks(),
      ];
      const combinedStream = new MediaStream(combinedTracks);

      const mimeType = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')
        ? 'video/mp4;codecs=avc1'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : 'video/webm';

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 8000000, // 8 Mbps high-bitrate Full HD
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const exportPromise = new Promise<string>((resolve, reject) => {
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType });
          const url = URL.createObjectURL(blob);
          resolve(url);
        };
        recorder.onerror = (e) => reject(e);
      });

      recorder.start();

      // 4. Render frames progressively
      const fps = 30;
      const totalFrames = Math.round(project.totalDuration * fps);
      const frameDelta = 1 / fps;

      for (let frame = 0; frame <= totalFrames; frame++) {
        const currentTime = frame * frameDelta;
        renderVideoFrame({
          ctx,
          width: 1920,
          height: 1080,
          currentTime,
          project,
        });

        if (frame % 5 === 0) {
          setProgress(Math.round((frame / totalFrames) * 100));
          // Yield to browser event loop
          await new Promise((r) => setTimeout(r, 16));
        }
      }

      recorder.stop();
      audioCtx.close().catch(() => {});

      const finalUrl = await exportPromise;
      setDownloadUrl(finalUrl);
      setProgress(100);
    } catch (err: any) {
      console.error(err);
      setExportError(err.message || 'Failed to encode video');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadVideo = () => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    const safeTitle = project.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    a.download = `${safeTitle}_1080p.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Full HD Video & Package Export</h3>
              <p className="text-xs text-slate-400">
                1920 × 1080 @ 30 FPS · H.264 MP4 / WebM · Synchronized Audio
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

        <div className="space-y-4 py-4 text-xs">
          {/* Episode Info */}
          <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
              Episode Deliverable Package
            </span>
            <h4 className="text-sm font-bold text-white">{project.title}</h4>
            <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px] pt-1">
              <span>{project.totalDuration}s duration</span>
              <span>•</span>
              <span>{project.scenes.length} visual beats</span>
              <span>•</span>
              <span>1920 × 1080 Canvas</span>
            </div>
          </div>

          {/* Progress bar during export */}
          {isExporting && (
            <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between font-mono">
                <span className="text-cyan-400 flex items-center gap-2 font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Rendering Full HD Video Frames...
                </span>
                <span className="text-white font-bold">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  style={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-150"
                />
              </div>
            </div>
          )}

          {exportError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{exportError}</span>
            </div>
          )}

          {/* Download Buttons Area */}
          {downloadUrl && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Check className="w-4 h-4" />
                Video Rendered Successfully!
              </div>

              <button
                onClick={handleDownloadVideo}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                Download 1080p Video (.MP4)
              </button>
            </div>
          )}

          {/* Supporting Deliverables (Captions & Thumbnail) */}
          <div className="border-t border-slate-800 pt-3 space-y-2">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
              Accompanying Deliverables
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => downloadSrtFile(project.scenes, project.title)}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 flex items-center justify-center gap-2 font-semibold transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                Download SRT Captions
              </button>

              <button
                type="button"
                onClick={() => downloadThumbnailPNG(project)}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 flex items-center justify-center gap-2 font-semibold transition-colors"
              >
                <Image className="w-3.5 h-3.5 text-cyan-400" />
                Download 720p Thumbnail
              </button>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Close
          </button>

          {!downloadUrl && (
            <button
              onClick={handleStartExport}
              disabled={isExporting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Rendering...
                </>
              ) : (
                <>
                  <Film className="w-3.5 h-3.5" />
                  Render 1080p MP4 Video
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
