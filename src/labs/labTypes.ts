export type LabStepType = 'predict' | 'observe3D' | 'record' | 'explain' | 'reflect';

export type SceneTypeKey = 'atom' | 'bond' | 'lattice';

export interface LabStep {
  type: LabStepType;
  prompt: string;
  options?: string[]; // only for predict steps with multiple choice
  requiredScene?: SceneTypeKey; // for observe3D gating
}

export interface LabDefinition {
  id: string;
  title: string;
  levelRecommendation: string;
  objectives: string[];
  steps: LabStep[];
  presetZs: number[];
  presetReactionId?: string;
  expectedBondType?: string;
}

export interface LabProgress {
  labId: string;
  currentStep: number;
  answers: Record<number, string>;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
}
