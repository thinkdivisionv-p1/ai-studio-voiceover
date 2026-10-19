import React, { useState } from 'react';
import {
  Upload,
  FileText,
  Layers,
  Sparkles,
  Download,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Sliders,
  Scissors,
  Music2,
  Clock,
  Loader2,
  Trash2,
} from 'lucide-react';
import { NarrationSegment, VoiceName, TTSModel } from '../types/tts';
import { parseDocument, chunkTextIntoSegments } from '../utils/documentParser';
import { stitchWavClips } from '../utils/wavStitcher';

interface MultiSegmentManagerProps {
  selectedVoice: VoiceName;
  model: TTSModel;
  speechStyle: string;
  studioPassword?: string;
  onLoadAudioToPlayer: (
    audioBase64: string,
    title: string,
    subtitle: string,
    voiceName: string
  ) => void;
}

export const MultiSegmentManager: React.FC<MultiSegmentManagerProps> = ({
  selectedVoice,
  model,
  speechStyle,
  studioPassword,
  onLoadAudioToPlayer,
}) => {
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rawText, setRawText] = useState<string>('');
  const [segments, setSegments] = useState<NarrationSegment[]>([]);
  const [targetWords, setTargetWords] = useState<number>(160);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0,
  });

  // Handle file drop / upload
  const handleFileUpload = async (file: File) => {
    setIsParsing(true);
    setParseError(null);
    try {
      const parsed = await parseDocument(file);
      if (!parsed.extractedText || parsed.extractedText.trim().length === 0) {
        throw new Error('The uploaded document contains no readable text.');
      }

      setFileName(parsed.fileName);
      setRawText(parsed.extractedText);
      const generatedSegments = chunkTextIntoSegments(parsed.extractedText, targetWords);
      setSegments(
        generatedSegments.map((s) => ({
          ...s,
          status: 'pending',
        }))
      );
    } catch (err: any) {
      console.error(err);
      setParseError(err.message || 'Failed to read document');
    } finally {
      setIsParsing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRechunk = (words: number) => {
    setTargetWords(words);
    if (!rawText) return;
    const generated = chunkTextIntoSegments(rawText, words);
    setSegments(
      generated.map((s) => ({
        ...s,
        status: 'pending',
      }))
    );
  };

  // Generate single segment
  const generateSegmentAudio = async (segId: string): Promise<string | null> => {
    const seg = segments.find((s) => s.id === segId);
    if (!seg || !seg.text.trim()) return null;

    setSegments((prev) =>
      prev.map((s) => (s.id === segId ? { ...s, status: 'generating', error: undefined } : s))
    );

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (studioPassword) {
        headers['x-studio-password'] = studioPassword;
      }

      const res = await fetch('/api/tts/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          mode: 'single',
          model,
          text: seg.text,
          voice: selectedVoice,
          style: speechStyle,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to synthesize segment');
      }

      setSegments((prev) =>
        prev.map((s) =>
          s.id === segId
            ? {
                ...s,
                status: 'ready',
                audioBase64: data.audioBase64,
                mimeType: data.mimeType || 'audio/wav',
              }
            : s
        )
      );

      return data.audioBase64;
    } catch (err: any) {
      setSegments((prev) =>
        prev.map((s) =>
          s.id === segId ? { ...s, status: 'error', error: err.message || 'Failed' } : s
        )
      );
      return null;
    }
  };

  // Batch generate all pending segments sequentially
  const handleBatchGenerate = async () => {
    if (segments.length === 0 || isBatchGenerating) return;
    setIsBatchGenerating(true);
    setBatchProgress({ current: 0, total: segments.length });

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (seg.status !== 'ready') {
        setBatchProgress({ current: i + 1, total: segments.length });
        await generateSegmentAudio(seg.id);
      } else {
        setBatchProgress({ current: i + 1, total: segments.length });
      }
    }

    setIsBatchGenerating(false);
  };

  // Stitch all ready clips and download master WAV
  const handleStitchAndDownload = () => {
    const readySegments = segments.filter((s) => s.status === 'ready' && s.audioBase64);
    if (readySegments.length === 0) {
      alert('No segments have generated audio yet. Please generate segments first.');
      return;
    }

    try {
      const b64List = readySegments.map((s) => s.audioBase64!);
      const masterB64 = stitchWavClips(b64List);

      // Trigger instant download
      const link = document.createElement('a');
      link.href = `data:audio/wav;base64,${masterB64}`;
      const safeName = (fileName || 'document_narration').replace(/\.[^/.]+$/, '');
      link.download = `${safeName}_master_voiceover.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Also load to main player
      onLoadAudioToPlayer(
        masterB64,
        `Master Narration: ${fileName || 'Document'}`,
        `Stitched from ${readySegments.length} segments (${readySegments.reduce(
          (a, c) => a + c.wordCount,
          0
        )} words total)`,
        selectedVoice
      );
    } catch (err: any) {
      alert(`Stitching error: ${err.message}`);
    }
  };

  // Download individual segment
  const downloadSingleSegment = (seg: NarrationSegment) => {
    if (!seg.audioBase64) return;
    const link = document.createElement('a');
    link.href = `data:${seg.mimeType || 'audio/wav'};base64,${seg.audioBase64}`;
    link.download = `${(fileName || 'document').replace(/\.[^/.]+$/, '')}_${seg.id}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalWords = segments.reduce((acc, s) => acc + s.wordCount, 0);
  const totalEstimatedSeconds = Math.round((totalWords / 140) * 60);
  const readyCount = segments.filter((s) => s.status === 'ready').length;

  return (
    <div className="space-y-6">
      {/* Upload Box if no document loaded */}
      {!fileName ? (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-700/80 hover:border-indigo-500 rounded-2xl p-8 sm:p-12 text-center bg-slate-900/40 hover:bg-slate-900/70 transition-all cursor-pointer backdrop-blur-sm group"
          onClick={() => {
            const input = document.getElementById('doc-file-input');
            if (input) input.click();
          }}
        >
          <input
            id="doc-file-input"
            type="file"
            accept=".txt,.docx,.pdf,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />

          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform shadow-lg shadow-indigo-500/10">
            {isParsing ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>

          <h3 className="text-lg font-bold text-white mb-1">
            {isParsing ? 'Parsing Document...' : 'Upload Script or Document'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-4 leading-relaxed">
            Drag and drop or browse <strong>.TXT</strong>, <strong>.DOCX</strong>, or{' '}
            <strong>.PDF</strong> files. Automatically splits long essays, chapters, or screenplays
            into manageable voiceover segments.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400 font-mono">
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">.TXT text</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">.DOCX Word</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">.PDF Document</span>
          </div>

          {parseError && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs inline-block text-left">
              <AlertCircle className="w-4 h-4 inline mr-1 text-rose-400" />
              {parseError}
            </div>
          )}
        </div>
      ) : (
        /* Document Loaded Session View */
        <div className="space-y-6">
          {/* Document Overview Header Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 backdrop-blur-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{fileName}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    {segments.length} Segments
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                  <span>{totalWords.toLocaleString()} words</span>
                  <span>•</span>
                  <span>~{Math.round(totalEstimatedSeconds / 60)} min listening time</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">{readyCount}/{segments.length} Ready</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleBatchGenerate}
                disabled={isBatchGenerating}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isBatchGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating {batchProgress.current}/{batchProgress.total}...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate All Audio
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleStitchAndDownload}
                disabled={readyCount === 0}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
                title="Lossless stitch of all ready segments into one continuous WAV"
              >
                <Download className="w-4 h-4" />
                Stitch & Download Master WAV
              </button>

              <button
                type="button"
                onClick={() => {
                  setFileName(null);
                  setSegments([]);
                  setRawText('');
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
                title="Discard and upload new document"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Segment Chunk Size Slider */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Scissors className="w-4 h-4 text-indigo-400" />
              Segment Size Adjuster:
            </div>
            <div className="flex items-center gap-3">
              {[120, 160, 220, 300].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => handleRechunk(w)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                    targetWords === w
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  ~{w} words ({Math.round((w / 140) * 60)}s)
                </button>
              ))}
            </div>
          </div>

          {/* Segments List */}
          <div className="space-y-3">
            {segments.map((seg, idx) => {
              const isReady = seg.status === 'ready' && seg.audioBase64;
              const isGeneratingThis = seg.status === 'generating';

              return (
                <div
                  key={seg.id}
                  className={`bg-slate-900/80 rounded-xl border p-4 space-y-3 transition-all ${
                    isReady
                      ? 'border-emerald-500/40 bg-slate-900/90'
                      : seg.status === 'error'
                      ? 'border-rose-500/40'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-mono text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <h4 className="text-xs font-bold text-white">{seg.title}</h4>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {seg.wordCount} words · ~{seg.estimatedSeconds}s
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isReady && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Ready
                        </span>
                      )}

                      {seg.status === 'error' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
                          <AlertCircle className="w-3 h-3" /> Error
                        </span>
                      )}

                      {/* Action buttons */}
                      {isReady ? (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              onLoadAudioToPlayer(
                                seg.audioBase64!,
                                `${fileName} - ${seg.title}`,
                                seg.text.slice(0, 80),
                                selectedVoice
                              )
                            }
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/40 flex items-center gap-1 transition-colors"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            Play
                          </button>

                          <button
                            type="button"
                            onClick={() => downloadSingleSegment(seg)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            WAV
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => generateSegmentAudio(seg.id)}
                          disabled={isGeneratingThis || isBatchGenerating}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow flex items-center gap-1.5 transition-all disabled:opacity-50"
                        >
                          {isGeneratingThis ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3" />
                              Generate Audio
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Segment Text Input */}
                  <textarea
                    value={seg.text}
                    onChange={(e) => {
                      const newText = e.target.value;
                      const wc = newText.split(/\s+/).filter(Boolean).length;
                      setSegments((prev) =>
                        prev.map((s) =>
                          s.id === seg.id
                            ? {
                                ...s,
                                text: newText,
                                wordCount: wc,
                                estimatedSeconds: Math.round((wc / 140) * 60),
                              }
                            : s
                        )
                      );
                    }}
                    rows={3}
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-lg p-3 text-xs text-slate-200 font-sans leading-relaxed resize-y focus:outline-none"
                  />

                  {seg.error && (
                    <div className="text-[11px] text-rose-400 font-mono">{seg.error}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
