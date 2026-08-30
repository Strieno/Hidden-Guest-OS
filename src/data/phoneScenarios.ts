export interface PhoneEffects {
  greeting: number;
  hotel: number;
  employee: number;
  listening: number;
  accuracy: number;
  language: number;
  closing: number;
}

export interface PhoneOption {
  id: string;
  labelAr: string;
  labelEn: string;
  effects: PhoneEffects;
  critical?: boolean;
  feedbackAr: string;
  feedbackEn: string;
  next?: string;
}

export interface PhoneStage {
  id: string;
  guestAr: string;
  guestEn: string;
  options: PhoneOption[];
}

export interface PhoneScenario {
  id: string;
  icon: string;
  titleAr: string;
  titleEn: string;
  introAr: string;
  introEn: string;
  stages: PhoneStage[];
}

const P = (greeting: number, hotel: number, employee: number, listening: number, accuracy: number, language: number, closing: number): PhoneEffects => ({
  greeting, hotel, employee, listening, accuracy, language, closing,
});

export const PHONE_SCENARIOS: PhoneScenario[] = [
  {
    id: 'availability',
    icon: '📅',
    titleAr: 'استفسار عن التوفر',
    titleEn: 'Room availability enquiry',
    introAr: 'مكالمة استفسار عن توفر غرفة لليلة الجمعة.',
    introEn: 'A call asking about room availability for Friday night.',
    stages: [
      {
        id: 'answer',
        guestAr: 'السلام عليكم، عندكم غرفة متوفرة لليلة الجمعة؟',
        guestEn: 'Hello, do you have a room available for Friday night?',
        options: [
          { id: 'a1', labelAr: 'وعليكم السلام، فندق وشقق ذا جيت، معك حسن من قسم الحجوزات، تفضل.', labelEn: 'Hello, The Gate Hotel & Apartments, Hassan from Reservations, how may I help?', effects: P(10, 10, 10, 0, 0, 5, 0), feedbackAr: '+10 تحية +10 الفندق +10 الموظف — تحية كاملة', feedbackEn: '+10 Greeting +10 Hotel +10 Employee — full greeting' },
          { id: 'a2', labelAr: 'نعم موجود.', labelEn: 'Yes, available.', effects: P(-5, -10, -10, 0, 0, 0, 0), feedbackAr: 'لا تحية ولا تعريف — انطباع أول ضعيف', feedbackEn: 'No greeting or identification — weak first impression' },
        ],
      },
      {
        id: 'details',
        guestAr: 'كم السعر ليلة واحدة؟',
        guestEn: 'What is the price for one night?',
        options: [
          { id: 'd1', labelAr: 'لأي تاريخ تحديداً؟ وسعر الغرفة المزدوجة يبدأ من 450 ريالاً شاملة الإفطار.', labelEn: 'For which exact date? A double room starts from SAR 450 including breakfast.', effects: P(0, 0, 0, 10, 10, 5, 0), feedbackAr: '+10 استماع +10 دقة — تأكد من التاريخ وحدد السعر', feedbackEn: '+10 Listening +10 Accuracy — confirmed date, stated price' },
          { id: 'd2', labelAr: 'حوالي 400.', labelEn: 'Around 400.', effects: P(0, 0, 0, 0, -10, 0, 0), feedbackAr: 'سعر غير دقيق — تحقق قبل الإجابة', feedbackEn: 'Vague price — verify before answering' },
        ],
      },
      {
        id: 'close',
        guestAr: 'تمام، سأفكر بالأمر وأعود إليك.',
        guestEn: 'Okay, I will think about it and get back to you.',
        options: [
          { id: 'c1', labelAr: 'بكل سرور. لتأكيد الحجز يمكنك الاتصال أو الحجز عبر موقعنا، ونحن هنا لأي استفسار.', labelEn: 'With pleasure. You can confirm online or by calling, and we are here for any question.', effects: P(0, 0, 0, 5, 5, 5, 10), feedbackAr: '+10 إغلاق — ودّي مع قنوات متابعة واضحة', feedbackEn: '+10 Closing — friendly with clear follow-up channels' },
        ],
      },
    ],
  },
  {
    id: 'reservation',
    icon: '📝',
    titleAr: 'حجز جديد بالهاتف',
    titleEn: 'New reservation over the phone',
    introAr: 'متصل يريد حجز شقة لعائلة لمدة أسبوع.',
    introEn: 'A caller wants to book an apartment for a family for a week.',
    stages: [
      {
        id: 'r-answer',
        guestAr: 'أهلاً، أبغى أحجز شقة غرفتين لأسبوع.',
        guestEn: 'Hello, I want to book a two-bedroom apartment for a week.',
        options: [
          { id: 'ra1', labelAr: 'أهلاً بك، فندق وشقق ذا جيت، معك سارة من الحجوزات. يسعدني مساعدتك في الحجز.', labelEn: 'Welcome, The Gate Hotel & Apartments, Sarah from Reservations. Happy to help with your booking.', effects: P(10, 10, 10, 5, 0, 5, 0), feedbackAr: '+10 في التحية والفندق والموظف', feedbackEn: '+10 Greeting/Hotel/Employee' },
        ],
      },
      {
        id: 'r-data',
        guestAr: 'عائلتي أربعة، وتوصلنا الأحد.',
        guestEn: 'We are a family of four, arriving Sunday.',
        options: [
          { id: 'rd1', labelAr: 'ممتاز. اسمك الكريم ورقم الجوال؟ وسأؤكد لك السعر وشروط الإلغاء قبل التأكيد.', labelEn: 'Excellent. Your name and mobile, please? I will confirm the price and cancellation policy before confirming.', effects: P(0, 0, 0, 15, 15, 5, 5), feedbackAr: '+15 استماع +15 دقة — جمع البيانات كاملة ووضوح السياسات', feedbackEn: '+15 Listening +15 Accuracy — full data collection and clear policies' },
          { id: 'rd2', labelAr: 'أكيد مؤكد. سأرسل لك رمز التأكيد.', labelEn: 'Sure, confirmed. I will send you a confirmation code.', effects: P(0, 0, 0, 0, -10, 0, -5), feedbackAr: 'أكدت دون بيانات الضيف أو السياسات — دقة منخفضة', feedbackEn: 'Confirmed without guest data or policies — low accuracy' },
        ],
      },
    ],
  },
  {
    id: 'price-negotiation',
    icon: '💰',
    titleAr: 'تفاوض على السعر',
    titleEn: 'Price negotiation',
    introAr: 'متصل يطلب خصماً على سعر الجناح.',
    introEn: 'A caller asks for a discount on the suite rate.',
    stages: [
      {
        id: 'n-ask',
        guestAr: 'سعركم مرتفع، أقدر أحصل على خصم؟',
        guestEn: 'Your rate is high; can I get a discount?',
        options: [
          { id: 'na1', labelAr: 'أتفهم ذلك. يمكنني تقديم سعر خاص لليالي المتتالية، أو إضافة إفطار مجاني للجناح.', labelEn: 'I understand. I can offer a special rate for consecutive nights, or add complimentary breakfast to the suite.', effects: P(0, 0, 0, 10, 10, 5, 0), feedbackAr: '+10 استماع +10 دقة — عرض قيمة بدل خصم عشوائي', feedbackEn: '+10 Listening +10 Accuracy — value offer instead of random discount' },
          { id: 'na2', labelAr: 'مستحيل، هذا أفضل سعر.', labelEn: 'Impossible, that is the best price.', effects: P(0, 0, 0, -10, 0, -5, 0), feedbackAr: 'رفض حاد دون بدائل — استماع منخفض', feedbackEn: 'Harsh refusal without alternatives — low listening' },
        ],
      },
      {
        id: 'n-deal',
        guestAr: 'ماذا لو حجزت ثلاث ليالٍ؟',
        guestEn: 'What if I book three nights?',
        options: [
          { id: 'nd1', labelAr: 'مع ثلاث ليالٍ يمكنك الحصول على 12% خصماً وترقية عند التوفر.', labelEn: 'With three nights you can get a 12% discount and an upgrade when available.', effects: P(0, 0, 0, 10, 10, 5, 5), feedbackAr: '+10 دقة — خصم مرتبط بمدة الإقامة', feedbackEn: '+10 Accuracy — discount tied to stay length' },
        ],
      },
    ],
  },
  {
    id: 'early-checkin',
    icon: '⏰',
    titleAr: 'طلب دخول مبكر',
    titleEn: 'Early check-in request',
    introAr: 'ضيف حجز لليلة ويطلب الدخول صباحاً بدلاً من الظهر.',
    introEn: 'A guest booked for tonight and requests morning check-in instead of noon.',
    stages: [
      {
        id: 'ec-ask',
        guestAr: 'أصل الساعة 9 صباحاً، ممكن أدخل غرفتي بدري؟',
        guestEn: 'I arrive at 9am; can I enter my room early?',
        options: [
          { id: 'ec1', labelAr: 'سأسجل طلبك وسأحاول تجهيز الغرفة مبكراً، وإن لم تكن جاهزة سنوفر لك صالة الاسترخاء والأمتعة.', labelEn: 'I will log your request and try to prepare the room early; if not ready, we will offer the lounge and luggage storage.', effects: P(0, 0, 0, 15, 10, 5, 5), feedbackAr: '+15 استماع — التزام مع حل احتياطي', feedbackEn: '+15 Listening — commitment with a backup plan' },
          { id: 'ec2', labelAr: 'ما نضمن أي شيء قبل الثانية ظهراً.', labelEn: 'We guarantee nothing before 2pm.', effects: P(0, 0, 0, -10, 0, -5, 0), feedbackAr: 'رفض قاطع — قدّم حلاً بديلاً', feedbackEn: 'Flat refusal — offer an alternative' },
        ],
      },
    ],
  },
  {
    id: 'late-checkout',
    icon: '🌙',
    titleAr: 'طلب خروج متأخر',
    titleEn: 'Late checkout request',
    introAr: 'ضيف يسأل عن إمكانية البقاء حتى المساء.',
    introEn: 'A guest asks about staying until evening.',
    stages: [
      {
        id: 'lc-ask',
        guestAr: 'ممكن أطلع الساعة 6 مساءً بدل 2؟',
        guestEn: 'Can I check out at 6pm instead of 2?',
        options: [
          { id: 'lc1', labelAr: 'سأتحقق من توفر الغرفة وأعود إليك خلال دقيقتين — التمديد حتى السادسة عادة متاح مجاناً للضيوف المباشرين.', labelEn: 'Let me check room availability and call you back in two minutes — extension to 6pm is usually free for direct guests.', effects: P(0, 0, 0, 10, 15, 5, 5), feedbackAr: '+15 دقة — تحقق ثم وعد محدد', feedbackEn: '+15 Accuracy — verify then make a specific promise' },
          { id: 'lc2', labelAr: 'المغادرة الثانية ظهراً حصرياً، وأي تأخير عليه رسوم 200 ريال.', labelEn: 'Checkout is strictly 2pm, and any delay costs SAR 200.', effects: P(0, 0, 0, -10, -10, -5, -5), critical: true, feedbackAr: 'خطأ حاسم: لا ترفض بحدة — قدّم حلاً أو تحقق أولاً.', feedbackEn: 'CRITICAL: Never refuse harshly — offer a solution or verify first.' },
        ],
      },
    ],
  },
  {
    id: 'airport',
    icon: '🚖',
    titleAr: 'خدمة النقل من المطار',
    titleEn: 'Airport transfer service',
    introAr: 'متصل يسأل عن خدمة استقبال من المطار.',
    introEn: 'A caller asks about airport pickup service.',
    stages: [
      {
        id: 'ap-ask',
        guestAr: 'عندكم خدمة توصيل من المطار؟ وكم التكلفة؟',
        guestEn: 'Do you have airport transfer? How much is it?',
        options: [
          { id: 'ap1', labelAr: 'نعم، خدمة خاصة بتكلفة 150 ريالاً، أو مشتركة بـ 80. سأحتاج رقم رحلتك لترتيب الاستقبال.', labelEn: 'Yes, a private transfer costs SAR 150, or shared at SAR 80. I will need your flight number to arrange pickup.', effects: P(0, 0, 0, 10, 15, 5, 5), feedbackAr: '+15 دقة — سعر واضح وخطوة تالية محددة', feedbackEn: '+15 Accuracy — clear price and defined next step' },
          { id: 'ap2', labelAr: 'في شيء بس ما أعرف التكلفة.', labelEn: 'There is something but I do not know the cost.', effects: P(0, 0, 0, 0, -10, 0, 0), feedbackAr: 'معلومة ناقصة — اطلع على الأسعار قبل الرد', feedbackEn: 'Incomplete info — know your rates before answering' },
        ],
      },
    ],
  },
  {
    id: 'wifi',
    icon: '📶',
    titleAr: 'مشكلة في الواي فاي',
    titleEn: 'Wi-Fi issue',
    introAr: 'ضيف من الغرفة يشكو من انقطاع الإنترنت.',
    introEn: 'A guest from the room complains about the internet dropping.',
    stages: [
      {
        id: 'wifi-ask',
        guestAr: 'الواي فاي عندي ينقطع كل دقيقة!',
        guestEn: 'My Wi-Fi drops every minute!',
        options: [
          { id: 'w1', labelAr: 'أعتذر عن الإزعاج. هل يمكنك إعادة تشغيل شبكة الجهاز، وسأتابع مع قسم التقنية الآن وأعود لك بخبر خلال 5 دقائق؟', labelEn: 'I apologize for the trouble. Could you toggle your device Wi-Fi? I will notify IT now and call you back in 5 minutes.', effects: P(0, 0, 0, 15, 10, 10, 10), feedbackAr: '+15 استماع +10 إغلاق — اعتذار + خطوة + متابعة', feedbackEn: '+15 Listening +10 Closing — apology + step + follow-up' },
          { id: 'w2', labelAr: 'جربوا تسكرون الجهاز ويفتحونه.', labelEn: 'Try turning the device off and on.', effects: P(0, 0, 0, -5, -5, -5, 0), feedbackAr: 'رد عام دون امتلاك المشكلة', feedbackEn: 'Generic reply without owning the problem' },
        ],
      },
    ],
  },
  {
    id: 'housekeeping',
    icon: '🧹',
    titleAr: 'طلب تدبير منزلي',
    titleEn: 'Housekeeping request',
    introAr: 'ضيف يطلب تنظيفاً فورياً للغرفة.',
    introEn: 'A guest requests immediate room cleaning.',
    stages: [
      {
        id: 'hk-ask',
        guestAr: 'ممكن تنظفون الغرفة الآن؟ عندي ضيوف بعد ساعة.',
        guestEn: 'Can you clean the room now? I have guests in an hour.',
        options: [
          { id: 'hk1', labelAr: 'سأرسل فريق التدبير فوراً، ويمكنك متابعة الجاهزية من الاستقبال. نعتذر عن أي إزعاج.', labelEn: 'I will send housekeeping right away; you can follow readiness from reception. Apologies for any inconvenience.', effects: P(0, 0, 0, 10, 10, 5, 10), feedbackAr: '+10 استماع +10 إغلاق — استجابة سريعة', feedbackEn: '+10 Listening +10 Closing — quick response' },
          { id: 'hk2', labelAr: 'التدبير المنزلي عنده جدول مزدحم، ما أقدر أضمن شيء.', labelEn: 'Housekeeping has a busy schedule; I cannot guarantee anything.', effects: P(0, 0, 0, -10, -5, -5, 0), feedbackAr: 'رد بلا التزام — استماع منخفض', feedbackEn: 'No commitment — low listening' },
        ],
      },
    ],
  },
  {
    id: 'maintenance',
    icon: '🔧',
    titleAr: 'عطل في التكييف',
    titleEn: 'AC maintenance issue',
    introAr: 'ضيف يبلغ عن عطل في المكيف.',
    introEn: 'A guest reports an AC fault.',
    stages: [
      {
        id: 'mt-ask',
        guestAr: 'المكيف ما يشتغل والجو حار!',
        guestEn: 'The AC is not working and it is hot!',
        options: [
          { id: 'mt1', labelAr: 'أعتذر بشدة. سأرسل الفني خلال 10 دقائق، وإن تأخر سننقلك لغرفة بديلة. سأتابع معك شخصياً.', labelEn: 'My sincere apologies. I will send the technician within 10 minutes; if delayed we will move you. I will follow up personally.', effects: P(0, 0, 0, 15, 10, 5, 10), feedbackAr: '+15 استماع — مهلة + بديل + متابعة', feedbackEn: '+15 Listening — timeline + alternative + follow-up' },
          { id: 'mt2', labelAr: 'أرسلنا بلاغاً، الفني جاي وقت ما يخلص.', labelEn: 'We submitted a report; the technician will come when he finishes.', effects: P(0, 0, 0, -10, -5, -5, 0), feedbackAr: 'رد غامض بلا مهلة — استماع منخفض', feedbackEn: 'Vague reply with no timeline — low listening' },
        ],
      },
    ],
  },
  {
    id: 'lost-found',
    icon: '🧳',
    titleAr: 'مفقودات',
    titleEn: 'Lost and found',
    introAr: 'متصل يسأل عن ساعة تركها في الغرفة.',
    introEn: 'A caller asks about a watch left in the room.',
    stages: [
      {
        id: 'lf-ask',
        guestAr: 'سويت شيك أوت اليوم ونسيت ساعتي في الغرفة.',
        guestEn: 'I checked out today and left my watch in the room.',
        options: [
          { id: 'lf1', labelAr: 'سأتحقق من سجل المفقودات فوراً وأعاود الاتصال بك خلال دقائق. اسم الغرفة ورقمها لو سمحت؟', labelEn: 'I will check the lost-and-found log now and call you back in minutes. May I have your room number?', effects: P(0, 0, 0, 10, 15, 5, 10), feedbackAr: '+15 دقة — إجراء واضح ومتابعة مؤكدة', feedbackEn: '+15 Accuracy — clear process and confirmed follow-up' },
          { id: 'lf2', labelAr: 'بعد ما تطلع من الغرفة ما نقدر نتحمل مسؤولية شيء.', labelEn: 'Once you check out we cannot take responsibility for anything.', effects: P(0, 0, 0, -15, -10, -5, -10), critical: true, feedbackAr: 'خطأ حاسم: المفقودات مسؤوليتنا — لا ترفض مساعدة الضيف.', feedbackEn: 'CRITICAL: Lost items are our responsibility — never refuse to help.' },
        ],
      },
    ],
  },
  {
    id: 'wakeup',
    icon: '⏰',
    titleAr: 'مكالمة إيقاظ',
    titleEn: 'Wake-up call',
    introAr: 'ضيف يطلب مكالمة إيقاظ.',
    introEn: 'A guest requests a wake-up call.',
    stages: [
      {
        id: 'wu-ask',
        guestAr: 'أبغى إيقاظ الساعة 5:30 الفجر.',
        guestEn: 'I need a wake-up call at 5:30am.',
        options: [
          { id: 'wu1', labelAr: 'تم تسجيل إيقاظ الساعة 5:30 صباحاً على الغرفة 214. سأكررها للتأكيد: 5:30 صباحاً صحيح؟', labelEn: 'Wake-up is set for 5:30am on room 214. Let me confirm: 5:30am, correct?', effects: P(0, 0, 0, 15, 15, 5, 5), feedbackAr: '+15 استماع +15 دقة — تأكيد مزدوج', feedbackEn: '+15 Listening +15 Accuracy — double confirmation' },
          { id: 'wu2', labelAr: 'إن شاء الله أتذكر أنبهك.', labelEn: 'Hopefully I will remember to wake you.', effects: P(0, 0, 0, -5, -15, -10, 0), feedbackAr: 'لا تسجيل ولا تأكيد — دقة منخفضة', feedbackEn: 'No logging or confirmation — low accuracy' },
        ],
      },
    ],
  },
  {
    id: 'complaint',
    icon: '😠',
    titleAr: 'شكوى عبر الهاتف',
    titleEn: 'Complaint over the phone',
    introAr: 'متصل غاضب من الضجيج في الغرفة المجاورة.',
    introEn: 'An angry caller complains about noise from the neighboring room.',
    stages: [
      {
        id: 'cp-ask',
        guestAr: 'الجيران مزعجين من الليل، ما قدرت أنام!',
        guestEn: 'The neighbors have been noisy all night; I could not sleep!',
        options: [
          { id: 'cp1', labelAr: 'أعتذر بشدة عن هذا الإزعاج. سأرسل الأمن للغرفة المجاورة الآن، وسأعاود الاتصال بك للتأكيد.', labelEn: 'I sincerely apologize. I will send security to the neighboring room now and call you back to confirm.', effects: P(0, 0, 0, 15, 10, 5, 10), feedbackAr: '+15 استماع +10 إغلاق — اعتذار + إجراء فوري + متابعة', feedbackEn: '+15 Listening +10 Closing — apology + immediate action + follow-up' },
          { id: 'cp2', labelAr: 'أبلغوا الأمن، وما نقدر نسوي أكثر.', labelEn: 'Security was notified; we cannot do more.', effects: P(0, 0, 0, -10, 0, -5, -5), feedbackAr: 'أغلق الشكوى دون حل — استماع ورضا منخفضان', feedbackEn: 'Closed the complaint without a solution — low listening and satisfaction' },
        ],
      },
    ],
  },
  {
    id: 'fully-booked',
    icon: '🈵',
    titleAr: 'الفندق مكتمل',
    titleEn: 'Fully booked hotel',
    introAr: 'متصل يطلب غرفة والفندق مكتمل بالكامل.',
    introEn: 'A caller requests a room while the hotel is fully booked.',
    stages: [
      {
        id: 'fb-ask',
        guestAr: 'أبغى غرفة ليلة اليوم ضروري!',
        guestEn: 'I urgently need a room for tonight!',
        options: [
          { id: 'fb1', labelAr: 'للأسف نحن مكتملون الليلة، لكن يمكنني وضعك على قائمة الانتظار والتحقق من الفروع الشقيقة المتاحة.', labelEn: 'Unfortunately we are full tonight, but I can waitlist you and check our sister properties for availability.', effects: P(0, 0, 0, 15, 15, 10, 10), feedbackAr: '+15 استماع +15 دقة — صدق + بديل فوري', feedbackEn: '+15 Listening +15 Accuracy — honesty + immediate alternative' },
          { id: 'fb2', labelAr: 'الكل محجوز، ارجع بكرة.', labelEn: 'Everything is booked, call back tomorrow.', effects: P(0, 0, 0, -15, 0, -5, -5), feedbackAr: 'رد قاسٍ — قدّم بديلاً أو قائمة انتظار', feedbackEn: 'Harsh reply — offer an alternative or waitlist' },
        ],
      },
    ],
  },
  {
    id: 'bookingdotcom',
    icon: '🌐',
    titleAr: 'حجز عبر Booking.com',
    titleEn: 'Booking.com reservation',
    introAr: 'متصل يؤكد حجزاً تم عبر منصة Booking.com.',
    introEn: 'A caller confirms a Booking.com reservation.',
    stages: [
      {
        id: 'bd-ask',
        guestAr: 'أنا حجزت من بوكينغ، بس ودي أتأكد إن الحجز وصل.',
        guestEn: 'I booked through Booking.com; I just want to confirm the booking arrived.',
        options: [
          { id: 'bd1', labelAr: 'سأبحث عن الحجز برقم التأكيد من المنصة. هل معك رمز البوكينغ المكون من 10 أرقام؟', labelEn: 'I will search by the platform confirmation. Do you have the 10-digit Booking code?', effects: P(0, 0, 0, 10, 15, 5, 5), feedbackAr: '+15 دقة — إجراء صحيح للتحقق من حجوزات المنصات', feedbackEn: '+15 Accuracy — correct process for OTA bookings' },
          { id: 'bd2', labelAr: 'أي حجز من بوكينغ وصل أكيد.', labelEn: 'Any Booking.com booking certainly arrived.', effects: P(0, 0, 0, 0, -10, 0, 0), feedbackAr: 'افتراض بلا تحقق — تحقق من النظام دائماً', feedbackEn: 'Assumed without checking — always verify in the system' },
        ],
      },
    ],
  },
  {
    id: 'english-call',
    icon: '🇬🇧',
    titleAr: 'متصل يتحدث الإنجليزية',
    titleEn: 'English-speaking caller',
    introAr: 'مكالمة باللغة الإنجليزية من ضيف أجنبي.',
    introEn: 'A call in English from a foreign guest.',
    stages: [
      {
        id: 'en-ask',
        guestAr: 'Good morning! I would like to know if you have a suite available for two nights.',
        guestEn: 'Good morning! I would like to know if you have a suite available for two nights.',
        options: [
          { id: 'en1', labelAr: 'Good morning! This is The Gate Hotel & Apartments, Hassan speaking. Yes, we have a sea-view suite available — may I confirm the dates?', labelEn: 'Good morning! This is The Gate Hotel & Apartments, Hassan speaking. Yes, we have a sea-view suite available — may I confirm the dates?', effects: P(10, 10, 10, 10, 10, 15, 0), feedbackAr: '+15 لغة — انتقلت للإنجليزية فوراً بتحية كاملة', feedbackEn: '+15 Language — switched to English instantly with a full greeting' },
          { id: 'en2', labelAr: 'ممكن تتكلم عربي؟', labelEn: 'Can you speak Arabic?', effects: P(-5, -5, -5, -5, 0, -15, 0), feedbackAr: 'الإصرار على العربية مع ضيف أجنبي يضر بالتواصل', feedbackEn: 'Insisting on Arabic with a foreign guest harms communication' },
        ],
      },
    ],
  },
];
