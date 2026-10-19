import React, { useState } from 'react';
import { Github, Copy, Check, Terminal, ExternalLink, ShieldCheck, Server, Globe } from 'lucide-react';

interface GitHubExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubExportModal: React.FC<GitHubExportModalProps> = ({ isOpen, onClose }) => {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyCommand = (cmd: string, stepIdx: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedStep(stepIdx);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const gitSteps = [
    {
      title: '1. Create a Repository on GitHub',
      desc: 'Go to github.com/new and create a new repository named "ai-studio-voiceover". Leave it empty without initializing a README.',
      cmd: '',
      link: 'https://github.com/new',
    },
    {
      title: '2. Initialize Git & Commit Code',
      desc: 'Run these commands in your project terminal to commit your files:',
      cmd: `git init\ngit add .\ngit commit -m "feat: initial commit of AI Studio Voiceover Studio"`,
    },
    {
      title: '3. Push to your GitHub Repository',
      desc: 'Replace YOUR_USERNAME with your GitHub account name and push:',
      cmd: `git branch -M main\ngit remote add origin https://github.com/YOUR_USERNAME/ai-studio-voiceover.git\ngit push -u origin main`,
    },
    {
      title: '4. Setup Your Own Gemini API Key',
      desc: 'Create a .env file and add your personal Google AI Studio key:',
      cmd: `cp .env.example .env\n# Add your key inside .env:\nGEMINI_API_KEY="YOUR_GEMINI_API_KEY"`,
    },
    {
      title: '5. Launch Your Voiceover Studio',
      desc: 'Start the development server or build for production:',
      cmd: `npm install\nnpm run dev`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-850 border border-slate-750 flex items-center justify-center text-white shadow">
              <Github className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Push to GitHub & Host Your Own Studio
              </h3>
              <p className="text-xs text-slate-400">
                100% open-source, full-stack React + Express + @google/genai
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

        {/* Scrollable instructions */}
        <div className="space-y-4 py-4 overflow-y-auto pr-1">
          {/* Highlight banner */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-emerald-300">
                Full Ownership & Production Ready
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Yes! You can freely upload this entire codebase to GitHub and run it as your own personal
                or commercial voiceover suite. API keys are managed safely server-side, and all code uses the standard Apache-2.0 license.
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {gitSteps.map((step, idx) => (
              <div
                key={idx}
                className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 font-mono text-[11px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    {step.title}
                  </h4>
                  {step.link && (
                    <a
                      href={step.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                    >
                      Open GitHub <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>

                {step.cmd && (
                  <div className="relative group">
                    <pre className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-indigo-300 overflow-x-auto">
                      {step.cmd}
                    </pre>
                    <button
                      onClick={() => copyCommand(step.cmd, idx)}
                      className="absolute top-2 right-2 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold flex items-center gap-1 transition-colors border border-slate-700"
                    >
                      {copiedStep === idx ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      {copiedStep === idx ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Deployment targets */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              Where You Can Host It for Free or Low Cost:
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <strong className="text-white block font-semibold">Render / Railway</strong>
                <span className="text-slate-400 text-[11px]">Connect repo, set GEMINI_API_KEY env, auto-deploys.</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <strong className="text-white block font-semibold">Google Cloud Run</strong>
                <span className="text-slate-400 text-[11px]">Scale-to-zero serverless container in GCP.</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <strong className="text-white block font-semibold">Local Machine / VPS</strong>
                <span className="text-slate-400 text-[11px]">Run npm run dev on any Mac, Linux, or PC.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-mono">Full README.md is in your project root</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-colors"
          >
            Got it, Let's Build!
          </button>
        </div>
      </div>
    </div>
  );
};
