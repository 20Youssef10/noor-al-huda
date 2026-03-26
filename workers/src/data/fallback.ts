export const fallbackSurahs = [
  { id: 1, name: 'الفاتحة', transliteration: 'Al-Fatihah', englishName: 'The Opening', versesCount: 7, revelation: 'Meccan' },
  { id: 2, name: 'البقرة', transliteration: 'Al-Baqarah', englishName: 'The Cow', versesCount: 286, revelation: 'Medinan' },
  { id: 18, name: 'الكهف', transliteration: 'Al-Kahf', englishName: 'The Cave', versesCount: 110, revelation: 'Meccan' },
  { id: 36, name: 'يس', transliteration: 'Ya-Sin', englishName: 'Ya Sin', versesCount: 83, revelation: 'Meccan' },
  { id: 55, name: 'الرحمن', transliteration: 'Ar-Rahman', englishName: 'The Beneficent', versesCount: 78, revelation: 'Medinan' },
  { id: 67, name: 'الملك', transliteration: 'Al-Mulk', englishName: 'The Sovereignty', versesCount: 30, revelation: 'Meccan' },
  { id: 112, name: 'الإخلاص', transliteration: 'Al-Ikhlas', englishName: 'Sincerity', versesCount: 4, revelation: 'Meccan' },
  { id: 113, name: 'الفلق', transliteration: 'Al-Falaq', englishName: 'Daybreak', versesCount: 5, revelation: 'Meccan' },
  { id: 114, name: 'الناس', transliteration: 'An-Naas', englishName: 'Mankind', versesCount: 6, revelation: 'Meccan' }
];

export const fallbackDailyContent = {
  ayah: {
    surahId: 2,
    surahName: 'البقرة',
    reference: 'البقرة ٢:١٨٦',
    text: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ'
  },
  hadith: {
    id: 'daily-hadith',
    title: 'حديث اليوم',
    text: 'قال رسول الله صلى الله عليه وسلم: أحب الأعمال إلى الله أدومها وإن قل.',
    source: 'متفق عليه'
  }
};

export const fallbackAzkar = {
  morning: [
    {
      id: 'morning-1',
      text: 'اللهم بك أصبحنا وبك أمسينا وبك نحيا وبك نموت وإليك النشور.',
      count: 1,
      virtue: 'افتتاح اليوم بالتوكل على الله.'
    },
    {
      id: 'morning-2',
      text: 'سبحان الله وبحمده.',
      count: 100,
      virtue: 'من أحب الذكر إلى الله.'
    }
  ],
  evening: [
    {
      id: 'evening-1',
      text: 'اللهم بك أمسينا وبك أصبحنا وبك نحيا وبك نموت وإليك المصير.',
      count: 1,
      virtue: 'خاتمة يومية مباركة.'
    },
    {
      id: 'evening-2',
      text: 'حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم.',
      count: 7,
      virtue: 'كفاية وحفظ بإذن الله.'
    }
  ],
  'after-prayer': [
    {
      id: 'after-prayer-1',
      text: 'أستغفر الله.',
      count: 3,
      virtue: 'استغفار دبر الصلاة.'
    },
    {
      id: 'after-prayer-2',
      text: 'اللهم أنت السلام ومنك السلام تباركت يا ذا الجلال والإكرام.',
      count: 1,
      virtue: 'ذكر ثابت بعد السلام.'
    }
  ]
};

export const fallbackRadios = [
  {
    id: 'makkah-live',
    name: 'إذاعة القرآن من مكة',
    country: 'السعودية',
    description: 'بث مستمر للتلاوات.',
    streamUrl: 'https://server8.mp3quran.net/afs/001.mp3'
  },
  {
    id: 'egypt-quran',
    name: 'إذاعة القرآن المصرية',
    country: 'مصر',
    description: 'تلاوات وبرامج قصيرة.',
    streamUrl: 'https://server8.mp3quran.net/afs/002.mp3'
  },
  {
    id: 'sunnah-radio',
    name: 'إذاعة السنة النبوية',
    country: 'السعودية',
    description: 'أحاديث وتذكير يومي.',
    streamUrl: 'https://server8.mp3quran.net/afs/112.mp3'
  }
];

export function buildFallbackSurahDetail(id: number) {
  const surah = fallbackSurahs.find((item) => item.id === id) ?? fallbackSurahs[0]!;
  return {
    surah,
    verses: [
      {
        number: 1,
        arabicText: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
        translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.'
      },
      {
        number: 2,
        arabicText: 'هَذَا مَحْتَوًى بَدِيلٌ مَخْزَّنٌ حَتَّى يَعُودَ الِاتِّصَالُ بِالْمَصْدَرِ الْخَارِجِيِّ.',
        translation: 'This is cached fallback content shown until the remote Quran source becomes available.'
      }
    ],
    audioUrl: 'https://server8.mp3quran.net/afs/001.mp3'
  };
}
