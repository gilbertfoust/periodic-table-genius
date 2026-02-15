import { useState } from 'react';
import type { LearningLevel } from '@/types/learningLayers';

interface ObservationRecorderProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  submitted: boolean;
  placeholder?: string;
}

export function ObservationRecorder({ value, onChange, onSubmit, submitted, placeholder }: ObservationRecorderProps) {
  return (
    <div className="space-y-1.5">
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={submitted}
        placeholder={placeholder || 'Type your observation here...'}
        className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none resize-none h-20 disabled:opacity-60"
        onBlur={() => {
          // Auto-save draft to localStorage on blur
          if (value.trim()) {
            try { localStorage.setItem('lab_draft_observation', value); } catch {}
          }
        }}
      />
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{value.length} chars</span>
        {!submitted && (
          <button
            onClick={onSubmit}
            disabled={!value.trim()}
            className="text-[10px] px-2.5 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
          >
            Submit
          </button>
        )}
        {submitted && <span className="text-[10px] text-emerald-400">✓ Saved</span>}
      </div>
    </div>
  );
}
