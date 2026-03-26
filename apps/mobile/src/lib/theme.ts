export const theme = {
  colors: {
    background: '#13100A',
    backgroundAlt: '#1B150F',
    surface: 'rgba(255,255,255,0.05)',
    surfaceStrong: 'rgba(255,255,255,0.08)',
    border: 'rgba(201,168,76,0.18)',
    gold: '#C9A84C',
    goldLight: '#E8C97A',
    emerald: '#1A6B3C',
    emeraldLight: '#2A9D5C',
    ruby: '#8B1A1A',
    cream: '#F8F3E8',
    creamMuted: 'rgba(248,243,232,0.72)',
    creamFaint: 'rgba(248,243,232,0.44)',
    blue: '#4F8EF7',
  },
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  radius: {
    sm: 12,
    md: 18,
    lg: 24,
    round: 999,
  },
  shadow: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.18,
      shadowRadius: 18,
      elevation: 8,
    },
  },
  fonts: {
    display: 'Amiri_700Bold',
    body: 'Cairo_400Regular',
    bodyBold: 'Cairo_700Bold',
    bodyBlack: 'Cairo_900Black',
    arabic: 'NotoNaskhArabic_400Regular',
  },
};

export const gradients = {
  hero: ['#1A6B3C', '#13100A'] as const,
  card: ['rgba(201,168,76,0.16)', 'rgba(19,16,10,0.08)'] as const,
  radio: ['rgba(79,142,247,0.15)', 'rgba(19,16,10,0.06)'] as const,
};
