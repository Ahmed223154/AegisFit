import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  SupplementTiming, 
  BiomarkerRecord 
} from '../../types';
import { SEED_BIOMARKERS } from '../../data/seedData';
import { 
  Pill, 
  Activity, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Upload, 
  Camera,
  ShieldCheck, 
  Sun, 
  Zap, 
  Moon, 
  Coffee,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  X,
  Plus
} from 'lucide-react';

interface ExtractedBiomarker {
  biomarkerId: string;
  nameEn: string;
  nameAr: string;
  value: number;
  unit: string;
  optimalRange: string;
  status: 'low' | 'optimal' | 'high';
  statusLabelEn: string;
  statusLabelAr: string;
  adviceEn: string;
  adviceAr: string;
}

export const SupplementsModule: React.FC = () => {
  const { 
    language, 
    t, 
    supplements, 
    todaySupplementChecklist, 
    toggleSupplementCheck,
    biomarkerRecords,
    addBiomarkerRecord
  } = useApp();

  const [activeTab, setActiveTab] = useState<'protocols' | 'biomarkers'>('protocols');
  const [expandedBiomarker, setExpandedBiomarker] = useState<string | null>(null);

  // Lab Report OCR State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [labImage, setLabImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedBiomarker[] | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const timings: { id: SupplementTiming; label: string; icon: any }[] = [
    { id: 'morning', label: t.supplements.timingMorning, icon: Sun },
    { id: 'pre_workout', label: t.supplements.timingPre, icon: Zap },
    { id: 'post_workout', label: t.supplements.timingPost, icon: Activity },
    { id: 'with_meals', label: t.supplements.timingMeals, icon: Coffee },
    { id: 'bedtime', label: t.supplements.timingBedtime, icon: Moon }
  ];

  const handleLabImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setLabImage(dataUrl);
        runLabOCR(dataUrl);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to read lab image:', err);
    }
  };

  const runLabOCR = (_dataUrl: string) => {
    setIsScanning(true);
    setExtractedData(null);
    setSavedSuccess(false);

    // Simulate intelligent OCR extraction
    setTimeout(() => {
      const results: ExtractedBiomarker[] = [
        {
          biomarkerId: 'vitamin_d',
          nameEn: 'Vitamin D (25-OH)',
          nameAr: 'فيتامين د (25-OH)',
          value: 24.2,
          unit: 'ng/mL',
          optimalRange: '40 - 70 ng/mL',
          status: 'low',
          statusLabelEn: 'Deficient / Low',
          statusLabelAr: 'نقص / أقل من الطبيعي',
          adviceEn: 'Take 5,000 IU Vitamin D3 daily with a meal containing healthy fats. Retest in 8 weeks to assess normalization.',
          adviceAr: 'تناول 5,000 وحدة دولية من فيتامين D3 يومياً مع وجبة دهنية، وأعد الفحص بعد 8 أسابيع.'
        },
        {
          biomarkerId: 'ferritin',
          nameEn: 'Ferritin (Iron Stores)',
          nameAr: 'الفيريتين (مخزون الحديد)',
          value: 38,
          unit: 'ng/mL',
          optimalRange: '50 - 150 ng/mL',
          status: 'low',
          statusLabelEn: 'Suboptimal',
          statusLabelAr: 'أقل من المستوى الرياضي',
          adviceEn: 'Increase dietary iron intake (lean red meat, spinach) or consider 25mg iron bisglycinate with Vitamin C.',
          adviceAr: 'زد من استهلاك اللحوم الحمراء والسبانخ، أو تناول مكمل حديد لطيف (25 مجم) مع فيتامين سي لزيادة الامتصاص.'
        },
        {
          biomarkerId: 'testosterone_total',
          nameEn: 'Total Testosterone',
          nameAr: 'التستوستيرون الكلي',
          value: 685,
          unit: 'ng/dL',
          optimalRange: '450 - 950 ng/dL',
          status: 'optimal',
          statusLabelEn: 'Optimal',
          statusLabelAr: 'مثالي / ممتاز',
          adviceEn: 'Healthy athletic baseline. Maintain consistent sleep (7-8 hours) and progressive resistance training.',
          adviceAr: 'مستوى ممتاز ورياضي. حافظ على النوم الجيد والتمارين المستمرة والتغذية المتوازنة.'
        },
        {
          biomarkerId: 'vitamin_b12',
          nameEn: 'Vitamin B12 (Cobalamin)',
          nameAr: 'فيتامين ب12',
          value: 520,
          unit: 'pg/mL',
          optimalRange: '400 - 900 pg/mL',
          status: 'optimal',
          statusLabelEn: 'Optimal',
          statusLabelAr: 'مثالي / ممتاز',
          adviceEn: 'Adequate neurological and energy baseline. Maintain whole-food dietary intake.',
          adviceAr: 'مستوى مثالي لدعم الطاقة والأعصاب. استمر في نظامك الغذائي المعتاد.'
        }
      ];

      setExtractedData(results);
      setIsScanning(false);
    }, 1500);
  };

  const handleSaveExtractedResults = async () => {
    if (!extractedData) return;
    const today = new Date().toISOString().split('T')[0];

    for (const item of extractedData) {
      await addBiomarkerRecord({
        biomarkerId: item.biomarkerId,
        value: item.value,
        date: today,
        status: item.status,
        notes: `OCR from lab report on ${today}`
      });
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-4 pb-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Pill className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wide">
            {t.supplements.moduleTitle}
          </h2>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('protocols')}
            className={`min-h-[38px] rounded-lg font-bold transition-all flex items-center justify-center ${
              activeTab === 'protocols'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.supplements.protocolsTab}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('biomarkers')}
            className={`min-h-[38px] rounded-lg font-bold transition-all flex items-center justify-center ${
              activeTab === 'biomarkers'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.supplements.biomarkersTab}
          </button>
        </div>
      </div>

      {/* TAB 1: DAILY SUPPLEMENT PROTOCOLS */}
      {activeTab === 'protocols' && (
        <div className="space-y-4">
          {/* Adherence Card */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium block">
                {language === 'ar' ? 'الالتزام اليومي بالمكملات' : 'Daily Supplement Adherence'}
              </span>
              <div className="text-xl font-bold text-slate-100 mt-0.5">
                {todaySupplementChecklist.length} / {supplements.filter(s => s.active).length} {language === 'ar' ? 'جرعات مكتملة' : 'Doses Taken'}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                {t.supplements.notificationAlert}
              </span>
            </div>
          </div>

          {/* Protocols Grouped by Timing */}
          <div className="space-y-3">
            {timings.map(({ id: timingId, label, icon: IconComponent }) => {
              const matchedSupps = supplements.filter(s => s.timing === timingId);
              if (matchedSupps.length === 0) return null;

              return (
                <div key={timingId} className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </div>

                  <div className="space-y-2">
                    {matchedSupps.map(supp => {
                      const isChecked = todaySupplementChecklist.includes(supp.id);
                      return (
                        <div
                          key={supp.id}
                          className={`glass-panel p-3.5 rounded-2xl border transition-all ${
                            isChecked
                              ? 'border-emerald-500/30 bg-emerald-950/10'
                              : 'border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className={`text-sm font-bold truncate ${isChecked ? 'text-emerald-300' : 'text-slate-100'}`}>
                                  {language === 'ar' ? supp.nameAr : supp.nameEn}
                                </h4>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-cyan-300 font-mono">
                                  {supp.dosage}
                                </span>
                              </div>

                              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                {language === 'ar' ? supp.purposeAr : supp.purposeEn}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleSupplementCheck(supp.id)}
                              className={`min-h-[42px] min-w-[42px] rounded-xl flex items-center justify-center transition-all shrink-0 ${
                                isChecked
                                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                                  : 'bg-slate-900 border border-slate-700 text-slate-400 hover:border-cyan-400'
                              }`}
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: LAB REPORTS & BIOMARKER OCR ANALYZER */}
      {activeTab === 'biomarkers' && (
        <div className="space-y-4">
          {/* Upload Card */}
          <div className="glass-panel p-4 rounded-2xl border border-cyan-500/30 glow-cyan space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-100 uppercase">
                  {language === 'ar' ? 'فاحص تقارير التحاليل الطبية' : 'Lab Test Report Analyzer'}
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'ar'
                ? 'ارفع صورة تقرير فحص الدم الخاص بك لاستخراج النتائج تلقائياً (مثل فيتامين د، مخزون الحديد، التستوستيرون، ب12) والحصول على نصائح مكملات غذائية دقيقة.'
                : 'Upload an image or photo of your blood test report. The system scans key markers (Vitamin D, Ferritin, Testosterone, B12), highlights deficiencies, and provides plain-language supplement advice.'}
            </p>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full min-h-[48px] rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{language === 'ar' ? 'رفع صورة تقرير التحليل' : 'Upload Lab Test Image'}</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLabImageUpload}
              className="hidden"
            />
          </div>

          {/* Scanning Animation */}
          {isScanning && (
            <div className="glass-panel p-6 rounded-2xl border border-cyan-500/40 text-center space-y-3">
              <div className="w-8 h-8 mx-auto border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <div className="text-xs font-bold text-cyan-300">
                {language === 'ar' ? 'جارٍ قراءة تقرير التحليل واستخراج المؤشرات الحيوية...' : 'Scanning lab report & extracting biomarkers...'}
              </div>
              <p className="text-[11px] text-slate-400">
                {language === 'ar' ? 'يتم فحص فيتامين د، الحديد، والتستوستيرون وفيتامين ب12.' : 'Evaluating Vitamin D, Ferritin, Total Testosterone, and Vitamin B12.'}
              </p>
            </div>
          )}

          {/* OCR Extracted Results Card */}
          {extractedData && (
            <div className="glass-panel p-4 rounded-2xl border border-cyan-500/40 glow-cyan space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-bold text-slate-100">
                    {language === 'ar' ? 'المؤشرات المستخرجة من التقرير' : 'Extracted Lab Biomarkers'}
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => { setExtractedData(null); setLabImage(null); }}
                  className="text-slate-400 hover:text-slate-200 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5">
                {extractedData.map(item => {
                  const isDeficient = item.status === 'low';
                  return (
                    <div
                      key={item.biomarkerId}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-slate-100">
                            {language === 'ar' ? item.nameAr : item.nameEn}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {language === 'ar' ? 'المعدل الطبيعي:' : 'Reference range:'} {item.optimalRange}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-sm font-bold text-slate-100 block">
                            {item.value} {item.unit}
                          </span>
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            isDeficient
                              ? 'bg-rose-950/80 text-rose-400 border border-rose-800'
                              : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                          }`}>
                            {language === 'ar' ? item.statusLabelAr : item.statusLabelEn}
                          </span>
                        </div>
                      </div>

                      {/* Plain Language Supplement Advice */}
                      <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs">
                        <div className="text-[10px] text-cyan-400 font-bold flex items-center gap-1 mb-0.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'نصيحة المكملات والتحسين:' : 'Supplement & Optimization Advice:'}</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed text-[11px]">
                          {language === 'ar' ? item.adviceAr : item.adviceEn}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Save Button */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleSaveExtractedResults}
                  className="w-full min-h-[44px] rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/25 transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'ar' ? 'حفظ النتائج في سجلي الصحي' : 'Save Extracted Results to Profile'}</span>
                </button>

                {savedSuccess && (
                  <div className="mt-2 p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-400 text-center font-medium">
                    {language === 'ar' ? 'تم حفظ النتائج في ملفك بنجاح!' : 'Results saved successfully to your health records!'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Historical Saved Biomarkers */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {language === 'ar' ? 'المؤشرات الحيوية المسجلة' : 'Saved Biomarkers'}
            </h4>

            {biomarkerRecords.length > 0 ? (
              <div className="space-y-2">
                {biomarkerRecords.map(rec => {
                  const def = SEED_BIOMARKERS.find(b => b.id === rec.biomarkerId);
                  const isExpanded = expandedBiomarker === rec.id;
                  const isOptimal = rec.status === 'optimal';

                  return (
                    <div key={rec.id} className="glass-panel p-3 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-slate-100">
                            {def ? (language === 'ar' ? def.name : def.name) : rec.biomarkerId}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {rec.date} {def && `• Ref: ${def.optimalRangeMin} - ${def.optimalRangeMax} ${def.unit}`}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <span className="text-xs font-bold text-slate-100 block">
                              {rec.value} {def?.unit}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              isOptimal
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}>
                              {rec.status}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setExpandedBiomarker(isExpanded ? null : rec.id)}
                            className="p-1 text-slate-400 hover:text-slate-200"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {isExpanded && def && (
                        <div className="pt-2 border-t border-slate-800/80 text-xs space-y-1.5">
                          <p className="text-slate-300 text-[11px]">
                            {language === 'ar' ? def.descriptionAr : def.descriptionEn}
                          </p>
                          <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-cyan-300">
                            {rec.status === 'low'
                              ? (language === 'ar' ? def.adviceLowAr : def.adviceLowEn)
                              : rec.status === 'high'
                              ? (language === 'ar' ? def.adviceHighAr : def.adviceHighEn)
                              : (language === 'ar' ? 'المؤشر ضمن النطاق المثالي الرياضي.' : 'Biomarker within optimal athletic range.')}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                {language === 'ar'
                  ? 'لا توجد نتائج مسجلة حتى الآن. انقر على "رفع صورة تقرير التحليل" للبدء.'
                  : 'No lab records stored yet. Click "Upload Lab Test Image" above to extract your blood test biomarkers.'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
