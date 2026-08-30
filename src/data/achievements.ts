export interface AchievementDef {
  id: string;
  icon: string;
  ar: string;
  en: string;
  descAr: string;
  descEn: string;
  xp: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-exam', icon: '📋', ar: 'الانطلاقة', en: 'First Step', descAr: 'أكمل أول اختبار ضيف غامض', descEn: 'Complete your first mystery guest exam', xp: 20 },
  { id: 'phone-master', icon: '📞', ar: 'سيد الهاتف', en: 'Phone Master', descAr: 'أكمل 5 سيناريوهات مكالمات', descEn: 'Complete 5 phone call scenarios', xp: 50 },
  { id: 'checkin-perfect', icon: '🏨', ar: 'وصول مثالي', en: 'Perfect Check-in', descAr: 'نسبة 100% في فئة الوصول', descEn: 'Score 100% in the check-in category', xp: 50 },
  { id: 'complaint-resolver', icon: '🛠️', ar: 'حلال المشاكل', en: 'Complaint Resolver', descAr: 'حل 3 شكاوى في السيناريوهات', descEn: 'Resolve 3 complaints in scenarios', xp: 40 },
  { id: 'facilities-expert', icon: '🏊', ar: 'خبير المرافق', en: 'Facilities Expert', descAr: 'نسبة 100% في فئة المرافق', descEn: 'Score 100% in the facilities category', xp: 40 },
  { id: 'streak-7', icon: '🔥', ar: 'استمرارية أسبوع', en: '7-Day Streak', descAr: 'تدرب 7 أيام متتالية', descEn: 'Train 7 days in a row', xp: 60 },
  { id: 'zero-critical', icon: '🛡️', ar: 'بدون أخطاء حاسمة', en: 'Zero Critical Failures', descAr: 'اختبار كامل بدون أخطاء حاسمة', descEn: 'Complete an exam with no critical failures', xp: 60 },
  { id: 'perfect-shift', icon: '✨', ar: 'مناوبة مثالية', en: 'Perfect Shift', descAr: 'أكمل قائمة المناوبة بالكامل', descEn: 'Complete the full shift checklist', xp: 30 },
  { id: 'score-100', icon: '🏆', ar: 'درجة كاملة', en: '100% Assessment', descAr: 'احصل على 100% في أي اختبار', descEn: 'Score 100% on any assessment', xp: 80 },
  { id: 'sim-master', icon: '🎭', ar: 'سيد السيناريوهات', en: 'Scenario Master', descAr: 'أكمل 5 سيناريوهات ضيف غامض', descEn: 'Complete 5 mystery guest scenarios', xp: 50 },
  { id: 'daily-3', icon: '📅', ar: 'التحديات اليومية', en: 'Daily Grinder', descAr: 'أكمل 3 تحديات يومية', descEn: 'Complete 3 daily challenges', xp: 40 },
  { id: 'guest-master', icon: '👑', ar: 'سيد الضيف الغامض', en: 'Mystery Guest Master', descAr: 'ارتقِ إلى المستوى الخامس', descEn: 'Reach level 5', xp: 150 },
];
