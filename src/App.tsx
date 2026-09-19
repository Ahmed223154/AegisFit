import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DashboardView } from './components/Dashboard/DashboardView';
import { GymModule } from './components/Gym/GymModule';
import { NutritionModule } from './components/Nutrition/NutritionModule';
import { SupplementsModule } from './components/Supplements/SupplementsModule';
import { WaterModule } from './components/Water/WaterModule';
import { ProfileModule } from './components/Profile/ProfileModule';
import { SurveyModal } from './components/Survey/SurveyModal';
import { 
  Activity, 
  Dumbbell, 
  Utensils, 
  Droplets, 
  Pill, 
  User, 
  Shield, 
  Languages, 
  Zap, 
  Award,
  Sparkles
} from 'lucide-react';

type TabType = 'dashboard' | 'gym' | 'nutrition' | 'water' | 'supplements' | 'profile';

const MainLayout: React.FC = () => {
  const { language, setLanguage, t, profile, activeWorkout } = useApp();
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [showSurveyModal, setShowSurveyModal] = useState(!profile.onboardingCompleted);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-0 sm:p-4 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* iPhone 13 Pro Max Device Frame Container */}
      <div 
        id="iphone-13-pro-max-frame"
        className="w-full max-w-[428px] h-[100dvh] sm:h-[926px] bg-slate-950 text-slate-100 flex flex-col overflow-hidden sm:rounded-[48px] sm:border-[8px] sm:border-slate-800 shadow-2xl relative"
      >
        {/* Native iOS Top Notch & Speaker Bar */}
        <div className="relative z-50 bg-slate-950/95 backdrop-blur-md px-5 pt-2 pb-1 shrink-0 select-none border-b border-slate-900/60">
          <div className="flex items-center justify-between">
            {/* iOS Left Telemetry Clock */}
            <span className="w-14 font-mono text-[12px] font-bold tracking-tight text-slate-200">
              9:41
            </span>

            {/* Top Notch & Speaker Slit */}
            <div className="w-40 h-5.5 bg-slate-900 rounded-b-2xl mx-auto flex items-center justify-center gap-2 border-b border-x border-slate-800/80 shadow-inner">
              <div className="w-12 h-1 bg-slate-700/90 rounded-full" />
              <div className="w-2.5 h-2.5 bg-slate-800 rounded-full border border-slate-700/60 flex items-center justify-center">
                <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
              </div>
            </div>

            {/* iOS Right Status Icons */}
            <div className="w-14 flex items-center justify-end gap-1.5 text-slate-300">
              <div className="flex items-end gap-0.5 h-2.5">
                <span className="w-0.5 h-1 bg-slate-300 rounded-xs" />
                <span className="w-0.5 h-1.5 bg-slate-300 rounded-xs" />
                <span className="w-0.5 h-2 bg-slate-300 rounded-xs" />
                <span className="w-0.5 h-2.5 bg-slate-300 rounded-xs" />
              </div>
              <span className="text-[9px] font-mono font-bold text-slate-400">5G</span>
              <div className="w-5 h-2.5 border border-slate-300 rounded-xs p-0.5 flex items-center">
                <div className="w-full h-full bg-emerald-400 rounded-2xs" />
              </div>
            </div>
          </div>
        </div>

        {/* Compact Native iOS App Header Bar */}
        <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 shrink-0">
          <div className="flex items-center justify-between">
            <button
              type="button" 
              onClick={() => setCurrentTab('dashboard')}
              className="flex items-center gap-2 text-left group min-h-[44px]"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-400 to-blue-500 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/30 group-hover:scale-105 transition-transform">
                <Shield className="w-4 h-4 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-telemetry font-black tracking-wider text-sm text-slate-100 uppercase">
                    AEGIS<span className="text-cyan-400">FIT</span>
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                    L{profile.currentLevel}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  {language === 'ar' ? 'نظام المراقبة الحركية' : 'Combat Telemetry OS'}
                </div>
              </div>
            </button>

            <div className="flex items-center gap-2">
              {/* Active Workout Live Badge */}
              {activeWorkout && (
                <button
                  type="button"
                  onClick={() => setCurrentTab('gym')}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse min-h-[36px]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>{language === 'ar' ? 'تمرين نشط' : 'LIVE'}</span>
                </button>
              )}

              {/* Language Switcher */}
              <button
                type="button"
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-colors flex items-center justify-center"
                title={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
              >
                <Languages className="w-4 h-4" />
              </button>

              {/* Profile Avatar Trigger */}
              <button
                type="button"
                onClick={() => setCurrentTab('profile')}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                  currentTab === 'profile'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-cyan-500/40'
                }`}
                title="Profile & Settings"
              >
                <User className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Viewport: Scrollable inside the 428px phone frame */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 px-4 pt-2 no-scrollbar space-y-3">
          {currentTab === 'dashboard' && (
            <DashboardView onNavigate={(tab) => setCurrentTab(tab as TabType)} />
          )}
          {currentTab === 'gym' && <GymModule />}
          {currentTab === 'nutrition' && <NutritionModule />}
          {currentTab === 'water' && <WaterModule />}
          {currentTab === 'supplements' && <SupplementsModule />}
          {currentTab === 'profile' && (
            <ProfileModule onOpenSurvey={() => setShowSurveyModal(true)} />
          )}
        </main>

        {/* Docked Native iOS Bottom Tab Bar */}
        <div className="absolute bottom-0 inset-x-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 shadow-2xl">
          <nav className="grid grid-cols-5 items-center px-1 pt-2 pb-1">
            <button
              type="button"
              onClick={() => setCurrentTab('dashboard')}
              className={`flex flex-col items-center justify-center gap-1 min-h-[44px] transition-all ${
                currentTab === 'dashboard'
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Activity className="w-5 h-5" />
              <span className="text-[10px] font-mono tracking-tight leading-none">{t.nav.dashboard}</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab('gym')}
              className={`flex flex-col items-center justify-center gap-1 min-h-[44px] transition-all ${
                currentTab === 'gym'
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Dumbbell className="w-5 h-5" />
              <span className="text-[10px] font-mono tracking-tight leading-none">{t.nav.gym}</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab('nutrition')}
              className={`flex flex-col items-center justify-center gap-1 min-h-[44px] transition-all ${
                currentTab === 'nutrition'
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Utensils className="w-5 h-5" />
              <span className="text-[10px] font-mono tracking-tight leading-none">{t.nav.nutrition}</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab('water')}
              className={`flex flex-col items-center justify-center gap-1 min-h-[44px] transition-all ${
                currentTab === 'water'
                  ? 'text-blue-400 font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Droplets className="w-5 h-5" />
              <span className="text-[10px] font-mono tracking-tight leading-none">{t.nav.water}</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab('supplements')}
              className={`flex flex-col items-center justify-center gap-1 min-h-[44px] transition-all ${
                currentTab === 'supplements'
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Pill className="w-5 h-5" />
              <span className="text-[10px] font-mono tracking-tight leading-none">{t.nav.supplements}</span>
            </button>
          </nav>

          {/* iOS Bottom Home Indicator Pill */}
          <div className="w-36 h-1 bg-slate-500/50 rounded-full mx-auto my-2" />
        </div>

        {/* Onboarding / Recalibration Assessment Modal */}
        <SurveyModal
          isOpen={showSurveyModal}
          onClose={() => setShowSurveyModal(false)}
        />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
