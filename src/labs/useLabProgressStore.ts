import { useState, useCallback, useEffect } from 'react';
import type { LabProgress } from './labTypes';

const STORAGE_KEY = 'lab_workbook_progress';

function loadProgress(): Record<string, LabProgress> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProgress(data: Record<string, LabProgress>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* silent */ }
}

export function useLabProgressStore() {
  const [progress, setProgress] = useState<Record<string, LabProgress>>(loadProgress);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const startLab = useCallback((labId: string) => {
    setProgress(prev => {
      if (prev[labId] && !prev[labId].completed) return prev; // resume existing
      return {
        ...prev,
        [labId]: { labId, currentStep: 0, answers: {}, completed: false, startedAt: new Date().toISOString() },
      };
    });
  }, []);

  const submitAnswer = useCallback((labId: string, stepIndex: number, answer: string) => {
    setProgress(prev => {
      const existing = prev[labId];
      if (!existing) return prev;
      const answers = { ...existing.answers, [stepIndex]: answer };
      const currentStep = Math.max(existing.currentStep, stepIndex + 1);
      return { ...prev, [labId]: { ...existing, answers, currentStep } };
    });
  }, []);

  const completeLab = useCallback((labId: string) => {
    setProgress(prev => {
      const existing = prev[labId];
      if (!existing) return prev;
      return { ...prev, [labId]: { ...existing, completed: true, completedAt: new Date().toISOString() } };
    });
  }, []);

  const resetLab = useCallback((labId: string) => {
    setProgress(prev => {
      const next = { ...prev };
      delete next[labId];
      return next;
    });
  }, []);

  const getProgress = useCallback((labId: string): LabProgress | null => {
    return progress[labId] ?? null;
  }, [progress]);

  return { progress, startLab, submitAnswer, completeLab, resetLab, getProgress };
}
