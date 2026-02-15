import { useMemo, useCallback } from 'react';
import { LAB_DEFINITIONS } from '@/labs/labDefinitions';
import { useLabProgressStore } from '@/labs/useLabProgressStore';
import type { PairAnalysis } from '@/utils/interactionPredictor';
import type { LearningLevel } from '@/types/learningLayers';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Download } from 'lucide-react';
import { LabStep } from './LabStep';

interface LabWorkbookPanelProps {
  labId: string;
  onClose: () => void;
  sceneReady: boolean; // isExpanded && currentScene matches
  level: LearningLevel;
  primaryPair: PairAnalysis | null;
}

export function LabWorkbookPanel({ labId, onClose, sceneReady, level, primaryPair }: LabWorkbookPanelProps) {
  const lab = useMemo(() => LAB_DEFINITIONS.find(l => l.id === labId), [labId]);
  const { getProgress, submitAnswer, completeLab, resetLab } = useLabProgressStore();
  const progress = getProgress(labId);

  const handleSubmit = useCallback((stepIndex: number, answer: string) => {
    submitAnswer(labId, stepIndex, answer);
    // Check if this completes the lab
    if (lab && stepIndex === lab.steps.length - 1) {
      completeLab(labId);
    }
  }, [labId, lab, submitAnswer, completeLab]);

  const handleExport = useCallback(() => {
    if (!lab || !progress) return;
    const lines = [
      `Lab: ${lab.title}`,
      `Completed: ${progress.completed ? 'Yes' : 'No'}`,
      `Started: ${progress.startedAt}`,
      '',
      ...lab.steps.map((s, i) => `Step ${i + 1} (${s.type}): ${s.prompt}\nAnswer: ${progress.answers[i] || '(not answered)'}\n`),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
  }, [lab, progress]);

  if (!lab) return null;

  const currentStep = progress?.currentStep ?? 0;
  const totalSteps = lab.steps.length;
  const progressPct = progress?.completed ? 100 : (currentStep / totalSteps) * 100;

  // Generate feedback for predict steps
  const getFeedback = (stepIndex: number): string | null => {
    const step = lab.steps[stepIndex];
    const answer = progress?.answers[stepIndex];
    if (!answer || step.type !== 'predict') return null;

    if (!lab.expectedBondType) {
      return 'Model shows uncertainty — multiple answers may apply.';
    }

    if (answer === lab.expectedBondType) {
      return 'Consistent with model ✓';
    }

    if (primaryPair?.bondConfidence === 'uncertain') {
      return 'Model shows uncertainty — multiple answers may apply.';
    }

    return 'Consider reviewing the EN difference between these elements.';
  };

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm">{lab.title}</CardTitle>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-[10px]">
            {progress?.completed ? 'Complete ✓' : `Step ${Math.min(currentStep + 1, totalSteps)} of ${totalSteps}`}
          </Badge>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Objectives */}
        <div className="text-[10px] text-muted-foreground">
          <span className="font-medium">Objectives:</span> {lab.objectives.join(' · ')}
        </div>

        <Progress value={progressPct} className="h-1.5" />

        {/* Steps */}
        <div className="space-y-2">
          {lab.steps.map((step, i) => (
            <LabStep
              key={i}
              step={step}
              stepIndex={i}
              savedAnswer={progress?.answers[i]}
              isActive={i === currentStep}
              isCompleted={i < currentStep}
              isLocked={i > currentStep}
              sceneReady={sceneReady}
              level={level}
              onSubmit={handleSubmit}
              feedback={getFeedback(i)}
            />
          ))}
        </div>

        {/* Completion summary */}
        {progress?.completed && (
          <div className="border border-emerald-500/30 rounded-lg bg-emerald-500/5 p-2.5 space-y-2">
            <div className="text-xs font-medium text-emerald-400">🎉 Lab Complete!</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={handleExport}>
                <Download className="h-3 w-3" />
                Export as text
              </Button>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => resetLab(labId)}>
                Restart
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
