import React from 'react';
import { VOICES } from '../data/voices';
import { VoiceName } from '../types/tts';
import { Volume2, Check, Sparkles, Mic2 } from 'lucide-react';

interface VoiceCatalogProps {
  selectedVoice: VoiceName;
  onSelectVoice: (voice: VoiceName) => void;
  onAuditionVoice: (voice: VoiceName) => void;
  isAuditioning: boolean;
}

export const VoiceCatalog: React.FC<VoiceCatalogProps> = ({
  selectedVoice,
  onSelectVoice,
  onAuditionVoice,
  isAuditioning,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
          <Mic2 className="w-4 h-4" />
          Acoustic Voice Profiles
        </div>
        <h2 className="text-xl font-bold text-white">Google AI Studio Prebuilt Voices</h2>
        <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
          Gemini features 5 neural acoustic profiles trained for high dynamic range and expressive prosody.
          Audition their default timbre or customize their delivery using natural language directing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {VOICES.map((v) => {
          const isSelected = selectedVoice === v.id;
          return (
            <div
              key={v.id}
              className={`bg-slate-900/80 rounded-2xl border p-5 flex flex-col justify-between transition-all relative overflow-hidden ${
                isSelected
                  ? 'border-indigo-500 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${v.color} flex items-center justify-center text-white text-base font-bold shadow-lg`}
                    >
                      {v.name[0]}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        {v.name}
                        {isSelected && (
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </h3>
                      <span className="text-xs text-slate-400">{v.gender} Voice Profile</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-indigo-300 font-medium mb-3">
                  {v.tone}
                </p>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {v.description}
                </p>

                {/* Best For Tags */}
                <div className="mb-4">
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block mb-1.5">
                    Recommended For:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {v.bestFor.map((bf, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[11px] bg-slate-800 text-slate-300 border border-slate-700 font-medium"
                      >
                        {bf}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sample Line */}
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/80 mb-4">
                  <span className="text-[10px] text-slate-500 font-mono block mb-1">
                    Audition Line:
                  </span>
                  <p className="text-xs text-slate-300 italic font-serif leading-relaxed">
                    "{v.sampleText}"
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => onAuditionVoice(v.id)}
                  disabled={isAuditioning}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                  Audition Sample
                </button>

                <button
                  type="button"
                  onClick={() => onSelectVoice(v.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/30'
                  }`}
                >
                  {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                  {isSelected ? 'Selected' : 'Use Voice'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
