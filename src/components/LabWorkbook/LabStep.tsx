import { useState } from 'react';
import type { LabStep as LabStepDef, LabStepType } from '@/labs/labTypes';
import type { LearningLevel } from '@/types/learningLayers';
import { ObservationRecorder } from './ObservationRecorder';
import { ReflectionPrompt } from './ReflectionPrompt';

interface LabStepProps {
  step: LabStepDef;
  stepIndex: number;
  savedAnswer: string | undefined;
  isActive: boolean;
  isCompleted: boolean;
  isLocked: boolean;
  sceneReady: boolean; // for observe3D gating
  level: LearningLevel;
  onSubmit: (stepIndex: number, answer: string) => void;
  feedback: string | null;
}

export function LabStep({ step, stepIndex, savedAnswer, isActive, isCompleted, isLocked, sceneReady, level, onSubmit, feedback }: LabStepProps) {
  const [draft, setDraft] = useState(savedAnswer || '');

  if (isLocked) {
    return (
      <div className="border border-border/20 rounded-lg bg-secondary/5 p-2.5 opacity-40">
        <div className="text-[10px] text-muted-foreground font-medium">Step {stepIndex + 1}: {stepTypeLabel(step.type)}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">🔒 Complete previous steps first</div>
      </div>
    );
  }

  if (isCompleted && savedAnswer) {
    return (
      <div className="border border-emerald-500/20 rounded-lg bg-emerald-500/5 p-2.5">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-emerald-400 text-xs">✓</span>
          <span className="text-[10px] text-muted-foreground font-medium">Step {stepIndex + 1}: {stepTypeLabel(step.type)}</span>
        </div>
        <p className="text-[10px] text-foreground/70">{step.prompt}</p>
        <div className="text-[10px] text-foreground/60 mt-1 italic">"{savedAnswer}"</div>
        {feedback && <div className="text-[10px] text-emerald-400/80 mt-1">{feedback}</div>}
      </div>
    );
  }

  const handleSubmit = () => {
    if (!draft.trim()) return;
    onSubmit(stepIndex, draft);
  };

  return (
    <div className="border border-primary/20 rounded-lg bg-primary/5 p-2.5 space-y-2">
      <div className="text-[10px] text-primary font-medium">Step {stepIndex + 1}: {stepTypeLabel(step.type)}</div>
      <p className="text-xs text-foreground/85 leading-relaxed">{step.prompt}</p>

      {step.type === 'predict' && step.options && (
        <div className="space-y-1">
          {step.options.map(opt => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`step-${stepIndex}`}
                value={opt}
                checked={draft === opt}
                onChange={() => setDraft(opt)}
                className="accent-primary"
              />
              <span className="text-xs text-foreground/80">{opt}</span>
            </label>
          ))}
          <button
            onClick={handleSubmit}
            disabled={!draft.trim()}
            className="text-[10px] px-2.5 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors mt-1"
          >
            Submit prediction
          </button>
        </div>
      )}

      {step.type === 'observe3D' && (
        <div className="space-y-1.5">
          {!sceneReady && (
            <div className="text-[10px] text-amber-400">⚠ Expand the 3D View panel to observe</div>
          )}
          <button
            onClick={() => {
              setDraft('Observed');
              onSubmit(stepIndex, 'Observed');
            }}
            disabled={!sceneReady}
            className="text-[10px] px-2.5 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
          >
            I've observed this
          </button>
        </div>
      )}

      {(step.type === 'record' || step.type === 'explain') && (
        <ObservationRecorder
          value={draft}
          onChange={setDraft}
          onSubmit={handleSubmit}
          submitted={false}
        />
      )}

      {step.type === 'reflect' && (
        <ReflectionPrompt
          basePrompt=""
          level={level}
          value={draft}
          onChange={setDraft}
          onSubmit={handleSubmit}
          submitted={false}
        />
      )}
    </div>
  );
}

function stepTypeLabel(type: LabStepType): string {
  const map: Record<LabStepType, string> = {
    predict: 'Predict',
    observe3D: 'Observe',
    record: 'Record',
    explain: 'Explain',
    reflect: 'Reflect',
  };
  return map[type];
}
