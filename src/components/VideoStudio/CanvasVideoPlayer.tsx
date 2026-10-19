import React, { useRef, useEffect, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Radio,
  Sliders,
  Sparkles,
  Music,
} from 'lucide-react';
import { VideoProject } from '../../types/video';
import { renderVideoFrame } from '../../utils/canvasSceneRenderer';

interface CanvasVideoPlayerProps {
  project: VideoProject;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const CanvasVideoPlayer: React.FC<CanvasVideoPlayerProps> = ({
  project,
  currentTime,
  onTimeUpdate,
  isPlaying,
  onTogglePlay,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthAudioCtxRef = useRef<AudioContext | null>(null);

  const [bgMusic, setBgMusic] = useState(project.bgMusicEnabled);
  const [bgVolume, setBgVolume] = useState(project.bgMusicVolume);
  const [isMuted, setIsMuted] = useState(false);

  // Setup / sync voiceover audio
  useEffect(() => {
    if (!audioRef.current) return;
    if (project.voiceoverAudioBase64) {
      audioRef.current.src = `data:audio/wav;base64,${project.voiceoverAudioBase64}`;
    }
  }, [project.voiceoverAudioBase64]);

  // Handle play/pause synchronization
  useEffect(() => {
    if (isPlaying) {
      if (audioRef.current && project.voiceoverAudioBase64) {
        audioRef.current.currentTime = currentTime;
        audioRef.current.play().catch(() => {});
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, project.voiceoverAudioBase64]);

  // Main animation frame loop for Canvas rendering
  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp: number | null = null;

    const render = (now: number) => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          renderVideoFrame({
            ctx,
            width: canvas.width,
            height: canvas.height,
            currentTime,
            project,
          });
        }
      }

      if (isPlaying) {
        if (lastTimestamp === null) lastTimestamp = now;
        const delta = (now - lastTimestamp) / 1000;
        lastTimestamp = now;

        const nextTime = currentTime + delta;
        if (nextTime >= project.totalDuration) {
          onTimeUpdate(project.totalDuration);
          onTogglePlay(); // Pause at end
        } else {
          onTimeUpdate(nextTime);
        }
      } else {
        lastTimestamp = null;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, currentTime, project]);

  // Seek handler
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    onTimeUpdate(target);
    if (audioRef.current && project.voiceoverAudioBase64) {
      audioRef.current.currentTime = target;
    }
  };

  const handleRestart = () => {
    onTimeUpdate(0);
    if (audioRef.current && project.voiceoverAudioBase64) {
      audioRef.current.currentTime = 0;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const activeScene =
    project.scenes.find(
      (s) => currentTime >= s.startTime && currentTime <= s.endTime
    ) || project.scenes[0];

  return (
    <div
      ref={containerRef}
      className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col relative"
    >
      {/* Hidden audio element for voiceover synchronization */}
      <audio
        ref={audioRef}
        onEnded={() => {
          if (isPlaying) onTogglePlay();
        }}
      />

      {/* 16:9 Canvas Viewport */}
      <div className="relative aspect-video w-full bg-[#070B14] flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          className="w-full h-full object-contain cursor-pointer"
          onClick={onTogglePlay}
        />

        {/* Ambient watermark & Resolution badge */}
        <div className="absolute top-3 right-3 flex items-center gap-2 pointer-events-none">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900/80 text-cyan-400 border border-cyan-500/30 backdrop-blur-sm">
            1080p · 30 FPS
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900/80 text-slate-300 border border-slate-800 backdrop-blur-sm">
            {project.channelName}
          </span>
        </div>

        {/* Big play button overlay when paused */}
        {!isPlaying && (
          <div
            onClick={onTogglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-xl shadow-cyan-500/30 group-hover:scale-105 transition-all">
              <Play className="w-7 h-7 fill-current ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Scrub Bar & Player Controls Bar */}
      <div className="bg-slate-900/95 border-t border-slate-800/90 p-4 space-y-3">
        {/* Scrubber with Scene Markers */}
        <div className="relative">
          <input
            type="range"
            min={0}
            max={project.totalDuration}
            step={0.05}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
          />

          {/* Scene cut tick marks */}
          <div className="absolute top-0 left-0 w-full h-2 pointer-events-none flex">
            {project.scenes.map((sc, i) => {
              const leftPercent = (sc.startTime / project.totalDuration) * 100;
              return (
                <div
                  key={sc.id}
                  style={{ left: `${leftPercent}%` }}
                  className="absolute top-0 w-0.5 h-2 bg-slate-600/70"
                  title={`Beat ${i + 1}: ${sc.title}`}
                />
              );
            })}
          </div>
        </div>

        {/* Buttons Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left: Playback Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={onTogglePlay}
              className="w-9 h-9 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-md shadow-cyan-500/20 transition-transform active:scale-95"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={handleRestart}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Restart from beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="font-mono text-xs text-slate-300">
              <strong className="text-cyan-400">{formatTime(currentTime)}</strong> /{' '}
              <span>{formatTime(project.totalDuration)}</span>
            </div>

            {/* Current Scene Badge */}
            {activeScene && (
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-750 text-slate-300 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-semibold text-white">{activeScene.title}</span>
                <span className="text-slate-500 font-mono">({activeScene.visualType})</span>
              </div>
            )}
          </div>

          {/* Right: Sound, Ambient Bed, Fullscreen */}
          <div className="flex items-center gap-4">
            {/* Ambient Tech Bed Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBgMusic(!bgMusic)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-medium transition-colors ${
                  bgMusic
                    ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                    : 'bg-slate-800 text-slate-500 border-slate-700'
                }`}
                title="Toggle subtle background synthesizer drone"
              >
                <Music className="w-3.5 h-3.5" />
                Tech Ambient Bed {bgMusic ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Voiceover status */}
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-slate-400">
              <Radio className={`w-3 h-3 ${project.voiceoverAudioBase64 ? 'text-emerald-400' : 'text-slate-500'}`} />
              {project.voiceoverAudioBase64 ? 'VO Track Synced' : 'Silent Preview'}
            </div>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
