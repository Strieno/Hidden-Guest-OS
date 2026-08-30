export type Lang = 'ar' | 'en';
export type Answer = 'yes' | 'no' | 'na';

export type View =
  | 'dashboard'
  | 'assessment'
  | 'simulator'
  | 'training'
  | 'phone'
  | 'shift'
  | 'weak'
  | 'reports'
  | 'employees'
  | 'supervisor'
  | 'achievements'
  | 'academy'
  | 'admin'
  | 'settings'
  | 'questionnaire';

export interface Question {
  id: string;
  category: string;
  categoryEn: string;
  ar: string;
  en: string;
  weight: number;
  critical: boolean;
  standard: string;
  standardEn: string;
  best: string;
  bestEn: string;
  explanation: string;
  explanationEn: string;
  source?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  roleEn: string;
  color: string;
  createdAt: number;
  xp: number;
  streak: number;
  lastActive: number;
  notes: string;
}

export type CategoryScores = Record<string, number>;

export interface AssessmentResult {
  id: string;
  employeeId: string;
  date: number;
  score: number;
  answers: Record<string, Answer>;
  questionIds: string[];
  categoryScores: CategoryScores;
  criticalFailures: number;
  timeSpent: number;
  notes?: string;
  mode: string;
}

export interface TrainingLog {
  id: string;
  employeeId: string;
  date: number;
  questionId: string;
  type: string;
  correct: boolean;
}

export interface PhoneSession {
  id: string;
  employeeId: string;
  date: number;
  scenarioId: string;
  score: number;
  categories: Record<string, number>;
  criticalMistakes: number;
  passed: boolean;
}

export interface SimSession {
  id: string;
  employeeId: string;
  date: number;
  scenarioId: string;
  score: number;
  satisfaction: number;
  accuracy: number;
  communication: number;
  compliance: number;
  categories: Record<string, number>;
  criticalMistakes: number;
  passed: boolean;
}

export interface ShiftLog {
  date: string;
  employeeId: string;
  done: string[];
}

export interface DailyLog {
  date: string;
  employeeId: string;
  challengeId: string;
  xp: number;
}

export interface AchievementUnlock {
  id: string;
  date: number;
}

export interface Settings {
  lang: Lang;
  sound: boolean;
  employeeId: string | null;
}

export interface AppData {
  version: number;
  employees: Employee[];
  assessments: AssessmentResult[];
  trainingLog: TrainingLog[];
  phoneSessions: PhoneSession[];
  simSessions: SimSession[];
  shiftLogs: ShiftLog[];
  dailyLogs: DailyLog[];
  achievements: Record<string, AchievementUnlock[]>;
  questions: Question[];
  settings: Settings;
  lastActiveDate: string;
}

export interface PriorityItem {
  question: Question;
  failures: number;
  attempts: number;
  accuracy: number;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendedMinutes: number;
  improved: boolean;
}

export interface ReadinessStats {
  overall: number;
  answered: number;
  total: number;
  best: number;
  previous: number;
  improvement: number;
  criticalFailures: number;
  avg7: number;
  avg30: number;
  trend: number[];
  categoryScores: CategoryScores;
  lastDate: number | null;
  count: number;
}
