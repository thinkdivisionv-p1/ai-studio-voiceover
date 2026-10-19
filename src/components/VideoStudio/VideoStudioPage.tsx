import React, { useState } from 'react';
import { VideoProject, SceneBeat } from '../../types/video';
import { VIDEO_PRESETS } from '../../data/videoPresets';
import { CanvasVideoPlayer } from './CanvasVideoPlayer';
import { SceneTableEditor } from './SceneTableEditor';
import { ThumbnailPreviewModal } from './ThumbnailPreviewModal';
import { QCReportModal } from './QCReportModal';
import { ExportVideoModal } from './ExportVideoModal';
import { downloadSrtFile } from '../../utils/srtGenerator';
import { downloadThumbnailPNG } from '../../utils/thumbnailGenerator';
import {
  Film,
  Sparkles,
  Download,
  Image,
  ShieldCheck,
  FileText,
  Upload,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  BarChart3,
  ExternalLink,
} from 'lucide-react';

interface VideoStudioPageProps {
  currentVoiceoverAudioBase64?: string | null;
  currentVoiceoverTitle?: string;
}

export const VideoStudioPage: React.FC<VideoStudioPageProps> = ({
  currentVoiceoverAudioBase64,
  currentVoiceoverTitle,
}) => {
  const [project, setProject] = useState<VideoProject>(() => {
    const base = VIDEO_PRESETS[0];
    return {
      ...base,
      voiceoverAudioBase64: currentVoiceoverAudioBase64 || undefined,
    };
  });

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isThumbModalOpen, setIsThumbModalOpen] = useState(false);
  const [isQCModalOpen, setIsQCModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);

  // Switch episode template
  const handleSelectPreset = (id: string) => {
    const preset = VIDEO_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setProject({
      ...preset,
      voiceoverAudioBase64: project.voiceoverAudioBase64 || currentVoiceoverAudioBase64 || undefined,
    });
    setCurrentTime(0);
    setIsPlaying(false);
  };

  // Import custom voiceover WAV file
  const handleImportAudio = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const b64 = result.split(',')[1] || result;
      setProject((prev) => ({
        ...prev,
        voiceoverAudioBase64: b64,
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header / Brand Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-[#071325] to-slate-950 border border-cyan-500/30 rounded-2xl p-6 lg:p-8 backdrop-blur-sm shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                Market Gap Daily · Production Engine
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                1080p 30 FPS
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              High-Retention YouTube Animated Video Studio
            </h2>
            <p className="text-xs lg:text-sm text-slate-300 max-w-2xl mt-1.5 leading-relaxed">
              Transform voiceovers, episode transcripts, and scene tables into dynamic engineering and
              financial news explainers. Kinetic typography, animated data charts, technical diagrams,
              and automated retention compliance.
            </p>
          </div>

          {/* Action Buttons Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Episode template selector */}
            <select
              value={project.id}
              onChange={(e) => handleSelectPreset(e.target.value)}
              className="bg-slate-900 border border-cyan-500/40 text-xs font-bold text-cyan-300 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {VIDEO_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsThumbModalOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Image className="w-3.5 h-3.5 text-cyan-400" />
              Thumbnail Studio
            </button>

            <button
              onClick={() => setIsQCModalOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              QC Audit Report
            </button>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 transition-all transform active:scale-95"
            >
              <Film className="w-4 h-4" />
              Render 1080p MP4
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Grid: Left Canvas Player / Right Voiceover & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 16:9 Canvas Player (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <CanvasVideoPlayer
            project={project}
            currentTime={currentTime}
            onTimeUpdate={setCurrentTime}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
          />

          {/* Quick Deliverable Download Bar */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Fast Package Downloads:
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => downloadSrtFile(project.scenes, project.title)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium flex items-center gap-1.5 transition-colors"
                title="Download word-accurate synchronized .SRT caption file"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                Download .SRT
              </button>

              <button
                type="button"
                onClick={() => downloadThumbnailPNG(project)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium flex items-center gap-1.5 transition-colors"
                title="Download 1280x720 thumbnail PNG"
              >
                <Image className="w-3.5 h-3.5 text-cyan-400" />
                Thumbnail PNG
              </button>
            </div>
          </div>
        </div>

        {/* Right: Audio Track Connection & Episode Settings (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Voiceover Sync Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                Audio Narration Synchronization
              </h3>
              <span className="text-[10px] font-mono text-cyan-400">
                {project.voiceoverAudioBase64 ? 'Track Attached' : 'No Audio'}
              </span>
            </div>

            {project.voiceoverAudioBase64 ? (
              <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Synchronized Voiceover Active
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                    {currentVoiceoverTitle || 'AI Studio 24kHz Studio WAV'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('replace-vo-file');
                    if (input) input.click();
                  }}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Replace
                </button>
              </div>
            ) : (
              <div
                onClick={() => {
                  const input = document.getElementById('replace-vo-file');
                  if (input) input.click();
                }}
                className="border-2 border-dashed border-slate-750 hover:border-cyan-500 rounded-xl p-4 text-center cursor-pointer bg-slate-950/60 hover:bg-slate-950 transition-all"
              >
                <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                <span className="text-xs font-bold text-slate-300 block">
                  Upload Voiceover (.WAV or .MP3)
                </span>
                <span className="text-[11px] text-slate-500">
                  Or generate speech in the Voiceover Studio and click "Create Video"
                </span>
              </div>
            )}

            <input
              id="replace-vo-file"
              type="file"
              accept="audio/*,.wav,.mp3"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleImportAudio(e.target.files[0]);
                }
              }}
            />

            {/* Quick episode metadata fields */}
            <div className="space-y-2 text-xs pt-2 border-t border-slate-800">
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1">
                  Episode Title
                </label>
                <input
                  type="text"
                  value={project.title}
                  onChange={(e) => setProject({ ...project, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-white font-semibold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 font-mono block mb-1">
                    Episode Number
                  </label>
                  <input
                    type="text"
                    value={project.episodeNumber}
                    onChange={(e) => setProject({ ...project, episodeNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-cyan-400 font-mono font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-mono block mb-1">
                    Total Duration (Seconds)
                  </label>
                  <input
                    type="number"
                    value={project.totalDuration}
                    onChange={(e) =>
                      setProject({ ...project, totalDuration: parseFloat(e.target.value) || 30 })
                    }
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scene Table & Storyboard Breakdown */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 lg:p-8 backdrop-blur-sm shadow-xl">
        <SceneTableEditor
          project={project}
          currentTime={currentTime}
          onJumpToTime={(t) => {
            setCurrentTime(t);
            setIsPlaying(false);
          }}
          onUpdateScenes={(newScenes) => setProject({ ...project, scenes: newScenes })}
        />
      </div>

      {/* Collapsible Market Gap Daily Production Standard Guide */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-sm">
        <button
          onClick={() => setShowGuidelines(!showGuidelines)}
          className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-slate-300 hover:text-white transition-colors"
        >
          <span className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Market Gap Daily — Production Standard & Technical Specifications Reference
          </span>
          {showGuidelines ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showGuidelines && (
          <div className="p-6 pt-0 border-t border-slate-800/80 space-y-4 text-xs text-slate-300 leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                <strong className="text-cyan-400 block font-semibold">1. Technical Requirements</strong>
                <p>• 1920 × 1080 (Full HD) @ 30 FPS, H.264 MP4</p>
                <p>• Audio duration matches voiceover with zero pacing distortion</p>
                <p>• Synchronized, word-accurate SRT captions</p>
                <p>• 1280 × 720 thumbnail with high contrast and dominant subject</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                <strong className="text-cyan-400 block font-semibold">2. Retention Rule (&le; 6s Static Limit)</strong>
                <p>• First 5 seconds: Immediate strong kinetic hook</p>
                <p>• Major visual changes every 3–6 seconds</p>
                <p>• Never allow an unchanged static composition longer than 6 seconds</p>
                <p>• Camera zooms (1.00x - 1.04x) and pan parallax</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                <strong className="text-cyan-400 block font-semibold">3. Engineering & Business Progression</strong>
                <p>• <strong>Breaking Development</strong> → What happened?</p>
                <p>• <strong>Engineering Problem</strong> → Why is physics or supply constrained?</p>
                <p>• <strong>Unmet Need</strong> → Where is the operational bottleneck?</p>
                <p>• <strong>Business Opportunity</strong> → What market gap unlocks revenue?</p>
                <p>• <strong>Practical Solution</strong> → What engineered system solves it?</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                <strong className="text-cyan-400 block font-semibold">4. Brand Visual Identity</strong>
                <p>• Dark charcoal/navy base (<code>#070B14</code>, <code>#0B1120</code>)</p>
                <p>• Electric Cyan primary accent (<code>#00F0FF</code>)</p>
                <p>• Clean technical diagrams, grid lines, glowing particle pulses</p>
                <p>• Large readable typography with selective cyan highlights</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ThumbnailPreviewModal
        isOpen={isThumbModalOpen}
        onClose={() => setIsThumbModalOpen(false)}
        project={project}
        onUpdateThumbnail={(thumb) => setProject({ ...project, thumbnail: thumb })}
      />

      <QCReportModal
        isOpen={isQCModalOpen}
        onClose={() => setIsQCModalOpen(false)}
        project={project}
      />

      <ExportVideoModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        project={project}
      />
    </div>
  );
};
