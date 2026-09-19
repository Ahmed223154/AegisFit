import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MuscleGroup } from '../../types';
import { Activity, ShieldCheck, Flame, RotateCcw, Crosshair, Dumbbell } from 'lucide-react';

interface MuscleData {
  id: MuscleGroup;
  nameEn: string;
  nameAr: string;
  statusEn: string;
  statusAr: string;
}

const MUSCLE_METADATA: Record<MuscleGroup, MuscleData> = {
  chest: { id: 'chest', nameEn: 'Pectoralis Major', nameAr: 'عضلة الصدر الكبرى', statusEn: 'Prime Anterior Mover', statusAr: 'المحرك الأساسي للصدر' },
  shoulders: { id: 'shoulders', nameEn: 'Deltoids Complex', nameAr: 'المجمع الدالي للكتف', statusEn: 'Scapular Stabilizer', statusAr: 'مثبت لوح الكتف' },
  biceps: { id: 'biceps', nameEn: 'Biceps Brachii', nameAr: 'العضلة ذات الرأسين (بايسبس)', statusEn: 'Elbow Flexor', statusAr: 'قابض مفصل الكوع' },
  triceps: { id: 'triceps', nameEn: 'Triceps Brachii', nameAr: 'العضلة ثلاثية الرؤوس (ترايسبس)', statusEn: 'Elbow Extensor', statusAr: 'باسط مفصل الكوع' },
  forearms: { id: 'forearms', nameEn: 'Brachioradialis / Flexors', nameAr: 'عضلات الساعد والقبضة', statusEn: 'Tactical Grip Vector', statusAr: 'قوة القبضة التكتيكية' },
  abs: { id: 'abs', nameEn: 'Rectus Abdominis', nameAr: 'العضلة المستقيمة البطنية (السكس باك)', statusEn: 'Core Kinetic Transfer', statusAr: 'نقل القوة المركزية' },
  obliques: { id: 'obliques', nameEn: 'External Obliques', nameAr: 'عضلات الخواصر المائلة', statusEn: 'Rotational Armor', statusAr: 'حزام الحماية الدوراني' },
  quads: { id: 'quads', nameEn: 'Quadriceps Femoris', nameAr: 'العضلة رباعية الرؤوس (الفخذ الأمامي)', statusEn: 'Primary Knee Extensor', statusAr: 'المحرك الأساسي للركبة' },
  hamstrings: { id: 'hamstrings', nameEn: 'Biceps Femoris / Hamstrings', nameAr: 'عضلات الفخذ الخلفية', statusEn: 'Posterior Kinetic Chain', statusAr: 'سلسلة القوة الخلفية' },
  calves: { id: 'calves', nameEn: 'Gastrocnemius & Soleus', nameAr: 'عضلة السمانة', statusEn: 'Plantar Flexor & Ankle Armor', statusAr: 'قوة وثبات الكاحل' },
  glutes: { id: 'glutes', nameEn: 'Gluteus Maximus', nameAr: 'عضلة المؤخرة الكبرى (الجلوتس)', statusEn: 'Hip Extension Powerhouse', statusAr: 'محرك قوة بسط الحوض' },
  back_upper: { id: 'back_upper', nameEn: 'Trapezius & Rhomboids', nameAr: 'أعلى الظهر والترابيس', statusEn: 'Thoracic Stability', statusAr: 'دعامة القفص الصدري' },
  lats: { id: 'lats', nameEn: 'Latissimus Dorsi', nameAr: 'عريضة الظهر (المجنص)', statusEn: 'Vertical Pull Engine', statusAr: 'محرك السحب العمودي' }
};

export const AnatomyHUD: React.FC = () => {
  const { language, t, getWeeklyMuscleSetCounts, exercises } = useApp();
  const [view, setView] = useState<'anterior' | 'posterior'>('anterior');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>('chest');

  const setCounts = getWeeklyMuscleSetCounts();

  const getHeatmapColor = (group: MuscleGroup) => {
    const sets = setCounts[group] || 0;
    if (sets === 0) {
      return {
        fill: 'rgba(30, 41, 59, 0.4)',
        stroke: 'rgba(100, 116, 139, 0.4)',
        filter: 'none',
        textColor: 'text-slate-400',
        badge: '0 Sets (Dormant)'
      };
    }
    if (sets <= 6) {
      return {
        fill: 'rgba(6, 182, 212, 0.45)',
        stroke: '#06b6d4',
        filter: 'drop-shadow(0px 0px 8px rgba(6, 182, 212, 0.8))',
        textColor: 'text-cyan-400',
        badge: `${sets} Sets (Recovery / Ready)`
      };
    }
    if (sets <= 14) {
      return {
        fill: 'rgba(16, 185, 129, 0.6)',
        stroke: '#10b981',
        filter: 'drop-shadow(0px 0px 10px rgba(16, 185, 129, 0.85))',
        textColor: 'text-emerald-400',
        badge: `${sets} Sets (Hypertrophy Zone)`
      };
    }
    return {
      fill: 'rgba(244, 63, 94, 0.7)',
      stroke: '#f43f5e',
      filter: 'drop-shadow(0px 0px 12px rgba(244, 63, 94, 0.95))',
      textColor: 'text-rose-400',
      badge: `${sets} Sets (Overdrive Fatigue)`
    };
  };

  const activeData = selectedMuscle ? MUSCLE_METADATA[selectedMuscle] : null;
  const activeColor = selectedMuscle ? getHeatmapColor(selectedMuscle) : null;
  const relevantExercises = selectedMuscle 
    ? exercises.filter(e => e.primaryMuscle === selectedMuscle).slice(0, 3) 
    : [];

  return (
    <div className="relative glass-panel rounded-2xl p-4 sm:p-5 overflow-hidden border border-cyan-500/20">
      {/* Sci-Fi HUD Corner Brackets */}
      <div className="absolute top-2 left-2 text-cyan-500/40 text-xs font-mono select-none">⎡ SYSTEM: HUD-SCAN</div>
      <div className="absolute top-2 right-2 text-cyan-500/40 text-xs font-mono select-none">REF: MK-13 ⎤</div>
      <div className="absolute bottom-2 left-2 text-cyan-500/40 text-xs font-mono select-none">⎣ TELEMETRY: REALTIME</div>
      <div className="absolute bottom-2 right-2 text-cyan-500/40 text-xs font-mono select-none">BIO-RECOVERY ⎦</div>

      {/* Header & Controls */}
      <div className="flex items-center justify-between gap-2 mb-3 mt-1">
        <div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            <h3 className="text-sm font-bold tracking-wider text-slate-100 uppercase font-telemetry">
              {t.dashboard.anatomyMapTitle}
            </h3>
          </div>
          <p className="text-[10px] text-slate-400">
            {t.dashboard.anatomySubtitle}
          </p>
        </div>

        {/* View Switcher (Thumb-friendly touch target) */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-cyan-900/50 shrink-0">
          <button
            type="button"
            onClick={() => setView('anterior')}
            className={`px-2.5 min-h-[32px] rounded-lg text-[11px] font-semibold transition-all duration-200 ${
              view === 'anterior'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.dashboard.frontView}
          </button>
          <button
            type="button"
            onClick={() => setView('posterior')}
            className={`px-2.5 min-h-[32px] rounded-lg text-[11px] font-semibold transition-all duration-200 ${
              view === 'posterior'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.dashboard.rearView}
          </button>
        </div>
      </div>

      {/* Main Mobile Stack: Visual Silhouette + Interactive Detail HUD Card */}
      <div className="flex flex-col gap-3">
        {/* Silhouette SVG Viewport */}
        <div className="flex flex-col items-center justify-center relative min-h-[280px] bg-gradient-to-b from-slate-950/60 to-[#060b17] rounded-xl p-2 border border-slate-800/80">
          {/* Subtle Background Scanning Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0e1e3815_1px,transparent_1px),linear-gradient(to_bottom,#0e1e3815_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none rounded-xl" />

          {/* Central Humanoid Wireframe Silhouette */}
          <svg
            viewBox="0 0 260 480"
            className="w-full max-w-[210px] h-[270px] drop-shadow-[0_0_15px_rgba(6,182,212,0.15)] select-none"
          >
            {/* Cyber Core Background Guides */}
            <line x1="130" y1="20" x2="130" y2="460" stroke="rgba(6, 182, 212, 0.15)" strokeDasharray="3,3" />
            <circle cx="130" cy="40" r="26" fill="none" stroke="rgba(100, 116, 139, 0.3)" strokeWidth="1.5" />
            {/* HUD Reticle over Head */}
            <circle cx="130" cy="40" r="16" fill="none" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1" strokeDasharray="4,4" />

            {view === 'anterior' ? (
              /* ANTERIOR (FRONT) MUSCLES */
              <g id="anterior-muscles">
                {/* SHOULDERS (L & R DELTOIDS) */}
                <path
                  d="M 88 78 C 76 86 64 104 62 120 C 72 122 84 112 88 98 Z"
                  fill={getHeatmapColor('shoulders').fill}
                  stroke={getHeatmapColor('shoulders').stroke}
                  strokeWidth="1.8"
                  style={{ filter: getHeatmapColor('shoulders').filter, cursor: 'pointer' }}
                  onClick={() => setSelectedMuscle('shoulders')}
                />
                <path
                  d="M 172 78 C 184 86 196 104 198 120 C 188 122 176 112 172 98 Z"
                  fill={getHeatmapColor('shoulders').fill}
                  stroke={getHeatmapColor('shoulders').stroke}
                  strokeWidth="1.8"
                  style={{ filter: getHeatmapColor('shoulders').filter, cursor: 'pointer' }}
                  onClick={() => setSelectedMuscle('shoulders')}
                />

                {/* CHEST (PECTORALIS) */}
                <path
                  d="M 94 88 C 114 86 128 92 128 128 C 116 132 94 130 90 108 Z"
                  fill={getHeatmapColor('chest').fill}
                  stroke={getHeatmapColor('chest').stroke}
                  strokeWidth="1.8"
                  style={{ filter: getHeatmapColor('chest').filter, cursor: 'pointer' }}
                  onClick={() => setSelectedMuscle('chest')}
                />
                <path
                  d="M 166 88 C 146 86 132 92 132 128 C 144 132 166 130 170 108 Z"
                  fill={getHeatmapColor('chest').fill}
                  stroke={getHeatmapColor('chest').stroke}
                  strokeWidth="1.8"
                  style={{ filter: getHeatmapColor('chest').filter, cursor: 'pointer' }}
                  onClick={() => setSelectedMuscle('chest')}
                />

                {/* BICEPS (L & R) */}
                <path
                  d="M 60 125 C 56 142 58 162 66 172 C 72 168 76 146 72 126 Z"
                  fill={getHeatmapColor('biceps').fill}
                  stroke={getHeatmapColor('biceps').stroke}
                  strokeWidth="1.8"
                  style={{ filter: getHeatmapColor('biceps').filter, cursor: 'pointer' }}
                  onClick={() => setSelectedMuscle('biceps')}
                />
                <path
                  d="M 200 125 C 204 142 202 162 194 172 C 188 168 184 146 188 126 Z"
                  fill={getHeatmapColor('biceps').fill}
                  stroke={getHeatmapColor('biceps').stroke}
                  strokeWidth="1.8"
                  style={{ filter: getHeatmapColor('biceps').filter, cursor: 'pointer' }}
                  onClick={() => setSelectedMuscle('biceps')}
                />

                {/* FOREARMS (L & R) */}
                <path
                  d="M 64 176 C 56 195 50 218 52 235 C 60 236 68 214 74 190 Z"
                  fill={getHeatmapColor('forearms').fill}
                  stroke={getHeatmapColor('forearms').stroke}
                  strokeWidth="1.8"
                  style={{ filter: getHeatmapColor('forearms').filter, cursor: 'pointer' }}
                  onClick={() => setSelectedMuscle('forearms')}
                />
                <path
                  d="M 196 176 C 204 195 210 218 208 235 C 200 236 192 214 186 190 Z"
                  fill={getHeatmapColor('forearms').fill}
                  stroke={getHeatmapColor('forearms').stroke}
                  strokeWidth="1.8"
                  style={{ filter: getHeatmapColor('forearms').filter, cursor: 'pointer' }}
                  onClick={() => setSelectedMuscle('forearms')}
                />

                {/* ABDOMINALS (ABS) */}
                <path
                  d="M 112 136 L 148 136 L 146 156 L 114 156 Z M 113 160 L 147 160 L 145 182 L 115 182 Z M 115 186 L 145 186 L 140 210 L 120 210 Z"
                  fill={getHeatmapColor('abs').fill}
                  stroke={getHeatmapColor('abs').stroke}
                  strokeWidth="1.6"
                  style={{ filter: getHeatmapColor('abs').filter, cursor: 'pointer' }}
                  onClick={() => setSelectedMuscle('abs')}
                />

                {/* OBLIQUES (L & R) */}
                <path
                  d="M 94 140 C 96 168 102 195 110 206 C 102 204 96 176 92 144 Z"
                  fill={getHeatmapColor('obliques').fill}
                  stroke={getHeatmapColor('obliques').stroke}
                  strokeWidth="1.6"
                  style={{ filter: getHeatmapColor('obliques').filter, cursor: 'pointer' }}
                  onClick={() => setSelectedMuscle('obliques')}
                />
                <path
                  d="M 166 140 C 164 168 158 195 150 206 C 158 204 164 176 168 144 Z"
                  fill={getHeatmapColor('obliques').fill}
                  stroke={getHeatmapColor('obliques').stroke}
                  strokeWidth="1.6"
                  style={{ filter: getHeatmapColor('obliques').filter, cursor: 'pointer' }}
                  onClick={() => setSelectedMuscle('obliques')}
                />

                {/* QUADRICEPS (QUADS) */}
                <path
                  d="M 104 224 C 92 245 88 300 94 330 C 104 332 120 318 124 250 C 122 230 114 225 104 224 Z"
                  fill={getHeatmapColor('quads').fill}
                  stroke={getHeatmapColor('quads').stroke}
                  strokeWidth="1.8"
                  style={{ filter: getHeatmapColor('quads').filter, cursor: 'pointer' }}
                  onClick={() => setSelectedMuscle('quads')}
                />
                <path
                  d="M 156 224 C 168 245 172 300 166 330 C 156 332 140 318 136 250 C 138 230 146 225 156 224 Z"
                  fill={getHeatmapColor('quads').fill}
                  stroke={getHeatmapColor('quads').stroke}
                  strokeWidth="1.8"
                  style={{ filter: getHeatmapColor('quads').filter, cursor: 'pointer' }}
                  onClick={() => setSelectedMuscle('quads')}
                />

                {/* CALVES / TIBIALIS */}
                <path
                  d="M 94 346 C 88 370 88 410 96 438 C 102 436 108 406 108 360 Z"
                  fill={getHeatmapColor('calves').fill}
                  stroke={getHeatmapColor('calves').stroke}
                  strokeWidth="1.8"
                  style={{ filter: getHeatmapColor('calves').filter, cursor: 'pointer' }}
                  onClick={() => setSelectedMuscle('calves')}
                />
                <path
                  d="M 166 346 C 172 370 172 410 164 438 C 158 436 152 406 152 360 Z"
                  fill={getHeatmapColor('calves').fill}
                  stroke={getHeatmapColor('calves').stroke}
                  strokeWidth="1.8"
                  style={{ filter: getHeatmapColor('calves').filter, cursor: 'pointer' }}
                  onClick={() => setSelectedMuscle('calves')}
                />
              </g>
            ) : (
              /* POSTERIOR (BACK) MUSCLES */
              <g id="posterior-muscles">
                {/* UPPER TRAPS & RHOMBOIDS */}
                <path
                  d="M 102 68 L 130 96 L 158 68 L 144 64 L 116 64 Z"
                  fill={getHeatmapColor('back_upper').fill}
                  stroke={getHeatmapColor('back_upper').stroke}
                  strokeWidth="1.8"
                  style={{ filter: getHeatmapColor('back_upper').filter, cursor: 'pointer' }}
                  onClick={() => setSelectedMuscle('back_upper')}
                />
                <path
                  d="M 108 98 L 130 142 L 152 98 Z"
                  fill={getHeatmapColor('back_upper').fill}
                  stroke={getHeatmapColor('back_upper').stroke}
                  strokeWidth="1.8"
                  style={{ filter: getHeatmapColor('back_upper').filter, cursor: 'pointer' }}
                  onClick={() => setSelectedMuscle('back_upper')}
                />

                {/* LATS (LATISSIMUS DORSI) */}
                <path
                  d="M 92 108 C 88 136 100 176 118 190 C 118 162 108 130 102 108 Z"
                  fill={getHeatmapColor('lats').fill}
                  stroke={getHeatmapColor('lats').stroke}
                  strokeWidth="1.8"
                  style={{ filter: getHeatmapColor('lats').filter, cursor: 'pointer' }}
                  onClick={() => setSelectedMuscle('lats')}
                />
                <path
                  d="M 168 108 C 172 136 160 176 142 190 C 142 162 152 130 158 108 Z"
                  fill={getHeatmapColor('lats').fill}
                  stroke={getHeatmapColor('lats').stroke}
                  strokeWidth="1.8"
                  style={{ filter: getHeatmapColor('lats').filter, cursor: 'pointer' }}
                  onClick={() => setSelectedMuscle('lats')}
                />

                {/* TRICEPS (L & R) */}
                <path
                  d="M 64 122 C 58 140 60 162 68 174 C 74 168 76 142 74 122 Z"
                  fill={getHeatmapColor('triceps').fill}
                  stroke={getHeatmapColor('triceps').stroke}
                  strokeWidth="1.8"
                  style={{ filter: getHeatmapColor('triceps').filter, cursor: 'pointer' }}
                  onClick={() => setSelectedMuscle('triceps')}
                />
                <path
                  d="M 196 122 C 202 140 200 162 192 174 C 186 168 184 142 186 122 Z"
                  fill={getHeatmapColor('triceps').fill}
                  stroke={getHeatmapColor('triceps').stroke}
                  strokeWidth="1.8"
                  style={{ filter: getHeatmapColor('triceps').filter, cursor: 'pointer' }}
                  onClick={() => setSelectedMuscle('triceps')}
                />

                {/* GLUTES */}
                <path
                  d="M 102 216 C 96 238 104 266 128 266 C 128 240 120 220 102 216 Z"
                  fill={getHeatmapColor('glutes').fill}
                  stroke={getHeatmapColor('glutes').stroke}
                  strokeWidth="1.8"
                  style={{ filter: getHeatmapColor('glutes').filter, cursor: 'pointer' }}
                  onClick={() => setSelectedMuscle('glutes')}
                />
                <path
                  d="M 158 216 C 164 238 156 266 132 266 C 132 240 140 220 158 216 Z"
                  fill={getHeatmapColor('glutes').fill}
                  stroke={getHeatmapColor('glutes').stroke}
                  strokeWidth="1.8"
                  style={{ filter: getHeatmapColor('glutes').filter, cursor: 'pointer' }}
                  onClick={() => setSelectedMuscle('glutes')}
                />

                {/* HAMSTRINGS */}
                <path
                  d="M 102 272 C 96 295 96 332 104 340 C 114 340 124 316 126 272 Z"
                  fill={getHeatmapColor('hamstrings').fill}
                  stroke={getHeatmapColor('hamstrings').stroke}
                  strokeWidth="1.8"
                  style={{ filter: getHeatmapColor('hamstrings').filter, cursor: 'pointer' }}
                  onClick={() => setSelectedMuscle('hamstrings')}
                />
                <path
                  d="M 158 272 C 164 295 164 332 156 340 C 146 340 136 316 134 272 Z"
                  fill={getHeatmapColor('hamstrings').fill}
                  stroke={getHeatmapColor('hamstrings').stroke}
                  strokeWidth="1.8"
                  style={{ filter: getHeatmapColor('hamstrings').filter, cursor: 'pointer' }}
                  onClick={() => setSelectedMuscle('hamstrings')}
                />

                {/* CALVES (GASTROCNEMIUS) */}
                <path
                  d="M 96 352 C 90 376 92 416 102 438 C 108 438 114 410 114 362 Z"
                  fill={getHeatmapColor('calves').fill}
                  stroke={getHeatmapColor('calves').stroke}
                  strokeWidth="1.8"
                  style={{ filter: getHeatmapColor('calves').filter, cursor: 'pointer' }}
                  onClick={() => setSelectedMuscle('calves')}
                />
                <path
                  d="M 164 352 C 170 376 168 416 158 438 C 152 438 146 410 146 362 Z"
                  fill={getHeatmapColor('calves').fill}
                  stroke={getHeatmapColor('calves').stroke}
                  strokeWidth="1.8"
                  style={{ filter: getHeatmapColor('calves').filter, cursor: 'pointer' }}
                  onClick={() => setSelectedMuscle('calves')}
                />
              </g>
            )}
          </svg>

          {/* Quick instructions indicator */}
          <div className="text-[11px] text-cyan-400/80 font-mono mt-1 flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tap any muscle group to isolate telemetry</span>
          </div>
        </div>

        {/* Selected Muscle Telemetry Card & Recommended Exercises */}
        <div className="flex flex-col gap-2.5">
          {activeData && activeColor ? (
            <div className="bg-slate-900/90 rounded-xl p-3.5 border border-cyan-500/30 glow-cyan">
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5 mb-2.5">
                <div>
                  <span className="text-[9px] font-mono tracking-widest text-cyan-400 uppercase">
                    TARGET TELEMETRY
                  </span>
                  <h4 className="text-base font-black text-slate-100 font-telemetry">
                    {language === 'ar' ? activeData.nameAr : activeData.nameEn}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {language === 'ar' ? activeData.statusAr : activeData.statusEn}
                  </p>
                </div>
                <div className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 border border-cyan-500/40 text-cyan-300 shrink-0">
                  {setCounts[activeData.id] || 0} Sets
                </div>
              </div>

              {/* Status breakdown */}
              <div className="grid grid-cols-2 gap-2 mb-2.5">
                <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                  <div className="text-[9px] text-slate-400 font-mono">7-DAY VOLUME</div>
                  <div className={`text-xs font-bold font-telemetry ${activeColor.textColor} truncate`}>
                    {activeColor.badge}
                  </div>
                </div>
                <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                  <div className="text-[9px] text-slate-400 font-mono">RECOVERY STATUS</div>
                  <div className="text-xs font-bold text-slate-200 font-telemetry flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{(setCounts[activeData.id] || 0) > 12 ? 'Requires Rest' : 'Ready'}</span>
                  </div>
                </div>
              </div>

              {/* Recommended Top Exercises from Database */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-300 mb-2">
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>Prescribed Kinetic Exercises:</span>
                </div>
                <div className="space-y-1.5">
                  {relevantExercises.length > 0 ? (
                    relevantExercises.map(ex => (
                      <div
                        key={ex.id}
                        className="flex items-center justify-between bg-slate-950/60 px-3 py-2 rounded-lg border border-slate-800/80 text-xs"
                      >
                        <span className="font-medium text-slate-200">
                          {language === 'ar' ? ex.nameAr : ex.nameEn}
                        </span>
                        <span className="text-[11px] font-mono text-cyan-400">
                          {ex.targetRepRange}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 italic">
                      Standard compound kinetic patterns apply.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 rounded-xl p-6 text-center text-slate-400 border border-slate-800">
              Select a muscle zone on the wireframe to inspect volume and prescribed protocols.
            </div>
          )}

          {/* Heatmap Legend */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs">
            <div className="font-mono text-slate-400 text-[11px] mb-2 uppercase tracking-wider">
              {t.dashboard.volumeLegend}
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500" />
                <span className="text-slate-300">1 - 6 Sets</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500" />
                <span className="text-slate-300">7 - 14 Sets</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500" />
                <span className="text-slate-300">15+ Sets</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
