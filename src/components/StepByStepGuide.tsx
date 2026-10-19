import React, { useState } from 'react';
import { BookOpen, Sparkles, Mic, Layers, Sliders, Volume2, Code2, CheckCircle2, ArrowRight } from 'lucide-react';

export const StepByStepGuide: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 'step-1',
      title: '1. Select the Right Gemini Speech Model',
      icon: Sparkles,
      badge: 'Model Selection',
      summary: 'Google AI Studio offers two dedicated Gemini 3.8 speech generation models depending on your production needs.',
      details: [
        {
          heading: 'gemini-3.8-flash-lite-tts (Fast & Crisp)',
          desc: 'The workhorse model for voiceovers. Extremely low latency and cost-optimized. Ideal for YouTube narration, explainer videos, article reading, and audiobooks.',
        },
        {
          heading: 'gemini-3.8-flash-tts (Flagship Voice Design)',
          desc: 'The premium voice acting model. Reserved for complex vocal direction, custom emotional personas, dual-speaker podcasts, and scripts with vocal bursts (<breath>, <laugh>).',
        },
      ],
      tip: 'For 90% of solo video narration, start with gemini-3.8-flash-lite-tts. For podcasts and voice acting, choose gemini-3.8-flash-tts.',
    },
    {
      id: 'step-2',
      title: '2. Choose Your Voice Persona',
      icon: Mic,
      badge: 'Voice Timbre',
      summary: 'Gemini includes 5 prebuilt studio voices, each with distinct acoustic weight and tone.',
      details: [
        {
          heading: 'Kore (Calm & Empathetic)',
          desc: 'Warm, articulate, and crystal clear. Excellent for corporate explainers, documentaries, and wellness apps.',
        },
        {
          heading: 'Puck (Youthful & Energetic)',
          desc: 'Upbeat and punchy with natural enthusiasm. Perfect for YouTube intros, gaming, and commercial hooks.',
        },
        {
          heading: 'Fenrir (Deep & Cinematic)',
          desc: 'Rich, authoritative baritone. The quintessential movie trailer, historical documentary, and dramatic narrator.',
        },
        {
          heading: 'Zephyr (Modern & Conversational)',
          desc: 'Relaxed, authentic, and relatable. Great for tech product demos and conversational podcasts.',
        },
        {
          heading: 'Charon (Solemn & Grounded)',
          desc: 'Deep, steady, and contemplative. Superb for investigative pieces, philosophy, and introspective audio.',
        },
      ],
      tip: 'You can test all 5 voices instantly in our Studio tab using the Audition buttons.',
    },
    {
      id: 'step-3',
      title: '3. Direct Tone with SpeechMetadata',
      icon: Sliders,
      badge: 'Voice Direction',
      summary: 'Unlike legacy TTS systems that require cryptic SSML pitch tags, Gemini understands natural language directing via speechMetadata.',
      details: [
        {
          heading: 'Directing Tone & Persona',
          desc: 'Specify speechMetadata: { style: "Inspiring Silicon Valley founder, speaking with measured pauses" } or "Whispering bedtime storyteller". Gemini automatically adjusts inflection, pitch contour, and breath speed.',
        },
        {
          heading: 'Directing Pacing with Punctuation',
          desc: 'Use commas for brief micro-pauses (200ms), ellipses (...) for dramatic lingering pauses (600ms), and exclamation marks for rising tonal energy.',
        },
        {
          heading: 'Emphasis & Phonetics',
          desc: 'Capitalize words for punchy emphasis. For unusual proper nouns, provide phonetic spelling (e.g., "AI Studio" or "GEE-mee-nee").',
        },
      ],
      tip: 'Think of speechMetadata as acting notes for a human voice actor in the recording booth.',
    },
    {
      id: 'step-4',
      title: '4. Inject Human Nuances & Vocal Bursts',
      icon: Volume2,
      badge: 'Expressive Bursts',
      summary: 'With gemini-3.8-flash-tts, you can insert organic vocal bursts that break the robotic monotony of traditional TTS.',
      details: [
        {
          heading: '<breath> (Intake of Breath)',
          desc: 'Places a natural organic inhalation right before an emotional statement. Makes the speech sound remarkably lifelike.',
        },
        {
          heading: '<laugh> (Chuckle / Laughter)',
          desc: 'Adds warm amusement or chuckling directly into the line without breaking the speech flow.',
        },
        {
          heading: '<gasp> & <sigh>',
          desc: 'Conveys genuine surprise, astonishment, relief, or dramatic suspense.',
        },
        {
          heading: '|mhm| & |yeah| (Backchanneling)',
          desc: 'In dialogue scenes, allows the listening speaker to subtly agree without interrupting the main speaker.',
        },
      ],
      tip: 'Do not overuse bursts—1 to 2 bursts per 30 seconds yields the most authentic human delivery.',
    },
    {
      id: 'step-5',
      title: '5. Multi-Speaker Screenplay Directing',
      icon: Layers,
      badge: 'Dual-Speaker Dialogue',
      summary: 'Generate full conversational podcasts and interviews with two distinct voices speaking back-and-forth.',
      details: [
        {
          heading: 'Setting multiSpeakerVoiceConfig',
          desc: 'Configure two speakers (e.g., Alex with Puck and Sam with Kore). Gemini generates both voices in a single coherent audio track.',
        },
        {
          heading: 'Script Turn Formatting',
          desc: 'Format script lines as "Alex: Welcome back!" and "Sam: Glad to be here, |yeah| it is great!".',
        },
        {
          heading: 'Dynamic Banter',
          desc: 'Co-hosts react naturally to each other, maintaining consistent acoustics, room reverb, and conversational timing.',
        },
      ],
      tip: 'The dual-speaker feature requires exactly two speakers in speakerVoiceConfigs.',
    },
    {
      id: 'step-6',
      title: '6. Output & Production Integration',
      icon: Code2,
      badge: 'Studio WAV Audio',
      summary: 'Gemini returns broadcast-ready audio directly in memory without third-party converters.',
      details: [
        {
          heading: '24kHz, 16-Bit Mono WAV',
          desc: 'In unary mode (generateContent), Gemini returns a complete WAV file with a standard 44-byte RIFF header in base64 format.',
        },
        {
          heading: 'Direct DAW & Video Editor Import',
          desc: 'The downloaded .WAV files can be dragged straight into Premiere Pro, DaVinci Resolve, Final Cut Pro, CapCut, Audacity, or Web Audio pipelines.',
        },
      ],
      tip: 'No sample rate conversion or header wrapping is needed—it is standard PCM WAV ready for editing.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-2xl relative z-10">
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
            <BookOpen className="w-4 h-4" />
            Complete Google AI Studio Voiceover Masterclass
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            How to Create Professional Voiceovers with Google AI Studio
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Google AI Studio and the Gemini 3.8 speech models give you studio-grade voice acting,
            natural breathing, emotional nuance, and dual-speaker dialogues right out of the box.
            Follow this 6-step walkthrough to master the workflow.
          </p>
        </div>
      </div>

      {/* Interactive Step Navigator */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {steps.map((st, idx) => {
          const isActive = activeStep === idx;
          const Icon = st.icon;
          return (
            <button
              key={st.id}
              onClick={() => setActiveStep(idx)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  0{idx + 1}
                </span>
              </div>
              <span className="text-xs font-bold text-white line-clamp-1">{st.badge}</span>
            </button>
          );
        })}
      </div>

      {/* Active Step Showcase */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 lg:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
              Step {activeStep + 1} of {steps.length}
            </span>
            <h3 className="text-xl font-bold text-white mt-1">
              {steps[activeStep].title}
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            {steps[activeStep].badge}
          </span>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed">
          {steps[activeStep].summary}
        </p>

        {/* Detail cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps[activeStep].details.map((d, i) => (
            <div
              key={i}
              className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 space-y-2 hover:border-slate-700 transition-colors"
            >
              <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                {d.heading}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">{d.desc}</p>
            </div>
          ))}
        </div>

        {/* Pro Tip Box */}
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Director Pro-Tip
            </h5>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {steps[activeStep].tip}
            </p>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
            disabled={activeStep === 0}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-30"
          >
            Previous Step
          </button>

          {activeStep < steps.length - 1 ? (
            <button
              onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/20"
            >
              Next Step
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => {
                const studioTab = document.getElementById('studio-tab-button');
                if (studioTab) studioTab.click();
              }}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-600/20"
            >
              <Mic className="w-3.5 h-3.5" />
              Try It in Studio Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
