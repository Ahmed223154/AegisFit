import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  User, 
  Languages, 
  Bell, 
  Download, 
  Upload, 
  RotateCcw, 
  Shield, 
  Smartphone, 
  CheckCircle, 
  Award, 
  FileCode, 
  Terminal, 
  ExternalLink,
  Zap
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
    updateProfile, 
    resetAllData,
    exportAppDataJson,
    importAppDataJson,
    hourlyWaterAlerts,
    setHourlyWaterAlerts
  } = useApp();

  const [testNotifSent, setTestNotifSent] = useState(false);
  const [showDeploymentGuide, setShowDeploymentGuide] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleTestNotification = async () => {
    await scheduleLocalNotification(
      'AegisFit Combat Telemetry',
      'Hydration and hypertrophy targets calibrated. Stay focused on the mission!',
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
        setImportStatus('Database successfully restored from offline backup!');
      } else {
        setImportStatus('Failed to parse backup file. Invalid format.');
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-3 pb-6">
      {/* Mobile-First Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5">
          <User className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold tracking-wider text-slate-100 font-telemetry uppercase">
            {t.profile.moduleTitle}
          </h2>
        </div>

        {/* Language Switcher (Min 38px touch button) */}
        <button
          type="button"
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="flex items-center gap-1.5 px-3 min-h-[38px] rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-cyan-300 font-bold text-xs transition-all"
        >
          <Languages className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'العربية' : 'English'}</span>
        </button>
      </div>

      {/* Profile Overview Card (Mobile Stack) */}
      <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-telemetry font-black text-xl glow-cyan shrink-0">
            {profile.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100 font-telemetry uppercase truncate">
                {profile.name}
              </h3>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800 shrink-0">
                LVL {profile.currentLevel}
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 truncate">
              Goal: <span className="text-cyan-300 capitalize font-bold">{profile.primaryGoal.replace('_', ' ')}</span>
            </div>
            <div className="text-[10px] text-amber-400 font-mono">
              {profile.totalXp} XP • {profile.streakDays} Day Streak 🔥
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSurvey}
          className="w-full min-h-[44px] rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 active:scale-[0.98] text-slate-950 shadow-md shadow-cyan-500/30 transition-all font-telemetry uppercase flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Recalibrate Assessment</span>
        </button>
      </div>

      {/* Target Metrics Telemetry Grid (2x2) */}
      <div className="grid grid-cols-2 gap-2">
        <div className="glass-panel p-3 rounded-xl border border-slate-800">
          <span className="text-[9px] font-mono text-slate-400 block uppercase">CALORIC TARGET</span>
          <span className="text-base font-bold text-slate-100 font-telemetry">{profile.targetCalories} kcal</span>
        </div>
        <div className="glass-panel p-3 rounded-xl border border-slate-800">
          <span className="text-[9px] font-mono text-slate-400 block uppercase">PROTEIN TARGET</span>
          <span className="text-base font-bold text-emerald-400 font-telemetry">{profile.targetProteinGrams} g</span>
        </div>
        <div className="glass-panel p-3 rounded-xl border border-slate-800">
          <span className="text-[9px] font-mono text-slate-400 block uppercase">BODYWEIGHT</span>
          <span className="text-base font-bold text-slate-100 font-telemetry">{profile.weightKg} kg</span>
        </div>
        <div className="glass-panel p-3 rounded-xl border border-slate-800">
          <span className="text-[9px] font-mono text-slate-400 block uppercase">BODY FAT %</span>
          <span className="text-base font-bold text-amber-400 font-telemetry">{profile.bodyFatPercent}%</span>
        </div>
      </div>

      {/* Native Notifications & Device Bridges */}
      <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
        <div className="flex items-center gap-1.5">
          <Bell className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-slate-100 font-telemetry uppercase">
            Native Push & Telemetry Signals
          </h3>
        </div>

        <p className="text-[11px] text-slate-400 leading-snug">
          AegisFit integrates natively with iOS Local Notifications via `@capacitor/local-notifications` for offline alarms.
        </p>

        <div className="space-y-2 pt-0.5">
          <button
            type="button"
            onClick={handleTestNotification}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-850 text-cyan-300 border border-slate-700 transition-all"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Test Native iOS Notification</span>
          </button>

          {testNotifSent && (
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Notification dispatched to system banner!</span>
            </div>
          )}
        </div>
      </div>

      {/* Offline Data Management (Export / Import / Reset) */}
      <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center gap-1.5">
          <Download className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-slate-100 font-telemetry uppercase">
            {t.profile.exportData} & Offline Backup
          </h3>
        </div>

        <p className="text-[11px] text-slate-400 leading-snug">
          Your data is stored 100% locally on your iPhone. Export a JSON snapshot anytime or restore from backup.
        </p>

        {importStatus && (
          <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-xs font-mono text-cyan-300">
            {importStatus}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/30 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON Database</span>
          </button>

          <label className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-700 cursor-pointer transition-all">
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Restore Backup</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all local data back to factory parameters? This cannot be undone.')) {
                resetAllData();
              }
            }}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 border border-rose-900/50 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.profile.resetData}</span>
          </button>
        </div>
      </div>

      {/* SideStore & iPhone 13 Pro Max Deployment Engine Guide */}
      <div className="glass-panel p-3.5 rounded-2xl border border-cyan-500/30 space-y-3 glow-cyan">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-slate-100 font-telemetry uppercase">
              SideStore Deployment Guide
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowDeploymentGuide(!showDeploymentGuide)}
            className="px-2.5 min-h-[36px] rounded-lg text-xs font-mono text-cyan-300 bg-slate-900 border border-slate-700"
          >
            {showDeploymentGuide ? 'Hide' : 'Guide'}
          </button>
        </div>

        <p className="text-[11px] text-slate-300 leading-snug">
          Deploy AegisFit directly onto an iPhone 13 Pro Max via Capacitor, GitHub Actions, and SideStore without a paid Apple Developer Account.
        </p>

        {showDeploymentGuide && (
          <div className="space-y-3 pt-2 border-t border-slate-800 text-xs text-slate-300 font-mono">
            <div className="space-y-1">
              <div className="text-cyan-400 font-bold flex items-center gap-1 text-[11px]">
                <Terminal className="w-3.5 h-3.5" />
                <span>1. Local Capacitor iOS Init</span>
              </div>
              <pre className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-cyan-300 overflow-x-auto text-[10px]">
{`npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/local-notifications @capacitor/haptics
npx cap init "AegisFit" "com.aegisfit.telemetry" --web-dir dist
npm run build
npx cap add ios
npx cap sync ios`}
              </pre>
            </div>

            <div className="space-y-1">
              <div className="text-cyan-400 font-bold flex items-center gap-1 text-[11px]">
                <FileCode className="w-3.5 h-3.5" />
                <span>2. GitHub Actions .ipa Workflow</span>
              </div>
              <pre className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-300 overflow-x-auto text-[10px]">
{`name: Build AegisFit IPA
on: [push]
jobs:
  build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci && npm run build
      - run: npx cap sync ios
      - name: Build Xcode Archive
        run: |
          cd ios/App
          xcodebuild -workspace App.xcworkspace -scheme App -configuration Release -archivePath AegisFit.xcarchive archive CODE_SIGNING_ALLOWED=NO
          mkdir -p Payload && cp -r AegisFit.xcarchive/Products/Applications/App.app Payload/
          zip -r AegisFit.ipa Payload
      - uses: actions/upload-artifact@v4
        with:
          name: AegisFit-IPA
          path: ios/App/AegisFit.ipa`}
              </pre>
            </div>

            <div className="space-y-1">
              <div className="text-cyan-400 font-bold flex items-center gap-1 text-[11px]">
                <Smartphone className="w-3.5 h-3.5" />
                <span>3. SideStore Sideloading</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[10px]">
                <li>Install SideStore on your iPhone 13 Pro Max using AltServer (one-time setup) with WireGuard VPN configured.</li>
                <li>Download the generated <code className="text-cyan-300">AegisFit.ipa</code> artifact from your GitHub repository onto your iPhone Files app.</li>
                <li>Open SideStore on your iPhone, tap <strong>"+"</strong> in "My Apps", and select <code className="text-cyan-300">AegisFit.ipa</code>.</li>
                <li>SideStore signs AegisFit with your free Apple ID and installs it to your home screen!</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
