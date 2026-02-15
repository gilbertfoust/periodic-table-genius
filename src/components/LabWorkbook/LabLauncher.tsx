import { useCallback } from 'react';
import { LAB_DEFINITIONS } from '@/labs/labDefinitions';
import { useLabProgressStore } from '@/labs/useLabProgressStore';
import { useSelection } from '@/state/selectionStore';
import { Button } from '@/components/ui/button';
import { BookOpen, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LabLauncherProps {
  onLabStart: (labId: string) => void;
  onStartPrecipLab?: (reactionId: string) => void;
}

export function LabLauncher({ onLabStart, onStartPrecipLab }: LabLauncherProps) {
  const { setSelectedElements } = useSelection();
  const { getProgress, startLab } = useLabProgressStore();

  const handleLaunch = useCallback((labId: string) => {
    const lab = LAB_DEFINITIONS.find(l => l.id === labId);
    if (!lab) return;

    // Set selection state
    setSelectedElements(lab.presetZs);

    // If precipitation lab, prefill MixtureLab
    if (lab.presetReactionId && onStartPrecipLab) {
      onStartPrecipLab(lab.presetReactionId);
    }

    // Start lab progress
    startLab(labId);
    onLabStart(labId);
  }, [setSelectedElements, onStartPrecipLab, startLab, onLabStart]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
          <BookOpen className="h-3 w-3" />
          Lab Workbook
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-popover border-border z-50">
        {LAB_DEFINITIONS.map(lab => {
          const progress = getProgress(lab.id);
          return (
            <DropdownMenuItem
              key={lab.id}
              onClick={() => handleLaunch(lab.id)}
              className="text-xs cursor-pointer flex items-center justify-between gap-3"
            >
              <span>{lab.title}</span>
              {progress?.completed && <Check className="h-3 w-3 text-emerald-400" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
