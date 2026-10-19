import React from 'react';
import { VOICES } from '../data/voices';
import { VoiceName } from '../types/tts';
import { Mic, Check, Volume2, Sparkles } from 'lucide-react';

interface VoiceSelectorProps {
  selectedVoice: VoiceName;
  onSelectVoice: (voice: VoiceName) => void;
  onAuditionVoice?: (voice: VoiceName) => void;
  isAuditioning?: boolean;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onSelectVoice,
  onAuditionVoice,
  isAuditioning = false,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Mic className="w-4 h-4 text-indigo-400" />
          Select Gemini Voice Persona
        </label>
        <span className="text-xs text-slate-400 font-mono">5 Prebuilt Studio Voices</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {VOICES.map((v) => {
          const isSelected = selectedVoice === v.id;
          return (
            <div
              key={v.id}
              onClick={() => onSelectVoice(v.id)}
              className={`relative cursor-pointer rounded-xl p-3.5 border transition-all text-left flex flex-col justify-between group ${
                isSelected
                  ? 'bg-slate-800/90 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg bg-gradient-to-br ${v.color} flex items-center justify-center text-white text-xs font-bold shadow`}
                    >
                      {v.name[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {v.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {v.gender}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 font-medium line-clamp-2 mb-2 leading-relaxed">
                  {v.tone}
                </p>

                <div className="flex flex-wrap gap-1 mb-2">
                  {v.bestFor.slice(0, 2).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-750 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {onAuditionVoice && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAuditionVoice(v.id);
                  }}
                  disabled={isAuditioning}
                  className="mt-2 w-full py-1 px-2 rounded-lg text-[11px] font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Volume2 className="w-3 h-3 text-indigo-400" />
                  Audition Line
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
