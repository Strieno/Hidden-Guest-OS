import * as React from 'react';
import type { Answer, AppData, AssessmentResult, Employee, PhoneSession, Question, SimSession, View } from '../lib/types';
import { defaultData, exportData, loadData, parseImport, saveData, todayStr, uid_ } from '../lib/storage';
import { computeStreak, levelFromXp, nextStreak, scoreOf } from '../lib/engine';
import { ACHIEVEMENTS, type AchievementDef } from '../data/achievements';
import { dict, type TKey } from '../lib/i18n';
import { sfx, setSoundEnabled } from '../lib/sound';
import { SHIFT_ITEMS } from '../data/shift';
import type { Lang } from '../lib/types';

export interface UnlockResult {
  unlocked: AchievementDef[];
  xp: number;
  score: number;
}

export type AssessmentMode = 'full' | 'random' | 'category';
export interface AssessmentConfig { mode: AssessmentMode; category?: string; questionIds?: string[]; label?: string }

interface Store {
  data: AppData;
  view: View;
  setView: (v: View) => void;
  lang: Lang;
  dir: 'rtl' | 'ltr';
  setLang: (l: Lang) => void;
  t: (key: TKey, vars?: Record<string, string | number>) => string;
  currentEmployee: Employee | null;
  assessmentConfig: AssessmentConfig | null;
  startAssessment: (cfg: AssessmentConfig) => void;
  startRandomAssessment: () => void;
  clearAssessment: () => void;
  selectEmployee: (id: string) => void;
  addEmployee: (name: string, role: string, roleEn: string, notes?: string) => void;
  updateEmployee: (id: string, patch: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  updateSettings: (patch: Partial<AppData['settings']>) => void;
  submitAssessment: (input: { answers: Record<string, Answer>; questionIds: string[]; notes?: string; timeSpent: number; mode: string }) => UnlockResult;
  recordTraining: (questionId: string, correct: boolean) => void;
  recordPhoneSession: (session: Omit<PhoneSession, 'id' | 'employeeId' | 'date'>) => UnlockResult;
  recordSimSession: (session: Omit<SimSession, 'id' | 'employeeId' | 'date'>) => UnlockResult;
  toggleShiftItem: (id: string) => void;
  completeDaily: (challengeId: string) => void;
  dailyDoneToday: boolean;
  pendingDaily: string | null;
  startDailyChallenge: (id: string, target: View) => void;
  clearPendingDaily: () => void;
  shiftDoneToday: string[];
  updateQuestions: (qs: Question[]) => void;
  resetQuestions: () => void;
  exportJson: () => string;
  importJson: (text: string) => boolean;
  resetAll: () => void;
  toast: (msg: string) => void;
  toastMsg: string;
  unlocks: AchievementDef[];
  dismissUnlock: () => void;
}

const Ctx = React.createContext<Store | null>(null);

function tr(key: TKey, lang: Lang, vars?: Record<string, string | number>): string {
  const entry = dict[key];
  if (!entry) return String(key);
  let s: string = entry[lang];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = React.useState<AppData>(() => loadData());
  const [view, setView] = React.useState<View>('dashboard');
  const [toastMsg, setToastMsg] = React.useState('');
  const [unlocks, setUnlocks] = React.useState<AchievementDef[]>([]);
  const [assessmentConfig, setAssessmentConfig] = React.useState<AssessmentConfig | null>(null);
  const [pendingDaily, setPendingDaily] = React.useState<string | null>(null);

  const startDailyChallenge = React.useCallback((id: string, target: View) => {
    setPendingDaily(id);
    setView(target);
  }, []);

  const clearPendingDaily = React.useCallback(() => setPendingDaily(null), []);

  const startAssessment = React.useCallback((cfg: AssessmentConfig) => {
    setAssessmentConfig(cfg);
    setView('assessment');
  }, []);

  const startRandomAssessment = React.useCallback(() => {
    setAssessmentConfig({ mode: 'random' });
    setView('assessment');
  }, []);

  const clearAssessment = React.useCallback(() => setAssessmentConfig(null), []);

  const lang = data.settings.lang;
  const dir: 'rtl' | 'ltr' = lang === 'ar' ? 'rtl' : 'ltr';
  const t = React.useCallback((key: TKey, vars?: Record<string, string | number>) => tr(key, lang, vars), [lang]);

  React.useEffect(() => {
    saveData(data);
  }, [data]);

  React.useEffect(() => {
    setSoundEnabled(data.settings.sound);
  }, [data.settings.sound]);

  const toast = React.useCallback((msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(''), 2200);
  }, []);

  const dismissUnlock = React.useCallback(() => setUnlocks((u) => u.slice(1)), []);

  const pushUnlocks = React.useCallback((list: AchievementDef[]) => {
    if (list.length) {
      sfx.achievement();
      setUnlocks((u) => [...u, ...list]);
    }
  }, []);

  const setLang = React.useCallback((l: Lang) => {
    setData((prev) => ({ ...prev, settings: { ...prev.settings, lang: l } }));
  }, []);

  const currentEmployee = React.useMemo<Employee | null>(() => {
    const id = data.settings.employeeId;
    return data.employees.find((e) => e.id === id) ?? null;
  }, [data]);

  /** Pure: returns newly unlocked achievements plus the updated data (with xp + grants applied). */
  const evaluateAchievements = React.useCallback((d: AppData, empId: string): { unlocks: AchievementDef[]; data: AppData } => {
    const emp = d.employees.find((e) => e.id === empId);
    if (!emp) return { unlocks: [], data: d };
    const mine = d.assessments.filter((a) => a.employeeId === empId);
    const phones = d.phoneSessions.filter((a) => a.employeeId === empId);
    const sims = d.simSessions.filter((a) => a.employeeId === empId);
    const shiftLogs = d.shiftLogs.filter((a) => a.employeeId === empId);
    const daily = d.dailyLogs.filter((a) => a.employeeId === empId);
    const existingIds = new Set((d.achievements[empId] ?? []).map((u) => u.id));
    const grants: string[] = [];
    const grant = (id: string) => { if (!existingIds.has(id) && !grants.includes(id)) grants.push(id); };

    if (mine.length >= 1) grant('first-exam');
    if (phones.length >= 5) grant('phone-master');
    if (mine.some((a) => a.categoryScores['الوصول'] === 100)) grant('checkin-perfect');
    const complaints =
      phones.filter((p) => ['complaint', 'fully-booked'].includes(p.scenarioId)).length +
      sims.filter((s) => ['angry-guest', 'impatient-guest'].includes(s.scenarioId)).length;
    if (complaints >= 3) grant('complaint-resolver');
    if (mine.some((a) => a.categoryScores['المرافق'] === 100)) grant('facilities-expert');
    if (emp.streak >= 7) grant('streak-7');
    if (mine.some((a) => a.criticalFailures === 0)) grant('zero-critical');
    if (shiftLogs.some((s) => s.done.length === SHIFT_ITEMS.length)) grant('perfect-shift');
    if (mine.some((a) => a.score === 100)) grant('score-100');
    if (sims.length >= 5) grant('sim-master');
    if (daily.length >= 3) grant('daily-3');
    if (levelFromXp(emp.xp, 'ar').level >= 5) grant('guest-master');

    if (!grants.length) return { unlocks: [], data: d };
    const defs = ACHIEVEMENTS.filter((a) => grants.includes(a.id));
    const totalXp = defs.reduce((s, a) => s + a.xp, 0);
    return {
      unlocks: defs,
      data: {
        ...d,
        employees: d.employees.map((e) => (e.id === empId ? { ...e, xp: e.xp + totalXp } : e)),
        achievements: { ...d.achievements, [empId]: [...(d.achievements[empId] ?? []), ...defs.map((a) => ({ id: a.id, date: Date.now() }))] },
      },
    };
  }, []);

  /** Apply an activity synchronously: run fn on current data, evaluate achievements, commit, return result. */
  const commit = React.useCallback((fn: (d: AppData) => AppData): UnlockResult => {
    const result: UnlockResult = { unlocked: [], xp: 0, score: 0 };
    const empId = data.settings.employeeId;
    if (!empId) return result;
    const after = fn(data);
    const { unlocks: defs, data: final } = evaluateAchievements(after, empId);
    result.unlocked = defs;
    if (defs.length) result.xp = defs.reduce((s, a) => s + a.xp, 0);
    setData(final);
    if (defs.length) pushUnlocks(defs);
    return result;
  }, [data, evaluateAchievements, pushUnlocks]);

  const selectEmployee = React.useCallback((id: string) => {
    setData((prev) => ({ ...prev, settings: { ...prev.settings, employeeId: id } }));
    setView('dashboard');
  }, []);

  const addEmployee = React.useCallback((name: string, role: string, roleEn: string, notes?: string) => {
    const colors = ['#c8a45d', '#4e8fb5', '#7a9e6e', '#b56a6a', '#8a7ab5', '#b58a4e'];
    const emp: Employee = {
      id: uid_('emp'),
      name: name.trim() || 'موظف',
      role: role.trim() || 'موظف استقبال',
      roleEn: roleEn.trim() || 'Front Desk Agent',
      color: colors[Math.floor(Math.random() * colors.length)],
      createdAt: Date.now(),
      xp: 0,
      streak: 0,
      lastActive: 0,
      notes: notes ?? '',
    };
    setData((prev) => ({ ...prev, employees: [...prev.employees, emp], settings: { ...prev.settings, employeeId: emp.id } }));
    sfx.click();
  }, []);

  const updateEmployee = React.useCallback((id: string, patch: Partial<Employee>) => {
    setData((prev) => ({ ...prev, employees: prev.employees.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
  }, []);

  const updateSettings = React.useCallback((patch: Partial<AppData['settings']>) => {
    setData((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
    if (patch.sound !== undefined) setSoundEnabled(patch.sound);
  }, []);

  const deleteEmployee = React.useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      employees: prev.employees.filter((e) => e.id !== id),
      settings: { ...prev.settings, employeeId: prev.settings.employeeId === id ? null : prev.settings.employeeId },
      assessments: prev.assessments.filter((a) => a.employeeId !== id),
      phoneSessions: prev.phoneSessions.filter((a) => a.employeeId !== id),
      simSessions: prev.simSessions.filter((a) => a.employeeId !== id),
      trainingLog: prev.trainingLog.filter((a) => a.employeeId !== id),
      shiftLogs: prev.shiftLogs.filter((a) => a.employeeId !== id),
      dailyLogs: prev.dailyLogs.filter((a) => a.employeeId !== id),
    }));
  }, []);

  const submitAssessment = React.useCallback((input: { answers: Record<string, Answer>; questionIds: string[]; notes?: string; timeSpent: number; mode: string }): UnlockResult => {
    const qs = data.questions;
    const { score, criticalFailures } = scoreOf(input.answers, qs);
    const baseXp = 10 + Math.round(score / 5);
    const result = commit((prev) => {
      const empId = prev.settings.employeeId!;
      const rec: AssessmentResult = {
        id: uid_('a'),
        employeeId: empId,
        date: Date.now(),
        score,
        answers: input.answers,
        questionIds: input.questionIds,
        categoryScores: computeCatScoresLocal(input.answers, qs),
        criticalFailures,
        timeSpent: input.timeSpent,
        notes: input.notes,
        mode: input.mode,
      };
      return {
        ...prev,
        assessments: [...prev.assessments, rec],
        employees: prev.employees.map((e) => (e.id === empId ? { ...touchEmp(e), xp: e.xp + baseXp } : e)),
        lastActiveDate: todayStr(),
      };
    });
    result.score = score;
    result.xp = baseXp + result.xp;
    sfx.complete();
    return result;
  }, [data, commit]);

  const recordTraining = React.useCallback((questionId: string, correct: boolean) => {
    setData((prev) => {
      const empId = prev.settings.employeeId;
      if (!empId) return prev;
      let next: AppData = {
        ...prev,
        trainingLog: [...prev.trainingLog, { id: uid_('t'), employeeId: empId, date: Date.now(), questionId, type: 'card', correct }],
        employees: prev.employees.map((e) => (e.id === empId ? touchEmp(e) : e)),
        lastActiveDate: todayStr(),
      };
      if (correct) next = { ...next, employees: next.employees.map((e) => (e.id === empId ? { ...e, xp: e.xp + 2 } : e)) };
      return next;
    });
    window.setTimeout(() => { if (correct) sfx.correct(); else sfx.click(); }, 0);
  }, []);

  const recordPhoneSession = React.useCallback((session: Omit<PhoneSession, 'id' | 'employeeId' | 'date'>): UnlockResult => {
    const baseXp = Math.max(2, Math.round(session.score / 10));
    const result = commit((prev) => {
      const empId = prev.settings.employeeId!;
      return {
        ...prev,
        phoneSessions: [...prev.phoneSessions, { ...session, id: uid_('p'), employeeId: empId, date: Date.now() }],
        employees: prev.employees.map((e) => (e.id === empId ? { ...touchEmp(e), xp: e.xp + baseXp } : e)),
        lastActiveDate: todayStr(),
      };
    });
    result.xp = baseXp + result.xp;
    result.score = session.score;
    return result;
  }, [data, commit]);

  const recordSimSession = React.useCallback((session: Omit<SimSession, 'id' | 'employeeId' | 'date'>): UnlockResult => {
    const baseXp = Math.max(2, Math.round(session.score / 10));
    const result = commit((prev) => {
      const empId = prev.settings.employeeId!;
      return {
        ...prev,
        simSessions: [...prev.simSessions, { ...session, id: uid_('s'), employeeId: empId, date: Date.now() }],
        employees: prev.employees.map((e) => (e.id === empId ? { ...touchEmp(e), xp: e.xp + baseXp } : e)),
        lastActiveDate: todayStr(),
      };
    });
    result.xp = baseXp + result.xp;
    result.score = session.score;
    return result;
  }, [data, commit]);

  const toggleShiftItem = React.useCallback((id: string) => {
    const unlocksRef: { defs: AchievementDef[] } = { defs: [] };
    setData((prev) => {
      const empId = prev.settings.employeeId;
      if (!empId) return prev;
      const day = todayStr();
      const current = prev.shiftLogs.find((s) => s.date === day && s.employeeId === empId);
      const done = current ? [...current.done] : [];
      const nextDone = done.includes(id) ? done.filter((x) => x !== id) : [...done, id];
      let next: AppData = {
        ...prev,
        shiftLogs: [...prev.shiftLogs.filter((s) => !(s.date === day && s.employeeId === empId)), { date: day, employeeId: empId, done: nextDone }],
        employees: prev.employees.map((e) => (e.id === empId ? touchEmp(e) : e)),
        lastActiveDate: todayStr(),
      };
      if (nextDone.length === SHIFT_ITEMS.length) {
        const { unlocks: defs, data: final } = evaluateAchievements(next, empId);
        next = final;
        unlocksRef.defs = defs;
      }
      return next;
    });
    window.setTimeout(() => {
      sfx.click();
      if (unlocksRef.defs.length) pushUnlocks(unlocksRef.defs);
    }, 0);
  }, [evaluateAchievements, pushUnlocks]);

  const completeDaily = React.useCallback((challengeId: string) => {
    setData((prev) => {
      const empId = prev.settings.employeeId;
      if (!empId) return prev;
      const day = todayStr();
      if (prev.dailyLogs.some((l) => l.employeeId === empId && l.date === day)) return prev;
      return {
        ...prev,
        dailyLogs: [...prev.dailyLogs, { date: day, employeeId: empId, challengeId, xp: 25 }],
        employees: prev.employees.map((e) => (e.id === empId ? { ...touchEmp(e), xp: e.xp + 25 } : e)),
        lastActiveDate: todayStr(),
      };
    });
    sfx.achievement();
  }, []);

  const updateQuestions = React.useCallback((qs: Question[]) => {
    setData((prev) => ({ ...prev, questions: qs }));
  }, []);

  const resetQuestions = React.useCallback(() => {
    setData((prev) => ({ ...prev, questions: defaultData().questions }));
    toast(t('admin.reset'));
  }, [toast, t]);

  const exportJson = React.useCallback(() => exportData(), []);

  const importJson = React.useCallback((text: string): boolean => {
    const d = parseImport(text);
    if (!d) return false;
    setData(d);
    return true;
  }, []);

  const resetAll = React.useCallback(() => {
    setData(defaultData());
  }, []);

  const shiftDoneToday = React.useMemo(() => {
    const empId = data.settings.employeeId;
    if (!empId) return [];
    return data.shiftLogs.find((s) => s.employeeId === empId && s.date === todayStr())?.done ?? [];
  }, [data]);

  const dailyDoneToday = React.useMemo(() => {
    const empId = data.settings.employeeId;
    if (!empId) return false;
    return data.dailyLogs.some((l) => l.employeeId === empId && l.date === todayStr());
  }, [data]);

  const store: Store = {
    data, view, setView, lang, dir, setLang, t, currentEmployee,
    assessmentConfig, startAssessment, startRandomAssessment, clearAssessment,
    selectEmployee, addEmployee, updateEmployee, deleteEmployee, updateSettings,
    submitAssessment, recordTraining, recordPhoneSession, recordSimSession,
    toggleShiftItem, completeDaily, dailyDoneToday, pendingDaily, startDailyChallenge, clearPendingDaily, shiftDoneToday,
    updateQuestions, resetQuestions, exportJson, importJson, resetAll,
    toast, toastMsg, unlocks, dismissUnlock,
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

function touchEmp(e: Employee): Employee {
  return { ...e, streak: nextStreak(e), lastActive: Date.now() };
}

export function useStore(): Store {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used within AppProvider');
  return ctx;
}

export { computeStreak };

function computeCatScoresLocal(answers: Record<string, Answer>, questions: Question[]): Record<string, number> {
  const byCat: Record<string, { total: number; got: number }> = {};
  for (const q of questions) {
    const a = answers[q.id];
    if (!a || a === 'na') continue;
    const cat = q.category;
    if (!byCat[cat]) byCat[cat] = { total: 0, got: 0 };
    byCat[cat].total += q.weight;
    if (a === 'yes') byCat[cat].got += q.weight;
  }
  const out: Record<string, number> = {};
  for (const [cat, v] of Object.entries(byCat)) out[cat] = v.total ? Math.round((v.got / v.total) * 100) : 0;
  return out;
}
