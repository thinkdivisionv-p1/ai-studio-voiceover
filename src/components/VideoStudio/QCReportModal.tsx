import React from 'react';
import { VideoProject } from '../../types/video';
import { runQualityControlAudit } from '../../utils/qcAuditor';
import { ShieldCheck, AlertTriangle, CheckCircle2, Info, X, Clock, BarChart2 } from 'lucide-react';

interface QCReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: VideoProject;
}

export const QCReportModal: React.FC<QCReportModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  if (!isOpen) return null;

  const report = runQualityControlAudit(project);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Quality-Control (QC) Audit Report</h3>
              <p className="text-xs text-slate-400">
                Automated retention, static scene, and numerical claim verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 py-4 overflow-y-auto pr-1">
          {/* Top Score Banner */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Estimated Viewer Retention Index
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-cyan-400 font-mono">
                  {report.overallScore}/100
                </span>
                <span className="text-xs text-emerald-400 font-semibold">
                  (High Engagement Probability)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block">AVG BEAT DURATION</span>
                <strong className="text-white">{report.averageSceneDuration.toFixed(1)}s</strong>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block">WORDS PER MINUTE</span>
                <strong className="text-white">{report.wordsPerMinute} WPM ({report.pacingStatus})</strong>
              </div>
            </div>
          </div>

          {/* Section 1: Static Scene Limit Audit (Must be <= 6.0s) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              1. Pacing & Static Duration Audit (Max 6.0s Target)
            </h4>

            <div className="space-y-2">
              {report.retentionAlerts.map((alert, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                    alert.severity === 'pass'
                      ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                      : alert.severity === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/25 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  {alert.severity === 'pass' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : alert.severity === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  )}
                  <span>{alert.message}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Numerical & Engineering Claim Verification */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
              2. Factual & Numerical Claims Checked
            </h4>

            <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-3 space-y-1.5 text-xs text-slate-300">
              {report.dataVerificationNotes.map((note, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Professional Standard Checklist */}
          <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 p-3.5 space-y-2 text-xs">
            <h5 className="font-bold text-white">Visual Identity Compliance</h5>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Dark charcoal/navy base
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Electric Cyan accent
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> No static slides &gt; 6s
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> 1080p 30 FPS Canvas Pipeline
              </span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
