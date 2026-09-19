import { 
  Gender, 
  ActivityLevel, 
  FitnessGoal, 
  DietaryFramework, 
  WorkoutSplitDay, 
  UserProfile 
} from '../types';

export function calculateBMR(
  weightOrGender: number | Gender,
  heightOrWeight: number,
  ageOrHeight: number,
  genderOrAge?: Gender | number
): number {
  let gender: Gender = 'male';
  let weightKg = 75;
  let heightCm = 175;
  let age = 25;

  if (typeof weightOrGender === 'string') {
    gender = weightOrGender;
    weightKg = heightOrWeight;
    heightCm = ageOrHeight;
    age = typeof genderOrAge === 'number' ? genderOrAge : 25;
  } else {
    weightKg = weightOrGender;
    heightCm = heightOrWeight;
    age = ageOrHeight;
    if (typeof genderOrAge === 'string') {
      gender = genderOrAge;
    }
  }

  const base = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  if (gender === 'female') {
    return Math.round(base - 161);
  }
  return Math.round(base + 5);
}

export function getActivityMultiplier(level: ActivityLevel | number): number {
  if (typeof level === 'number') {
    if (level <= 2) return 1.2;
    if (level === 3) return 1.375;
    if (level === 4) return 1.55;
    if (level === 5) return 1.725;
    return 1.9;
  }
  switch (level) {
    case 'sedentary': return 1.2;
    case 'light': return 1.375;
    case 'moderate': return 1.55;
    case 'very_active': return 1.725;
    case 'athlete': return 1.9;
    default: return 1.55;
  }
}

export function calculateTDEE(bmr: number, activityLevelOrDays: ActivityLevel | number): number {
  return Math.round(bmr * getActivityMultiplier(activityLevelOrDays));
}

export function calculateTargetCalories(tdee: number, goal: FitnessGoal): number {
  switch (goal) {
    case 'hypertrophy':
      return Math.round(tdee + 250); // Lean mass building surplus
    case 'fat_loss':
      return Math.round(Math.max(1200, tdee - 450)); // Moderate, muscle-sparing deficit
    case 'strength':
      return Math.round(tdee + 150);
    case 'recomposition':
      return Math.round(tdee);
    case 'endurance':
      return Math.round(tdee);
    default:
      return tdee;
  }
}

export function calculateMacroSplits(
  calories: number,
  weightKg: number,
  framework: DietaryFramework,
  goal: FitnessGoal
): { proteinGrams: number; carbsGrams: number; fatsGrams: number } {
  let proteinPerKg = 2.0; // Standard athletic baseline
  if (goal === 'fat_loss') proteinPerKg = 2.2; // Satiety & nitrogen balance retention
  if (goal === 'hypertrophy') proteinPerKg = 2.0;

  if (framework === 'keto') {
    // 70% Fat, 25% Protein, 5% Carb
    const fatCalories = calories * 0.70;
    const proteinCalories = calories * 0.25;
    const carbCalories = calories * 0.05;
    return {
      proteinGrams: Math.round(proteinCalories / 4),
      carbsGrams: Math.round(carbCalories / 4),
      fatsGrams: Math.round(fatCalories / 9)
    };
  }

  if (framework === 'high_protein') {
    proteinPerKg = 2.4;
  }

  let proteinGrams = Math.round(weightKg * proteinPerKg);
  // Cap protein if it exceeds 45% of total calories to preserve hormonal fats
  if (proteinGrams * 4 > calories * 0.45) {
    proteinGrams = Math.round((calories * 0.45) / 4);
  }

  // Minimum 0.8g fat / kg for testosterone and cellular synthesis
  let fatGrams = Math.round(weightKg * 0.85);
  const remainingCalories = calories - (proteinGrams * 4) - (fatGrams * 9);
  let carbGrams = Math.max(20, Math.round(remainingCalories / 4));

  if (framework === 'vegan') {
    // Slightly higher carbs and lower fats
    fatGrams = Math.round(weightKg * 0.75);
    carbGrams = Math.round((calories - (proteinGrams * 4) - (fatGrams * 9)) / 4);
  }

  return {
    proteinGrams,
    carbsGrams: carbGrams,
    fatsGrams: fatGrams
  };
}

export function calculateMacroDistribution(
  tdee: number,
  weightKg: number,
  goal: FitnessGoal,
  framework: DietaryFramework
): { calories: number; proteinGrams: number; carbsGrams: number; fatsGrams: number } {
  const calories = calculateTargetCalories(tdee, goal);
  const splits = calculateMacroSplits(calories, weightKg, framework, goal);
  return {
    calories,
    ...splits
  };
}

export function calculateBaselineWaterMl(weightKg: number, activityLevel: ActivityLevel): number {
  // Base 35ml per kg + activity allowance
  let baseMl = weightKg * 35;
  if (activityLevel === 'moderate') baseMl += 400;
  if (activityLevel === 'very_active') baseMl += 750;
  if (activityLevel === 'athlete') baseMl += 1000;
  return Math.round(baseMl);
}

export function calculateWaterRequirementMl(weightKg: number, trainingDays: number): number {
  let activity: ActivityLevel = 'moderate';
  if (trainingDays <= 3) activity = 'light';
  else if (trainingDays >= 5) activity = 'very_active';
  return calculateBaselineWaterMl(weightKg, activity);
}

export function calculateEstimated1RM(weightKg: number, reps: number): number {
  if (reps <= 0) return 0;
  if (reps === 1) return weightKg;
  // Brzycki formula
  return Math.round(weightKg * (36 / (37 - reps)));
}

export function calculateLevelFromXp(xp: number): { level: number; currentXp: number; nextLevelXp: number; progressPercent: number } {
  // Level formula: Level n requires (n - 1) * 300 XP
  let level = 1;
  let threshold = 300;
  let accumulated = 0;

  while (xp >= accumulated + threshold) {
    accumulated += threshold;
    level++;
    threshold = Math.round(threshold * 1.25);
  }

  const currentLevelProgress = xp - accumulated;
  const progressPercent = Math.min(100, Math.round((currentLevelProgress / threshold) * 100));

  return {
    level,
    currentXp: currentLevelProgress,
    nextLevelXp: threshold,
    progressPercent
  };
}

export function generateTacticalWeeklySplit(goal: FitnessGoal, experience: string): WorkoutSplitDay[] {
  // 4-Day Upper / Lower for intermediate, or 5-Day PPL for advanced
  if (experience === 'beginner') {
    // 3-Day Full Body
    return [
      {
        dayIndex: 1,
        dayNameEn: 'Alpha: Full Body Foundational',
        dayNameAr: 'ألفا: تمرين الجسم الكامل التأسيسي',
        focusMuscleGroups: ['chest', 'back_upper', 'quads', 'shoulders'],
        isRestDay: false,
        plannedExercises: [
          { exerciseId: 'ch_1', sets: 3, repRange: '6-8' },
          { exerciseId: 'bk_6', sets: 3, repRange: '8-10' },
          { exerciseId: 'lg_1', sets: 3, repRange: '6-8' },
          { exerciseId: 'sh_2', sets: 3, repRange: '12-15' }
        ]
      },
      {
        dayIndex: 2,
        dayNameEn: 'Active Recovery & Core Protocol',
        dayNameAr: 'استشفاء نشط وتدريب الجذع',
        focusMuscleGroups: ['abs'],
        isRestDay: true,
        plannedExercises: []
      },
      {
        dayIndex: 3,
        dayNameEn: 'Bravo: Full Body Hypertrophy',
        dayNameAr: 'برافو: تمرين الجسم الكامل للبناء',
        focusMuscleGroups: ['back_upper', 'hamstrings', 'biceps', 'triceps'],
        isRestDay: false,
        plannedExercises: [
          { exerciseId: 'bk_3', sets: 3, repRange: '8-10' },
          { exerciseId: 'lg_2', sets: 3, repRange: '8-10' },
          { exerciseId: 'arm_1', sets: 3, repRange: '10-12' },
          { exerciseId: 'arm_4', sets: 3, repRange: '12-15' }
        ]
      },
      {
        dayIndex: 4,
        dayNameEn: 'Tactical Regeneration',
        dayNameAr: 'يوم راحة وإعادة شحن',
        focusMuscleGroups: [],
        isRestDay: true,
        plannedExercises: []
      },
      {
        dayIndex: 5,
        dayNameEn: 'Charlie: Kinetic Power & Glutes',
        dayNameAr: 'تشارلي: القوة الديناميكية والساقين',
        focusMuscleGroups: ['quads', 'glutes', 'chest', 'abs'],
        isRestDay: false,
        plannedExercises: [
          { exerciseId: 'lg_4', sets: 3, repRange: '10-12' },
          { exerciseId: 'ch_2', sets: 3, repRange: '8-10' },
          { exerciseId: 'cor_1', sets: 3, repRange: '12-15' },
          { exerciseId: 'lg_8', sets: 3, repRange: '15-20' }
        ]
      },
      {
        dayIndex: 6,
        dayNameEn: 'Rest & Myofascial Reload',
        dayNameAr: 'راحة واسترخاء العضلات',
        focusMuscleGroups: [],
        isRestDay: true,
        plannedExercises: []
      },
      {
        dayIndex: 7,
        dayNameEn: 'Biometric System Check',
        dayNameAr: 'مراجعة المؤشرات والجاهزية',
        focusMuscleGroups: [],
        isRestDay: true,
        plannedExercises: []
      }
    ];
  }

  // 4-Day Upper / Lower Split
  return [
    {
      dayIndex: 1,
      dayNameEn: 'Upper Heavy Protocol (Push + Pull)',
      dayNameAr: 'الجزء العلوي الثقيل (دفع + سحب)',
      focusMuscleGroups: ['chest', 'back_upper', 'shoulders', 'triceps', 'biceps'],
      isRestDay: false,
      plannedExercises: [
        { exerciseId: 'ch_1', sets: 4, repRange: '5-8' },
        { exerciseId: 'bk_3', sets: 4, repRange: '6-8' },
        { exerciseId: 'sh_1', sets: 3, repRange: '6-8' },
        { exerciseId: 'arm_4', sets: 3, repRange: '10-12' },
        { exerciseId: 'arm_1', sets: 3, repRange: '10-12' }
      ]
    },
    {
      dayIndex: 2,
      dayNameEn: 'Lower Kinetic Protocol (Quad + Chain)',
      dayNameAr: 'الجزء السفلي الثقيل (أرجل + أوتار)',
      focusMuscleGroups: ['quads', 'hamstrings', 'glutes', 'calves', 'abs'],
      isRestDay: false,
      plannedExercises: [
        { exerciseId: 'lg_1', sets: 4, repRange: '5-8' },
        { exerciseId: 'lg_2', sets: 3, repRange: '8-10' },
        { exerciseId: 'lg_4', sets: 3, repRange: '10-12' },
        { exerciseId: 'lg_8', sets: 4, repRange: '15-20' },
        { exerciseId: 'cor_1', sets: 3, repRange: '12-15' }
      ]
    },
    {
      dayIndex: 3,
      dayNameEn: 'Cellular Restoration & Mobility',
      dayNameAr: 'استشفاء خلوي ومرونة',
      focusMuscleGroups: [],
      isRestDay: true,
      plannedExercises: []
    },
    {
      dayIndex: 4,
      dayNameEn: 'Upper Hypertrophy Overdrive',
      dayNameAr: 'الجزء العلوي للبناء والتضخيم',
      focusMuscleGroups: ['chest', 'lats', 'shoulders', 'biceps'],
      isRestDay: false,
      plannedExercises: [
        { exerciseId: 'ch_2', sets: 3, repRange: '8-12' },
        { exerciseId: 'bk_2', sets: 3, repRange: '8-10' },
        { exerciseId: 'sh_2', sets: 4, repRange: '12-15' },
        { exerciseId: 'ch_4', sets: 3, repRange: '12-15' },
        { exerciseId: 'arm_3', sets: 3, repRange: '10-12' }
      ]
    },
    {
      dayIndex: 5,
      dayNameEn: 'Lower Density & Posterior Chain',
      dayNameAr: 'الجزء السفلي عالي الكثافة',
      focusMuscleGroups: ['hamstrings', 'quads', 'glutes', 'abs'],
      isRestDay: false,
      plannedExercises: [
        { exerciseId: 'bk_1', sets: 3, repRange: '5-6' },
        { exerciseId: 'lg_3', sets: 3, repRange: '10-12' },
        { exerciseId: 'lg_5', sets: 3, repRange: '10-12' },
        { exerciseId: 'cor_3', sets: 3, repRange: '8-12' }
      ]
    },
    {
      dayIndex: 6,
      dayNameEn: 'Metabolic Reload / Rest',
      dayNameAr: 'راحة واستعادة الطاقة',
      focusMuscleGroups: [],
      isRestDay: true,
      plannedExercises: []
    },
    {
      dayIndex: 7,
      dayNameEn: 'Biometric System Sync',
      dayNameAr: 'مزامنة المقاييس والأهداف',
      focusMuscleGroups: [],
      isRestDay: true,
      plannedExercises: []
    }
  ];
}
