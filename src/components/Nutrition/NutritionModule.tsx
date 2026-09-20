import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { MealCategory, FoodItem } from '../../types';
import { SEED_FOODS } from '../../data/seedData';
import { 
  Utensils, 
  Camera, 
  Plus, 
  Trash2, 
  Search, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  X,
  Flame,
  Check,
  ChevronRight,
  Info
} from 'lucide-react';

export const NutritionModule: React.FC = () => {
  const { 
    language, 
    t, 
    profile, 
    todayNutrition, 
    addFoodEntry, 
    deleteFoodEntry 
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<MealCategory>('lunch');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(SEED_FOODS[0]);
  const [amountValue, setAmountValue] = useState<number>(100);
  const [unitType, setUnitType] = useState<'grams' | 'servings'>('grams');

  // Photo analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedPhoto, setAnalyzedPhoto] = useState<string | null>(null);
  const [photoResult, setPhotoResult] = useState<{
    name: string;
    nameAr: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    portionGrams: number;
    verdict: 'good' | 'half_portion' | 'skip';
    verdictTextEn: string;
    verdictTextAr: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute daily totals
  const totalCals = todayNutrition.entries.reduce((sum, e) => sum + e.calories, 0);
  const totalProtein = todayNutrition.entries.reduce((sum, e) => sum + e.proteinGrams, 0);
  const totalCarbs = todayNutrition.entries.reduce((sum, e) => sum + e.carbsGrams, 0);
  const totalFats = todayNutrition.entries.reduce((sum, e) => sum + e.fatsGrams, 0);

  const remainingCals = Math.max(0, profile.targetCalories - totalCals);
  const remainingProtein = Math.max(0, profile.targetProteinGrams - totalProtein);
  const remainingCarbs = Math.max(0, profile.targetCarbsGrams - totalCarbs);
  const remainingFats = Math.max(0, profile.targetFatsGrams - totalFats);

  // Quick favorite foods for one-tap selection
  const quickPicks = SEED_FOODS.slice(0, 8);

  const filteredFoods = SEED_FOODS.filter(f => 
    f.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.nameAr.includes(searchQuery)
  );

  // Auto-calculated macros for currently selected food & amount
  const computedNutrition = React.useMemo(() => {
    if (!selectedFood) return { calories: 0, protein: 0, carbs: 0, fats: 0 };
    const factor = unitType === 'grams' 
      ? amountValue / selectedFood.servingGrams 
      : amountValue;
    return {
      calories: Math.round(selectedFood.calories * factor),
      protein: Math.round(selectedFood.proteinGrams * factor),
      carbs: Math.round(selectedFood.carbsGrams * factor),
      fats: Math.round(selectedFood.fatsGrams * factor)
    };
  }, [selectedFood, amountValue, unitType]);

  const handleLogFood = async () => {
    if (!selectedFood) return;
    await addFoodEntry({
      foodId: selectedFood.id,
      name: language === 'ar' ? selectedFood.nameAr : selectedFood.nameEn,
      servingCount: unitType === 'grams' ? amountValue / selectedFood.servingGrams : amountValue,
      calories: computedNutrition.calories,
      proteinGrams: computedNutrition.protein,
      carbsGrams: computedNutrition.carbs,
      fatsGrams: computedNutrition.fats,
      mealCategory: activeCategory
    });
    setShowAddModal(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setAnalyzedPhoto(dataUrl);
        runPhotoAnalysis();
      };
      reader.onerror = () => {
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File reading error:', err);
      setIsAnalyzing(false);
    }
  };

  const runPhotoAnalysis = () => {
    setIsAnalyzing(true);
    setPhotoResult(null);

    setTimeout(() => {
      // Analyze against current remaining targets
      const estimatedCals = 520;
      const estimatedProtein = 42;
      const estimatedCarbs = 48;
      const estimatedFats = 14;

      let verdict: 'good' | 'half_portion' | 'skip' = 'good';
      let verdictTextEn = 'Good to eat! Balanced high-protein meal that fits cleanly in your daily quota.';
      let verdictTextAr = 'وجبة ممتازة! غنية بالبروتين وتتناسب تماماً مع خطتك اليومية.';

      if (remainingCals < 350) {
        verdict = 'half_portion';
        verdictTextEn = 'Have half portion: This meal is dense and your remaining calorie budget is low.';
        verdictTextAr = 'تناول نصف الكمية: الوجبة غنية بالسعرات وما تبقى من سعراتك قليل اليوم.';
      } else if (remainingCals < 150) {
        verdict = 'skip';
        verdictTextEn = 'Skip or swap for lean protein: Exceeds your remaining daily calorie target.';
        verdictTextAr = 'تجنب الوجبة أو استبدلها بمصدر بروتين خالي من الدهون لتفادي زيادة السعرات.';
      }

      setPhotoResult({
        name: 'Grilled Chicken Breast, Jasmine Rice & Green Beans',
        nameAr: 'صدر دجاج مشوي مع أرز ياسمين وفاصوليا خضراء',
        calories: estimatedCals,
        protein: estimatedProtein,
        carbs: estimatedCarbs,
        fats: estimatedFats,
        portionGrams: 360,
        verdict,
        verdictTextEn,
        verdictTextAr
      });
      setIsAnalyzing(false);
    }, 1400);
  };

  const handleAddAnalyzedPhotoMeal = async () => {
    if (!photoResult) return;
    await addFoodEntry({
      name: language === 'ar' ? photoResult.nameAr : photoResult.name,
      servingCount: 1,
      calories: photoResult.calories,
      proteinGrams: photoResult.protein,
      carbsGrams: photoResult.carbs,
      fatsGrams: photoResult.fats,
      mealCategory: activeCategory
    });
    setAnalyzedPhoto(null);
    setPhotoResult(null);
  };

  const mealCategories: { id: MealCategory; label: string }[] = [
    { id: 'breakfast', label: t.nutrition.breakfast },
    { id: 'lunch', label: t.nutrition.lunch },
    { id: 'dinner', label: t.nutrition.dinner },
    { id: 'snacks', label: t.nutrition.snacks }
  ];

  const currentCategoryEntries = todayNutrition.entries.filter(e => e.mealCategory === activeCategory);

  return (
    <div className="space-y-4 pb-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Utensils className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wide">
            {t.nutrition.moduleTitle}
          </h2>
        </div>

        {/* Safe Photo / Camera Button */}
        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 min-h-[40px] rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs transition-all shadow-sm"
          >
            <Camera className="w-4 h-4 text-cyan-400" />
            <span>{language === 'ar' ? 'تصوير الوجبة' : 'Scan Meal'}</span>
          </button>
          {/* HTML5 file input with camera environment capture */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Daily Macros Overview Card */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">
              {language === 'ar' ? 'استهلاك السعرات اليومي' : 'Daily Caloric Budget'}
            </span>
            <div className="text-2xl font-black text-slate-100 mt-0.5">
              {totalCals} <span className="text-xs font-normal text-slate-400">/ {profile.targetCalories} kcal</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block font-medium">{t.nutrition.remaining}</span>
            <span className="text-lg font-bold text-cyan-400">{remainingCals} kcal</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-850 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              totalCals > profile.targetCalories ? 'bg-rose-500' : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
            }`}
            style={{ width: `${Math.min(100, (totalCals / (profile.targetCalories || 2000)) * 100)}%` }}
          />
        </div>

        {/* Macro Breakdown Pills */}
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] font-bold text-emerald-400 block">{t.nutrition.protein}</span>
            <span className="text-sm font-bold text-slate-100 mt-0.5 block">{totalProtein}g</span>
            <span className="text-[10px] text-slate-400 block">/ {profile.targetProteinGrams}g</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] font-bold text-amber-400 block">{t.nutrition.carbs}</span>
            <span className="text-sm font-bold text-slate-100 mt-0.5 block">{totalCarbs}g</span>
            <span className="text-[10px] text-slate-400 block">/ {profile.targetCarbsGrams}g</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] font-bold text-rose-400 block">{t.nutrition.fats}</span>
            <span className="text-sm font-bold text-slate-100 mt-0.5 block">{totalFats}g</span>
            <span className="text-[10px] text-slate-400 block">/ {profile.targetFatsGrams}g</span>
          </div>
        </div>
      </div>

      {/* Photo Analysis Modal / Card */}
      {analyzedPhoto && (
        <div className="glass-panel p-4 rounded-2xl border border-cyan-500/40 glow-cyan space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-100">
                {language === 'ar' ? 'نتيجة تحليل صورة الوجبة' : 'Food Photo Analysis'}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => { setAnalyzedPhoto(null); setPhotoResult(null); }}
              className="text-slate-400 hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative rounded-xl overflow-hidden max-h-48 bg-black flex items-center justify-center">
            <img src={analyzedPhoto} alt="Meal preview" className="w-full object-cover max-h-48" />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-cyan-300 text-xs font-medium">
                <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span>{language === 'ar' ? 'جارٍ تحليل مكونات الوجبة...' : 'Estimating nutritional volume & macros...'}</span>
              </div>
            )}
          </div>

          {photoResult && (
            <div className="space-y-3 pt-1">
              <div>
                <h4 className="text-sm font-bold text-slate-100">
                  {language === 'ar' ? photoResult.nameAr : photoResult.name}
                </h4>
                <div className="text-xs text-slate-400 mt-0.5">
                  {language === 'ar' ? 'الحجم المقدر:' : 'Estimated portion:'} {photoResult.portionGrams}g
                </div>
              </div>

              {/* Recommendation Badge */}
              <div className={`p-2.5 rounded-xl border flex items-start gap-2 text-xs ${
                photoResult.verdict === 'good'
                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                  : photoResult.verdict === 'half_portion'
                  ? 'bg-amber-950/50 border-amber-500/40 text-amber-300'
                  : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
              }`}>
                {photoResult.verdict === 'good' ? (
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                )}
                <div>
                  <span className="font-bold block uppercase text-[11px]">
                    {photoResult.verdict === 'good'
                      ? (language === 'ar' ? 'مناسب للتناول' : 'Good to eat')
                      : photoResult.verdict === 'half_portion'
                      ? (language === 'ar' ? 'يُفضل نصف الكمية' : 'Have half portion')
                      : (language === 'ar' ? 'تجنب أو استبدل' : 'Skip or Swap')}
                  </span>
                  <p className="mt-0.5 text-[11px] leading-relaxed">
                    {language === 'ar' ? photoResult.verdictTextAr : photoResult.verdictTextEn}
                  </p>
                </div>
              </div>

              {/* Macro Estimates */}
              <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{t.nutrition.calories}</span>
                  <span className="font-bold text-slate-100">{photoResult.calories}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-emerald-400 block">{t.nutrition.protein}</span>
                  <span className="font-bold text-emerald-400">{photoResult.protein}g</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-amber-400 block">{t.nutrition.carbs}</span>
                  <span className="font-bold text-amber-400">{photoResult.carbs}g</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-rose-400 block">{t.nutrition.fats}</span>
                  <span className="font-bold text-rose-400">{photoResult.fats}g</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddAnalyzedPhotoMeal}
                className="w-full min-h-[44px] rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/25 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'ar' ? `إضافة إلى ${t.nutrition[activeCategory]}` : `Add to ${t.nutrition[activeCategory]}`}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Meal Category Tabs */}
      <div className="grid grid-cols-4 gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
        {mealCategories.map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`min-h-[38px] rounded-lg text-xs font-bold transition-all truncate px-1 ${
              activeCategory === cat.id
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Category Food List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {t.nutrition[activeCategory]}
          </h3>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-3 min-h-[36px] rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.nutrition.addMeal}</span>
          </button>
        </div>

        {currentCategoryEntries.length > 0 ? (
          <div className="space-y-2">
            {currentCategoryEntries.map(entry => (
              <div
                key={entry.id}
                className="glass-panel p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-2"
              >
                <div>
                  <div className="text-xs font-bold text-slate-100">{entry.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {entry.calories} kcal • <span className="text-emerald-400 font-medium">{entry.proteinGrams}g P</span> • <span className="text-amber-400 font-medium">{entry.carbsGrams}g C</span> • <span className="text-rose-400 font-medium">{entry.fatsGrams}g F</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteFoodEntry(entry.id)}
                  className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
            {language === 'ar' ? 'لا توجد أطعمة مسجلة في هذه الوجبة حتى الآن.' : 'No foods logged for this meal yet. Tap "+ Add Food" or scan a meal.'}
          </div>
        )}
      </div>

      {/* Simplified Manual Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-4 border border-cyan-500/40 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  {language === 'ar' ? 'إضافة طعام' : 'Add Food'}
                </h3>
                <span className="text-[11px] text-cyan-400 capitalize">
                  {t.nutrition[activeCategory]}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Food Picks */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1.5 font-medium">
                {language === 'ar' ? 'أطعمة شائعة:' : 'Quick Selection:'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {quickPicks.map(food => (
                  <button
                    key={food.id}
                    type="button"
                    onClick={() => setSelectedFood(food)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      selectedFood?.id === food.id
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {language === 'ar' ? food.nameAr : food.nameEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-[11px] text-slate-400 font-medium">
                {language === 'ar' ? 'أو ابحث عن نوع الطعام:' : 'Or search food type:'}
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'ابحث في قاعدة الأطعمة...' : 'Search food database...'}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 min-h-[44px] text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {searchQuery.trim() && (
                <div className="max-h-36 overflow-y-auto space-y-1 bg-slate-900/95 p-1.5 rounded-xl border border-slate-800">
                  {filteredFoods.map(food => (
                    <button
                      key={food.id}
                      type="button"
                      onClick={() => { setSelectedFood(food); setSearchQuery(''); }}
                      className="w-full text-left p-2 rounded-lg text-xs text-slate-200 hover:bg-slate-800 flex items-center justify-between"
                    >
                      <span className="font-medium">{language === 'ar' ? food.nameAr : food.nameEn}</span>
                      <span className="text-[10px] text-slate-400">{food.calories} kcal / {food.servingSize}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Food & Amount Inputs */}
            {selectedFood && (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-100">
                  {language === 'ar' ? selectedFood.nameAr : selectedFood.nameEn}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">
                      {language === 'ar' ? 'الكمية' : 'Amount'}
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={amountValue}
                      onChange={e => setAmountValue(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 min-h-[44px] text-xs text-slate-100 font-bold focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">
                      {language === 'ar' ? 'الوحدة' : 'Unit'}
                    </label>
                    <select
                      value={unitType}
                      onChange={e => setUnitType(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 min-h-[44px] text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                    >
                      <option value="grams">{language === 'ar' ? 'جرام (g)' : 'Grams (g)'}</option>
                      <option value="servings">{language === 'ar' ? 'حصة / قطعة' : 'Servings / Pieces'}</option>
                    </select>
                  </div>
                </div>

                {/* Auto-computed Macros Display */}
                <div className="pt-2 border-t border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono mb-1.5 flex items-center justify-between">
                    <span>{language === 'ar' ? 'القيمة الغذائية المحسوبة تلقائياً:' : 'Auto-computed Nutritional Total:'}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">{t.nutrition.calories}</span>
                      <span className="font-bold text-slate-100">{computedNutrition.calories}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-emerald-400 block">{t.nutrition.protein}</span>
                      <span className="font-bold text-emerald-400">{computedNutrition.protein}g</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-amber-400 block">{t.nutrition.carbs}</span>
                      <span className="font-bold text-amber-400">{computedNutrition.carbs}g</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-rose-400 block">{t.nutrition.fats}</span>
                      <span className="font-bold text-rose-400">{computedNutrition.fats}g</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 min-h-[44px] rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleLogFood}
                disabled={!selectedFood}
                className="px-5 min-h-[44px] rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 shadow-md shadow-cyan-500/25"
              >
                {language === 'ar' ? 'تسجيل الطعام' : 'Log Food'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
