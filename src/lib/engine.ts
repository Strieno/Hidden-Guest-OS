import type { Answer, AssessmentResult, CategoryScores, Employee, PriorityItem, Question, ReadinessStats } from './types';
import { todayStr } from './storage';

export const CATEGORY_ORDER = [
  'الهاتف', 'الوصول', 'الغرفة', 'المرافق', 'اللغة', 'السلوك', 'الإقامة', 'المغادرة', 'الفريق',
];

export const CATEGORY_EN: Record<string, string> = {
  'الهاتف': 'Telephone',
  'الوصول': 'Check-in',
  'الغرفة': 'Room',
  'المرافق': 'Facilities',
  'اللغة': 'Language',
  'السلوك': 'Behavior',
  'الإقامة': 'Stay',
  'المغادرة': 'Check-out',
  'الفريق': 'Team',
  'تأملات': 'Reflections',
};

export function categoryEn(cat: string): string {
  return CATEGORY_EN[cat] ?? cat;
}

export function categoryOf(q: Question): string {
  return q.category || 'عام';
}

/** Weighted category scores for one assessment */
export function computeCategoryScores(answers: Record<string, Answer>, questions: Question[]): CategoryScores {
  const byCat: Record<string, { total: number; got: number }> = {};
  for (const q of questions) {
    const a = answers[q.id];
    if (!a || a === 'na') continue;
    const cat = categoryOf(q);
    if (!byCat[cat]) byCat[cat] = { total: 0, got: 0 };
    byCat[cat].total += q.weight;
    if (a === 'yes') byCat[cat].got += q.weight;
  }
  const out: CategoryScores = {};
  for (const [cat, v] of Object.entries(byCat)) {
    out[cat] = v.total ? Math.round((v.got / v.total) * 100) : 0;
  }
  return out;
}

export function scoreOf(answers: Record<string, Answer>, questions: Question[]): { score: number; criticalFailures: number } {
  let max = 0;
  let got = 0;
  let critical = 0;
  for (const q of questions) {
    const a = answers[q.id];
    if (!a || a === 'na') continue;
    max += q.weight;
    if (a === 'yes') got += q.weight;
    if (a === 'no' && q.critical) critical++;
  }
  const raw = max ? (got / max) * 100 : 0;
  const score = Math.max(0, Math.round(raw - critical * 5));
  return { score, criticalFailures: critical };
}

/** Aggregate readiness statistics from assessment history for one employee */
export function computeReadiness(assessments: AssessmentResult[], questions: Question[], employeeId: string): ReadinessStats {
  const mine = assessments
    .filter((a) => a.employeeId === employeeId)
    .sort((a, b) => a.date - b.date);

  const count = mine.length;
  const last = mine[count - 1] ?? null;
  const prev = mine[count - 2] ?? null;

  const overall = last ? last.score : 0;
  const best = mine.reduce((m, a) => Math.max(m, a.score), 0);
  const previous = prev ? prev.score : 0;
  const improvement = prev ? last.score - prev.score : 0;
  const criticalFailures = mine.reduce((s, a) => s + a.criticalFailures, 0);

  const now = Date.now();
  const dayMs = 86400000;
  const last7 = mine.filter((a) => now - a.date <= 7 * dayMs);
  const last30 = mine.filter((a) => now - a.date <= 30 * dayMs);
  const avg7 = last7.length ? Math.round(last7.reduce((s, a) => s + a.score, 0) / last7.length) : 0;
  const avg30 = last30.length ? Math.round(last30.reduce((s, a) => s + a.score, 0) / last30.length) : 0;

  // 30-day trend (daily best score per day)
  const trend: number[] = [];
  for (let d = 29; d >= 0; d--) {
    const dayStart = now - d * dayMs;
    const dayEnd = dayStart + dayMs;
    const dayScores = mine.filter((a) => a.date >= dayStart && a.date < dayEnd).map((a) => a.score);
    trend.push(dayScores.length ? Math.round(dayScores.reduce((s, x) => s + x, 0) / dayScores.length) : 0);
  }

  // weighted category scores across last 30 days
  const catAgg: Record<string, { total: number; got: number }> = {};
  for (const a of last30.length ? last30 : mine) {
    for (const q of questions) {
      const ans = a.answers[q.id];
      if (!ans || ans === 'na') continue;
      const cat = categoryOf(q);
      if (!catAgg[cat]) catAgg[cat] = { total: 0, got: 0 };
      catAgg[cat].total += q.weight;
      if (ans === 'yes') catAgg[cat].got += q.weight;
    }
  }
  const categoryScores: CategoryScores = {};
  for (const [cat, v] of Object.entries(catAgg)) {
    categoryScores[cat] = v.total ? Math.round((v.got / v.total) * 100) : 0;
  }

  return {
    overall,
    answered: count,
    total: questions.length,
    best,
    previous,
    improvement,
    criticalFailures,
    avg7,
    avg30,
    trend,
    categoryScores,
    lastDate: last ? last.date : null,
    count,
  };
}

/** Analyze weak standards with priority levels */
export function analyzeWeak(assessments: AssessmentResult[], questions: Question[], employeeId: string): PriorityItem[] {
  const mine = assessments.filter((a) => a.employeeId === employeeId);
  const attempts: Record<string, number> = {};
  const failures: Record<string, number> = {};
  const recentFailures: Record<string, number> = {};

  const recentWindow = Date.now() - 7 * 86400000;
  for (const a of mine) {
    for (const q of questions) {
      const ans = a.answers[q.id];
      if (!ans || ans === 'na') continue;
      attempts[q.id] = (attempts[q.id] ?? 0) + 1;
      if (ans === 'no') {
        failures[q.id] = (failures[q.id] ?? 0) + 1;
        if (a.date >= recentWindow) recentFailures[q.id] = (recentFailures[q.id] ?? 0) + 1;
      }
    }
  }

  const items: PriorityItem[] = [];
  for (const q of questions) {
    const at = attempts[q.id] ?? 0;
    const fl = failures[q.id] ?? 0;
    if (fl === 0) continue;
    const accuracy = at ? Math.round(((at - fl) / at) * 100) : 0;

    // priority: failures + critical + weight + recent trend
    let score = fl * 2 + (q.critical ? 4 : 0) + (q.weight >= 10 ? 2 : 0);
    if (recentFailures[q.id] && recentFailures[q.id] >= fl / 2) score += 2;
    const improved = recentFailures[q.id] === 0 && fl > 0;
    const priority: PriorityItem['priority'] = score >= 8 ? 'CRITICAL' : score >= 6 ? 'HIGH' : score >= 4 ? 'MEDIUM' : 'LOW';
    const recommendedMinutes = Math.min(15, Math.max(2, score * 2));

    items.push({ question: q, failures: fl, attempts: at, accuracy, category: categoryOf(q), priority, recommendedMinutes, improved });
  }

  return items.sort((a, b) => {
    const rank = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 } as const;
    if (rank[a.priority] !== rank[b.priority]) return rank[a.priority] - rank[b.priority];
    return b.failures - a.failures;
  });
}

/** Adaptive training queue: weak questions first, mastered questions less frequent */
export function trainingQueue(weak: PriorityItem[], all: Question[]): Question[] {
  const weakIds = new Set(weak.map((w) => w.question.id));
  const weakQ = weak.map((w) => w.question);
  // mastered = asked at least once with no failures — deprioritized
  const rest = all.filter((q) => !weakIds.has(q.id));
  // interleave: 2 weak for every 1 rest
  const out: Question[] = [];
  let ri = 0;
  let wi = 0;
  let toggle = true;
  while (wi < weakQ.length || ri < rest.length) {
    if (toggle && wi < weakQ.length) {
      out.push(weakQ[wi]);
      wi++;
      if (wi % 2 === 0) toggle = !toggle;
    } else if (!toggle && ri < rest.length) {
      out.push(rest[ri]);
      ri++;
      toggle = !toggle;
    } else {
      if (wi < weakQ.length) { out.push(weakQ[wi]); wi++; }
      else if (ri < rest.length) { out.push(rest[ri]); ri++; }
      else break;
    }
  }
  return out;
}

/* ---- XP & Levels ---- */

export const LEVELS = [
  { level: 1, xp: 0, titleAr: 'متدرب', titleEn: 'Trainee' },
  { level: 2, xp: 120, titleAr: 'موظف استقبال', titleEn: 'Front Desk Agent' },
  { level: 3, xp: 320, titleAr: 'أخصائي ضيافة', titleEn: 'Guest Specialist' },
  { level: 4, xp: 720, titleAr: 'خبير خدمة', titleEn: 'Service Expert' },
  { level: 5, xp: 1500, titleAr: 'سيد الضيف الغامض', titleEn: 'Mystery Guest Master' },
] as const;

export interface LevelInfo { level: number; titleAr: string; titleEn: string; xp: number; nextXp: number | null; progress: number; }

export function levelFromXp(xp: number, _lang: 'ar' | 'en' = 'ar'): LevelInfo {
  let current: (typeof LEVELS)[number] = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.xp) current = l;
  const next = LEVELS.find((l) => l.xp > current.xp) ?? null;
  const progress = next ? Math.min(100, Math.round(((xp - current.xp) / (next.xp - current.xp)) * 100)) : 100;
  return {
    level: current.level,
    titleAr: current.titleAr,
    titleEn: current.titleEn,
    xp,
    nextXp: next ? next.xp : null,
    progress,
  };
}

export function titleForLevel(lang: 'ar' | 'en', lv: number): string {
  const l = LEVELS.find((x) => x.level === lv) ?? LEVELS[LEVELS.length - 1];
  return lang === 'ar' ? l.titleAr : l.titleEn;
}

/* ---- Streak ---- */

export function computeStreak(employee: Employee | null): number {
  if (!employee) return 0;
  const today = todayStr();
  if (employee.lastActive === 0) return employee.streak;
  const last = new Date(employee.lastActive);
  const now = new Date();
  const diffDays = Math.floor((now.setHours(0, 0, 0, 0) - last.setHours(0, 0, 0, 0)) / 86400000);
  if (diffDays <= 1 && employee.streak > 0) return employee.streak;
  if (today === todayStr(last)) return employee.streak;
  return 0;
}

export function nextStreak(employee: Employee): number {
  const today = todayStr();
  if (employee.lastActive === 0) return 1;
  const lastDay = todayStr(new Date(employee.lastActive));
  if (lastDay === today) return Math.max(1, employee.streak);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (lastDay === todayStr(yesterday)) return employee.streak + 1;
  return 1;
}

/* ---- misc ---- */

export function avgAnswerTime(assessments: AssessmentResult[], employeeId: string): number {
  const mine = assessments.filter((a) => a.employeeId === employeeId && a.timeSpent > 0 && a.questionIds.length > 0);
  if (!mine.length) return 0;
  const total = mine.reduce((s, a) => s + a.timeSpent, 0);
  const questions = mine.reduce((s, a) => s + a.questionIds.length, 0);
  return questions ? Math.round(total / questions) : 0;
}

export function fmtDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}ث`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s ? `${m}:${String(s).padStart(2, '0')}` : `${m}د`;
}

export function fmtDate(ts: number, lang: 'ar' | 'en'): string {
  return new Date(ts).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-GB', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}
