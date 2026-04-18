// Commit on 2026-03-16
// Commit on 2026-02-07
export const mockDietPlan = {
  summary:
    'Based on your answers, your constitution leans Pitta with a Vata influence. Your agni currently appears strong, so we focus on cooling and grounding routines.',

  doshaProfile: {
    dominant: 'Pitta',
    secondary: 'Vata',
    agni: 'Tikshna (strong)',
    goals: ['Cool and calm the system', 'Support hydration', 'Stabilize daily energy'],
  },

  rasaFocus: {
    favor: ['Sweet', 'Bitter', 'Astringent'],
    reduce: ['Sour', 'Salty', 'Pungent'],
  },

  gunaFocus: {
    favor: ['Cooling', 'Grounding', 'Unctuous'],
    reduce: ['Hot', 'Sharp', 'Dry'],
  },

  dailyMealPlan: {
    title: 'Daily Meal Rhythm',
    meals: [
      {
        name: 'Breakfast',
        description: 'Warm porridge with cardamom and soaked raisins; avoid iced drinks.',
      },
      {
        name: 'Lunch',
        description: 'Main meal with rice, mung dal, seasonal vegetables, and mild spices.',
      },
      {
        name: 'Dinner',
        description: 'Light and early dinner such as soup with soft grains.',
      },
    ],
  },

  recommendedFoods: {
    title: 'Foods to Favor',
    icon: 'programs-icon.png',
    items: [
      'Rice, oats, and barley',
      'Mung dal and split lentils',
      'Leafy greens, zucchini, cucumber',
      'Sweet ripe fruits in moderation',
      'Cooling herbs: coriander, fennel, mint',
    ],
  },

  foodsToAvoid: {
    title: 'Reduce or Avoid',
    icon: 'support-icon.png',
    items: [
      'Very spicy and deep-fried foods',
      'Excess sour and salty foods',
      'Iced drinks and energy drinks',
      'Heavy late-night meals',
    ],
  },

  lifestyleTips: {
    title: 'Lifestyle & Dinacharya',
    icon: 'consultation-icon.png',
    items: [
      'Keep fixed meal timings',
      'Practice calming breathing in the evening',
      'Take short walks after meals',
      'Prioritize consistent sleep schedule',
    ],
  },

  seasonalTips: {
    title: 'Seasonal Guidance',
    tips: [
      { season: 'Summer', note: 'Favor cooling foods and hydration.' },
      { season: 'Monsoon', note: 'Keep meals warm, light, and easy to digest.' },
      { season: 'Winter', note: 'Use nourishing warm meals with mild spices.' },
    ],
  },

  hydration: {
    title: 'Hydration',
    points: [
      'Sip warm or room-temperature water through the day.',
      'Use mild herbal infusions like fennel-coriander water.',
    ],
  },

  spices: {
    title: 'Spice Guidance',
    favor: ['Coriander', 'Fennel', 'Mint', 'Cardamom'],
    moderate: ['Cumin', 'Turmeric'],
    reduce: ['Chili', 'Mustard seeds'],
  },
};
