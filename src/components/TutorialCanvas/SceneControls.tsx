import { Pause, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import type { LearningLevel, SceneControls as SC } from '@/types/learningLayers';

interface Props {
  controls: SC;
  onChange: (c: SC) => void;
  overlayDefs: { key: string; label: string; levelMin: LearningLevel }[];
  showReset?: boolean;
  onReset?: () => void;
  showScrubber?: boolean;
}

const LEVELS: LearningLevel[] = ['beginner', 'intermediate', 'advanced'];
const LEVEL_LABELS: Record<LearningLevel, string> = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

const levelIdx = (l: LearningLevel) => LEVELS.indexOf(l);

export function SceneControlsUI({ controls, onChange, overlayDefs, showReset, onReset, showScrubber }: Props) {
  const { level, speed, paused, overlays, scrubPhase } = controls;

  const setLevel = (l: LearningLevel) => onChange({ ...controls, level: l });
  const setPaused = (p: boolean) => onChange({ ...controls, paused: p });
  const setSpeed = (s: number) => onChange({ ...controls, speed: s });
  const toggleOverlay = (key: string) => onChange({ ...controls, overlays: { ...overlays, [key]: !overlays[key] } });

  const visibleOverlays = overlayDefs.filter(o => levelIdx(level) >= levelIdx(o.levelMin));

  return (
    <div className="space-y-2 px-1">
      {/* Level selector */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-muted-foreground font-medium w-12 shrink-0">Level:</span>
        <div className="flex gap-1">
          {LEVELS.map(l => (
            <Button
              key={l}
              variant={level === l ? 'default' : 'outline'}
              size="sm"
              className="h-5 px-2 text-[10px]"
              onClick={() => setLevel(l)}
            >
              {LEVEL_LABELS[l]}
            </Button>
          ))}
        </div>
      </div>

      {/* Play/Pause + Speed */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setPaused(!paused)}>
          {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
        </Button>
        {showReset && onReset && (
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onReset}>
            <RotateCcw className="h-3 w-3" />
          </Button>
        )}
        <span className="text-[10px] text-muted-foreground w-10 shrink-0">{speed.toFixed(2)}×</span>
        <Slider
          min={25} max={200} step={25}
          value={[speed * 100]}
          onValueChange={([v]) => setSpeed(v / 100)}
          className="flex-1"
        />
      </div>

      {/* Animation Scrubber */}
      {showScrubber && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground w-12 shrink-0">Scrub:</span>
          <Slider
            min={0} max={100} step={1}
            value={[scrubPhase !== null ? scrubPhase * 100 : 0]}
            onValueChange={([v]) => onChange({ ...controls, scrubPhase: v / 100, paused: true })}
            onValueCommit={() => onChange({ ...controls, scrubPhase: null })}
            className="flex-1"
          />
          {scrubPhase !== null && (
            <span className="text-[10px] text-muted-foreground">{Math.round(scrubPhase * 100)}%</span>
          )}
        </div>
      )}

      {/* Overlays */}
      {visibleOverlays.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {visibleOverlays.map(o => (
            <label key={o.key} className="flex items-center gap-1.5 cursor-pointer">
              <Switch
                checked={!!overlays[o.key]}
                onCheckedChange={() => toggleOverlay(o.key)}
                className="h-4 w-7 [&>span]:h-3 [&>span]:w-3 [&>span]:data-[state=checked]:translate-x-3"
              />
              <span className="text-[10px] text-muted-foreground">{o.label}</span>
            </label>
          ))}
        </div>
      )}

      {/* Advanced perf indicator */}
      {level === 'advanced' && (
        <div className="text-[9px] text-muted-foreground/60">
          Rendering: {paused ? 'paused' : 'active'} · Speed: {speed}×
        </div>
      )}
    </div>
  );
}
