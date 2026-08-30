export interface ShiftItem {
  id: string;
  cat: string;
  catEn: string;
  ar: string;
  en: string;
}

export interface ShiftCategory {
  cat: string;
  catEn: string;
  icon: string;
  items: ShiftItem[];
}

export const SHIFT_CATEGORIES: ShiftCategory[] = [
  {
    cat: 'المظهر',
    catEn: 'Appearance',
    icon: '👔',
    items: [
      { id: 'app-1', cat: 'المظهر', catEn: 'Appearance', ar: 'الزي الرسمي نظيف ومكوي', en: 'Uniform clean and pressed' },
      { id: 'app-2', cat: 'المظهر', catEn: 'Appearance', ar: 'بطاقة الاسم ظاهرة', en: 'Name badge visible' },
      { id: 'app-3', cat: 'المظهر', catEn: 'Appearance', ar: 'المظهر الشخصي مرتب (شعر، أظافر)', en: 'Grooming tidy (hair, nails)' },
      { id: 'app-4', cat: 'المظهر', catEn: 'Appearance', ar: 'ابتسامة وجاهزية ذهنية', en: 'Smile and mental readiness' },
    ],
  },
  {
    cat: 'الاستقبال',
    catEn: 'Front desk',
    icon: '🛎️',
    items: [
      { id: 'fd-1', cat: 'الاستقبال', catEn: 'Front desk', ar: 'المكتب منظم ونظيف', en: 'Desk organized and clean' },
      { id: 'fd-2', cat: 'الاستقبال', catEn: 'Front desk', ar: 'النماذج والمستندات جاهزة', en: 'Forms and documents ready' },
      { id: 'fd-3', cat: 'الاستقبال', catEn: 'Front desk', ar: 'أقلام ومفاتيح احتياطية متوفرة', en: 'Pens and spare keys available' },
    ],
  },
  {
    cat: 'PMS',
    catEn: 'PMS',
    icon: '💻',
    items: [
      { id: 'pms-1', cat: 'PMS', catEn: 'PMS', ar: 'نظام الحجز يعمل وتسجيل الدخول مكتمل', en: 'PMS running and logged in' },
      { id: 'pms-2', cat: 'PMS', catEn: 'PMS', ar: 'الوصولات القادمة محمّلة', en: 'Expected arrivals loaded' },
      { id: 'pms-3', cat: 'PMS', catEn: 'PMS', ar: 'المغادرات اليوم محددة', en: 'Today departures identified' },
    ],
  },
  {
    cat: 'النقدية',
    catEn: 'Cash',
    icon: '💵',
    items: [
      { id: 'cash-1', cat: 'النقدية', catEn: 'Cash', ar: 'الدرج النقدي مدقق ومتوازن', en: 'Cash drawer counted and balanced' },
      { id: 'cash-2', cat: 'النقدية', catEn: 'Cash', ar: 'الفكة الكافية متوفرة', en: 'Sufficient change available' },
      { id: 'cash-3', cat: 'النقدية', catEn: 'Cash', ar: 'أجهزة الدفع تعمل', en: 'Payment terminals working' },
    ],
  },
  {
    cat: 'الغرف',
    catEn: 'Room status',
    icon: '🛏️',
    items: [
      { id: 'rm-1', cat: 'الغرف', catEn: 'Room status', ar: 'معرفة الغرف المتاحة والجاهزة', en: 'Know available and ready rooms' },
      { id: 'rm-2', cat: 'الغرف', catEn: 'Room status', ar: 'حالة النظافة اليومية معروفة', en: 'Daily housekeeping status known' },
      { id: 'rm-3', cat: 'الغرف', catEn: 'Room status', ar: 'الغرف خارج الخدمة محددة', en: 'Out-of-order rooms identified' },
    ],
  },
  {
    cat: 'المرافق',
    catEn: 'Facilities',
    icon: '🏊',
    items: [
      { id: 'fac-1', cat: 'المرافق', catEn: 'Facilities', ar: 'ساعات الإفطار والمطعم معروفة', en: 'Breakfast and restaurant hours known' },
      { id: 'fac-2', cat: 'المرافق', catEn: 'Facilities', ar: 'أوقات المرافق (مسبح/نادي/مصلى) معروفة', en: 'Facility hours (pool/gym/prayer) known' },
      { id: 'fac-3', cat: 'المرافق', catEn: 'Facilities', ar: 'معلومات النقل والمواصلات جاهزة', en: 'Transport information ready' },
    ],
  },
  {
    cat: 'الوصولات',
    catEn: 'Arrivals',
    icon: '⭐',
    items: [
      { id: 'vip-1', cat: 'الوصولات', catEn: 'Arrivals', ar: 'ضيوف VIP والطلبات الخاصة معروفة', en: 'VIP guests and special requests known' },
      { id: 'vip-2', cat: 'الوصولات', catEn: 'Arrivals', ar: 'مواعيد الوصول المتوقعة مؤكدة', en: 'Expected arrival times confirmed' },
      { id: 'vip-3', cat: 'الوصولات', catEn: 'Arrivals', ar: 'الترحيب للضيوف المميزين جاهز', en: 'Welcome prepared for key guests' },
    ],
  },
  {
    cat: 'الهاتف',
    catEn: 'Telephone',
    icon: '📞',
    items: [
      { id: 'tel-1', cat: 'الهاتف', catEn: 'Telephone', ar: 'خطوط الهاتف تعمل', en: 'Phone lines working' },
      { id: 'tel-2', cat: 'الهاتف', catEn: 'Telephone', ar: 'تحية الرد الفندقية محفوظة', en: 'Hotel greeting memorized' },
      { id: 'tel-3', cat: 'الهاتف', catEn: 'Telephone', ar: 'نظام المكالمات الداخلية جاهز', en: 'Internal call system ready' },
    ],
  },
  {
    cat: 'الطوارئ',
    catEn: 'Emergency',
    icon: '🚨',
    items: [
      { id: 'em-1', cat: 'الطوارئ', catEn: 'Emergency', ar: 'مخارج الطوارئ معروفة', en: 'Emergency exits known' },
      { id: 'em-2', cat: 'الطوارئ', catEn: 'Emergency', ar: 'أرقام الطوارئ متوفرة', en: 'Emergency numbers available' },
      { id: 'em-3', cat: 'الطوارئ', catEn: 'Emergency', ar: 'خطة الإخلاء مفهومة', en: 'Evacuation plan understood' },
    ],
  },
];

export const SHIFT_ITEMS: ShiftItem[] = SHIFT_CATEGORIES.flatMap((c) => c.items);
