import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Droplets, 
  Plus, 
  Clock, 
  Bell, 
  BellOff, 
  CheckCircle2 
} from 'lucide-react';

export const WaterModule: React.FC = () => {
  const { 
    language,
    t, 
    waterLog, 
    addWaterMl, 
    hourlyWaterAlerts, 
    setHourlyWaterAlerts 
  } = useApp();

  const [customAmount, setCustomAmount] = useState<number>(300);

  const percent = Math.min(100, Math.round((waterLog.currentMl / (waterLog.targetMl || 3200)) * 100));
  const isTargetAchieved = waterLog.currentMl >= waterLog.targetMl;

  return (
    <div className="space-y-4 pb-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wide">
            {t.water.moduleTitle}
          </h2>
        </div>

        {/* Hourly reminder toggle */}
        <button
          type="button"
          onClick={() => setHourlyWaterAlerts(!hourlyWaterAlerts)}
          className={`flex items-center gap-1.5 px-3 min-h-[40px] rounded-xl text-xs font-bold transition-all border ${
            hourlyWaterAlerts
              ? 'bg-blue-950/60 border-blue-500/40 text-blue-300'
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
        >
          {hourlyWaterAlerts ? <Bell className="w-4 h-4 text-cyan-400" /> : <BellOff className="w-4 h-4" />}
          <span>{hourlyWaterAlerts ? (language === 'ar' ? 'التنبيهات مفعلة' : 'Alerts ON') : (language === 'ar' ? 'التنبيهات معطلة' : 'Alerts OFF')}</span>
        </button>
      </div>

      {/* Main Hydration Card */}
      <div className="glass-panel p-5 rounded-2xl border border-blue-500/30 flex flex-col items-center justify-center relative shadow-lg shadow-blue-950/30">
        <div className="flex items-center justify-between w-full mb-3">
          <div>
            <span className="text-xs text-slate-400 font-medium block">
              {t.water.dailyHydrationTarget}
            </span>
            <div className="text-2xl font-black text-slate-100 mt-0.5">
              {waterLog.currentMl} <span className="text-xs font-normal text-slate-400">/ {waterLog.targetMl} ml</span>
            </div>
          </div>

          {isTargetAchieved && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === 'ar' ? 'تم الوصول للهدف!' : 'TARGET MET'}</span>
            </span>
          )}
        </div>

        {/* Fluid Cylinder Visualizer */}
        <div className="relative w-36 h-52 rounded-3xl bg-slate-950 border-2 border-blue-500/50 p-2 overflow-hidden shadow-xl shadow-blue-950 flex flex-col justify-end my-2">
          {/* Measurement lines */}
          <div className="absolute inset-y-3 right-2.5 flex flex-col justify-between text-[9px] font-mono text-blue-400/40 pointer-events-none z-10 select-none">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>

          {/* Water Level */}
          <div
            className="w-full bg-gradient-to-t from-blue-600 via-cyan-500 to-blue-400 rounded-b-2xl transition-all duration-700 relative"
            style={{ height: `${percent}%` }}
          >
            <div className="absolute top-0 inset-x-0 h-2 bg-white/40 blur-[1px] animate-pulse" />
          </div>

          {/* Percentage Inside */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
            <span className="text-3xl font-black text-slate-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              {percent}%
            </span>
            <span className="text-xs text-cyan-200 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] mt-0.5 font-medium">
              {Math.max(0, waterLog.targetMl - waterLog.currentMl)} ml {language === 'ar' ? 'متبقية' : 'left'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
          {language === 'ar' ? 'إضافة سريعة للماء' : 'Quick Hydration Log'}
        </span>

        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => addWaterMl(250)}
            className="min-h-[50px] px-2 rounded-xl bg-slate-900 hover:bg-slate-850 active:scale-95 border border-blue-500/30 text-blue-300 font-bold text-xs flex flex-col items-center justify-center gap-0.5 transition-all shadow-sm"
          >
            <span className="text-cyan-400 text-sm font-black">+250</span>
            <span className="text-[10px] text-slate-400">{t.common.ml}</span>
          </button>

          <button
            type="button"
            onClick={() => addWaterMl(500)}
            className="min-h-[50px] px-2 rounded-xl bg-blue-950/60 hover:bg-blue-900/70 active:scale-95 border border-blue-500/50 text-blue-200 font-bold text-xs flex flex-col items-center justify-center gap-0.5 transition-all shadow-md shadow-blue-950/50"
          >
            <span className="text-cyan-300 text-sm font-black">+500</span>
            <span className="text-[10px] text-blue-300">{t.common.ml}</span>
          </button>

          <button
            type="button"
            onClick={() => addWaterMl(750)}
            className="min-h-[50px] px-2 rounded-xl bg-slate-900 hover:bg-slate-850 active:scale-95 border border-blue-500/30 text-blue-300 font-bold text-xs flex flex-col items-center justify-center gap-0.5 transition-all shadow-sm"
          >
            <span className="text-cyan-400 text-sm font-black">+750</span>
            <span className="text-[10px] text-slate-400">{t.common.ml}</span>
          </button>
        </div>

        {/* Custom Input */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="number"
            step="50"
            min="10"
            value={customAmount}
            onChange={e => setCustomAmount(parseInt(e.target.value, 10) || 0)}
            className="w-28 min-h-[44px] bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-slate-100 font-bold text-center focus:border-cyan-400 focus:outline-none shrink-0"
          />
          <button
            type="button"
            onClick={() => addWaterMl(customAmount)}
            className="flex-1 min-h-[44px] px-4 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 active:scale-[0.98] text-slate-950 shadow-md shadow-cyan-500/25 transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? `إضافة ${customAmount} مل` : `Add ${customAmount} ml`}</span>
          </button>
        </div>
      </div>

      {/* Today's Intake History Log */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>{language === 'ar' ? 'سجل شرب الماء اليوم' : "Today's Intake Log"}</span>
          <span>{waterLog.entries.length} {language === 'ar' ? 'تسجيلات' : 'entries'}</span>
        </div>

        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
          {waterLog.entries.length > 0 ? (
            waterLog.entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-950/60 text-xs border border-slate-800/80"
              >
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  {entry.timestamp}
                </span>
                <span className="text-cyan-300 font-bold">
                  +{entry.amountMl} ml
                </span>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-500 py-3 text-center">
              {language === 'ar' ? 'لم يتم تسجيل شرب ماء اليوم حتى الآن.' : 'No water intake logged yet today.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
