import { useState } from 'react';
import { formatFormula, type SlotEntry, type SynthesisResult } from '@/utils/synthesisEngine';

interface DevDebugPanelProps {
  combineSlots?: SlotEntry[];
  lastSendAction?: { type: 'curated' | 'synthesis'; ts: number } | null;
  mixtureActiveTab?: string;
  curatedReactionId?: string | null;
  synthesisInput?: SlotEntry[] | null;
  synthesisResult?: SynthesisResult | null;
  tutorialState?: { isExpanded: boolean; sceneType: string; scrubPhase: number | null };
}

export function DevDebugPanel({
  combineSlots = [],
  lastSendAction,
  mixtureActiveTab,
  curatedReactionId,
  synthesisInput,
  synthesisResult,
  tutorialState,
}: DevDebugPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-2 right-2 z-50">
      <button
        onClick={() => setOpen(!open)}
        className="px-2 py-1 text-[10px] font-mono bg-muted border border-border rounded shadow-sm hover:bg-muted-foreground/20"
      >
        DBG
      </button>
      {open && (
        <div className="absolute bottom-8 right-0 w-80 max-h-96 overflow-auto bg-background border border-border rounded-lg shadow-lg p-3 text-[10px] font-mono space-y-2">
          <div>
            <strong>CombineLab slots:</strong>{' '}
            {combineSlots.length > 0
              ? combineSlots.map(s => `Z${s.Z}×${s.count}`).join(', ')
              : '(empty)'}
          </div>
          <div>
            <strong>lastSendAction:</strong>{' '}
            {lastSendAction
              ? `${lastSendAction.type} @ ${new Date(lastSendAction.ts).toLocaleTimeString()}`
              : 'null'}
          </div>
          <div>
            <strong>MixtureLab tab:</strong> {mixtureActiveTab ?? '?'}
          </div>
          <div>
            <strong>Curated reactionId:</strong> {curatedReactionId ?? 'null'}
          </div>
          <div>
            <strong>synthesisInput:</strong>{' '}
            {synthesisInput
              ? `${synthesisInput.length} slots → ${formatFormula(synthesisInput)}`
              : 'null'}
          </div>
          {synthesisResult && (
            <div>
              <strong>SynthesisResult:</strong> {synthesisResult.formula} /{' '}
              {synthesisResult.classification} / {synthesisResult.confidence}
            </div>
          )}
          {tutorialState && (
            <div>
              <strong>TutorialCanvas:</strong> expanded={String(tutorialState.isExpanded)}{' '}
              scene={tutorialState.sceneType}{' '}
              scrub={tutorialState.scrubPhase !== null ? `${Math.round(tutorialState.scrubPhase * 100)}%` : 'null'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
