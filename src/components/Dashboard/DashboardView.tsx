import React from 'react';
import { useApp } from '../../context/AppContext';
import { AnatomyHUD } from './AnatomyHUD';
import { 
  Flame, 
  Droplets, 
  Dumbbell, 
  Zap, 
  ChevronRight, 
  PlayCircle,
  TrendingUp,
  Sparkles
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: 'gym' | 'nutrition' | 'supplements' | 'water' | 'profile') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { 
    language, 
    t, 
    profile, 
    workouts, 
    waterLog, 
    todayNutrition, 
    weeklySplit, 
    startActiveWorkout 
  } = useApp();

  // Metrics calculation
  const totalWeeklyVolume = workouts.reduce((sum, w) => sum + w.totalVolumeKg, 0);
  const todaysCalories = todayNutrition.entries.reduce((sum, e) => sum + e.calories, 0);
  const targetCalories = profile.targetCalories || 2600;
  const caloriePercent = Math.min(100, Math.round((todaysCalories / targetCalories) * 100));

  const currentWater = waterLog.currentMl;
  const targetWater = waterLog.targetMl || 3500;
  const waterPercent = Math.min(100, Math.round((currentWater / targetWater) * 100));

  // Determine current day's prescribed split
  const dayOfWeek = new Date().getDay(); // 0 is Sunday, 1 is Monday...
  const mappedDay = dayOfWeek === 0 ? 7 : dayOfWeek;
  const todaysSplit = weeklySplit.find(d => d.dayIndex === mappedDay) || weeklySplit[0];

  // Dynamic greeting based on time of day
  const hour = new Date().getHours();
  const getGreeting = () => {
    if (language === 'ar') {
      if (hour < 12) return `صباح الخير، ${profile.name}`;
      if (hour < 18) return `مساء الخير، ${profile.name}`;
      return `أهلاً بك، ${profile.name}`;
    }
    if (hour < 12) return `Good morning, ${profile.name}`;
    if (hour < 18) return `Good afternoon, ${profile.name}`;
    return `Good evening, ${profile.name}`;
  };

  return (
    <div className="w-full flex flex-col space-y-4 pb-8">
      {/* 1. Top: Quick Overview Header (Clean Greeting, Today's Streak, Daily Summary Pills) */}
      <div className="w-full space-y-3">
        {/* Clean Greeting + Streak Pill */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="min-w-0">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-cyan-400 block">
              {language === 'ar' ? 'نظرة عامة يومية' : 'Daily Overview'}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight truncate">
              {getGreeting()}
            </h1>
          </div>

          {/* Today's Streak Pill */}
          <div className="flex items-center gap-2 px-3.5 min-h-[48px] rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-orange-500/15 border border-amber-500/30 text-amber-400 shrink-0 shadow-sm">
            <Flame className="w-5 h-5 fill-amber-400 text-amber-500 shrink-0" />
            <div className="text-left">
              <span className="text-sm font-black font-telemetry leading-none block">
                {profile.streakDays} {language === 'ar' ? 'يوم' : 'DAYS'}
              </span>
              <span className="text-[10px] text-amber-400/80 font-mono block leading-tight">
                {language === 'ar' ? 'سلسلة متواصلة' : 'Streak'}
              </span>
            </div>
          </div>
        </div>

        {/* Daily Summary Pills (Calorie, Water, Volume - Thumb-friendly, min 56px height) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Calorie Summary Pill */}
          <button
            type="button"
            onClick={() => onNavigate('nutrition')}
            className="flex items-center justify-between p-3 min-h-[56px] rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/90 hover:border-amber-500/40 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                <Zap className="w-4 h-4 fill-amber-400/20" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wide block">
                  {language === 'ar' ? 'السعرات اليومية' : 'Daily Calories'}
                </span>
                <span className="text-sm font-black text-slate-100 font-telemetry block">
                  {todaysCalories.toLocaleString()} <span className="text-[11px] font-normal text-slate-400">/ {targetCalories} kcal</span>
                </span>
              </div>
            </div>
            <div className="text-right pl-2">
              <span className="text-xs font-mono font-bold text-amber-400">
                {caloriePercent}%
              </span>
              <div className="w-12 bg-slate-950 h-1.5 rounded-full overflow-hidden mt-1 border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-orange-400 h-full rounded-full"
                  style={{ width: `${caloriePercent}%` }}
                />
              </div>
            </div>
          </button>

          {/* Water Summary Pill */}
          <button
            type="button"
            onClick={() => onNavigate('water')}
            className="flex items-center justify-between p-3 min-h-[56px] rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/90 hover:border-cyan-500/40 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform shrink-0">
                <Droplets className="w-4 h-4 fill-cyan-400/20" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wide block">
                  {language === 'ar' ? 'شرب الماء' : 'Water Intake'}
                </span>
                <span className="text-sm font-black text-slate-100 font-telemetry block">
                  {currentWater} <span className="text-[11px] font-normal text-slate-400">/ {targetWater} ml</span>
                </span>
              </div>
            </div>
            <div className="text-right pl-2">
              <span className="text-xs font-mono font-bold text-cyan-400">
                {waterPercent}%
              </span>
              <div className="w-12 bg-slate-950 h-1.5 rounded-full overflow-hidden mt-1 border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-blue-400 h-full rounded-full"
                  style={{ width: `${waterPercent}%` }}
                />
              </div>
            </div>
          </button>

          {/* Weekly Volume Summary Pill */}
          <button
            type="button"
            onClick={() => onNavigate('gym')}
            className="flex items-center justify-between p-3 min-h-[56px] rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/90 hover:border-emerald-500/40 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wide block">
                  {language === 'ar' ? 'حجم التمرين' : 'Weekly Volume'}
                </span>
                <span className="text-sm font-black text-slate-100 font-telemetry block">
                  {totalWeeklyVolume.toLocaleString()} <span className="text-[11px] font-normal text-slate-400">kg</span>
                </span>
              </div>
            </div>
            <div className="text-right pl-2">
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>{language === 'ar' ? 'نشط' : 'ACTIVE'}</span>
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Middle & Bottom: Interactive Muscle Figure Card + Detail Sheet (Single-Column Vertical Stack) */}
      <AnatomyHUD />

      {/* 3. Today's Workout Focus Card (Clean, Full-Width, 48px+ Touch Buttons) */}
      <div className="w-full bg-slate-900/80 rounded-3xl p-5 border border-slate-800/90 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h3 className="text-sm font-bold text-slate-100 uppercase font-telemetry">
              {language === 'ar' ? 'تمرين اليوم الموصى به' : "Today's Workout Routine"}
            </h3>
          </div>
          <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-slate-950 text-cyan-300 border border-slate-800">
            {todaysSplit?.isRestDay 
              ? (language === 'ar' ? 'يوم راحة' : 'Rest Day')
              : `${todaysSplit?.plannedExercises.length} ${language === 'ar' ? 'تمارين' : 'Exercises'}`}
          </span>
        </div>

        <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-black text-slate-100">
              {language === 'ar' ? todaysSplit?.dayNameAr : todaysSplit?.dayNameEn}
            </h4>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {todaysSplit?.focusMuscleGroups.map(m => (
                <span
                  key={m}
                  className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-semibold bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 uppercase"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              startActiveWorkout(todaysSplit);
              onNavigate('gym');
            }}
            className="min-h-[48px] px-5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
          >
            <PlayCircle className="w-4 h-4" />
            <span>{language === 'ar' ? 'بدء التمرين الآن' : 'Start Workout'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
