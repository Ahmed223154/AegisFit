import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  UserProfile, 
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
  Shield, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Dumbbell, 
  Zap, 
  Flame, 
  Award, 
  Droplets,
  Sparkles
} from 'lucide-react';

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SurveyModal: React.FC<SurveyModalProps> = ({ isOpen, onClose }) => {
  const { language, t, profile, updateProfile, regenerateSplit } = useApp();

  const [step, setStep] = useState(1);

  // Form local state
  const [name, setName] = useState(profile.name || 'Operative');
  const [age, setAge] = useState(profile.age || 26);
  const [gender, setGender] = useState<'male' | 'female'>(profile.gender === 'female' ? 'female' : 'male');
  const [heightCm, setHeightCm] = useState(profile.heightCm || 182);
  const [weightKg, setWeightKg] = useState(profile.weightKg || 84);
  const [bodyFatPercent, setBodyFatPercent] = useState(profile.bodyFatPercent || 15);
  const [goal, setGoal] = useState<FitnessGoal>(profile.primaryGoal || 'hypertrophy');
  const [experience, setExperience] = useState<ExperienceLevel>(profile.experienceLevel || 'intermediate');
  const [trainingDays, setTrainingDays] = useState(profile.trainingDaysPerWeek || 5);
  const [dietaryFramework, setDietaryFramework] = useState<DietaryFramework>(profile.dietaryFramework || 'high_protein');

  if (!isOpen) return null;

  // Real-time calculation previews
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const tdee = calculateTDEE(bmr, trainingDays);
  const macros = calculateMacroDistribution(tdee, weightKg, goal, dietaryFramework);
  const waterTarget = calculateWaterRequirementMl(weightKg, trainingDays);

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
      onboardingCompleted: true
    });
    regenerateSplit();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 overflow-y-auto">
      <div className="glass-panel w-full max-w-[390px] max-h-[85vh] overflow-y-auto rounded-2xl p-4 border border-cyan-500/40 glow-cyan space-y-4">
        {/* Progress Bar & Header */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 mb-1.5">
            <span className="uppercase tracking-widest font-bold">
              {t.survey.title}
            </span>
            <span>STEP {step} OF 4</span>
          </div>

          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: PHYSICAL TELEMETRY */}
        {step === 1 && (
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-bold text-slate-100 font-telemetry uppercase">
                {t.survey.step1Title}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Enter your anatomical metrics to calibrate precise energy expenditure equations.
              </p>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Codename / Callsign</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 min-h-[44px] text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">{t.survey.biologicalSex}</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 min-h-[44px] text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="male">{t.survey.male}</option>
                    <option value="female">{t.survey.female}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">{t.survey.age}</label>
                  <input
                    type="number"
                    value={age}
                    onChange={e => setAge(parseInt(e.target.value, 10) || 20)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 min-h-[44px] text-xs text-slate-100 focus:border-cyan-400 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">{t.survey.height} (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={e => setHeightCm(parseFloat(e.target.value) || 170)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 min-h-[44px] text-xs text-slate-100 focus:border-cyan-400 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">{t.survey.weight} (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={weightKg}
                    onChange={e => setWeightKg(parseFloat(e.target.value) || 75)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 min-h-[44px] text-xs text-slate-100 focus:border-cyan-400 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">{t.survey.bodyFat} (%)</label>
                  <input
                    type="number"
                    value={bodyFatPercent}
                    onChange={e => setBodyFatPercent(parseFloat(e.target.value) || 15)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 min-h-[44px] text-xs text-slate-100 focus:border-cyan-400 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: TRAINING GOAL & EXPERIENCE */}
        {step === 2 && (
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-bold text-slate-100 font-telemetry uppercase">
                {t.survey.step2Title}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Establish primary kinetic objectives and current lifting proficiency.
              </p>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">{t.survey.primaryGoal}</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { id: 'hypertrophy', label: t.survey.hypertrophy, desc: 'Max muscle mass & volumetric density' },
                    { id: 'strength', label: t.survey.strength, desc: 'Peak 1RM neuro-muscular force' },
                    { id: 'fat_loss', label: t.survey.fatLoss, desc: 'Adipose reduction preserving lean mass' },
                    { id: 'recomposition', label: t.survey.recomposition, desc: 'Simultaneous hypertrophy & fat loss' }
                  ].map(g => (
                    <div
                      key={g.id}
                      onClick={() => setGoal(g.id as FitnessGoal)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        goal === g.id
                          ? 'bg-cyan-950/40 border-cyan-500 text-slate-100 glow-cyan'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs font-telemetry">{g.label}</div>
                      <div className="text-[10px] text-slate-400">{g.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">{t.survey.experienceLevel}</label>
                  <select
                    value={experience}
                    onChange={e => setExperience(e.target.value as ExperienceLevel)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 min-h-[44px] text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="beginner">Beginner (0-1y)</option>
                    <option value="intermediate">Interm. (1-3y)</option>
                    <option value="advanced">Advanced (3-6y)</option>
                    <option value="elite">Elite (6y+)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">{t.survey.trainingDays}</label>
                  <select
                    value={trainingDays}
                    onChange={e => setTrainingDays(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 min-h-[44px] text-xs text-slate-100 focus:border-cyan-400 focus:outline-none font-mono"
                  >
                    <option value={3}>3 Days (Full)</option>
                    <option value={4}>4 Days (Upper/Lower)</option>
                    <option value={5}>5 Days (PPL)</option>
                    <option value={6}>6 Days (Arnold)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: NUTRITIONAL FRAMEWORK */}
        {step === 3 && (
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-bold text-slate-100 font-telemetry uppercase">
                {t.survey.step3Title}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Select your preferred protocol to distribute calories into macros.
              </p>
            </div>

            <div className="space-y-2">
              {[
                { id: 'high_protein', name: 'High-Protein Athlete (2.2g/kg)', desc: 'Optimized for muscle protein synthesis and recovery' },
                { id: 'balanced', name: 'Balanced Split (40/30/30)', desc: 'Steady sustained glycemic energy release' },
                { id: 'keto', name: 'Ketogenic (High Fat, Low Carb)', desc: 'Ketone metabolic state for endurance' },
                { id: 'mediterranean', name: 'Mediterranean Performance', desc: 'Heart health, rich in micronutrients' },
                { id: 'flexible', name: 'Flexible / IIFYM', desc: 'Hit overall daily numbers with dietary variety' }
              ].map(d => (
                <div
                  key={d.id}
                  onClick={() => setDietaryFramework(d.id as DietaryFramework)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    dietaryFramework === d.id
                      ? 'bg-cyan-950/40 border-cyan-500 text-slate-100 glow-cyan'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs font-telemetry">{d.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{d.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: CALCULATED TELEMETRY BLUEPRINT */}
        {step === 4 && (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-base font-bold text-slate-100 font-telemetry uppercase">
                {t.survey.step4Title}
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Review your customized biomechanical parameters before saving.
            </p>

            <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-3 rounded-2xl border border-cyan-500/30 font-mono text-xs">
              <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 block text-[9px]">BASAL METABOLIC (BMR)</span>
                <span className="text-sm font-bold text-slate-100 font-telemetry">{bmr} kcal</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 block text-[9px]">DAILY TDEE</span>
                <span className="text-sm font-bold text-slate-100 font-telemetry">{tdee} kcal</span>
              </div>
              <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/40 col-span-2">
                <span className="text-cyan-400 block text-[9px] font-bold">TARGET CALORIES ({goal.toUpperCase()})</span>
                <span className="text-lg font-black text-cyan-300 font-telemetry">{macros.calories} kcal / day</span>
              </div>
            </div>

            {/* Macro Targets */}
            <div className="grid grid-cols-3 gap-2 font-mono text-center">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[9px] text-emerald-400 block font-bold">{t.nutrition.protein}</span>
                <span className="text-sm font-bold text-slate-100 font-telemetry">{macros.proteinGrams}g</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[9px] text-amber-400 block font-bold">{t.nutrition.carbs}</span>
                <span className="text-sm font-bold text-slate-100 font-telemetry">{macros.carbsGrams}g</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[9px] text-rose-400 block font-bold">{t.nutrition.fats}</span>
                <span className="text-sm font-bold text-slate-100 font-telemetry">{macros.fatsGrams}g</span>
              </div>
            </div>

            {/* Hydration Blueprint */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-blue-300 text-[11px]">
                <Droplets className="w-3.5 h-3.5" />
                <span>Hydration Quota:</span>
              </div>
              <span className="font-bold text-blue-200 text-xs">{waterTarget} ml / day</span>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-1 px-4 min-h-[44px] rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t.common.back}</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-1 px-5 min-h-[44px] rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/30 transition-all"
            >
              <span>{t.common.next}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-5 min-h-[44px] rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/40 transition-all"
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
