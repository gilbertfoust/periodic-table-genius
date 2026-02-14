import type { LearningLevel, LevelText } from '@/types/learningLayers';
import { ASSUMPTIONS_NOTE } from '@/types/learningLayers';

interface Props {
  text: LevelText;
  level: LearningLevel;
  showAssumptions?: boolean;
}

export function LevelNotice({ text, level, showAssumptions }: Props) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] font-medium text-muted-foreground">What to notice:</div>
      {level === 'beginner' && (
        <p className="text-[11px] text-foreground/80">{text.beginner}</p>
      )}
      {(level === 'intermediate' || level === 'advanced') && (
        <ul className="list-disc list-inside space-y-0.5">
          {text.intermediate.map((t, i) => (
            <li key={i} className="text-[11px] text-foreground/80">{t}</li>
          ))}
        </ul>
      )}
      {level === 'advanced' && text.advanced.length > 0 && (
        <div className="border-l-2 border-muted-foreground/20 pl-2 space-y-0.5 mt-1">
          <div className="text-[9px] font-medium text-muted-foreground">Technical notes (simplified model):</div>
          {text.advanced.map((t, i) => (
            <p key={i} className="text-[10px] text-muted-foreground/80">{t}</p>
          ))}
        </div>
      )}
      {showAssumptions && (
        <p className="text-[10px] text-amber-400/80 italic mt-1">⚠ {ASSUMPTIONS_NOTE}</p>
      )}
    </div>
  );
}
