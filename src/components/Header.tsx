import React from 'react';
import { Mic, Radio, BookOpen, Users, Code2, Cloud, Github, Lock, ShieldCheck, Film } from 'lucide-react';
import { ScriptPreset } from '../types/tts';
import { PRESETS } from '../data/presets';

interface HeaderProps {
  activeTab: 'studio' | 'video' | 'guide' | 'voices';
  onSelectTab: (tab: 'studio' | 'video' | 'guide' | 'voices') => void;
  onOpenCodeExport: () => void;
  onOpenGitHubModal: () => void;
  onOpenCloudflareModal: () => void;
  onOpenSecurityModal: () => void;
  isPasswordSet: boolean;
  onSelectPreset: (preset: ScriptPreset) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenCodeExport,
  onOpenGitHubModal,
  onOpenCloudflareModal,
  onOpenSecurityModal,
  isPasswordSet,
  onSelectPreset,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 py-3.5">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <Mic className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-white tracking-tight">
                  Google AI Studio Voiceover
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Gemini 3.8 Audio
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                  Market Gap Daily
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Studio-grade speech, multi-segment narration & YouTube video production
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              id="studio-tab-button"
              onClick={() => onSelectTab('studio')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'studio'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              Voiceover
            </button>

            <button
              id="video-tab-button"
              onClick={() => onSelectTab('video')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeTab === 'video'
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25'
                  : 'text-cyan-400 hover:text-cyan-300'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              YouTube Video
            </button>

            <button
              onClick={() => onSelectTab('guide')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'guide'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              How-To Guide
            </button>
            <button
              onClick={() => onSelectTab('voices')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'voices'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Voice Catalog
            </button>
          </div>

          {/* Preset Select, Cloudflare, Security, GitHub, Code Export */}
          <div className="flex items-center gap-2">
            <div className="relative hidden xl:block">
              <select
                onChange={(e) => {
                  const p = PRESETS.find((preset) => preset.id === e.target.value);
                  if (p) onSelectPreset(p);
                }}
                defaultValue=""
                className="bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-medium border border-slate-700/80 rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="" disabled>
                  Load Voiceover Preset...
                </option>
                {PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.genre})
                  </option>
                ))}
              </select>
            </div>

            {/* Cloudflare Deploy Button */}
            <button
              onClick={onOpenCloudflareModal}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border border-orange-500/40 flex items-center gap-1.5 transition-colors shadow-sm"
              title="Cloudflare Pages Zero-Software Setup"
            >
              <Cloud className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden sm:inline">Cloudflare Deploy</span>
            </button>

            {/* Security Modal Button */}
            <button
              onClick={onOpenSecurityModal}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-750 flex items-center gap-1.5 transition-colors relative"
              title="Studio Passcode & API Protection"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              {isPasswordSet && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1 right-1" />
              )}
              <span className="hidden sm:inline">Security</span>
            </button>

            {/* GitHub Guide Button */}
            <button
              onClick={onOpenGitHubModal}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-750 flex items-center gap-1.5 transition-colors"
              title="GitHub Repository & Self-Host"
            >
              <Github className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">GitHub</span>
            </button>

            {/* API Code Button */}
            <button
              onClick={onOpenCodeExport}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-750 flex items-center gap-1.5 transition-colors"
              title="View & Export Gemini API Code"
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Code</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
