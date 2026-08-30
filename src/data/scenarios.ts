export interface OptionEffects {
  service: number;
  communication: number;
  accuracy: number;
  satisfaction: number;
  compliance: number;
}

export interface ScenarioOption {
  id: string;
  labelAr: string;
  labelEn: string;
  effects: OptionEffects;
  critical?: boolean;
  feedbackAr: string;
  feedbackEn: string;
  next?: string;
}

export interface ScenarioStage {
  id: string;
  guestAr: string;
  guestEn: string;
  options: ScenarioOption[];
}

export interface ScenarioDef {
  id: string;
  icon: string;
  personalityAr: string;
  personalityEn: string;
  titleAr: string;
  titleEn: string;
  introAr: string;
  introEn: string;
  stages: ScenarioStage[];
}

const FX = (service: number, communication: number, accuracy: number, satisfaction: number, compliance: number): OptionEffects => ({
  service, communication, accuracy, satisfaction, compliance,
});

export const SCENARIOS: ScenarioDef[] = [
  {
    id: 'normal-guest',
    icon: '🧳',
    personalityAr: 'ضيف عادي',
    personalityEn: 'Normal Guest',
    titleAr: 'وصول ضيف بحجز مؤكد',
    titleEn: 'Arrival of a guest with a confirmed booking',
    introAr: 'وصل ضيف بعد رحلة طويلة حاملاً حقيبة واحدة. لديه حجز باسم عبدالله.',
    introEn: 'A guest arrives after a long journey with one bag. He has a booking under Abdullah.',
    stages: [
      {
        id: 'greeting',
        guestAr: 'السلام عليكم، تعبت من السفر. عندي حجز باسم عبدالله.',
        guestEn: 'Hello, I am tired from traveling. I have a booking under Abdullah.',
        options: [
          { id: 'g1', labelAr: 'وعليكم السلام، أهلاً بك في فندق ذا جيت. اسمح لي بالتحقق من حجزك بسرعة.', labelEn: 'Welcome to The Gate Hotel. Allow me to check your booking quickly.', effects: FX(10, 10, 5, 10, 5), feedbackAr: '+10 خدمة · +10 تواصل · ترحيب دافئ بالاسم', feedbackEn: '+10 Service · +10 Communication · warm welcome' },
          { id: 'g2', labelAr: 'أهلاً. أعطني اسمك ورقم الحجز.', labelEn: 'Hi. Give me your name and booking number.', effects: FX(0, -5, 5, -5, 0), feedbackAr: 'الرد مختصر يفتقد للود — خصم من التواصل ورضا الضيف', feedbackEn: 'Curt reply lacks warmth — deducted from communication and satisfaction' },
          { id: 'g3', labelAr: '(تجاهل الضيف مؤقتاً وأكمل الترتيب على المكتب)', labelEn: '(Briefly ignore the guest and finish sorting the desk)', effects: FX(-10, -10, 0, -15, 0), critical: true, feedbackAr: 'خطأ حاسم: لا تُبقِ الضيف بلا استقبال. توقف عن أي عمل آخر.', feedbackEn: 'CRITICAL: Never leave a guest unattended. Stop other work.', next: 'greeting' },
        ],
      },
      {
        id: 'identity',
        guestAr: 'نعم، عبدالله محمد. هاتفي 0501234567.',
        guestEn: 'Yes, Abdullah Mohammed. My phone is 0501234567.',
        options: [
          { id: 'i1', labelAr: 'شكراً. دعني أتحقق من هويتك وبطاقة الحجز قبل إصدار المفتاح.', labelEn: 'Thank you. Let me verify your identity and booking before issuing the key.', effects: FX(5, 5, 15, 5, 20), feedbackAr: '+15 دقة · +20 التزام بالإجراءات — التحقق قبل المفتاح', feedbackEn: '+15 Accuracy · +20 Compliance — verify before the key' },
          { id: 'i2', labelAr: 'تمام، هذا مفتاح غرفتك. أهلاً بك!', labelEn: 'Sure, here is your room key. Welcome!', effects: FX(5, 0, -15, 5, -20), critical: true, feedbackAr: 'خطأ حاسم: لا تصدر مفاتيح الغرف قبل التحقق من الهوية.', feedbackEn: 'CRITICAL: Never issue room access before identity verification.', next: 'identity' },
          { id: 'i3', labelAr: 'هل معك بطاقة هوية سارية للتحقق؟', labelEn: 'Do you have a valid ID for verification?', effects: FX(0, 5, 10, 0, 15), feedbackAr: '+10 دقة — طلب الهوية بشكل مهذب', feedbackEn: '+10 Accuracy — requesting ID politely' },
        ],
      },
      {
        id: 'room',
        guestAr: 'أكيد. هذا هويتي. وأيضاً أحتاج غرفة هادئة.',
        guestEn: 'Sure, here is my ID. I also need a quiet room.',
        options: [
          { id: 'r1', labelAr: 'سأسجل تفضيلك. غرفتك 302 في الدور الثالث، وبجانبك مصعد سريع وبيانات Wi-Fi هنا.', labelEn: 'Noted. Your room is 302 on the third floor, near the elevator, and here are the Wi-Fi details.', effects: FX(10, 5, 15, 10, 10), feedbackAr: '+15 دقة — معلومات كاملة: رقم الغرفة، الدور، Wi-Fi', feedbackEn: '+15 Accuracy — complete info: room, floor, Wi-Fi' },
          { id: 'r2', labelAr: 'إليك المفتاح. الاستقبال في الأسفل.', labelEn: 'Here is the key. Reception is downstairs.', effects: FX(0, -5, -10, -5, 0), feedbackAr: 'نقص معلومات الوصول: لا رقم غرفة واضح ولا Wi-Fi', feedbackEn: 'Missing arrival info: no clear room number or Wi-Fi' },
          { id: 'r3', labelAr: 'هل تحتاج أي شيء آخر؟ يمكنني إيصال أمتعتك.', labelEn: 'Do you need anything else? I can have your luggage delivered.', effects: FX(10, 5, 5, 10, 5), feedbackAr: '+10 خدمة — مبادرة استباقية', feedbackEn: '+10 Service — proactive initiative' },
        ],
      },
      {
        id: 'farewell',
        guestAr: 'شكراً لك، يبدو كل شيء جاهزاً.',
        guestEn: 'Thank you, everything looks ready.',
        options: [
          { id: 'f1', labelAr: 'على الرحب والسعة. وقت الإفطار من السادسة للعاشرة، وأنا حسن من الاستقبال لأي مساعدة.', labelEn: 'You are welcome. Breakfast is 6–10, and I am Hassan from reception for any help.', effects: FX(5, 10, 10, 10, 5), feedbackAr: '+10 تواصل — اسمك + معلومات الإفطار', feedbackEn: '+10 Communication — your name + breakfast info' },
          { id: 'f2', labelAr: 'حسناً.', labelEn: 'Okay.', effects: FX(-5, -10, 0, -5, 0), feedbackAr: 'وداع بارد — آخر انطباع مهم', feedbackEn: 'Cold farewell — the last impression matters' },
        ],
      },
    ],
  },
  {
    id: 'impatient-guest',
    icon: '⏱️',
    personalityAr: 'ضيف مستعجل',
    personalityEn: 'Impatient Guest',
    titleAr: 'ضيف مستعجل في ذروة الازدحام',
    titleEn: 'An impatient guest during peak rush',
    introAr: 'الفندق مزدحم عند الاستقبال، وضيف مستعجل يقطع الطابور.',
    introEn: 'The lobby is crowded at reception, and an impatient guest cuts the line.',
    stages: [
      {
        id: 'rush',
        guestAr: 'أنا مستعجل جداً! عندي اجتماع. أين غرفتي؟',
        guestEn: 'I am in a huge hurry! I have a meeting. Where is my room?',
        options: [
          { id: 'ru1', labelAr: 'أتفهم ذلك تماماً. سأخصص لك موظفاً الآن، وهذه أولوية لدينا.', labelEn: 'I fully understand. I will assign an agent to you now; you are our priority.', effects: FX(10, 10, 5, 15, 10), feedbackAr: '+15 رضا — تعاطف مع السرعة', feedbackEn: '+15 Satisfaction — empathy for speed' },
          { id: 'ru2', labelAr: 'عليك الانتظار بدورك مثل الجميع.', labelEn: 'You must wait your turn like everyone else.', effects: FX(-10, -10, 0, -20, 0), critical: true, feedbackAr: 'خطأ حاسم: لا تصادم الضيف أبداً — قدّم حلاً.', feedbackEn: 'CRITICAL: Never confront a guest — offer a solution.', next: 'rush' },
          { id: 'ru3', labelAr: 'دقيقة واحدة… سأنهي هذه المعاملة أولاً.', labelEn: 'One minute… let me finish this transaction first.', effects: FX(-5, -5, 0, -10, 0), feedbackAr: 'أجلت الضيف المستعجل — خصم من الرضا', feedbackEn: 'You delayed the urgent guest — satisfaction deducted' },
        ],
      },
      {
        id: 'checkin-fast',
        guestAr: 'سجلني بأسرع ما يمكن. اسمي خالد.',
        guestEn: 'Check me in as fast as possible. My name is Khaled.',
        options: [
          { id: 'c1', labelAr: 'خالد، دعني أتحقق من الحجز بسرعة وبطاقة الهوية معاً لإصدار المفتاح فوراً.', labelEn: 'Khaled, let me verify the booking and your ID together so I can issue the key immediately.', effects: FX(10, 5, 15, 10, 20), feedbackAr: '+15 دقة و+20 التزام — سرعة دون تجاوز الإجراءات', feedbackEn: '+15 Accuracy +20 Compliance — speed without skipping procedures' },
          { id: 'c2', labelAr: 'المفتاح جاهز من غير تحقق، تفضل.', labelEn: 'Here is the key without verification, go ahead.', effects: FX(5, 0, -20, 5, -20), critical: true, feedbackAr: 'خطأ حاسم: السرعة لا تلغي التحقق من الهوية.', feedbackEn: 'CRITICAL: Speed never replaces identity verification.', next: 'checkin-fast' },
        ],
      },
      {
        id: 'info',
        guestAr: 'وأحتاج أن أعرف مكان اجتماعي بسرعة.',
        guestEn: 'And I need to know the meeting location quickly.',
        options: [
          { id: 'in1', labelAr: 'اجتماعك في قاعة الزيتون بالدور الثاني، وسأجهز لك الاتجاهات مكتوبة.', labelEn: 'Your meeting is in the Olive Hall on the second floor; I will prepare written directions.', effects: FX(10, 10, 10, 10, 5), feedbackAr: '+10 في كل المحاور — دقة وسرعة', feedbackEn: '+10 across axes — accurate and fast' },
          { id: 'in2', labelAr: 'في مكان ما في الدور الثاني.', labelEn: 'Somewhere on the second floor.', effects: FX(-5, -5, -10, -5, 0), feedbackAr: 'إجابة غامضة — لماذا لا تتأكد وتقدم الاتجاه الدقيق؟', feedbackEn: 'Vague answer — why not confirm and give exact directions?' },
        ],
      },
    ],
  },
  {
    id: 'angry-guest',
    icon: '😤',
    personalityAr: 'ضيف غاضب',
    personalityEn: 'Angry Guest',
    titleAr: 'ضيف غاضب من تأخير الخدمة',
    titleEn: 'A guest angry about a service delay',
    introAr: 'طلب الضيف مناشف منذ ساعة ولم تصل، وهو غاضب جداً.',
    introEn: 'The guest requested towels an hour ago and they never arrived; he is very upset.',
    stages: [
      {
        id: 'complaint',
        guestAr: 'طلبت مناشف من ساعة ولم تصل! هذه خدمة سيئة!',
        guestEn: 'I asked for towels an hour ago and they never came! This is terrible service!',
        options: [
          { id: 'co1', labelAr: 'أعتذر بصدق عن هذا التأخير. سأرسل المناشف فوراً وأتابع معك شخصياً خلال 5 دقائق.', labelEn: 'I sincerely apologize for this delay. I will send the towels immediately and follow up with you personally in 5 minutes.', effects: FX(15, 10, 10, 20, 10), feedbackAr: '+20 رضا — اعتذار + حل + متابعة', feedbackEn: '+20 Satisfaction — apology + solution + follow-up' },
          { id: 'co2', labelAr: 'المناشف ليست من اختصاصي، اتصل بالتدبير المنزلي.', labelEn: 'Towels are not my department; call housekeeping.', effects: FX(-15, -15, 0, -20, -10), critical: true, feedbackAr: 'خطأ حاسم: لا تحوّل الضيف أبداً — امتلك المشكلة.', feedbackEn: 'CRITICAL: Never pass the guest around — own the problem.', next: 'complaint' },
          { id: 'co3', labelAr: 'وعدناك بساعة، يعني زحمة اليوم.', labelEn: 'We promised within an hour, so it is busy today.', effects: FX(-10, -10, 0, -15, -5), feedbackAr: 'اختلاق أعذار — اعتذر ولا تبرر', feedbackEn: 'Making excuses — apologize, do not justify' },
        ],
      },
      {
        id: 'followup',
        guestAr: 'حسناً… لكني غاضب من هذا الإهمال.',
        guestEn: 'Fine… but I am still upset about this neglect.',
        options: [
          { id: 'fo1', labelAr: 'حقك علينا، وسأضيف لك باقة ترحيب لتعويض الإزعاج.', labelEn: 'You are right, and I will add a welcome amenity to compensate for the inconvenience.', effects: FX(10, 10, 5, 15, 5), feedbackAr: '+15 رضا — تعويض ملموس', feedbackEn: '+15 Satisfaction — tangible compensation' },
          { id: 'fo2', labelAr: 'تم إرسال المناشف. أي شيء آخر؟', labelEn: 'Towels were sent. Anything else?', effects: FX(5, 0, 5, -5, 0), feedbackAr: 'حل بدون تعويض — رضا الضيف ما زال منخفضاً', feedbackEn: 'Solved without compensation — satisfaction still low' },
        ],
      },
    ],
  },
  {
    id: 'vip-guest',
    icon: '👑',
    personalityAr: 'ضيف VIP',
    personalityEn: 'VIP Guest',
    titleAr: 'وصول ضيف VIP مع طلب ترقية',
    titleEn: 'VIP arrival with an upgrade request',
    introAr: 'ضيف VIP وصل مبكراً، ويطلب ترقية إلى جناح مطوّل على البحر.',
    introEn: 'A VIP guest arrives early and requests an upgrade to a sea-view suite.',
    stages: [
      {
        id: 'welcome',
        guestAr: 'أنا الدكتور سامر. حجزت جناحاً، وأود الترقية إلى جناح البحر.',
        guestEn: 'I am Dr. Samer. I booked a suite and would like an upgrade to the sea-view suite.',
        options: [
          { id: 'w1', labelAr: 'أهلاً بك دكتور سامر. يسعدنا تقديم جناح البحر لك، وسنحضر لك عصير ترحيب.', labelEn: 'Welcome Dr. Samer. We are delighted to offer you the sea-view suite, with a welcome drink.', effects: FX(15, 10, 5, 15, 5), feedbackAr: '+15 خدمة — ترحيب شخصي بالاسم', feedbackEn: '+15 Service — personal welcome by name' },
          { id: 'w2', labelAr: 'كل الترقيات تدفع فرق السعر.', labelEn: 'All upgrades are subject to the rate difference.', effects: FX(-10, -5, 0, -15, 0), feedbackAr: 'بدأت بالمال بدلاً من الضيافة — خصم من الرضا', feedbackEn: 'Started with money instead of hospitality — satisfaction deducted' },
        ],
      },
      {
        id: 'upsell',
        guestAr: 'ما المميز في هذا الجناح؟',
        guestEn: 'What makes this suite special?',
        options: [
          { id: 'u1', labelAr: 'إطلالة مباشرة على البحر، جلسة خارجية خاصة، وخدمة غرف مطولة حتى منتصف الليل.', labelEn: 'A direct sea view, a private terrace, and extended room service until midnight.', effects: FX(10, 10, 15, 10, 5), feedbackAr: '+15 دقة — بيع بالقيمة لا بالضغط', feedbackEn: '+15 Accuracy — selling value, not pressure' },
          { id: 'u2', labelAr: 'غرفة أكبر. هذا كل شيء.', labelEn: 'A bigger room. That is all.', effects: FX(-5, -5, -5, -5, 0), feedbackAr: 'عرض باهت بلا قيمة واضحة', feedbackEn: 'Bland offer with no clear value' },
        ],
      },
      {
        id: 'facilities-vip',
        guestAr: 'سأستقبل ضيوفاً مساءً. ما المتاح؟',
        guestEn: 'I will receive guests tonight. What is available?',
        options: [
          { id: 'v1', labelAr: 'يمكننا تجهيز جلسة في اللوبي أو الصالة الخاصة، مع خدمة قهوة وتمر.', labelEn: 'We can arrange the lobby lounge or the private hall, with coffee and dates service.', effects: FX(10, 5, 10, 10, 5), feedbackAr: '+10 في المحاور — معرفة بالمرافق', feedbackEn: '+10 across axes — facility knowledge' },
          { id: 'v2', labelAr: 'لا أعرف، اسأل المدير غداً.', labelEn: 'I do not know, ask the manager tomorrow.', effects: FX(-10, -10, -10, -10, -5), feedbackAr: 'جهل بالمرافق يضر بتجربة VIP', feedbackEn: 'Ignorance of facilities harms the VIP experience' },
        ],
      },
    ],
  },
  {
    id: 'confused-guest',
    icon: '🤔',
    personalityAr: 'ضيف حائر',
    personalityEn: 'Confused Guest',
    titleAr: 'ضيف حائر في إجراءات الحجز',
    titleEn: 'A guest confused about booking procedures',
    introAr: 'ضيف مسن حجز عبر وسيط، ويبدو حائراً بشأن ما يتضمنه الحجز.',
    introEn: 'An elderly guest booked through an agency and seems confused about what the booking includes.',
    stages: [
      {
        id: 'confusion',
        guestAr: 'حجزت من مكتب سياحة… ولا أعرف إذا كان الإفطار مشمولاً.',
        guestEn: 'I booked through a travel agency… I do not know if breakfast is included.',
        options: [
          { id: 'con1', labelAr: 'لا تقلق، سأتحقق من تفاصيل حجزك الآن وأشرح لك كل شيء بوضوح.', labelEn: 'No worries, let me check your booking details now and explain everything clearly.', effects: FX(10, 10, 10, 10, 10), feedbackAr: '+10 في كل المحاور — طمأنة ووضوح', feedbackEn: '+10 across axes — reassurance and clarity' },
          { id: 'con2', labelAr: 'كل الحجوزات تشمل الإفطار.', labelEn: 'All bookings include breakfast.', effects: FX(0, -5, -10, -5, 0), feedbackAr: 'إجابة غير دقيقة — لم تتحقق من الحجز الفعلي', feedbackEn: 'Inaccurate — you did not verify the actual booking' },
        ],
      },
      {
        id: 'special',
        guestAr: 'وأحتاج مساعدة في حمل الحقيبة للغرفة.',
        guestEn: 'I also need help carrying the bag to the room.',
        options: [
          { id: 's1', labelAr: 'سأرافقك شخصياً وأحمل الحقيبة معك، وسأشرح لك أزرار التكييف والتلفاز.', labelEn: 'I will accompany you, carry the bag, and explain the AC and TV controls.', effects: FX(15, 10, 10, 15, 5), feedbackAr: '+15 خدمة — تجاوز المتوقع', feedbackEn: '+15 Service — going beyond expectations' },
          { id: 's2', labelAr: 'البواب سيساعدك إذا وجدته.', labelEn: 'The bellboy will help if you find him.', effects: FX(-5, -5, 0, -10, 0), feedbackAr: 'تحميل الضيف مسؤولية إيجاد المساعدة', feedbackEn: 'Made the guest responsible for finding help' },
        ],
      },
      {
        id: 'reassure',
        guestAr: 'شكراً لك، هذا مطمئن.',
        guestEn: 'Thank you, that is reassuring.',
        options: [
          { id: 're1', labelAr: 'أنا هنا لأي استفسار، وستجد رقم الاستقبال على الطاولة.', labelEn: 'I am here for any questions, and you will find the reception number on the table.', effects: FX(5, 10, 10, 5, 5), feedbackAr: '+10 تواصل — إغلاق دافئ مع معلومات', feedbackEn: '+10 Communication — warm close with info' },
        ],
      },
    ],
  },
  {
    id: 'family-guest',
    icon: '👨‍👩‍👧',
    personalityAr: 'عائلة',
    personalityEn: 'Family',
    titleAr: 'عائلة تصل مع أطفال',
    titleEn: 'A family arriving with children',
    introAr: 'عائلة تصل مع طفلين صغيرين، والأطفال متعبون.',
    introEn: 'A family arrives with two small children, and the kids are tired.',
    stages: [
      {
        id: 'family-welcome',
        guestAr: 'أهلاً، وصلنا مع أطفالنا المتعبين. نأمل تسجيلاً سريعاً.',
        guestEn: 'Hello, we arrived with our tired kids. We hope for a quick check-in.',
        options: [
          { id: 'fw1', labelAr: 'أهلاً بالعائلة! سأسجلكم بسرعة، ولدى الأطفال مكافأة ترحيب صغيرة.', labelEn: 'Welcome, family! I will check you in quickly, and the kids have a small welcome treat.', effects: FX(15, 10, 5, 20, 5), feedbackAr: '+20 رضا — انتباه لاحتياج العائلة', feedbackEn: '+20 Satisfaction — attention to family needs' },
          { id: 'fw2', labelAr: 'أكملوا الاستمارة الثلاثة أولاً.', labelEn: 'Please fill out these three forms first.', effects: FX(-10, -5, 0, -15, 0), feedbackAr: 'بيروقراطية بلا مرونة مع عائلة متعبة', feedbackEn: 'Bureaucracy without flexibility for a tired family' },
        ],
      },
      {
        id: 'family-room',
        guestAr: 'هل الغرفة قريبة من المصعد؟ الأطفال لا يحبون المشي الآن.',
        guestEn: 'Is the room near the elevator? The kids refuse to walk right now.',
        options: [
          { id: 'fr1', labelAr: 'نعم، الغرفة 105 بجانب المصعد مباشرة، وسأجهز سريراً إضافياً للطفل.', labelEn: 'Yes, room 105 is right by the elevator, and I will set up an extra crib.', effects: FX(10, 10, 15, 15, 10), feedbackAr: '+15 دقة — استجابة لاحتياج واضح', feedbackEn: '+15 Accuracy — response to a clear need' },
          { id: 'fr2', labelAr: 'الغرفة في الدور الثالث البعيد. سيتحمل الأطفال.', labelEn: 'The room is on the far third floor. The kids will cope.', effects: FX(-10, -5, -5, -15, 0), feedbackAr: 'تجاهل احتياج العائلة — رضا منخفض', feedbackEn: 'Ignored family needs — low satisfaction' },
        ],
      },
    ],
  },
  {
    id: 'business-guest',
    icon: '💼',
    personalityAr: 'رجل أعمال',
    personalityEn: 'Business Traveler',
    titleAr: 'رجل أعمال يطلب دخولاً مبكراً وخروجاً متأخراً',
    titleEn: 'A business traveler requesting early check-in and late checkout',
    introAr: 'رجل أعمال يصل السابعة صباحاً ويطلب دخولاً مبكراً، ويغادر ليلاً فيطلب خروجاً متأخراً.',
    introEn: 'A business traveler arrives at 7am requesting early check-in and will leave at night requesting late checkout.',
    stages: [
      {
        id: 'early',
        guestAr: 'وصلت مبكراً، هل يمكنني الدخول الآن؟ لدي مكالمات مهمة.',
        guestEn: 'I arrived early; can I check in now? I have important calls.',
        options: [
          { id: 'e1', labelAr: 'لحظة واحدة، سأتحقق من جاهزية الغرفة وأوفر لك صالة الأعمال للمكالمات حتى ذلك الحين.', labelEn: 'One moment; let me check room readiness and offer the business lounge for your calls meanwhile.', effects: FX(15, 10, 10, 15, 5), feedbackAr: '+15 خدمة — حل بديل أثناء الانتظار', feedbackEn: '+15 Service — an alternative while waiting' },
          { id: 'e2', labelAr: 'الدخول بعد الثانية ظهراً حصراً.', labelEn: 'Check-in is strictly after 2pm.', effects: FX(-10, -10, 0, -20, 0), critical: true, feedbackAr: 'خطأ حاسم: لا ترفض بحدة — قدم حلاً أو بديلاً.', feedbackEn: 'CRITICAL: Do not refuse harshly — offer a solution.', next: 'early' },
        ],
      },
      {
        id: 'late',
        guestAr: 'رائع. ومغادرتي ليلاً، هل الخروج المتأخر ممكن؟',
        guestEn: 'Great. And I leave at night; is late checkout possible?',
        options: [
          { id: 'l1', labelAr: 'بالتأكيد، يمكننا تمديد المغادرة حتى الثامنة مساءً بلا رسوم إضافية.', labelEn: 'Certainly, we can extend checkout until 8pm at no extra charge.', effects: FX(10, 10, 10, 15, 5), feedbackAr: '+15 رضا — مرونة مفيدة لرجل الأعمال', feedbackEn: '+15 Satisfaction — useful flexibility' },
          { id: 'l2', labelAr: 'المغادرة الثانية ظهراً، وهذا ليس مرناً.', labelEn: 'Checkout is 2pm, and that is not flexible.', effects: FX(-5, -5, -5, -10, 0), feedbackAr: 'رفض غير مرن — فرصة ضائعة لخدمة مميزة', feedbackEn: 'Inflexible refusal — a missed chance for standout service' },
        ],
      },
    ],
  },
  {
    id: 'foreign-guest',
    icon: '🌍',
    personalityAr: 'ضيف أجنبي',
    personalityEn: 'Foreign Guest',
    titleAr: 'ضيف أجنبي يتحدث الإنجليزية',
    titleEn: 'A foreign guest speaking English',
    introAr: 'ضيفة أجنبية تصل وتتحدث الإنجليزية فقط.',
    introEn: 'A foreign guest arrives and speaks English only.',
    stages: [
      {
        id: 'english',
        guestAr: 'Hello! I have a reservation. I don\'t speak Arabic, I\'m sorry.',
        guestEn: 'Hello! I have a reservation. I don\'t speak Arabic, I\'m sorry.',
        options: [
          { id: 'en1', labelAr: 'Certainly! Welcome to The Gate Hotel. May I have your name and passport for a quick check-in?', labelEn: 'Certainly! Welcome to The Gate Hotel. May I have your name and passport for a quick check-in?', effects: FX(10, 15, 10, 10, 10), feedbackAr: '+15 تواصل — الانتقال للغة الضيف فوراً', feedbackEn: '+15 Communication — switching to the guest language instantly' },
          { id: 'en2', labelAr: 'Arabic! Give me your name!', labelEn: 'Arabic! Give me your name!', effects: FX(-10, -20, -5, -20, -5), critical: true, feedbackAr: 'خطأ حاسم: لا تصر على لغتك — استخدم لغة الضيف.', feedbackEn: 'CRITICAL: Never insist on your language — use the guest\'s.', next: 'english' },
          { id: 'en3', labelAr: '(Call a colleague to translate without excusing yourself)', labelEn: '(Call a colleague to translate without excusing yourself)', effects: FX(0, -5, 0, -10, -5), feedbackAr: 'التحدث مع زميل أمام الضيف بلغة أخرى دون استئذان', feedbackEn: 'Speaking with a colleague in another language without excusing yourself' },
        ],
      },
      {
        id: 'foreign-info',
        guestAr: 'Great, thank you. Do you have a gym and a swimming pool?',
        guestEn: 'Great, thank you. Do you have a gym and a swimming pool?',
        options: [
          { id: 'fi1', labelAr: 'Yes, the gym is on the second floor open 24/7, and the pool is on the rooftop with a great view.', labelEn: 'Yes, the gym is on the second floor open 24/7, and the pool is on the rooftop with a great view.', effects: FX(10, 10, 15, 10, 5), feedbackAr: '+15 دقة — معلومات دقيقة وسريعة', feedbackEn: '+15 Accuracy — fast and accurate info' },
          { id: 'fi2', labelAr: 'Yes, somewhere in the hotel.', labelEn: 'Yes, somewhere in the hotel.', effects: FX(-5, -5, -10, -5, 0), feedbackAr: 'إجابة غامضة لضيف أجنبي يحتاج الوضوح', feedbackEn: 'Vague answer for a foreign guest needing clarity' },
        ],
      },
    ],
  },
  {
    id: 'demanding-mystery',
    icon: '🕵️',
    personalityAr: 'ضيف غامض محترف',
    personalityEn: 'Demanding Mystery Guest',
    titleAr: 'ضيف غامض يفحص كل المعايير',
    titleEn: 'A mystery guest inspecting every standard',
    introAr: 'ضيف مهذب جداً يطرح أسئلة دقيقة ويلاحظ كل التفاصيل. قد يكون ضيفاً غامضاً.',
    introEn: 'A very polite guest asks precise questions and notices every detail. Could be a mystery guest.',
    stages: [
      {
        id: 'mystery-greet',
        guestAr: 'مرحباً، حجزي باسم الأستاذة نورة. أود التأكد من التفاصيل بدقة.',
        guestEn: 'Hello, my booking is under Ms. Noura. I would like the details verified precisely.',
        options: [
          { id: 'mg1', labelAr: 'أهلاً بك أستاذة نورة. سأتحقق من كل التفاصيل معك خطوة بخطوة، وعينك على الدقة.', labelEn: 'Welcome Ms. Noura. I will verify every detail with you step by step, with precision in mind.', effects: FX(10, 10, 15, 10, 15), feedbackAr: '+15 دقة و+15 التزام — جاهزية للتفاصيل', feedbackEn: '+15 Accuracy +15 Compliance — ready for details' },
          { id: 'mg2', labelAr: 'كل شيء مؤكد، تفضلي المفتاح.', labelEn: 'Everything is confirmed, here is your key.', effects: FX(0, 0, -15, 0, -15), critical: true, feedbackAr: 'خطأ حاسم: ضيف غامض سيلاحظ غياب التحقق فوراً.', feedbackEn: 'CRITICAL: A mystery guest will instantly notice missing verification.', next: 'mystery-greet' },
        ],
      },
      {
        id: 'mystery-detail',
        guestAr: 'ما ساعات الإفطار؟ وما سياسة التمديد للخروج؟',
        guestEn: 'What are the breakfast hours? And the late checkout policy?',
        options: [
          { id: 'md1', labelAr: 'الإفطار من 6:30 حتى 10:30 في مطعم الزيتون، والتمديد حتى السادسة مساءً حسب التوفر.', labelEn: 'Breakfast is 6:30–10:30 at the Olive Restaurant, and late checkout is until 6pm subject to availability.', effects: FX(10, 5, 15, 5, 5), feedbackAr: '+15 دقة — أرقام دقيقة ومحددة', feedbackEn: '+15 Accuracy — precise and specific figures' },
          { id: 'md2', labelAr: 'في الصباح عادةً.', labelEn: 'Usually in the morning.', effects: FX(-5, -5, -15, -5, 0), feedbackAr: 'إجابة فضفاضة غير مقنعة لضيف يفحص الدقة', feedbackEn: 'Loose answer unconvincing to a precision-focused guest' },
        ],
      },
      {
        id: 'mystery-end',
        guestAr: 'شكراً، هذا كل شيء. سأقيّم الخدمة بدقة.',
        guestEn: 'Thank you, that is all. I will rate the service precisely.',
        options: [
          { id: 'me1', labelAr: 'تشرفنا بخدمتك. سأخصّص لك أي مساعدة إضافية، ونتمنى أن تلبي تجربتك توقعاتك.', labelEn: 'It is our pleasure to serve you. I will personally assist with anything, and we hope your stay exceeds expectations.', effects: FX(10, 10, 5, 10, 5), feedbackAr: '+10 في المحاور — وداع مهني كامل', feedbackEn: '+10 across axes — complete professional farewell' },
        ],
      },
    ],
  },
];
