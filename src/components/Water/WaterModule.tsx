import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Droplets, 
  Plus, 
  Clock, 
  Bell, 
  BellOff, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2 
} from 'lucide-react';

export const WaterModule: React.FC = () => {
  const { 
    t, 
    waterLog, 
    addWaterMl, 
    hourlyWaterAlerts, 
    setHourlyWaterAlerts 
  } = useApp();

  const [customAmount, setCustomAmount] = useState<number>(300);

  const percent = Math.min(100, Math.round((waterLog.currentMl / (waterLog.targetMl || 3750)) * 100));
  const isTargetAchieved = waterLog.currentMl >= waterLog.targetMl;

  return (
    <div className="space-y-3 pb-6">
      {/* Mobile-First Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5">
          <Droplets className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-bold tracking-wider text-slate-100 font-telemetry uppercase">
            {t.water.moduleTitle}
          </h2>
        </div>

        {/* Hourly reminder toggle */}
        <button
          type="button"
          onClick={() => setHourlyWaterAlerts(!hourlyWaterAlerts)}
          className={`flex items-center gap-1.5 px-3 min-h-[38px] rounded-xl text-xs font-mono font-bold transition-all border ${
            hourlyWaterAlerts
              ? 'bg-blue-950/60 border-blue-500/40 text-blue-400'
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
        >
          {hourlyWaterAlerts ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          <span>{hourlyWaterAlerts ? 'Alerts ON' : 'Alerts OFF'}</span>
        </button>
      </div>

      {/* Main Hydration Reservoir Cylinder */}
      <div className="glass-panel p-3.5 rounded-2xl border border-blue-500/30 flex flex-col items-center justify-center relative shadow-lg shadow-blue-950/40">
        <div className="flex items-center justify-between w-full mb-2">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              {t.water.dailyHydrationTarget}
            </span>
            <div className="text-lg font-black text-slate-100 font-telemetry">
              {waterLog.currentMl} <span className="text-xs font-normal text-slate-400">/ {waterLog.targetMl} ml</span>
            </div>
          </div>

          {isTargetAchieved && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ACHIEVED</span>
            </span>
          )}
        </div>

        {/* Cyber Fluid Flask */}
        <div className="relative w-36 h-52 rounded-3xl bg-slate-950/90 border-2 border-blue-500/50 p-2 overflow-hidden shadow-xl shadow-blue-950 flex flex-col justify-end my-1">
          {/* Measurement lines */}
          <div className="absolute inset-y-3 right-2.5 flex flex-col justify-between text-[8px] font-mono text-blue-400/40 pointer-events-none z-10 select-none">
            <span>100% -</span>
            <span>75% -</span>
            <span>50% -</span>
            <span>25% -</span>
            <span>0% -</span>
          </div>

          {/* Glowing Water Level */}
          <div
            className="w-full bg-gradient-to-t from-blue-600 via-cyan-500 to-blue-400 rounded-b-2xl transition-all duration-700 relative"
            style={{ height: `${percent}%` }}
          >
            {/* Wave surface shimmer */}
            <div className="absolute top-0 inset-x-0 h-2.5 bg-white/35 blur-[1px] animate-pulse" />
          </div>

          {/* Percentage Display Inside */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
            <span className="text-3xl font-black text-slate-100 font-telemetry drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              {percent}%
            </span>
            <span className="text-[11px] font-mono text-cyan-200 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
              {Math.max(0, waterLog.targetMl - waterLog.currentMl)} ml left
            </span>
          </div>
        </div>
      </div>

      {/* Quick Add Interface & Controls */}
      <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 space-y-3">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
          Quick Hydration Doses
        </span>

        {/* Quick Increments (Min 44px touch buttons) */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => addWaterMl(250)}
            className="min-h-[48px] px-2 rounded-xl bg-slate-900 hover:bg-slate-850 active:scale-95 border border-blue-500/30 text-blue-300 font-bold text-xs font-telemetry flex flex-col items-center justify-center gap-0.5 transition-all shadow-sm"
          >
            <span className="text-cyan-400 text-sm font-black">+250</span>
            <span className="text-[10px] font-mono text-slate-400">{t.common.ml}</span>
          </button>

          <button
            type="button"
            onClick={() => addWaterMl(500)}
            className="min-h-[48px] px-2 rounded-xl bg-blue-950/50 hover:bg-blue-900/60 active:scale-95 border border-blue-500/50 text-blue-200 font-bold text-xs font-telemetry flex flex-col items-center justify-center gap-0.5 transition-all shadow-md shadow-blue-950"
          >
            <span className="text-cyan-300 text-sm font-black">+500</span>
            <span className="text-[10px] font-mono text-blue-300">{t.common.ml}</span>
          </button>

          <button
            type="button"
            onClick={() => addWaterMl(750)}
            className="min-h-[48px] px-2 rounded-xl bg-slate-900 hover:bg-slate-850 active:scale-95 border border-blue-500/30 text-blue-300 font-bold text-xs font-telemetry flex flex-col items-center justify-center gap-0.5 transition-all shadow-sm"
          >
            <span className="text-cyan-400 text-sm font-black">+750</span>
            <span className="text-[10px] font-mono text-slate-400">{t.common.ml}</span>
          </button>
        </div>

        {/* Custom Input */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="number"
            step="50"
            value={customAmount}
            onChange={e => setCustomAmount(parseInt(e.target.value, 10) || 0)}
            className="w-24 min-h-[44px] bg-slate-900 border border-slate-700 rounded-xl px-2 text-xs text-slate-100 font-mono text-center font-bold focus:border-cyan-400 focus:outline-none shrink-0"
          />
          <button
            type="button"
            onClick={() => addWaterMl(customAmount)}
            className="flex-1 min-h-[44px] px-3 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 active:scale-[0.98] text-slate-950 shadow-md shadow-cyan-500/30 transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add {customAmount} ml</span>
          </button>
        </div>
      </div>

      {/* Today's Intake History Log */}
      <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-400">
          <span>Today's Intake Log</span>
          <span>{waterLog.entries.length} Doses</span>
        </div>

        <div className="space-y-1.5 max-h-40 overflow-y-auto no-scrollbar pr-0.5">
          {waterLog.entries.length > 0 ? (
            waterLog.entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/60 text-xs font-mono border border-slate-800/80"
              >
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  {entry.timestamp}
                </span>
                <span className="text-cyan-400 font-bold">
                  +{entry.amountMl} ml
                </span>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-500 italic py-2 text-center">
              No fluid intake logged yet today.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
