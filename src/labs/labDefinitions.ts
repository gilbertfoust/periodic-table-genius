import type { LabDefinition } from './labTypes';

export const LAB_DEFINITIONS: LabDefinition[] = [
  {
    id: 'ionic_na_cl',
    title: 'Ionic Bond Formation: Sodium & Chlorine',
    levelRecommendation: 'Beginner → Intermediate',
    objectives: [
      'Predict bond type using electronegativity.',
      'Observe electron transfer in 3D model.',
      'Explain why ions form.',
    ],
    steps: [
      { type: 'predict', prompt: 'Before running the 3D model, what bond type do you expect between Na and Cl?', options: ['Ionic', 'Covalent', 'Metallic', 'Uncertain'] },
      { type: 'observe3D', prompt: 'Run the bond formation animation. What happens to the valence electron?', requiredScene: 'bond' },
      { type: 'record', prompt: 'Record the electron counts before and after bonding for Na and Cl.' },
      { type: 'explain', prompt: 'Why does sodium lose an electron while chlorine gains one?' },
      { type: 'reflect', prompt: 'How would this differ for Fe + O?' },
    ],
    presetZs: [11, 17],
    expectedBondType: 'Ionic',
  },
  {
    id: 'covalent_c_o',
    title: 'Polar Covalent Bond: Carbon & Oxygen',
    levelRecommendation: 'Beginner → Intermediate',
    objectives: [
      'Understand polar covalent bonding.',
      'Observe electron sharing in 3D.',
      'Explain the role of EN difference.',
    ],
    steps: [
      { type: 'predict', prompt: 'What type of bond do you expect between C and O?', options: ['Ionic', 'Polar covalent', 'Nonpolar covalent', 'Uncertain'] },
      { type: 'observe3D', prompt: 'Watch the electron sharing animation. Notice the electron cloud.', requiredScene: 'bond' },
      { type: 'record', prompt: 'Note the EN delta and dipole direction from the 3D view.' },
      { type: 'explain', prompt: 'Why do C and O share electrons rather than transfer them?' },
      { type: 'reflect', prompt: 'Compare this to Na + Cl. What changes when EN difference is larger?' },
    ],
    presetZs: [6, 8],
    expectedBondType: 'Polar covalent',
  },
  {
    id: 'uncertain_fe_o',
    title: 'Transition Metal Uncertainty: Iron & Oxygen',
    levelRecommendation: 'Intermediate → Advanced',
    objectives: [
      'Recognize when predictions are uncertain.',
      'Identify transition metal complications.',
      'Think critically about model limitations.',
    ],
    steps: [
      { type: 'predict', prompt: 'What bond type do you predict for Fe + O?', options: ['Ionic', 'Covalent', 'Uncertain', 'Metallic'] },
      { type: 'observe3D', prompt: 'Notice the assumptions warning in the 3D view. What does it say?', requiredScene: 'bond' },
      { type: 'record', prompt: 'List the uncertainty flags shown for this pair.' },
      { type: 'explain', prompt: 'Why is the bond type hard to predict for iron?' },
      { type: 'reflect', prompt: 'What additional information would help make a more confident prediction?' },
    ],
    presetZs: [26, 8],
    // No expectedBondType — uncertain
  },
  {
    id: 'precip_ag_cl',
    title: 'Precipitation Reaction: Silver Nitrate & Sodium Chloride',
    levelRecommendation: 'Beginner → Intermediate',
    objectives: [
      'Predict what happens when Ag⁺ meets Cl⁻.',
      'Observe lattice formation in 3D.',
      'Connect precipitation to solubility.',
    ],
    steps: [
      { type: 'predict', prompt: 'What will happen when Ag⁺ meets Cl⁻ in solution?', options: ['White precipitate forms', 'Gas is released', 'Nothing happens', 'Solution turns blue'] },
      { type: 'observe3D', prompt: 'Watch the lattice form in the 3D view. Describe the repeating pattern.', requiredScene: 'lattice' },
      { type: 'record', prompt: 'Describe the 3D structure you see — alternating ions forming a crystal.' },
      { type: 'explain', prompt: 'Why does AgCl precipitate while NaCl stays in solution?' },
      { type: 'reflect', prompt: 'Name another salt that is insoluble in water.' },
    ],
    presetZs: [47, 17],
    presetReactionId: 'precip_agcl',
    expectedBondType: 'Ionic',
  },
];
