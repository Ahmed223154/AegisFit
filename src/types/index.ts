export type Language = 'en' | 'ar';
export type UnitSystem = 'metric' | 'imperial';

export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active' | 'athlete';
export type FitnessGoal = 'hypertrophy' | 'fat_loss' | 'strength' | 'endurance' | 'recomposition';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';
export type DietaryFramework = 'balanced' | 'high_protein' | 'keto' | 'mediterranean' | 'vegan' | 'flexible';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  bodyFatPercent?: number;
  trainingDaysPerWeek?: number;
  activityLevel: ActivityLevel;
  primaryGoal: FitnessGoal;
  experienceLevel: ExperienceLevel;
  dietaryFramework: DietaryFramework;
  limitations: string[];
  unitSystem: UnitSystem;
  language: Language;
  onboardingCompleted: boolean;
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProteinGrams: number;
  targetCarbsGrams: number;
  targetFatsGrams: number;
  targetWaterMl: number;
  currentLevel: number;
  totalXp: number;
  streakDays: number;
  lastActiveDate: string;
}

export type MuscleGroup = 
  | 'chest' 
  | 'back_upper' 
  | 'lats' 
  | 'shoulders' 
  | 'biceps' 
  | 'triceps' 
  | 'forearms' 
  | 'quads' 
  | 'hamstrings' 
  | 'calves' 
  | 'glutes' 
  | 'abs' 
  | 'obliques';

export interface Exercise {
  id: string;
  nameEn: string;
  nameAr: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  category: 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructionsEn: string;
  instructionsAr: string;
  targetRepRange: string;
  defaultSets: number;
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  previousWeightKg?: number;
  previousReps?: number;
}

export interface LoggedExercise {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  title: string;
  date: string; // ISO format YYYY-MM-DD
  durationMinutes: number;
  totalVolumeKg: number;
  exercises: LoggedExercise[];
  rating: number; // 1-5
  notes?: string;
  xpEarned: number;
}

export interface WorkoutSplitDay {
  dayIndex: number; // 1 to 7
  dayNameEn: string;
  dayNameAr: string;
  focusMuscleGroups: MuscleGroup[];
  plannedExercises: {
    exerciseId: string;
    sets: number;
    repRange: string;
  }[];
  isRestDay: boolean;
}

export interface Trophy {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  category: 'workout' | 'nutrition' | 'water' | 'streak' | 'supplement';
  tier: 'bronze' | 'silver' | 'gold' | 'cyber';
  xpReward: number;
  iconName: string;
  unlockedAt?: string; // null if locked
  progress: number; // 0 - 100
}

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface FoodItem {
  id: string;
  nameEn: string;
  nameAr: string;
  servingSize: string;
  servingGrams: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  fiberGrams?: number;
  category: 'protein' | 'carb' | 'fat' | 'veg' | 'fruit' | 'dairy' | 'snack';
}

export interface LoggedFoodEntry {
  id: string;
  foodId?: string;
  name: string;
  servingCount: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  mealCategory: MealCategory;
  loggedAt: string; // ISO
}

export interface DailyNutritionLog {
  date: string; // YYYY-MM-DD
  entries: LoggedFoodEntry[];
}

export type SupplementTiming = 'morning' | 'pre_workout' | 'post_workout' | 'with_meals' | 'bedtime';

export interface SupplementProtocol {
  id: string;
  nameEn: string;
  nameAr: string;
  dosage: string;
  timing: SupplementTiming;
  purposeEn: string;
  purposeAr: string;
  evidenceGrade: 'A' | 'B' | 'C';
  targetGoals: FitnessGoal[];
  reminderTime?: string; // HH:mm
  active: boolean;
}

export interface DailySupplementLog {
  date: string; // YYYY-MM-DD
  checkedSupplementIds: string[];
}

export interface BiomarkerDefinition {
  id: string;
  name: string;
  unit: string;
  optimalRangeMin: number;
  optimalRangeMax: number;
  descriptionEn: string;
  descriptionAr: string;
  adviceLowEn: string;
  adviceLowAr: string;
  adviceHighEn: string;
  adviceHighAr: string;
}

export interface BiomarkerRecord {
  id: string;
  biomarkerId: string;
  value: number;
  date: string; // YYYY-MM-DD
  status: 'low' | 'optimal' | 'high';
  notes?: string;
}

export interface WaterLog {
  date: string; // YYYY-MM-DD
  currentMl: number;
  targetMl: number;
  entries: {
    id: string;
    timestamp: string;
    amountMl: number;
  }[];
}

export interface BodyweightEntry {
  id: string;
  date: string;
  weightKg: number;
}

export interface VisionFoodAnalysisResult {
  foodName: string;
  portionEstimate: string;
  confidence: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  recommendation: 'consume_entirely' | 'portion_down' | 'skip_or_swap';
  recommendationTextEn: string;
  recommendationTextAr: string;
  macroRatioAnalysis: string;
}
