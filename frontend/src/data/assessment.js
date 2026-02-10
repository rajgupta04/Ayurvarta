// Commit on 2026-03-17
// Commit on 2026-02-06
export const PRAKRITI_QUESTIONS = [
  {
    id: 'pr1',
    q: 'What best describes your body frame?',
    options: [
      'Lean, light, low body weight, thin bones', // Vata
      'Medium build, muscular, strong metabolism', // Pitta
      'Broad, heavy, solid body structure' // Kapha
    ]
  },
  {
    id: 'pr2',
    q: 'How is your skin usually?',
    options: [
      'Dry, rough, cool, prone to cracks', // Vata
      'Warm, soft, reddish, prone to acne/rashes', // Pitta
      'Smooth, oily, pale, thick' // Kapha
    ]
  },
  {
    id: 'pr3',
    q: 'How is your appetite and digestion?',
    options: [
      'Irregular, variable hunger, sometimes bloating', // Vata
      'Strong hunger, feels hungry often, may get acidity', // Pitta
      'Slow digestion, heavy feeling after meals' // Kapha
    ]
  },
  {
    id: 'pr4',
    q: 'How do you usually sleep?',
    options: [
      'Light sleeper, disturbed, may struggle with insomnia', // Vata
      'Moderate sleep, can wake up easily', // Pitta
      'Deep, heavy, long sleep, difficulty waking up' // Kapha
    ]
  },
  {
    id: 'pr5',
    q: 'How do you respond to stress?',
    options: [
      'Worry, anxiety, overthinking', // Vata
      'Irritability, anger, impatience', // Pitta
      'Calm, slow to react, passive' // Kapha
    ]
  },
  {
    id: 'pr6',
    q: 'What is your energy pattern?',
    options: [
      'Quick bursts of energy, but tire easily', // Vata
      'Consistent, strong, can overexert', // Pitta
      'Steady, long-lasting, but slow to start' // Kapha
    ]
  },
  {
    id: 'pr7',
    q: 'How would others describe your personality?',
    options: [
      'Creative, artistic, enthusiastic, sensitive', // Vata
      'Intelligent, logical, ambitious, outspoken', // Pitta
      'Patient, generous, calm, grounded' // Kapha
    ]
  }
];

export const VIKRITI_QUESTIONS = [
  {
    id: 'vk1',
    q: 'How would you describe your appetite in general?',
    options: [
      'Regular, balanced, predictable (Sama)',
      'Irregular — sometimes very hungry, sometimes no hunger (Vishama)',
      'Very strong, I feel hungry again quickly (Tikshna)',
      'Weak, I rarely feel hungry (Manda)'
    ]
  },
  {
    id: 'vk2',
    q: 'How do you usually feel after eating a full meal?',
    options: [
      'Comfortable, light, satisfied (Sama)',
      'Sometimes bloated, sometimes fine (Vishama)',
      'Still hungry or slight burning sensation (Tikshna)',
      'Heavy, sluggish, sleepy (Manda)'
    ]
  },
  {
    id: 'vk3',
    q: 'What are your bowel movements typically like?',
    options: [
      'Regular, well-formed (Sama)',
      'Irregular — constipation or loose stools (Vishama)',
      'Frequent, loose, sometimes burning (Tikshna)',
      'Slow, sticky, incomplete (Manda)'
    ]
  },
  {
    id: 'vk4',
    q: 'How often do you experience digestive issues (gas, acidity, indigestion)?',
    options: [
      'Rarely, digestion is smooth (Sama)',
      'Quite often, unpredictable (Vishama)',
      'Frequent burning, acidity, loose stools (Tikshna)',
      'Indigestion, heaviness, sluggish digestion (Manda)'
    ]
  },
  {
    id: 'vk5',
    q: 'How is your energy throughout the day?',
    options: [
      'Stable and refreshed (Sama)',
      'Unpredictable, fluctuates a lot (Vishama)',
      'High energy but burns out quickly (Tikshna)',
      'Often low, sluggish (Manda)'
    ]
  }
];

export const AGNI_QUESTIONS = [
  { id: 'ag1', q: 'Hunger before meals is…', options: ['Unpredictable', 'Strong on time', 'Rare but heavy feeling'] },
  { id: 'ag2', q: 'After eating you feel…', options: ['Gassy or windy', 'Warm or heartburn', 'Heavy or sleepy'] },
  { id: 'ag3', q: 'Bowel movements are…', options: ['Dry/constipated', 'Loose/urgent', 'Slow/regular but heavy'] },
  { id: 'ag4', q: 'Cravings are mostly for…', options: ['Warm, oily foods', 'Cool, sweet foods', 'Light, bitter foods'] },
  { id: 'ag5', q: 'Thirst across the day is…', options: ['Variable', 'High', 'Low'] }
];


// Map 3-option Prakriti question with dynamic images following naming: pq{questionNumber}op{optionNumber}.png
// Example: second question option 1 => /images/pq2op1.png
export const toTriCardOptions = (options, questionId) => {
  // Expect questionId like 'pr3' -> extract number 3
  let qNum = 0;
  if (typeof questionId === 'string') {
    const m = questionId.match(/pr(\d+)/i);
    if (m) qNum = parseInt(m[1], 10);
  }
  return options.slice(0, 3).map((label, idx) => {
    const image = qNum
      ? `/images/pq${qNum}op${idx + 1}.png`
      : ['/images/thin-silhouette.png', '/images/medium-silhouette.png', '/images/big-silhouette.png'][idx];
    return { label, value: label, image };
  });
};

// Helper to map 4-option Agni-style items to radio list (no images)
export const toRadioOptions = (options) => options.map((label) => ({ label, value: label }));


// Commit on 2026-02-10 
