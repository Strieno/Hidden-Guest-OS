import * as React from 'react';
import { AppProvider, useStore } from './hooks/useStore';
import { I18nProvider } from './lib/i18n';
import { Shell } from './components/Shell';
import { AchievementToast } from './components/AchievementToast';
import { unlockAudio } from './lib/sound';
import { Check } from 'lucide-react';

const Dashboard = React.lazy(() => import('./features/dashboard/Dashboard').then((m) => ({ default: m.Dashboard })));
const Assessment = React.lazy(() => import('./features/assessment/Assessment').then((m) => ({ default: m.Assessment })));
const Simulator = React.lazy(() => import('./features/simulator/Simulator').then((m) => ({ default: m.Simulator })));
const PhoneSim = React.lazy(() => import('./features/phone/PhoneSim').then((m) => ({ default: m.PhoneSim })));
const Training = React.lazy(() => import('./features/training/Training').then((m) => ({ default: m.Training })));
const Shift = React.lazy(() => import('./features/shift/Shift').then((m) => ({ default: m.Shift })));
const WeakPoints = React.lazy(() => import('./features/weak/WeakPoints').then((m) => ({ default: m.WeakPoints })));
const Reports = React.lazy(() => import('./features/reports/Reports').then((m) => ({ default: m.Reports })));
const Employees = React.lazy(() => import('./features/employees/Employees').then((m) => ({ default: m.Employees })));
const Supervisor = React.lazy(() => import('./features/supervisor/Supervisor').then((m) => ({ default: m.Supervisor })));
const Achievements = React.lazy(() => import('./features/achievements/Achievements').then((m) => ({ default: m.Achievements })));
const Academy = React.lazy(() => import('./features/academy/Academy').then((m) => ({ default: m.Academy })));
const Admin = React.lazy(() => import('./features/admin/Admin').then((m) => ({ default: m.Admin })));
const Settings = React.lazy(() => import('./features/settings/Settings').then((m) => ({ default: m.Settings })));
const Questionnaire = React.lazy(() => import('./features/questionnaire/Questionnaire').then((m) => ({ default: m.Questionnaire })));

function Loading() {
  return <div className="page-title"><h1>…</h1></div>;
}

function Router() {
  const { view } = useStore();
  return (
    <React.Suspense fallback={<Loading />}>
      {view === 'dashboard' && <Dashboard />}
      {view === 'assessment' && <Assessment />}
      {view === 'simulator' && <Simulator />}
      {view === 'phone' && <PhoneSim />}
      {view === 'training' && <Training />}
      {view === 'shift' && <Shift />}
      {view === 'weak' && <WeakPoints />}
      {view === 'reports' && <Reports />}
      {view === 'employees' && <Employees />}
      {view === 'supervisor' && <Supervisor />}
      {view === 'achievements' && <Achievements />}
      {view === 'academy' && <Academy />}
      {view === 'admin' && <Admin />}
      {view === 'settings' && <Settings />}
      {view === 'questionnaire' && <Questionnaire />}
      {view !== 'dashboard' && view !== 'assessment' && view !== 'simulator' && view !== 'phone' && view !== 'training' && view !== 'shift' && view !== 'weak' && view !== 'reports' && view !== 'employees' && view !== 'supervisor' && view !== 'achievements' && view !== 'academy' && view !== 'admin' && view !== 'settings' && view !== 'questionnaire' && <Dashboard />}
    </React.Suspense>
  );
}

function AppInner() {
  const { lang, setLang, toastMsg } = useStore();

  // unlock audio on first interaction (autoplay policy)
  React.useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  return (
    <I18nProvider lang={lang} setLang={setLang}>
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="app-root">
        <Shell>
          <Router />
        </Shell>
        <AchievementToast />
        {toastMsg && (
          <div className="toast" role="status">
            <Check size={15} /> {toastMsg}
          </div>
        )}
      </div>
    </I18nProvider>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
