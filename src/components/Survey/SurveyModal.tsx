import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FitnessGoal, 
  ExperienceLevel, 
  DietaryFramework 
} from '../../types';
import { 
  calculateBMR, 
  calculateTDEE, 
  calculateMacroDistribution, 
  calculateWaterRequirementMl 
} from '../../utils/calculations';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Dumbbell, 
  Zap, 
  Flame, 
  Droplets,
  Sparkles,
  X
} from 'lucide-react';

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SurveyModal: React.FC<SurveyModalProps> = ({ isOpen, onClose }) => {
  const { language, t, profile, updateProfile, regenerateSplit } = useApp();

  const [step, setStep] = useState(1);

  // Form local state
  const [name, setName] = useState(profile.name || 'Athlete');
  const [age, setAge] = useState(profile.age || 26);
  const [gender, setGender] = useState<'male' | 'female'>(profile.gender === 'female' ? 'female' : 'male');
  const [heightCm, setHeightCm] = useState(profile.heightCm || 178);
  const [weightKg, setWeightKg] = useState(profile.weightKg || 78);
  const [bodyFatPercent, setBodyFatPercent] = useState(profile.bodyFatPercent || 15);
  const [goal, setGoal] = useState<FitnessGoal>(profile.primaryGoal || 'hypertrophy');
  const [experience, setExperience] = useState<ExperienceLevel>(profile.experienceLevel || 'intermediate');
  const [trainingDays, setTrainingDays] = useState(profile.trainingDaysPerWeek || 4);
  const [dietaryFramework, setDietaryFramework] = useState<DietaryFramework>(profile.dietaryFramework || 'high_protein');

  if (!isOpen) return null;

  // Real-time calculation previews
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const tdee = calculateTDEE(bmr, trainingDays);
  const macros = calculateMacroDistribution(tdee, weightKg, goal, dietaryFramework);
  const waterTarget = calculateWaterRequirementMl(weightKg, trainingDays);

  const handleSkip = async () => {
    await updateProfile({ onboardingCompleted: true });
    onClose();
  };

  const handleFinish = async () => {
    await updateProfile({
      name,
      age,
      gender,
      heightCm,
      weightKg,
      bodyFatPercent,
      primaryGoal: goal,
      experienceLevel: experience,
      trainingDaysPerWeek: trainingDays,
      dietaryFramework,
      bmr,
      tdee,
      targetCalories: macros.calories,
      targetProteinGrams: macros.proteinGrams,
      targetCarbsGrams: macros.carbsGrams,
      targetFatsGrams: macros.fatsGrams,
      targetWaterMl: waterTarget,
      onboardingCompleted: true
    });
    regenerateSplit();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 overflow-y-auto">
      <div className="glass-panel w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-5 border border-cyan-500/40 glow-cyan space-y-4 text-slate-100">
        {/* Progress Bar & Header */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
                {t.survey.title}
              </span>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                {step} / 4
              </span>
            </div>

            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-bold text-slate-400 hover:text-cyan-300 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/30 transition-all flex items-center gap-1 min-h-[36px]"
            >
              <span>{t.common.skipForNow}</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: PHYSICAL METRICS */}
        {step === 1 && (
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-bold text-slate-100 uppercase">
                {t.survey.step1Title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                {language === 'ar' ? 'أدخل قياساتك البدنية لضبط خطة السعرات والتمارين المناسبة لك.' : 'Enter your body measurements to calibrate your personalized calories and training plan.'}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {language === 'ar' ? 'الاسم' : 'Your Name'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 min-h-[44px] text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">{t.survey.biologicalSex}</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 min-h-[44px] text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="male">{t.survey.male}</option>
                    <option value="female">{t.survey.female}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">{t.survey.age}</label>
                  <input
                    type="number"
                    value={age}
                    onChange={e => setAge(Number(e.target.value))}
                    min={14}
                    max={99}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 min-h-[44px] text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">{t.survey.height} (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={e => setHeightCm(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 min-h-[44px] text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">{t.survey.weight} (kg)</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={e => setWeightKg(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 min-h-[44px] text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: FITNESS GOALS */}
        {step === 2 && (
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-bold text-slate-100 uppercase">
                {t.survey.step2Title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                {language === 'ar' ? 'حدد هدفك التدريبي الأساسي وعدد الأيام التي تخطط للتمرين فيها.' : 'Select your primary training objective and weekly availability.'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-400">{t.survey.primaryGoal}</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { key: 'hypertrophy', label: t.survey.hypertrophy, icon: Dumbbell },
                  { key: 'fat_loss', label: t.survey.fatLoss, icon: Flame },
                  { key: 'strength', label: t.survey.strength, icon: Zap },
                  { key: 'endurance', label: t.survey.endurance, icon: Sparkles }
                ].map(item => {
                  const Icon = item.icon;
                  const isSelected = goal === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setGoal(item.key as FitnessGoal)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all min-h-[48px] ${
                        isSelected
                          ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 font-bold'
                          : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <span className="text-xs">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">{t.survey.experienceLevel}</label>
                <select
                  value={experience}
                  onChange={e => setExperience(e.target.value as ExperienceLevel)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 min-h-[44px] text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                >
                  <option value="beginner">{t.survey.beginner}</option>
                  <option value="intermediate">{t.survey.intermediate}</option>
                  <option value="advanced">{t.survey.advanced}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">{t.survey.trainingDays}</label>
                <select
                  value={trainingDays}
                  onChange={e => setTrainingDays(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 min-h-[44px] text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                >
                  <option value={3}>3 {t.common.days}</option>
                  <option value={4}>4 {t.common.days}</option>
                  <option value={5}>5 {t.common.days}</option>
                  <option value={6}>6 {t.common.days}</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: NUTRITION FRAMEWORK */}
        {step === 3 && (
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-bold text-slate-100 uppercase">
                {t.survey.step3Title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                {language === 'ar' ? 'اختر أسلوب التغذية المفضل لتنظيم توزيع البروتين والماكروز.' : 'Choose your preferred dietary framework to balance protein and macros.'}
              </p>
            </div>

            <div className="space-y-2">
              {[
                { key: 'high_protein', title: 'High Protein (Balanced)', desc: 'Optimal for muscle retention & building (40% Carbs, 35% Protein, 25% Fat)' },
                { key: 'keto', title: 'Ketogenic / Low-Carb', desc: 'Focuses on fats and protein with minimal carbohydrates' },
                { key: 'plant_based', title: 'Plant-Based / Vegan', desc: 'Higher carb ratio with plant-based protein sources' },
                { key: 'mediterranean', title: 'Mediterranean', desc: 'Heart-healthy fats, moderate protein, whole grains' }
              ].map(f => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setDietaryFramework(f.key as DietaryFramework)}
                  className={`w-full text-left p-3 rounded-xl border transition-all min-h-[50px] ${
                    dietaryFramework === f.key
                      ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">{f.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: SUMMARY & CONFIRMATION */}
        {step === 4 && (
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-bold text-slate-100 uppercase">
                {t.survey.step4Title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                {language === 'ar' ? 'راجع خطتك اليومية المحسوبة بدقة قبل البدء.' : 'Review your calculated daily nutritional and hydration plan.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-3 rounded-2xl border border-cyan-500/30 font-mono text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">BMR</span>
                <span className="text-sm font-bold text-slate-100">{bmr} kcal</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">DAILY TDEE</span>
                <span className="text-sm font-bold text-slate-100">{tdee} kcal</span>
              </div>
              <div className="p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-500/40 col-span-2">
                <span className="text-cyan-400 block text-[10px] font-bold">DAILY TARGET CALORIES</span>
                <span className="text-base font-black text-cyan-300">{macros.calories} kcal / day</span>
              </div>
            </div>

            {/* Macro Targets */}
            <div className="grid grid-cols-3 gap-2 font-mono text-center">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-emerald-400 block font-bold">{t.nutrition.protein}</span>
                <span className="text-sm font-bold text-slate-100">{macros.proteinGrams}g</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-amber-400 block font-bold">{t.nutrition.carbs}</span>
                <span className="text-sm font-bold text-slate-100">{macros.carbsGrams}g</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-rose-400 block font-bold">{t.nutrition.fats}</span>
                <span className="text-sm font-bold text-slate-100">{macros.fatsGrams}g</span>
              </div>
            </div>

            {/* Hydration */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs font-mono">
              <div className="flex items-center gap-2 text-blue-300">
                <Droplets className="w-4 h-4" />
                <span>{t.water.dailyHydrationTarget}:</span>
              </div>
              <span className="font-bold text-blue-200">{waterTarget} ml / day</span>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-1.5 px-4 min-h-[44px] rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t.common.back}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-bold text-slate-400 hover:text-cyan-300 min-h-[44px] px-4 rounded-xl bg-slate-900/80 border border-slate-800 transition-all"
            >
              {t.common.skipForNow}
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-1.5 px-5 min-h-[44px] rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/30 transition-all"
            >
              <span>{t.common.next}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 min-h-[44px] rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/40 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{t.survey.finish}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
