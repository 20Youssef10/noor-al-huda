import { type ProphetStory } from '../../types/domain';

export const namesOfAllah = [
  { id: 'allah', name: 'الله', meaning: 'المألوه بحق، الجامع لصفات الكمال.', virtue: 'يملأ القلب تعظيماً ومحبة.' },
  { id: 'ar-rahman', name: 'الرحمن', meaning: 'واسع الرحمة في الدنيا والآخرة.', virtue: 'يبعث في النفس الرجاء.' },
  { id: 'ar-raheem', name: 'الرحيم', meaning: 'الذي يخص عباده المؤمنين بمزيد الرحمة.', virtue: 'يربط القلب بحسن الظن بالله.' },
  { id: 'al-malik', name: 'الملك', meaning: 'المالك لكل شيء والمتصرف فيه.', virtue: 'يغرس اليقين بأن الأمر كله لله.' },
  { id: 'as-salam', name: 'السلام', meaning: 'السالم من كل نقص والمانح للأمان.', virtue: 'يبعث الطمأنينة والسكينة.' },
  { id: 'al-wadud', name: 'الودود', meaning: 'المحب لعباده الصالحين.', virtue: 'يزرع الأنس بالقرب من الله.' },
];

export const ruqyahCollection = [
  {
    id: 'fatiha',
    title: 'سورة الفاتحة',
    text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ...',
    audioUrl: 'https://server8.mp3quran.net/afs/001.mp3',
  },
  {
    id: 'baqarah255',
    title: 'آية الكرسي',
    text: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ...',
    audioUrl: 'https://server8.mp3quran.net/afs/002.mp3',
  },
  {
    id: 'muawwidhat',
    title: 'المعوذات',
    text: 'قُلْ هُوَ اللَّهُ أَحَدٌ • قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ • قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
    audioUrl: 'https://server8.mp3quran.net/afs/112.mp3',
  },
];

export const faqItems = [
  { id: 'wudu', category: 'فقه العبادات', question: 'متى يبطل الوضوء؟', answer: 'يبطل بخروج شيء من السبيلين، والنوم المستغرق، وزوال العقل ونحو ذلك.' },
  { id: 'salah-qada', category: 'الصلوات', question: 'كيف أقضي الصلاة الفائتة؟', answer: 'تبادر إلى قضائها عند التذكر مع الترتيب بحسب الاستطاعة.' },
  { id: 'zakat-money', category: 'الزكاة', question: 'متى تجب زكاة المال؟', answer: 'إذا بلغ المال النصاب وحال عليه الحول القمري.' },
  { id: 'transactions', category: 'المعاملات', question: 'ما ضابط البيع الصحيح؟', answer: 'أن يكون مباحاً، معلوماً، برضا الطرفين، خالياً من الغرر والربا.' },
];

export const ebookLibrary = [
  { id: 'riyad', title: 'رياض الصالحين', type: 'text', description: 'مختارات من الأحاديث في تزكية النفس والأخلاق.' },
  { id: 'fortress', title: 'حصن المسلم', type: 'text', description: 'أذكار ودعوات مأثورة مرتبة على الأبواب.' },
  { id: 'aqidah', title: 'متن العقيدة', type: 'pdf', description: 'مواد مختصرة في العقيدة وشرح أركان الإيمان.' },
];

export const livestreamChannels = [
  { id: 'quran-tv', title: 'قناة القرآن الكريم', url: 'https://www.youtube.com/watch?v=9Auq9mYxFEE' },
  { id: 'sunnah-tv', title: 'قناة السنة النبوية', url: 'https://www.youtube.com/watch?v=kwihSx9pN6I' },
];

export const yearlyMilestones = [
  { month: 'محرم', quranPages: 18, azkarDays: 20 },
  { month: 'صفر', quranPages: 24, azkarDays: 22 },
  { month: 'ربيع الأول', quranPages: 31, azkarDays: 25 },
  { month: 'رمضان', quranPages: 110, azkarDays: 30 },
];

export const profileSections = [
  { id: 'achievements', title: 'الإنجازات', description: 'الأوسمة والشارات المحققة هذا العام.' },
  { id: 'settings', title: 'الإعدادات', description: 'إعدادات الحساب والتنبيهات والقراءة.' },
  { id: 'account', title: 'الحساب', description: 'البريد والجلسة الحالية وإدارة الدخول.' },
];

export const prophetBiography: ProphetStory = {
  id: 'seerah-prophet',
  title: 'سيرة النبي ﷺ',
  summary: 'نشأ رسول الله ﷺ في مكة، ثم أوحي إليه، فدعا إلى الله بالحكمة والصبر، وهاجر إلى المدينة، وأقام مجتمع الإيمان حتى أكمل الله به الرسالة.',
  lessons: ['الرحمة', 'الثبات', 'العدل', 'حسن الخلق'],
};
