// Commit on 2026-03-14
// Commit on 2026-02-08
// Mocked dashboard data; replace with real API later
export const userProfile = {
  name: 'Aryan Mahendru',
  avatar: '/images/logo.png',
  age: 24,
  gender: 'Male',
  heightCm: 178,
  weightKg: 72,
};

export const currentDosha = { dominant: 'Pitta', blend: { Vata: 2, Pitta: 4, Kapha: 1 } };

export const currentDietPlan = {
  title: 'Cooling Pitta-Pacifying Plan',
  nextMeal: 'Lunch: Quinoa with steamed greens and coriander chutney',
  hydration: 'Cumin-coriander-fennel tea 2x today',
};

export const dailyStats = {
  sleepHours: 7.2,
  bowelMovement: 'Regular — once daily, soft-formed',
  waterIntakeL: 2.3,
};

export const nutrientsSuggested = [
  { name: 'Omega-3', reason: 'Reduce inflammation' },
  { name: 'Magnesium', reason: 'Sleep and muscle relaxation' },
  { name: 'Triphala', reason: 'Gut motility and detox' },
];

export const improvementSeries = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
  energy: [50, 58, 64, 68, 71, 76], // out of 100
  digestion: [45, 52, 60, 63, 67, 72],
  mood: [48, 54, 57, 61, 66, 71],
};

export const sleepSeries = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  hours: [7, 6.5, 7.5, 7, 8, 7.2, 6.8],
};

export const records = [
  { date: '2025-09-10', note: 'Started coriander water in mornings' },
  { date: '2025-09-14', note: 'Reduced chili and sour foods' },
  { date: '202