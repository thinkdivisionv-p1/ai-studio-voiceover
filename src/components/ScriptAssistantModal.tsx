import React, { useState } from 'react';
import { Sparkles, X, Wand2, Clock, AlignLeft, Check } from 'lucide-react';

interface ScriptAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyScript: (script: string, genre: string, targetDuration: number) => void;
  mode: 'single' | 'multi';
  speaker1Name?: string;
  speaker2Name?: string;
}

export const ScriptAssistantModal: React.FC<ScriptAssistantModalProps> = ({
  isOpen,
  onClose,
  onApplyScript,
  mode,
  speaker1Name = 'Alex',
  speaker2Name = 'Sam',
}) => {
  const [topic, setTopic] = useState('');
  const [genre, setGenre] = useState('Tech Product Launch & Keynote');
  const [duration, setDuration] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const genres = [
    'Tech Product Launch & Keynote',
    'Cinematic Nature Documentary',
    'High-Energy YouTube Hook & Intro',
    'Guided Sleep & Mindfulness Meditation',
    'True Crime Dramatic Mystery',
    'Luxury Brand Commercial',
    'Lively Tech Podcast Banter',
    'Interactive Game Character Dialogue',
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/script/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim() || 'Revolutionary AI Voice Synthesis',
          genre,
          targetSeconds: duration,
          mode,
          speaker1Name,
          speaker2Name,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate script');
      }

      setGeneratedScript(data.script);
    } catch (err: any) {
      setError(err.message || 'Error generating script');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (!generatedScript) return;
    onApplyScript(generatedScript, genre, duration);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Glow */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Gemini Voiceover Scriptwriter</h3>
              <p className="text-xs text-slate-400">
                Generate broadcast-ready scripts formatted with vocal bursts & cadence
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

        <div className="space-y-4 py-4">
          {/* Topic input */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Topic or Product Concept
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Next-generation robotic companion, deep space exploration, specialty coffee..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none"
            />
          </div>

          {/* Genre select */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Tone & Style Genre
            </label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
            >
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Duration slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Target Speaking Duration
              </label>
              <span className="text-xs font-mono text-indigo-400 font-bold">
                {duration} seconds (~{Math.round((duration / 60) * 140)} words)
              </span>
            </div>
            <input
              type="range"
              min={15}
              max={90}
              step={15}
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>15s (Short hook)</span>
              <span>30s (Promo)</span>
              <span>60s (Explainer)</span>
              <span>90s (Longform)</span>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                Crafting script with Gemini...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Generate Voiceover Script
              </>
            )}
          </button>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Generated Result Preview */}
          {generatedScript && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <AlignLeft className="w-3.5 h-3.5 text-emerald-400" />
                  Generated Script Preview:
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {generatedScript.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                value={generatedScript}
                onChange={(e) => setGeneratedScript(e.target.value)}
                rows={5}
                className="w-full bg-slate-950 border border-emerald-500/30 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!generatedScript}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all disabled:opacity-40"
          >
            <Check className="w-3.5 h-3.5" />
            Apply to Studio
          </button>
        </div>
      </div>
    </div>
  );
};
