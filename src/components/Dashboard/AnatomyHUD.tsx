import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MuscleGroup } from '../../types';
import { 
  Dumbbell, 
  Check, 
  Plus, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface MuscleConfig {
  id: MuscleGroup;
  nameEn: string;
  nameAr: string;
  targetWeeklySets: number;
  category: 'chest' | 'back' | 'arms' | 'shoulders' | 'legs' | 'core';
  view: 'anterior' | 'posterior';
}

const MUSCLE_CONFIG: Record<MuscleGroup, MuscleConfig> = {
  chest: {
    id: 'chest',
    nameEn: 'Chest',
    nameAr: 'عضلات الصدر',
    targetWeeklySets: 16,
    category: 'chest',
    view: 'anterior'
  },
  back_upper: {
    id: 'back_upper',
    nameEn: 'Upper Back & Traps',
    nameAr: 'أعلى الظهر والترابيس',
    targetWeeklySets: 16,
    category: 'back',
    view: 'posterior'
  },
  lats: {
    id: 'lats',
    nameEn: 'Lats (Latissimus)',
    nameAr: 'الظهر العريض (المجنص)',
    targetWeeklySets: 16,
    category: 'back',
    view: 'posterior'
  },
  shoulders: {
    id: 'shoulders',
    nameEn: 'Shoulders',
    nameAr: 'الأكتاف',
    targetWeeklySets: 16,
    category: 'shoulders',
    view: 'anterior'
  },
  biceps: {
    id: 'biceps',
    nameEn: 'Biceps',
    nameAr: 'عضلة البايسبس',
    targetWeeklySets: 14,
    category: 'arms',
    view: 'anterior'
  },
  triceps: {
    id: 'triceps',
    nameEn: 'Triceps',
    nameAr: 'عضلة الترايسبس',
    targetWeeklySets: 14,
    category: 'arms',
    view: 'posterior'
  },
  forearms: {
    id: 'forearms',
    nameEn: 'Forearms',
    nameAr: 'عضلات الساعد',
    targetWeeklySets: 10,
    category: 'arms',
    view: 'anterior'
  },
  abs: {
    id: 'abs',
    nameEn: 'Abs & Core',
    nameAr: 'عضلات البطن والجذع',
    targetWeeklySets: 14,
    category: 'core',
    view: 'anterior'
  },
  obliques: {
    id: 'obliques',
    nameEn: 'Obliques',
    nameAr: 'عضلات الخواصر',
    targetWeeklySets: 12,
    category: 'core',
    view: 'anterior'
  },
  quads: {
    id: 'quads',
    nameEn: 'Quadriceps',
    nameAr: 'عضلات الفخذ الأمامية',
    targetWeeklySets: 16,
    category: 'legs',
    view: 'anterior'
  },
  hamstrings: {
    id: 'hamstrings',
    nameEn: 'Hamstrings',
    nameAr: 'عضلات الفخذ الخلفية',
    targetWeeklySets: 14,
    category: 'legs',
    view: 'posterior'
  },
  glutes: {
    id: 'glutes',
    nameEn: 'Glutes',
    nameAr: 'عضلات الألوية',
    targetWeeklySets: 14,
    category: 'legs',
    view: 'posterior'
  },
  calves: {
    id: 'calves',
    nameEn: 'Calves',
    nameAr: 'عضلات السمانة',
    targetWeeklySets: 12,
    category: 'legs',
    view: 'anterior'
  }
};

type FilterCategory = 'all' | 'chest' | 'back' | 'arms' | 'shoulders' | 'legs' | 'core';

interface CategoryTab {
  id: FilterCategory;
  nameEn: string;
  nameAr: string;
  defaultMuscle: MuscleGroup;
}

const CATEGORIES: CategoryTab[] = [
  { id: 'all', nameEn: 'All', nameAr: 'الكل', defaultMuscle: 'chest' },
  { id: 'chest', nameEn: 'Chest', nameAr: 'الصدر', defaultMuscle: 'chest' },
  { id: 'back', nameEn: 'Back', nameAr: 'الظهر', defaultMuscle: 'lats' },
  { id: 'arms', nameEn: 'Arms', nameAr: 'الذراعين', defaultMuscle: 'biceps' },
  { id: 'shoulders', nameEn: 'Shoulders', nameAr: 'الأكتاف', defaultMuscle: 'shoulders' },
  { id: 'legs', nameEn: 'Legs', nameAr: 'الأرجل', defaultMuscle: 'quads' },
  { id: 'core', nameEn: 'Core', nameAr: 'البطن', defaultMuscle: 'abs' }
];

export const AnatomyHUD: React.FC = () => {
  const { language, getWeeklyMuscleSetCounts, exercises, logQuickSet } = useApp();
  const [view, setView] = useState<'anterior' | 'posterior'>('anterior');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup>('chest');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [justLoggedId, setJustLoggedId] = useState<string | null>(null);

  const setCounts = getWeeklyMuscleSetCounts();
  const currentConfig = MUSCLE_CONFIG[selectedMuscle] || MUSCLE_CONFIG.chest;
  const currentWeeklySets = setCounts[selectedMuscle] || 0;
  const targetWeeklySets = currentConfig.targetWeeklySets;
  const progressPercent = Math.min(100, Math.round((currentWeeklySets / targetWeeklySets) * 100));

  // Top 2 to 3 relevant exercises for this muscle
  const relevantExercises = exercises
    .filter(e => e.primaryMuscle === selectedMuscle)
    .slice(0, 3);

  // Fallback exercises if none directly matched
  const displayExercises = relevantExercises.length > 0 
    ? relevantExercises 
    : exercises.slice(0, 3);

  const handleSelectMuscle = (group: MuscleGroup) => {
    setSelectedMuscle(group);
    const config = MUSCLE_CONFIG[group];
    if (config) {
      setSelectedCategory(config.category);
      // Auto switch view if the muscle lives on the other side
      if (config.view !== view) {
        setView(config.view);
      }
    }
  };

  const handleSelectCategory = (cat: CategoryTab) => {
    setSelectedCategory(cat.id);
    if (cat.id !== 'all') {
      const targetMuscle = cat.defaultMuscle;
      setSelectedMuscle(targetMuscle);
      const config = MUSCLE_CONFIG[targetMuscle];
      if (config && config.view !== view) {
        setView(config.view);
      }
    }
  };

  const handleLogSet = async (exerciseId: string) => {
    setJustLoggedId(exerciseId);
    await logQuickSet(exerciseId);
    setTimeout(() => {
      setJustLoggedId(null);
    }, 1600);
  };

  const getHeatmapColor = (group: MuscleGroup) => {
    const sets = setCounts[group] || 0;
    if (sets === 0) {
      return {
        fill: 'rgba(30, 41, 59, 0.75)',
        stroke: '#475569',
        filter: 'none'
      };
    }
    if (sets <= 6) {
      return {
        fill: 'rgba(6, 182, 212, 0.45)',
        stroke: '#06b6d4',
        filter: 'drop-shadow(0px 0px 8px rgba(6, 182, 212, 0.8))'
      };
    }
    if (sets <= 14) {
      return {
        fill: 'rgba(16, 185, 129, 0.6)',
        stroke: '#10b981',
        filter: 'drop-shadow(0px 0px 10px rgba(16, 185, 129, 0.85))'
      };
    }
    return {
      fill: 'rgba(244, 63, 94, 0.7)',
      stroke: '#f43f5e',
      filter: 'drop-shadow(0px 0px 12px rgba(244, 63, 94, 0.95))'
    };
  };

  const getMuscleStyle = (group: MuscleGroup) => {
    const isSelected = selectedMuscle === group;
    const heatmap = getHeatmapColor(group);

    if (isSelected) {
      return {
        fill: 'rgba(6, 240, 255, 0.95)',
        stroke: '#ffffff',
        strokeWidth: 2.5,
        filter: 'drop-shadow(0px 0px 12px #06b6d4) drop-shadow(0px 0px 4px #ffffff)',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out'
      };
    }

    // Highlight category muscles if category filter active
    const isInSelectedCategory = selectedCategory !== 'all' && MUSCLE_CONFIG[group]?.category === selectedCategory;
    if (isInSelectedCategory) {
      return {
        fill: heatmap.fill,
        stroke: '#38bdf8',
        strokeWidth: 2,
        filter: heatmap.filter,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out'
      };
    }

    return {
      fill: heatmap.fill,
      stroke: heatmap.stroke,
      strokeWidth: 1.5,
      filter: heatmap.filter,
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out'
    };
  };

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Category Filter Pills (Scrollable horizontal row with 48px thumb targets) */}
      <div className="w-full overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center gap-2 min-w-max px-0.5">
          {CATEGORIES.map(cat => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectCategory(cat)}
                className={`min-h-[48px] px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center shrink-0 active:scale-95 ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-400'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800/90'
                }`}
              >
                <span>{language === 'ar' ? cat.nameAr : cat.nameEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Muscle Figure Card (Centered, Spacious, Single Column) */}
      <div className="w-full bg-slate-900/60 rounded-3xl p-4 border border-slate-800/80 flex flex-col items-center relative shadow-xl overflow-hidden">
        {/* Top Card Controls: View Switcher (Front/Back) */}
        <div className="w-full flex items-center justify-between gap-2 mb-2 z-10">
          <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>{language === 'ar' ? 'مجسم العضلات التفاعلي' : 'Interactive Anatomy Model'}</span>
          </div>

          <div className="flex items-center bg-slate-950/90 p-1 rounded-2xl border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setView('anterior')}
              className={`px-3.5 min-h-[38px] rounded-xl text-xs font-bold transition-all ${
                view === 'anterior'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'ar' ? 'أمامي' : 'Front'}
            </button>
            <button
              type="button"
              onClick={() => setView('posterior')}
              className={`px-3.5 min-h-[38px] rounded-xl text-xs font-bold transition-all ${
                view === 'posterior'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'ar' ? 'خلفي' : 'Back'}
            </button>
          </div>
        </div>

        {/* Anatomical Graphic Viewport */}
        <div className="relative w-full flex items-center justify-center py-2">
          <svg
            viewBox="0 0 260 480"
            className="w-full max-w-[240px] sm:max-w-[260px] h-[320px] select-none filter drop-shadow-lg"
          >
            {/* Head Silhouette Outline */}
            <circle cx="130" cy="40" r="24" fill="none" stroke="rgba(100, 116, 139, 0.4)" strokeWidth="1.5" />

            {view === 'anterior' ? (
              /* ANTERIOR (FRONT) MUSCLES */
              <g id="anterior-muscles">
                {/* SHOULDERS */}
                <path
                  d="M 88 78 C 76 86 64 104 62 120 C 72 122 84 112 88 98 Z"
                  style={getMuscleStyle('shoulders')}
                  onClick={() => handleSelectMuscle('shoulders')}
                />
                <path
                  d="M 172 78 C 184 86 196 104 198 120 C 188 122 176 112 172 98 Z"
                  style={getMuscleStyle('shoulders')}
                  onClick={() => handleSelectMuscle('shoulders')}
                />

                {/* CHEST */}
                <path
                  d="M 94 88 C 114 86 128 92 128 128 C 116 132 94 130 90 108 Z"
                  style={getMuscleStyle('chest')}
                  onClick={() => handleSelectMuscle('chest')}
                />
                <path
                  d="M 166 88 C 146 86 132 92 132 128 C 144 132 166 130 170 108 Z"
                  style={getMuscleStyle('chest')}
                  onClick={() => handleSelectMuscle('chest')}
                />

                {/* BICEPS */}
                <path
                  d="M 64 122 C 58 136 60 156 66 166 C 72 160 76 142 74 122 Z"
                  style={getMuscleStyle('biceps')}
                  onClick={() => handleSelectMuscle('biceps')}
                />
                <path
                  d="M 196 122 C 202 136 200 156 194 166 C 188 160 184 142 186 122 Z"
                  style={getMuscleStyle('biceps')}
                  onClick={() => handleSelectMuscle('biceps')}
                />

                {/* FOREARMS */}
                <path
                  d="M 60 170 C 52 186 52 216 58 226 C 64 220 68 196 68 174 Z"
                  style={getMuscleStyle('forearms')}
                  onClick={() => handleSelectMuscle('forearms')}
                />
                <path
                  d="M 200 170 C 208 186 208 216 202 226 C 196 220 192 196 192 174 Z"
                  style={getMuscleStyle('forearms')}
                  onClick={() => handleSelectMuscle('forearms')}
                />

                {/* CORE / ABS */}
                <path
                  d="M 108 134 C 114 132 126 132 128 134 C 128 160 126 186 128 214 C 124 216 112 216 108 214 C 110 186 108 160 108 134 Z"
                  style={getMuscleStyle('abs')}
                  onClick={() => handleSelectMuscle('abs')}
                />
                <path
                  d="M 152 134 C 146 132 134 132 132 134 C 132 160 134 186 132 214 C 136 216 148 216 152 214 C 150 186 152 160 152 134 Z"
                  style={getMuscleStyle('abs')}
                  onClick={() => handleSelectMuscle('abs')}
                />

                {/* QUADS */}
                <path
                  d="M 104 224 C 92 245 88 300 94 330 C 104 332 120 318 124 250 C 122 230 114 225 104 224 Z"
                  style={getMuscleStyle('quads')}
                  onClick={() => handleSelectMuscle('quads')}
                />
                <path
                  d="M 156 224 C 168 245 172 300 166 330 C 156 332 140 318 136 250 C 138 230 146 225 156 224 Z"
                  style={getMuscleStyle('quads')}
                  onClick={() => handleSelectMuscle('quads')}
                />

                {/* CALVES */}
                <path
                  d="M 94 346 C 88 370 88 410 96 438 C 102 436 108 406 108 360 Z"
                  style={getMuscleStyle('calves')}
                  onClick={() => handleSelectMuscle('calves')}
                />
                <path
                  d="M 166 346 C 172 370 172 410 164 438 C 158 436 152 406 152 360 Z"
                  style={getMuscleStyle('calves')}
                  onClick={() => handleSelectMuscle('calves')}
                />
              </g>
            ) : (
              /* POSTERIOR (BACK) MUSCLES */
              <g id="posterior-muscles">
                {/* UPPER BACK & TRAPS */}
                <path
                  d="M 102 68 L 130 96 L 158 68 L 144 64 L 116 64 Z"
                  style={getMuscleStyle('back_upper')}
                  onClick={() => handleSelectMuscle('back_upper')}
                />
                <path
                  d="M 108 98 L 130 142 L 152 98 Z"
                  style={getMuscleStyle('back_upper')}
                  onClick={() => handleSelectMuscle('back_upper')}
                />

                {/* LATS */}
                <path
                  d="M 92 108 C 88 136 100 176 118 190 C 118 162 108 130 102 108 Z"
                  style={getMuscleStyle('lats')}
                  onClick={() => handleSelectMuscle('lats')}
                />
                <path
                  d="M 168 108 C 172 136 160 176 142 190 C 142 162 152 130 158 108 Z"
                  style={getMuscleStyle('lats')}
                  onClick={() => handleSelectMuscle('lats')}
                />

                {/* TRICEPS */}
                <path
                  d="M 64 122 C 58 140 60 162 68 174 C 74 168 76 142 74 122 Z"
                  style={getMuscleStyle('triceps')}
                  onClick={() => handleSelectMuscle('triceps')}
                />
                <path
                  d="M 196 122 C 202 140 200 162 192 174 C 186 168 184 142 186 122 Z"
                  style={getMuscleStyle('triceps')}
                  onClick={() => handleSelectMuscle('triceps')}
                />

                {/* GLUTES */}
                <path
                  d="M 102 216 C 96 238 104 266 128 266 C 128 240 120 220 102 216 Z"
                  style={getMuscleStyle('glutes')}
                  onClick={() => handleSelectMuscle('glutes')}
                />
                <path
                  d="M 158 216 C 164 238 156 266 132 266 C 132 240 140 220 158 216 Z"
                  style={getMuscleStyle('glutes')}
                  onClick={() => handleSelectMuscle('glutes')}
                />

                {/* HAMSTRINGS */}
                <path
                  d="M 102 272 C 96 295 96 332 104 340 C 114 340 124 316 126 272 Z"
                  style={getMuscleStyle('hamstrings')}
                  onClick={() => handleSelectMuscle('hamstrings')}
                />
                <path
                  d="M 158 272 C 164 295 164 332 156 340 C 146 340 136 316 134 272 Z"
                  style={getMuscleStyle('hamstrings')}
                  onClick={() => handleSelectMuscle('hamstrings')}
                />

                {/* CALVES */}
                <path
                  d="M 96 352 C 90 376 92 416 102 438 C 108 438 114 410 114 362 Z"
                  style={getMuscleStyle('calves')}
                  onClick={() => handleSelectMuscle('calves')}
                />
                <path
                  d="M 164 352 C 170 376 168 416 158 438 C 152 438 146 410 146 362 Z"
                  style={getMuscleStyle('calves')}
                  onClick={() => handleSelectMuscle('calves')}
                />
              </g>
            )}
          </svg>
        </div>

        {/* Minimal Heatmap Legend */}
        <div className="flex items-center justify-center gap-3 pt-2 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-600" />
            <span>0</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>1-6</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>7-14</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>15+</span>
          </div>
        </div>
      </div>

      {/* Detail Sheet / Selected Muscle Card (Clean, Full-Width, Scannable Data) */}
      <div className="w-full bg-slate-900/80 rounded-3xl p-5 border border-slate-800/90 shadow-xl space-y-4">
        {/* Muscle Name & Category Badge */}
        <div className="flex items-center justify-between gap-3 pb-1 border-b border-slate-800/70">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
              {language === 'ar' ? 'العضلة المحددة' : 'Selected Muscle'}
            </span>
            <h3 className="text-xl font-black text-slate-100 tracking-tight">
              {language === 'ar' ? currentConfig.nameAr : currentConfig.nameEn}
            </h3>
          </div>

          <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700/80">
            {currentWeeklySets >= targetWeeklySets 
              ? (language === 'ar' ? 'مكتمل' : 'OPTIMAL')
              : `${progressPercent}%`}
          </span>
        </div>

        {/* Weekly Sets Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200">
              {language === 'ar'
                ? `${currentWeeklySets} / ${targetWeeklySets} جولات هذا الأسبوع`
                : `${currentWeeklySets} / ${targetWeeklySets} sets this week`}
            </span>
            <span className="text-slate-400 text-[11px] font-mono">
              {language === 'ar' ? `الهدف: ${targetWeeklySets} جولة` : `Target: ${targetWeeklySets}`}
            </span>
          </div>

          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Top Exercises List (2 to 3 clean rounded cards with + Log Set button) */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'ar' ? 'أهم التمارين المقترحة' : 'Top Exercises'}</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {language === 'ar' ? 'تسجيل سريع' : 'Quick Set'}
            </span>
          </div>

          <div className="space-y-2">
            {displayExercises.map(ex => {
              const isJustLogged = justLoggedId === ex.id;
              return (
                <div
                  key={ex.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all min-h-[56px] gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-100 truncate">
                        {language === 'ar' ? ex.nameAr : ex.nameEn}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono capitalize block truncate">
                        {ex.category} • {ex.targetRepRange || '8-12 reps'}
                      </span>
                    </div>
                  </div>

                  {/* Ergonomic + Log Set Button (min 48px height) */}
                  <button
                    type="button"
                    onClick={() => handleLogSet(ex.id)}
                    className={`min-h-[48px] px-4 rounded-xl font-bold text-xs shrink-0 flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md ${
                      isJustLogged
                        ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/25 ring-2 ring-emerald-400'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
                    }`}
                  >
                    {isJustLogged ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>{language === 'ar' ? 'تم التسجيل' : 'Logged!'}</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>{language === 'ar' ? '+ تسجيل جولة' : '+ Log Set'}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
