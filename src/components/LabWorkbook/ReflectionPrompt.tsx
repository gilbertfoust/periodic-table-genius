import type { LearningLevel } from '@/types/learningLayers';
import { ObservationRecorder } from './ObservationRecorder';

interface ReflectionPromptProps {
  basePrompt: string;
  level: LearningLevel;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  submitted: boolean;
}

export function ReflectionPrompt({ basePrompt, level, value, onChange, onSubmit, submitted }: ReflectionPromptProps) {
  let prompt = basePrompt;
  if (level === 'intermediate') {
    prompt += ' Compare your answer to another element pair.';
  } else if (level === 'advanced') {
    prompt += ' Under what conditions might this simplified model break down?';
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-foreground/85 leading-relaxed">{prompt}</p>
      <ObservationRecorder
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        submitted={submitted}
        placeholder="Write your reflection..."
      />
    </div>
  );
}
