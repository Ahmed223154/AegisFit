import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  SupplementTiming, 
  SupplementProtocol, 
  BiomarkerDefinition, 
  BiomarkerRecord 
} from '../../types';
import { SEED_BIOMARKERS } from '../../data/seedData';
import { 
  Pill, 
  Activity, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Sun, 
  Zap, 
  Moon, 
  Coffee,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const SupplementsModule: React.FC = () => {
  const { 
    language, 
    t, 
    supplements, 
    toggleSupplementActive, 
    todaySupplementChecklist, 
    toggleSupplementCheck,
    biomarkerRecords,
    addBiomarkerRecord,
    deleteBiomarkerRecord
  } = useApp();

  const [activeTab, setActiveTab] = useState<'protocols' | 'biomarkers'>('protocols');
  const [selectedTimingFilter, setSelectedTimingFilter] = useState<string>('all');
  const [expandedBiomarker, setExpandedBiomarker] = useState<string | null>(null);

  // New Biomarker Entry Modal
  const [showAddBiomarkerModal, setShowAddBiomarkerModal] = useState(false);
  const [selectedBioDefId, setSelectedBioDefId] = useState(SEED_BIOMARKERS[0].id);
  const [bioValue, setBioValue] = useState<number>(750);
  const [bioNotes, setBioNotes] = useState('');

  // Group supplements by timing
  const timings: { id: SupplementTiming; label: string; icon: any }[] = [
    { id: 'morning', label: t.supplements.timingMorning, icon: Sun },
    { id: 'pre_workout', label: t.supplements.timingPre, icon: Zap },
    { id: 'post_workout', label: t.supplements.timingPost, icon: Activity },
    { id: 'with_meals', label: t.supplements.timingMeals, icon: Coffee },
    { id: 'bedtime', label: t.supplements.timingBedtime, icon: Moon }
  ];

  const handleSaveBiomarker = async () => {
    const def = SEED_BIOMARKERS.find(b => b.id === selectedBioDefId) || SEED_BIOMARKERS[0];
    let status: 'low' | 'optimal' | 'high' = 'optimal';
    if (bioValue < def.optimalRangeMin) status = 'low';
    if (bioValue > def.optimalRangeMax) status = 'high';

    await addBiomarkerRecord({
      biomarkerId: def.id,
      value: bioValue,
      date: new Date().toISOString().split('T')[0],
      status,
      notes: bioNotes
    });

    setBioNotes('');
    setShowAddBiomarkerModal(false);
  };

  return (
    <div className="space-y-3 pb-6">
      {/* Mobile-First Header */}
      <div className="flex flex-col gap-2 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5">
          <Pill className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold tracking-wider text-slate-100 font-telemetry uppercase">
            {t.supplements.moduleTitle}
          </h2>
        </div>

        {/* Segmented Tab Bar (Full Width, Min 40px) */}
        <div className="grid grid-cols-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('protocols')}
            className={`min-h-[38px] rounded-lg font-bold transition-all flex items-center justify-center ${
              activeTab === 'protocols'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
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
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.supplements.biomarkersTab}
          </button>
        </div>
      </div>

      {/* TAB 1: DAILY SUPPLEMENT PROTOCOLS */}
      {activeTab === 'protocols' && (
        <div className="space-y-3">
          {/* Adherence Overview Bar */}
          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                DAILY COMPLIANCE
              </span>
              <div className="text-base font-bold text-slate-100 font-telemetry">
                {todaySupplementChecklist.length} / {supplements.filter(s => s.active).length} Doses Taken
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                {t.supplements.notificationAlert}
              </span>
            </div>
          </div>

          {/* Protocols Grouped by Chronobiological Timing (Mobile Stack) */}
          <div className="space-y-3">
            {timings.map(({ id: timingId, label, icon: IconComponent }) => {
              const matchedSupps = supplements.filter(s => s.timing === timingId);
              if (matchedSupps.length === 0) return null;

              return (
                <div key={timingId} className="glass-panel p-3 rounded-xl border border-slate-800/90 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-telemetry text-xs font-bold uppercase tracking-wider border-b border-slate-800 pb-1.5">
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {matchedSupps.map(supp => {
                      const isChecked = todaySupplementChecklist.includes(supp.id);
                      return (
                        <div
                          key={supp.id}
                          className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${
                            isChecked
                              ? 'bg-cyan-950/30 border-cyan-500/40 glow-cyan'
                              : 'bg-slate-950/70 border-slate-800'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-slate-800 text-cyan-400">
                                GRADE {supp.evidenceGrade}
                              </span>
                              {supp.reminderTime && (
                                <span className="text-[9px] font-mono text-slate-400 flex items-center gap-0.5">
                                  <Clock className="w-2.5 h-2.5" />
                                  {supp.reminderTime}
                                </span>
                              )}
                            </div>

                            <h4 className="text-xs font-bold text-slate-100 font-telemetry">
                              {language === 'ar' ? supp.nameAr : supp.nameEn}
                            </h4>
                            <div className="text-[11px] font-mono text-cyan-300 font-semibold">
                              {supp.dosage}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                              {language === 'ar' ? supp.purposeAr : supp.purposeEn}
                            </p>
                          </div>

                          {/* Checkbox button (44px min touch target) */}
                          <button
                            type="button"
                            onClick={() => toggleSupplementCheck(supp.id)}
                            className={`min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center shrink-0 transition-all ${
                              isChecked
                                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/40 font-bold'
                                : 'bg-slate-900 border border-slate-700 text-slate-500 hover:text-slate-300 active:scale-95'
                            }`}
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
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

      {/* TAB 2: BIOMARKER LAB TEST HUB */}
      {activeTab === 'biomarkers' && (
        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-telemetry uppercase">
                {t.supplements.biomarkersTab}
              </h3>
              <p className="text-[11px] text-slate-400 leading-snug">
                Track blood panels against clinical sports reference ranges with evidence-based recommendations.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddBiomarkerModal(true)}
              className="w-full min-h-[42px] rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/30 flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{t.supplements.logNewBiomarker}</span>
            </button>
          </div>

          {/* Biomarkers List (Mobile Single Column Stack) */}
          <div className="space-y-2.5">
            {SEED_BIOMARKERS.map(def => {
              const latestRecord = biomarkerRecords.find(r => r.biomarkerId === def.id);
              const isExpanded = expandedBiomarker === def.id;

              const statusColor = 
                !latestRecord ? 'text-slate-500 border-slate-800' :
                latestRecord.status === 'optimal' ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' :
                'text-rose-400 border-rose-500/40 bg-rose-500/10';

              return (
                <div key={def.id} className="glass-panel p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <h4 className="font-bold text-slate-100 text-xs font-telemetry truncate">
                          {def.name}
                        </h4>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Ref: {def.optimalRangeMin} - {def.optimalRangeMax} {def.unit}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {latestRecord ? (
                        <div className="text-right">
                          <span className="text-xs font-black text-slate-100 font-telemetry block">
                            {latestRecord.value} {def.unit}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border ${statusColor}`}>
                            {latestRecord.status.toUpperCase()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500">
                          No Lab Data
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => setExpandedBiomarker(isExpanded ? null : def.id)}
                        className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Evidence & Recommendations */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
                      <p className="text-slate-300 text-[11px] leading-snug">
                        {language === 'ar' ? def.descriptionAr : def.descriptionEn}
                      </p>

                      <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1 font-mono">
                        <div className="text-cyan-400 font-bold flex items-center gap-1 text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Actionable Non-Clinical Optimization:</span>
                        </div>
                        <div className="text-slate-300 text-[10px] leading-normal">
                          {latestRecord?.status === 'low'
                            ? (language === 'ar' ? def.adviceLowAr : def.adviceLowEn)
                            : latestRecord?.status === 'high'
                            ? (language === 'ar' ? def.adviceHighAr : def.adviceHighEn)
                            : 'Biomarker within optimal athletic parameters. Maintain current whole-food diet and training recovery balance.'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RECORD BIOMARKER MODAL */}
      {showAddBiomarkerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-4 border border-cyan-500/30 shadow-2xl space-y-3">
            <h3 className="font-bold text-slate-100 text-sm font-telemetry uppercase">
              {t.supplements.logNewBiomarker}
            </h3>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Target Biomarker</label>
                <select
                  value={selectedBioDefId}
                  onChange={e => setSelectedBioDefId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 min-h-[44px] text-xs text-slate-100 focus:border-cyan-400 focus:outline-none font-telemetry"
                >
                  {SEED_BIOMARKERS.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">{t.supplements.value}</label>
                <input
                  type="number"
                  step="0.1"
                  value={bioValue}
                  onChange={e => setBioValue(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 min-h-[44px] text-xs text-slate-100 focus:border-cyan-400 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Fasting / Protocol Notes</label>
                <input
                  type="text"
                  value={bioNotes}
                  onChange={e => setBioNotes(e.target.value)}
                  placeholder="e.g. Fasted 12 hrs, drawn 08:30 AM"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 min-h-[44px] text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddBiomarkerModal(false)}
                className="px-4 min-h-[44px] rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleSaveBiomarker}
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
