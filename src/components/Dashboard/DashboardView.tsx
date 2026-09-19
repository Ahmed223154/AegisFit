import React from 'react';
import { useApp } from '../../context/AppContext';
import { AnatomyHUD } from './AnatomyHUD';
import { 
  Flame, 
  Droplets, 
  Dumbbell, 
  Utensils, 
  Trophy as TrophyIcon, 
  Zap, 
  TrendingUp, 
  ChevronRight, 
  Award,
  PlayCircle
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
    trophies, 
    bodyweightHistory, 
    addWaterMl,
    startActiveWorkout 
  } = useApp();

  // Calculate totals
  const totalWeeklyVolume = workouts.reduce((sum, w) => sum + w.totalVolumeKg, 0);
  const todaysCalories = todayNutrition.entries.reduce((sum, e) => sum + e.calories, 0);
  const todaysProtein = todayNutrition.entries.reduce((sum, e) => sum + e.proteinGrams, 0);

  const waterPercent = Math.min(100, Math.round((waterLog.currentMl / (waterLog.targetMl || 3750)) * 100));
  const caloriePercent = Math.min(100, Math.round((todaysCalories / (profile.targetCalories || 2500)) * 100));
  const proteinPercent = Math.min(100, Math.round((todaysProtein / (profile.targetProteinGrams || 150)) * 100));

  // Determine current day's prescribed split
  const dayOfWeek = new Date().getDay(); // 0 is Sunday, 1 is Monday...
  // Map day to 1-7 (Monday = 1)
  const mappedDay = dayOfWeek === 0 ? 7 : dayOfWeek;
  const todaysSplit = weeklySplit.find(d => d.dayIndex === mappedDay) || weeklySplit[0];

  // Active or top trophies
  const unlockedCount = trophies.filter(tr => tr.unlockedAt).length;

  return (
    <div className="space-y-3 pb-6">
      {/* Telemetry Header Mobile Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-[#0a1324] to-slate-900 p-3.5 border border-cyan-500/20 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-md shadow-cyan-500/30 font-telemetry shrink-0">
              L{profile.currentLevel}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-black tracking-wider text-slate-100 uppercase font-telemetry truncate max-w-[150px]">
                  {profile.name}
                </h2>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                  READY
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                <span className="flex items-center gap-1 text-amber-400">
                  <Flame className="w-3 h-3" />
                  {profile.streakDays}d
                </span>
                <span>•</span>
                <span className="text-cyan-300 font-semibold">
                  {profile.totalXp} XP
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className="text-[10px] font-mono text-cyan-400 border border-cyan-500/30 px-2 py-1 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/40 shrink-0"
          >
            {t.nav.profile}
          </button>
        </div>

        {/* Quick Action Buttons (Thumb-friendly 44px min height) */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => {
              startActiveWorkout(todaysSplit);
              onNavigate('gym');
            }}
            className="flex items-center justify-center gap-1.5 px-3 min-h-[44px] rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/25 transition-all"
          >
            <PlayCircle className="w-4 h-4 shrink-0" />
            <span className="truncate">{t.dashboard.quickLogWorkout}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('nutrition')}
            className="flex items-center justify-center gap-1.5 px-3 min-h-[44px] rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700/80 transition-all"
          >
            <Utensils className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t.dashboard.quickLogMeal}</span>
          </button>
        </div>
      </div>

      {/* 2-Column Mobile Metric Telemetry Cards */}
      <div className="grid grid-cols-2 gap-2">
        {/* Weekly Volume */}
        <div 
          onClick={() => onNavigate('gym')}
          className="glass-panel p-3 rounded-xl border border-slate-800 cursor-pointer hover:border-cyan-500/40 transition-colors flex flex-col justify-between min-h-[96px]"
        >
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="truncate">{t.dashboard.weeklyVolume}</span>
            <Dumbbell className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-100 font-telemetry">
              {totalWeeklyVolume.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">{t.common.kg}</span>
            </div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono mt-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>+12% vs last cycle</span>
            </div>
          </div>
        </div>

        {/* Water Intake */}
        <div 
          onClick={() => onNavigate('water')}
          className="glass-panel p-3 rounded-xl border border-slate-800 cursor-pointer hover:border-blue-500/40 transition-colors flex flex-col justify-between min-h-[96px]"
        >
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="truncate">{t.dashboard.waterProgress}</span>
            <Droplets className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-100 font-telemetry">
              {waterLog.currentMl} <span className="text-[10px] font-normal text-slate-400">/ {waterLog.targetMl} ml</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${waterPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Caloric Intake */}
        <div 
          onClick={() => onNavigate('nutrition')}
          className="glass-panel p-3 rounded-xl border border-slate-800 cursor-pointer hover:border-amber-500/40 transition-colors flex flex-col justify-between min-h-[96px]"
        >
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="truncate">{t.dashboard.caloriesBalance}</span>
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-100 font-telemetry">
              {todaysCalories} <span className="text-[10px] font-normal text-slate-400">/ {profile.targetCalories} kcal</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${caloriePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Protein Target */}
        <div 
          onClick={() => onNavigate('nutrition')}
          className="glass-panel p-3 rounded-xl border border-slate-800 cursor-pointer hover:border-emerald-500/40 transition-colors flex flex-col justify-between min-h-[96px]"
        >
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="truncate">{t.nutrition.protein}</span>
            <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-100 font-telemetry">
              {todaysProtein} <span className="text-[10px] font-normal text-slate-400">/ {profile.targetProteinGrams} g</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${proteinPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* The Biomechanical Iron Man Heatmap HUD */}
      <AnatomyHUD />

      {/* Single Column Mobile Stack: Today's Prescribed Split + Bodyweight + Medals */}
      <div className="flex flex-col gap-2.5">
        {/* Prescribed Split Mobile Card */}
        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <h3 className="text-xs font-bold text-slate-100 uppercase font-telemetry">
                {t.dashboard.todaysFocus}
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-cyan-300">
              {todaysSplit?.isRestDay ? t.common.restDay : `${todaysSplit?.focusMuscleGroups.length} Muscle Zones`}
            </span>
          </div>

          <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80">
            <h4 className="text-sm font-black text-slate-100 font-telemetry mb-1">
              {language === 'ar' ? todaysSplit?.dayNameAr : todaysSplit?.dayNameEn}
            </h4>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {todaysSplit?.focusMuscleGroups.map(m => (
                <span
                  key={m}
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-800/40"
                >
                  {m.toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
            <span className="text-[11px] text-slate-400 font-mono">
              {todaysSplit?.plannedExercises.length} Exercises Planned
            </span>
            <button
              type="button"
              onClick={() => {
                startActiveWorkout(todaysSplit);
                onNavigate('gym');
              }}
              className="flex items-center gap-1.5 px-3 min-h-[44px] rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/25 transition-all"
            >
              <span>{t.gym.startWorkout}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bodyweight Sparkline Card */}
        <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              {t.dashboard.weightTrend}
            </h4>
            <span className="text-xs font-bold font-telemetry text-cyan-400">
              {profile.weightKg} {t.common.kg}
            </span>
          </div>

          {/* Sparkline Graphic */}
          <div className="h-16 w-full flex items-end justify-between gap-1.5 pt-1">
            {bodyweightHistory.map((bw, idx) => {
              const heightPercent = Math.min(100, Math.max(25, Math.round(((bw.weightKg - 75) / 15) * 100)));
              return (
                <div key={bw.id || idx} className="flex-1 flex flex-col items-center gap-1 group">
                  <div 
                    className="w-full bg-gradient-to-t from-cyan-600/40 to-cyan-400 rounded-t transition-all group-hover:from-cyan-500 group-hover:to-cyan-300"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[8px] font-mono text-slate-500">
                    {bw.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Trophy Milestone Badge */}
        <div 
          onClick={() => onNavigate('gym')}
          className="glass-panel p-3 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer hover:border-amber-500/40 transition-colors min-h-[44px]"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm shadow-amber-500/20 shrink-0">
              <TrophyIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200 font-telemetry">
                {t.dashboard.recentTrophies}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {unlockedCount} / {trophies.length} Medals Unlocked
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>
      </div>
    </div>
  );
};
