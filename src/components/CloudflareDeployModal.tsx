import React, { useState } from 'react';
import { Globe, Cloud, Sparkles, Check, Copy, ExternalLink, ShieldAlert, Cpu, GitBranch, ArrowRight } from 'lucide-react';

interface CloudflareDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudflareDeployModal: React.FC<CloudflareDeployModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyText = (txt: string, id: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const steps = [
    {
      number: '1',
      title: 'Open Cloudflare Pages (Free)',
      desc: 'Go to dash.cloudflare.com and click Workers & Pages > Create Application > Pages > Connect to Git.',
      link: 'https://dash.cloudflare.com/',
      linkText: 'Open Cloudflare Dashboard',
    },
    {
      number: '2',
      title: 'Select Your GitHub Repository',
      desc: 'Select thinkdivisionv-p1/ai-studio-voiceover and click Begin setup.',
    },
    {
      number: '3',
      title: 'Configure Build Settings',
      desc: 'Cloudflare will detect Vite automatically. Confirm these exact settings:',
      items: [
        { label: 'Build command', val: 'npm run build' },
        { label: 'Build output directory', val: 'dist' },
      ],
    },
    {
      number: '4',
      title: 'Set Environment Variables',
      desc: 'Expand Environment Variables (Advanced) and add your keys:',
      items: [
        { label: 'GEMINI_API_KEY', val: 'Your Google AI Studio API Key (from aistudio.google.com)' },
        { label: 'STUDIO_PASSWORD (Optional)', val: 'A private passcode to prevent unauthorized use' },
      ],
    },
    {
      number: '5',
      title: 'Save and Deploy',
      desc: 'Click "Save and Deploy". In ~60 seconds, your personal voiceover studio will be live globally on a free .pages.dev URL with automatic CI/CD on every GitHub commit!',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-orange-500/30 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Deploy to Cloudflare Pages & Workers
              </h3>
              <p className="text-xs text-slate-400">
                Zero local software required · $0 Free Tier · Automated GitHub CI/CD
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

        {/* Scrollable body */}
        <div className="space-y-4 py-4 overflow-y-auto pr-1">
          {/* Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <strong className="text-amber-400 block font-semibold">$0 / Month</strong>
              <span className="text-slate-400 text-[11px]">Cloudflare Pages & Workers free tier (100k requests/day).</span>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <strong className="text-indigo-400 block font-semibold">Zero Local Software</strong>
              <span className="text-slate-400 text-[11px]">Works entirely in browser via GitHub & Cloudflare.</span>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <strong className="text-emerald-400 block font-semibold">Instant CI/CD</strong>
              <span className="text-slate-400 text-[11px]">Every git commit automatically builds and deploys.</span>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {steps.map((st, idx) => (
              <div
                key={idx}
                className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3.5 space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-orange-500/20 text-orange-400 font-mono text-[11px] flex items-center justify-center">
                      {st.number}
                    </span>
                    {st.title}
                  </h4>
                  {st.link && (
                    <a
                      href={st.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
                    >
                      {st.linkText} <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{st.desc}</p>

                {st.items && (
                  <div className="space-y-1.5 pt-1">
                    {st.items.map((item, i) => (
                      <div
                        key={i}
                        className="bg-slate-900 border border-slate-800 rounded-lg p-2 flex items-center justify-between text-xs font-mono"
                      >
                        <span className="text-slate-400 text-[11px]">{item.label}:</span>
                        <div className="flex items-center gap-2">
                          <code className="text-orange-300 font-semibold">{item.val}</code>
                          <button
                            onClick={() => copyText(item.val, `val-${idx}-${i}`)}
                            className="p-1 text-slate-400 hover:text-white"
                            title="Copy"
                          >
                            {copiedKey === `val-${idx}-${i}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Cloudflare Pages Functions note */}
          <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-xl p-3.5 flex items-start gap-3">
            <Cpu className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-slate-300">
              <strong className="text-orange-300 block font-semibold">
                Pre-Configured Edge Functions Ready
              </strong>
              We have already included <code>/functions/api/tts/generate.ts</code> and{' '}
              <code>wrangler.toml</code> in this repo. Cloudflare automatically mounts them as serverless
              workers without you having to configure a separate Node.js server!
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400 font-mono">
            Repository: thinkdivisionv-p1/ai-studio-voiceover
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-colors shadow-lg shadow-orange-600/20"
          >
            Ready to Deploy
          </button>
        </div>
      </div>
    </div>
  );
};
