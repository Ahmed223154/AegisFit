import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  MealCategory, 
  FoodItem, 
  DietaryFramework, 
  VisionFoodAnalysisResult 
} from '../../types';
import { SEED_FOODS } from '../../data/seedData';
import { 
  Utensils, 
  Camera, 
  Plus, 
  Trash2, 
  Search, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Upload, 
  Layers,
  ChevronRight
} from 'lucide-react';

export const NutritionModule: React.FC = () => {
  const { 
    language, 
    t, 
    profile, 
    updateProfile, 
    todayNutrition, 
    addFoodEntry, 
    deleteFoodEntry 
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<MealCategory>('lunch');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servingMultiplier, setServingMultiplier] = useState(1);

  // Camera / AI Vision Simulation State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [visionResult, setVisionResult] = useState<VisionFoodAnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom Food state
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCals, setCustomCals] = useState(250);
  const [customProtein, setCustomProtein] = useState(25);
  const [customCarbs, setCustomCarbs] = useState(20);
  const [customFats, setCustomFats] = useState(8);

  // Compute daily totals
  const totalCals = todayNutrition.entries.reduce((sum, e) => sum + e.calories, 0);
  const totalProtein = todayNutrition.entries.reduce((sum, e) => sum + e.proteinGrams, 0);
  const totalCarbs = todayNutrition.entries.reduce((sum, e) => sum + e.carbsGrams, 0);
  const totalFats = todayNutrition.entries.reduce((sum, e) => sum + e.fatsGrams, 0);

  const remainingCals = Math.max(0, profile.targetCalories - totalCals);
  const remainingProtein = Math.max(0, profile.targetProteinGrams - totalProtein);
  const remainingCarbs = Math.max(0, profile.targetCarbsGrams - totalCarbs);
  const remainingFats = Math.max(0, profile.targetFatsGrams - totalFats);

  // Search filtered foods
  const filteredFoods = SEED_FOODS.filter(f => 
    f.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.nameAr.includes(searchQuery)
  );

  const handleAddSelectedFood = async () => {
    if (!selectedFood) return;
    await addFoodEntry({
      foodId: selectedFood.id,
      name: language === 'ar' ? selectedFood.nameAr : selectedFood.nameEn,
      servingCount: servingMultiplier,
      calories: Math.round(selectedFood.calories * servingMultiplier),
      proteinGrams: Math.round(selectedFood.proteinGrams * servingMultiplier),
      carbsGrams: Math.round(selectedFood.carbsGrams * servingMultiplier),
      fatsGrams: Math.round(selectedFood.fatsGrams * servingMultiplier),
      mealCategory: activeCategory
    });
    setSelectedFood(null);
    setServingMultiplier(1);
  };

  const handleAddCustomFood = async () => {
    if (!customName.trim()) return;
    await addFoodEntry({
      name: customName.trim(),
      servingCount: 1,
      calories: customCals,
      proteinGrams: customProtein,
      carbsGrams: customCarbs,
      fatsGrams: customFats,
      mealCategory: activeCategory
    });
    setCustomName('');
    setShowCustomModal(false);
  };

  // Image Upload / Camera Simulation Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCapturedImage(base64);
      simulateVisionAnalysis(base64);
    };
    reader.readAsDataURL(file);
  };

  const simulateVisionAnalysis = (_imageUrl: string) => {
    setIsAnalyzing(true);
    setVisionResult(null);

    // Realistic smart AI visual multi-spectral volumetric analysis simulation
    setTimeout(() => {
      // Analyze against user's remaining calories and protein
      const estimatedCals = 540;
      const estimatedProtein = 42;
      const estimatedCarbs = 48;
      const estimatedFats = 14;

      let verdict: 'consume_entirely' | 'portion_down' | 'skip_or_swap' = 'consume_entirely';
      let verdictEn = 'High-protein balance fits well within your remaining daily caloric quota.';
      let verdictAr = 'توازن بروتيني ممتاز ويتوافق تماماً مع سقف السعرات والماكروز المتبقية لليوم.';

      if (estimatedCals > remainingCals + 100) {
        verdict = 'portion_down';
        verdictEn = 'Portion density exceeds remaining caloric quota. Reduce portion by 50% to maintain target.';
        verdictAr = 'كثافة السعرات تتجاوز المتبقي لليوم. قلل الكمية للنصف للحفاظ على عجز أو فائض السعرات المستهدف.';
      }

      setVisionResult({
        foodName: 'Grilled Ribeye Steak & Roasted Sweet Potato with Greens',
        portionEstimate: '~380g volumetric density',
        confidence: 0.94,
        calories: estimatedCals,
        proteinGrams: estimatedProtein,
        carbsGrams: estimatedCarbs,
        fatsGrams: estimatedFats,
        recommendation: verdict,
        recommendationTextEn: verdictEn,
        recommendationTextAr: verdictAr,
        macroRatioAnalysis: 'P: 31% | C: 35% | F: 34%'
      });
      setIsAnalyzing(false);
    }, 1600);
  };

  const handleCommitScannedMeal = async () => {
    if (!visionResult) return;
    await addFoodEntry({
      name: visionResult.foodName,
      servingCount: 1,
      calories: visionResult.calories,
      proteinGrams: visionResult.proteinGrams,
      carbsGrams: visionResult.carbsGrams,
      fatsGrams: visionResult.fatsGrams,
      mealCategory: activeCategory
    });
    setVisionResult(null);
    setCapturedImage(null);
  };

  const handleFrameworkChange = async (framework: DietaryFramework) => {
    await updateProfile({ dietaryFramework: framework });
  };

  return (
    <div className="space-y-3 pb-6">
      {/* Mobile-First Header */}
      <div className="flex flex-col gap-2 border-b border-slate-800 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Utensils className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold tracking-wider text-slate-100 font-telemetry uppercase">
              {t.nutrition.moduleTitle}
            </h2>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/60">
            {profile.dietaryFramework.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* Dietary Framework Selector (Min 44px touch target) */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          <span className="text-xs font-mono text-slate-400 pl-1">{t.nutrition.frameworks}:</span>
          <select
            value={profile.dietaryFramework}
            onChange={e => handleFrameworkChange(e.target.value as DietaryFramework)}
            className="flex-1 bg-slate-900 border border-slate-700 text-cyan-300 text-xs rounded-lg min-h-[38px] px-2 font-bold focus:outline-none"
          >
            <option value="high_protein">High Protein (2.2g/kg)</option>
            <option value="balanced">Balanced Macro Split</option>
            <option value="keto">Ketogenic (70% Fat)</option>
            <option value="mediterranean">Mediterranean Heart</option>
            <option value="vegan">Plant-Based Athlete</option>
            <option value="flexible">Flexible / IIFYM</option>
          </select>
        </div>
      </div>

      {/* Target vs Consumed Macro Cards (2x2 Grid optimized for mobile) */}
      <div className="grid grid-cols-2 gap-2">
        {/* Calories */}
        <div className="glass-panel p-3 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-0.5">
            <span>{t.nutrition.calories}</span>
            <span className="text-cyan-400 font-bold">{remainingCals} left</span>
          </div>
          <div className="text-xl font-black text-slate-100 font-telemetry">
            {totalCals} <span className="text-[10px] font-normal text-slate-400">/ {profile.targetCalories}</span>
          </div>
          <div className="w-full bg-slate-850 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div 
              className="bg-cyan-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (totalCals / profile.targetCalories) * 100)}%` }}
            />
          </div>
        </div>

        {/* Protein */}
        <div className="glass-panel p-3 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-0.5">
            <span>{t.nutrition.protein}</span>
            <span className="text-emerald-400 font-bold">{remainingProtein}g left</span>
          </div>
          <div className="text-xl font-black text-slate-100 font-telemetry">
            {totalProtein} <span className="text-[10px] font-normal text-slate-400">/ {profile.targetProteinGrams}g</span>
          </div>
          <div className="w-full bg-slate-850 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (totalProtein / profile.targetProteinGrams) * 100)}%` }}
            />
          </div>
        </div>

        {/* Carbs */}
        <div className="glass-panel p-3 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-0.5">
            <span>{t.nutrition.carbs}</span>
            <span className="text-amber-400 font-bold">{remainingCarbs}g left</span>
          </div>
          <div className="text-xl font-black text-slate-100 font-telemetry">
            {totalCarbs} <span className="text-[10px] font-normal text-slate-400">/ {profile.targetCarbsGrams}g</span>
          </div>
          <div className="w-full bg-slate-850 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (totalCarbs / profile.targetCarbsGrams) * 100)}%` }}
            />
          </div>
        </div>

        {/* Fats */}
        <div className="glass-panel p-3 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-0.5">
            <span>{t.nutrition.fats}</span>
            <span className="text-rose-400 font-bold">{remainingFats}g left</span>
          </div>
          <div className="text-xl font-black text-slate-100 font-telemetry">
            {totalFats} <span className="text-[10px] font-normal text-slate-400">/ {profile.targetFatsGrams}g</span>
          </div>
          <div className="w-full bg-slate-850 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div 
              className="bg-rose-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (totalFats / profile.targetFatsGrams) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* AI Vision Food Scanner & Photo Macro Estimator Card */}
      <div className="glass-panel p-3.5 rounded-2xl border border-cyan-500/30 glow-cyan space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-telemetry uppercase tracking-wider">
                {t.nutrition.cameraScanner}
              </h3>
              <p className="text-[10px] text-slate-400">
                {t.nutrition.cameraSimulationDesc}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 min-h-[40px] rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/30 flex items-center gap-1.5 transition-all shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t.nutrition.scanMealPhoto}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>

        {/* Scan Status & Results View */}
        {isAnalyzing && (
          <div className="p-5 rounded-xl bg-slate-950/80 border border-cyan-500/40 text-center space-y-2 animate-pulse">
            <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin mx-auto" />
            <div className="text-xs font-bold text-slate-200 font-telemetry">
              Multi-Spectral Volumetric Scan in Progress...
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Extracting macronutrient density & comparing against daily target budget...
            </div>
          </div>
        )}

        {visionResult && (
          <div className="flex flex-col gap-3 bg-slate-950/80 p-3 rounded-xl border border-cyan-500/40">
            {capturedImage && (
              <div className="w-full rounded-lg overflow-hidden border border-slate-800 h-36 relative">
                <img src={capturedImage} alt="Scanned meal" className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-cyan-950/90 text-cyan-300 text-[10px] font-mono border border-cyan-700">
                  CONFIDENCE: {Math.round(visionResult.confidence * 100)}%
                </div>
              </div>
            )}

            <div className="space-y-2.5">
              <div>
                <div className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider">
                  AI VISION IDENTIFICATION
                </div>
                <h4 className="text-sm font-black text-slate-100 font-telemetry">
                  {visionResult.foodName}
                </h4>
                <p className="text-[10px] text-slate-400 font-mono">
                  Portion: {visionResult.portionEstimate}
                </p>
              </div>

              {/* Scanned Macros */}
              <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-mono bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-400 text-[9px] block">CALORIES</span>
                  <span className="text-slate-100 font-bold">{visionResult.calories}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[9px] block">PROTEIN</span>
                  <span className="text-emerald-400 font-bold">{visionResult.proteinGrams}g</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[9px] block">CARBS</span>
                  <span className="text-amber-400 font-bold">{visionResult.carbsGrams}g</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[9px] block">FATS</span>
                  <span className="text-rose-400 font-bold">{visionResult.fatsGrams}g</span>
                </div>
              </div>

              {/* Actionable Tactical Directive */}
              <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] font-bold text-cyan-300 uppercase font-mono">
                    {t.nutrition.actionableVerdict}
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                    {language === 'ar' ? visionResult.recommendationTextAr : visionResult.recommendationTextEn}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setVisionResult(null)}
                  className="min-h-[44px] rounded-xl text-xs font-mono text-slate-400 hover:text-slate-200 border border-slate-800 flex items-center justify-center"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleCommitScannedMeal}
                  className="min-h-[44px] rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Commit to Log</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Meal Category Tabs & Food Logging */}
      <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 space-y-3">
        {/* Category Pill Buttons (Grid of 4) */}
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-4 gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            {(['breakfast', 'lunch', 'dinner', 'snacks'] as MealCategory[]).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`min-h-[38px] rounded-lg text-xs font-bold transition-all capitalize flex items-center justify-center ${
                  activeCategory === cat
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.nutrition[cat]}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowCustomModal(true)}
            className="w-full min-h-[40px] rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-850 text-cyan-300 border border-slate-800 flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.nutrition.customFood}</span>
          </button>
        </div>

        {/* Database Search & Serving Scale */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 min-h-[44px]">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder={t.common.search}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-slate-100 focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-xl px-3 min-h-[44px]">
            <span className="text-xs font-mono text-slate-400">
              Serving Scale Multiplier:
            </span>
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={servingMultiplier}
              onChange={e => setServingMultiplier(parseFloat(e.target.value) || 1)}
              className="w-16 bg-slate-900 border border-slate-700 rounded-lg h-8 text-xs text-slate-100 font-mono text-center font-bold focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Food Items Catalog Picker (Mobile Single Column Stack) */}
        <div className="flex flex-col gap-2 max-h-56 overflow-y-auto no-scrollbar pr-0.5">
          {filteredFoods.map(food => (
            <div
              key={food.id}
              onClick={() => setSelectedFood(food)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedFood?.id === food.id
                  ? 'bg-cyan-950/40 border-cyan-500/60 glow-cyan'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-slate-100 font-telemetry">
                  {language === 'ar' ? food.nameAr : food.nameEn}
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  {food.servingSize} • {food.calories} kcal
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-mono text-emerald-400 font-bold block">
                  {food.proteinGrams}g P
                </span>
                <span className="text-[9px] font-mono text-slate-500">
                  {food.carbsGrams}g C • {food.fatsGrams}g F
                </span>
              </div>
            </div>
          ))}
        </div>

        {selectedFood && (
          <div className="flex items-center justify-between bg-cyan-950/30 p-2.5 rounded-xl border border-cyan-500/40">
            <div className="text-xs font-mono text-slate-200 truncate max-w-[200px]">
              <span className="text-cyan-400 font-bold">{language === 'ar' ? selectedFood.nameAr : selectedFood.nameEn}</span> (x{servingMultiplier})
            </div>
            <button
              type="button"
              onClick={handleAddSelectedFood}
              className="px-3.5 min-h-[40px] rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/30 transition-all shrink-0"
            >
              Log to {activeCategory}
            </button>
          </div>
        )}

        {/* Today's Logged Entries */}
        <div className="pt-2.5 border-t border-slate-800/80">
          <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
            Logged Today for {activeCategory} ({todayNutrition.entries.filter(e => e.mealCategory === activeCategory).length})
          </h4>

          <div className="space-y-1.5">
            {todayNutrition.entries.filter(e => e.mealCategory === activeCategory).length > 0 ? (
              todayNutrition.entries
                .filter(e => e.mealCategory === activeCategory)
                .map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-200 font-telemetry">{item.name}</span>
                      <span className="text-[9px] font-mono text-slate-500 block">
                        {item.calories} kcal • {item.proteinGrams}g P • {item.carbsGrams}g C • {item.fatsGrams}g F
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteFoodEntry(item.id)}
                      className="text-slate-500 hover:text-rose-400 min-h-[38px] min-w-[38px] flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
            ) : (
              <div className="text-xs text-slate-500 italic py-1.5">
                No items logged in {activeCategory} yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CUSTOM FOOD MODAL */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-5 border border-cyan-500/30 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-100 text-base font-telemetry uppercase">
              Add Custom Food Item
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Food Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="e.g. Protein Bar Deluxe"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 min-h-[44px] text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    value={customCals}
                    onChange={e => setCustomCals(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 min-h-[44px] text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={customProtein}
                    onChange={e => setCustomProtein(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 min-h-[44px] text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={customCarbs}
                    onChange={e => setCustomCarbs(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 min-h-[44px] text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Fats (g)</label>
                  <input
                    type="number"
                    value={customFats}
                    onChange={e => setCustomFats(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 min-h-[44px] text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="px-4 min-h-[44px] rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleAddCustomFood}
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
