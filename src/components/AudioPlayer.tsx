import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Download, Sparkles, Music2, Share2, Check } from 'lucide-react';

interface AudioPlayerProps {
  audioBase64: string | null;
  mimeType?: string;
  title: string;
  subtitle?: string;
  voiceName?: string;
  modelUsed?: string;
  onDownload?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioBase64,
  mimeType = 'audio/wav',
  title,
  subtitle,
  voiceName,
  modelUsed,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const audioSrc = audioBase64 ? `data:${mimeType};base64,${audioBase64}` : null;

  // Sync audio source
  useEffect(() => {
    if (!audioRef.current) return;
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [audioSrc]);

  // Handle play/pause
  const togglePlay = () => {
    if (!audioRef.current || !audioSrc) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error('Audio play error:', err);
      });
    }
  };

  const handleRestart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    if (!isPlaying) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const handleRateChange = () => {
    const rates = [0.75, 1.0, 1.25, 1.5, 2.0];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.muted = nextMuted;
  };

  const handleDownload = () => {
    if (!audioSrc) return;
    const a = document.createElement('a');
    a.href = audioSrc;
    const safeTitle = (title || 'gemini_voiceover').toLowerCase().replace(/[^a-z0-9]/g, '_');
    a.download = `${safeTitle}_${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyAudioData = () => {
    if (!audioSrc) return;
    navigator.clipboard.writeText(audioSrc);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Format time mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Waveform visualization animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const barCount = 42;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + 2);
        const progress = duration > 0 ? currentTime / duration : 0;
        const isPassed = (i / barCount) <= progress;

        let barHeight = 8;
        if (isPlaying) {
          // Dynamic wave based on sine and index
          const freq = Math.sin(phase + i * 0.3) * 0.5 + 0.5;
          const freq2 = Math.cos(phase * 0.8 + i * 0.15) * 0.5 + 0.5;
          barHeight = 6 + (freq * freq2) * (height - 12);
        } else if (audioSrc) {
          // Static artistic waveform
          const staticVal = Math.sin(i * 0.4) * 0.4 + Math.cos(i * 0.2) * 0.3 + 0.5;
          barHeight = 6 + staticVal * (height * 0.6);
        }

        const y = (height - barHeight) / 2;

        if (isPassed && isPlaying) {
          const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
          grad.addColorStop(0, '#60a5fa');
          grad.addColorStop(1, '#818cf8');
          ctx.fillStyle = grad;
        } else if (isPassed) {
          ctx.fillStyle = '#6366f1';
        } else {
          ctx.fillStyle = '#334155';
        }

        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();
      }

      if (isPlaying) {
        phase += 0.15 * playbackRate;
      }
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, currentTime, duration, audioSrc, playbackRate]);

  if (!audioSrc) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center backdrop-blur-sm">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
          <Music2 className="w-8 h-8" />
        </div>
        <h4 className="text-lg font-semibold text-slate-200">No Audio Generated Yet</h4>
        <p className="text-sm text-slate-400 max-w-sm mt-1">
          Select a voice, write or generate your voiceover script, and click "Generate Voiceover" to create studio-quality speech.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Hidden native audio element */}
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
            audioRef.current.playbackRate = playbackRate;
            audioRef.current.volume = volume;
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
      />

      {/* Glow highlight */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-3 h-3" /> Ready · 24kHz Studio WAV
            </span>
            {modelUsed && (
              <span className="text-xs text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded font-mono">
                {modelUsed}
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-white mt-1.5">{title || 'Generated Voiceover'}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAudioData}
            title="Copy Base64 Data URI"
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            {copiedLink ? 'Copied Data URI' : 'Data URI'}
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all transform active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            Download .WAV
          </button>
        </div>
      </div>

      {/* Waveform Canvas */}
      <div className="w-full bg-slate-950/80 rounded-xl p-3 border border-slate-800 mb-4">
        <canvas
          ref={canvasRef}
          width={700}
          height={64}
          className="w-full h-16 rounded cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            if (audioRef.current && duration > 0) {
              const target = clickPos * duration;
              audioRef.current.currentTime = target;
              setCurrentTime(target);
            }
          }}
        />
      </div>

      {/* Scrub Bar & Times */}
      <div className="space-y-1 mb-4">
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.05}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
        />
        <div className="flex justify-between text-xs font-mono text-slate-400 px-0.5">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Player Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-transform active:scale-95"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          {/* Restart */}
          <button
            onClick={handleRestart}
            title="Restart"
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed Toggle */}
          <button
            onClick={handleRateChange}
            className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Toggle playback speed"
          >
            {playbackRate}x
          </button>
        </div>

        {/* Volume & Details */}
        <div className="flex items-center gap-3">
          {voiceName && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/50 px-2.5 py-1 rounded-md border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Voice: <strong className="text-slate-200 font-semibold">{voiceName}</strong>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
