

# Step 8.1 Hotfix: Fix 3 Live UI Bugs + Dev Debug Panel

## Two Required Edits (from approval)

### Edit 1: Deep-clone synthesisInput on every send

In `src/pages/Index.tsx`, the `handleSendToSynthesis` callback must deep-clone the slots array so React always sees a new reference and downstream effects fire reliably:

```
setSynthesisInput(slots.map(s => ({ ...s })));
```

This ensures every "Send to Synthesis" click creates fresh `SlotEntry` objects, guaranteeing `useEffect` in `MixtureLab` and `SynthesisPanel` always triggers.

### Edit 2: Count-truth headline in CombineLab

In `src/components/CombineLab/CombineLab.tsx`, when any slot has `count > 1` or there are 3+ filled atoms, the headline formula must always be `formatFormula(slotEntries)` -- not dependent on whether `synthesize()` succeeds or what `prediction.predictedOutcome` says. Classification/confidence badges can still come from `synthesize()`, and `prediction.predictedOutcome` remains as secondary "Bond tendency" text.

---

## Full Changes (approved as written)

### A. Dev Runtime Debug Panel

**New file: `src/components/DevDebugPanel.tsx`**
- Small togglable panel (bottom-right, collapsed by default via "DBG" button)
- Displays: CombineLab slots, lastSendAction + timestamp, MixtureLab activeTab, curated reactionId, synthesisInput length + formula, SynthesisResult fields, TutorialCanvas isExpanded/sceneType/scrubPhase

**`src/pages/Index.tsx`** changes:
- Add `lastSendAction` state: `{ type: 'curated' | 'synthesis'; ts: number } | null`
- Set in `handleSendToMixtureLab` (type: 'curated') and `handleSendToSynthesis` (type: 'synthesis')
- Render `DevDebugPanel` at bottom of page with all relevant state

### B. Count-aware headline (Edit 2 detail)

**`src/components/CombineLab/CombineLab.tsx`**:
1. Import `formatFormula` and `synthesize` from `synthesisEngine`
2. Add prop: `primaryPair: PairAnalysis | null` (from `useAnalysis()` via Index)
3. Compute `hasMultipleAtoms`: true when any filled slot has `count > 1` OR `slotEntries.length >= 3`
4. When `hasMultipleAtoms`:
   - Headline formula = `formatFormula(slotEntries)` (always, unconditionally)
   - Run `synthesize(slotEntries, primaryPair)` for classification/confidence badges
   - Show `prediction.predictedOutcome` as secondary "Bond tendency" line
5. When not `hasMultipleAtoms`: keep current `prediction.predictedOutcome` as headline (existing behavior)

**`src/pages/Index.tsx`**: Pass `primaryPair={primaryPair}` to `CombineLab`

### C. Send-to-Lab fix (Edit 1 detail)

**`src/pages/Index.tsx`**:
- `handleSendToSynthesis`: `setSynthesisInput(slots.map(s => ({ ...s })))` -- deep clone
- `handleSendToMixtureLab`: also clears `synthesisInput` to null (existing behavior, kept)
- `handleSendToSynthesis`: also clears `prefillReactionId` to null (existing behavior, kept)

MixtureLab and SynthesisPanel already have controlled tabs and `useEffect` on `synthesisInput`/`initialSlots`. The deep-clone guarantees new references, so no further changes needed there.

### D. Scrubber persistence for Why/How playback

**`src/components/TutorialCanvas/SceneControls.tsx`**:
- Remove `onValueCommit` handler from the scrubber slider (line 78). Currently it resets `scrubPhase` to null on release, which defeats timeline step clicks.
- Play button behavior: clicking Play sets `scrubPhase: null, paused: false` (clears scrub and resumes). Clicking Pause sets `paused: true` without touching `scrubPhase`.

This makes the Why/How timeline steps actually stick when clicked (they set `scrubPhase` and `paused: true`), and scrubbing persists until the user explicitly presses Play.

### Files Changed Summary

| File | Change |
|------|--------|
| `src/components/DevDebugPanel.tsx` | New -- togglable debug panel |
| `src/components/CombineLab/CombineLab.tsx` | Add primaryPair prop, count-truth headline via formatFormula, synthesize for classification |
| `src/pages/Index.tsx` | Deep-clone synthesisInput, track lastSendAction, pass primaryPair to CombineLab, render DevDebugPanel |
| `src/components/TutorialCanvas/SceneControls.tsx` | Remove onValueCommit from scrubber; Play clears scrubPhase |

