import { type IslamicEvent, type ProphetStory } from '../types/domain';

export const islamicEvents: IslamicEvent[] = [
  { id: 'ramadan', title: 'بداية رمضان', hijriMonth: 9, hijriDay: 1, description: 'شهر الصيام والقرآن والتزكية.' },
  { id: 'eid-fitr', title: 'عيد الفطر', hijriMonth: 10, hijriDay: 1, description: 'فرحة إتمام الصيام وشكر النعمة.' },
  { id: 'hajj-days', title: 'أيام الحج', hijriMonth: 12, hijriDay: 8, description: 'بداية المناسك وأيام التلبية والوقوف بعرفة.' },
  { id: 'eid-adha', title: 'عيد الأضحى', hijriMonth: 12, hijriDay: 10, description: 'عيد التضحية والطاعة والرحمة.' },
  { id: 'muharram', title: 'عاشوراء', hijriMonth: 1, hijriDay: 10, description: 'يوم نجّى الله فيه موسى عليه السلام.' },
  { id: 'mawlid', title: 'ذكرى المولد النبوي', hijriMonth: 3, hijriDay: 12, description: 'محطة للتذكير بالسيرة والاقتداء بالأخلاق النبوية.' },
];

export const prophetStories: ProphetStory[] = [
  {
    id: 'muhammad',
    title: 'سيرة النبي محمد ﷺ',
    summary: 'من مكة إلى المدينة، سيرة الرحمة والثبات والدعوة بالحكمة حتى اكتمال الرسالة.',
    lessons: ['الصدق والأمانة', 'الرحمة بالناس', 'الصبر في الدعوة'],
  },
  {
    id: 'ibrahim',
    title: 'قصة إبراهيم عليه السلام',
    summary: 'إمام التوحيد الذي جادل قومه بالحكمة وبنى البيت الحرام مع ابنه إسماعيل عليهما السلام.',
    lessons: ['التوحيد الخالص', 'اليقين', 'التسليم لأمر الله'],
  },
  {
    id: 'musa',
    title: 'قصة موسى عليه السلام',
    summary: 'رسول الله إلى فرعون، وقصة النجاة والعبور والصبر الطويل مع بني إسرائيل.',
    lessons: ['نصرة الحق', 'الثقة بالله', 'الصبر في القيادة'],
  },
  {
    id: 'isa',
    title: 'قصة عيسى عليه السلام',
    summary: 'نبي كريم دعا إلى الرحمة والطهارة وصدق العبادة، ورفعه الله إليه.',
    lessons: ['الرفق', 'طهارة القلب', 'الإخلاص'],
  },
  {
    id: 'yusuf',
    title: 'قصة يوسف عليه السلام',
    summary: 'من الجبّ إلى التمكين، قصة عفة وصبر وتفسير للأحلام ورحمة بالأهل.',
    lessons: ['العفة', 'العفو', 'الأمل بعد الشدة'],
  },
  {
    id: 'yunus',
    title: 'قصة يونس عليه السلام',
    summary: 'قصة الرجوع والإنابة والدعاء العظيم في الظلمات.',
    lessons: ['التوبة', 'الافتقار إلى الله', 'أثر الدعاء'],
  },
];
