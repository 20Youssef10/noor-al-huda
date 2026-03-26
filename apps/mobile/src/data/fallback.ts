import {
  type AppLocation,
  type AzkarCollection,
  type AzkarEntry,
  type DailyContent,
  type RadioStation,
  type SurahDetail,
  type SurahSummary,
} from '../types/domain';

export const fallbackLocation: AppLocation = {
  label: 'مكة المكرمة',
  latitude: 21.4225,
  longitude: 39.8262,
};

export const fallbackDailyContent: DailyContent = {
  ayah: {
    surahId: 2,
    surahName: 'البقرة',
    reference: 'البقرة ٢:١٨٦',
    text: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ',
  },
  hadith: {
    id: 'daily-hadith',
    title: 'حديث اليوم',
    text: 'قال رسول الله صلى الله عليه وسلم: أحب الأعمال إلى الله أدومها وإن قل.',
    source: 'متفق عليه',
  },
};

export const fallbackAzkar: Record<AzkarCollection, AzkarEntry[]> = {
  morning: [
    {
      id: 'morning-1',
      text: 'اللهم بك أصبحنا وبك أمسينا وبك نحيا وبك نموت وإليك النشور.',
      count: 1,
      virtue: 'افتتاح اليوم بالتوكل والاعتماد على الله.',
    },
    {
      id: 'morning-2',
      text: 'أصبحنا وأصبح الملك لله والحمد لله ولا إله إلا الله وحده لا شريك له.',
      count: 1,
      virtue: 'تجديد التوحيد مع بداية النهار.',
    },
    {
      id: 'morning-3',
      text: 'سبحان الله وبحمده.',
      count: 100,
      virtue: 'ثقيلة في الميزان ومحبوبة إلى الرحمن.',
    },
  ],
  evening: [
    {
      id: 'evening-1',
      text: 'اللهم بك أمسينا وبك أصبحنا وبك نحيا وبك نموت وإليك المصير.',
      count: 1,
      virtue: 'ختام اليوم بالذكر واليقين.',
    },
    {
      id: 'evening-2',
      text: 'أعوذ بكلمات الله التامات من شر ما خلق.',
      count: 3,
      virtue: 'حرز من الشرور والمخاوف بإذن الله.',
    },
    {
      id: 'evening-3',
      text: 'حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم.',
      count: 7,
      virtue: 'كفاية للعبد وهمومه.',
    },
  ],
  'after-prayer': [
    {
      id: 'after-prayer-1',
      text: 'أستغفر الله.',
      count: 3,
      virtue: 'استغفار بعد الصلاة كما كان يفعل النبي صلى الله عليه وسلم.',
    },
    {
      id: 'after-prayer-2',
      text: 'اللهم أنت السلام ومنك السلام تباركت يا ذا الجلال والإكرام.',
      count: 1,
      virtue: 'تمام الذكر بعد السلام من الصلاة.',
    },
    {
      id: 'after-prayer-3',
      text: 'سبحان الله، والحمد لله، والله أكبر.',
      count: 33,
      virtue: 'من أعظم الأذكار دبر الصلوات.',
    },
  ],
};

export const fallbackRadios: RadioStation[] = [
  {
    id: 'makkah-live',
    name: 'إذاعة القرآن من مكة',
    country: 'السعودية',
    description: 'تلاوات متواصلة بترتيب إذاعي هادئ.',
    streamUrl: 'https://server8.mp3quran.net/afs/001.mp3',
  },
  {
    id: 'egypt-quran',
    name: 'إذاعة القرآن المصرية',
    country: 'مصر',
    description: 'تلاوات ومدائح وبرامج قصيرة.',
    streamUrl: 'https://server8.mp3quran.net/afs/002.mp3',
  },
  {
    id: 'sunnah-radio',
    name: 'إذاعة السنة النبوية',
    country: 'السعودية',
    description: 'تذكير وحديث وتلاوات مختارة.',
    streamUrl: 'https://server8.mp3quran.net/afs/112.mp3',
  },
];

export const fallbackSurahs: SurahSummary[] = [
  { id: 1, name: 'الفاتحة', transliteration: 'Al-Fatihah', englishName: 'The Opening', versesCount: 7, revelation: 'Meccan' },
  { id: 2, name: 'البقرة', transliteration: 'Al-Baqarah', englishName: 'The Cow', versesCount: 286, revelation: 'Medinan' },
  { id: 3, name: 'آل عمران', transliteration: 'Aal-E-Imran', englishName: 'Family of Imran', versesCount: 200, revelation: 'Medinan' },
  { id: 18, name: 'الكهف', transliteration: 'Al-Kahf', englishName: 'The Cave', versesCount: 110, revelation: 'Meccan' },
  { id: 36, name: 'يس', transliteration: 'Ya-Sin', englishName: 'Ya Sin', versesCount: 83, revelation: 'Meccan' },
  { id: 55, name: 'الرحمن', transliteration: 'Ar-Rahman', englishName: 'The Beneficent', versesCount: 78, revelation: 'Medinan' },
  { id: 67, name: 'الملك', transliteration: 'Al-Mulk', englishName: 'The Sovereignty', versesCount: 30, revelation: 'Meccan' },
  { id: 78, name: 'النبأ', transliteration: 'An-Naba', englishName: 'The Great News', versesCount: 40, revelation: 'Meccan' },
  { id: 93, name: 'الضحى', transliteration: 'Ad-Duhaa', englishName: 'The Morning Hours', versesCount: 11, revelation: 'Meccan' },
  { id: 112, name: 'الإخلاص', transliteration: 'Al-Ikhlas', englishName: 'Sincerity', versesCount: 4, revelation: 'Meccan' },
  { id: 113, name: 'الفلق', transliteration: 'Al-Falaq', englishName: 'Daybreak', versesCount: 5, revelation: 'Meccan' },
  { id: 114, name: 'الناس', transliteration: 'An-Naas', englishName: 'Mankind', versesCount: 6, revelation: 'Meccan' },
];

const fallbackSurahDetails: Record<number, SurahDetail> = {
  1: {
    surah: fallbackSurahs[0]!,
    verses: [
      { number: 1, arabicText: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ', translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.' },
      { number: 2, arabicText: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', translation: 'All praise is due to Allah, Lord of the worlds.' },
      { number: 3, arabicText: 'الرَّحْمَنِ الرَّحِيمِ', translation: 'The Entirely Merciful, the Especially Merciful.' },
      { number: 4, arabicText: 'مَالِكِ يَوْمِ الدِّينِ', translation: 'Sovereign of the Day of Recompense.' },
      { number: 5, arabicText: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', translation: 'It is You we worship and You we ask for help.' },
      { number: 6, arabicText: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', translation: 'Guide us to the straight path.' },
      { number: 7, arabicText: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', translation: 'The path of those upon whom You have bestowed favor, not of those who have evoked anger or gone astray.' },
    ],
    audioUrl: 'https://server8.mp3quran.net/afs/001.mp3',
  },
  112: {
    surah: fallbackSurahs[9]!,
    verses: [
      { number: 1, arabicText: 'قُلْ هُوَ اللَّهُ أَحَدٌ', translation: 'Say, He is Allah, One.' },
      { number: 2, arabicText: 'اللَّهُ الصَّمَدُ', translation: 'Allah, the Eternal Refuge.' },
      { number: 3, arabicText: 'لَمْ يَلِدْ وَلَمْ يُولَدْ', translation: 'He neither begets nor is born.' },
      { number: 4, arabicText: 'وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ', translation: 'Nor is there to Him any equivalent.' },
    ],
    audioUrl: 'https://server8.mp3quran.net/afs/112.mp3',
  },
};

export function buildFallbackSurahDetail(surahId: number): SurahDetail {
  const ready = fallbackSurahDetails[surahId];
  if (ready) {
    return ready;
  }

  const surah = fallbackSurahs.find((item) => item.id === surahId) ?? fallbackSurahs[0]!;

  return {
    surah,
    verses: [
      {
        number: 1,
        arabicText: 'هَذَا نَصٌّ افْتِرَاضِيٌّ لِلْعَرْضِ دَاخِلَ التَّطْبِيقِ حَتَّى يَتَوَفَّرَ الاتِّصَالُ بِالْخَادِمِ.',
        translation: 'This is placeholder Quran content shown while the remote source is unavailable.',
      },
      {
        number: 2,
        arabicText: 'سَيَتِمُّ تَخْزِينُ السُّورَةِ فِي SQLite بَعْدَ أَوَّلِ تَحْمِيلٍ لِتَعْمَلَ بِدُونِ اتِّصَالٍ.',
        translation: 'The surah is cached in SQLite after the first successful download for offline reading.',
      },
    ],
    audioUrl: 'https://server8.mp3quran.net/afs/001.mp3',
  };
}
