import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Sparkles,
  Sliders,
  Send,
  History,
  RotateCcw,
  Wand2,
  Layers,
  FileText,
  Volume2,
  AlertCircle,
  Clock,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { VoiceName, TTSModel, DialogueLine, GenerationHistoryItem, ScriptPreset } from './types/tts';
import { VOICES } from './data/voices';
import { PRESETS } from './data/presets';
import { Header } from './components/Header';
import { AudioPlayer } from './components/AudioPlayer';
import { VoiceSelector } from './components/VoiceSelector';
import { DialogueEditor } from './components/DialogueEditor';
import { ScriptAssistantModal } from './components/ScriptAssistantModal';
import { StepByStepGuide } from './components/StepByStepGuide';
import { CodeExportModal } from './components/CodeExportModal';
import { VoiceCatalog } from './components/VoiceCatalog';
import { GitHubExportModal } from './components/GitHubExportModal';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'studio' | 'guide' | 'voices'>('studio');

  // Studio Mode & Configuration
  const [mode, setMode] = useState<'single' | 'multi'>('single');
  const [model, setModel] = useState<TTSModel>('gemini-3.8-flash-lite-tts');
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>('Kore');
  const [speechStyle, setSpeechStyle] = useState('Clear, articulate studio narrator with warm cadence');
  const [scriptText, setScriptText] = useState(
    'Welcome to Google AI Studio. <breath> Creating professional voiceovers is now as simple as directing a voice actor. With Gemini 3.8 speech synthesis, you can direct tone, pacing, and human nuances with total precision.'
  );

  // Dual Speaker State
  const [speaker1, setSpeaker1] = useState<{ name: string; voice: VoiceName; style: string }>({
    name: 'Alex',
    voice: 'Puck',
    style: 'Upbeat and lively podcast host',
  });
  const [speaker2, setSpeaker2] = useState<{ name: string; voice: VoiceName; style: string }>({
    name: 'Sam',
    voice: 'Kore',
    style: 'Articulate and thoughtful co-host',
  });
  const [dialogue, setDialogue] = useState<DialogueLine[]>([
    {
      id: '1',
      speaker: 'Alex',
      voice: 'Puck',
      text: 'Welcome back to the studio! <breath> Today we are testing dual-speaker Gemini voiceovers.',
      style: 'Enthusiastic and clear',
    },
    {
      id: '2',
      speaker: 'Sam',
      voice: 'Kore',
      text: 'That is right, |yeah| the models can generate realistic conversations with natural backchanneling.',
      style: 'Supportive and articulate',
    },
  ]);

  // Player & Generation States
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAuditioning, setIsAuditioning] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<{
    base64: string;
    mimeType: string;
    title: string;
    subtitle: string;
    voiceName: string;
    modelUsed: string;
  } | null>(null);

  // History
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);

  // Modals
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);

  // Textarea Ref for cursor insertion
  const scriptTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gemini_voiceover_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to parse history from localStorage', e);
    }
  }, []);

  const saveToHistory = (item: GenerationHistoryItem) => {
    setHistory((prev) => {
      const updated = [item, ...prev].slice(0, 15);
      try {
        localStorage.setItem('gemini_voiceover_history', JSON.stringify(updated));
      } catch (e) {
        console.warn('History storage limit reached', e);
      }
      return updated;
    });
  };

  // Insert tag into single speaker textarea at cursor
  const handleInsertTagSingle = (tag: string) => {
    const textarea = scriptTextareaRef.current;
    if (!textarea) {
      setScriptText((prev) => `${prev} ${tag}`);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = scriptText;
    const updated = current.substring(0, start) + `${tag} ` + current.substring(end);
    setScriptText(updated);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length + 1, start + tag.length + 1);
    }, 50);
  };

  // Insert tag into dialogue turn
  const handleInsertTagDialogue = (tag: string, lineId: string) => {
    setDialogue((prev) =>
      prev.map((l) => (l.id === lineId ? { ...l, text: `${l.text} ${tag}` } : l))
    );
  };

  // Preset selector
  const handleSelectPreset = (preset: ScriptPreset) => {
    setMode(preset.mode);
    setModel(preset.model);
    setSelectedVoice(preset.voice);
    setSpeechStyle(preset.style);
    if (preset.mode === 'single') {
      setScriptText(preset.script);
    } else if (preset.dialogue) {
      setDialogue(preset.dialogue);
    }
    setActiveTab('studio');
  };

  // Audition single voice line
  const handleAuditionVoice = async (voice: VoiceName) => {
    setIsAuditioning(true);
    setGenerationError(null);
    const targetVoice = VOICES.find((v) => v.id === voice);
    const line = targetVoice?.sampleText || 'Hello, I am testing the Gemini neural voice profile.';

    try {
      const res = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'single',
          model: 'gemini-3.8-flash-lite-tts',
          text: line,
          voice,
          style: targetVoice?.tone || '',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate voice audition.');

      setCurrentAudio({
        base64: data.audioBase64,
        mimeType: data.mimeType || 'audio/wav',
        title: `${voice} Voice Sample`,
        subtitle: `Audition line: "${line}"`,
        voiceName: voice,
        modelUsed: 'gemini-3.8-flash-lite-tts',
      });
    } catch (err: any) {
      setGenerationError(`Audition failed: ${err.message}`);
    } finally {
      setIsAuditioning(false);
    }
  };

  // Main Generation Handler
  const handleGenerateVoiceover = async () => {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      const payload =
        mode === 'single'
          ? {
              mode: 'single',
              model,
              text: scriptText,
              voice: selectedVoice,
              style: speechStyle,
            }
          : {
              mode: 'multi',
              model: 'gemini-3.8-flash-tts',
              dialogue,
              speaker1,
              speaker2,
            };

      const res = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to synthesize voiceover with Gemini.');
      }

      const title =
        mode === 'single'
          ? `${selectedVoice} Voiceover Take`
          : `${speaker1.name} & ${speaker2.name} Dialogue`;

      const subtitle =
        mode === 'single'
          ? `${scriptText.slice(0, 70)}...`
          : `${dialogue.length} screenplay turns`;

      const audioResult = {
        base64: data.audioBase64,
        mimeType: data.mimeType || 'audio/wav',
        title,
        subtitle,
        voiceName: mode === 'single' ? selectedVoice : `${speaker1.voice} & ${speaker2.voice}`,
        modelUsed: data.modelUsed || model,
      };

      setCurrentAudio(audioResult);

      // Save to local history
      saveToHistory({
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        mode,
        model: (data.modelUsed || model) as TTSModel,
        title,
        script: mode === 'single' ? scriptText : dialogue.map((d) => `${d.speaker}: ${d.text}`).join('\n'),
        voiceOrSpeakers: mode === 'single' ? selectedVoice : `${speaker1.name} & ${speaker2.name}`,
        style: speechStyle,
        audioBase64: data.audioBase64,
        mimeType: data.mimeType || 'audio/wav',
      });
    } catch (err: any) {
      console.error(err);
      setGenerationError(err.message || 'Error communicating with Gemini TTS service.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Word & Duration estimation
  const wordCount =
    mode === 'single'
      ? scriptText.split(/\s+/).filter(Boolean).length
      : dialogue.reduce((acc, curr) => acc + curr.text.split(/\s+/).filter(Boolean).length, 0);
  const estimatedSeconds = Math.max(1, Math.round((wordCount / 140) * 60));

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenCodeExport={() => setIsCodeModalOpen(true)}
        onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
        onSelectPreset={handleSelectPreset}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* TAB 1: STUDIO */}
        {activeTab === 'studio' && (
          <div className="space-y-8">
            {/* Audio Player Showcase at top */}
            <AudioPlayer
              audioBase64={currentAudio?.base64 || null}
              mimeType={currentAudio?.mimeType}
              title={currentAudio?.title || 'Voiceover Preview'}
              subtitle={currentAudio?.subtitle}
              voiceName={currentAudio?.voiceName}
              modelUsed={currentAudio?.modelUsed}
            />

            {/* Error Notification */}
            {generationError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <strong className="font-semibold block">Generation Error:</strong>
                  {generationError}
                </div>
              </div>
            )}

            {/* Studio Control Panel */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 lg:p-8 space-y-6 backdrop-blur-sm shadow-xl">
              {/* Studio Mode & Model Selector Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
                {/* Single vs Dual Mode Switch */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
                    Production Mode
                  </label>
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setMode('single')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        mode === 'single'
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Single Voiceover
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('multi');
                        setModel('gemini-3.8-flash-tts');
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        mode === 'multi'
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Dual-Speaker Screenplay
                    </button>
                  </div>
                </div>

                {/* Model Selector */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
                    Gemini TTS Model
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={model}
                      disabled={mode === 'multi'}
                      onChange={(e) => setModel(e.target.value as TTSModel)}
                      className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono disabled:opacity-75"
                    >
                      <option value="gemini-3.8-flash-lite-tts">
                        gemini-3.8-flash-lite-tts (Fast & Crisp Narration)
                      </option>
                      <option value="gemini-3.8-flash-tts">
                        gemini-3.8-flash-tts (Flagship Expressive & Bursts)
                      </option>
                    </select>

                    <span className="text-[11px] text-slate-400 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-750">
                      24kHz 16-Bit WAV
                    </span>
                  </div>
                </div>
              </div>

              {/* Mode 1: Single Speaker Configuration */}
              {mode === 'single' ? (
                <>
                  {/* Voice Selector */}
                  <VoiceSelector
                    selectedVoice={selectedVoice}
                    onSelectVoice={setSelectedVoice}
                    onAuditionVoice={handleAuditionVoice}
                    isAuditioning={isAuditioning}
                  />

                  {/* Speech Metadata / Acting Direction */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                        <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                        Tone & Acting Direction (speechMetadata)
                      </label>
                      <span className="text-[11px] text-slate-400">
                        Guides emotional inflection, pacing, and mood
                      </span>
                    </div>

                    <input
                      type="text"
                      value={speechStyle}
                      onChange={(e) => setSpeechStyle(e.target.value)}
                      placeholder="e.g. Crisp news anchor, warm documentary narrator, whispering bedtime guide..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none"
                    />

                    {/* Quick Style Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-500 font-mono mr-1">Directing Presets:</span>
                      {[
                        'Warm documentary narrator with gentle pauses',
                        'Punchy YouTube creator hook, energetic and fast',
                        'Whispering meditation guide, slow and soothing',
                        'Inspiring tech keynote speaker with authority',
                        'Dramatic movie trailer narrator, deep and intense',
                      ].map((presetStyle) => (
                        <button
                          key={presetStyle}
                          type="button"
                          onClick={() => setSpeechStyle(presetStyle)}
                          className="px-2 py-0.5 rounded-md text-[10px] bg-slate-800/70 hover:bg-slate-700 text-slate-300 border border-slate-750 transition-colors"
                        >
                          {presetStyle.split(' ')[0]} {presetStyle.split(' ')[1]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Script Editor & Vocal Bursts Toolbar */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        Voiceover Spoken Script
                      </label>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsScriptModalOpen(true)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 transition-colors"
                        >
                          <Wand2 className="w-3 h-3 text-indigo-400" />
                          AI Scriptwriter
                        </button>

                        <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {wordCount} words · ~{estimatedSeconds}s
                        </span>
                      </div>
                    </div>

                    {/* Vocal Bursts insertion toolbar */}
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-[11px] font-semibold text-indigo-400 flex items-center gap-1 mr-1">
                        <Sparkles className="w-3 h-3" />
                        Insert Expressive Tags:
                      </span>
                      {[
                        { tag: '<breath>', label: 'Breath Inhale', desc: 'Natural intake of breath' },
                        { tag: '<laugh>', label: 'Chuckle / Laugh', desc: 'Spontaneous laughter' },
                        { tag: '<gasp>', label: 'Gasp', desc: 'Surprise intake' },
                        { tag: '<sigh>', label: 'Sigh', desc: 'Relief or longing' },
                        { tag: '<cough>', label: 'Cough', desc: 'Vocal clearance' },
                        { tag: '|mhm|', label: '|mhm|', desc: 'Affirmation' },
                        { tag: '|yeah|', label: '|yeah|', desc: 'Agreement' },
                      ].map((item) => (
                        <button
                          key={item.tag}
                          type="button"
                          onClick={() => handleInsertTagSingle(item.tag)}
                          title={item.desc}
                          className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-750 font-mono text-[11px] transition-colors"
                        >
                          + {item.tag}
                        </button>
                      ))}
                    </div>

                    <textarea
                      ref={scriptTextareaRef}
                      value={scriptText}
                      onChange={(e) => setScriptText(e.target.value)}
                      rows={5}
                      placeholder="Type or paste your voiceover script here. Use commas for natural pauses, ellipses (...) for dramatic pauses, or insert vocal bursts..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-4 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none resize-y font-sans leading-relaxed shadow-inner"
                    />
                  </div>
                </>
              ) : (
                /* Mode 2: Dual Speaker Dialogue Editor */
                <DialogueEditor
                  dialogue={dialogue}
                  onChangeDialogue={setDialogue}
                  speaker1={speaker1}
                  speaker2={speaker2}
                  onChangeSpeaker1={setSpeaker1}
                  onChangeSpeaker2={setSpeaker2}
                  onInsertTag={handleInsertTagDialogue}
                />
              )}

              {/* Generate Voiceover Button */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Output: Unary 24kHz 16-Bit Mono WAV with RIFF header</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (mode === 'single') {
                        setScriptText(
                          'Google AI Studio empowers creators to craft studio-grade voiceovers in seconds with Gemini.'
                        );
                      }
                    }}
                    className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    Reset Text
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerateVoiceover}
                    disabled={isGenerating || (mode === 'single' && !scriptText.trim())}
                    className="px-6 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-xl shadow-indigo-500/25 flex items-center gap-2.5 transition-all transform active:scale-95 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin text-white" />
                        Generating Voiceover with Gemini...
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 text-white" />
                        Generate Voiceover ({estimatedSeconds}s audio)
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Takes History */}
            {history.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-indigo-400" />
                    Session Takes History ({history.length})
                  </h3>
                  <button
                    onClick={() => {
                      setHistory([]);
                      localStorage.removeItem('gemini_voiceover_history');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-400 transition-colors"
                  >
                    Clear History
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3.5 space-y-2 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-indigo-400">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(item.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 italic font-serif">
                        "{item.script}"
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-mono">
                        <span>Voice: {item.voiceOrSpeakers}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentAudio({
                              base64: item.audioBase64,
                              mimeType: item.mimeType,
                              title: item.title,
                              subtitle: item.script.slice(0, 80),
                              voiceName: item.voiceOrSpeakers,
                              modelUsed: item.model,
                            });
                          }}
                          className="text-indigo-400 hover:text-indigo-300 font-semibold group-hover:underline flex items-center gap-1"
                        >
                          <Volume2 className="w-3 h-3" />
                          Load Take
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: STEP-BY-STEP HOW-TO GUIDE */}
        {activeTab === 'guide' && <StepByStepGuide />}

        {/* TAB 3: VOICE PERSONA CATALOG */}
        {activeTab === 'voices' && (
          <VoiceCatalog
            selectedVoice={selectedVoice}
            onSelectVoice={(v) => {
              setSelectedVoice(v);
              setActiveTab('studio');
            }}
            onAuditionVoice={handleAuditionVoice}
            isAuditioning={isAuditioning}
          />
        )}
      </main>

      {/* Script Assistant Modal */}
      <ScriptAssistantModal
        isOpen={isScriptModalOpen}
        onClose={() => setIsScriptModalOpen(false)}
        onApplyScript={(script, genre) => {
          if (mode === 'single') {
            setScriptText(script);
            setSpeechStyle(genre);
          } else {
            // Parse lines starting with speaker
            const parsedLines: DialogueLine[] = [];
            const rawLines = script.split('\n').filter((l) => l.includes(':'));
            rawLines.forEach((l, idx) => {
              const colonIdx = l.indexOf(':');
              const spk = l.substring(0, colonIdx).trim();
              const txt = l.substring(colonIdx + 1).trim();
              const isSpk1 = spk.toLowerCase() === speaker1.name.toLowerCase();
              parsedLines.push({
                id: Math.random().toString(36).substring(2, 9),
                speaker: isSpk1 ? speaker1.name : speaker2.name,
                voice: isSpk1 ? speaker1.voice : speaker2.voice,
                text: txt,
                style: '',
              });
            });
            if (parsedLines.length > 0) {
              setDialogue(parsedLines);
            }
          }
        }}
        mode={mode}
        speaker1Name={speaker1.name}
        speaker2Name={speaker2.name}
      />

      {/* Code Export Modal */}
      <CodeExportModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        voice={selectedVoice}
        model={model}
        script={scriptText}
        style={speechStyle}
        mode={mode}
        speaker1Name={speaker1.name}
        speaker1Voice={speaker1.voice}
        speaker2Name={speaker2.name}
        speaker2Voice={speaker2.voice}
      />

      {/* GitHub Export & Self-Host Modal */}
      <GitHubExportModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Powered by <strong>Google AI Studio</strong> & Gemini 3.8 Speech Models (<code>@google/genai</code>)
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('guide')}
              className="hover:text-slate-300 transition-colors"
            >
              How-To Tutorial
            </button>
            <button
              onClick={() => setIsCodeModalOpen(true)}
              className="hover:text-slate-300 transition-colors"
            >
              Export API Code
            </button>
            <a
              href="https://aistudio.google.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-300 transition-colors flex items-center gap-1"
            >
              Google AI Studio
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
