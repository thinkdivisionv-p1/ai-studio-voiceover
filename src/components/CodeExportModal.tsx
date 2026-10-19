import React, { useState } from 'react';
import { Code2, Copy, Check, Terminal, FileCode, Cpu } from 'lucide-react';
import { VoiceName, TTSModel } from '../types/tts';

interface CodeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  voice: VoiceName;
  model: TTSModel;
  script: string;
  style: string;
  mode: 'single' | 'multi';
  speaker1Name?: string;
  speaker1Voice?: VoiceName;
  speaker2Name?: string;
  speaker2Voice?: VoiceName;
}

export const CodeExportModal: React.FC<CodeExportModalProps> = ({
  isOpen,
  onClose,
  voice,
  model,
  script,
  style,
  mode,
  speaker1Name = 'Alex',
  speaker1Voice = 'Puck',
  speaker2Name = 'Sam',
  speaker2Voice = 'Kore',
}) => {
  const [activeLang, setActiveLang] = useState<'typescript' | 'python' | 'curl'>('typescript');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const cleanScript = script || 'Welcome to voiceover generation with Google AI Studio and Gemini.';

  const tsCode =
    mode === 'single'
      ? `import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: { 'User-Agent': 'aistudio-build' }
  }
});

async function generateVoiceover() {
  const response = await ai.models.generateContent({
    model: "${model}",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: ${JSON.stringify(cleanScript)},
            speechMetadata: ${style ? JSON.stringify({ style }) : '{ style: "Clear, engaging studio narration" }'}
          }
        ]
      }
    ],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: "${voice}" } // 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr'
        }
      }
    }
  });

  // Default unary response returns a complete 24kHz mono 16-bit WAV file with RIFF header
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    const buffer = Buffer.from(base64Audio, "base64");
    fs.writeFileSync("voiceover.wav", buffer);
    console.log("Voiceover saved successfully to voiceover.wav!");
  }
}

generateVoiceover();`
      : `import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: { 'User-Agent': 'aistudio-build' }
  }
});

async function generateDualSpeakerDialogue() {
  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash-tts",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: "${speaker1Name}: Welcome to our tech breakdown! <breath> Let's get straight into it.",
            speechMetadata: {
              speaker: "${speaker1Name}",
              style: "Enthusiastic podcast host"
            }
          },
          {
            text: "${speaker2Name}: Glad to be here, |yeah| this update is huge.",
            speechMetadata: {
              speaker: "${speaker2Name}",
              style: "Knowledgeable, articulate co-host"
            }
          }
        ]
      }
    ],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: [
            {
              speaker: "${speaker1Name}",
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "${speaker1Voice}" } }
            },
            {
              speaker: "${speaker2Name}",
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "${speaker2Voice}" } }
            }
          ]
        }
      }
    }
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    fs.writeFileSync("dialogue_podcast.wav", Buffer.from(base64Audio, "base64"));
    console.log("Podcast audio saved to dialogue_podcast.wav!");
  }
}

generateDualSpeakerDialogue();`;

  const pythonCode =
    mode === 'single'
      ? `import base64
from google import genai
from google.genai import types

# Initialize client with GEMINI_API_KEY
client = genai.Client()

response = client.models.generate_content(
    model="${model}",
    contents=types.Content(
        role="user",
        parts=[
            types.Part.from_text(
                text=${JSON.stringify(cleanScript)},
            )
        ]
    ),
    config=types.GenerateContentConfig(
        response_modalities=["AUDIO"],
        speech_config=types.SpeechConfig(
            voice_config=types.VoiceConfig(
                prebuilt_voice_config=types.PrebuiltVoiceConfig(
                    voice_name="${voice}"
                )
            )
        )
    )
)

# Extract audio bytes and write to .wav file
for part in response.candidates[0].content.parts:
    if part.inline_data:
        audio_bytes = part.inline_data.data
        with open("gemini_voiceover.wav", "wb") as f:
            f.write(audio_bytes)
        print("Voiceover saved as gemini_voiceover.wav")
`
      : `import base64
from google import genai
from google.genai import types

client = genai.Client()

response = client.models.generate_content(
    model="gemini-3.8-flash-tts",
    contents=[
        "${speaker1Name}: Welcome back! <breath> Today we explore generative audio.",
        "${speaker2Name}: Absolutely, |yeah| the fidelity is astonishing."
    ],
    config=types.GenerateContentConfig(
        response_modalities=["AUDIO"],
        speech_config=types.SpeechConfig(
            multi_speaker_voice_config=types.MultiSpeakerVoiceConfig(
                speaker_voice_configs=[
                    types.SpeakerVoiceConfig(
                        speaker="${speaker1Name}",
                        voice_config=types.VoiceConfig(
                            prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="${speaker1Voice}")
                        )
                    ),
                    types.SpeakerVoiceConfig(
                        speaker="${speaker2Name}",
                        voice_config=types.VoiceConfig(
                            prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="${speaker2Voice}")
                        )
                    )
                ]
            )
        )
    )
)

for part in response.candidates[0].content.parts:
    if part.inline_data:
        with open("podcast.wav", "wb") as f:
            f.write(part.inline_data.data)
        print("Screenplay audio saved to podcast.wav")
`;

  const curlCode = `curl "https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=$GEMINI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -X POST \\
  -d '{
    "contents": [{
      "parts": [{
        "text": ${JSON.stringify(cleanScript)}
      }]
    }],
    "generationConfig": {
      "responseModalities": ["AUDIO"],
      "speechConfig": {
        "voiceConfig": {
          "prebuiltVoiceConfig": {
            "voiceName": "${voice}"
          }
        }
      }
    }
  }'`;

  const codeToShow =
    activeLang === 'typescript' ? tsCode : activeLang === 'python' ? pythonCode : curlCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeToShow);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Export Google AI Studio Code</h3>
              <p className="text-xs text-slate-400">
                Ready-to-run implementation with the modern @google/genai SDK
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center justify-between mt-4 mb-2">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveLang('typescript')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeLang === 'typescript'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              TypeScript / Node.js
            </button>
            <button
              onClick={() => setActiveLang('python')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeLang === 'python'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Python
            </button>
            <button
              onClick={() => setActiveLang('curl')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeLang === 'curl'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              cURL
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied to Clipboard' : 'Copy Code'}
          </button>
        </div>

        {/* Code display */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 max-h-[380px] overflow-y-auto font-mono text-xs text-indigo-300 leading-relaxed">
          <pre className="whitespace-pre-wrap">{codeToShow}</pre>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Uses official <strong>@google/genai</strong> SDK</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
