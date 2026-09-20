import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  User, 
  Languages, 
  Bell, 
  Download, 
  Upload, 
  RotateCcw, 
  Sparkles, 
  CheckCircle, 
  Zap,
  Target,
  Flame,
  Droplets
} from 'lucide-react';
import { scheduleLocalNotification } from '../../utils/nativeCapabilities';

interface ProfileModuleProps {
  onOpenSurvey: () => void;
}

export const ProfileModule: React.FC<ProfileModuleProps> = ({ onOpenSurvey }) => {
  const { 
    language, 
    setLanguage, 
    t, 
    profile, 
    resetAllData,
    exportAppDataJson,
    importAppDataJson
  } = useApp();

  const [testNotifSent, setTestNotifSent] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleTestNotification = async () => {
    await scheduleLocalNotification(
      'AegisFit Reminder',
      'Time to hydrate and check your daily nutrition targets!',
      1
    );
    setTestNotifSent(true);
    setTimeout(() => setTestNotifSent(false), 3500);
  };

  const handleExport = async () => {
    const jsonStr = await exportAppDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aegisfit_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const success = await importAppDataJson(content);
      if (success) {
        setImportStatus(language === 'ar' ? 'تم استرجاع البيانات بنجاح!' : 'Data restored successfully from backup!');
      } else {
        setImportStatus(language === 'ar' ? 'فشل استرجاع الملف. صيغة غير صالحة.' : 'Failed to parse backup file. Invalid format.');
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 pb-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wide">
            {t.profile.moduleTitle}
          </h2>
        </div>

        {/* Language Switcher */}
        <button
          type="button"
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="flex items-center gap-1.5 px-3 min-h-[40px] rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-cyan-300 font-bold text-xs transition-all"
        >
          <Languages className="w-4 h-4" />
          <span>{language === 'en' ? 'العربية' : 'English'}</span>
        </button>
      </div>

      {/* User Profile Card */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-black text-xl glow-cyan shrink-0">
            {profile.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100 truncate">
                {profile.name}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800 shrink-0">
                {t.common.level} {profile.currentLevel}
              </span>
            </div>
            <div className="text-xs text-slate-400 truncate mt-0.5">
              {language === 'ar' ? 'الهدف:' : 'Goal:'} <span className="text-cyan-300 capitalize font-bold">{profile.primaryGoal.replace('_', ' ')}</span>
            </div>
            <div className="text-[11px] text-amber-400 font-mono mt-0.5">
              {profile.totalXp} XP • {profile.streakDays} {t.common.days} {t.common.streak} 🔥
            </div>
          </div>
        </div>

        {/* Retake Assessment Button */}
        <button
          type="button"
          onClick={onOpenSurvey}
          className="w-full min-h-[48px] rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 active:scale-[0.98] text-slate-950 shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 fill-current" />
          <span>{t.profile.recalculateStats}</span>
        </button>
      </div>

      {/* Target Stats Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="glass-panel p-3 rounded-xl border border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 block font-medium">{t.nutrition.calories}</span>
          <span className="text-base font-bold text-slate-100 mt-0.5 block">{profile.targetCalories} kcal</span>
        </div>
        <div className="glass-panel p-3 rounded-xl border border-slate-800 text-center">
          <span className="text-[11px] text-emerald-400 block font-medium">{t.nutrition.protein}</span>
          <span className="text-base font-bold text-emerald-400 mt-0.5 block">{profile.targetProteinGrams} g</span>
        </div>
        <div className="glass-panel p-3 rounded-xl border border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 block font-medium">{t.survey.weight}</span>
          <span className="text-base font-bold text-slate-100 mt-0.5 block">{profile.weightKg} kg</span>
        </div>
        <div className="glass-panel p-3 rounded-xl border border-slate-800 text-center">
          <span className="text-[11px] text-blue-400 block font-medium">{t.water.dailyHydrationTarget}</span>
          <span className="text-base font-bold text-blue-300 mt-0.5 block">{profile.targetWaterMl} ml</span>
        </div>
      </div>

      {/* Local Push Notifications */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100">
            {language === 'ar' ? 'التنبيهات والإشعارات المحلية' : 'Local Push Notifications'}
          </h3>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          {language === 'ar'
            ? 'يرسل التطبيق تذكيرات للشرب والتمارين محلياً على هاتفك دون الحاجة لأي خوادم خارجية.'
            : 'AegisFit sends local reminders directly on your device without relying on external servers.'}
        </p>

        <button
          type="button"
          onClick={handleTestNotification}
          className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-850 text-cyan-300 border border-slate-700 transition-all"
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>{language === 'ar' ? 'تجربة إرسال تنبيه محلي' : 'Send Test Notification'}</span>
        </button>

        {testNotifSent && (
          <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-400 font-mono flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{language === 'ar' ? 'تم إرسال التنبيه التجريبي بنجاح!' : 'Notification successfully scheduled!'}</span>
          </div>
        )}
      </div>

      {/* Offline Data Management */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100">
            {t.profile.exportData}
          </h3>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          {language === 'ar'
            ? 'جميع بياناتك مسجلة بأمان على هاتفك دون إنترنت. يمكنك أخذ نسخة احتياطية بصيغة JSON متى أردت.'
            : 'All your workouts and nutrition logs are stored privately on your device. Export a backup or restore at any time.'}
        </p>

        {importStatus && (
          <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-xs text-cyan-300">
            {importStatus}
          </div>
        )}

        <div className="flex flex-col gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleExport}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/25 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{t.common.exportBackup}</span>
          </button>

          <label className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-700 cursor-pointer transition-all">
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>{t.common.importBackup}</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          <button
            type="button"
            onClick={() => {
              if (window.confirm(language === 'ar' ? 'هل أنت متأكد من مسح جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.' : 'Reset all local data back to initial empty state? This cannot be undone.')) {
                resetAllData();
              }
            }}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 border border-rose-900/50 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.profile.resetData}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
