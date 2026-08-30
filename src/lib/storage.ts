import type { AppData, Question } from './types';
import defaultQuestions from '../../lib/questions.json';

const KEY = 'gate-os-v1';

export function todayStr(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function uid(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function normalizeQuestions(raw: unknown): Question[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((q): q is Record<string, unknown> => !!q && typeof q === 'object')
    .map((q) => ({
      id: String(q.id ?? uid('Q')),
      category: String(q.category ?? 'عام'),
      categoryEn: String(q.categoryEn ?? 'General'),
      ar: String(q.ar ?? ''),
      en: String(q.en ?? q.ar ?? ''),
      weight: Number(q.weight ?? 5) || 5,
      critical: Boolean(q.critical),
      standard: String(q.standard ?? ''),
      standardEn: String(q.standardEn ?? q.standard ?? ''),
      best: String(q.best ?? ''),
      bestEn: String(q.bestEn ?? q.best ?? ''),
      explanation: String(q.explanation ?? ''),
      explanationEn: String(q.explanationEn ?? q.explanation ?? ''),
      source: q.source ? String(q.source) : undefined,
    }))
    .filter((q) => q.ar.trim() !== '');
}

export function defaultQuestionsNormalized(): Question[] {
  return normalizeQuestions(defaultQuestions);
}

export function defaultData(): AppData {
  return {
    version: 1,
    employees: [],
    assessments: [],
    trainingLog: [],
    phoneSessions: [],
    simSessions: [],
    shiftLogs: [],
    dailyLogs: [],
    achievements: {},
    questions: defaultQuestionsNormalized(),
    settings: { lang: 'ar', sound: true, employeeId: null },
    lastActiveDate: '',
  };
}

function isValidData(d: unknown): d is AppData {
  if (!d || typeof d !== 'object') return false;
  const o = d as Record<string, unknown>;
  return typeof o.version === 'number' && Array.isArray(o.questions);
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultData();
    const parsed = JSON.parse(raw);
    if (!isValidData(parsed)) return defaultData();
    const base = defaultData();
    return {
      ...base,
      ...parsed,
      questions: normalizeQuestions(parsed.questions),
      settings: { ...base.settings, ...(parsed.settings ?? {}) },
      achievements: parsed.achievements ?? {},
      employees: Array.isArray(parsed.employees) ? parsed.employees : [],
      assessments: Array.isArray(parsed.assessments) ? parsed.assessments : [],
      trainingLog: Array.isArray(parsed.trainingLog) ? parsed.trainingLog : [],
      phoneSessions: Array.isArray(parsed.phoneSessions) ? parsed.phoneSessions : [],
      simSessions: Array.isArray(parsed.simSessions) ? parsed.simSessions : [],
      shiftLogs: Array.isArray(parsed.shiftLogs) ? parsed.shiftLogs : [],
      dailyLogs: Array.isArray(parsed.dailyLogs) ? parsed.dailyLogs : [],
    };
  } catch {
    return defaultData();
  }
}

export function saveData(d: AppData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {
    // storage may be unavailable or full — fail silently
  }
}

export function exportData(): string {
  const d = loadData();
  return JSON.stringify({ app: 'gate-os', exportedAt: new Date().toISOString(), data: d }, null, 2);
}

export function parseImport(text: string): AppData | null {
  try {
    const parsed = JSON.parse(text);
    const data = parsed && typeof parsed === 'object' && 'data' in parsed ? (parsed as { data: unknown }).data : parsed;
    if (!isValidData(data)) return null;
    return {
      ...defaultData(),
      ...(data as AppData),
      questions: normalizeQuestions((data as AppData).questions),
      settings: { ...defaultData().settings, ...(data as AppData).settings },
    };
  } catch {
    return null;
  }
}

export function uid_(prefix = 'id'): string {
  return uid(prefix);
}
