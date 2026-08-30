export interface DailyChallengeDef {
  id: string;
  icon: string;
  titleAr: string;
  titleEn: string;
  target: 'simulator' | 'phone';
  scenarioId: string;
}

export const DAILY_CHALLENGES: DailyChallengeDef[] = [
  {
    id: 'ch-early',
    icon: '⏰',
    titleAr: 'ضيف يطلب دخولاً مبكراً (Early Check-in). أكمل السيناريو بدون خطأ حاسم.',
    titleEn: 'A guest requests early check-in. Complete the scenario with no critical failure.',
    target: 'simulator',
    scenarioId: 'business-guest',
  },
  {
    id: 'ch-full',
    icon: '🈵',
    titleAr: 'مكالمة حجز والفندق مكتمل. تعامل معها باحترافية وقدّم بديلاً.',
    titleEn: 'A reservation call when fully booked. Handle it professionally and offer an alternative.',
    target: 'phone',
    scenarioId: 'fully-booked',
  },
  {
    id: 'ch-complaint',
    icon: '😤',
    titleAr: 'ضيف غاضب من تأخير الخدمة. هدّئه وقدّم حلاً وتعويضاً.',
    titleEn: 'A guest angry about a service delay. Calm them and offer a solution.',
    target: 'simulator',
    scenarioId: 'angry-guest',
  },
  {
    id: 'ch-vip',
    icon: '👑',
    titleAr: 'ضيف VIP وصل مبكراً. أظهر ضيافة استباقية واقترح ترقية.',
    titleEn: 'A VIP guest arrived early. Show proactive hospitality and offer an upgrade.',
    target: 'simulator',
    scenarioId: 'vip-guest',
  },
  {
    id: 'ch-phone-en',
    icon: '🌍',
    titleAr: 'متصل يتحدث الإنجليزية. رد بالتحية الكاملة وباللغة نفسها.',
    titleEn: 'An English-speaking caller. Reply with a full greeting in the same language.',
    target: 'phone',
    scenarioId: 'english-call',
  },
  {
    id: 'ch-phone-complaint',
    icon: '📞',
    titleAr: 'شكوى ضجيج عبر الهاتف. استمع واعتذر وتابع الحل.',
    titleEn: 'A noise complaint over the phone. Listen, apologize and follow up.',
    target: 'phone',
    scenarioId: 'complaint',
  },
];

export function todayChallenge(): DailyChallengeDef {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const dayIndex = Math.floor(start.getTime() / 86400000);
  return DAILY_CHALLENGES[Math.abs(dayIndex) % DAILY_CHALLENGES.length];
}
