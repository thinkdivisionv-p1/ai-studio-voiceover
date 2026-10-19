import React from 'react';
import { Mic, Radio, BookOpen, Users, Code2, Sparkles, Layers, Github } from 'lucide-react';
import { ScriptPreset } from '../types/tts';
import { PRESETS } from '../data/presets';

interface HeaderProps {
  activeTab: 'studio' | 'guide' | 'voices';
  onSelectTab: (tab: 'studio' | 'guide' | 'voices') => void;
  onOpenCodeExport: () => void;
  onOpenGitHubModal: () => void;
  onSelectPreset: (preset: ScriptPreset) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenCodeExport,
  onOpenGitHubModal,
  onSelectPreset,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 py-3.5">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
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
              </div>
              <p className="text-xs text-slate-400">
                Interactive Voiceover Production & Directing Guide
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
              Studio
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

          {/* Preset Select, GitHub, Code Export */}
          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
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

            <button
              onClick={onOpenGitHubModal}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5 transition-colors"
              title="Push to GitHub & Self-Host"
            >
              <Github className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">GitHub Guide</span>
            </button>

            <button
              onClick={onOpenCodeExport}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 flex items-center gap-1.5 transition-colors"
              title="View & Export Gemini API Code"
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">API Code</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
