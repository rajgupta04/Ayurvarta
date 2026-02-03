// Commit on 2026-03-16
// Commit on 2026-02-07
export const mockDietPlan = {
	summary:
		'Based on your answers, your constitution leans Pitta with a Vata influence. Your agni (digestive fire) shows signs of being tikshna (sharp). We will emphasize cooling, grounding, and steady routines.',

	doshaProfile: {
		dominant: 'Pitta',
		secondary: 'Vata',
		agni: 'Tikshna (sharp)',
		goals: ['Cool and calm the system', 'Support hydration and lubrication', 'Stabilize energy and mood'],
	},

	rasaFocus: {
		favor: ['Sweet', 'Bitter', 'Astringent'],
		reduce: ['Sour', 'Salty', 'Pungent'],
	},

	gunaFocus: {
		favor: ['Cooling', 'Grounding', 'Unctuous (oily)'],
		reduce: ['Hot', 'Sharp', 'Dry'],
	},

	dailyMealPlan: {
		title: 'Daily Meal Rhythm',
		meals: [
			{
				name: 'Breakfast',
				description: 'Warm porridge with soaked raisins, ghee, and cardamom; or stewed apples/pears. Avoid iced drinks.',
			},
			{
				name: 'Lunch',
				description: 'Your main meal. Rice or quinoa with mung dal khichdi, sautéed greens, cucumber raita, and cilantro chutney.',
			},
			{
				name: 'Dinner',
				description: 'Light, early dinner. Vegetable soups, soft grains, lightly spiced. Aim to finish by 7:30pm.',
			},
		],
	},

	recommendedFoods: {
		title: 'Foods to Favor',
		icon: 'programs-icon.png',
		items: [
			'Grains: rice, oats, wheat (in moderation), barley',
			'Legumes: mung dal, masoor, split lentils; well-cooked with ghee',
			'Vegetables: leafy greens, asparagus, zucchini, cucumber, sweet potato, pumpkin',
			'Fruits: sweet ripe fruits—mango, pear, pomegranate, melon, grapes (in moderation)',
			'Dairy: cooling dairy like milk (warm), ghee; avoid sour yogurt at night',
			'Fats: ghee, coconut oil, olive oil (moderation)',
			'Herbs/Spices (cooling): coriander, fennel, mint, cilantro, cardamom, small cumin',
		],
	},

	foodsToAvoid: {
		title: 'Reduce or Avoid',
		icon: 'support-icon.png',
		items: [
			'Very spicy: chili, mustard seeds, excess ginger/black pepper',
			'Sour/fermented: vinegar, pickles, sour yogurt (especially at night)',
			'Salty and fried foods; heavy deep-fried snacks',
			'Red meat; very aged cheeses',
			'Iced drinks; caffeinated energy drinks; alcohol (especially sour wines)',
		],
	},

	lifestyleTips: {
		title: 'Lifestyle & Dinacharya',
		icon: 'consultation-icon.png',
		items: [
			'Wake early; gentle cooling pranayama (sheetali/sheetkari) and meditation',
			'Self-massage (abhyanga) with coconut or sunflower oil 2–3×/week',
			'Avoid midday sun; favor moonlight walks and calming evening routines',
			'Regular meal times; no heavy work immediately after eating',
		],
	},

	seasonalTips: {
		title: 'Seasonal Guidance (Ritucharya)',
		tips: [
			{ season: 'Summer', note: 'Favor cooling foods (cucumber, melon) and herbs (mint, coriander); avoid chili and vinegar.' },
			{ season: 'Monsoon', note: 'Light, warm, digestible meals; ginger-fennel tea (mild) to support agni without overheating.' },
			{ season: 'Autumn', note: 'Grounding, unctuous foods with ghee; stabilize with regular routines and adequate rest.' },
		],
	},

	hydration: {
		title: 'Hydration',
		points: [
			'Sip warm or room-temperature water through the day; avoid ice-cold beverages.',
			'Try cooling infusions: fennel-coriander tea, or water infused with mint and a slice of lime.',
		],
	},

	spices: {
		title: 'Spice Guidance',
		favor: ['Coriander', 'Fennel', 'Mint', 'Cilantro', 'Cardamom'],
		moderate: ['Cumin', 'Turmeric', 'Black pepper (small)'],
		reduce: ['Chili',