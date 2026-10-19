import React from 'react';
import { DialogueLine, VoiceName } from '../types/tts';
import { VOICES } from '../data/voices';
import { Plus, Trash2, ArrowUpDown, Mic2, Sparkles, MessageSquare } from 'lucide-react';

interface DialogueEditorProps {
  dialogue: DialogueLine[];
  onChangeDialogue: (lines: DialogueLine[]) => void;
  speaker1: { name: string; voice: VoiceName; style: string };
  speaker2: { name: string; voice: VoiceName; style: string };
  onChangeSpeaker1: (spk: { name: string; voice: VoiceName; style: string }) => void;
  onChangeSpeaker2: (spk: { name: string; voice: VoiceName; style: string }) => void;
  onInsertTag: (tag: string, lineId: string) => void;
}

export const DialogueEditor: React.FC<DialogueEditorProps> = ({
  dialogue,
  onChangeDialogue,
  speaker1,
  speaker2,
  onChangeSpeaker1,
  onChangeSpeaker2,
  onInsertTag,
}) => {
  const handleAddLine = (defaultSpeaker: string = speaker1.name) => {
    const isSpk1 = defaultSpeaker === speaker1.name;
    const newLine: DialogueLine = {
      id: Math.random().toString(36).substring(2, 9),
      speaker: defaultSpeaker,
      voice: isSpk1 ? speaker1.voice : speaker2.voice,
      text: '',
      style: '',
    };
    onChangeDialogue([...dialogue, newLine]);
  };

  const handleUpdateLine = (id: string, updates: Partial<DialogueLine>) => {
    onChangeDialogue(
      dialogue.map((line) => (line.id === id ? { ...line, ...updates } : line))
    );
  };

  const handleRemoveLine = (id: string) => {
    if (dialogue.length <= 1) return;
    onChangeDialogue(dialogue.filter((l) => l.id !== id));
  };

  const toggleSpeaker = (id: string) => {
    const line = dialogue.find((l) => l.id === id);
    if (!line) return;
    const isCurrently1 = line.speaker === speaker1.name;
    const nextSpeaker = isCurrently1 ? speaker2.name : speaker1.name;
    const nextVoice = isCurrently1 ? speaker2.voice : speaker1.voice;
    handleUpdateLine(id, { speaker: nextSpeaker, voice: nextVoice });
  };

  return (
    <div className="space-y-5">
      {/* Speaker Configuration Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        {/* Speaker 1 */}
        <div className="space-y-3 p-3 rounded-lg bg-slate-850/60 border border-indigo-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Speaker A
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Lead Voice</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 font-medium">Name</label>
              <input
                type="text"
                value={speaker1.name}
                onChange={(e) => onChangeSpeaker1({ ...speaker1, name: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                placeholder="e.g. Alex"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 font-medium">Voice Model</label>
              <select
                value={speaker1.voice}
                onChange={(e) => onChangeSpeaker1({ ...speaker1, voice: e.target.value as VoiceName })}
                className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {VOICES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.tone.split(',')[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] text-slate-400 font-medium">Persona / Delivery Style</label>
            <input
              type="text"
              value={speaker1.style}
              onChange={(e) => onChangeSpeaker1({ ...speaker1, style: e.target.value })}
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
              placeholder="e.g. Enthusiastic podcast host, energetic and witty"
            />
          </div>
        </div>

        {/* Speaker 2 */}
        <div className="space-y-3 p-3 rounded-lg bg-slate-850/60 border border-teal-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              Speaker B
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Co-Speaker</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 font-medium">Name</label>
              <input
                type="text"
                value={speaker2.name}
                onChange={(e) => onChangeSpeaker2({ ...speaker2, name: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                placeholder="e.g. Sam"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 font-medium">Voice Model</label>
              <select
                value={speaker2.voice}
                onChange={(e) => onChangeSpeaker2({ ...speaker2, voice: e.target.value as VoiceName })}
                className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
              >
                {VOICES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.tone.split(',')[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] text-slate-400 font-medium">Persona / Delivery Style</label>
            <input
              type="text"
              value={speaker2.style}
              onChange={(e) => onChangeSpeaker2({ ...speaker2, style: e.target.value })}
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500 placeholder:text-slate-600"
              placeholder="e.g. Thoughtful co-host, articulate and supportive"
            />
          </div>
        </div>
      </div>

      {/* Script Lines */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            Dialogue Script Breakdown ({dialogue.length} turns)
          </label>
          <span className="text-xs text-slate-400">
            Click speaker badge to flip turns
          </span>
        </div>

        {dialogue.map((line, idx) => {
          const isSpk1 = line.speaker === speaker1.name;
          const currentVoice = isSpk1 ? speaker1.voice : speaker2.voice;

          return (
            <div
              key={line.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isSpk1
                  ? 'bg-slate-900/90 border-indigo-500/30'
                  : 'bg-slate-900/90 border-teal-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSpeaker(line.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      isSpk1
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30'
                        : 'bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30'
                    }`}
                    title="Click to toggle speaker"
                  >
                    <ArrowUpDown className="w-3 h-3" />
                    {line.speaker}
                  </button>

                  <span className="text-xs text-slate-400 font-mono">
                    Voice: <strong className="text-slate-300">{currentVoice}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Expressive tag shortcuts */}
                  <div className="hidden sm:flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800 text-[10px] text-slate-400">
                    <span className="text-slate-500">Insert:</span>
                    {['<breath>', '<laugh>', '|mhm|', '|yeah|'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => onInsertTag(t, line.id)}
                        className="hover:text-indigo-300 hover:bg-slate-800 px-1 rounded transition-colors font-mono"
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveLine(line.id)}
                    disabled={dialogue.length <= 1}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors disabled:opacity-30"
                    title="Delete line"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Text Input */}
              <textarea
                value={line.text}
                onChange={(e) => handleUpdateLine(line.id, { text: e.target.value })}
                rows={2}
                placeholder={`What does ${line.speaker} say? Insert vocal bursts like <laugh> or backchannels like |yeah|...`}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg p-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none resize-none font-sans leading-relaxed"
              />

              {/* Delivery Style hint */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-mono">Tone:</span>
                <input
                  type="text"
                  value={line.style || ''}
                  onChange={(e) => handleUpdateLine(line.id, { style: e.target.value })}
                  placeholder="Optional line direction (e.g. Laughing warmly, leaning in)"
                  className="flex-1 bg-slate-950/60 border border-slate-800/80 rounded px-2 py-1 text-[11px] text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-slate-700"
                />
              </div>
            </div>
          );
        })}

        {/* Add turn buttons */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleAddLine(speaker1.name)}
            className="flex-1 py-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add {speaker1.name}'s Line
          </button>
          <button
            type="button"
            onClick={() => handleAddLine(speaker2.name)}
            className="flex-1 py-2 rounded-xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add {speaker2.name}'s Line
          </button>
        </div>
      </div>
    </div>
  );
};
