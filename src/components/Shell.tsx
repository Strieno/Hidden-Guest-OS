import * as React from 'react';
import {
  LayoutDashboard, ClipboardCheck, Sparkles, BookOpen, Phone, Check, Target, FileText,
  Users, Trophy, BookOpenCheck, Settings as SettingsIcon, ScrollText, Search, Languages, Volume2, VolumeX,
} from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { useI18n } from '../lib/i18n';
import { CommandPalette } from './CommandPalette';
import { computeReadiness, levelFromXp } from '../lib/engine';
import type { View } from '../lib/types';

const NAV: Array<{ id: View; icon: React.ReactNode }> = [
  { id: 'dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'assessment', icon: <ClipboardCheck size={18} /> },
  { id: 'simulator', icon: <Sparkles size={18} /> },
  { id: 'phone', icon: <Phone size={18} /> },
  { id: 'training', icon: <BookOpen size={18} /> },
  { id: 'shift', icon: <Check size={18} /> },
  { id: 'weak', icon: <Target size={18} /> },
  { id: 'reports', icon: <ScrollText size={18} /> },
  { id: 'employees', icon: <Users size={18} /> },
  { id: 'supervisor', icon: <LayoutDashboard size={18} /> },
  { id: 'achievements', icon: <Trophy size={18} /> },
  { id: 'academy', icon: <BookOpenCheck size={18} /> },
  { id: 'questionnaire', icon: <FileText size={18} /> },
  { id: 'admin', icon: <SettingsIcon size={18} /> },
  { id: 'settings', icon: <SettingsIcon size={18} /> },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const { t, lang } = useI18n();
  const { view, setView, currentEmployee, data, lang: curLang, setLang, toggleSound } = useStoreShell();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [cmdOpen, setCmdOpen] = React.useState(false);
  const [soundOn, setSoundOn] = React.useState(data.settings.sound);

  React.useEffect(() => {
    setSoundOn(data.settings.sound);
  }, [data.settings.sound]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const stats = currentEmployee ? computeReadiness(data.assessments, data.questions, currentEmployee.id) : null;
  const level = currentEmployee ? levelFromXp(currentEmployee.xp, lang) : null;

  const navLabel = (id: View): string => {
    const map: Record<string, string> = {
      dashboard: t('nav.dashboard'), assessment: t('nav.assessment'), simulator: t('nav.simulator'),
      phone: t('nav.phone'), training: t('nav.training'), shift: t('nav.shift'), weak: t('nav.weak'),
      reports: t('nav.reports'), employees: t('nav.employees'), supervisor: t('nav.supervisor'),
      achievements: t('nav.achievements'), academy: t('nav.academy'), questionnaire: t('nav.questionnaire'),
      admin: t('nav.admin'), settings: t('nav.settings'),
    };
    return map[id] ?? id;
  };

  return (
    <>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      <header className="topbar">
        <button className="hamb" onClick={() => setMobileOpen(!mobileOpen)} aria-label="menu">
          <span /><span /><span />
        </button>
        <b className="logo">G</b>
        <div className="brand">
          <strong>THE GATE</strong>
          <small>HOTEL & APARTMENTS</small>
        </div>
        <span className="subtitle">{t('app.subtitle')}</span>
        <button className="head-search" onClick={() => setCmdOpen(true)}>
          <Search size={15} /> {t('nav.search')} <kbd>⌘K</kbd>
        </button>
        <div className="head-right">
          <span className={'ready ' + (stats && stats.overall >= 80 ? 'on' : '')}>
            <i /> {t('header.ready')} <b>{stats ? `${stats.overall}%` : '—'}</b>
          </span>
          <button className="icon-btn" onClick={() => { setLang(curLang === 'ar' ? 'en' : 'ar'); }} aria-label="language" title={t('settings.lang')}>
            <Languages size={17} /> {curLang === 'ar' ? 'EN' : 'ع'}
          </button>
          <button className="icon-btn" onClick={() => toggleSound(!soundOn)} aria-label="sound" title={t('settings.sound')}>
            {soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>
        </div>
      </header>

      <div className="shell">
        <aside className={mobileOpen ? 'sidebar open' : 'sidebar'}>
          <div className="profile">
            {currentEmployee ? (
              <>
                <span className="avatar" style={{ background: currentEmployee.color }}>{currentEmployee.name.charAt(0)}</span>
                <div>
                  <small>{lang === 'ar' ? currentEmployee.role : currentEmployee.roleEn}</small>
                  <b>{currentEmployee.name}</b>
                  <p>Lv {level?.level} · {lang === 'ar' ? level?.titleAr : level?.titleEn}</p>
                </div>
              </>
            ) : (
              <div>
                <small>{t('header.employee')}</small>
                <b>—</b>
                <p><i className="dot-warn" /> {t('emp.select')}</p>
              </div>
            )}
          </div>
          <nav className="side-nav">
            {NAV.map((n) => (
              <button
                key={n.id}
                className={view === n.id ? 'active' : ''}
                onClick={() => { setView(n.id); setMobileOpen(false); }}
              >
                {n.icon}
                <span>{navLabel(n.id)}</span>
              </button>
            ))}
          </nav>
          <blockquote>{t('app.tagline')}</blockquote>
          <div className="side-local"><span /> {t('footer.local')}</div>
        </aside>
        <main className={mobileOpen ? 'dim' : ''}>{children}</main>
      </div>
    </>
  );
}

function useStoreShell() {
  const store = useStore();
  const toggleSound = React.useCallback((on: boolean) => {
    store.updateSettings({ sound: on });
  }, [store]);
  return { ...store, toggleSound };
}
