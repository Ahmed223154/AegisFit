import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  MuscleGroup, 
  Exercise, 
  WorkoutSession, 
  WorkoutSet, 
  LoggedExercise 
} from '../../types';
import { calculateEstimated1RM } from '../../utils/calculations';
import { 
  Dumbbell, 
  Play, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Clock, 
  Search, 
  Filter, 
  RotateCcw, 
  Award, 
  Trophy as TrophyIcon, 
  Calendar, 
  Layers, 
  X, 
  Zap,
  Timer
} from 'lucide-react';

export const GymModule: React.FC = () => {
  const { 
    language, 
    t, 
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
    trophies
  } = useApp();

  const [activeTab, setActiveTab] = useState<'tracker' | 'split' | 'library' | 'history' | 'trophies'>('tracker');
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>('all');
  
  // Custom Exercise Creation Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExNameEn, setNewExNameEn] = useState('');
  const [newExNameAr, setNewExNameAr] = useState('');
  const [newExMuscle, setNewExMuscle] = useState<MuscleGroup>('chest');
  const [newExCategory, setNewExCategory] = useState<'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight'>('dumbbell');
  const [newExReps, setNewExReps] = useState('8 - 12 reps');

  // Exercise Picker Modal during active workout
  const [showPickerModal, setShowPickerModal] = useState(false);

  // Active workout elapsed timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Rest Timer
  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const [restDuration, setRestDuration] = useState(90);

  useEffect(() => {
    let interval: any = null;
    if (activeWorkout) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [activeWorkout]);

  useEffect(() => {
    let interval: any = null;
    if (restSeconds !== null && restSeconds > 0) {
      interval = setInterval(() => {
        setRestSeconds(prev => (prev !== null && prev > 1 ? prev - 1 : null));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [restSeconds]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Set management in Active Workout
  const handleToggleSetComplete = (exIdx: number, setIdx: number) => {
    if (!activeWorkout) return;
    const updatedExercises = [...activeWorkout.exercises];
    const targetSet = updatedExercises[exIdx].sets[setIdx];
    targetSet.completed = !targetSet.completed;

    updateActiveWorkout({
      ...activeWorkout,
      exercises: updatedExercises
    });

    // Start rest timer automatically if completed
    if (targetSet.completed) {
      setRestSeconds(restDuration);
    }
  };

  const handleUpdateSet = (exIdx: number, setIdx: number, field: 'weightKg' | 'reps', val: number) => {
    if (!activeWorkout) return;
    const updatedExercises = [...activeWorkout.exercises];
    updatedExercises[exIdx].sets[setIdx][field] = val;

    updateActiveWorkout({
      ...activeWorkout,
      exercises: updatedExercises
    });
  };

  const handleAddSet = (exIdx: number) => {
    if (!activeWorkout) return;
    const updatedExercises = [...activeWorkout.exercises];
    const prevSet = updatedExercises[exIdx].sets[updatedExercises[exIdx].sets.length - 1];
    const newSet: WorkoutSet = {
      id: `set_${Date.now()}`,
      setNumber: updatedExercises[exIdx].sets.length + 1,
      weightKg: prevSet ? prevSet.weightKg : 60,
      reps: prevSet ? prevSet.reps : 10,
      completed: false
    };
    updatedExercises[exIdx].sets.push(newSet);
    updateActiveWorkout({ ...activeWorkout, exercises: updatedExercises });
  };

  const handleRemoveSet = (exIdx: number, setIdx: number) => {
    if (!activeWorkout) return;
    const updatedExercises = [...activeWorkout.exercises];
    updatedExercises[exIdx].sets.splice(setIdx, 1);
    // Renumber sets
    updatedExercises[exIdx].sets.forEach((s, idx) => s.setNumber = idx + 1);
    updateActiveWorkout({ ...activeWorkout, exercises: updatedExercises });
  };

  const handleRemoveExercise = (exIdx: number) => {
    if (!activeWorkout) return;
    const updatedExercises = [...activeWorkout.exercises];
    updatedExercises.splice(exIdx, 1);
    updateActiveWorkout({ ...activeWorkout, exercises: updatedExercises });
  };

  const handleAddExerciseToActive = (ex: Exercise) => {
    if (!activeWorkout) return;
    const newLoggedEx: LoggedExercise = {
      exerciseId: ex.id,
      exerciseName: ex.nameEn,
      muscleGroup: ex.primaryMuscle,
      sets: [
        { id: `s_${Date.now()}_1`, setNumber: 1, weightKg: 60, reps: 10, completed: false },
        { id: `s_${Date.now()}_2`, setNumber: 2, weightKg: 60, reps: 10, completed: false },
        { id: `s_${Date.now()}_3`, setNumber: 3, weightKg: 60, reps: 10, completed: false }
      ]
    };
    updateActiveWorkout({
      ...activeWorkout,
      exercises: [...activeWorkout.exercises, newLoggedEx]
    });
    setShowPickerModal(false);
  };

  // Custom Exercise Creation
  const handleSaveCustomExercise = async () => {
    if (!newExNameEn.trim()) return;
    const customEx: Exercise = {
      id: `custom_${Date.now()}`,
      nameEn: newExNameEn.trim(),
      nameAr: newExNameAr.trim() || newExNameEn.trim(),
      primaryMuscle: newExMuscle,
      secondaryMuscles: [],
      category: newExCategory,
      difficulty: 'intermediate',
      instructionsEn: 'Tactical custom exercise movement pattern.',
      instructionsAr: 'حركة تمرين تكتيكية مخصصة.',
      targetRepRange: newExReps,
      defaultSets: 3
    };
    await addCustomExercise(customEx);
    setNewExNameEn('');
    setNewExNameAr('');
    setShowAddModal(false);
  };

  // Filter exercises
  const filteredExercises = exercises.filter(e => {
    const matchesSearch = 
      e.nameEn.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
      e.nameAr.includes(exerciseSearch);
    const matchesMuscle = selectedMuscleFilter === 'all' || e.primaryMuscle === selectedMuscleFilter;
    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="space-y-3 pb-6">
      {/* Header Tabs: Mobile-First Horizontally Scrollable Pills */}
      <div className="flex flex-col gap-2 border-b border-slate-800 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Dumbbell className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold tracking-wider text-slate-100 font-telemetry uppercase">
              {t.gym.moduleTitle}
            </h2>
          </div>
          {activeWorkout && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
              LIVE
            </span>
          )}
        </div>

        {/* Tab Selector: Horizontally Scrollable Chips */}
        <div className="overflow-x-auto no-scrollbar flex items-center gap-1.5 pb-0.5">
          <button
            type="button"
            onClick={() => setActiveTab('tracker')}
            className={`px-3 min-h-[36px] rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'tracker' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeWorkout ? t.gym.workoutInProgress : t.gym.startWorkout}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('split')}
            className={`px-3 min-h-[36px] rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'split' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.gym.currentSplit}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`px-3 min-h-[36px] rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'library' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.gym.exerciseLibrary}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3 min-h-[36px] rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'history' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.gym.loggedHistory}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('trophies')}
            className={`px-3 min-h-[36px] rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'trophies' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.gym.trophyShowcase}
          </button>
        </div>
      </div>

      {/* TAB 1: ACTIVE WORKOUT TRACKER */}
      {activeTab === 'tracker' && (
        <div>
          {activeWorkout ? (
            <div className="space-y-3">
              {/* Active Session Telemetry Mobile Card */}
              <div className="glass-panel p-3.5 rounded-2xl border border-cyan-500/30 glow-cyan space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase">
                      COMBAT PROTOCOL LIVE
                    </div>
                    <h3 className="text-base font-black text-slate-100 font-telemetry">
                      {activeWorkout.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Elapsed Timer */}
                    <div className="flex items-center gap-1 bg-slate-950/90 px-2.5 py-1 rounded-xl border border-slate-800 text-slate-100 font-mono text-xs">
                      <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                      <span>{formatTimer(elapsedSeconds)}</span>
                    </div>

                    {/* Rest Interval Timer Indicator */}
                    {restSeconds !== null && (
                      <div className="flex items-center gap-1 bg-amber-950/80 px-2.5 py-1 rounded-xl border border-amber-500/40 text-amber-300 font-mono text-xs animate-pulse">
                        <Timer className="w-3.5 h-3.5" />
                        <span>{restSeconds}s</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Action Buttons (Min 44px height) */}
                <div className="grid grid-cols-5 gap-2 pt-1 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={finishActiveWorkout}
                    className="col-span-4 min-h-[44px] rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{t.gym.finishWorkout}</span>
                  </button>
                  <button
                    type="button"
                    onClick={discardActiveWorkout}
                    className="col-span-1 min-h-[44px] rounded-xl text-xs font-bold bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 flex items-center justify-center transition-all"
                    title={t.gym.discardWorkout}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Logged Exercises List */}
              <div className="space-y-3">
                {activeWorkout.exercises.map((ex, exIdx) => (
                  <div key={`${ex.exerciseId}_${exIdx}`} className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Dumbbell className="w-4 h-4 text-cyan-400 shrink-0" />
                        <h4 className="font-bold text-slate-100 text-sm font-telemetry truncate max-w-[210px]">
                          {ex.exerciseName}
                        </h4>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 uppercase shrink-0">
                          {ex.muscleGroup}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(exIdx)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Mobile-Friendly Sets List */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1 uppercase">
                        <span className="w-8">SET</span>
                        <span className="flex-1 text-center">KG</span>
                        <span className="flex-1 text-center">REPS</span>
                        <span className="w-14 text-center">1RM</span>
                        <span className="w-12 text-right">DONE</span>
                      </div>

                      {ex.sets.map((set, setIdx) => {
                        const est1RM = calculateEstimated1RM(set.weightKg, set.reps);
                        return (
                          <div
                            key={set.id || setIdx}
                            className={`flex items-center justify-between gap-1.5 p-1.5 rounded-xl transition-colors ${
                              set.completed
                                ? 'bg-cyan-950/40 border border-cyan-500/30'
                                : 'bg-slate-950/70 border border-slate-800/80'
                            }`}
                          >
                            <span className="w-8 font-mono font-bold text-xs text-slate-300 text-center">
                              #{set.setNumber}
                            </span>
                            
                            {/* Weight Input */}
                            <div className="flex-1">
                              <input
                                type="number"
                                min="0"
                                step="2.5"
                                value={set.weightKg || ''}
                                onChange={e => handleUpdateSet(exIdx, setIdx, 'weightKg', parseFloat(e.target.value) || 0)}
                                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg h-10 text-xs text-center text-slate-100 font-mono font-bold focus:border-cyan-400 focus:outline-none"
                              />
                            </div>

                            {/* Reps Input */}
                            <div className="flex-1">
                              <input
                                type="number"
                                min="1"
                                value={set.reps || ''}
                                onChange={e => handleUpdateSet(exIdx, setIdx, 'reps', parseInt(e.target.value, 10) || 0)}
                                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg h-10 text-xs text-center text-slate-100 font-mono font-bold focus:border-cyan-400 focus:outline-none"
                              />
                            </div>

                            {/* 1RM estimation */}
                            <div className="w-14 text-center font-mono text-[11px] text-cyan-400 font-bold">
                              {est1RM}kg
                            </div>

                            {/* Set Completion & Delete buttons (Thumb-friendly 44px targets) */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleToggleSetComplete(exIdx, setIdx)}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                  set.completed
                                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                                }`}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveSet(exIdx, setIdx)}
                                className="p-1 text-slate-600 hover:text-rose-400"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddSet(exIdx)}
                      className="mt-2 w-full min-h-[40px] rounded-lg border border-dashed border-slate-700 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 text-xs font-mono flex items-center justify-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Additional Set</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Exercise to Session Button (Min 44px) */}
              <button
                type="button"
                onClick={() => setShowPickerModal(true)}
                className="w-full min-h-[44px] rounded-xl bg-slate-900/90 border border-cyan-500/40 text-cyan-300 hover:bg-slate-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-950"
              >
                <Plus className="w-4 h-4" />
                <span>{t.gym.addExercise}</span>
              </button>
            </div>
          ) : (
            /* Standby State: Prompt to Start Workout */
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center space-y-3.5">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto glow-cyan">
                <Dumbbell className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100 font-telemetry uppercase tracking-wider">
                  Tactical Gym Protocol Idle
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Select your prescribed split or start an adaptive free training session to begin telemetry logging.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => startActiveWorkout()}
                  className="w-full min-h-[44px] rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 transition-all uppercase tracking-wider"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{t.gym.startWorkout}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('split')}
                  className="w-full min-h-[44px] rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all uppercase flex items-center justify-center"
                >
                  <span>{t.gym.currentSplit}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE MICROCYCLE SPLIT (Single Column Mobile Stack) */}
      {activeTab === 'split' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-slate-400 font-mono">
              7-Day Goal-Calibrated Kinetic Split
            </p>
            <button
              type="button"
              onClick={regenerateSplit}
              className="flex items-center gap-1.5 px-2.5 min-h-[36px] rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.gym.regenerateSplit}</span>
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {weeklySplit.map(day => (
              <div
                key={day.dayIndex}
                className={`glass-panel p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                  day.isRestDay ? 'border-slate-800/60 opacity-80' : 'border-cyan-500/20 hover:border-cyan-500/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono text-cyan-400 uppercase font-bold">
                      {t.common.day} {day.dayIndex}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400">
                      {day.isRestDay ? t.common.restDay : `${day.plannedExercises.length} Exercises`}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-100 font-telemetry mb-1.5">
                    {language === 'ar' ? day.dayNameAr : day.dayNameEn}
                  </h4>

                  {!day.isRestDay && (
                    <div className="flex flex-wrap gap-1 mb-2.5">
                      {day.focusMuscleGroups.map(m => (
                        <span key={m} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                          {m}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {!day.isRestDay ? (
                  <button
                    type="button"
                    onClick={() => {
                      startActiveWorkout(day);
                      setActiveTab('tracker');
                    }}
                    className="w-full min-h-[44px] rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Initiate Day {day.dayIndex}</span>
                  </button>
                ) : (
                  <div className="text-xs text-slate-500 italic py-2 text-center border-t border-slate-800/60 mt-1">
                    Active recovery & cellular regeneration
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: EXERCISE DATABASE (Single Column Mobile List) */}
      {activeTab === 'library' && (
        <div className="space-y-3">
          {/* Controls: Search, Filter, Add Custom */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 min-h-[44px]">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder={t.common.search}
                value={exerciseSearch}
                onChange={e => setExerciseSearch(e.target.value)}
                className="bg-transparent text-xs text-slate-100 focus:outline-none w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedMuscleFilter}
                onChange={e => setSelectedMuscleFilter(e.target.value)}
                aria-label="Filter exercises by muscle group"
                className="bg-slate-900 border border-slate-800 rounded-xl px-2 min-h-[44px] text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">{t.gym.allMuscles}</option>
                <option value="chest">Chest</option>
                <option value="back_upper">Back (Upper / Traps)</option>
                <option value="lats">Lats</option>
                <option value="shoulders">Shoulders</option>
                <option value="biceps">Biceps</option>
                <option value="triceps">Triceps</option>
                <option value="quads">Quads</option>
                <option value="hamstrings">Hamstrings</option>
                <option value="glutes">Glutes</option>
                <option value="calves">Calves</option>
                <option value="abs">Core & Abs</option>
              </select>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center gap-1.5 px-2 min-h-[44px] rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-md shadow-cyan-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Custom</span>
              </button>
            </div>
          </div>

          {/* Exercises Single Column Stack */}
          <div className="flex flex-col gap-2">
            {filteredExercises.map(ex => (
              <div key={ex.id} className="glass-panel p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40 uppercase">
                      {ex.primaryMuscle}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 uppercase">
                      {ex.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 font-telemetry">
                    {language === 'ar' ? ex.nameAr : ex.nameEn}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {language === 'ar' ? ex.instructionsAr : ex.instructionsEn}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 mt-2 text-xs font-mono">
                  <span className="text-slate-400">Target: {ex.targetRepRange}</span>
                  <span className="text-cyan-400 font-semibold">{ex.defaultSets} sets</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: WORKOUT LOGGED HISTORY (Mobile Single Column) */}
      {activeTab === 'history' && (
        <div className="space-y-2.5">
          {workouts.length > 0 ? (
            workouts.map(session => (
              <div key={session.id} className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-sm font-bold text-slate-100 font-telemetry">
                      {session.title}
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {session.date}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 bg-slate-950/70 p-2 rounded-lg text-xs font-mono border border-slate-800/60 text-center">
                  <div>
                    <span className="text-slate-400 block text-[9px]">LOAD</span>
                    <span className="text-cyan-400 font-bold">{session.totalVolumeKg.toLocaleString()} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">EXERCISES</span>
                    <span className="text-slate-200 font-bold">{session.exercises.length}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">XP</span>
                    <span className="text-amber-400 font-bold">+{session.xpEarned}</span>
                  </div>
                </div>

                {/* Exercises breakdown list */}
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {session.exercises.map((e, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-300">
                      {e.exerciseName} ({e.sets.length} sets)
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="glass-panel p-6 rounded-xl border border-slate-800 text-center text-slate-400 text-xs font-mono">
              {t.gym.emptyHistory}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: TROPHY & PROGRESSION SYSTEM (Mobile Single Column) */}
      {activeTab === 'trophies' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-telemetry uppercase">
                Combat Achievements
              </h3>
              <p className="text-[11px] text-slate-400">
                Performance milestone medals.
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {trophies.filter(tr => tr.unlockedAt).length} / {trophies.length} Unlocked
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {trophies.map(trophy => {
              const isUnlocked = !!trophy.unlockedAt;
              const tierColor = 
                trophy.tier === 'cyber' ? 'border-purple-500/40 text-purple-400 bg-purple-500/10' :
                trophy.tier === 'gold' ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' :
                trophy.tier === 'silver' ? 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10' :
                'border-slate-700 text-slate-400 bg-slate-800/40';

              return (
                <div
                  key={trophy.id}
                  className={`glass-panel p-3.5 rounded-xl border transition-all ${
                    isUnlocked ? 'border-amber-500/40 glow-amber' : 'border-slate-800 opacity-75'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${tierColor}`}>
                      <TrophyIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[9px] font-mono tracking-wider uppercase font-bold text-amber-400 truncate">
                          {trophy.tier.toUpperCase()} TIER • +{trophy.xpReward} XP
                        </span>
                        {isUnlocked && (
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30 shrink-0">
                            UNLOCKED
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-100 font-telemetry mt-0.5">
                        {language === 'ar' ? trophy.titleAr : trophy.titleEn}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                        {language === 'ar' ? trophy.descriptionAr : trophy.descriptionEn}
                      </p>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isUnlocked ? 'bg-amber-400' : 'bg-cyan-500'
                          }`}
                          style={{ width: `${trophy.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EXERCISE PICKER MODAL (When adding exercise to active workout) */}
      {showPickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-5 border border-cyan-500/30 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <h3 className="font-bold text-slate-100 text-base font-telemetry uppercase">
                Select Exercise for Session
              </h3>
              <button onClick={() => setShowPickerModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {exercises.map(ex => (
                <div
                  key={ex.id}
                  onClick={() => handleAddExerciseToActive(ex)}
                  className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="text-sm font-bold text-slate-200 font-telemetry">
                      {language === 'ar' ? ex.nameAr : ex.nameEn}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 uppercase">
                      {ex.primaryMuscle} • {ex.category}
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-cyan-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM EXERCISE CREATION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-5 border border-cyan-500/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-100 text-base font-telemetry uppercase">
                Create Custom Exercise
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Exercise Name (English)</label>
                <input
                  type="text"
                  value={newExNameEn}
                  onChange={e => setNewExNameEn(e.target.value)}
                  placeholder="e.g. Pendlay Row"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Exercise Name (Arabic)</label>
                <input
                  type="text"
                  value={newExNameAr}
                  onChange={e => setNewExNameAr(e.target.value)}
                  placeholder="مثال: تجديف بندلاي"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Primary Muscle</label>
                  <select
                    value={newExMuscle}
                    onChange={e => setNewExMuscle(e.target.value as MuscleGroup)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="chest">Chest</option>
                    <option value="back_upper">Back Upper</option>
                    <option value="lats">Lats</option>
                    <option value="shoulders">Shoulders</option>
                    <option value="biceps">Biceps</option>
                    <option value="triceps">Triceps</option>
                    <option value="quads">Quads</option>
                    <option value="hamstrings">Hamstrings</option>
                    <option value="glutes">Glutes</option>
                    <option value="calves">Calves</option>
                    <option value="abs">Core / Abs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Equipment</label>
                  <select
                    value={newExCategory}
                    onChange={e => setNewExCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="barbell">Barbell</option>
                    <option value="dumbbell">Dumbbell</option>
                    <option value="cable">Cable</option>
                    <option value="machine">Machine</option>
                    <option value="bodyweight">Bodyweight</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Target Rep Range</label>
                <input
                  type="text"
                  value={newExReps}
                  onChange={e => setNewExReps(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 min-h-[44px] rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleSaveCustomExercise}
                className="px-5 min-h-[44px] rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/30"
              >
                {t.common.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
