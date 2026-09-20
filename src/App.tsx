import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
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
  Smartphone,
  Maximize2,
  Minimize2
} from 'lucide-react';

type TabType = 'dashboard' | 'gym' | 'nutrition' | 'water' | 'supplements' | 'profile';

interface MainLayoutProps {
  inPhoneFrame?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ inPhoneFrame = false }) => {
  const { language, setLanguage, t, profile, activeWorkout } = useApp();
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [showSurveyModal, setShowSurveyModal] = useState(!profile.onboardingCompleted);

  return (
    <div className={`w-full ${inPhoneFrame ? 'h-full' : 'min-h-screen h-[100dvh]'} bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans selection:bg-cyan-500 selection:text-slate-950 relative`}>
      {/* Top Header Bar with iOS Safe Area Top Inset */}
      <header className={`sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 pb-3 shrink-0 ${
        inPhoneFrame ? 'pt-8' : 'pt-[calc(0.75rem+env(safe-area-inset-top,0px))]'
      }`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            type="button" 
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-2.5 text-left group min-h-[44px]"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-400 to-blue-500 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/30 group-hover:scale-105 transition-transform shrink-0">
              <Shield className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-telemetry font-black tracking-wider text-base text-slate-100 uppercase">
                  AEGIS<span className="text-cyan-400">FIT</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  LVL {profile.currentLevel}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                {language === 'ar' ? 'متتبع اللياقة والصحة الذكي' : 'Smart Fitness & Health Tracker'}
              </div>
            </div>
          </button>

          <div className="flex items-center gap-2">
            {/* Active Workout Indicator */}
            {activeWorkout && (
              <button
                type="button"
                onClick={() => setCurrentTab('gym')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse min-h-[40px]"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>{language === 'ar' ? 'تمرين نشط' : 'LIVE'}</span>
              </button>
            )}

            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="min-h-[40px] px-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-1 text-xs font-bold"
              title={language === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
            >
              <Languages className="w-4 h-4 text-cyan-400" />
              <span>{language === 'en' ? 'العربية' : 'EN'}</span>
            </button>

            {/* Profile Avatar Trigger */}
            <button
              type="button"
              onClick={() => setCurrentTab('profile')}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                currentTab === 'profile'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-cyan-500/40'
              }`}
              title={t.nav.profile}
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Responsive Viewport */}
      <main className={`flex-1 overflow-y-auto overflow-x-hidden ${
        inPhoneFrame ? 'pb-24 px-3 pt-2' : 'pb-28 px-3 sm:px-6 pt-3'
      } no-scrollbar space-y-4 max-w-4xl mx-auto w-full`}>
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

      {/* Docked Responsive Bottom Navigation Bar with iOS Safe Area Bottom Inset */}
      <div className={`sticky bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 shadow-2xl ${
        inPhoneFrame ? 'pb-5' : 'pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]'
      }`}>
        <nav className="max-w-4xl mx-auto grid grid-cols-5 items-center px-2 pt-2">
          <button
            type="button"
            onClick={() => setCurrentTab('dashboard')}
            className={`flex flex-col items-center justify-center gap-1 min-h-[46px] transition-all ${
              currentTab === 'dashboard'
                ? 'text-cyan-400 font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span className="text-[11px] font-mono tracking-tight leading-none">{t.nav.dashboard}</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('gym')}
            className={`flex flex-col items-center justify-center gap-1 min-h-[46px] transition-all ${
              currentTab === 'gym'
                ? 'text-cyan-400 font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Dumbbell className="w-5 h-5" />
            <span className="text-[11px] font-mono tracking-tight leading-none">{t.nav.gym}</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('nutrition')}
            className={`flex flex-col items-center justify-center gap-1 min-h-[46px] transition-all ${
              currentTab === 'nutrition'
                ? 'text-cyan-400 font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Utensils className="w-5 h-5" />
            <span className="text-[11px] font-mono tracking-tight leading-none">{t.nav.nutrition}</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('water')}
            className={`flex flex-col items-center justify-center gap-1 min-h-[46px] transition-all ${
              currentTab === 'water'
                ? 'text-blue-400 font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Droplets className="w-5 h-5" />
            <span className="text-[11px] font-mono tracking-tight leading-none">{t.nav.water}</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('supplements')}
            className={`flex flex-col items-center justify-center gap-1 min-h-[46px] transition-all ${
              currentTab === 'supplements'
                ? 'text-cyan-400 font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Pill className="w-5 h-5" />
            <span className="text-[11px] font-mono tracking-tight leading-none">{t.nav.supplements}</span>
          </button>
        </nav>
      </div>

      {/* Fitness Assessment Survey Modal */}
      <SurveyModal
        isOpen={showSurveyModal}
        onClose={() => setShowSurveyModal(false)}
      />
    </div>
  );
};

export default function App() {
  const isNative = Capacitor.isNativePlatform();

  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !isNative && window.innerWidth >= 768;
  });

  const [forceFullScreen, setForceFullScreen] = useState(false);

  useEffect(() => {
    if (isNative) return;
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isNative]);

  const showPhoneFrame = !isNative && isDesktop && !forceFullScreen;

  return (
    <AppProvider>
      {showPhoneFrame ? (
        <div className="w-full min-h-screen bg-gradient-to-br from-[#05070e] via-[#090e1a] to-[#04060b] flex flex-col items-center justify-center p-3 sm:p-5 overflow-hidden">
          {/* Top Desktop Controls Bar */}
          <div className="flex items-center justify-between w-[428px] max-w-full mb-3 px-2 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-1.5 text-cyan-400 font-medium">
              <Smartphone className="w-3.5 h-3.5" />
              <span>iPhone 13 Pro Max</span>
              <span className="text-[10px] text-slate-500">(428 × 926)</span>
            </div>
            <button
              type="button"
              onClick={() => setForceFullScreen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-colors text-[11px]"
              title="Expand to Full Viewport"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Full Screen</span>
            </button>
          </div>

          {/* iPhone 13 Pro Max Outer Chassis */}
          <div className="relative w-[428px] h-[926px] max-h-[calc(100dvh-5rem)] rounded-[54px] bg-slate-900 border-[10px] border-[#1e2638] shadow-[0_0_80px_rgba(6,182,212,0.15),0_25px_60px_-15px_rgba(0,0,0,0.95)] ring-1 ring-slate-600/50 flex flex-col overflow-hidden">
            {/* Top Notch with Speaker and Camera */}
            <div className="absolute top-0 inset-x-0 z-50 pointer-events-none flex justify-center">
              <div className="w-36 h-6 bg-[#1e2638] rounded-b-2xl flex items-center justify-center gap-2.5 shadow-sm">
                <div className="w-10 h-1 bg-slate-700 rounded-full" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-700" />
              </div>
            </div>

            {/* Inner Display Screen */}
            <div className="relative w-full h-full rounded-[44px] overflow-hidden bg-slate-950 flex flex-col">
              <MainLayout inPhoneFrame={true} />
            </div>

            {/* Bottom iOS Home Indicator */}
            <div className="absolute bottom-1.5 inset-x-0 z-50 pointer-events-none flex justify-center pb-1">
              <div className="w-32 h-1 bg-slate-400/50 rounded-full" />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full min-h-screen h-[100dvh]">
          {/* If desktop user chose full screen, provide button to return to Phone Mockup */}
          {!isNative && isDesktop && (
            <button
              type="button"
              onClick={() => setForceFullScreen(false)}
              className="fixed top-3 right-3 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 shadow-xl backdrop-blur-md transition-all"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Phone Frame</span>
            </button>
          )}
          <MainLayout inPhoneFrame={false} />
        </div>
      )}
    </AppProvider>
  );
}
