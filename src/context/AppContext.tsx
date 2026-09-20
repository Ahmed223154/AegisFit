import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import { 
  UserProfile, 
  Language, 
  UnitSystem, 
  Exercise, 
  WorkoutSession, 
  WorkoutSplitDay, 
  Trophy, 
  LoggedFoodEntry, 
  DailyNutritionLog, 
  SupplementProtocol, 
  BiomarkerRecord, 
  WaterLog, 
  BodyweightEntry, 
  MuscleGroup
} from '../types';
import { 
  SEED_EXERCISES, 
  SEED_SUPPLEMENTS, 
  SEED_TROPHIES 
} from '../data/seedData';
import { 
  calculateBMR, 
  calculateTDEE, 
  calculateTargetCalories, 
  calculateMacroSplits, 
  calculateBaselineWaterMl, 
  calculateLevelFromXp, 
  generateTacticalWeeklySplit 
} from '../utils/calculations';
import { 
  StorageKeys, 
  getItem, 
  saveItem 
} from '../utils/storage';
import { translations } from '../i18n/translations';
import { scheduleLocalNotification } from '../utils/nativeCapabilities';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];
  unitSystem: UnitSystem;
  setUnitSystem: (sys: UnitSystem) => void;
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  resetOnboarding: () => void;
  showSurveyModal: boolean;
  setShowSurveyModal: (show: boolean) => void;

  // Gym & Workouts
  exercises: Exercise[];
  addCustomExercise: (exercise: Exercise) => Promise<void>;
  weeklySplit: WorkoutSplitDay[];
  regenerateSplit: () => Promise<void>;
  workouts: WorkoutSession[];
  activeWorkout: WorkoutSession | null;
  startActiveWorkout: (splitDay?: WorkoutSplitDay) => void;
  updateActiveWorkout: (workout: WorkoutSession) => void;
  finishActiveWorkout: () => Promise<void>;
  discardActiveWorkout: () => void;
  trophies: Trophy[];

  // Nutrition
  todayNutrition: DailyNutritionLog;
  addFoodEntry: (entry: Omit<LoggedFoodEntry, 'id' | 'loggedAt'>) => Promise<void>;
  deleteFoodEntry: (entryId: string) => Promise<void>;

  // Supplements
  supplements: SupplementProtocol[];
  toggleSupplementActive: (id: string) => Promise<void>;
  todaySupplementChecklist: string[];
  toggleSupplementCheck: (id: string) => Promise<void>;

  // Biomarkers
  biomarkerRecords: BiomarkerRecord[];
  addBiomarkerRecord: (record: Omit<BiomarkerRecord, 'id'>) => Promise<void>;
  deleteBiomarkerRecord: (id: string) => Promise<void>;

  // Water
  waterLog: WaterLog;
  addWaterMl: (amountMl: number) => Promise<void>;
  hourlyWaterAlerts: boolean;
  setHourlyWaterAlerts: (enabled: boolean) => void;

  // Bodyweight
  bodyweightHistory: BodyweightEntry[];
  logBodyweight: (weightKg: number) => Promise<void>;

  // Gamification & telemetry
  bannerMessage: { text: string; subtext?: string; type: 'xp' | 'trophy' | 'info' } | null;
  dismissBanner: () => void;
  awardXp: (amount: number, reason: string) => Promise<void>;
  getWeeklyMuscleSetCounts: () => Record<MuscleGroup, number>;
  logQuickSet: (exerciseId: string, weightKg?: number, reps?: number) => Promise<void>;

  // Data management
  resetAllData: () => Promise<void>;
  exportAppDataJson: () => Promise<string>;
  importAppDataJson: (jsonStr: string) => Promise<boolean>;
}

const DEFAULT_PROFILE: UserProfile = {
  id: 'aegis_user_1',
  name: 'Athlete',
  age: 26,
  gender: 'male',
  heightCm: 178,
  weightKg: 78.0,
  targetWeightKg: 80.0,
  activityLevel: 'moderate',
  primaryGoal: 'hypertrophy',
  experienceLevel: 'intermediate',
  dietaryFramework: 'high_protein',
  limitations: [],
  unitSystem: 'metric',
  language: 'en',
  onboardingCompleted: false,
  bmr: 1750,
  tdee: 2700,
  targetCalories: 2800,
  targetProteinGrams: 160,
  targetCarbsGrams: 340,
  targetFatsGrams: 75,
  targetWaterMl: 3200,
  currentLevel: 1,
  totalXp: 0,
  streakDays: 0,
  lastActiveDate: new Date().toISOString().split('T')[0]
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [language, setLanguageState] = useState<Language>('en');
  const [unitSystem, setUnitSystemState] = useState<UnitSystem>('metric');
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [showSurveyModal, setShowSurveyModal] = useState<boolean>(false);

  const [exercises, setExercises] = useState<Exercise[]>(SEED_EXERCISES);
  const [weeklySplit, setWeeklySplit] = useState<WorkoutSplitDay[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(null);
  const [trophies, setTrophies] = useState<Trophy[]>(SEED_TROPHIES);

  const [todayNutrition, setTodayNutrition] = useState<DailyNutritionLog>({
    date: new Date().toISOString().split('T')[0],
    entries: []
  });

  const [supplements, setSupplements] = useState<SupplementProtocol[]>(SEED_SUPPLEMENTS);
  const [todaySupplementChecklist, setTodaySupplementChecklist] = useState<string[]>([]);
  const [biomarkerRecords, setBiomarkerRecords] = useState<BiomarkerRecord[]>([]);

  const [waterLog, setWaterLog] = useState<WaterLog>({
    date: new Date().toISOString().split('T')[0],
    currentMl: 0,
    targetMl: 3200,
    entries: []
  });

  const [hourlyWaterAlerts, setHourlyWaterAlerts] = useState<boolean>(true);
  const [bodyweightHistory, setBodyweightHistory] = useState<BodyweightEntry[]>([]);
  const [bannerMessage, setBannerMessage] = useState<{ text: string; subtext?: string; type: 'xp' | 'trophy' | 'info' } | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to trigger confetti for trophies / level ups
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#10b981', '#3b82f6', '#f59e0b']
      });
    } catch (e) {
      // ignore
    }
  };

  // Sync RTL and lang attribute on <html> element
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
    saveItem('aegis_lang', lang);
  }, []);

  const setUnitSystem = useCallback((sys: UnitSystem) => {
    setUnitSystemState(sys);
    saveItem('aegis_units', sys);
  }, []);

  const dismissBanner = () => setBannerMessage(null);

  // Initialize data from offline storage on mount
  useEffect(() => {
    async function initStorage() {
      const savedLang = await getItem<Language>('aegis_lang', 'en');
      setLanguage(savedLang);

      const savedUnits = await getItem<UnitSystem>('aegis_units', 'metric');
      setUnitSystemState(savedUnits);

      const savedProfile = await getItem<UserProfile>(StorageKeys.USER_PROFILE, DEFAULT_PROFILE);
      setProfile(savedProfile);

      const savedExercises = await getItem<Exercise[]>(StorageKeys.CUSTOM_EXERCISES, SEED_EXERCISES);
      setExercises(savedExercises);

      let savedSplit = await getItem<WorkoutSplitDay[]>(StorageKeys.WEEKLY_SPLIT, []);
      if (!savedSplit || savedSplit.length === 0) {
        savedSplit = generateTacticalWeeklySplit(savedProfile.primaryGoal, savedProfile.experienceLevel);
        await saveItem(StorageKeys.WEEKLY_SPLIT, savedSplit);
      }
      setWeeklySplit(savedSplit);

      const savedWorkouts = await getItem<WorkoutSession[]>(StorageKeys.WORKOUT_SESSIONS, []);
      setWorkouts(savedWorkouts);

      const savedTrophies = await getItem<Trophy[]>(StorageKeys.TROPHIES, SEED_TROPHIES);
      setTrophies(savedTrophies);

      const nutritionKey = `${StorageKeys.DAILY_NUTRITION_PREFIX}${todayStr}`;
      const savedTodayNutr = await getItem<DailyNutritionLog>(nutritionKey, {
        date: todayStr,
        entries: []
      });
      setTodayNutrition(savedTodayNutr);

      const savedSupplements = await getItem<SupplementProtocol[]>(StorageKeys.SUPPLEMENT_PROTOCOLS, SEED_SUPPLEMENTS);
      setSupplements(savedSupplements);

      const suppLogKey = `${StorageKeys.DAILY_SUPPLEMENT_PREFIX}${todayStr}`;
      const savedTodaySuppLog = await getItem<string[]>(suppLogKey, []);
      setTodaySupplementChecklist(savedTodaySuppLog);

      const savedBiomarkers = await getItem<BiomarkerRecord[]>(StorageKeys.BIOMARKER_RECORDS, []);
      setBiomarkerRecords(savedBiomarkers);

      const waterKey = `${StorageKeys.DAILY_WATER_PREFIX}${todayStr}`;
      const savedWater = await getItem<WaterLog>(waterKey, {
        date: todayStr,
        currentMl: 0,
        targetMl: savedProfile.targetWaterMl || 3200,
        entries: []
      });
      setWaterLog(savedWater);

      const savedWeightHistory = await getItem<BodyweightEntry[]>(StorageKeys.BODYWEIGHT_HISTORY, []);
      setBodyweightHistory(savedWeightHistory);

      setIsLoaded(true);
    }

    initStorage();
  }, [setLanguage, todayStr]);

  // Recalculate and update profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    const merged = { ...profile, ...updates };

    const bmr = calculateBMR(merged.gender, merged.weightKg, merged.heightCm, merged.age);
    const tdee = calculateTDEE(bmr, merged.activityLevel);
    const targetCalories = calculateTargetCalories(tdee, merged.primaryGoal);
    const macroSplits = calculateMacroSplits(targetCalories, merged.weightKg, merged.dietaryFramework, merged.primaryGoal);
    const targetWaterMl = calculateBaselineWaterMl(merged.weightKg, merged.activityLevel);

    const calculatedProfile: UserProfile = {
      ...merged,
      bmr,
      tdee,
      targetCalories,
      targetProteinGrams: macroSplits.proteinGrams,
      targetCarbsGrams: macroSplits.carbsGrams,
      targetFatsGrams: macroSplits.fatsGrams,
      targetWaterMl
    };

    setProfile(calculatedProfile);
    await saveItem(StorageKeys.USER_PROFILE, calculatedProfile);

    // Also update current day's target water if active
    setWaterLog(prev => ({ ...prev, targetMl: targetWaterMl }));

    // Generate new tactical weekly split matching their goal & experience
    const newSplit = generateTacticalWeeklySplit(calculatedProfile.primaryGoal, calculatedProfile.experienceLevel);
    setWeeklySplit(newSplit);
    await saveItem(StorageKeys.WEEKLY_SPLIT, newSplit);
  };

  const resetOnboarding = () => {
    setShowSurveyModal(true);
  };

  const awardXp = async (amount: number, reason: string) => {
    const updatedXp = profile.totalXp + amount;
    const { level } = calculateLevelFromXp(updatedXp);
    const leveledUp = level > profile.currentLevel;

    const updatedProfile: UserProfile = {
      ...profile,
      totalXp: updatedXp,
      currentLevel: level
    };

    setProfile(updatedProfile);
    await saveItem(StorageKeys.USER_PROFILE, updatedProfile);

    if (leveledUp) {
      triggerConfetti();
      setBannerMessage({
        type: 'trophy',
        text: `LEVEL UP: RANK ${level} REACHED!`,
        subtext: `Biomechanical output optimized. +${amount} XP (${reason})`
      });
    } else {
      setBannerMessage({
        type: 'xp',
        text: `+${amount} XP`,
        subtext: reason
      });
    }
  };

  const regenerateSplit = async () => {
    const newSplit = generateTacticalWeeklySplit(profile.primaryGoal, profile.experienceLevel);
    setWeeklySplit(newSplit);
    await saveItem(StorageKeys.WEEKLY_SPLIT, newSplit);
    setBannerMessage({
      type: 'info',
      text: 'TACTICAL SPLIT RECALCULATED',
      subtext: 'Microcycle program updated according to current goal parameters.'
    });
  };

  const addCustomExercise = async (exercise: Exercise) => {
    const updated = [exercise, ...exercises];
    setExercises(updated);
    await saveItem(StorageKeys.CUSTOM_EXERCISES, updated);
  };

  // Workout Session Flow
  const startActiveWorkout = (splitDay?: WorkoutSplitDay) => {
    let exercisesToLoad: any[] = [];
    let title = splitDay ? splitDay.dayNameEn : 'Tactical Free Training';

    if (splitDay && splitDay.plannedExercises.length > 0) {
      exercisesToLoad = splitDay.plannedExercises.map(plan => {
        const found = exercises.find(e => e.id === plan.exerciseId) || exercises[0];
        const setsCount = plan.sets || 3;
        return {
          exerciseId: found.id,
          exerciseName: found.nameEn,
          muscleGroup: found.primaryMuscle,
          sets: Array.from({ length: setsCount }).map((_, i) => ({
            id: `s_${Date.now()}_${i}`,
            setNumber: i + 1,
            weightKg: 60,
            reps: 10,
            completed: false
          }))
        };
      });
    } else {
      // Default initial exercise
      const defaultEx = exercises[0];
      exercisesToLoad = [
        {
          exerciseId: defaultEx.id,
          exerciseName: defaultEx.nameEn,
          muscleGroup: defaultEx.primaryMuscle,
          sets: [
            { id: `s_${Date.now()}_1`, setNumber: 1, weightKg: 60, reps: 10, completed: false },
            { id: `s_${Date.now()}_2`, setNumber: 2, weightKg: 60, reps: 10, completed: false },
            { id: `s_${Date.now()}_3`, setNumber: 3, weightKg: 60, reps: 10, completed: false }
          ]
        }
      ];
    }

    const newActive: WorkoutSession = {
      id: `session_${Date.now()}`,
      title,
      date: new Date().toISOString().split('T')[0],
      durationMinutes: 0,
      totalVolumeKg: 0,
      rating: 5,
      xpEarned: 250,
      exercises: exercisesToLoad
    };

    setActiveWorkout(newActive);
  };

  const updateActiveWorkout = (workout: WorkoutSession) => {
    setActiveWorkout(workout);
  };

  const finishActiveWorkout = async () => {
    if (!activeWorkout) return;

    // Calculate total volume
    let totalVol = 0;
    activeWorkout.exercises.forEach(ex => {
      ex.sets.forEach(s => {
        if (s.completed) {
          totalVol += (s.weightKg || 0) * (s.reps || 0);
        }
      });
    });

    const finishedSession: WorkoutSession = {
      ...activeWorkout,
      totalVolumeKg: totalVol,
      xpEarned: 300
    };

    const updatedWorkouts = [finishedSession, ...workouts];
    setWorkouts(updatedWorkouts);
    await saveItem(StorageKeys.WORKOUT_SESSIONS, updatedWorkouts);

    setActiveWorkout(null);
    triggerConfetti();
    await awardXp(300, `Completed: ${finishedSession.title} (${Math.round(totalVol)} kg volume)`);

    // Check trophy progress
    checkTrophiesOnWorkoutComplete(updatedWorkouts, totalVol);
  };

  const discardActiveWorkout = () => {
    setActiveWorkout(null);
  };

  const checkTrophiesOnWorkoutComplete = async (allWorkouts: WorkoutSession[], lastVolume: number) => {
    let modified = false;
    const updatedTrophies = trophies.map(t => {
      if (t.id === 'tr_1' && !t.unlockedAt) {
        modified = true;
        return { ...t, unlockedAt: new Date().toISOString(), progress: 100 };
      }
      if (t.id === 'tr_2' && !t.unlockedAt) {
        const totalAll = allWorkouts.reduce((acc, w) => acc + w.totalVolumeKg, 0);
        const progress = Math.min(100, Math.round((totalAll / 25000) * 100));
        if (progress >= 100) {
          modified = true;
          return { ...t, unlockedAt: new Date().toISOString(), progress: 100 };
        }
        return { ...t, progress };
      }
      return t;
    });

    if (modified) {
      setTrophies(updatedTrophies);
      await saveItem(StorageKeys.TROPHIES, updatedTrophies);
      triggerConfetti();
    }
  };

  // Nutrition
  const addFoodEntry = async (entry: Omit<LoggedFoodEntry, 'id' | 'loggedAt'>) => {
    const newEntry: LoggedFoodEntry = {
      ...entry,
      id: `entry_${Date.now()}`,
      loggedAt: new Date().toISOString()
    };

    const updated: DailyNutritionLog = {
      ...todayNutrition,
      entries: [newEntry, ...todayNutrition.entries]
    };

    setTodayNutrition(updated);
    const key = `${StorageKeys.DAILY_NUTRITION_PREFIX}${todayNutrition.date}`;
    await saveItem(key, updated);
    await awardXp(50, `Logged: ${newEntry.name}`);
  };

  const deleteFoodEntry = async (entryId: string) => {
    const updated: DailyNutritionLog = {
      ...todayNutrition,
      entries: todayNutrition.entries.filter(e => e.id !== entryId)
    };
    setTodayNutrition(updated);
    const key = `${StorageKeys.DAILY_NUTRITION_PREFIX}${todayNutrition.date}`;
    await saveItem(key, updated);
  };

  // Supplements
  const toggleSupplementActive = async (id: string) => {
    const updated = supplements.map(s => s.id === id ? { ...s, active: !s.active } : s);
    setSupplements(updated);
    await saveItem(StorageKeys.SUPPLEMENT_PROTOCOLS, updated);
  };

  const toggleSupplementCheck = async (id: string) => {
    let updated: string[];
    if (todaySupplementChecklist.includes(id)) {
      updated = todaySupplementChecklist.filter(item => item !== id);
    } else {
      updated = [...todaySupplementChecklist, id];
      await awardXp(30, 'Supplement Protocol Adherence');
    }
    setTodaySupplementChecklist(updated);
    const key = `${StorageKeys.DAILY_SUPPLEMENT_PREFIX}${todayStr}`;
    await saveItem(key, updated);
  };

  // Biomarkers
  const addBiomarkerRecord = async (record: Omit<BiomarkerRecord, 'id'>) => {
    const newRecord: BiomarkerRecord = {
      ...record,
      id: `bio_${Date.now()}`
    };
    const updated = [newRecord, ...biomarkerRecords];
    setBiomarkerRecords(updated);
    await saveItem(StorageKeys.BIOMARKER_RECORDS, updated);
    await awardXp(100, 'Biomarker Lab Telemetry Recorded');
  };

  const deleteBiomarkerRecord = async (id: string) => {
    const updated = biomarkerRecords.filter(r => r.id !== id);
    setBiomarkerRecords(updated);
    await saveItem(StorageKeys.BIOMARKER_RECORDS, updated);
  };

  // Water
  const addWaterMl = async (amountMl: number) => {
    const newCurrent = waterLog.currentMl + amountMl;
    const newEntry = {
      id: `w_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      amountMl
    };

    const updated: WaterLog = {
      ...waterLog,
      currentMl: newCurrent,
      entries: [newEntry, ...waterLog.entries]
    };

    setWaterLog(updated);
    const key = `${StorageKeys.DAILY_WATER_PREFIX}${todayStr}`;
    await saveItem(key, updated);

    // Schedule next hourly hydration notification if enabled
    if (hourlyWaterAlerts) {
      scheduleLocalNotification({
        id: 101,
        title: 'AegisFit Hydration Alert',
        body: 'Cellular osmotic balance check: drink 250ml of cold water to maintain peak cognitive and physical output.',
        scheduleInSeconds: 3600
      });
    }

    if (newCurrent >= waterLog.targetMl && waterLog.currentMl < waterLog.targetMl) {
      triggerConfetti();
      await awardXp(150, 'Daily Hydration Target Achieved');
    } else {
      await awardXp(15, `Hydration: +${amountMl} ml`);
    }
  };

  // Bodyweight
  const logBodyweight = async (weightKg: number) => {
    const newEntry: BodyweightEntry = {
      id: `bw_${Date.now()}`,
      date: todayStr,
      weightKg
    };
    const updated = [...bodyweightHistory, newEntry];
    setBodyweightHistory(updated);
    await saveItem(StorageKeys.BODYWEIGHT_HISTORY, updated);
    await updateProfile({ weightKg });
    await awardXp(40, 'Bodyweight Telemetry Updated');
  };

  // Calculate volume sets per muscle group over the last 7 days for the Biomechanical HUD Heatmap
  const getWeeklyMuscleSetCounts = useCallback((): Record<MuscleGroup, number> => {
    const counts: Record<MuscleGroup, number> = {
      chest: 0,
      back_upper: 0,
      lats: 0,
      shoulders: 0,
      biceps: 0,
      triceps: 0,
      forearms: 0,
      quads: 0,
      hamstrings: 0,
      calves: 0,
      glutes: 0,
      abs: 0,
      obliques: 0
    };

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    workouts.forEach(session => {
      const sessionDate = new Date(session.date);
      if (sessionDate >= sevenDaysAgo) {
        session.exercises.forEach(ex => {
          const completedSets = ex.sets.filter(s => s.completed).length;
          if (counts[ex.muscleGroup] !== undefined) {
            counts[ex.muscleGroup] += completedSets;
          }
        });
      }
    });

    return counts;
  }, [workouts]);

  const logQuickSet = async (exerciseId: string, weightKg: number = 60, reps: number = 10) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const todayWorkout = workouts.find(w => w.date === todayStr);
    let updatedWorkouts: WorkoutSession[];

    if (todayWorkout) {
      const existingExIndex = todayWorkout.exercises.findIndex(e => e.exerciseId === exercise.id);
      const updatedExercises = [...todayWorkout.exercises];

      if (existingExIndex >= 0) {
        const targetEx = updatedExercises[existingExIndex];
        const newSetNumber = targetEx.sets.length + 1;
        const newSet = {
          id: `s_${Date.now()}_${newSetNumber}`,
          setNumber: newSetNumber,
          weightKg,
          reps,
          completed: true
        };
        updatedExercises[existingExIndex] = {
          ...targetEx,
          sets: [...targetEx.sets, newSet]
        };
      } else {
        updatedExercises.push({
          exerciseId: exercise.id,
          exerciseName: exercise.nameEn,
          muscleGroup: exercise.primaryMuscle,
          sets: [
            {
              id: `s_${Date.now()}_1`,
              setNumber: 1,
              weightKg,
              reps,
              completed: true
            }
          ]
        });
      }

      const totalVol = updatedExercises.reduce((vol, ex) => {
        return vol + ex.sets.reduce((sVol, s) => s.completed ? sVol + ((s.weightKg || 0) * (s.reps || 0)) : sVol, 0);
      }, 0);

      const updatedTodayWorkout: WorkoutSession = {
        ...todayWorkout,
        exercises: updatedExercises,
        totalVolumeKg: totalVol
      };

      updatedWorkouts = workouts.map(w => w.id === todayWorkout.id ? updatedTodayWorkout : w);
    } else {
      const newSession: WorkoutSession = {
        id: `session_${Date.now()}`,
        title: language === 'ar' ? `تمرين ${exercise.nameAr}` : `${exercise.nameEn} Session`,
        date: todayStr,
        durationMinutes: 15,
        rating: 5,
        exercises: [
          {
            exerciseId: exercise.id,
            exerciseName: exercise.nameEn,
            muscleGroup: exercise.primaryMuscle,
            sets: [
              {
                id: `s_${Date.now()}_1`,
                setNumber: 1,
                weightKg,
                reps,
                completed: true
              }
            ]
          }
        ],
        totalVolumeKg: weightKg * reps,
        xpEarned: 35
      };
      updatedWorkouts = [newSession, ...workouts];
    }

    setWorkouts(updatedWorkouts);
    await saveItem(StorageKeys.WORKOUT_SESSIONS, updatedWorkouts);
    const exName = language === 'ar' ? exercise.nameAr : exercise.nameEn;
    setBannerMessage({
      type: 'xp',
      text: language === 'ar' ? `تم تسجيل جولة: ${exName}` : `+1 Set Logged: ${exName}`,
      subtext: language === 'ar' ? `+30 نقطة خبرة • تم تحديث خريطة العضلات` : `+30 XP • Heatmap updated`
    });
    await awardXp(30, `${exercise.nameEn} Set Logged`);
  };

  const resetAllData = async () => {
    localStorage.clear();
    setProfile(DEFAULT_PROFILE);
    setWorkouts([]);
    setExercises(SEED_EXERCISES);
    setSupplements(SEED_SUPPLEMENTS);
    setBiomarkerRecords([]);
    setTrophies(SEED_TROPHIES);
    setBodyweightHistory([]);
    setWaterLog({ date: new Date().toISOString().split('T')[0], targetMl: 3500, currentMl: 0, entries: [] });
    setTodayNutrition({ date: new Date().toISOString().split('T')[0], entries: [] });
    setTodaySupplementChecklist([]);
    window.location.reload();
  };

  const exportAppDataJson = async (): Promise<string> => {
    const data = {
      profile,
      workouts,
      exercises,
      supplements,
      biomarkerRecords,
      trophies,
      bodyweightHistory,
      waterLog,
      todayNutrition,
      todaySupplementChecklist,
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  };

  const importAppDataJson = async (jsonStr: string): Promise<boolean> => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.profile) await updateProfile(data.profile);
      if (Array.isArray(data.workouts)) {
        setWorkouts(data.workouts);
        await saveItem('aegis_workouts', data.workouts);
      }
      if (Array.isArray(data.exercises)) {
        setExercises(data.exercises);
        await saveItem('aegis_exercises', data.exercises);
      }
      if (Array.isArray(data.supplements)) {
        setSupplements(data.supplements);
        await saveItem('aegis_supplements', data.supplements);
      }
      if (Array.isArray(data.biomarkerRecords)) {
        setBiomarkerRecords(data.biomarkerRecords);
        await saveItem('aegis_biomarkers', data.biomarkerRecords);
      }
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  };

  const t = translations[language];

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        unitSystem,
        setUnitSystem,
        profile,
        updateProfile,
        resetOnboarding,
        showSurveyModal,
        setShowSurveyModal,
        exercises,
        addCustomExercise,
        weeklySplit,
        regenerateSplit,
        workouts,
        activeWorkout,
        startActiveWorkout,
        updateActiveWorkout,
        finishActiveWorkout,
        discardActiveWorkout,
        trophies,
        todayNutrition,
        addFoodEntry,
        deleteFoodEntry,
        supplements,
        toggleSupplementActive,
        todaySupplementChecklist,
        toggleSupplementCheck,
        biomarkerRecords,
        addBiomarkerRecord,
        deleteBiomarkerRecord,
        waterLog,
        addWaterMl,
        hourlyWaterAlerts,
        setHourlyWaterAlerts,
        bodyweightHistory,
        logBodyweight,
        bannerMessage,
        dismissBanner,
        awardXp,
        getWeeklyMuscleSetCounts,
        logQuickSet,
        resetAllData,
        exportAppDataJson,
        importAppDataJson
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
