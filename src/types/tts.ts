export type VoiceName = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';

export type TTSModel = 'gemini-3.8-flash-lite-tts' | 'gemini-3.8-flash-tts';

export interface VoiceInfo {
  id: VoiceName;
  name: string;
  gender: 'Female' | 'Male' | 'Neutral';
  tone: string;
  description: string;
  bestFor: string[];
  sampleText: string;
  color: string;
}

export interface DialogueLine {
  id: string;
  speaker: string;
  voice: VoiceName;
  text: string;
  style?: string;
}

export interface NarrationSegment {
  id: string;
  title: string;
  text: string;
  wordCount: number;
  estimatedSeconds: number;
  status: 'pending' | 'generating' | 'ready' | 'error';
  audioBase64?: string;
  mimeType?: string;
  error?: string;
}

export interface DocumentNarrationSession {
  fileName: string;
  fileType: 'txt' | 'docx' | 'pdf';
  fileSize: number;
  totalWords: number;
  totalCharacters: number;
  segments: NarrationSegment[];
  stitchedAudioBase64?: string;
}

export interface GenerationHistoryItem {
  id: string;
  timestamp: number;
  mode: 'single' | 'multi' | 'document';
  model: TTSModel;
  title: string;
  script: string;
  voiceOrSpeakers: string;
  style?: string;
  audioBase64: string;
  mimeType: string;
  durationSeconds?: number;
}

export interface ScriptPreset {
  id: string;
  title: string;
  genre: string;
  voice: VoiceName;
  model: TTSModel;
  style: string;
  script: string;
  mode: 'single' | 'multi';
  dialogue?: DialogueLine[];
  description: string;
}
