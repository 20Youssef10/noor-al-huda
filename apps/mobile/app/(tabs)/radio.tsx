import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Page, PrimaryButton, SectionHeader, SurfaceCard, GhostButton } from '../../src/components/ui';
import { fetchRadios } from '../../src/features/radio/service';
import { useAudioPlayer } from '../../src/hooks/useAudioPlayer';
import { theme } from '../../src/lib/theme';
import { useAppStore } from '../../src/store/app-store';

export default function RadioScreen() {
  const activeRadioId = useAppStore((state) => state.activeRadioId);
  const setActiveRadioId = useAppStore((state) => state.setActiveRadioId);
  const { currentUrl, isLoading, isPlaying, play, stop, toggle } = useAudioPlayer();

  const radioQuery = useQuery({
    queryKey: ['radios'],
    queryFn: fetchRadios,
  });

  const activeStation = useMemo(
    () => radioQuery.data?.find((station) => station.id === activeRadioId) ?? null,
    [activeRadioId, radioQuery.data]
  );

  return (
    <Page>
      <SectionHeader title="الإذاعات الإسلامية" subtitle="بث وتشغيل عبر Track Player مع دعم الخلفية" />

      {activeStation ? (
        <SurfaceCard accent="blue">
          <Text style={styles.nowPlayingLabel}>يُبث الآن</Text>
          <Text style={styles.stationName}>{activeStation.name}</Text>
          <Text style={styles.stationMeta}>{activeStation.country} · {activeStation.description}</Text>
          <View style={styles.playerRow}>
            <PrimaryButton
              label={isPlaying && currentUrl === activeStation.streamUrl ? 'إيقاف مؤقت' : 'تشغيل'}
              onPress={() => {
                if (currentUrl === activeStation.streamUrl) {
                  void toggle();
                } else {
                  void play(activeStation.streamUrl, activeStation.name);
                }
              }}
            />
            <GhostButton label="إيقاف" onPress={() => void stop()} />
          </View>
        </SurfaceCard>
      ) : null}

      {radioQuery.isLoading ? (
        <SurfaceCard>
          <ActivityIndicator color={theme.colors.goldLight} />
        </SurfaceCard>
      ) : (
        radioQuery.data?.map((station) => (
          <SurfaceCard key={station.id} accent={station.id === activeRadioId ? 'emerald' : 'gold'}>
            <Text style={styles.stationName}>{station.name}</Text>
            <Text style={styles.stationMeta}>{station.country} · {station.description}</Text>
            <View style={styles.playerRow}>
              <GhostButton
                label={station.id === activeRadioId ? 'مختارة' : 'اختيار المحطة'}
                onPress={() => setActiveRadioId(station.id)}
              />
              <PrimaryButton
                label={isLoading && station.id === activeRadioId ? '...' : 'تشغيل'}
                onPress={() => {
                  setActiveRadioId(station.id);
                  void play(station.streamUrl, station.name);
                }}
              />
            </View>
          </SurfaceCard>
        ))
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  nowPlayingLabel: {
    color: theme.colors.creamFaint,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    textAlign: 'right',
  },
  stationName: {
    color: theme.colors.cream,
    fontFamily: theme.fonts.display,
    fontSize: 28,
    textAlign: 'right',
  },
  stationMeta: {
    color: theme.colors.creamMuted,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'right',
  },
  playerRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
});
