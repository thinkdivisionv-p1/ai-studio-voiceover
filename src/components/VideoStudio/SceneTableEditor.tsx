import React from 'react';
import { SceneBeat, VisualType, VideoProject } from '../../types/video';
import {
  Layers,
  Plus,
  Trash2,
  Clock,
  Play,
  BarChart3,
  GitBranch,
  Type,
  TrendingUp,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface SceneTableEditorProps {
  project: VideoProject;
  currentTime: number;
  onJumpToTime: (t: number) => void;
  onUpdateScenes: (scenes: SceneBeat[]) => void;
}

export const SceneTableEditor: React.FC<SceneTableEditorProps> = ({
  project,
  currentTime,
  onJumpToTime,
  onUpdateScenes,
}) => {
  const handleUpdateScene = (id: string, updates: Partial<SceneBeat>) => {
    onUpdateScenes(
      project.scenes.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const handleAddBeat = (index: number) => {
    const current = project.scenes[index];
    const duration = current.endTime - current.startTime;
    const splitTime = current.startTime + duration / 2;

    const newBeat1: SceneBeat = {
      ...current,
      endTime: splitTime,
    };

    const newBeat2: SceneBeat = {
      id: Math.random().toString(36).substring(2, 9),
      startTime: splitTime,
      endTime: current.endTime,
      title: `${current.title} (Beat B)`,
      headline: current.headline,
      subheadline: current.subheadline,
      visualType: current.visualType === 'data-chart' ? 'kinetic-text' : 'data-chart',
      captionText: current.captionText,
      storyPhase: current.storyPhase,
    };

    const updated = [...project.scenes];
    updated.splice(index, 1, newBeat1, newBeat2);
    onUpdateScenes(updated);
  };

  const handleDeleteBeat = (id: string) => {
    if (project.scenes.length <= 1) return;
    onUpdateScenes(project.scenes.filter((s) => s.id !== id));
  };

  const visualTypes: { id: VisualType; label: string; icon: any }[] = [
    { id: 'kinetic-text', label: 'Kinetic Typography', icon: Type },
    { id: 'data-chart', label: 'Animated Data Chart', icon: BarChart3 },
    { id: 'infrastructure-diagram', label: 'Tech Diagram', icon: GitBranch },
    { id: 'flow-pipeline', label: 'Flow Pipeline', icon: TrendingUp },
    { id: 'market-comparison', label: 'Market Comparison', icon: Sparkles },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Storyboard & Scene Beat Table ({project.scenes.length} visual beats)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Pacing standard: Change visual composition every 3–6s · Zero static slides
          </p>
        </div>

        <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
          Target: &lt;6.0s Per Beat
        </span>
      </div>

      <div className="space-y-3">
        {project.scenes.map((scene, idx) => {
          const duration = scene.endTime - scene.startTime;
          const isActive = currentTime >= scene.startTime && currentTime <= scene.endTime;
          const isTooLong = duration > 6.0;

          return (
            <div
              key={scene.id}
              className={`rounded-xl border p-4 space-y-3 transition-all ${
                isActive
                  ? 'bg-slate-900 border-cyan-500/70 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Scene Header */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => onJumpToTime(scene.startTime)}
                    className="w-7 h-7 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center transition-colors"
                    title="Jump player to this scene"
                  >
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </button>

                  <span className="text-xs font-mono font-bold text-slate-400">
                    BEAT #{idx + 1}
                  </span>

                  <input
                    type="text"
                    value={scene.title}
                    onChange={(e) => handleUpdateScene(scene.id, { title: e.target.value })}
                    className="bg-transparent text-xs font-bold text-white focus:outline-none focus:border-b border-cyan-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {/* Timestamp & Duration */}
                  <div
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono border ${
                      isTooLong
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : 'bg-slate-850 text-slate-300 border-slate-750'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>
                      {scene.startTime.toFixed(1)}s - {scene.endTime.toFixed(1)}s ({duration.toFixed(1)}s)
                    </span>
                    {isTooLong && (
                      <span title="Exceeds 6-second static limit! Recommend splitting into sub-beats.">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 ml-1" />
                      </span>
                    )}
                  </div>

                  {/* Split beat button */}
                  <button
                    onClick={() => handleAddBeat(idx)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold flex items-center gap-1 border border-slate-700 transition-colors"
                    title="Split into two 3-second kinetic beats"
                  >
                    <Plus className="w-3 h-3" />
                    Split Beat
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteBeat(scene.id)}
                    disabled={project.scenes.length <= 1}
                    className="p-1 text-slate-500 hover:text-rose-400 disabled:opacity-30 transition-colors"
                    title="Delete beat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Visual Type Selector & Story Phase */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[10px] text-slate-400 font-mono block mb-1">
                    Visual Animation Type
                  </label>
                  <select
                    value={scene.visualType}
                    onChange={(e) =>
                      handleUpdateScene(scene.id, { visualType: e.target.value as VisualType })
                    }
                    className="w-full bg-slate-900 border border-slate-750 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {visualTypes.map((vt) => (
                      <option key={vt.id} value={vt.id}>
                        {vt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-mono block mb-1">
                    Documentary Story Phase
                  </label>
                  <select
                    value={scene.storyPhase}
                    onChange={(e) =>
                      handleUpdateScene(scene.id, {
                        storyPhase: e.target.value as SceneBeat['storyPhase'],
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-750 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Hook">1. Opening Hook (0-5s)</option>
                    <option value="Engineering Problem">2. Engineering Problem</option>
                    <option value="Unmet Need">3. Unmet Need & Bottleneck</option>
                    <option value="Business Opportunity">4. Business Opportunity</option>
                    <option value="Practical Solution">5. Practical Solution</option>
                    <option value="Conclusion">6. Conclusion & Takeaway</option>
                  </select>
                </div>
              </div>

              {/* Headline & Subheadline inputs */}
              <div className="space-y-2">
                <input
                  type="text"
                  value={scene.headline}
                  onChange={(e) => handleUpdateScene(scene.id, { headline: e.target.value })}
                  placeholder="On-Screen Headline (Kinetic bold display)..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-bold tracking-wide focus:outline-none focus:border-cyan-500"
                />

                <input
                  type="text"
                  value={scene.subheadline}
                  onChange={(e) => handleUpdateScene(scene.id, { subheadline: e.target.value })}
                  placeholder="Technical context or engineering detail..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1 text-xs text-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Caption Line */}
              <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-800/80 flex items-start gap-2 text-xs">
                <span className="text-[10px] text-cyan-400 font-mono shrink-0 uppercase tracking-wider mt-0.5">
                  Voiceover:
                </span>
                <input
                  type="text"
                  value={scene.captionText}
                  onChange={(e) => handleUpdateScene(scene.id, { captionText: e.target.value })}
                  placeholder="Spoken narration for this beat (synchronized to SRT)..."
                  className="w-full bg-transparent text-slate-300 focus:outline-none text-xs italic font-serif"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
